
"use strict"

// Generate DOM
const gameListTemplate = (game) => {

   let runningStatus = "display";
   let endedStatus = "";
   let ownGameStatus = "";
   let bgdColor = "running-bgd";
   let joinBgdColor = "green-bgd";

   // Toggle game status
   if(!game.status) {
      runningStatus = "";
      endedStatus = "display";
      bgdColor = "ended-bgd";
      joinBgdColor = "ended-bgd";
   }

   // Toggle delete button
   if(game.player_id === clientPlayer.id) {
      ownGameStatus = "visible";
   }

   const gameTemplate = `
      <li class="flexCenter" id="${game.player_id}">
         <div class="back-cover slide"></div>
         
         <div class="flexCenter borders game-tag ${bgdColor}">
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
   let tagsArray = [];
   let renderGameArray = [];

   socket.on("gamesList", (syncPack) => {
      if(syncPack.gamesArray) {
      
         let allGamesTags = document.querySelectorAll(".games-list li");
         let currentGamesArray = [];

         syncPack.gamesArray.forEach(game => {
            currentGamesArray.push(game.name);
            
            if(!renderGameArray.includes(game.name)) {
               renderGameArray.push(game.name);
               gameListTemplate(game);
            }
         });
         
         allGamesTags.forEach(tag => {
            const tagName = tag.querySelector(".game-tag p").textContent;
            if(!currentGamesArray.includes(tagName)) tag.remove();
         });
         
         setGameCount(syncPack.gamesCount);
         selectGameTag(socket, tagsArray);
      }
   });
}

const setGameCount = (count) => {  

   menuDOM.gamesCount.textContent = `Parties en cour: ${count}`
}

const selectGameTag = (socket, tagsArray) => {
   let allGamesTags = document.querySelectorAll(".games-list li");

   allGamesTags.forEach(tag => {
      if(!tagsArray.includes(tag)) {
         
         tagsArray.push(tag);
         const tagName = tag.querySelector(".game-tag p").textContent;
         enterGame(socket, tag, tagName);
         deleteGame(socket, tag, tagName);
      }
   });
}


// Game Tags States
const createGame = (socket) => {
   const createGameInput = menuDOM.createGameInput;

   menuDOM.createGameForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if(formValidation(createGameInput, menuDOM.createGameAlert)) {

         socket.emit("createGame", {
            playerID: clientPlayer.id,
            gameName: createGameInput.value,
         });
      }
   });

   socket.on("newGameDenied", (errorMessage) => {
      popUpAlert(menuDOM.createGameAlert, errorMessage)
   });

   socket.on("newGameSuccess", () => {
      createGameInput.value = "";
   });
}

const enterGame = (socket, tag, tagName) => {

   const gameName = menuDOM.game.querySelector(".game-name");
   const joinBtn = tag.querySelector(".enter-game-btn");
   
   joinBtn.addEventListener("click", () => {

      clientPlayer.gameName = tagName;
      gameName.textContent = tagName;
      menuDOM.backCover.classList.remove("slide");

      // Send Client Data
      socket.emit("enterGame", ({
         playerID: clientPlayer.id,
         playerName: clientPlayer.name,
         gameName: tagName,
      }));

      // Receive Server Data
      socket.on("gameJoined", (connectedPlayers) => {
         
         // DOM element players name, connected status, versus
         console.log(connectedPlayers); // ******************************************************
      });
      
      // Back Cover Slide Animation
      setTimeout(() => {
         let gameTagBtn = document.querySelectorAll(".game-tag button");
         gameTagBtn.forEach(btn => btn.classList.remove("visible"));
         
         menuDOM.gamesList.classList.remove("visible");
         menuDOM.backCover.classList.add("slide");
         menuDOM.game.classList.add("visible");
      }, menuDOM.CSSduration);
   });


}

const deleteGame = (socket, tag, tagName) => {
   const deleteBtn = tag.querySelector(".delete-game-btn");

   deleteBtn.addEventListener("click", () => {
      
      socket.emit("deleteGame", ({
         playerID: clientPlayer.id,
         tagID: Number(tag.id),
         name: tagName,
      }));
   
      socket.on("deleteGameSuccess", () => tag.remove());
   });
}

const quitGame = (socket) => {

   menuDOM.quitGameBtn.addEventListener("click", () => {
      menuDOM.backCover.classList.remove("slide");

      // Send Client Data
      socket.emit("quitGame", ({
         playerID: clientPlayer.id,
         name: clientPlayer.gameName + ": Quitter",
      }));
      
      // Back Cover Slide Animation
      setTimeout(() => {
         let gameTagBtn = document.querySelectorAll(".game-tag button");
         gameTagBtn.forEach(btn => btn.classList.add("visible"));
         
         menuDOM.gamesList.classList.add("visible");
         menuDOM.backCover.classList.add("slide");
         menuDOM.game.classList.remove("visible");
      }, menuDOM.CSSduration);
   });
}


// =====================================================================
// Init Menu Handler
// =====================================================================
const initMenu = (socket) => {

   createGame(socket);
   generateGameList(socket);
   quitGame(socket);
}