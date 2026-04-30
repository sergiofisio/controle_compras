import { Server as IOServer } from "socket.io";
import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "@/server/realtime/types";
import { setIO } from "@/server/realtime/emitter";

export const config = { api: { bodyParser: false } };

export default function handler(_req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server as any, { path: "/api/socket_io" });
    io.on("connection", (socket) => {
      socket.on("join-list", (listId: string) => socket.join(listId));
      socket.on("leave-list", (listId: string) => socket.leave(listId));
    });
    res.socket.server.io = io;
    setIO(io);
  }
  res.end();
}
