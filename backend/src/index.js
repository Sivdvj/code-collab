require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const cors = require("cors");
const axios = require("axios");
const Y = require("yjs");

const {
  hasRoom,
  createRoom,
  joinRoom,
  leaveRoom,
  updateLanguage,
  updateCursor,
  kickUser,
  getRoom,
} = require("./roomManager");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));

app.get("/room/:roomId", (req, res) => {
  res.json({ exists: hasRoom(req.params.roomId) });
});

app.post("/execute", (req, res) => {
  res.json({
    stdout: "Code execution coming soonnn",
  });
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);

  socket.on("create-room", ({ roomId, username, userId }) => {
    const res = createRoom(roomId, socket.id, username, userId);
    if (res.error) {
      socket.emit("room-error", { message: res.error });
      return;
    }
    socket.join(roomId);
    socket.emit("room-joined", res.room);
  });

  socket.on("join-room", ({ roomId, username, userId }) => {
    const res = joinRoom(roomId, socket.id, username, userId);
    if (res.error) {
      socket.emit("room-error", { message: res.error });
      return;
    }
    socket.join(roomId);
    socket.emit("room-joined", res.room);

    const joinedUser = res.room.users.find((u) => u.socketId === socket.id);
    socket.to(roomId).emit("user-joined", {
      socketId: socket.id,
      name: username,
      color: joinedUser.color,
    });
  });

  socket.on("y-update", ({ roomId, update }) => {
    let room = getRoom(roomId);
    Y.applyUpdate(room.doc, update);

    socket.to(roomId).emit("y-update", {
      update,
    });
  });

  socket.on("language-change", ({ roomId, language }) => {
    updateLanguage(roomId, language);
    socket.to(roomId).emit("language-update", { language });
  });

  socket.on("cursor-move", ({ roomId, cursor }) => {
    updateCursor(roomId, socket.id, cursor);
    socket
      .to(roomId)
      .emit("cursor-update", { socketId: socket.id, cursor: cursor });
  });

  socket.on("kick-user", ({ roomId, targetId }) => {
    let kicked = kickUser(roomId, socket.id, targetId);
    if (!kicked) return;

    io.sockets.sockets.get(targetId)?.leave(roomId);
    io.to(targetId).emit("kicked");
    io.to(roomId).emit("user-kicked", {
      socketId: targetId,
      name: kicked.name,
    });
  });

  socket.on("latency-ping", (sentAt) => {
    socket.emit("latency-pong", sentAt);
  });

  socket.on("disconnect", () => {
    const res = leaveRoom(socket.id);
    if (res) {
      socket
        .to(res.roomId)
        .emit("user-left", { socketId: socket.id, name: res.name });
    }
    console.log("User disconnected: " + socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
