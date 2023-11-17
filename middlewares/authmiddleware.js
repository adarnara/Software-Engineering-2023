const User = require('../models/users')
const jwt = require('jsonwebtoken')
const { validateToken } = require("../config/jwt");

/**
 * Checks a JWT against a user id.
 * @param token {object} - The JWT.
 * @returns {boolean}  if valid token
 */
function checkToken(token, id) {
    let data = validateToken(token);
    if (!data) {
        return false;
    } else {
        // TODO: implmement -!-
        console.log(`-!- ${data}`);
    }
}

/**
 * Mostly a test function for getting the username on
 * the landing page
 */
function usernameForToken(token) {
    let data = null;
    try {
        data = validateToken(token);
    } catch {
        // -!- TODO: Temporary handling (replace with better messages?)
        return null;
    }
    if (!data) {
        return null;
    } else {
        return { "id": data.id };
    }
}

module.exports = { checkToken, usernameForToken };
