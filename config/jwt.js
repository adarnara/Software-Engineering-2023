const jwt = require('jsonwebtoken');


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_KEY, { expiresIn: '1d' });
}

/**
 * Literally calls the `verify` function from `jsonwebtoken` using the
 * key.
 * @param token {object} - The JWT token, in object format (not a string).
 */
function validateToken(token) {
    return jwt.verify(token, process.env.JWT_KEY);
}

module.exports = { generateToken, validateToken }
