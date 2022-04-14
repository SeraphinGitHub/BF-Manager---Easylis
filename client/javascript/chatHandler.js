
"use strict"

const chatDOM = {
   playerName: document.querySelector(".player-name p"),
   editNameBtn: document.querySelector(".player-name button"),
   editNameInput: document.querySelector(".player-name input"),
   searchBar: document.querySelector(".search-bar"),
   searchBarInput: document.querySelector(".search-bar input"),
}


const initPlayerName = (playerID) => {
   
   const playerName = chatDOM.playerName;
   playerName.textContent = `Joueur ${playerID}`
}

const editPlayerName = () => {

   const editNameBtn = chatDOM.editNameBtn;
   const editNameInput = chatDOM.editNameInput;
   const playerName = chatDOM.playerName;

   const editBtnContent = editNameBtn.textContent;

   let isEditing = false;

   // Toggle player name InputField
   editNameBtn.addEventListener("click", () => {
      
      // Show InputField
      if(!isEditing) {
         isEditing = true;
         editNameBtn.textContent = "Valider";
         editNameInput.value = playerName.textContent;

         editNameBtn.classList.add("green-bgd");
         playerName.classList.remove("display");
         editNameInput.classList.add("display");
      }
      
      // Hide InputField
      else {
         isEditing = false;
         editNameBtn.textContent = editBtnContent;
         playerName.textContent = editNameInput.value;

         editNameBtn.classList.remove("green-bgd");
         playerName.classList.add("display");
         editNameInput.classList.remove("display");
      }
   });
}

const initSearchBar = () => {

   const searchBar = chatDOM.searchBar;
   const searchBarInput = chatDOM.searchBarInput;

   searchBar.addEventListener("submit", (event) => {
      event.preventDefault();
      searchBarInput.value = "";
   });
}


// =====================================================================
// Init Chat Handler
// =====================================================================
const initChat = (socket) => {
   
   socket.on("initClient", (playerID) => initPlayerName(playerID));
   editPlayerName();
   initSearchBar();
}