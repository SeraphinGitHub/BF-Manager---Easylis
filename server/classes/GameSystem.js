
"use strict"

const DataBase = require("./DataBase.js");
const Player = require("./Player.js");
const RegEx = require("./RegEx.js");

class GameSystem extends DataBase {

   constructor(playerList, socketList) {
      super();
      this.playerList = playerList;
      this.socketList = socketList;
      this.regEx = new RegEx();
   }

   // New Player
   createNewPlayer(socket) {

      const player = new Player(socket.id);
      this.playerList[socket.id] = player;
      player.name = `Joueur ${socket.id}`;

      const sql = `INSERT INTO players (
         id,
         name,
         created_at,
         updated_at)
         
         VALUES (
         '${socket.id}',
         '${player.name}',
         CURRENT_TIMESTAMP,
         CURRENT_TIMESTAMP)
         
         ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         created_at = EXCLUDED.created_at,
         updated_at = EXCLUDED.updated_at
      `;
      
      this.runQuery(sql)
      .then(() => {
         socket.emit("initClient", {
            id: player.id,
            name: player.name,
         });
         
         socket.emit("gamesList", {
            gamesArray: this.gamesArray,
            gamesCount: this.gamesCount,
         });

         this.serverSync();

      }).catch((err) => console.log(err));
   }

   // Game States
   createNewGame(socket, gameObj) {

      if(gameObj.playerID && typeof(gameObj.playerID) === "number"
      && gameObj.gameName && this.regEx.normalText.test(gameObj.gameName)) {

         const sql = `INSERT INTO games (
            name,
            player_id,
            connected_players,
            created_at,
            updated_at)
            
            VALUES (
            '${gameObj.gameName}',
            '${gameObj.playerID}',
            '{}',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
         )`;
         
         const errorMessage = "Cette partie existe déja !";

         this.runQuery(sql)
         .then(() => {
            socket.emit("newGameSuccess");
            this.serverSync();

         }).catch(() => socket.emit("newGameDenied", (errorMessage)));
      }
   }

   deleteGame(socket, deleteObj) {
      
      if(deleteObj.playerID && typeof(deleteObj.playerID) === "number"
      && deleteObj.tagID && typeof(deleteObj.tagID) === "number"
      && deleteObj.name && this.regEx.normalText.test(deleteObj.name)
      && deleteObj.playerName && this.regEx.normalText.test(deleteObj.playerName)) {

         if(deleteObj.playerID === deleteObj.tagID
         || deleteObj.playerName === process.env.ADMIN_PLAYER_NAME) {

            const sql = `
               DELETE FROM games WHERE
               name = '${deleteObj.name}'
            `;
   
            this.runQuery(sql)
            .then(() => {

               socket.emit("deleteGameSuccess");
               this.serverSync();
               this.emitToAllSockets("clearTagsArrays", deleteObj.name);

            }).catch((err) => console.log(err));
         }
      }
   }

   enterGame(enterObj) {

      if(enterObj.playerID && typeof(enterObj.playerID) === "number"
      && enterObj.playerName && this.regEx.normalText.test(enterObj.playerName)
      && enterObj.gameName && this.regEx.normalText.test(enterObj.gameName)) {
         
         let sql = `SELECT connected_players, status FROM games WHERE name = '${enterObj.gameName}'`;

         // Get this Game's connectedPlayers Array
         this.runQuery(sql)
         .then((res) => {

            const socket = this.socketList[enterObj.playerID];
            let gameStatus = res[0].status;
            let playersArray = res[0].connected_players;

            // Can join Game if less than 2 players && if !include joining playerID 
            if(gameStatus
            && playersArray.length < 2
            && !playersArray.includes(enterObj.playerID)) {

               // If no player connected
               if(playersArray.length === 0) {
                  const index = 1;
                  this.updatePlayersArray(index, enterObj.playerID, enterObj.gameName);
               }

               // If already has player Connected
               else {
                  const index = 2;
                  const otherPlayerID = playersArray[0];

                  sql = `SELECT name FROM players WHERE id = '${otherPlayerID}'`;

                  // Get other player's name
                  this.runQuery(sql)
                  .then((res) => {

                     this.updatePlayersArray(index, enterObj.playerID, enterObj.gameName);
                     
                     const otherPlayerName = res[0].name;
                     const otherSocket = this.socketList[otherPlayerID];

                     socket.emit("otherPlayerJoined", (otherPlayerName));
                     otherSocket.emit("otherPlayerJoined", (enterObj.playerName));

                  }).catch((err) => console.log(err));
               }
            }
            
            // If Game is full || ended
            else if(gameStatus) {
               const errorMessage = "Partie déjà complète";

               socket.emit("joinGameDenied", ({
                  message: errorMessage,
                  gameName: enterObj.gameName,
               }));
            }

         }).catch((err) => console.log(err));
      }
   }

