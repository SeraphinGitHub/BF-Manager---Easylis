
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

   let runningStatus = "display";
   let endedStatus = "";
   // let ownGameStatus = "";
   let bgdColor = "running-bgd";
   let joinBgdColor = "green-bgd";
   
   // ******************************************
   let ownGameStatus = "visible";
   // ******************************************

   
   // Toggle game status
   if(!game.status) {
      runningStatus = "";
      endedStatus = "display";
      bgdColor = "ended-bgd";
      joinBgdColor = "ended-bgd";
   }

   // Toggle delete button
   if(game.playerID === clientPlayer.id) {
      ownGameStatus = "visible";
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

            <button class="flexCenter green-bgd borders enter-game-btn ${ownGameStatus} ${joinBgdColor}">
               Rejoindre
            </button>

            <button class="delete-game-btn ${ownGameStatus}">
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
   let eventsArray = [];

   socket.on("gamesList", (syncPack) => {
      syncPack.gamesArray.forEach(game => gameListTemplate(game));
      initGameCount(syncPack.gamesCount);
      selectGameTag(socket, eventsArray);
   });
}

const selectGameTag = (socket, eventsArray) => {
   
   let allGamesTags = document.querySelectorAll(".games-list li");

   allGamesTags.forEach(tag => {
      
      if(!eventsArray.includes(tag)) {
         eventsArray.push(tag);

         const backCover = menuDOM.gamesSwapPages.querySelector(".back-cover");

         const tagName = tag.querySelector(".game-name p");
         const joinBtn = tag.querySelector(".enter-game-btn");
         const deleteBtn = tag.querySelector(".delete-game-btn");

         // Join player own Game
         joinBtn.addEventListener("click", () => {
            socket.emit("enterGame", ({
               id: tag.id,
               name: tagName.textContent + ": Rejoindre",
            }));

            backCover.classList.remove("slide");
            
            setTimeout(() => {
               let gameNameBtn = document.querySelectorAll(".game-name button");
               gameNameBtn.forEach(btn => btn.classList.remove("visible"));
               
               menuDOM.gamesList.classList.remove("visible");
               backCover.classList.add("slide");
               menuDOM.game.classList.add("visible");
            }, 1000);
         });

         // Delete player own Game
         deleteBtn.addEventListener("click", () => {
            socket.emit("deleteGame", ({
               id: tag.id,
               name: tagName.textContent + ": Delete",
            }));                  
         });
      }
   });
}


// =====================================================================
// Init Menu Handler
// =====================================================================
const initMenu = (socket) => {

   initCreateGame(socket);
   generateGameList(socket);
}