
"use strict"

const initClient = (socket) => {
   
   // socket.on("initClient", (playerID) => {
   //    console.log(playerID); // ******************************************************
   // });
}


// =====================================================================
// Init Game Handler
// =====================================================================
window.addEventListener("load", () => {

   const socket = io();

   initMenu(socket);
   initClient(socket);
   initChat(socket);
});