const rooms = new Map();

export const joinRoom = (roomId, user) => {
  if (!rooms.has(roomId)) rooms.set(roomId, new Map());
  rooms.get(roomId).set(user.id, user);
  return getUsers(roomId);
};

export const leaveRoom = (roomId, userId) => {
  if (rooms.has(roomId)) {
    rooms.get(roomId).delete(userId);
    if (rooms.get(roomId).size === 0) rooms.delete(roomId);
  }
  return getUsers(roomId);
};

export const getUsers = (roomId) => {
  if (!rooms.has(roomId)) return [];
  return Array.from(rooms.get(roomId).values());
};