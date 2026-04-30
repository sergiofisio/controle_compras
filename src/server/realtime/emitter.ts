import type { Server as IOServer } from "socket.io";

declare global {
  var ioServerInstance: IOServer | undefined;
}

export function setIO(io: IOServer) {
  global.ioServerInstance = io;
}

export function getIO() {
  return global.ioServerInstance;
}
