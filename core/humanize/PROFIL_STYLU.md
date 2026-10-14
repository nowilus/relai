# Author style profile — format and how to build it

Read by `/relai-humanize` (interview, second window; argument `ustawienia`). Plan HUMANIZACJA,
Aneks A2, A3, A5.

The profile describes **how a person writes**, so a rewrite can sound like them in the kinds of text
they chose. It is optional: without it humanization removes AI tells and keeps the tone of the kind
of text, nothing more.

## What the profile is — and is not

- **Features, never raw text.** Favourite words and phrases, sentence length, how paragraphs open
  and close, what the author avoids. No copied passages: the longest quotation allowed is **one
  phrase of at most five words**. The save script refuses any run of six or more words that also
  occurs in the sources.
- **Rhythm and phrasing from speech, not its slips.** Dictation logs carry false starts, repeated
  words, fillers ("no", "yyy", "jakby") and a narrow vocabulary. The profile takes the rhythm and
  the characteristic turns of phrase; it never tells the rewrite to imitate slips, repetitions or
  poor word choice. Humanization does not pretend to be dictation.
- **No personal data and no secrets.** No names of other people, e-mail addresses, phone numbers,
  account numbers, keys or passwords, even when the sources contain them. The save script refuses a
  profile with a match.

## Where it lives

| File | When |
|---|---|
| `~/.claude/relai/STYL.md` | default — style belongs to the person, not to the project; outside every repository |
| `docs/zasoby/STYL.md` | **only on an explicit request** of the person for this project; it goes into the repository, so say so before writing |

The command reads the project file first when it exists (`odczyt` reports `profilPlik`).

## Sources

The person picks one. RelAI has no dependency on any dictation tool: every source is "text you
point to".

| Source | How the text reaches the check |
|---|---|
| pasted text | in the conversation; the save command gets it on standard input before the separator line (`--stdin-zrodlo`) |
| own documents | paths the person gives — files or folders, `.txt .md .json .jsonl .log .csv` (`--zrodla`) |
| dictation logs | the same as documents: the person says where the logs are and in what format; you read them **locally** |

Paths outside the project are read only because the person pointed to them. Nothing from the
sources is written anywhere except the finished profile: no copies, no excerpts, no intermediate
files in the repository. A stage of RelAI's own work may keep intermediate material in its work
folder under `.claude/relai/work/`; a user's run of the command keeps it in the conversation only.

**Large sources.** Read up to about 300 KB of text (ESTIMATE), newest first; say how much you read.
For JSON or JSONL logs read only the fields that hold the person's own words (ask when the field is
not obvious) — timestamps, ids and application metadata are not style. The check script decodes
JSON and JSONL itself (escaped `\uXXXX` text included), refuses a file named explicitly with
another extension and refuses a check that found no readable source at all.

## Format of `STYL.md`

Polish for a Polish author (headings below), English for an English one. Each section is a short
list; three to six points is usually enough. Mark every point with how sure you are when the source
is thin.

```markdown
# STYL — profil stylu autora

Zbudowany: 2026-10-14 · źródło: logi dyktowania (12 plików, ok. 40 tys. słów) · RelAI /relai-humanize

## Słowa i zwroty, po które sięga
- „no to” na początku polecenia; „w sensie” przy doprecyzowaniu
- woli „zrobić” niż „zrealizować”, „sprawdzić” niż „zweryfikować”

## Długość i budowa zdań
- krótkie zdania, często równoważniki; długie tylko przy wyliczaniu warunków

## Jak zaczyna i kończy
- zaczyna od sedna albo od polecenia, bez wstępu
- kończy konkretem (co dalej), nie podsumowaniem

## Czego unika
- zwrotów urzędowych („w związku z powyższym”), anglicyzmów, gdy jest polskie słowo

## Czego z mowy nie przenosić
- powtórzeń słowa na początku zdania, „yyy”, zdań urwanych w połowie
```

The section "Czego z mowy nie przenosić" is required for dictation sources and optional for the
others.

## Procedure

1. **Source.** Ask which one; for documents and logs ask for the location (and for logs, the
   format). Never search the disk for them yourself.
2. **Read and describe.** Read the sources (limits above) and write the profile in the format
   above. Describe; do not quote beyond one phrase.
3. **Check.** Run the save script with `--tylko-kontrola` first (commands below). Exit 1 lists
   `cytaty` (runs of six words found in the sources) and `wrazliwe` (kinds of sensitive data):
   rewrite those points as descriptions and run the check again.
4. **Show and ask.** Show the whole profile and the check result (files, words, zero quotes, zero
   sensitive matches). Ask once whether to save it and where (default: global file).
5. **Save** only after yes — the same command without `--tylko-kontrola`. The script checks again
   and writes only a clean profile. Report the path and whether an older profile was overwritten.

Files or folders as the source (the script checks against every file again, so the sources must be
given in full, not as the excerpt you read):

```bash
node .claude/relai/tools/humanize-mode.js profil --zrodla '<path>' '<path>' --tylko-kontrola <<'RELAI_END_<hex>'
<profile>
RELAI_END_<hex>
```

Pasted text — the source first, the separator line, then the profile, in one quoted heredoc:

```bash
node .claude/relai/tools/humanize-mode.js profil --stdin-zrodlo --tylko-kontrola <<'RELAI_END_<hex>'
<pasted source>
=====RELAI-PROFIL=====
<profile>
RELAI_END_<hex>
```

The terminator is new for every call (`RELAI_END_` plus eight random hex characters), checked
against every line of the text, exactly as for the fact guard in the command. A project file is
written with `--cel docs/zasoby/STYL.md`; `--cel` accepts only that file and the global one. A
global save while a project profile exists reports `przyslania`: say that the project file is the
one that will be read. In the RelAI repository the script is
`core/process/humanize-mode.js`.

## Where the profile applies

The settings line decides (`profil: tak · profil w: …`), kinds: `czat` (replies in the
conversation), `wiadomości` (messages to people: the team, e-mail, a release note for the team),
`robocze` (journal, notes, status), `formalne` (plans, architecture, guides). Default: `czat,
wiadomości`. Formal documents never get the profile unless the person turns it on. Commit messages
and PR descriptions stay technical and never get the profile.

When a kind is covered, the profile **adjusts** the rewrite (word choice, sentence length, openings)
inside the tone of that kind; it never adds facts and never overrides the rule base.
