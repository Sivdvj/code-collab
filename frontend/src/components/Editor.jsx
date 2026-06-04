import { useParams, useLocation, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import useSocket from "../hooks/useSocket";
import UserList from "./UserList";
import ToolBar from "./ToolBar";
import api from "../api";

function EditorPage() {
  let { roomId } = useParams();
  let location = useLocation();
  let navigate = useNavigate();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);
  const [editorReady, setEditorReady] = useState(false);
  let [output, setOutput] = useState("");

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
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    const newDecorations = Object.entries(cursor)
      .map(([socketId, pos]) => {
        if (socketId === mysocketId) return null;
        const user = users.find((u) => u.socketId === socketId);
        if (!user) return null;

        return {
          range: new monaco.Range(pos.line, pos.column, pos.line, pos.column),
          options: {
            className: `remote-cursor-${socketId}`,
            hoverMessage: { value: user.name },
          },
        };
      })
      .filter(Boolean);

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      newDecorations,
    );
  }, [cursor, users, mysocketId, editorReady]);

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

  let runCode = async () => {
    try {
      setOutput("Running...");

      let { data } = await api.post("/execute", {
        code,
        language: lang,
      });
      setOutput(data.stdout);
    } catch (error) {
      setOutput("Execution failed");
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-300">
      <style>
        {users
          .map(
            (user) => `
              .remote-cursor-${user.socketId} {
                border-left: 2px solid ${user.color || "#fff"};
                pointer-events: none;
              }
            `,
          )
          .join("\n")}
      </style>
      <div className="w-64 border-r border-zinc-800 p-4">
        <UserList
          userlist={users}
          mysocketId={mysocketId}
          kickUser={kickUser}
        />
      </div>
      <div className="flex flex-1 flex-col h-screen">
        <ToolBar
          user={name}
          language={lang}
          onLangChange={langChange}
          roomId={roomId}
          runCode={runCode}
        />
        <div className="flex flex-col flex-1">
          <div className="flex-4">
            <Editor
              height="100%"
              value={code}
              language={lang}
              theme="vs-dark"
              onChange={(val) => codeChange(val || "")}
              options={{ fontSize: 14, minimap: { enabled: false } }}
              onMount={(editor, monaco) => {
                editorRef.current = editor;
                monacoRef.current = monaco;
                setEditorReady(true);
                editor.onDidChangeCursorPosition((e) => {
                  cursorChange(e);
                });
              }}
            />
          </div>
          <div className="flex-1">
            <h2 className="font-bold tracking-wide text-lg">Output</h2>
            <div className="font-semibold">{output}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default EditorPage;
