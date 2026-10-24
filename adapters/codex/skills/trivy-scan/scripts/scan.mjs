#!/usr/bin/env node
// trivy-scan: dependency vulnerability scan with Trivy.
// Saves the raw report, a compact summary and REPORT.md under <project>/.security/trivy/,
// compares with the previous scan and prints a summary (text, or JSON with --json).
// Zero dependencies; Node 18+.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"];
// RelAI working folders hold throwaway material, and this skill's own evals ship deliberately
// vulnerable lockfiles: neither belongs in a project's findings (BEZPIECZENSTWO E1, 2026-10-24).
const SKIP_DIRS = ["**/node_modules", "**/.git", "**/.claude/worktrees", "**/.claude/relai/work", "**/trivy-scan/evals", "**/.security", "**/.venv", "**/venv"];
const SCAN_TIMEOUT_MS = 10 * 60 * 1000;
const QUICK_TIMEOUT_MS = 90 * 1000;
const RAW_REPORTS_KEPT = 10;
const VERIFY_ROUNDS = 5;

function parseArgs(argv) {
  const opts = { path: process.cwd(), out: null, save: true, quick: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--path") opts.path = argv[++i];
    else if (a === "--out") opts.out = argv[++i];
    else if (a === "--no-save") opts.save = false;
    else if (a === "--quick") opts.quick = true;
    else if (a === "--json") opts.json = true;
    else if (a === "--help" || a === "-h") opts.help = true;
    else throw new Error(`unknown argument: ${a}`);
  }
  opts.path = path.resolve(opts.path);
  opts.out = path.resolve(opts.out || path.join(opts.path, ".security", "trivy"));
  return opts;
}

function findTrivy() {
  const fromEnv = process.env.TRIVY_BIN;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  const probe = spawnSync("trivy", ["--version"], { encoding: "utf8" });
  if (probe.status === 0) return "trivy";
  const home = os.homedir();
  const candidates = [
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Microsoft", "WinGet", "Links", "trivy.exe"),
    process.env.ProgramData && path.join(process.env.ProgramData, "chocolatey", "bin", "trivy.exe"),
    path.join(home, "scoop", "shims", "trivy.exe"),
    "/opt/homebrew/bin/trivy",
    "/usr/local/bin/trivy",
    "/usr/bin/trivy",
    path.join(home, ".local", "bin", "trivy"),
    path.join(home, "bin", "trivy"),
  ].filter(Boolean);
  return candidates.find((c) => fs.existsSync(c)) || null;
}

function hasVulnDb() {
  const home = os.homedir();
  const dirs = [
    process.env.TRIVY_CACHE_DIR,
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "trivy"),
    process.env.XDG_CACHE_HOME && path.join(process.env.XDG_CACHE_HOME, "trivy"),
    path.join(home, ".cache", "trivy"),
    path.join(home, "Library", "Caches", "trivy"),
  ].filter(Boolean);
  return dirs.some((d) => fs.existsSync(path.join(d, "db", "trivy.db")));
}

function runTrivy(bin, target, rawPath, quick) {
  const args = ["fs", "--scanners", "vuln", "--format", "json", "--list-all-pkgs", "--quiet", "--output", rawPath];
  for (const d of SKIP_DIRS) args.push("--skip-dirs", d);
  // In quick (hook) mode an existing DB is good enough; a missing DB must still be downloaded once.
  if (quick && hasVulnDb()) args.push("--skip-db-update");
  args.push(target);
  const res = spawnSync(bin, args, { encoding: "utf8", timeout: quick ? QUICK_TIMEOUT_MS : SCAN_TIMEOUT_MS });
  if (res.error) return { ok: false, message: res.error.message };
  if (res.status !== 0) return { ok: false, message: (res.stderr || "").trim().split("\n").slice(-5).join("\n") };
  return { ok: true };
}

// Version helpers: good enough for semver and most PEP 440 / Go / Cargo versions.
function versionParts(v) {
  return String(v).replace(/^v/i, "").split(/[^0-9]+/).filter(Boolean).map(Number);
}

function compareVersions(a, b) {
  const pa = versionParts(a);
  const pb = versionParts(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d;
  }
  return 0;
}

function majorOf(v) {
  const p = versionParts(v);
  // 0.x versions treat the minor as the breaking part.
  return p[0] === 0 ? `0.${p[1] || 0}` : String(p[0] || 0);
}

// Trivy lists alternatives ("1.2.4, 2.0.1"); prefer the smallest fix within the installed major line.
function pickFix(installed, fixedList) {
  const options = String(fixedList || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && compareVersions(s, installed) > 0)
    .sort(compareVersions);
  if (options.length === 0) return null;
  return options.find((o) => majorOf(o) === majorOf(installed)) || options[0];
}