   updatePlayersArray(index, playerID, gameName) {

      let sql = `
         UPDATE games SET
         connected_players[${index}] = '${playerID}'
         WHERE name = '${gameName}'
      `;

      // Add Joining PlayerID to connectedPlayers Array
      this.runQuery(sql)
      .then(() => {

         const socket = this.socketList[playerID];
         socket.emit("joinGameSuccess");
         this.serverSync();

      }).catch((err) => console.log(err));
   }
   
   leaveGame(leaveObj, socket) {

      if(leaveObj.gameName && this.regEx.normalText.test(leaveObj.gameName)
      && leaveObj.playerName && this.regEx.normalText.test(leaveObj.playerName)
      && leaveObj.playerID && typeof(leaveObj.playerID) === "number") {
   
         let sql = `
            UPDATE games SET
            connected_players = ARRAY_REMOVE(connected_players, ${leaveObj.playerID})
            WHERE name = '${leaveObj.gameName}'
         `;

         // Remove leaving player index
         this.runQuery(sql)
         .then(() => {

            sql = `SELECT connected_players FROM games WHERE name = '${leaveObj.gameName}'`;
            
            // Get connected_players Array
            this.runQuery(sql)
            .then((res) => {

               const otherPlayerID = res[0].connected_players[0];
               const otherSocket = this.socketList[otherPlayerID];

               socket.emit("leaveGameSuccess");
               if(otherSocket) otherSocket.emit("otherPlayerLeave");
               this.serverSync();

            }).catch((err) => console.log(err));
         }).catch((err) => console.log(err));
      }
   }

   killGame(killObj, socket) {
      
      if(killObj.gameName && this.regEx.normalText.test(killObj.gameName)
      && killObj.otherPlayerName && this.regEx.normalText.test(killObj.otherPlayerName)) {

         let sql = `
            UPDATE games SET status = false,
            connected_players = '{}',
            updated_at = CURRENT_TIMESTAMP
            WHERE name = '${killObj.gameName}'
         `;

         // Update Game Status
         this.runQuery(sql)
         .then(() => {

            sql = `SELECT id FROM players WHERE name = '${killObj.otherPlayerName}'`;
            
            // Get other PlayerID
            this.runQuery(sql)
            .then((res) => {

               const otherPlayerID = res[0].id;
               const otherSocket = this.socketList[otherPlayerID];

               socket.emit("killGameSuccess");
               otherSocket.emit("killGameSuccess");
               this.serverSync();
               
            }).catch((err) => {
               
               if(err) {
                  socket.emit("killGameSuccess");
                  this.serverSync();
               }
            });

         }).catch((err) => console.log(err));
      }
   }

   // Change Player Name
   changeName(socket, nameObj) {
      
      if(nameObj.oldName && this.regEx.normalText.test(nameObj.oldName)
      && nameObj.newName && this.regEx.normalText.test(nameObj.newName)) {

         const sql = `UPDATE players SET
            name = '${nameObj.newName}',
            updated_at = CURRENT_TIMESTAMP
            WHERE name = '${nameObj.oldName}'
         `;

         const errorMessage = "Ce nom est déjà pris !";

         // If Normal Player Name
         if(nameObj.newName !== process.env.ADMIN_PLAYER_NAME) {

            this.runQuery(sql)
            .then(() => {

               for(let i in this.playerList) {
                  let player = this.playerList[i];
                  if(player.name === nameObj.oldName) player.name = nameObj.newName;
               }

               socket.emit("changeNameSuccess");

               this.emitToAllSockets("updateName", {
                  oldName: nameObj.oldName,
                  newName: nameObj.newName,
               });

            }).catch(() => socket.emit("changeNameDenied", (errorMessage)))
         }

         // If Admin Player Name
         else {
            let sql = `SELECT name FROM players`;

            this.runQuery(sql)
            .then((res) => {

               const playersNameArray = [];

               res.forEach(pair => playersNameArray.push(pair.name));

               socket.emit("changeNameSuccess");
               socket.emit("adminModeSuccess", (playersNameArray));

            }).catch((err) => console.log(err));
         }
      }
   }

