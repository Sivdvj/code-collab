const rooms = new Map();
const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFD93D",
  "#6BCB77",
  "#4D96FF",
  "#B983FF",
  "#FF9F1C",
];

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function joinRoom(roomId, socketId, username) {
  if (!rooms.has(roomId)) {
    return { error: "Room does not exist" };
  }
  let room = rooms.get(roomId);
  room.users.set(socketId, {
    name: username,
    color: getRandomColor(),
    cursor: { line: 0, column: 0 },
  });
  return { room: serializeRoom(room) };
}

function createRoom(roomId, socketId, username) {
  if (rooms.has(roomId)) {
    return { error: "Room already exists" };
  }
  let room = {
    owner: socketId,
    code: "// Start coding",
    language: "javascript",
    users: new Map(),
  };
  room.users.set(socketId, {
    name: username,
    color: getRandomColor(),
    cursor: { line: 0, column: 0 },
  });
  rooms.set(roomId, room);
  return { room: serializeRoom(room) };
}

function leaveRoom(socketId) {
  // TODO: currently is an O(n) lookup; maintain an inverted index for O(1) lookup
  for (let [roomId, room] of rooms.entries()) {
    if (room.users.has(socketId)) {
      room.users.delete(socketId);
      if (room.users.size === 0) {
        setTimeout(() => {
          if (room.users.size === 0) {
            rooms.delete(roomId);
          }
        }, 300000);
      }
      return { roomId };
    }
  }
  return null;
}

function updateCode(roomId, code) {
  if (rooms.has(roomId)) rooms.get(roomId).code = code;
}

function updateLanguage(roomId, language) {
  if (rooms.has(roomId)) rooms.get(roomId).language = language;
}

function updateCursor(roomId, socketId, cursor) {
  let room = rooms.get(roomId);
  if (room && room.users.has(socketId)) {
    room.users.get(socketId).cursor = cursor;
  }
}

function kickUser(roomId, socketId, targetId) {
  let room = rooms.get(roomId);
  if (socketId != room.owner) return null;

  let kicked = room.users.get(targetId);
  leaveRoom(targetId);

  return kicked;
}

function serializeRoom(room) {
  return {
    owner: room.owner,
    code: room.code,
    language: room.language,
    users: Array.from(room.users, ([socketId, user]) => ({
      socketId,
      ...user,
      isOwner: socketId === room.owner,
    })),
  };
}

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  updateCode,
  updateLanguage,
  updateCursor,
  kickUser,
};