function directAncestors(pkgId, packages) {
  const parents = new Map();
  for (const p of packages) {
    for (const child of p.DependsOn || []) {
      if (!parents.has(child)) parents.set(child, []);
      parents.get(child).push(p);
    }
  }
  const found = new Set();
  const seen = new Set([pkgId]);
  const queue = [pkgId];
  while (queue.length) {
    const id = queue.shift();
    for (const parent of parents.get(id) || []) {
      if (seen.has(parent.ID)) continue;
      seen.add(parent.ID);
      if (parent.Relationship === "direct") found.add(parent.ID);
      else if (parent.Relationship !== "root") queue.push(parent.ID);
    }
  }
  return [...found];
}

function summarize(report, root) {
  const vulns = [];
  const seen = new Set();
  for (const result of report.Results || []) {
    const packages = result.Packages || [];
    const byId = new Map(packages.map((p) => [p.ID, p]));
    for (const v of result.Vulnerabilities || []) {
      const key = `${v.VulnerabilityID}|${v.PkgName}|${v.InstalledVersion}|${result.Target}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const pkg = byId.get(v.PkgID);
      const relationship = pkg?.Relationship || "unknown";
      vulns.push({
        id: v.VulnerabilityID,
        pkg: v.PkgName,
        installed: v.InstalledVersion,
        fixed: v.FixedVersion || "",
        severity: SEVERITIES.includes(v.Severity) ? v.Severity : "UNKNOWN",
        title: (v.Title || "").slice(0, 160),
        url: v.PrimaryURL || "",
        target: result.Target,
        type: result.Type,
        relationship,
        via: relationship === "indirect" ? directAncestors(v.PkgID, packages) : [],
        purl: v.PkgIdentifier?.PURL || "",
      });
    }
  }
  const counts = Object.fromEntries(SEVERITIES.map((s) => [s, 0]));
  for (const v of vulns) counts[v.severity]++;
  return { root, scannedAt: new Date().toISOString(), counts, total: vulns.length, vulns, plan: buildPlan(vulns) };
}

function buildPlan(vulns) {
  const groups = new Map();
  for (const v of vulns) {
    const key = `${v.target}|${v.pkg}|${v.installed}`;
    if (!groups.has(key)) {
      groups.set(key, { target: v.target, type: v.type, pkg: v.pkg, installed: v.installed, relationship: v.relationship, via: v.via, purl: v.purl, severity: v.severity, ids: [], fixTo: null, unfixedIds: [] });
    }
    const g = groups.get(key);
    if (SEVERITIES.indexOf(v.severity) < SEVERITIES.indexOf(g.severity)) g.severity = v.severity;
    const fix = pickFix(v.installed, v.fixed);
    if (fix) {
      g.ids.push(v.id);
      if (!g.fixTo || compareVersions(fix, g.fixTo) > 0) g.fixTo = fix;
    } else {
      g.unfixedIds.push(v.id);
    }
  }
  const plan = [...groups.values()].map((g) => ({ ...g, majorBump: g.fixTo ? majorOf(g.fixTo) !== majorOf(g.installed) : false }));
  return plan.sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity) || a.pkg.localeCompare(b.pkg));
}

function withVersion(purl, version) {
  // The version follows the last "@" (scoped npm names carry an encoded "%40" before it).
  const at = purl.lastIndexOf("@");
  if (at <= 0) return null;
  const tail = purl.slice(at + 1).search(/[?#]/);
  return purl.slice(0, at + 1) + encodeURIComponent(version) + (tail >= 0 ? purl.slice(at + 1 + tail) : "");
}

// A fix version can carry advisories of its own (axios 0.33.0 closes the old ones but has a new
// one fixed in 0.34.0). Check every target with "trivy sbom" against the same local DB and raise
// it until it is clean or no fix exists. Offline and ecosystem-neutral thanks to package URLs.
function verifyTargets(bin, plan) {
  const items = plan.filter((p) => p.fixTo && p.purl);
  for (const p of items) {
    p.targetChecked = false;
    p.raisedFrom = [];
    p.residualIds = [];
  }
  for (let round = 0; round < VERIFY_ROUNDS; round++) {
    const pending = items.filter((p) => !p.targetChecked);
    if (pending.length === 0) break;
    const byPurl = new Map();
    const components = [];
    for (const p of pending) {
      const purl = withVersion(p.purl, p.fixTo);
      if (!purl) continue;
      byPurl.set(purl, p);
      components.push({ type: "library", name: p.pkg, version: p.fixTo, purl, "bom-ref": purl });
    }
    const residual = runSbomCheck(bin, components);
    if (!residual) return false;
    for (const [purl, p] of byPurl) {
      const found = residual.get(purl) || [];
      if (found.length === 0) {
        p.targetChecked = true;
        p.residualIds = [];
        continue;
      }
      let next = null;
      for (const v of found) {
        const fix = pickFix(p.fixTo, v.FixedVersion);
        if (fix && (!next || compareVersions(fix, next) > 0)) next = fix;
      }
      p.residualIds = found.map((v) => v.VulnerabilityID);
      if (!next) {
        p.targetChecked = true; // still vulnerable, but nothing newer would help
        continue;
      }
      p.raisedFrom.push(p.fixTo);
      p.fixTo = next;
      p.majorBump = majorOf(next) !== majorOf(p.installed);
    }
  }
  return true;
}

function runSbomCheck(bin, components) {
  if (components.length === 0) return new Map();
  const stamp = `${process.pid}-${Date.now()}`;
  const bomPath = path.join(os.tmpdir(), `trivy-scan-targets-${stamp}.cdx.json`);
  const outPath = path.join(os.tmpdir(), `trivy-scan-targets-${stamp}.json`);
  const bom = { bomFormat: "CycloneDX", specVersion: "1.5", version: 1, metadata: { component: { type: "application", name: "trivy-scan-target-check", "bom-ref": "root" } }, components };
  try {
    fs.writeFileSync(bomPath, JSON.stringify(bom));
    const res = spawnSync(bin, ["sbom", "--format", "json", "--quiet", "--skip-db-update", "--output", outPath, bomPath], { encoding: "utf8", timeout: SCAN_TIMEOUT_MS });
    if (res.error || res.status !== 0) return null;
    const report = JSON.parse(fs.readFileSync(outPath, "utf8"));
    const residual = new Map();
    for (const result of report.Results || []) {
      for (const v of result.Vulnerabilities || []) {
        const purl = v.PkgIdentifier?.PURL;
        if (!purl) continue;
        if (!residual.has(purl)) residual.set(purl, []);
        residual.get(purl).push(v);
      }
    }
    return residual;
  } catch {
    return null;
  } finally {
    fs.rmSync(bomPath, { force: true });
    fs.rmSync(outPath, { force: true });
  }
}

function diff(previous, current) {
  if (!previous) return null;
  const key = (v) => `${v.id}|${v.pkg}|${v.target}`;
  const before = new Set(previous.vulns.map(key));
  const after = new Set(current.vulns.map(key));
  return {
    previousScanAt: previous.scannedAt,
    added: current.vulns.filter((v) => !before.has(key(v))).map((v) => ({ id: v.id, pkg: v.pkg, severity: v.severity, target: v.target })),
    resolved: previous.vulns.filter((v) => !after.has(key(v))).map((v) => ({ id: v.id, pkg: v.pkg, severity: v.severity, target: v.target })),
  };
}

function renderReport(summary, delta) {
  const c = summary.counts;
  const lines = [
    `# Trivy dependency scan`,
    ``,
    `- Project: \`${summary.root}\``,
    `- Scanned: ${summary.scannedAt}`,
    `- Findings: ${summary.total} (CRITICAL ${c.CRITICAL}, HIGH ${c.HIGH}, MEDIUM ${c.MEDIUM}, LOW ${c.LOW}, UNKNOWN ${c.UNKNOWN})`,
  ];
  if (delta) lines.push(`- Since ${delta.previousScanAt}: ${delta.added.length} new, ${delta.resolved.length} resolved`);
  const fixable = summary.plan.filter((p) => p.fixTo);
  const unfixed = summary.plan.filter((p) => !p.fixTo);
  lines.push(``, `## Fix plan (${fixable.length})`, ``);
  if (fixable.length) {
    lines.push(`| Severity | Package | Installed | Fix to | Major bump | Target check | Dependency | File | Advisories |`, `|---|---|---|---|---|---|---|---|---|`);
    for (const p of fixable) {
      const dep = p.relationship === "indirect" ? `indirect via ${p.via.join(", ") || "?"}` : p.relationship;
      lines.push(`| ${p.severity} | ${p.pkg} | ${p.installed} | ${p.fixTo} | ${p.majorBump ? "yes" : "no"} | ${targetNote(p) || "clean"} | ${dep} | ${p.target} | ${p.ids.join(", ")} |`);
    }
  } else lines.push(`Nothing to update.`);
  lines.push(``, `## No fix available yet (${unfixed.length})`, ``);
  for (const p of unfixed) lines.push(`- ${p.severity} ${p.pkg}@${p.installed} (${p.target}): ${p.unfixedIds.join(", ")}`);
  if (delta?.added.length) {
    lines.push(``, `## New since previous scan`, ``);
    for (const a of delta.added) lines.push(`- ${a.severity} ${a.id} in ${a.pkg} (${a.target})`);
  }
  lines.push(``, `## All findings`, ``, `| Severity | Advisory | Package | Installed | Fixed in | Title |`, `|---|---|---|---|---|---|`);
  for (const v of summary.vulns.sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity))) {
    lines.push(`| ${v.severity} | [${v.id}](${v.url}) | ${v.pkg} | ${v.installed} | ${v.fixed || "-"} | ${v.title.replace(/\|/g, "/")} |`);
  }
  return lines.join("\n") + "\n";
}

