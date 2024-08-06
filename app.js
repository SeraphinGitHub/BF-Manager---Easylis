
"use strict"

require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


// =====================================================================
// Init Server
// =====================================================================
app.get("/", (req, res) => {
   res.sendFile(__dirname + "/client/index.html");
});

app.get("/wake", (req, res) => {
   res.status(200).send({ success: true, message: "BF Manager is starting !" });
});

app.use("/client", express.static(__dirname + "/client"));

server.listen(process.env.PORT || 3000, () => {
   console.log(`Listening on port ${process.env.PORT}`);
});


// =====================================================================
// Init Client
// =====================================================================
let socketList = {};
let playerList = {};
let counterID = 1;

const GameSystem = require("./server/classes/GameSystem.js"); 
const gameSystem = new GameSystem(playerList, socketList);
gameSystem.initDB();


// Server Connection
io.on("connection", (socket) => {
   // console.log("User connected !");

   // ==========  Generate ID  ==========
   socket.id = counterID++;
   socketList[socket.id] = socket;
   onConnect(socket);

   // ==========  Disconnection  ==========
   socket.on("disconnect", () => {
      // console.log("User disconnected !");
      onDisconnect(socket);
      delete socketList[socket.id];
   });
});


// Player connection
const onConnect = (socket) => {
   
   // ========== Init Player ==========
   gameSystem.createNewPlayer(socket);
   
   
   // ========== Game States ==========
   socket.on("createGame", (gameName) => gameSystem.createNewGame(socket, gameName));
   socket.on("deleteGame", (deleteObj) => gameSystem.deleteGame(socket, deleteObj));
   socket.on("enterGame", (enterObj) => gameSystem.enterGame(enterObj));
   socket.on("leaveGame", (leaveObj) => gameSystem.leaveGame(leaveObj, socket));
   socket.on("killGame", (killObj) => gameSystem.killGame(killObj, socket));
   

   // ========== Change Player Name ==========
   socket.on("changeName", (nameObj) => gameSystem.changeName(socket, nameObj));
   socket.on("adminDeletePlayer", (playerName) => gameSystem.deletePlayer(socket, playerName));


   // ========== Chat Message ==========
   socket.on("generalMessage", (messageObj) => gameSystem.generalChat(messageObj));
   socket.on("privateMessage", (messageObj) => gameSystem.privateChat(socket, messageObj));
}


// Player disconnection
const onDisconnect = (socket) => {
   
   delete playerList[socket.id];
   gameSystem.serverSync();
};