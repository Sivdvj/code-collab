import socket from "../socket";
import * as Y from "yjs";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

function getUserId() {
  let userId = sessionStorage.getItem("userId");
  if (!userId) {
    userId = Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem("userId", userId);
  }
  return userId;
}

function useSocket(roomId, username, action = "join") {
  let ydoc = useRef(new Y.Doc());
  let ytext = useRef(ydoc.current.getText("code"));

  let [lang, setLang] = useState("");
  let [users, setUsers] = useState([]);
  let [joined, setJoined] = useState(false);
  let [error, setError] = useState(null);
  let [mysocketId, setMysocketId] = useState("");
  let [cursor, setCursor] = useState({});

  useEffect(() => {
    socket.connect();
    if (import.meta.env.DEV) {
      window.socket = socket;
    }

    socket.on("connect", () => {
      setMysocketId(socket.id);
      console.log("Socket connected");
      let userId = getUserId();
      if (action === "join")
        socket.emit("join-room", { roomId, username, userId });
      else socket.emit("create-room", { roomId, username, userId });
    });

    socket.on("room-joined", (room) => {
      Y.applyUpdate(ydoc.current, new Uint8Array(room.update), "server");

      setLang(room.language);
      setUsers(room.users);

      let existingCursors = {};
      room.users.forEach((user) => {
        existingCursors[user.socketId] = user.cursor;
      });
      setCursor(existingCursors);

      setJoined(true);
      setError(null);
    });

    socket.on("room-error", (data) => {
      setError(data.message);
    });

    socket.on("user-joined", ({ socketId, name, color }) => {
      setUsers((prev) => [...prev, { socketId, name, color }]);
      toast(`${name} joined the room`);
    });

    socket.on("language-update", ({ language: lang }) => {
      setLang(lang);
      toast.success(`Language was updated to ${lang}`);
    });

    socket.on("cursor-update", ({ socketId, cursor }) => {
      console.log(socketId, cursor);
      setCursor((prev) => ({ ...prev, [socketId]: cursor }));
    });
    socket.on("user-left", ({ socketId, name }) => {
      setUsers((prev) => prev.filter((u) => u.socketId !== socketId));
      toast(`${name} left the room`);
    });

    socket.on("user-kicked", ({ socketId, name }) => {
      setUsers((prev) => prev.filter((u) => u.socketId !== socketId));
      toast.error(`${name} was kicked`);
    });

    socket.on("kicked", () => {
      setError("You were removed from the room");
      toast.error("You were removed from the room");
    });

    socket.on("y-update", ({ update }) => {
      Y.applyUpdate(ydoc.current, new Uint8Array(update), "server");
    });

    let handleUpdate = (update, origin) => {
      if (origin === "server") return;
      socket.emit("y-update", { roomId, update });
    };
    ydoc.current.on("update", handleUpdate);

    return () => {
      ydoc.current.off("update", handleUpdate);
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, []);

  let langChange = (newLang) => {
    socket.emit("language-change", { roomId, language: newLang });
    setLang(newLang);
  };

  let kickUser = (targetSocketId) => {
    socket.emit("kick-user", { roomId, targetId: targetSocketId });
  };

  let cursorChange = (e) => {
    socket.emit("cursor-move", {
      roomId,
      cursor: { line: e.position.lineNumber, column: e.position.column },
    });
  };

  return {
    ytext,
    lang,
    users,
    joined,
    cursor,
    langChange,
    cursorChange,
    error,
    mysocketId,
    kickUser,
  };
}
export default useSocket;
