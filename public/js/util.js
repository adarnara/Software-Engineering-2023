/// --- Read me! ---
///
/// This file contains utility functions (hopefully) to be used by other
/// members of this group. This file also defines some constants which
/// can localize some front-end configuration.
///
/// # Overview
/// This file currently has functions to:
/// - Handle storing JWT
/// - Handle retrieving JWT
/// - Authorize a fetch request
/// - Check if the user is logged in (depends on the `/token` route)
/// - Send some info if the user is logged in (see above)
///
/// # Best Practices?
/// - Use relative paths for front-end
/// - Use these constants for accessing back-end (and when otherwise possible)
/// - Make a separate file for any decent amount of JS or CSS code
/// - Use "TODO" to mark temporary code
/// - Log things!
/// - Document your functions!
/// - Handle ALL the edge cases!
/// - Read and check others' code
/// - Write tests for your back-end code
///
/// --- Read me! ---

// --- CONSTANTS ---
// General
const SERVER_PORT = 3000;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;
// These are generally not used as relative/domain-less URLs are preferred
const CLIENT_PORT = 5500;
const CLIENT_URL = `http://localhost:${CLIENT_PORT}`;
// Token
const JWT_LOCAL_STORAGE_NAME = "token";
const JWT_AUTH_ROUTE = "/token";

/**
 * Synchronously checks if the user is signed in by sending the token in
 * `localStorage` to the server for validity.
 * The promise will be *rejected* if there is a server error, so make those
 * `try/catch` blocks!
 *
 * - This function currently does not interact with refresh tokens.
 * - This function may throw errors!
 * - This function does its best to log errors.
 *
 * @returns {Promise<object | null>} Is `null` if not signed in (or some nullish value)
 *     and an object containing some user information if the user is signed in.
 * @throws {Error} Will throw an error on a status code above 300 from the server.
 */
async function checkToken() {
    if (!getJwtToken()) {
        console.warn("Checking token when no token exists!");
        return null;
    }

    let response = await authorize(JWT_AUTH_ROUTE);
    // Likely caused by no token present
    if (!response) {
        return null;
    }
    // Check if there is a header for JSON.
    if (response.headers.get("Content-Type") === "application/json") {
        let body = response.json();
        if (response.status >= 300) {
            let msg = body.message ?? "No additional information given";
            throw new Error(
                `An error occurred while accessing ${JWT_AUTH_ROUTE}\n`
                    + `Status code ${response.status}: ${response.statusText}\n`
                    + `${msg}`
            );
        }
        return body;
    } else {
        console.warn("Normally the server should return JSON, but in"
            + " this case, it didn't. The `checkToken` function will"
            + " return null. Here's the response object:");
        console.log(response);
        if (response.headers.get("Content-Type") === "text/html") {
            // For stray 404 weirdness and hosting?
            console.warn("The server also sent back some html in the body");
        } else if (response.headers.get("Content-Type") === "text/plain") {
            console.warn("The server also sent back some plaintext in the"
                + " body");
        }
        return null;
    }
}

/**
 * A wrapper around `localStorage.setItem`, just in case we want to change to
 * `sessionStorage` or cookies later.
 *
 * @param key {string} - The key of the key-value pair. This is how you will
 *     access the `value` later.
 * @param value {any} - The value to be stored in storage for later retrieval.
 */
function setJwtToken(value) {
    localStorage.setItem(JWT_LOCAL_STORAGE_NAME, value);
}

/**
 * An alterantive to `getJwtToken` that errors if the token is not found
 *
 * @returns {string?} The token if it exists.
 * @throws {Error} If the JWT is not found, an error will be thrown.
 */
function assertJwtToken() {
    let token = getJwtToken();
    if (!token) {
        throw new Error("A JWT token was required but not found. Is the"
            + " user signed in?");
    }
    return token;
}

/**
 * Currently removes the JWT from local storage.
 */
function removeJwtToken() {
    localStorage.removeItem(JWT_LOCAL_STORAGE_NAME);
}

/**
 * Acts as `fetch`, except this adds the authorization headers.
 *
 * Tries to return what fetch returns. No callback arguments though.
 *
 * @param url {string} - The url to send the request to.
 * @param data {object} - Leave blank if not intending to use. Otherwise
 *     this is the Fetch API's data parameter.
 * @param suppress {boolean} - Set to true to suppress console messages.
 *     Only use this on really weird edge cases or when you're sure.
 * @returns {null | Promise<Response>} Is null if the token does not exist,
 *     otherwise returns what the fetch request returns.
 */
