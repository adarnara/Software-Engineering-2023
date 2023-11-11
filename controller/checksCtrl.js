// Instance of namespace class for functions interacting with user/member/seller
// data
const userRepo = require("../Repository/userRepo");

/**
 * Checks the fields of the login/register form.
 * The front-end should send a JSON POST request to a route,
 * which should redirect to this function.
 *
 * The fields should look something like:
 * ```
 * {
 *   "field": "email"  // one of "username", "email", "all", etc.
 *   "email": "abc@example.com"  // if an email should be checked
 *   // should also have a key for "username" if that should be checked.
 *   "type": "member"  // one of "member", "seller", "admin", etc.
 * }
 * ```
 *
 * @param request {object} The request that was sent
 * @param body {object} The body of the request, in JSON
 * @param res {object} The result that the server sends back to the client
 */
async function checkFields(request, body, res) {
    // parse the body to see which one should be checked
    try {
        const needCheck = checkBodyForm(body);
    } catch (e) {
        res.writeHead(400, {
            "Content-Type": "application/json",
        });
        res.end(JSON.stringify({
            "error": e,
        }))
    }

    let checked = {};

    if (needCheck["username"]) {
        if (await checkUsername(body["username"])) {
            checked["username"] = true;
        } else {
            // something like this?
            checked["username"] = false;
            checked["username_reason"] = "Another user with this username already exists";
        }
    }
    if (needCheck["email"]) {
        if (await checkEmail(body["type"], body["email"])) {
            checked["email"] = true;
        } else {
            checked["email"] = false;
            checked["email_reason"] = "Another user with this email already exists";
        }
    }

    res.writeHead(409, {
        "Content-Type": "application/json",
    });
    res.end(JSON.stringify(checked));
}

/**
 * Internal function to check the body format.
 *
 * Throws an error on invalid body format
 *
 * Otherwise returns on object showing what needs to be checked. If it returns
 * such an object. It guarantees that the fields necessary to check them are
 * present within the body.
 */
function checkBodyForm(body) {
    let needCheck = {
        "username": false,
        "email": false,
    };
    let hasUsername = false;
    let hasEmail = false;
    let hasType = false;
    for (const key in body) {
        // Good practice check to see if the property belongs to
        // the body.
        if (Object.prototype.hasOwnProperty.call(body, key)) {
            if (key === "field") {
                if (body[key] === "all") {
                    needCheck.username = true;
                    needCheck.email = true;
                } else if (body[key] === "username") {
                    needCheck.username = true;
                } else if (body[key] === "email") {
                    needCheck.email = true;
                } else {
                    let value = body[key];
                    throw new Error(`Invalid value for key 'field': ${value}`);
                }
            } else if (key === "username") {
                if (typeof body[key] !== "string") {
                    throw new Error("Value of 'username' should be a string");
                }
                hasUsername = true;
            } else if (key === "email") {
                if (typeof body[key] !== "string") {
                    throw new Error("Value of 'email' should be a string.");
                }
                hasEmail = true;
            } else if (key === "type") {
                const validTypes = ["member", "seller", "admin"];
                const val = body[key];
                if (!validTypes.includes(val)) {
                    throw new Error(`Invalid value for key 'type': ${val}`);
                }
            } else {
                // unknown key
                throw new Error(`Unknown key '${key}' with value: ${body[key]}`);
            }
        }
    }

    // Not sure if I should throw on excess fields
    if (needCheck["username"] !== hasUsername) {
        throw new Error("Extra or missing username field");
    }
    if (needCheck["email"] !== hasEmail) {
        throw new Error("Extra or missing email field");
    }
    if (!hasType) {
        throw new Error("Don't know what account type to search in");
    }

    return needCheck;
}

/**
 * Currently throws an missing implementation error.
 *
 * @param username {string} The username to check.
 * @returns {boolean} Whether the username is valid
 */
async function checkUsername(username) {
    throw new Error("Usernames not yet implmented");
}

/**
 * TODO: actually implement this
 * @param accountType {string} Either "member", "seller", or "admin".
 * @param email {string} The email to check.
 * @returns {boolean} Whether the email is valid
 */
async function checkEmail(accountType, email) {
    // Quick format check with regex (hopefully quick anyway)
    if (!email.match(/^.*@.*[.].*$/)) {
        return false;
    }

    // Check database
    // TODO: based on accountType
    let searched = await userRepo.findByEmail(email);
    if (searched) {
        return false;
    }

    return true;
}

module.exports = {
    checkFields,
};
