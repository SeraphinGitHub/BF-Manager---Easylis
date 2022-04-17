
"use strict"

const DataBase = require("./DataBase.js");
const Player = require("./Player.js"); 
const NewGame = require("./NewGame.js"); 
const RegEx = require("./RegEx.js");

class GameSystem extends DataBase {

   constructor() {
      super();
      
      this.newGame;
      this.regEx = new RegEx();
   }

   // New Player
   createNewPlayer(socket, playerList) {

      const player = new Player(socket.id);
      playerList[socket.id] = player;
      player.name = `Joueur ${socket.id}`;

      const sql = `INSERT INTO players (
         name,
         created_at,
         updated_at)
         
         VALUES (
         '${player.name}',
         CURRENT_DATE,
         CURRENT_DATE)
         
         ON CONFLICT (name) DO NOTHING
      `;
      
      this.runQuery(sql);
      
      socket.emit("initClient", {
         id: player.id,
         name: player.name,
      });
      
      socket.emit("gamesList", {
         gamesArray: this.gamesArray,
         gamesCount: this.gamesCount,
      });
   }

   // Game States
   createNewGame(socket, serverSync, gameObj) {

      if(gameObj.playerID && typeof(gameObj.playerID) === "number"
      && gameObj.gameName && this.regEx.normalText.test(gameObj.gameName)) {

         this.newGame = new NewGame(gameObj.playerID, gameObj.gameName);

         const sql = `INSERT INTO games (
            name,
            player_id,
            created_at,
            updated_at)
            
            VALUES (
            '${gameObj.gameName}',
            '${gameObj.playerID}',
            CURRENT_DATE,
            CURRENT_DATE
         )`;
         
         const queryObj = {
            successChannel: "newGameSuccess",
            errorChannel: "newGameDenied",
            errorMessage: "Cette partie existe déja !",
         }

         this.runQuery(sql, socket, queryObj);
         serverSync();
      }
   }

   deleteGame(socket, serverSync, deleteObj) {
      
      if(deleteObj.playerID && typeof(deleteObj.playerID) === "number"
      && deleteObj.tagID && typeof(deleteObj.tagID) === "number"
      && deleteObj.name && this.regEx.normalText.test(deleteObj.name)) {

         if(deleteObj.playerID === deleteObj.tagID) {

            const sql = `
               DELETE FROM games WHERE
               name = '${deleteObj.name}'
            `;
   
            const queryObj = {
               successChannel: "deleteGameSuccess",
            }
   
            this.runQuery(sql, socket, queryObj);
            serverSync();
         }
      }
   }

   enterGame(clientGame, socket) {
      this.gamesArray.forEach(game => {

         if(game.name === clientGame.gameName
         && Object.keys(game.connectedPlayers).length < 2) {
            
            game.connectedPlayers[clientGame.playerID] = clientGame.playerName;
            socket.emit("gameJoined", (game.connectedPlayers));
         }
      });
   }

   quitGame(clientGame) {
      
      console.log(clientGame); // ******************************************************
   }

   // Change Player Name
   changeName(socket, nameObj) {
      
      if(nameObj.playerID && typeof(nameObj.playerID) === "number"
      && nameObj.oldName && this.regEx.normalText.test(nameObj.oldName)
      && nameObj.newName && this.regEx.normalText.test(nameObj.newName)) {

         const sql = `UPDATE players SET
            name = '${nameObj.newName}',
            updated_at = CURRENT_DATE
            WHERE id = '${nameObj.playerID}'
            AND name = '${nameObj.oldName}'
         `;

         const queryObj = {
            successChannel: "changeNameSuccess",
            errorChannel: "changeNameDenied",
            errorMessage: "Ce nom est déjà pris !",
         }

         this.runQuery(sql, socket, queryObj);
      }
   }

   // Chat
   generalChat(messageObj, socketList) {

      if(messageObj.playerName && this.regEx.normalText.test(messageObj.playerName)
      && messageObj.message && this.regEx.specialText.test(messageObj.message)) {
         
         for(let i in socketList) {
            socketList[i].emit("addMessageToGeneral", `${messageObj.playerName}: ${messageObj.message}`);
         }
      }
   }
}

module.exports = GameSystem;