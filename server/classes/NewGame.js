
"use strict"

class NewGame {
   constructor(playerID, gameName) {
      
      this.playerID = playerID;
      this.status = "running";
      this.name = gameName;
      this.connectedPlayers = {};
   }
}

module.exports = NewGame;