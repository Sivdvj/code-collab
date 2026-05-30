import { useParams, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import Editor from "@monaco-editor/react";
import useSocket from "../hooks/useSocket";
import UserList from "./UserList";
import ToolBar from "./ToolBar";

function EditorPage() {
  let { roomId } = useParams();
  let location = useLocation();
  let navigate = useNavigate();

  let name = location.state.name;
  let action = location.state.action;

  let {
    code,
    lang,
    users,
    joined,
    cursor,
    codeChange,
    langChange,
    cursorChange,
    error,
    mysocketId,
    kickUser,
  } = useSocket(roomId, name, action);

  useEffect(() => {
    if (joined && action === "create") {
      navigate(location.pathname, {
        replace: true,
        state: { ...location.state, action: "join" },
      });
    }
  }, [joined]);

  if (error) return <div>Error: {error}</div>;
  if (!joined) return <div>Connecting....</div>;

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      <div className="w-64 border-r border-zinc-800 p-4">
        <UserList
          userlist={users}
          mysocketId={mysocketId}
          kickUser={kickUser}
        />
      </div>
      <div className="flex flex-1 flex-col">
        <ToolBar
          user={name}
          language={lang}
          onLangChange={langChange}
          userCount={users.length}
          roomId={roomId}
        />
        <div className="flex-1">
          <Editor
            height="100%"
            value={code}
            language={lang}
            theme="vs-dark"
            onChange={(val) => codeChange(val || "")}
            options={{ fontSize: 14, minimap: { enabled: false } }}
            onMount={(editor) => {
              editor.onDidChangeCursorPosition((e) => {
                cursorChange(e);
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
export default EditorPage;
