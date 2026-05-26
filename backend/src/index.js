require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const cors = require("cors");

const {
  createRoom,
  joinRoom,
  leaveRoom,
  updateCode,
  updateLanguage,
  updateCursor,
} = require("./roomManager");
const app = express();
const PORT = process.env.PORT || 3000;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);

  socket.on("create-room", ({ roomId, username }) => {
    const res = createRoom(roomId, socket.id, username);
    if (res.error) {
      socket.emit("room-error", { message: res.error });
      return;
    }
    socket.join(roomId);
    socket.emit("room-joined", res.room);
  });

  socket.on("join-room", ({ roomId, username }) => {
    const res = joinRoom(roomId, socket.id, username);
    if (res.error) {
      socket.emit("room-error", { message: res.error });
      return;
    }
    socket.join(roomId);
    socket.emit("room-joined", res.room);
    socket
      .to(roomId)
      .emit("user-joined", { socketId: socket.id, name: username });
  });

  socket.on("code-change", ({ roomId, code }) => {
    updateCode(roomId, code);
    socket.to(roomId).emit("code-update", { code });
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
  socket.on("disconnect", () => {
    const res = leaveRoom(socket.id);
    if (res) {
      socket.to(res.roomId).emit("user-left", { socketId: socket.id });
    }
    console.log("User disconnected: " + socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
