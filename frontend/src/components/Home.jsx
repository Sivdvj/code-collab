import { useState } from "react";
import { useNavigate } from "react-router";
import socket from "../socket";
import { Icon } from "@iconify/react";

function Home() {
  let [name, setName] = useState("");
  let [roomId, setRoomId] = useState("");

  let navigate = useNavigate();

  let handleJoin = () => {
    if (!name.trim() || !roomId.trim()) {
      alert("Please fill all the fields");
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: { name, action: "join" },
    });
  };

  let handleCreateRoom = () => {
    if (!name.trim()) {
      alert("Please fill the name");
      return;
    }
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    navigate(`/editor/${roomId}`, {
      state: { name, action: "create" },
    });
  };

  return (
    <div className="bg-zinc-950 h-screen text-zinc-300 flex items-center justify-center">
      <div className="bg-zinc-900 p-8 w-full max-w-7xl rounded-xl flex flex-col gap-7">
        <div className="flex flex-col gap-1">
          <h2 className="text-4xl font-bold mb-1">CodeCollab</h2>
          <p className="font-bold tracking-wider text-zinc-400 mb-3.5 border-b-2 border-zinc-500">
            Realtime collaborative platform
          </p>
        </div>

        <p className="flex gap-2 items-center">
          <p className="font-bold text-zinc-400 tracking-wide">Enter Name:</p>
          <input
            className="p-2 border-2 border-zinc-500 rounded-xl font-bold"
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </p>
        <div className="font-bold text-zinc-400 tracking-wide flex gap-3.5 items-center">
          <button
            className="py-2 px-4 bg-zinc-300 text-zinc-700 rounded-full flex gap-2 items-center hover:scale-105 border-2 border-zinc-400"
            onClick={handleCreateRoom}
          >
            <Icon
              icon="material-symbols:meeting-room-outline-rounded"
              className="w-6 h-6"
            />
            New Room
          </button>
          <input
            className="p-2 border-2 border-zinc-500 rounded-xl font-bold"
            type="text"
            placeholder="Enter a code to join"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={handleJoin}>Join</button>
        </div>
      </div>
    </div>
  );
}
export default Home;
