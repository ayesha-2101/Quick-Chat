const dotenv = require("dotenv");
const express = require("express");
const handel = require("./middlewares/errorHandel");
const data = require("./dummyData/data");
const mongoDb = require("./config/db");
const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const messageRoutes = require("./Routes/messageRoutes");
const cors = require("cors");
const path = require("path");

dotenv.config();
mongoDb();
const app = express();

app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "frontend", "build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

app.use(handel);

const port = process.env.PORT || 5080;
const server = app.listen(
  port,
  console.log(`Server running on PORT ${port}...`)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});
io.on("connection", (socket) => {
  console.log("connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connection");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("userjoined roomm" + room);
  });
  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });
  socket.on("new message", (newMessage) => {
    var chat = newMessage.chat;
    if (!chat.users) return console.log("not defined users");
    chat.users.forEach((user) => {
      if (user._id === newMessage.sender._id) {
        return;
      }
      socket.in(user._id).emit("message recieved", newMessage);
    });
  });
  socket.off("setup", () => {
    console.log("disconnected");
    socket.leave(userData._id);
  });
});
