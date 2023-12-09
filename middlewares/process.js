const KNOWN_CONTENT_TYPES = [
    "application/json",
    "text/plain",
    "image/png",
    "image/jpg",
];

const TEXT_CONTENT_TYPES = [
    "application/json",
    "text/plain",
];

/**
 * Retrieves the body according to the header of the request.
 *
 * @param request {Request} - The request
 * @param response {Response} - The response the server sends back
 * @returns {Promise<string | object>} The parsed body
 * @throws {Error} On unknown Content-Type header and non-text Content-Type header.
 */
function getBody(request, response) {
    return new Promise(function executor(resolve, reject) {
        // Take a peek at headers to decide how to handle body
        let contentType = request.headers["content-type"];

        if (!contentType || KNOWN_CONTENT_TYPES.includes(contentType)) {
            reject(`getBody:27: Unknown content type header: ${contentType}`);
        }

        if (TEXT_CONTENT_TYPES.includes(contentType)) {
            getTextBodyUnchecked(request, response, contentType === "application/json")
                .then(x => resolve(x))
                .catch(x => reject(x));
        } else {
            // TODO
            reject("getBody:36: Currently unable to handle non-text formats.");
        }
    });
}

/**
 * Does not check the request for its Content-Type header.
 *
 * @param request {Request} - The request
 * @param response {Response} - The response the server sends back
 * @param {boolean} [isJson=false] - Whether to parse the body as JSON
 * @returns {Promise<string | object>} The parsed body
 */
function getTextBodyUnchecked(request, _, isJson = false) {
    return new Promise(function executor(resolve, _) {
        let body = "";

        request.on("data", function(chunk) {
            body += chunk.toString();
        });

        request.on("end", function() {
            if (isJson) {
                resolve(JSON.parse(body));
            } else {
                resolve(body);
            }
        });
    });
}

/**
 * Retrieves the body according to the header of the request.
 *
 * @param request {Request} - The request
 * @param response {Response} - The response the server sends back
 * @returns {Promise<string | object>} The parsed body
 * @throws {Error} On unknown Content-Type header and non-text Content-Type header.
 */
function assertBody(request, response) {
    return new Promise(function executor(resolve, reject) {
        // Take a peek at headers to decide how to handle body
        let contentType = request.headers["content-type"];

        if (!contentType || KNOWN_CONTENT_TYPES.includes(contentType)) {
            response.statusCode = 400;
            response.end(`Unknown content type header: ${contentType}`);
            console.warn("We expected a known content type header, but the client"
                + ` sent '${contentType}'`);
        }

        if (TEXT_CONTENT_TYPES.includes(contentType)) {
            getTextBodyUnchecked(request, response, contentType === "application/json")
                .then(x => resolve(x));
        } else {
            // TODO
            reject("Currently unable to handle non-text formats.");
        }
    });
}

module.exports = { getBody, getTextBodyUnchecked, assertBody }
