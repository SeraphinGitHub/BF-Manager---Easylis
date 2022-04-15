
"use strict"

class Player {
   constructor(id) {
      
      this.id = id;
      this.name = "";
      this.runningGames = 0;
      this.endedGames = 0;
      this.totalGames = 0;
   }
}

module.exports = Player;