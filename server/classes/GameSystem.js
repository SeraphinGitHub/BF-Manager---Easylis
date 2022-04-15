
"use strict"

class GameSystem {
   constructor() {

      this.gamesList = {};
      this.gamesCount = 0;
   }

   syncPack() {
      return {
         gamesList: this.gamesList,
         gamesCount: this.gamesCount,
      }
   }
}

module.exports = GameSystem;