function saveArtifacts(opts, rawPath, summary, delta) {
  fs.mkdirSync(opts.out, { recursive: true });
  // Reports stay local unless the user decides to track them.
  const ignore = path.join(opts.out, ".gitignore");
  if (!fs.existsSync(ignore)) fs.writeFileSync(ignore, "*\n");
  const stamp = summary.scannedAt.replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
  fs.copyFileSync(rawPath, path.join(opts.out, `scan-${stamp}.json`));
  fs.writeFileSync(path.join(opts.out, "latest-summary.json"), JSON.stringify(summary, null, 2));
  const reportPath = path.join(opts.out, "REPORT.md");
  fs.writeFileSync(reportPath, renderReport(summary, delta));
  const raws = fs.readdirSync(opts.out).filter((f) => /^scan-.*\.json$/.test(f)).sort();
  for (const old of raws.slice(0, Math.max(0, raws.length - RAW_REPORTS_KEPT))) fs.unlinkSync(path.join(opts.out, old));
  return reportPath;
}

function readPrevious(out) {
  try {
    return JSON.parse(fs.readFileSync(path.join(out, "latest-summary.json"), "utf8"));
  } catch {
    return null;
  }
}

function printText(summary, delta, reportPath) {
  const c = summary.counts;
  console.log(`Trivy: ${summary.total} findings in ${summary.root}`);
  console.log(`  CRITICAL ${c.CRITICAL} | HIGH ${c.HIGH} | MEDIUM ${c.MEDIUM} | LOW ${c.LOW} | UNKNOWN ${c.UNKNOWN}`);
  if (delta) console.log(`  since ${delta.previousScanAt}: ${delta.added.length} new, ${delta.resolved.length} resolved`);
  const fixable = summary.plan.filter((p) => p.fixTo);
  console.log(`Fix plan: ${fixable.length} package(s) can be updated, ${summary.plan.length - fixable.length} without a fix`);
  for (const p of fixable) {
    const dep = p.relationship === "indirect" ? ` (indirect via ${p.via.join(", ") || "?"})` : "";
    const note = targetNote(p);
    console.log(`  ${p.severity.padEnd(8)} ${p.pkg} ${p.installed} -> ${p.fixTo}${p.majorBump ? " [MAJOR]" : ""}${dep} [${p.target}]${note ? ` (${note})` : ""}`);
  }
  if (reportPath) console.log(`Report: ${reportPath}`);
}

