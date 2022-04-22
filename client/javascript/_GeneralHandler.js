
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
   rightPlayerName: document.querySelector(".right-player-name"),
   rightPlayerStatus: document.querySelector(".right-player-status"),
   quitGameBtn: document.querySelector(".quit-game-btn"),
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


// =====================================================================
// Init Game Handler
// =====================================================================
window.addEventListener("load", () => {

   const socket = io();

   initPlayer(socket);
   initMenu(socket);
   initChat(socket);
});