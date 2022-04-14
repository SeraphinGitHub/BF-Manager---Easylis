
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


// =====================================================================
// Init Client
// =====================================================================
let socketList = {};
let playerList = {};
let playerID = 0;


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

   // ================================
   // Init Player
   // ================================
   socket.emit("initClient", player.id);

   // for(let i in playerList) {
   //    let player = playerList[i];
   //    let socket = socketList[player.id];
   //    socket.emit("initAllPlayers", player.id);
   // }
   

   // ================================
   // Chat
   // ================================
   // socket.on("generalMessage", (textMessage) => {
   //    for(let i in socketList) socketList[i].emit("addMessage_General", `${player.name}: ${textMessage}`);
   // });
}


// Player disconnection
const onDisconnect = (socket) => {

   for(let i in playerList) {
      let player = playerList[i];
      let socket = socketList[player.id];
      socket.emit("removePlayer", player);
   };
   
   delete playerList[socket.id];
}