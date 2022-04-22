
"use strict"

let selectedPlayer = "";
let existingPlayerArray = [];
let isGeneralChannel = true;

const editPlayerName = (socket) => {

   const nameField = chatDOM.nameField;
   const editNameBtn = chatDOM.editNameBtn;
   const editNameInput = chatDOM.editNameInput;
   
   const editBtnContent = editNameBtn.textContent;
   let isEditing = false;

   // Toggle player name InputField
   editNameBtn.addEventListener("click", () => {
      
      // Show InputField
      if(!isEditing) {

         isEditing = true;       
         editNameBtn.textContent = "Valider";
         editNameInput.value = nameField.textContent;

         editNameBtn.classList.add("green-bgd");
         nameField.classList.remove("display");
         editNameInput.classList.add("display");
      }
      
      // Hide InputField
      else if(formValidation(editNameInput, chatDOM.editNameAlert)) {

         socket.emit("changeName", {
            oldName: clientPlayer.name,
            newName: editNameInput.value,
         });
      }
   });

   socket.on("changeNameDenied", (errorMessage) => {
      popUpAlert(chatDOM.editNameAlert, errorMessage)
   });

   socket.on("changeNameSuccess", () => {
      isEditing = false;

      clientPlayer.name = editNameInput.value;
      editNameBtn.textContent = editBtnContent;
      nameField.textContent = clientPlayer.name;

      editNameBtn.classList.remove("green-bgd");
      nameField.classList.add("display");
      editNameInput.classList.remove("display");
   });
}

const initSearchBar = () => {
   const searchBarInput = chatDOM.searchBarInput;

   chatDOM.searchBar.addEventListener("submit", (event) => {
      event.preventDefault();
      searchBarInput.value = "";
   });
}

const sendMessage = (socket) => {
   const chatInput = chatDOM.chatInput;

   chatDOM.chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      
      if(isGeneralChannel) {
         socket.emit("generalMessage", {
            playerName: clientPlayer.name,
            message: chatInput.value,
         });
      }

      else {
         socket.emit("privateMessage", {
            playerName: clientPlayer.name,
            otherPlayerName: selectedPlayer,
            message: chatInput.value,
         });
      }
      
      chatInput.value = "";
   });
}

const chatAddMessage = (socket) => {
   
   socket.on("addMessageToGeneral", (message) => {
      chatDOM.generalChat.innerHTML += `<li class="flexCenter message">${message}</li>`;
   });

   socket.on("addMessageToPrivate", (message) => {
      chatDOM.privateChat.innerHTML += `<li class="flexCenter message">${message}</li>`;
   });
}

const toggleChatChannels = () => {

   const receiverClass = chatDOM.receiver.classList;

   // Toggle General Chat
   chatDOM.generalChatBtn.addEventListener("click", () => {

      if(!chatDOM.generalChat.classList.contains("display")) {
         chatDOM.generalChat.classList.add("display");
         chatDOM.privateChat.classList.remove("display");
         chatDOM.contactPanel.classList.remove("display");

         receiverClass.add("general-bgd");
         receiverClass.remove("private-bgd");
         receiverClass.remove("contact-bgd");

         chatDOM.receiver.textContent = "Destinataire: Tout le monde";
      }

      isGeneralChannel = true;
   });


   // Toggle Private Chat
   chatDOM.privateChatBtn.addEventListener("click", () => {

      if(!chatDOM.privateChat.classList.contains("display")) displayPrivateChat();
      isGeneralChannel = false;
   });


   // Toggle Contact Panel
   chatDOM.contactPanelBtn.addEventListener("click", () => {

      if(!chatDOM.contactPanel.classList.contains("display")) {
         chatDOM.generalChat.classList.remove("display");
         chatDOM.privateChat.classList.remove("display");
         chatDOM.contactPanel.classList.add("display");

         receiverClass.remove("general-bgd");
         receiverClass.remove("private-bgd");
         receiverClass.add("contact-bgd");

         chatDOM.receiver.textContent = "Joueurs Connectés"
      }
   });
}

const displayPrivateChat = () => {
   
   chatDOM.generalChat.classList.remove("display");
   chatDOM.privateChat.classList.add("display");
   chatDOM.contactPanel.classList.remove("display");

   chatDOM.receiver.classList.remove("general-bgd");
   chatDOM.receiver.classList.add("private-bgd");
   chatDOM.receiver.classList.remove("contact-bgd");

   chatDOM.receiver.textContent = `Destinataire: ${selectedPlayer}`;
}

const connectedPlayerTemplate = (playerName) => {

   const template = `
      <li class="flexCenter borders blue-bgd  connected-player">
         <p class="flexCenter">${playerName}</p>

         <figure class="flexCenter">
            <i class="fas fa-comment"></i>
            <i class="far fa-comment"></i>
         </figure>
      </li>
   `;

   chatDOM.contactPanel.insertAdjacentHTML("beforeend", template);
}

const generateConnectedPlayer = (socket) => {

   socket.on("gamesList", (syncPack) => {
      if(syncPack.playersName) {
         
         syncPack.playersName.forEach(name => {

            // Render all none existing players names
            if(!existingPlayerArray.includes(name)) {
               existingPlayerArray.push(name);
               connectedPlayerTemplate(name);
            }
         });

         let allNamesTag = document.querySelectorAll(".contact-panel li");
         
         // Update all existing tags
         allNamesTag.forEach(tag => {

            let tagName = tag.querySelector("p");
            if(!syncPack.playersName.includes(tagName.textContent)) tag.remove();
         });
      }
   });


   // Update Connected Players Names
   socket.on("updateName", (nameObj) => {
      let allNamesTag = document.querySelectorAll(".contact-panel li");
      
      allNamesTag.forEach(tag => {
         let tagName = tag.querySelector("p");
         let bubble = tag.querySelector("figure");

         if(existingNamesArray.includes(nameObj.oldName)) removeIndex(existingNamesArray, nameObj.oldName);
         if(tagName.textContent === nameObj.oldName) tagName.textContent = nameObj.newName;

         if(!clickedTagsArray.includes(tagName.textContent)) {
            clickedTagsArray.push(tagName.textContent);

            extractPlayerName(bubble, tagName.textContent);
         }
      });
   });
}

const extractPlayerName = (bubble, tagName) => {

   bubble.addEventListener("click", () => {
      selectedPlayer = tagName;
      displayPrivateChat();
      isGeneralChannel = false;
   });
}


// =====================================================================
// Init Chat Handler
// =====================================================================
const initChat = (socket) => {
   
   editPlayerName(socket);
   initSearchBar();
   sendMessage(socket);
   chatAddMessage(socket);
   toggleChatChannels();
   generateConnectedPlayer(socket);
}