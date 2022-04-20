
"use strict"

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
      
      socket.emit("generalMessage", {
         playerName: clientPlayer.name,
         message: chatInput.value,
      });
      
      socket.emit("privateMessage", {
         playerName: clientPlayer.name,
         otherPlayerName: otherPlayerName,
         message: chatInput.value,
      });

      chatInput.value = "";
   });
}

const chatAddMessage = (socket) => {
   
   // socket.on("addMessageToGeneral", (message) => {
   //    chatDOM.chatList.innerHTML += `<li class="flexCenter message">${message}</li>`;
   // });

   // socket.on("addMessageToPrivate", (message) => {
   //    chatDOM.chatList.innerHTML += `<li class="flexCenter message">${message}</li>`;
   // });

   socket.on("addMessageToGeneral", (message) => getPlayerMessage(chatDOM.chatList, message));

   socket.on("addMessageToPrivate", (message) => getPlayerMessage(chatDOM.chatList, message));
}

const getPlayerMessage = (chatChannel, message) => {
   chatChannel.innerHTML += `<li class="flexCenter message">${message}</li>`;

   const messageTag = document.getElementsByClassName("message");

   for(let i = 0; i < messageTag.length; i++) {
      let messageTagIndexed = messageTag[i];

      messageTagIndexed.addEventListener("mousedown", (event) => {
         if(event.which === 1) extractPlayerName(messageTagIndexed);
      });
   }
}


let otherPlayerName;

const extractPlayerName = (messageTagIndexed) => {
   const prefix = "A >";
   const offlineStr = "< Est déconnecté !";
   let messageText = messageTagIndexed.textContent;
   
   let receiverName;
   let splitedName = messageText.split(": ")[0];
   
   if(splitedName.includes(prefix)) receiverName = splitedName.split(prefix)[1];
   else receiverName = splitedName;
   
   if(receiverName !== ""
   && receiverName !== clientPlayer.name
   && !messageText.includes(offlineStr)) {

      otherPlayerName = receiverName;

      // receiverContent = `A : ${receiverName}`;
      // chatInput.value = "";
   }
}


// =====================================================================
// Init Chat Handler
// =====================================================================
const initChat = (socket) => {
   
   editPlayerName(socket);
   initSearchBar();
   sendMessage(socket);
   chatAddMessage(socket);
}