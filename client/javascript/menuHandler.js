
"use strict"

const createGame = (socket) => {
   const createGameInput = menuDOM.createGameInput;

   menuDOM.createGameForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if(formValidation(createGameInput, menuDOM.createGameAlert)) {
         socket.emit("createGame", createGameInput.value);
         createGameInput.value = "";
      }
   });
}

const setGameCount = (count) => {  

   menuDOM.gamesCount.textContent = `Parties en cour: ${count}`
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
   let eventsArray = [];

   socket.on("gamesList", (syncPack) => {
      syncPack.gamesArray.forEach(game => gameListTemplate(game));
      setGameCount(syncPack.gamesCount);
      selectGameTag(socket, eventsArray);
   });
}

const selectGameTag = (socket, eventsArray) => {
   let allGamesTags = document.querySelectorAll(".games-list li");

   allGamesTags.forEach(tag => {
      if(!eventsArray.includes(tag)) {
         
         eventsArray.push(tag);
         const tagName = tag.querySelector(".game-tag p");
         enterGame(socket, tag, tagName);
         deleteGame(socket, tag, tagName);
      }
   });
}

const enterGame = (socket, tag, tagName) => {

   const gameName = menuDOM.game.querySelector(".game-name");
   const joinBtn = tag.querySelector(".enter-game-btn");
   
   joinBtn.addEventListener("click", () => {

      clientPlayer.gameName = tagName.textContent;
      gameName.textContent = tagName.textContent;
      menuDOM.backCover.classList.remove("slide");

      // Send Client Data
      socket.emit("enterGame", ({
         playerID: clientPlayer.id,
         playerName: clientPlayer.name,
         gameName: tagName.textContent,
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
         playerID: tag.id,
         name: tagName.textContent + ": Delete",
      }));                  
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