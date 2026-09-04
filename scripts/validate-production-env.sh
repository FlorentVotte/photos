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

case "$PHOTOBOOK_IMAGE" in
  *@*)
    digest=${PHOTOBOOK_IMAGE#*@}
    case "$digest" in
      sha256:*)
        digest_hex=${digest#sha256:}
        [ "${#digest_hex}" -eq 64 ] || fail "PHOTOBOOK_IMAGE digest must be sha256 followed by 64 hexadecimal characters"
        case "$digest_hex" in
          *[!0123456789abcdefABCDEF]*|'') fail "PHOTOBOOK_IMAGE digest must be sha256 followed by 64 hexadecimal characters" ;;
        esac
        ;;
      *) fail "PHOTOBOOK_IMAGE digest must be sha256 followed by 64 hexadecimal characters" ;;
    esac
    ;;
  *)
    last_path_component=${PHOTOBOOK_IMAGE##*/}
    case "$last_path_component" in
      *:*)
        image_tag=${last_path_component##*:}
        [ -n "$image_tag" ] || fail "PHOTOBOOK_IMAGE must include a nonempty tag after the final colon"
        ;;
      *) fail "PHOTOBOOK_IMAGE must include an immutable tag or digest" ;;
    esac
    ;;
esac

exit 0
