require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server, Socket } = require("socket.io");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const messageRouter = require("./routes/messageRouter");
const { setUserOnline, setUserOffline } = require("./services/userServices");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const frontend =
  process.env.NODE_ENV === "production"
    ? process.env.FRONT_END_HOSTED
    : process.env.FRONT_END_LOCAL;

const app = express();
app.use(
  cors({
    origin: frontend,
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: frontend,
    credentials: true,
  },
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error("Database connection error: ", err);
  });

app.get("/", (req, res) => {
  res.json({ message: "Hiee ;)" });
});

app.get("/ping", (req, res) => {
  res.status(200).json({ message: "pong" });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);

const onlineUsers = new Map();
io.on("connection", async (socket) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.auth;
    if (!token) {
      return socket.disconnect();
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decode.id;
    onlineUsers.set(userId, socket.id);
    await setUserOnline(userId);

    io.emit("userStatusUpdate", { userId, status: "online" });
    socket.on("message", (to, message) => {
      if (!onlineUsers.has(to)) {
        return;
      }
      const receiverSocket = onlineUsers.get(to);
      if (receiverSocket) {
        io.to(receiverSocket).emit("message", {
          from: userId,
          message,
          createdAt: new Date(),
        });
      }
    });
    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);
      await setUserOffline(decode.id);
      io.emit("userStatusUpdate", { userId, status: "offline" });
    });
  } catch (err) {
    console.log("Socket auth error: ", err);
    // io.emit("userStatusUpdate", { userId, status: "offline" });
    socket.disconnect();
  }
});

server.listen(process.env.PORT || 3000, () => {
  console.log(
    `Server is running on port ${process.env.PORT} & serving to ${frontend}`
  );
});
