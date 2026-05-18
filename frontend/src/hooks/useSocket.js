import socket from "../socket";
import { useState, useEffect } from "react";

function useSocket(roomId, username) {
  let [code, setCode] = useState("");
  let [lang, setLang] = useState("");
  let [users, setUsers] = useState([]);
  let [joined, setJoined] = useState(false);

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      console.log("Socket connected");
      socket.emit("join-room", { roomId, username });
    });

    socket.on("room-joined", (room) => {
      setCode(room.code);
      setLang(room.language);
      setUsers(room.users);
      setJoined(true);
    });

    socket.on("user-joined", ({ socketId, name }) => {
      setUsers((prev) => [...prev, { socketId, name }]);
    });

    socket.on("code-update", ({ code }) => setCode(code));
    socket.on("language-update", ({ lang }) => setLang(lang));

    socket.on("user-left", ({ socketId }) => {
      setUsers((prev) => prev.filter((u) => u.socketId !== socketId));
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

  return { code, lang, users, joined, codeChange };
}
export default useSocket;