   deletePlayer(socket, playerName) {

      if(playerName && this.regEx.normalText.test(playerName)) {
         
         const sql = `
            DELETE FROM players WHERE
            name = '${playerName}'
         `;
   
         this.runQuery(sql)
         .then(() => socket.emit("deletePlayerSuccess"))
         .catch((err) => console.log(err));
      }
   }

   // Chat
   generalChat(messageObj) {

      if(messageObj.playerName && this.regEx.normalText.test(messageObj.playerName)
      && messageObj.message && this.regEx.specialText.test(messageObj.message)) {
         
         for(let i in this.socketList) {
            this.socketList[i].emit("addMessageToGeneral", `${messageObj.playerName}: ${messageObj.message}`);
         }
      }
   }

   privateChat(socket, messageObj) {

      if(messageObj.playerName && this.regEx.normalText.test(messageObj.playerName)
      && messageObj.otherPlayerName && this.regEx.normalText.test(messageObj.otherPlayerName)
      && messageObj.message && this.regEx.specialText.test(messageObj.message)) {

         if(messageObj.playerName !== messageObj.otherPlayerName) {

            let sql = `SELECT id FROM players WHERE name = '${messageObj.otherPlayerName}'`;
   
            this.runQuery(sql)
            .then((res) => {
   
               const prefix = "A > ";
               const otherPlayerID = res[0].id;
               let otherSocket = this.socketList[otherPlayerID];
               
               if(otherSocket) {
                  otherSocket.emit("addMessageToPrivate", `${messageObj.playerName}: ${messageObj.message}`);
                  socket.emit("addMessageToPrivate", `${prefix}${messageObj.otherPlayerName}: ${messageObj.message}`);
               }
               else socket.emit("addMessageToPrivate", `>${messageObj.otherPlayerName}< Est déconnecté !`);
   
            }).catch(() => {
               socket.emit("addMessageToPrivate", `>${messageObj.otherPlayerName}< Est déconnecté !`);
            });
         }
      }
   }

   dateFormat(dateDB) {
   
      const fullDateString = dateDB.toLocaleString("fr-FR", { timeZone: "Europe/Paris" });

      const dateString = fullDateString.split(", ")[0];
      const timeString = fullDateString.split(", ")[1];

      return `${dateString} à ${timeString}`;
   }
   
   // Server Sync
   serverSync() {

      let sql = `SELECT * FROM games`;

      // Get all games in DB
      this.runQuery(sql)
      .then((allGames) => {

         let gamesArray = [];
         let playersName = [];
         let gamesCount = 0;


         // Count only running Games + Format Dates
         allGames.forEach(game => {
            if(game.status === true) gamesCount++;

            gamesArray.push({
               ...game,
               created_at: this.dateFormat(game.created_at),
               updated_at: this.dateFormat(game.updated_at),
            });
         });


         // Set all connected players name inside an array
         for(let i in this.playerList) {
            let player = this.playerList[i];
            playersName.push(player.name);
         }         

         this.emitToAllSockets("gamesList", {
            gamesArray: gamesArray,
            gamesCount: gamesCount,
            playersName: playersName,
         });

      }).catch((err) => console.log(err));
   }

   emitToAllSockets(channel, emitObj) {

      // Send server data to all clients
      for(let i in this.playerList) {

         let player = this.playerList[i];
         let socket = this.socketList[player.id];

         socket.emit(channel, emitObj);
      }
   }
}

module.exports = GameSystem;