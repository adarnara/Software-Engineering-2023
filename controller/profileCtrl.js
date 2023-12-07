const userRepo = require("../Repository/userRepo");
const { parseJwtHeader } = require("../middlewares/authmiddleware");

class ProfileController {
    async updateProfile(request, response) {
        try {
            const userData = parseJwtHeader(request, response);

            // We continue handling if the JWT was valid.
            if (userData) {
                const user = await userRepo.findUserById(userData.id);
                // Set some properties to return.
                userData.firstName = user.firstName;
                userData.lastName = user.lastName;
                userData.email = user.email;
                userData.role = user.role;

                let body = '';
                request.on('data', chunk => {
                    body += chunk.toString();
                });

                request.on('end', async () => {
                    const userUpdateData = JSON.parse(body);
                    try {

                        if (userUpdateData.email) {
                            const existingUser = await userRepo.findByEmail(userUpdateData.email);
                            if (existingUser && existingUser._id.toString() !== userData.id) {
                                response.writeHead(400, { 'Content-Type': 'application/json' });
                                response.end(JSON.stringify({ message: 'Email already in use' }));
                                return;
                            }
                        }

                        const updatedUser = await userRepo.updateProfile(userData.id, userUpdateData);

                        if (!updatedUser) {
                            response.writeHead(404, { 'Content-Type': 'application/json' });
                            response.end(JSON.stringify({ message: 'User not found' }));
                        } else {
                            response.writeHead(200, { 'Content-Type': 'application/json' });
                            response.end(JSON.stringify(updatedUser));
                        }
                    } catch (error) {
                        console.error('Update Error:', error);
                        response.writeHead(500, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ message: 'Server error. Unable to update user.' }));
                    }
                });
            }
        } catch (error) {
            console.error('Request Handling Error:', error);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    }
    async getUserById(request, response) {
        try {
            const userData = parseJwtHeader(request, response);

            // Continue handling if the JWT was valid.
            if (userData) {
                const userId = userData.id; // Assuming user ID is in the JWT payload.

                try {
                    const user = await userRepo.findUserById(userId);

                    if (!user) {
                        response.writeHead(404, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ message: 'User not found' }));
                    } else {
                        response.writeHead(200, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify(user));
                    }
                } catch (error) {
                    console.error('Get User by ID Error:', error);
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ message: 'Server error. Unable to get user information.' }));
                }
            }
        } catch (error) {
            console.error('Request Handling Error:', error);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    }
}

module.exports = new ProfileController();


