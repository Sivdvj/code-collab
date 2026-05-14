import { useParams, useLocation } from "react-router";

function Editor() {
  let { roomId } = useParams();
  let location = useLocation();

  let name = location.state.name;

  return (
    <div>
      <h1>Editor</h1>
      <p>Room ID: {roomId}</p>
      <p>User: {name}</p>
    </div>
  );
}
export default Editor;
