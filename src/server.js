const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const Redis = require("ioredis");
const bodyParser = require("body-parser");

const redisCache = new Redis({
  host: "redis",
  port: 6379,
});

const app = express();

app.use(bodyParser.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("getConnectionId", async (userId) => {
    const connId = await redisCache.get(userId);
    console.log("Getting connection id for user", userId, connId);
    socket.emit("connectionId", connId);
  });
});

app.post("/sendPayload", async (req, res) => {
  if (!userId || !payload) {
    return res.sendStatus(400).send("Bad request");
  }

  const socketId = await redisCache.get(userId);
  if (!socketId) {
    return res.sendStatus(404).send("Bad request");
  }
});

httpServer.listen(3000, () => {
  console.log("listening on *:3000");
});
