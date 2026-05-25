function UserList({ userlist }) {
  return (
    <div>
      Users
      {userlist.map((user) => (
        <div key={user.socketId}>{user.name}</div>
      ))}
    </div>
  );
}

export default UserList;
