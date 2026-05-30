function ToolBar({ user, language, onLangChange, userCount, roomId }) {
  let copyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    alert("Room ID copied!");
  };
  return (
    <div>
      <div>username: {user}</div>
      <div>
        Room ID: {roomId}
        <button onClick={() => copyRoomId()}>Copy</button>
      </div>
      <div>{userCount} users</div>
      <select value={language} onChange={(e) => onLangChange(e.target.value)}>
        <option value="javascript">JS</option>
        <option value="python">Python</option>
        <option value="cpp">C++</option>
        <option value="java">Java</option>
      </select>
    </div>
  );
}
export default ToolBar;
