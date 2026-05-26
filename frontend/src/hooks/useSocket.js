import socket from "../socket";
import { useState, useEffect } from "react";

function useSocket(roomId, username, action = "join") {
  let [code, setCode] = useState("");
  let [lang, setLang] = useState("");
  let [users, setUsers] = useState([]);
  let [joined, setJoined] = useState(false);
  let [error, setError] = useState(null);

  useEffect(() => {
    socket.connect();
    socket.once("connect", () => {
      console.log("Socket connected");
      if (action === "join") socket.emit("join-room", { roomId, username });
      else socket.emit("create-room", { roomId, username });
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
  return { code, lang, users, joined, codeChange, langChange, error };
}
export default useSocket;
