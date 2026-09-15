#!/usr/bin/env bash

set -u

HOST="127.0.0.1"
PORT="1900"

IDLE_SIZE=32
ACTIVE_SIZE=1024

IDLE_INTERVAL=1.0
ACTIVE_INTERVAL=0.05
ACTIVE_DURATION=5

echo "[MOCK DEVICE] Starting"
echo "[MOCK DEVICE] Destination: ${HOST}:${PORT}"

# Check for socat
if ! command -v socat >/dev/null 2>&1; then
  echo "Error: socat is required."
  echo "Install it with: sudo apt install socat"
  exit 1
fi

send_packet() {
  local size="$1"

  # Generate exactly $size bytes and send as one UDP datagram.
  head -c "$size" /dev/zero |
    socat -u - "UDP:${HOST}:${PORT}"
}

cleanup() {
  echo
  echo "[MOCK DEVICE] Stopped"
  exit 0
}

trap cleanup INT TERM

while true; do
  # -----------------------------
  # IDLE STATE
  # -----------------------------
  echo "[MOCK DEVICE] State: IDLE"

  for ((i = 0; i < 10; i++)); do
    send_packet "$IDLE_SIZE"
    sleep "$IDLE_INTERVAL"
  done

  # -----------------------------
  # ACTIVE / MOTION STATE
  # -----------------------------
  echo "[MOCK DEVICE] State: ACTIVE (motion detected)"

  end_time=$(awk "BEGIN {print systime() + ${ACTIVE_DURATION}}")

  while (($(awk "BEGIN {print systime() < ${end_time}}"))); do
    send_packet "$ACTIVE_SIZE"
    sleep "$ACTIVE_INTERVAL"
  done

  echo "[MOCK DEVICE] State: motion ended"
done
