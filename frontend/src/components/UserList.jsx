function UserList({ userlist, mysocketId, kickUser }) {
  let me = userlist.find((u) => u.socketId === mysocketId);
  let owner = me?.isOwner;

  return (
    <div>
      Users
      {userlist.map((user) => (
        <div key={user.socketId} style={{ display: "flex" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: user.color,
            }}
          />
          {user.name}
          {user.isOwner && <span>Owner</span>}
          {owner && user.socketId !== mysocketId && (
            <button onClick={() => kickUser(user.socketId)}>Kick</button>
          )}
        </div>
      ))}
    </div>
  );
}

export default UserList;
