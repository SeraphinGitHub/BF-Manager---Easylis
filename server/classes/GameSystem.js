
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
         name,
         created_at,
         updated_at)
         
         VALUES (
         '${player.name}',
         CURRENT_TIMESTAMP,
         CURRENT_TIMESTAMP)
         
         ON CONFLICT (name) DO NOTHING
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
      && deleteObj.name && this.regEx.normalText.test(deleteObj.name)) {

         if(deleteObj.playerID === deleteObj.tagID) {

            const sql = `
               DELETE FROM games WHERE
               name = '${deleteObj.name}'
            `;
   
            this.runQuery(sql)
            .then(() => {
               socket.emit("deleteGameSuccess");
               this.serverSync();

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
            
            // If Game already full
            else {
               const errorMessage = "Partie déjà complète";
               socket.emit("joinGameDenied", (errorMessage));
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

   quitGame(quitObj, socket) {
      
      if(quitObj.gameName && this.regEx.normalText.test(quitObj.gameName)
      && quitObj.otherPlayerName && this.regEx.normalText.test(quitObj.otherPlayerName)) {

         let sql = `
            UPDATE games SET status = false,
            connected_players = '{}',
            updated_at = CURRENT_TIMESTAMP
            WHERE name = '${quitObj.gameName}'
         `;

         // Update Game Status
         this.runQuery(sql)
         .then(() => {

            sql = `SELECT id FROM players WHERE name = '${quitObj.otherPlayerName}'`;
            
            // Get other PlayerID
            this.runQuery(sql)
            .then((res) => {

               const otherPlayerID = res[0].id;
               const otherSocket = this.socketList[otherPlayerID];

               socket.emit("quitGameSuccess");
               otherSocket.emit("quitGameSuccess");
               this.serverSync();
               
            }).catch((err) => {
               
               if(err) {
                  socket.emit("quitGameSuccess");
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

         this.runQuery(sql)
         .then(() => socket.emit("changeNameSuccess"))
         .catch(() => socket.emit("changeNameDenied", (errorMessage)))
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

   dateFormat(dateDB) {
   
      const timeZone = 2;
      const date = new Date(dateDB);
      const dateArray = date.toISOString().split("T")[0].split("-");
      const timeArray = date.toISOString().split("T")[1].split(":");
   
      const dateObj = {
         day: dateArray[2],
         month: dateArray[1],
         year: dateArray[0],
         hour: Number(timeArray[0]) +timeZone,
         min: timeArray[1],
      }

      return `${dateObj.day}/${dateObj.month}/${dateObj.year} à ${dateObj.hour}h${dateObj.min}`;
   }
   
   // Server Sync
   serverSync() {

      let sql = `SELECT * FROM games`;

      // Get all games in DB
      this.runQuery(sql)
      .then((allGames) => {

         let gamesArray = [];
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

         
         // Send server data to all clients
         for(let i in this.playerList) {

            let player = this.playerList[i];
            let socket = this.socketList[player.id];

            socket.emit("gamesList", {
               gamesArray: gamesArray,
               gamesCount: gamesCount,
            });
         }

      }).catch((err) => console.log(err));
   }
}

module.exports = GameSystem;