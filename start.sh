#!/bin/sh
# Railway startup script
# Unset HOSTNAME so Next.js listens on 0.0.0.0
unset HOSTNAME
exec node .next/standalone/server.js
