import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export async function ensureSocket() {
  if (!socket) {
    await fetch("/api/socket");
    socket = io({ path: "/api/socket_io" });
  }
  return socket;
}
