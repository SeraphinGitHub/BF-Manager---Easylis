
"use strict"

class GameSystem {
   constructor() {
      
      this.gamesArray = [];
      this.gamesCount = 0;
   }

   initPack() {
      return {
         gamesArray: this.gamesArray,
         gamesCount: this.gamesCount,
      }
   }
}

module.exports = GameSystem;