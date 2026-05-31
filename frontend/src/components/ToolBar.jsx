import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

function ToolBar({ user, language, onLangChange, roomId }) {
  let copyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied");
  };
  return (
    <div className="flex items-center border-b border-zinc-800 p-4 justify-between">
      <div className="flex gap-2 items-center font-bold">
        Username: <p className="tracking-wider uppercase">{user}</p>
      </div>
      <div className="flex gap-2 items-center">
        <div className="font-bold tracking-wider">Room:</div>
        <button
          onClick={() => copyRoomId()}
          className="flex gap-2 items-center cursor-pointer rounded-lg border-2 border-zinc-500/60 bg-zinc-900 p-2 font-bold tracking-wider"
        >
          {roomId}
          <Icon icon="mage:copy-fill" className="w-7 h-7 text-zinc-300" />
        </button>
      </div>
      <div className="flex gap-2 items-center">
        <div className="font-bold tracking-wider">Language:</div>
        <select
          className="rounded-lg bg-zinc-900 p-2 border-2 border-zinc-500/60"
          value={language}
          onChange={(e) => onLangChange(e.target.value)}
        >
          <option value="javascript">JS</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
      </div>
    </div>
  );
}
export default ToolBar;
