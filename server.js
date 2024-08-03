const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = new Map(); // Track users and their respective sockets

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle user setting their username
  socket.on("setUsername", (username) => {
    socket.username = username;
    users.set(username, socket.id);
    io.emit("userList", Array.from(users.keys()));
  });

  // Handle sending messages
  socket.on("sendMessage", (message) => {
    const { text, image, to } = message;
    const sender = socket.username;

    if (to) {
      // Send to a specific recipient
      const recipientSocketId = users.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receiveMessage", {
          text,
          image,
          sender,
        });
      }
    } else {
      // Broadcast to all users
      io.emit("receiveMessage", { text, image, sender });
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    users.delete(socket.username);
    io.emit("userList", Array.from(users.keys()));
    console.log("User disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
