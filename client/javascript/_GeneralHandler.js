
"use strict"

const menuDOM = {
   createGameForm: document.querySelector(".create-game"),
   createGameInput: document.querySelector(".create-game input"),
   createGameAlert: document.querySelector(".create-game .alert-message"),
   gamesCount: document.querySelector(".games-count"),
   gamesList: document.querySelector(".games-list"),
}

const chatDOM = {
   playerName: document.querySelector(".player-name p"),
   playerNameAlert: document.querySelector(".player-name .alert-message"),
   editNameBtn: document.querySelector(".player-name button"),
   editNameInput: document.querySelector(".player-name input"),
   searchBar: document.querySelector(".search-bar"),
   searchBarInput: document.querySelector(".search-bar input"),
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
   
   // if include: LETTER || letter || accent letters || White Space
   const textRegEx = new RegExp(/^[A-Za-zÜ-ü ]+$/);
   

   // if Empty Field
   if(fieldClass.value === "") popUpAlert(alertClass, alertMessage.emptyField);

   // if text is less than 5 characters
   else if(fieldClass.value.length < 5) popUpAlert(alertClass, alertMessage.minCharsAlert);

   // if text is more than 20 characters
   else if(fieldClass.value.length > 20) popUpAlert(alertClass, alertMessage.maxCharsAlert);

   // if include any special characters or number
   else if(!textRegEx.test(fieldClass.value)) popUpAlert(alertClass, alertMessage.invalidAlert);

   // if everything's fine
   else return true;
}

const popUpAlert = (alertClass, message) => {

   const duration = 2500; // ==> Milliseconds
   alertClass.classList.add("visible");
   alertClass.textContent = message;

   setTimeout(() => {
      alertClass.classList.remove("visible");
   }, duration);
}

// =====================================================================
// Init Game Handler
// =====================================================================
window.addEventListener("load", () => {

   const socket = io();

   initMenu(socket);
   initChat(socket);
});