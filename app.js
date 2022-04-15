
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
const GameSystem = require("./server/classes/GameSystem.js"); 
const Player = require("./server/classes/Player.js"); 
const NewGame = require("./server/classes/NewGame.js"); 
const RegEx = require("./server/classes/RegEx.js"); 


// =====================================================================
// Init Client
// =====================================================================
let socketList = {};
let playerList = {};
let playerID = 1;

const gameSystem = new GameSystem();
const regEx = new RegEx();


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
   socket.emit("initClient", { id: player.id, name: player.name});
   socket.emit("gamesList", gameSystem.initPack());

   
   // ========== Create New Game ==========
   socket.on("addNewGame", (gameName) => {
      if(gameName && regEx.normalText.test(gameName)) {

         const newGame = new NewGame(player.id, gameName);
         gameSystem.gamesArray.push(newGame);
         gameSystem.gamesCount++;
         
         serverSync(newGame);
      }
   });
   
   
   // ========== Change Player Name ==========
   socket.on("changeName", (playerName) => {
      if(playerName && regEx.normalText.test(playerName)) {
         
         player.name = playerName;
      }
   });


   // ========== Chat Message ==========
   socket.on("generalMessage", (message) => {
      if(message && regEx.specialText.test(message)) {
         for(let i in socketList) socketList[i].emit("addMessageToGeneral", `${player.name}: ${message}`);
      }
   });
}


// Player disconnection
const onDisconnect = (socket) => {
   
   delete playerList[socket.id];
}


// =====================================================================
// Server Sync
// =====================================================================
const serverSync = (newGame) => {

   for(let i in playerList) {

      let player = playerList[i];
      let socket = socketList[player.id];

      socket.emit("gamesList", {
         gamesArray: [newGame],
         gamesCount: gameSystem.gamesCount,
      });
   }
}