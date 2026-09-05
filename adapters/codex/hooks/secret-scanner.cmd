@echo off
setlocal
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
