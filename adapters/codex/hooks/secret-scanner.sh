#!/bin/sh
if [ -n "$RELAI_NODE" ]; then
  exec "$RELAI_NODE" "$(dirname "$0")/secret-scanner.js"
fi
if ! command -v node >/dev/null 2>&1; then
  echo 'RelAI secret scanner: Node.js is unavailable; refusing the protected write.' >&2
  exit 2
fi
exec node "$(dirname "$0")/secret-scanner.js"
