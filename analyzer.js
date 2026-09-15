
const dgram = require("dgram");

const PORT = 1900;
const HOST = "127.0.0.1";

const socket = dgram.createSocket("udp4");

socket.on("message", (msg, rinfo) => {
  const timestamp = new Date().toISOString();

  console.log(
    `[${timestamp}] ` +
    `SOURCE=${rinfo.address}:${rinfo.port} ` +
    `SIZE=${msg.length} bytes`
  );
});

socket.on("listening", () => {
  const address = socket.address();

  console.log(
    `[ANALYZER] Listening on ${address.address}:${address.port}`
  );
});

socket.on("error", (err) => {
  console.error(`[ANALYZER] Error: ${err.message}`);
  socket.close();
});

socket.bind(PORT, HOST);
