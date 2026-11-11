// relai-browser: shrinking a picture with what the system has — pure builders and a parser, no $.
// Windows: Windows PowerShell + System.Drawing (HighQualityBicubic), limit 30 s; macOS: sips,
// limit 20 s; anywhere else no tool (the picture passes unchanged, a note once). The picture goes
// in on stdin as base64; the script computes the target from RELAI_SCALE and RELAI_MIN and answers
// "SAME <w> <h>" or "<w> <h> <nw> <nh> <base64>". Numbers cross as invariant text: a Polish
// Windows reads "0,5" (rule 5 — the instrument can lie).

export type Platform = 'windows' | 'mac' | 'other'

export const LIMIT_MS = { windows: 30000, mac: 20000 } as const

/** The system from the session's cwd: a drive letter → Windows, /Users/ → macOS. */
export function platformOf(cwd: string): Platform {
  if (/^[A-Za-z]:[\\/]/.test(cwd)) return 'windows'
  if (/^\/Users\//.test(cwd)) return 'mac'
  return 'other'
}

const PS = [
  "$ErrorActionPreference='Stop'",
  'Add-Type -AssemblyName System.Drawing',
  '$inv=[Globalization.CultureInfo]::InvariantCulture',
  '$s=[double]::Parse($env:RELAI_SCALE,$inv)',
  '$m=[int]$env:RELAI_MIN',
  '$b=[Convert]::FromBase64String([Console]::In.ReadToEnd().Trim())',
  '$ms=New-Object System.IO.MemoryStream(,$b)',
  '$img=[System.Drawing.Image]::FromStream($ms)',
  '$w=$img.Width;$h=$img.Height;$long=[Math]::Max($w,$h)',
  '$t=[Math]::Max([int][Math]::Floor($long*$s+0.5),$m)',
  "if($t -ge $long){[Console]::Out.Write(\"SAME $w $h\");exit 0}",
  '$nw=[Math]::Max(1,[int][Math]::Round($w*$t/$long));$nh=[Math]::Max(1,[int][Math]::Round($h*$t/$long))',
  '$bmp=New-Object System.Drawing.Bitmap($nw,$nh)',
  '$g=[System.Drawing.Graphics]::FromImage($bmp)',
  '$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic',
  '$g.DrawImage($img,0,0,$nw,$nh)',
  '$out=New-Object System.IO.MemoryStream',
  "if($env:RELAI_FMT -eq 'jpeg'){",
  "$c=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()|Where-Object{$_.MimeType -eq 'image/jpeg'}",
  '$p=New-Object System.Drawing.Imaging.EncoderParameters(1)',
  '$p.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,[long]85)',
  '$bmp.Save($out,$c,$p)}else{$bmp.Save($out,[System.Drawing.Imaging.ImageFormat]::Png)}',
  '[Console]::Out.Write("$w $h $nw $nh "+[Convert]::ToBase64String($out.ToArray()))',
].join('\n')

const SH = [
  'set -e',
  'f=$(mktemp -t relai)',
  'base64 -D -o "$f"',
  "w=$(sips -g pixelWidth \"$f\" | awk '/pixelWidth/{print $2}')",
  "h=$(sips -g pixelHeight \"$f\" | awk '/pixelHeight/{print $2}')",
  'long=$w; [ "$h" -gt "$long" ] && long=$h',
  "t=$(awk -v l=\"$long\" -v s=\"$RELAI_SCALE\" 'BEGIN{printf \"%d\", int(l*s+0.5)}')",
  '[ "$t" -lt "$RELAI_MIN" ] && t=$RELAI_MIN',
  'if [ "$t" -ge "$long" ]; then printf "SAME %s %s" "$w" "$h"; rm -f "$f"; exit 0; fi',
  'if [ "$RELAI_FMT" = jpeg ]; then sips -s format jpeg -s formatOptions 85 -Z "$t" "$f" --out "$f.o" >/dev/null',
  'else sips -s format png -Z "$t" "$f" --out "$f.o" >/dev/null; fi',
  "nw=$(sips -g pixelWidth \"$f.o\" | awk '/pixelWidth/{print $2}')",
  "nh=$(sips -g pixelHeight \"$f.o\" | awk '/pixelHeight/{print $2}')",
  'printf "%s %s %s %s " "$w" "$h" "$nw" "$nh"',
  "base64 -i \"$f.o\" | tr -d '[:space:]'",
  'rm -f "$f" "$f.o"',
].join('\n')

/** argv of the shrink on this system, or null when there is no tool. */
export function resizeArgv(platform: Platform): string[] | null {
  if (platform === 'windows') return ['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', PS]
  if (platform === 'mac') return ['/bin/sh', '-c', SH]
  return null
}

/** Environment of one call: scale as invariant text, min, output format. */
export function resizeEnv(scale: number, min: number, format: 'jpeg' | 'png'): Record<string, string> {
  return { RELAI_SCALE: String(scale), RELAI_MIN: String(min), RELAI_FMT: format }
}

export type ResizeOut =
  | { kind: 'same', w: number, h: number }
  | { kind: 'shrunk', w: number, h: number, nw: number, nh: number, data: string }

/** The script's answer, or null when it is not one of the two forms. */
export function parseResize(stdout: string): ResizeOut | null {
  const text = String(stdout || '').trim()
  const same = /^SAME (\d+) (\d+)$/.exec(text)
  if (same) return { kind: 'same', w: Number(same[1]), h: Number(same[2]) }
  const m = /^(\d+) (\d+) (\d+) (\d+) ([A-Za-z0-9+/=]+)$/.exec(text)
  if (!m) return null
  return { kind: 'shrunk', w: Number(m[1]), h: Number(m[2]), nw: Number(m[3]), nh: Number(m[4]), data: m[5] }
}
