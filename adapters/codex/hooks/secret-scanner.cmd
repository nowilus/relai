@echo off
setlocal
rem Claude Code also loads the root hooks/ directory; its own adapter registers a PreToolUse
rem secret scanner, so this Codex copy stays silent under that host (P-013).
if defined CLAUDECODE exit /b 0
if defined RELAI_NODE (
  "%RELAI_NODE%" "%~dp0secret-scanner.js"
  exit /b %errorlevel%
)
where node >nul 2>nul
if errorlevel 1 (
  >&2 echo RelAI secret scanner: Node.js is unavailable; refusing the protected write.
  exit /b 2
)
node "%~dp0secret-scanner.js"
exit /b %errorlevel%
