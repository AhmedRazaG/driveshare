// models/passwordRecovery.js

/**
 * The SecurityHandler class represents one handler in the chain,
 * responsible for verifying one security question.
 */
class SecurityHandler {
  /**
   * @param {string} question - The security question text.
   * @param {string} answer - The expected answer (e.g., stored securely).
   */
  constructor(question, answer) {
    this.question = question;
    this.answer = answer;
    this.nextHandler = null;
  }
  
  /**
   * Sets the next handler in the chain.
   * @param {SecurityHandler} handler 
   * @returns {SecurityHandler} The handler that was set (for chaining).
   */
  setNext(handler) {
    this.nextHandler = handler;
    return handler;
  }
  
  /**
   * This method is designed for individual check, but because our process
   * will verify all answers at once, we use a separate helper function.
   * (You could extend this for interactive, step-by-step checking.)
   * @param {string} userAnswer 
   * @returns {boolean} True if the answer is correct.
   */
  handle(userAnswer) {
    return userAnswer.trim().toLowerCase() === this.answer.trim().toLowerCase();
  }
}

/**
 * validateSecurityChain checks whether the user-provided answers match
 * the expected answers from a given array of SecurityHandler objects.
 * @param {string[]} answers - An array of user provided answers.
 * @param {SecurityHandler[]} handlers - An array of handlers (in order).
 * @returns {boolean} True if all answers are correct; otherwise, false.
 */
function validateSecurityChain(answers, handlers) {
  if (answers.length !== handlers.length) return false;
  for (let i = 0; i < handlers.length; i++) {
    if (!handlers[i].handle(answers[i])) {
      return false;
    }
  }
  return true;
}

module.exports = { SecurityHandler, validateSecurityChain };
