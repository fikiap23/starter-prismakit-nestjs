#!/bin/sh

fix_generated_ownership() {
  if [ -d src/generated ] && [ -f package.json ]; then
    HOST_UID=$(stat -c '%u' package.json)
    HOST_GID=$(stat -c '%g' package.json)
    chown -R "${HOST_UID}:${HOST_GID}" src/generated
  fi
}
