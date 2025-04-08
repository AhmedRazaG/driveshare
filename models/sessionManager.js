// models/sessionManager.js
class SessionManager {
  constructor() {
    // This object will hold our session data; for a production app use a persistent session store.
    if (!SessionManager.instance) {
      this.sessions = {};
      SessionManager.instance = this;
    }
    return SessionManager.instance;
  }

  /**
   * Creates a session for the given user id.
   * @param {number} userId 
   * @returns {string} sessionId
   */
  createSession(userId) {
    // Generate a simple sessionId (use a more secure method in production)
    const sessionId = Date.now() + "-" + Math.random();
    this.sessions[sessionId] = { userId, createdAt: new Date() };
    return sessionId;
  }

  /**
   * Retrieves the session details.
   * @param {string} sessionId 
   * @returns {object|null} session data or null if not found
   */
  getSession(sessionId) {
    return this.sessions[sessionId] || null;
  }
}

// Freeze the instance to ensure a single instance is used
const instance = new SessionManager();
Object.freeze(instance);
module.exports = instance;
