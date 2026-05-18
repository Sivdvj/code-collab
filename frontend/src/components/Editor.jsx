import { useParams, useLocation } from "react-router";
import Editor from "@monaco-editor/react";
import useSocket from "../hooks/useSocket";

function EditorPage() {
  let { roomId } = useParams();
  let location = useLocation();

  let name = location.state.name;

  let { code, lang, users, joined, codeChange } = useSocket(roomId, name);
  if (!joined) return <div>Connecting....</div>;

  return (
    <div>
      <h1>Editor</h1>
      <p>Room ID: {roomId}</p>
      <p>User: {name}</p>
      <Editor
        height="90vh"
        value={code}
        language={lang}
        theme="vs-dark"
        onChange={(val) => codeChange(val || "")}
        options={{ fontSize: 14, minimap: { enabled: false } }}
      />
    </div>
  );
}
export default EditorPage;
