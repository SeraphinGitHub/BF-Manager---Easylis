
"use strict"

// Generate DOM
const gameListTemplate = (game) => {

   let ownGameStatus = "";

   // Toggle delete button
   // if(game.player_id === clientPlayer.id) ownGameStatus = "visible";

   const gameTemplate = `
      <li class="flexCenter" id="${game.player_id}">
         <div class="back-cover slide"></div>
         
         <div class="flexCenter borders game-tag">
            <figure class="flexCenter">
               <i class="running-icon fas fa-check-square"></i>
               <i class="ended-icon fas fa-times-square"></i>
            </figure>

            <p class="flexCenter tag-name">${game.name}</p>
            <p class="flexCenter tag-player-counter borders">0/2</p>

            <div class="flexCenter tag-date">
               <p class="flexCenter date-state"></p>
               <p class="flexCenter date-time"></p>
               <p class="flexCenter alert-message"></p>
            </div>

            <button class="flexCenter green-bgd borders enter-game-btn">
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
   let existingTagsArray = [];

   socket.on("gamesList", (syncPack) => {
      if(syncPack.gamesArray) {

         let tagsNameArray = [];
         
         // Render all none existing tags
         syncPack.gamesArray.forEach(game => {
            tagsNameArray.push(game.name);

            if(!existingTagsArray.includes(game.name)) {
               existingTagsArray.push(game.name);
               gameListTemplate(game);
            }            
         });
         
         
         let allGamesTags = document.querySelectorAll(".games-list li");
         
         // Update all existing tags
         allGamesTags.forEach(tag => {

            const tagName = tag.querySelector(".game-tag p").textContent;           

            // Update game player counter
            syncPack.gamesArray.forEach(game => gameState(tag, tagName, game));
            
            
            // Join game / Remove deleted game tag ==> On Click 
            if(!tagsArray.includes(tag)) {
               tagsArray.push(tag);
               
               enterGame(socket, tag, tagName);
               deleteGame(socket, tag, tagName);
            }

            // Remove deleted Tags on Sync
            if(!tagsNameArray.includes(tagName)) tag.remove();
         });
         
         setGameCount(syncPack.gamesCount);
      }
   });
}

const gameState = (tag, tagName, game) => {

   const gameTag = tag.querySelector(".game-tag");
   const runningIcon = tag.querySelector(".running-icon");
   const endedIcon = tag.querySelector(".ended-icon");
   const playerCounter = tag.querySelector(".tag-player-counter");
   const enterGameBtn = tag.querySelector(".enter-game-btn");
   const dateState = tag.querySelector(".date-state");
   const dateTime = tag.querySelector(".date-time");
   const deleteBtn = tag.querySelector(".delete-game-btn");

   if(game.name === tagName) {
      playerCounter.textContent = `${game.connected_players.length}/2`;
      
      // if(game.player_id === clientPlayer.id) deleteBtn.classList.add("visible");
      
      // Running Game
      if(game.status) {
   
         // Remove Pack
         gameTag.classList.remove("ended-bgd");
         endedIcon.classList.remove("display");
         playerCounter.classList.remove("ended-bgd");
         enterGameBtn.classList.remove("ended-bgd");
   
         // Add Pack
         gameTag.classList.add("running-bgd");
         runningIcon.classList.add("display");
         playerCounter.classList.add("orange-bgd");
         enterGameBtn.classList.add("green-bgd");
   
         dateState.textContent = "Créé le:";
         dateTime.textContent = `${game.created_at}`;
      }

      // Ended Game
      else {   
         // Remove Pack
         gameTag.classList.remove("running-bgd");
         runningIcon.classList.remove("display");
         playerCounter.classList.remove("orange-bgd");
         enterGameBtn.classList.remove("green-bgd");
   
         // Add Pack
         gameTag.classList.add("ended-bgd");
         endedIcon.classList.add("display");
         playerCounter.classList.add("ended-bgd");
         enterGameBtn.classList.add("ended-bgd");
   
         dateState.textContent = "Terminé le:";
         dateTime.textContent = `${game.updated_at}`;
      }
   }
}

const setGameCount = (count) => {  
   menuDOM.gamesCount.textContent = `Parties en cour: ${count}`
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
      popUpAlert(menuDOM.createGameAlert, errorMessage);
   });

   socket.on("newGameSuccess", () => {
      createGameInput.value = "";
   });
}

const enterGame = (socket, tag, tagName) => {

   const gameName = menuDOM.game.querySelector(".game-name");
   const joinBtn = tag.querySelector(".enter-game-btn");
   const joinBtnAlert = tag.querySelector(".alert-message");
   
   joinBtn.addEventListener("click", () => {

      // Send Client Data
      socket.emit("enterGame", ({
         playerID: clientPlayer.id,
         playerName: clientPlayer.name,
         gameName: tagName,
      }));


      // Space available => Enter Game
      socket.on("joinGameSuccess", () => {

         clientPlayer.gameName = tagName;
         gameName.textContent = tagName;
         menuDOM.backCover.classList.remove("slide");
         menuDOM.leftPlayerName.textContent = clientPlayer.name;

         // Back Cover Slide Animation
         setTimeout(() => {
            let gameTagBtn = document.querySelectorAll(".game-tag button");
            gameTagBtn.forEach(btn => btn.classList.remove("visible"));
            
            menuDOM.gamesList.classList.remove("visible");
            menuDOM.backCover.classList.add("slide");
            menuDOM.game.classList.add("visible");
         }, menuDOM.CSSduration);
      });


      // No space available
      socket.on("joinGameDenied", (errorMessage) => {
         popUpAlert(joinBtnAlert, errorMessage);
      });


      // When other Player join Game
      socket.on("otherPlayerJoined", (otherPlayerName) => {
         
         menuDOM.rightPlayerName.textContent = otherPlayerName;
         menuDOM.rightPlayerStatus.textContent = "Statu: Connecté";

         menuDOM.rightPlayerName.classList.remove("orange-bgd");
         menuDOM.rightPlayerName.classList.add("blue-bgd");
         menuDOM.rightPlayerStatus.classList.remove("orange-bgd");
         menuDOM.rightPlayerStatus.classList.add("green-bgd");
      });
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
      
      socket.emit("quitGame", ({
         gameName: menuDOM.game.querySelector(".game-name").textContent,
         otherPlayerName: menuDOM.rightPlayerName.textContent,
      }));
   });

   socket.on("quitGameSuccess", () => {
     
      // Back Cover Slide Animation
      setTimeout(() => {
         let gameTagBtn = document.querySelectorAll(".game-tag button");
         gameTagBtn.forEach(btn => btn.classList.add("visible"));
         
         menuDOM.gamesList.classList.add("visible");
         menuDOM.backCover.classList.add("slide");
         menuDOM.game.classList.remove("visible");

         menuDOM.rightPlayerName.textContent = "Vide";
         menuDOM.rightPlayerStatus.textContent = "Statu: En attente";

         menuDOM.rightPlayerName.classList.add("orange-bgd");
         menuDOM.rightPlayerName.classList.remove("blue-bgd");
         menuDOM.rightPlayerStatus.classList.add("orange-bgd");
         menuDOM.rightPlayerStatus.classList.remove("green-bgd");
         
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