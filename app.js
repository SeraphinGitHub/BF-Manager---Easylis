
"use strict"

require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
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
// Init Client
// =====================================================================
let socketList = {};
let clientList = {};
let clientID = 0;

io.on("connection", (socket) => {
   // console.log("User connected !");

   // ==========  Generate ID  ==========
   socket.id = clientID++;
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
   // socket.on("send_initClient", (data) =>  {
   //    socket.emit("received_initClient", player.id);

   //    for(let i in playerList) {
   //       let player = playerList[i];
   //       let socket = socketList[player.id];
   //       socket.emit("initPlayerPack", initPack_PlayerList);
   //    }
   // });
   

   // ================================
   // Chat
   // ================================
   // socket.on("generalMessage", (textMessage) => {
   //    for(let i in socketList) socketList[i].emit("addMessage_General", `${player.name}: ${textMessage}`);
   // });
}

// Client disconnection
const onDisconnect = (socket) => {

   // let client = clientList[socket.id];
   
   // for(let i in clientList) {
   //    let socket = socketList[client.id];
   //    socket.emit("removeClient", data);
   // };
   
   // delete clientList[socket.id];
}