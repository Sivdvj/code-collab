const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");

const app = express();
const PORT = 3000;

const server = createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