async function authorize(url, data = {}, suppress = false) {
    if (url.startsWith("/")) {
        // send the request to the correct server by using the
        // SERVER_URL constant
        url = `${SERVER_URL}${url}`;
    }

    if (typeof data === "object") {
        data.headers = data.headers ?? {};
    } else {
        if (!suppress) {
            console.error("Invalid usage of the `authorize` function. Check"
                + " that you didn't a non-object in the second parameter? If"
                + " you're not setting anything there, remember to leave it"
                + " blank!");
        }
        throw new Error(`Invalid type for data: ${typeof data}`);
    }

    // Check for token in local storage

    const jwt_token = assertJwtToken();
    data.headers["Authorization"] = `Bearer ${jwt_token}`;

    if (!url.startsWith(SERVER_URL)) {
        if (!suppress) {
            console.warn("Sending an authorization request to a url that does"
                + " not correspond to the url for the server configured in this"
                + " file (public/util.js). Either change the constant in this"
                + " file, or remember to use the SERVER_URL constant from this"
                + " file!");
        }
    }

    let response = await fetch(url, data);

    if (response.status === 403 && response.headers.get("WWW-Authenticate")) {
        let fields = parseKVHeader(response.headers.get("WWW-Authenticate"));

        if (!suppress) {
            console.warn(`An error occured when handling JWT:\n`
                + `  ${fields["error_description"]}\n\n`
                + "Removing JWT token.");
        }

        removeJwtToken();
    }

    return response;
}

/**
 * An elementary parser. Doesn't work for keys/values with commas.
 * @param data {string} - The data associated with the header.
 * @returns {object} The parsed header
 */
function parseKVHeader(data) {
    let parsed = data.split(",");
    let fields = {};
    for (const s of parsed) {
        let matching = s.trim().match(/([a-zA-Z0-9_]+)\s?=\s?"(.*)"/);
        if (matching) {
            let key = matching[1];
            let value = matching[2];
            fields[key] = value;
        } else {
            console.warn("There was an issue while parsing a K-V header."
                + " (Probably WWW-Authenticate)");
        }
    }
    return fields;
}

/**
 * Gets the JWT token if possible. If not, this returns null.
 *
 * @returns {string | null} The JWT for the token OR null.
 */
function getJwtToken() {
    const jwt_token = localStorage.getItem(JWT_LOCAL_STORAGE_NAME);
    if ((jwt_token ?? null !== null) && typeof jwt_token !== "string") {
        console.warn("A JWT token was found, but it was not the correct"
            + " format. If there is a JWT meant to be used, please make"
            + " sure that it is a string.");
        return null;
    } else if (jwt_token && typeof jwt_token === "string") {
        return jwt_token;
    } else {
        return null;
    }
}

/**
 * Receives a response from the server and packages the body
 * into the response. Does not authorize.
 * Wraps `fetch`.
 *
 * @returns {Promise<Response>} The response of the fetch with the
 *     body attached in the `body` field. Access with `response.body`,
 *     for example.
 */
async function fetchBody(url, data = {}) {
    let response = await fetch(url, data);

    if (response.status >= 300) {
        console.error(`An error occurred fetching from ${url}. Stopping`
            + " processing of response.");
        let msg = response.message ?? "No additional information given.";
        throw new Error(`An error occured fetching from ${url}.\n`
            + `Status ${response.status}: ${response.statusText}.\n`
            + `${msg}`);
    }

    // Handle the body
    const contentType = response.headers.get("Content-Type");
    if (contentType === "application/json") {
        const body = response.json();
        response.body = body;
    } else if (contentType === "text/plain") {
        const body = response.text();
        response.body = body;
    }

    return response;
}

/**
 * Acts as `fetchBody`, except this adds the authorization headers.
 *
 * @param url {string} - The url to send the request to.
 * @param data {object} - Leave blank if not intending to use. Otherwise
 *     this is the Fetch API's data parameter.
 * @returns {null | Promise<Response>} Is null if the token does not exist,
 *     otherwise returns what the fetch request returns. Contains the body,
 *     so subsequent `.json()` calls will fail.
 */
async function authorizeBody(url, data = {}) {
    if (url.startsWith("/")) {
        // send the request to the correct server by using the
        // SERVER_URL constant
        url = `${SERVER_URL}${url}`;
    }

    if (typeof data === "object") {
        data.headers = data.headers ?? {};
    } else {
        console.error("Invalid usage of the `authorizeBody` function. Check"
            + " that you didn't a non-object in the second parameter? If"
            + " you're not setting anything there, remember to leave it"
            + " blank!");
        throw new Error(`Invalid type for data: ${typeof data}`);
    }

    // Check for token in local storage
    const jwt_token = getJwtToken();
    if (!jwt_token) {
        return null;
    }

    data.headers["Authorization"] = `Bearer ${jwt_token}`;

    if (!url.startsWith(SERVER_URL)) {
        console.warn("Sending an authorization request to a url that does"
            + " not correspond to the url for the server configured in this"
            + " file (public/util.js). Either change the constant in this"
            + " file, or remember to use the SERVER_URL constant from this"
            + " file!");
    }

    return await fetchBody(url, data);
}
