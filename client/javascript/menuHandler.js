
"use strict"

let existingGamesArray = [];

// Generate DOM
const gameListTemplate = (game) => {

   let ownGameStatus = "";

   // Toggle delete button
   if(game.player_id === clientPlayer.id) ownGameStatus = "visible";

   const template = `
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
   
   menuDOM.gamesList.insertAdjacentHTML("beforeend", template);
}

const generateGameTags = (socket) => {

   socket.on("gamesList", (syncPack) => {
      if(syncPack.gamesArray) {
         
         let gamesNameArray = [];

         // Receive all games sync package
         syncPack.gamesArray.forEach(game => {
            gamesNameArray.push(game.name);
            
            // Render all none existing games
            if(!existingGamesArray.includes(game.name)) {
               existingGamesArray.push(game.name);
               gameListTemplate(game);
            }
         });
         
         let allGamesTag = document.querySelectorAll(".games-list li");
         
         // Update all existing tags
         allGamesTag.forEach(tag => {
            let tagName = tag.querySelector(".tag-name").textContent;

            // Update tag player counter
            syncPack.gamesArray.forEach(game => gameState(tag, tagName, game));
               
            enterGame(socket, tag, tagName);
            deleteGame(socket, tag, tagName);

            // Remove deleted Tags on Sync
            if(!gamesNameArray.includes(tagName)) tag.remove();
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

   if(game.name === tagName) {
      playerCounter.textContent = `${game.connected_players.length}/2`;
      
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
         
         hideGamesList();
         setLeftPlayerDOM();
      });


      // No space available
      socket.on("joinGameDenied", (joinObj) => {
         if(tagName === joinObj.gameName) popUpAlert(joinBtnAlert, joinObj.message);
      });


      // When other Player join Game
      socket.on("otherPlayerJoined", (otherPlayerName) => {
         setRightPlayerDOM(otherPlayerName);
      });
   });
}

const deleteGame = (socket, tag, tagName) => {
   const deleteBtn = tag.querySelector(".delete-game-btn");

   deleteBtn.addEventListener("click", () => {
      
      socket.emit("deleteGame", ({
         playerName: clientPlayer.name,
         playerID: clientPlayer.id,
         tagID: Number(tag.id),
         name: tagName,
      }));

      socket.on("deleteGameSuccess", () => tag.remove());
   });
   
   socket.on("clearTagsArrays", (gameName) => {
      const clearArraysDelay = 100;

      setTimeout(() => {
         if(existingGamesArray.includes(gameName)) removeIndex(existingGamesArray, gameName);         
      }, clearArraysDelay);
   });
}

const leaveGame = (socket) => {

   menuDOM.leaveGameBtn.addEventListener("click", () => {
      menuDOM.backCover.classList.remove("slide");

      socket.emit("leaveGame", ({
         gameName: menuDOM.game.querySelector(".game-name").textContent,
         playerName: clientPlayer.name,
         playerID: clientPlayer.id,
      }));
   });

   socket.on("leaveGameSuccess", () => {
      clearLeftPlayerDOM();
      displayGamesList();
   });

   socket.on("otherPlayerLeave", () => {
      clearRightPlayerDOM();
   });
}

const killGame = (socket) => {

   menuDOM.killGameBtn.addEventListener("click", () => {
      menuDOM.backCover.classList.remove("slide");

      socket.emit("killGame", ({
         gameName: menuDOM.game.querySelector(".game-name").textContent,
         otherPlayerName: menuDOM.rightPlayerName.textContent,
      }));
   });

   socket.on("killGameSuccess", () => {
      clearRightPlayerDOM();
      displayGamesList();
   });
}


// Modify DOM
const hideGamesList = () => {

   menuDOM.backCover.classList.remove("slide");

   // Back Cover Slide Animation
   setTimeout(() => {
      let gameTagBtn = document.querySelectorAll(".game-tag button");
      gameTagBtn.forEach(btn => btn.classList.remove("visible"));
      
      menuDOM.gamesList.classList.remove("visible");
      menuDOM.backCover.classList.add("slide");
      menuDOM.game.classList.add("visible");

   }, menuDOM.CSSduration);
}

const displayGamesList = () => {

   setTimeout(() => {
      let allGamesTags = document.querySelectorAll(".games-list li");

      // Display delete button
      allGamesTags.forEach(tag => {
         const deleteBtn = tag.querySelector(".delete-game-btn");
         if(Number(tag.id) === clientPlayer.id) deleteBtn.classList.add("visible");
      });

      // Remove Pack
      menuDOM.game.classList.remove("visible");
      
      // Add Pack
      menuDOM.gamesList.classList.add("visible");
      menuDOM.backCover.classList.add("slide");

   }, menuDOM.CSSduration);
}

const setLeftPlayerDOM = () => {

   menuDOM.leftPlayerName.textContent = clientPlayer.name;
   menuDOM.leftPlayerStatus.textContent = "Statut: Connecté";

   menuDOM.leftPlayerName.classList.remove("orange-bgd");
   menuDOM.leftPlayerStatus.classList.remove("orange-bgd");

   menuDOM.leftPlayerName.classList.add("blue-bgd");
   menuDOM.leftPlayerStatus.classList.add("green-bgd");
}

const clearLeftPlayerDOM = () => {

   // Remove Pack
   menuDOM.leftPlayerName.classList.remove("blue-bgd");
   menuDOM.leftPlayerStatus.classList.remove("green-bgd");
   
   // Add Pack
   menuDOM.leftPlayerName.classList.add("orange-bgd");
   menuDOM.leftPlayerStatus.classList.add("orange-bgd");

   menuDOM.leftPlayerName.textContent = "Vide";
   menuDOM.leftPlayerStatus.textContent = "Statut: En attente";
}

const setRightPlayerDOM = (playerName) => {

   menuDOM.rightPlayerName.textContent = playerName;
   menuDOM.rightPlayerStatus.textContent = "Statut: Connecté";

   menuDOM.rightPlayerName.classList.remove("orange-bgd");
   menuDOM.rightPlayerStatus.classList.remove("orange-bgd");

   menuDOM.rightPlayerName.classList.add("blue-bgd");
   menuDOM.rightPlayerStatus.classList.add("green-bgd");
}

const clearRightPlayerDOM = () => {

   // Remove Pack
   menuDOM.rightPlayerName.classList.remove("blue-bgd");
   menuDOM.rightPlayerStatus.classList.remove("green-bgd");
   
   // Add Pack
   menuDOM.rightPlayerName.classList.add("orange-bgd");
   menuDOM.rightPlayerStatus.classList.add("orange-bgd");

   menuDOM.rightPlayerName.textContent = "Vide";
   menuDOM.rightPlayerStatus.textContent = "Statut: En attente";
}


// =====================================================================
// Init Menu Handler
// =====================================================================
const initMenu = (socket) => {

   createGame(socket);
   generateGameTags(socket);
   leaveGame(socket);
   killGame(socket);
}