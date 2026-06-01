let roomManager;

beforeEach(async () => {
  vi.resetModules();
  roomManager = await import("./src/roomManager.js");
});

let create = (
  roomId = "room1",
  socketId = "s-abc",
  username = "USER1",
  userId = "u-001",
) => roomManager.createRoom(roomId, socketId, username, userId);

let join = (
  roomId = "room1",
  socketId = "s-xyz",
  username = "USER2",
  userId = "u-002",
) => roomManager.joinRoom(roomId, socketId, username, userId);

describe("createRoom", () => {
  it("creates a room with correct initial state", () => {
    let res = create();
    expect(res.error).toBeUndefined();
    expect(res.room.code).toBe("// Start coding");
    expect(res.room.language).toBe("javascript");
    expect(res.room.users).toHaveLength(2);
  });

  it("sets the creator as the room owner", () => {
    let res = create("room1", "s-abc", "USER1", "u-001");
    expect(res.room.owner).toBe("u-001");
    expect(res.room.users[0].isOwner).toBe(true);
  });

  it("returns error if room already exists", () => {
    create("room1");
    let res = create("room1"); // try again
    expect(res.error).toBe("Room already exists");
    expect(res.room).toBeUndefined();
  });

  it("two different rooms can be created independently", () => {
    create("room1", "s-abc", "USER1", "u-001");
    let res2 = create("room2", "s-xyz", "USER2", "u-002");
    expect(res2.error).toBeUndefined();
    expect(res2.room.users[0].name).toBe("USER2");
  });
});

describe("joinRoom", () => {
  it("returns error if room does not exist", () => {
    let res = join("nonexistent-room");
    expect(res.error).toBe("Room does not exist");
    expect(res.room).toBeUndefined();
  });

  it("joins an existing room successfully", () => {
    create();
    let res = join();
    expect(res.error).toBeUndefined();
    expect(res.room.users).toHaveLength(2);
  });

  it("preserves existing code when a new user joins", () => {
    create();
    roomManager.updateCode("room1", "function hello() {}");
    let res = join();
    expect(res.room.code).toBe("function hello() {}");
  });

  it("new user is not marked as owner", () => {
    create("room1", "s-abc", "USER1", "u-001");
    let res = join("room1", "s-xyz", "USER2", "u-002");
    let USER2 = res.room.users.find((u) => u.socketId === "s-xyz");
    expect(USER2.isOwner).toBe(false);
  });

  it("multiple users can join the same room", () => {
    create();
    join("room1", "s-xyz", "USER2", "u-002");
    let res = roomManager.joinRoom("room1", "s-third", "USER3", "u-003");
    expect(res.room.users).toHaveLength(3);
  });
});

describe("leaveRoom", () => {
  it("returns null for unknown socketId", () => {
    let res = roomManager.leaveRoom("socket-ghost");
    expect(res).toBeNull();
  });

  it("removes user from room and returns roomId and name", () => {
    create("room1", "s-abc", "USER1", "u-001");
    let res = roomManager.leaveRoom("s-abc");
    expect(res).not.toBeNull();
    expect(res.roomId).toBe("room1");
    expect(res.name).toBe("USER1");
  });

  it("user left is no longer in the room", () => {
    create("room1", "s-abc", "USER1", "u-001");
    join("room1", "s-xyz", "USER2", "u-002");
    roomManager.leaveRoom("s-xyz");
    let res = roomManager.joinRoom("room1", "s-third", "USER3", "u-003");
    expect(res.room.users).toHaveLength(2);
  });
});

describe("updateCode", () => {
  it("updates the code in a room", () => {
    create();
    roomManager.updateCode("room1", "let x = 42;");
    let res = join();
    expect(res.room.code).toBe("let x = 42;");
  });
});

describe("updateLanguage", () => {
  it("updates the language in a room", () => {
    create();
    roomManager.updateLanguage("room1", "python");
    let res = join();
    expect(res.room.language).toBe("python");
  });
});

describe("updateCursor", () => {
  it("updates cursor position for a connected user", () => {
    create("room1", "s-abc", "USER1", "u-001");
    roomManager.updateCursor("room1", "s-abc", { line: 10, column: 5 });
    let res = join();
    let USER1 = res.room.users.find((u) => u.socketId === "s-abc");
    expect(USER1.cursor).toEqual({ line: 10, column: 5 });
  });
});

describe("kickUser", () => {
  it("returns null if kicker is not the owner", () => {
    create("room1", "s-owner", "USER1", "u-owner");
    join("room1", "s-member", "USER2", "u-member");
    let res = roomManager.kickUser("room1", "s-member", "s-owner");
    expect(res).toBeNull();
  });

  it("owner can kick a member", () => {
    create("room1", "s-owner", "USER1", "u-owner");
    join("room1", "s-member", "USER2", "u-member");
    let kicked = roomManager.kickUser("room1", "s-owner", "s-member");
    expect(kicked).not.toBeNull();
    expect(kicked.name).toBe("USER2");
  });

  it("kicked user is removed from room", () => {
    create("room1", "s-owner", "USER1", "u-owner");
    join("room1", "s-member", "USER2", "u-member");
    roomManager.kickUser("room1", "s-owner", "s-member");
    let res = join("room1", "s-new", "USER3", "u-003");
    let names = res.room.users.map((u) => u.name);
    expect(names).not.toContain("USER2");
    expect(names).toContain("USER1");
  });
});

describe("hasRoom", () => {
  it("returns false for non-existent room", () => {
    expect(roomManager.hasRoom("ghost")).toBe(false);
  });

  it("returns true after room is created", () => {
    create();
    expect(roomManager.hasRoom("room1")).toBe(true);
  });
});
