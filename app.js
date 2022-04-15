
"use strict"

require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


// =====================================================================
// App init
// =====================================================================
app.get("/", (req, res) => {
   res.sendFile(__dirname + "/client/index.html");
});

app.use("/client", express.static(__dirname + "/client"));

server.listen(process.env.PORT || 3000, () => {
   console.log(`Listening on port ${process.env.PORT}`);
});


// =====================================================================
// Import Files
// =====================================================================
const Player = require("./server/classes/Player.js"); 
const OneGame = require("./server/classes/OneGame.js"); 
const GameSystem = require("./server/classes/GameSystem.js"); 


// =====================================================================
// Init Client
// =====================================================================
let socketList = {};
let playerList = {};
let playerID = 0;

const gameSystem = new GameSystem();


// Server Connection
io.on("connection", (socket) => {
   // console.log("User connected !");

   // ==========  Generate ID  ==========
   socket.id = playerID++;
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

   const player = new Player(socket.id);
   playerList[socket.id] = player;
   player.name = `Joueur ${player.id}`;

   
   // ========== Init Player ==========
   socket.emit("initClient", player.name);
   
   socket.on("addNewGame", (gameName) => {

      const oneGame = new OneGame(gameName);
      gameSystem.gamesList[player.id] = oneGame;
      gameSystem.gamesCount++;

      serverSync();
   });
   


   // ========== Chat ==========
   // socket.on("generalMessage", (textMessage) => {
   //    for(let i in socketList) socketList[i].emit("addMessage_General", `${player.name}: ${textMessage}`);
   // });
}


// Player disconnection
const onDisconnect = (socket) => {
   
   delete playerList[socket.id];
}


// =====================================================================
// Server Sync
// =====================================================================
const serverSync = () => {

   for(let i in playerList) {

      let player = playerList[i];
      let socket = socketList[player.id];
      socket.emit("gamesList", gameSystem.syncPack());
   }
}