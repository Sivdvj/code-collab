import { Icon } from "@iconify/react";
function UserList({ userlist, mysocketId, kickUser }) {
  let me = userlist.find((u) => u.socketId === mysocketId);
  let owner = me?.isOwner;

  return (
    <div>
      <div className="uppercase tracking-wider font-bold mb-4">
        Collaborators ({userlist.length})
      </div>
      <div className="space-y-3">
        {userlist.map((user) => (
          <div
            key={user.socketId}
            className="flex items-center justify-between rounded-lg bg-zinc-900 p-2"
          >
            <div className="flex gap-3 items-center">
              <div
                className="w-5 h-5 rounded-full"
                style={{ background: user.color }}
              />
              <div>{user.name}</div>
            </div>
            {user.isOwner && (
              <Icon icon="lucide:crown" className="w-5 h-5 text-amber-300" />
            )}
            {owner && user.socketId !== mysocketId && (
              <button onClick={() => kickUser(user.socketId)}>
                <Icon
                  icon="pepicons-pop:leave"
                  className="w-5 h-5 text-rose-400"
                />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;
