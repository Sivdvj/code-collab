const rooms = new Map();

function joinRoom(roomId, socketId, username) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      code: "// Start coding",
      language: "javascript",
      users: new Map(),
    });
  }
  const room = rooms.get(roomId);
  room.users.set(socketId, { name: username, cursor: { line: 0, column: 0 } });
  return serializeRoom(room);
}

function leaveRoom(socketId) {
  // TODO: currently is an O(n) lookup; maintain an inverted index for O(1) lookup
  for (let [roomId, room] of rooms.entries()) {
    if (room.users.has(socketId)) {
      room.users.delete(socketId);
      if (room.users.size === 0) rooms.delete(roomId);
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

function serializeRoom(room) {
  return {
    code: room.code,
    language: room.language,
    users: Array.from(room.users, ([socketId, user]) => ({
      socketId,
      ...user,
    })),
  };
}

module.exports = {
  joinRoom,
  leaveRoom,
  updateCode,
  updateLanguage,
  serializeRoom,
};
