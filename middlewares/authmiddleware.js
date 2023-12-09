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
        console.trace("A user tried to log in without authorization (no token).");

        response.statusCode = 401;
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({ message: "No authorization provided." }));
        return null;
    } else if (!auth.startsWith("Bearer ")) {
        console.trace("A user tried to log in without authorization (not Bearer scheme).");

        response.statusCode = 400;
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({ message: "Authorization does not follow Bearer scheme." }));
        return null;
    } else {
        let token = auth.slice(7).trim();
        try {
            let userData = parseToken(token);
            if (userData) {
                return userData;
            } else {
                let errorMsg = "Internal authentication error";
                response.statusCode = 500;
                response.setHeader("Content-Type", "application/json");
                response.setHeader(
                    "WWW-Authenticate",
                    `realm="example", error="authorization_failed", error_description=${errorMsg}`
                )
            }
        } catch (err) {
            // This message not always correct. It can be triggered the following
            // ways (realistically):
            //  - Expired token
            //  - Invalid/malformed token
            //  - Key change or some server-side change
            // To change this message, the `parseToken` function needs to return
            // some extra information.
            let errorMsg = err.message;
            response.statusCode = 403;
            response.setHeader("Content-Type", "application/json");
            response.setHeader(
                // Header specified here:
                // https://www.rfc-editor.org/rfc/rfc6750#section-3
                // and somewhere else probably
                "WWW-Authenticate",
                `realm="example", error="invalid_token", error_description="${errorMsg}"`
            );
            response.end(JSON.stringify({ message: errorMsg }));
            return null;
        }
    }
}

/**
 * Unlike parseJwtHeader, this function does not send back a response on a missing
 * or invalid authorization header (JWT token) and instead returns null.
 * @param request {Request} - The request with the header (or without).
 * @returns {object | null} Either the object with the id of the user or null.
 */
function getAuthorization(request) {
    let auth = request.headers["authorization"];
    if (!auth || !auth.startsWith("Bearer ")) {
        return null;
    } else {
        let token = auth.slice(7).trim();
        try {
            return parseToken(token);
        } catch (_) {
            return null;
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
 * Processes the token for validation.
 * @throws {Error} The 
 * @returns {object | null} Shouldn't realistically return null.
 */
function parseToken(token) {
    let data = validateToken(token);
    if (!data || !data.hasOwnProperty("id")) {
        return null;
    } else {
        return { "id": data.id };
    }
}

module.exports = { checkToken, parseToken, parseJwtHeader, getAuthorization };
