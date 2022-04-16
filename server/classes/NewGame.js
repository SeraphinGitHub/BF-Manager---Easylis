
"use strict"

class NewGame {
   constructor(playerID, gameName) {
      
      this.playerID = playerID;
      this.status = true;
      this.name = gameName;
      this.connectedPlayers = {};
   }
}

module.exports = NewGame;