// Empty string means the target version was checked and has no known advisories.
function targetNote(p) {
  const parts = [];
  if (p.raisedFrom?.length) parts.push(`raised from ${p.raisedFrom.join(" -> ")}, which had advisories of its own`);
  if (p.targetChecked && p.residualIds?.length) parts.push(`target still has ${p.residualIds.join(", ")} with no newer fix`);
  if (!p.targetChecked) parts.push("target not verified");
  return parts.join("; ");
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }
  if (opts.help) {
    console.log("usage: scan.mjs [--path DIR] [--out DIR] [--no-save] [--quick] [--json]");
    return;
  }
  const fail = (message) => {
    if (opts.json) console.log(JSON.stringify({ ok: false, error: message }));
    else console.error(message);
    process.exit(2);
  };
  if (!fs.existsSync(opts.path)) fail(`path not found: ${opts.path}`);
  const bin = findTrivy();
  if (!bin) fail("trivy not found. Install: winget install AquaSecurity.Trivy | brew install trivy | https://trivy.dev/latest/getting-started/installation/");
  if (opts.quick && !hasVulnDb()) fail("trivy vulnerability DB not downloaded yet; run a full scan first");

  const rawPath = path.join(os.tmpdir(), `trivy-scan-${process.pid}-${Date.now()}.json`);
  const run = runTrivy(bin, opts.path, rawPath, opts.quick);
  if (!run.ok) fail(`trivy failed: ${run.message}`);
  try {
    const report = JSON.parse(fs.readFileSync(rawPath, "utf8"));
    const summary = summarize(report, opts.path);
    // The hook only needs counts, so it skips the extra Trivy run.
    summary.targetsVerified = opts.quick ? false : verifyTargets(bin, summary.plan);
    const delta = diff(readPrevious(opts.out), summary);
    const reportPath = opts.save ? saveArtifacts(opts, rawPath, summary, delta) : null;
    if (opts.json) {
      const { vulns, ...compact } = summary;
      console.log(JSON.stringify({ ok: true, ...compact, delta, reportPath }));
    } else printText(summary, delta, reportPath);
  } finally {
    fs.rmSync(rawPath, { force: true });
  }
}

main();
