
"use strict"

class RegEx {
   constructor() {

      this.normalText = new RegExp(/^[A-Za-zÜ-ü0-9 ]+$/);
      this.specialText = new RegExp(/^[A-Za-zÜ-ü0-9 !@#$%^&*()=]+$/);
   }
}

module.exports = RegEx;