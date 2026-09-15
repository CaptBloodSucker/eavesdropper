const dgram = require("dgram");

const PORT = 1900;
const HOST = "0.0.0.0";

const socket = dgram.createSocket("udp4");

const WINDOW_MS = 1000; // sliding window in ms
const SIZE_THRESHOLD = 200; // bytes
const RATE_THRESHOLD = 5; // packets/sec

let packets = [];
let currentState = "IDLE";

function detectState() {
  const now = Date.now();
  packets = packets.filter((p) => now - p.time < WINDOW_MS);

  if (packets.length === 0) return "IDLE";

  const avgSize =
    packets.reduce((sum, p) => sum + p.size, 0) / packets.length;
  const rate = (packets.length / WINDOW_MS) * 1000;

  if (avgSize > SIZE_THRESHOLD && rate > RATE_THRESHOLD) {
    return "ACTIVE";
  }

  return "IDLE";
}

socket.on("message", (msg, rinfo) => {
  const timestamp = new Date().toISOString();
  const size = msg.length;

  packets.push({ size, time: Date.now() });

  const detectedState = detectState();

  if (detectedState !== currentState) {
    console.log(
      `[${timestamp}] ` +
        `STATE CHANGE: ${currentState} -> ${detectedState} ` +
        `(avg=${Math.round(
          packets.reduce((s, p) => s + p.size, 0) / packets.length
        )}B, rate=${((packets.length / WINDOW_MS) * 1000).toFixed(1)}/s)`
    );
    currentState = detectedState;
  }

  console.log(
    `[${timestamp}] ` +
      `SRC=${rinfo.address}:${rinfo.port} ` +
      `SIZE=${size}B ` +
      `STATE=${currentState}`
  );
});

socket.on("listening", () => {
  const address = socket.address();
  console.log(
    `[ANALYZER] Listening on ${address.address}:${address.port}`
  );
  console.log(
    `[ANALYZER] Detection: window=${WINDOW_MS}ms size>${SIZE_THRESHOLD}B rate>${RATE_THRESHOLD}/s`
  );
});

socket.on("error", (err) => {
  console.error(`[ANALYZER] Error: ${err.message}`);
  socket.close();
});

socket.bind(PORT, HOST);
