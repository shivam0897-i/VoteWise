#!/bin/sh

# Replace placeholders with actual environment variables
sed -i "s|__GEMINI_API_KEY__|${GEMINI_API_KEY:-}|g" /usr/share/nginx/html/index.html
sed -i "s|__GEMINI_MODEL__|${GEMINI_MODEL:-gemini-3.1-pro-preview}|g" /usr/share/nginx/html/index.html
sed -i "s|__ELECTION_DATA_URL__|${ELECTION_DATA_URL:-}|g" /usr/share/nginx/html/index.html

# Execute the CMD
exec "$@"
