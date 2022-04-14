
"use strict"

const menuDOM = {
   createGameForm: document.querySelector(".create-game"),
   createGameInput: document.querySelector(".create-game input"),
   gamesCount: document.querySelector(".games-count"),
   gamesList: document.querySelector(".games-list"),
}


const initCreateGame = () => {

   const createGameForm = menuDOM.createGameForm;
   const createGameInput = menuDOM.createGameInput;

   createGameForm.addEventListener("submit", (event) => {
      event.preventDefault();
      createGameInput.value = "";
   });
}

const initGameCount = (count) => {
   
   const gamesCount = menuDOM.gamesCount;
   gamesCount.textContent = `Parties en cour: ${18}`
}

const gameListTemplate = () => {

   const gameName = `
      <li class="flexCenter" id="${"playerID"}">
         <div class="back-cover slide"></div>
         
         <div class="flexCenter borders game-name">
            <figure class="flexCenter">
               <i class="running-icon display fas fa-check-square"></i>
               <i class="ended-icon fas fa-times-square"></i>
            </figure>

            <p class="flexCenter">${"Something"}</p>

            <button class="delete-game-btn">
               <figure class="flexCenter">
                  <i class="display fas fa-times-circle"></i>
               </figure>
            </button>
         </div>
      </li>
   `;

   const gamesList = menuDOM.gamesList;
   gamesList.insertAdjacentHTML("beforeend", gameName);
}

const runningGames = 2;

const generateGameList = () => {

   for(let i = 0; i < runningGames; i++) gameListTemplate();
}


// =====================================================================
// Init Menu Handler
// =====================================================================
const initMenu = (socket) => {
   
   initCreateGame();
   initGameCount();
   generateGameList();
}