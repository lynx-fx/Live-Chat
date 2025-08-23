require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const authRouter = require("./routes/authRouter");

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

app.listen(process.env.PORT || 3000, () => {
  console.log(
    `Server is running on port ${process.env.PORT} & serving to ${frontend}`
  );
});
