// models/passwordRecovery.js
class SecurityHandler {
  constructor(question, answer) {
    this.question = question;
    this.answer = answer;
    this.nextHandler = null;
  }

  setNext(handler) {
    this.nextHandler = handler;
    return handler;
  }

  // Here, we check only one answer for demonstration.
  // A more complete implementation would handle multiple answers.
  handle(response) {
    if(response === this.answer) {
      if(this.nextHandler) {
        return this.nextHandler.handle(response);
      }
      return true;
    }
    return false;
  }
}

module.exports = SecurityHandler;
