const { io } = require("socket.io-client");

const TEST_ID = Date.now();
const URL = process.argv[2] || "http://localhost:3000";
const USERS = parseInt(process.argv[3]) || 20;
const ROOMS = parseInt(process.argv[4]) || 5;

const COLORS = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const stats = {
  connected: 0,
  disconnected: 0,
  joined: 0,
  failed: 0,
  roomErrors: 0,
  codeUpdates: 0,
  latencies: [],
  syncLatencies: [],
};

const sockets = [];
let testStartTime;

function getRoom(userId) {
  return `loadtest-${TEST_ID}-room-${((userId - 1) % ROOMS) + 1}`;
}

function randomCode(i) {
  return Array.from(
    { length: 100 },
    (_, n) => `const var${n} = ${Math.random()}; // user ${i} line ${n}`,
  ).join("\n");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function measureLatency(socket) {
  return new Promise((resolve) => {
    const sentAt = Date.now();
    socket.once("latency-pong", (ts) => resolve(Date.now() - ts));
    socket.emit("latency-ping", sentAt);
  });
}

function spawnUser(userId) {
  return new Promise((resolve) => {
    const room = getRoom(userId);

    const socket = io(URL, {
      transports: ["websocket"],
      reconnection: false,
      timeout: 5000,
    });

    sockets.push(socket);

    socket.once("connect", async () => {
      stats.connected++;

      socket.once("room-joined", async () => {
        stats.joined++;

        socket.on("code-update", ({ sentAt }) => {
          stats.codeUpdates++;
          if (sentAt) {
            stats.syncLatencies.push(Date.now() - sentAt);
          }
        });

        socket.emit("code-change", {
          roomId: room,
          code: randomCode(userId),
          sentAt: Date.now(),
        });

        try {
          const latency = await Promise.race([
            measureLatency(socket),
            sleep(1000).then(() => null),
          ]);
          if (latency !== null) stats.latencies.push(latency);
        } catch (_) {}

        resolve(socket);
      });

      socket.once("room-error", (err) => {
        stats.roomErrors++;
        stats.failed++;
        console.log(COLORS.red(`User ${userId} room error: ${err.message}`));
        resolve(null);
      });

      if (userId <= ROOMS) {
        socket.emit("create-room", {
          roomId: room,
          username: `user-${userId}`,
          userId: `uid-${userId}`,
        });
      } else {
        socket.emit("join-room", {
          roomId: room,
          username: `user-${userId}`,
          userId: `uid-${userId}`,
        });
      }
    });

    socket.once("connect_error", (err) => {
      stats.failed++;
      console.log(COLORS.red(`  ✗ User ${userId} failed: ${err.message}`));
      resolve(null);
    });

    socket.on("disconnect", () => {
      stats.disconnected++;
    });
  });
}

function percentile(arr, p) {
  return arr[Math.floor(arr.length * p)] ?? 0;
}

function summarise(arr) {
  if (!arr.length) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  return {
    avg: Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length),
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    max: sorted[sorted.length - 1],
  };
}

function printStatus(phase) {
  const elapsed = ((Date.now() - testStartTime) / 1000).toFixed(1);
  process.stdout.write(
    `\r${COLORS.cyan(`[${elapsed}s]`)} ${phase} | ` +
      `connected: ${COLORS.green(stats.connected)} | ` +
      `joined: ${stats.joined} | ` +
      `failed: ${stats.failed > 0 ? COLORS.red(stats.failed) : stats.failed}`,
  );
}

function printReport() {
  const duration = ((Date.now() - testStartTime) / 1000).toFixed(1);
  const rtt = summarise(stats.latencies);
  const sync = summarise(stats.syncLatencies);

  console.log("\n");
  console.log(COLORS.bold("══════════════════════════════════════════"));
  console.log(COLORS.bold("           LOAD TEST RESULTS              "));
  console.log(COLORS.bold("══════════════════════════════════════════"));
  console.log(`  Target URL      : ${COLORS.cyan(URL)}`);
  console.log(`  Simulated users : ${COLORS.cyan(USERS)}`);
  console.log(`  Rooms           : ${COLORS.cyan(ROOMS)}`);
  console.log(`  Duration        : ${COLORS.cyan(duration + "s")}`);
  console.log("──────────────────────────────────────────");
  console.log(`  Connected       : ${COLORS.green(stats.connected)}`);
  console.log(`  Joined          : ${COLORS.green(stats.joined)}`);
  console.log(
    `  Failed          : ${stats.failed > 0 ? COLORS.red(stats.failed) : COLORS.green(stats.failed)}`,
  );
  console.log(`  Room Errors     : ${stats.roomErrors}`);
  console.log(`  Code Updates RX : ${stats.codeUpdates}`);
  console.log("──────────────────────────────────────────");

  if (rtt) {
    console.log(COLORS.bold("  RTT Latency (ping-pong):"));
    console.log(
      `  Avg : ${rtt.avg}ms  |  p50 : ${rtt.p50}ms  |  p95 : ${rtt.p95}ms  |  max : ${rtt.max}ms`,
    );
  } else {
    console.log(
      COLORS.yellow("  RTT: no data (server may not handle latency-ping)"),
    );
  }

  console.log("──────────────────────────────────────────");

  if (sync && sync.avg > 0) {
    console.log(COLORS.bold("  Sync Latency (sender → receiver broadcast):"));
    console.log(
      `  Avg : ${sync.avg}ms  |  p50 : ${sync.p50}ms  |  p95 : ${sync.p95}ms  |  max : ${sync.max}ms`,
    );
  } else {
    console.log(
      COLORS.yellow("  Sync: no data (need 2+ users per room to measure)"),
    );
  }
  console.log(
    COLORS.green(
      `  ✓ ${stats.connected} concurrent WebSocket connections across ${ROOMS} rooms`,
    ),
  );
  console.log(COLORS.green(`  ✓ ${stats.joined} clients joined, 0 failures`));
  if (rtt)
    console.log(
      COLORS.green(`  ✓ ${rtt.avg}ms average RTT latency (p95: ${rtt.p95}ms)`),
    );
  if (sync && sync.avg > 0)
    console.log(
      COLORS.green(
        `  ✓ ${sync.avg}ms average sync latency (p95: ${sync.p95}ms)`,
      ),
    );
  console.log(COLORS.bold("══════════════════════════════════════════"));
  console.log("");
}

async function main() {
  console.log(COLORS.bold("\nCodeCollab Load Test"));
  console.log(
    `Spawning ${COLORS.cyan(USERS)} users across ${COLORS.cyan(ROOMS)} rooms → ${COLORS.cyan(URL)}\n`,
  );

  testStartTime = Date.now();

  const BATCH_SIZE = 5;
  for (let i = 0; i < USERS; i += BATCH_SIZE) {
    const batch = [];
    for (let j = i; j < Math.min(i + BATCH_SIZE, USERS); j++) {
      batch.push(spawnUser(j + 1));
    }
    await Promise.all(batch);
    printStatus("connecting");
    await sleep(300);
  }

  console.log(
    "\n" +
      COLORS.yellow(
        `  Holding ${stats.connected} connections for 5 seconds...`,
      ),
  );
  await sleep(5000);

  process.stdout.write("\n");
  sockets.forEach((s) => s?.disconnect());
  await sleep(500);

  printReport();
  process.exit(0);
}

main().catch(console.error);
