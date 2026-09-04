#!/bin/sh

if [ "${NODE_ENV:-}" != "production" ]; then
  exit 0
fi

fail() {
  echo "$1" >&2
  exit 1
}

[ -n "${ADMIN_PASSWORD:-}" ] || fail "ADMIN_PASSWORD must be set in production"
[ "$ADMIN_PASSWORD" != "admin123" ] || fail "ADMIN_PASSWORD must not use the default admin123 password"

[ -n "${ENCRYPTION_KEY:-}" ] || fail "ENCRYPTION_KEY must be set in production"
[ "${#ENCRYPTION_KEY}" -ge 32 ] || fail "ENCRYPTION_KEY must be at least 32 characters in production"

[ -n "${PHOTOBOOK_IMAGE:-}" ] || fail "PHOTOBOOK_IMAGE must be set to an immutable image tag"
case "$PHOTOBOOK_IMAGE" in
  *:latest*) fail "PHOTOBOOK_IMAGE must not use the mutable latest tag" ;;
esac

image_without_digest=${PHOTOBOOK_IMAGE%@*}
digest=${PHOTOBOOK_IMAGE#*@}
last_path_component=${image_without_digest##*/}
if [ "$image_without_digest" = "$PHOTOBOOK_IMAGE" ] || [ -z "$digest" ]; then
  case "$last_path_component" in
    *:*) ;;
    *) fail "PHOTOBOOK_IMAGE must include an immutable tag or digest" ;;
  esac
fi

exit 0
