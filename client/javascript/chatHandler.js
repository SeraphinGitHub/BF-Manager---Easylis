
"use strict"

const initPlayerName = (socket) => {
   socket.on("initClient", (servPlayerName) => {
   
      const playerName = chatDOM.playerName;
      playerName.textContent = servPlayerName;
   });
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

const initChatBar = (socket) => {

   const chatForm = chatDOM.createGameForm;
   const chatInput = chatDOM.createGameInput;

   chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      
      socket.emit("addNewGame", chatInput.value);
      chatInput.value = "";
   });
}


// =====================================================================
// Init Chat Handler
// =====================================================================
const initChat = (socket) => {
   
   initPlayerName(socket);
   editPlayerName();
   initSearchBar();
   initChatBar(socket);
}