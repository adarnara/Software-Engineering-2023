const User = require('../models/users')
const jwt = require('jsonwebtoken')
const { validateToken } = require("../config/jwt");

/**
 * Parses the jwt in a header, and sends invalid authorization responses if the
 * authorization is incorrect. This should be used a check before processing
 * privileged requests.
 *
 * @param request {object} - The request that was sent (body not needed).
 * @param response {object} - The response the server will give back to the client.
 *     This will be used to send 400-related error codes in case the authorization
 *     does not succeed.
 * @returns {null | object} null if invalid (caller should stop processing request).
 *     Handles sending back the response if the return is false.
 *     An object if valid (caller should continue processing request).
 *     The object will have an `id` field for the user that the JWT authorizes.
 */
function parseJwtHeader(request, response) {
    let auth = request.headers["authorization"];
    if (!auth) {
        response.statusCode = 401;
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({ message: "No authorization provided." }));
        return null;
    } else if (!auth.startsWith("Bearer ")) {
        response.statusCode = 400;
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({ message: "Authorization does not follow Bearer scheme." }));
        return null;
    } else {
        let token = auth.slice(7).trim();
        let userData = parseToken(token);
        if (!userData) {
            // This message not always correct. It can be triggered the following
            // ways (realistically):
            //  - Expired token
            //  - Invalid/malformed token
            //  - Key change or some server-side change
            // To change this message, the `parseToken` function needs to return
            // some extra information.
            let errorMsg = "Token expired.";
            response.statusCode = 403;
            response.setHeader("Content-Type", "application/json");
            response.setHeader(
                // Header specified here:
                // https://www.rfc-editor.org/rfc/rfc6750#section-3
                // and somewhere else probably
                "WWW-Authenticate",
                `realm="example"\nerror="invalid_token"\nerror_description="${errorMsg}"`
            );
            response.end(JSON.stringify({ message: errorMsg }));
            return null;
        } else {
            return userData;
        }
    }
}

/**
 * Checks a JWT against a user id.
 * @param token {object} - The JWT.
 * @returns {boolean} true if the token is valid
 */
function checkToken(token, id) {
    let data = validateToken(token);
    if (!data) {
        return false;
    } else {
        return parseToken(token)?.id === id;
    }
}

/**
 * Mostly a test function for getting the username on
 * the landing page
 * @returns {object | null} Returns null if the token is not valid.
 */
function parseToken(token) {
    let data = null;
    try {
        data = validateToken(token);
    } catch {
        // -!- TODO: Temporary handling (replace with better messages?)
        // Errors to handle:
        //  - TokenExpiredError
        //    - "jwt expired"
        //  - JsonWebTokenError
        //    - "invalid token"
        //    - "jwt malformed"
        //    - "jwt signature is required"
        //    - "invalid signature"
        //    - "jwt audience invalid..."
        //    - "jwt issuer invalid..."
        //    - "jwt id invalid..."
        //    - "jwt subject invalid..."
        //  - NotBeforeError (not used in our implementation)
        //    - "jwt inactive"
        
        return null;
    }
    if (!data) {
        return null;
    } else {
        return { "id": data.id };
    }
}

module.exports = { checkToken, parseToken, parseJwtHeader };
