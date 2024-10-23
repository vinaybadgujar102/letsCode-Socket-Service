const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const Redis = require("ioredis");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
const httpServer = createServer(app);

const redisCache = new Redis();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected " + socket.id);
  socket.on("setUserId", (userID) => {
    console.log("Setting user id to connection id", userID, socket.id);
    redisCache.set(userID, socket.id);
  });

  socket.on("getConnectionId", async (userID) => {
    const connId = await redisCache.get(userID);
    console.log("Getting connection id for user id", userID, connId);
    socket.emit("connectionId", connId);
    const everything = await redisCache.keys("*");

    console.log(everything);
  });
});

app.post("/sendPayload", async (req, res) => {
  console.log("here: ", req.body);
  const { userID, payload } = req.body;
  console.log("Sending payload to user", userID, payload);

  if (!userID || !payload) {
    return res.status(400).send("Invalid request");
  }
  const socketId = await redisCache.get(userID);
  console.log("socket id: ", socketId);

  if (socketId) {
    io.to(socketId).emit("submissionPayloadResponse", payload);
    console.log("payload sent: ", payload);

    return res.send("Payload sent successfully");
  } else {
    return res.status(404).send("User not connected");
  }
});

httpServer.listen(3001, () => {
  console.log("Server is running on port 3001");
});
