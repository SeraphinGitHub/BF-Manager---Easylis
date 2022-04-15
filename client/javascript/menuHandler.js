
"use strict"

const initCreateGame = (socket) => {

   const createGameForm = menuDOM.createGameForm;
   const createGameInput = menuDOM.createGameInput;
   const createGameAlert = menuDOM.createGameAlert;

   createGameForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if(formValidation(createGameInput, createGameAlert)) {
         socket.emit("addNewGame", createGameInput.value);
         createGameInput.value = "";
      }
   });
}

const initGameCount = (count) => {  

   const gamesCount = menuDOM.gamesCount;
   gamesCount.textContent = `Parties en cour: ${count}`
}

const gameListTemplate = (game) => {

   let runningStatus;
   let endedStatus;
   let deleteStatus;
   let bgdColor;

   
   // Toggle game status
   if(game.status) {
      runningStatus = "display";
      endedStatus = "";
      deleteStatus = "display";
      bgdColor = "running-bgd";
   }

   else {
      runningStatus = "";
      endedStatus = "display";
      deleteStatus = "";
      bgdColor = "ended-bgd";
   }

   
   // Toggle delete button
   if(game.playerID === clientPlayer.id) {
      deleteStatus = "visible";
   }

   else {
      deleteStatus = "";
   }


   const gameTemplate = `
      <li class="flexCenter" id="${game.playerID}">
         <div class="back-cover slide"></div>
         
         <div class="flexCenter borders game-name ${bgdColor}">
            <figure class="flexCenter">
               <i class="running-icon ${runningStatus} fas fa-check-square"></i>
               <i class="ended-icon ${endedStatus} fas fa-times-square"></i>
            </figure>

            <p class="flexCenter">${game.name}</p>

            <button class="delete-game-btn ${deleteStatus}">
               <figure class="flexCenter">
                  <i class="display fas fa-times-circle"></i>
               </figure>
            </button>
         </div>
      </li>
   `;

   const gamesList = menuDOM.gamesList;
   gamesList.insertAdjacentHTML("beforeend", gameTemplate);
}

const generateGameList = (socket) => {
   socket.on("gamesList", (syncPack) => {
      
      syncPack.gamesArray.forEach(game => gameListTemplate(game));
      initGameCount(syncPack.gamesCount);
   });
}


// =====================================================================
// Init Menu Handler
// =====================================================================
const initMenu = (socket) => {

   initCreateGame(socket);
   initGameCount(0);
   generateGameList(socket);
}