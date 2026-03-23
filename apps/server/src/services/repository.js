import fs from "node:fs";
import path from "node:path";

export function createInMemoryRepository(seed = {}) {
  const initialRooms = seed.rooms ?? [];
  const initialSessions = seed.sessions ?? [];
  const rooms = new Map();
  const sessions = new Map();

  initialRooms.forEach((room) => {
    rooms.set(room.id, room);
  });
  initialSessions.forEach((session) => {
    sessions.set(session.token, session);
  });

  return {
    saveRoom(room) {
      rooms.set(room.id, room);
      return room;
    },
    getRoom(roomId) {
      return rooms.get(roomId) ?? null;
    },
    findRoomByCode(roomCode) {
      return Array.from(rooms.values()).find((room) => room.code === roomCode) ?? null;
    },
    listRooms() {
      return Array.from(rooms.values());
    },
    saveSession(session) {
      sessions.set(session.token, session);
      return session;
    },
    getSession(token) {
      return sessions.get(token) ?? null;
    },
    serialize() {
      return {
        rooms: Array.from(rooms.values()),
        sessions: Array.from(sessions.values())
      };
    },
    async cleanupRoomStorage() {
      return undefined;
    },
    async close() {
      return undefined;
    }
  };
}

export function createFileRepository(filePath) {
  const absolutePath = path.resolve(filePath);
  const folder = path.dirname(absolutePath);

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  let seed = {};
  if (fs.existsSync(absolutePath)) {
    try {
      seed = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
    } catch {
      seed = {};
    }
  }

  const repository = createInMemoryRepository(seed);

  function persist() {
    fs.writeFileSync(absolutePath, JSON.stringify(repository.serialize(), null, 2));
  }

  return {
    saveRoom(room) {
      const result = repository.saveRoom(room);
      persist();
      return result;
    },
    getRoom(roomId) {
      return repository.getRoom(roomId);
    },
    findRoomByCode(roomCode) {
      return repository.findRoomByCode(roomCode);
    },
    listRooms() {
      return repository.listRooms();
    },
    saveSession(session) {
      const result = repository.saveSession(session);
      persist();
      return result;
    },
    getSession(token) {
      return repository.getSession(token);
    },
    serialize() {
      return repository.serialize();
    },
    async cleanupRoomStorage(roomId, keepRoundNo) {
      await repository.cleanupRoomStorage(roomId, keepRoundNo);
      persist();
    },
    async close() {
      return repository.close();
    }
  };
}
