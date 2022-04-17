
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

app.use("/client", express.static(__dirname + "/client"));

server.listen(process.env.PORT || 3000, () => {
   console.log(`Listening on port ${process.env.PORT}`);
});


// =====================================================================
// Init Client
// =====================================================================
const GameSystem = require("./server/classes/GameSystem.js"); 
const gameSystem = new GameSystem();
gameSystem.initDB();

let socketList = {};
let playerList = {};
let counterID = 1;


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
   gameSystem.createNewPlayer(socket, playerList);
   serverSync();
   
   // ========== Game States ==========
   socket.on("createGame", (gameName) => gameSystem.createNewGame(socket, serverSync, gameName));
   socket.on("deleteGame", (deleteObj) => gameSystem.deleteGame(socket, serverSync, deleteObj));
   socket.on("enterGame", (clientGame) => gameSystem.enterGame(clientGame, socket));
   socket.on("quitGame", (clientGame) => gameSystem.quitGame(clientGame));
   

   // ========== Change Player Name ==========
   socket.on("changeName", (nameObj) => gameSystem.changeName(socket, nameObj));


   // ========== Chat Message ==========
   socket.on("generalMessage", (message) => gameSystem.generalChat(message, socketList));
}


// Player disconnection
const onDisconnect = (socket) => delete playerList[socket.id];


// =====================================================================
// Server Sync
// =====================================================================
const serverSync = () => {

   const sql = `SELECT * FROM games`;

   // Get all games
   gameSystem.conn.query(sql, (err, res) => {
      if(err) console.log(err);

      let responseArray = res.rows;
      let gamesCount = 0;
      
      // Count only running Games
      responseArray.forEach(game => { if(game.status === true) gamesCount++ });

      // Send server data to all clients
      for(let i in playerList) {
         let player = playerList[i];
         let socket = socketList[player.id];

         socket.emit("gamesList", {
            gamesArray: responseArray,
            gamesCount: gamesCount,
         });
      }
   });
}