#!/bin/sh

# Replace placeholders with actual environment variables.
escape_sed_replacement() {
  printf '%s' "$1" | sed -e 's/[\/&|]/\\&/g'
}

replace_placeholder() {
  placeholder="$1"
  value="$(escape_sed_replacement "$2")"
  sed -i "s|${placeholder}|${value}|g" /usr/share/nginx/html/index.html
}

replace_placeholder "__GEMINI_MODEL__" "${GEMINI_MODEL:-gemini-2.5-flash}"
replace_placeholder "__GEMINI_PROXY_URL__" "${GEMINI_PROXY_URL:-}"
replace_placeholder "__ELECTION_DATA_URL__" "${ELECTION_DATA_URL:-}"
replace_placeholder "__GOOGLE_MAPS_KEY__" "${GOOGLE_MAPS_KEY:-}"
replace_placeholder "__ENABLE_SEARCH_GROUNDING__" "${ENABLE_SEARCH_GROUNDING:-true}"

# Execute the CMD
exec "$@"
