
"use strict"

const clientPlayer = new ClientPlayer();

const menuDOM = {
   createGameForm: document.querySelector(".create-game"),
   createGameInput: document.querySelector(".create-game input"),
   createGameAlert: document.querySelector(".create-game .alert-message"),
   gamesSwapPages: document.querySelector(".games-swap-pages"),
   backCover: document.querySelector(".games-swap-pages .back-cover"),
   gamesCount: document.querySelector(".games-count"),
   gamesList: document.querySelector(".games-list"),
   game: document.querySelector(".game"),
   leftPlayerName: document.querySelector(".left-player-name"),
   leftPlayerStatus: document.querySelector(".left-player-status"),
   rightPlayerName: document.querySelector(".right-player-name"),
   rightPlayerStatus: document.querySelector(".right-player-status"),
   leaveGameBtn: document.querySelector(".leave-game-btn"),
   killGameBtn: document.querySelector(".kill-game-btn"),
   CSSduration: 1000, // Milliseconds
}

const chatDOM = {
   nameField: document.querySelector(".name-field"),
   editNameBtn: document.querySelector(".player-name button"),
   editNameInput: document.querySelector(".player-name input"),
   editNameAlert: document.querySelector(".player-name .alert-message"),
   searchBar: document.querySelector(".search-bar"),
   searchBarInput: document.querySelector(".search-bar input"),
   generalChatBtn: document.querySelector(".general-chat-btn"),
   generalChat: document.querySelector(".general-chat"),
   privateChatBtn: document.querySelector(".private-chat-btn"),
   privateChat: document.querySelector(".private-chat"),
   contactPanelBtn: document.querySelector(".contact-panel-btn"),
   contactPanel: document.querySelector(".contact-panel"),
   receiver: document.querySelector(".receiver"),
   chatForm: document.querySelector(".chat-form"),
   chatInput: document.querySelector(".chat-input"),
}

const alertMessage = {
   emptyField: "Le champ est vide",
   minCharsAlert: "Minimum 5 caractères",
   maxCharsAlert: "Maximum 20 caractères",
   invalidAlert: "Contient caractère invalide",
}

const formValidation = (fieldClass, alertClass) => {
   
   // if include: LETTER || letter || accent letters || number || White Space
   const textRegEx = new RegExp(/^[A-Za-zÜ-ü0-9 ]+$/);
   

   // if Empty Field
   if(fieldClass.value === "") popUpAlert(alertClass, alertMessage.emptyField);

   // if text is less than 5 characters
   else if(fieldClass.value.length < 5) popUpAlert(alertClass, alertMessage.minCharsAlert);

   // if text is more than 20 characters
   else if(fieldClass.value.length > 20) popUpAlert(alertClass, alertMessage.maxCharsAlert);

   // if include any special characters
   else if(!textRegEx.test(fieldClass.value)) popUpAlert(alertClass, alertMessage.invalidAlert);

   // if everything's fine
   else return true;
}

const popUpAlert = (alertClass, message) => {

   const hideDelay = 2500; // ==> Milliseconds
   alertClass.classList.add("visible");
   alertClass.textContent = message;

   setTimeout(() => {
      alertClass.classList.remove("visible");
   }, hideDelay);
}

const initPlayer = (socket) => {
   
   socket.on("initClient", (initPack) => {
      clientPlayer.id = initPack.id;
      clientPlayer.name = initPack.name;
      
      chatDOM.nameField.textContent = clientPlayer.name;
   });
}

// Remove Array Index
const removeIndex = (array, item) => {

   let index = array.indexOf(item);
   array.splice(index, 1);
}

const adminMode = (socket) => {

   let deletedPlayersArray = [];

   // Modify DOM ==> Display as Admin
   socket.on("adminModeSuccess", (playersNameArray) => {

      const isAdmin = true;
      
      // Display Games delete button
      let allGamesTags = document.querySelectorAll(".games-list li");
      
      allGamesTags.forEach(tag => {
         const deleteBtn = tag.querySelector(".delete-game-btn");
         deleteBtn.classList.add("visible");
      });


      // Render all players in DataBase
      playersNameArray.forEach(playerName => connectedPlayerTemplate(playerName, isAdmin));

      
      // Display Players delete button
      let allNamesTag = document.querySelectorAll(".contact-panel li");

      allNamesTag.forEach(tag => {
         
         if(tag.classList.contains("orange-bgd")) {

            let deleteBtn = tag.querySelector(".delete-player");
            let playerName = tag.querySelector("p").textContent;

            deleteBtn.addEventListener("click", () => {
               socket.emit("adminDeletePlayer", (playerName));
               if(!deletedPlayersArray.includes(playerName)) deletedPlayersArray.push(playerName);
            });
         }
      });
   });

   // Remove deleted players nameTag
   socket.on("deletePlayerSuccess", () => {
      let allNamesTag = document.querySelectorAll(".contact-panel li");

      allNamesTag.forEach(tag => {
         let playerName = tag.querySelector("p").textContent;

         deletedPlayersArray.forEach(name => {
            if(name === playerName) tag.remove();
         });
      });
   });
}


// =====================================================================
// Init Game Handler
// =====================================================================
window.addEventListener("load", () => {

   const socket = io();

   initPlayer(socket);
   initMenu(socket);
   initChat(socket);
   adminMode(socket);
});