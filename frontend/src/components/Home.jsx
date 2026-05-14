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
    socket.connect();
    navigate(`/editor/${roomId}`, {
      state: { name },
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
      <p>
        Enter Room ID:
        <input
          type="text"
          placeholder="Enter room Id"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={handleJoin}>Join</button>
      </p>
    </div>
  );
}
export default Home;
