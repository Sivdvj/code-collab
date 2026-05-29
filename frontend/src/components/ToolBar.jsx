function ToolBar({ language, onLangChange, userCount, roomId }) {
  return (
    <div>
      <div>Room ID: {roomId}</div>
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
