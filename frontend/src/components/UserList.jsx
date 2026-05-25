function UserList({ userlist, onLangChange }) {
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
