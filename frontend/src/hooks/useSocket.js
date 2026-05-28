import socket from "../socket";
import { useState, useEffect } from "react";

function getUserId() {
  let userId = sessionStorage.getItem("userId");
  if (!userId) {
    userId = Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem("userId", userId);
  }
  return userId;
}

function useSocket(roomId, username, action = "join") {
  let [code, setCode] = useState("");
  let [lang, setLang] = useState("");
  let [users, setUsers] = useState([]);
  let [joined, setJoined] = useState(false);
  let [error, setError] = useState(null);
  let [mysocketId, setMysocketId] = useState("");
  useEffect(() => {
    socket.connect();
    socket.once("connect", () => {
      setMysocketId(socket.id);
      console.log("Socket connected");
      let userId = getUserId();
      if (action === "join")
        socket.emit("join-room", { roomId, username, userId });
      else socket.emit("create-room", { roomId, username, userId });
    });

    socket.on("room-joined", (room) => {
      setCode(room.code);
      setLang(room.language);
      setUsers(room.users);
      setJoined(true);
      setError(null);
    });

    socket.on("room-error", (data) => {
      setError(data.message);
    });

    socket.on("user-joined", ({ socketId, name, color }) => {
      setUsers((prev) => [...prev, { socketId, name, color }]);
    });

    socket.on("code-update", ({ code }) => setCode(code));
    socket.on("language-update", ({ language: lang }) => setLang(lang));

    socket.on("user-left", ({ socketId }) => {
      setUsers((prev) => prev.filter((u) => u.socketId !== socketId));
    });

    socket.on("user-kicked", ({ socketId, name }) => {
      setUsers((prev) => prev.filter((u) => u.socketId !== socketId));
      console.log(`${name} was removed`);
    });

    socket.on("kicked", () => {
      setError("You were removed from the room");
    });

    return () => {
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, []);

  let codeChange = (newCode) => {
    socket.emit("code-change", { roomId, code: newCode });
    setCode(newCode);
  };

  let langChange = (newLang) => {
    socket.emit("language-change", { roomId, language: newLang });
    setLang(newLang);
  };

  let kickUser = (targetSocketId) => {
    socket.emit("kick-user", { roomId, targetId: targetSocketId });
  };
  return {
    code,
    lang,
    users,
    joined,
    codeChange,
    langChange,
    error,
    mysocketId,
    kickUser,
  };
}
export default useSocket;
