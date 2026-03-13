/**
 * Socket.io Service
 * Manages real-time connections for the Live Credential Radar
 */

exports.initSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on("join:radar", () => {
      socket.join("radar-room");
      console.log(`📡 Socket ${socket.id} joined radar-room`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};
