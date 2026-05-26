import { useState } from "react";
import { useNavigate } from "react-router";
import socket from "../socket";
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
    <div>
      <h2>CodeCollab</h2>
      <p>
        Enter Name:
        <input
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </p>
      <button onClick={handleCreateRoom}>Create Room</button>
      <p>
        Enter RoomId:
        <input
          type="text"
          placeholder="Enter room id"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={handleJoin}>Join Room</button>
      </p>
    </div>
  );
}
export default Home;
