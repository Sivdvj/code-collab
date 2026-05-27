function UserList({ userlist }) {
  return (
    <div>
      Users
      {userlist.map((user) => (
        <div key={user.socketId}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: user.color,
            }}
          />
          {user.name}
        </div>
      ))}
    </div>
  );
}

export default UserList;
