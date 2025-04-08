// models/sessionManager.js
class SessionManager {
  constructor() {
    if (!SessionManager.instance) {
      this.sessions = {};
      SessionManager.instance = this;
    }
    return SessionManager.instance;
  }

  createSession(userId) {
    // A simple session id
    const sessionId = Date.now() + "-" + Math.random();
    this.sessions[sessionId] = { userId, createdAt: new Date() };
    return sessionId;
  }

  getSession(sessionId) {
    return this.sessions[sessionId];
  }
}

const instance = new SessionManager();
Object.freeze(instance);
module.exports = instance;
