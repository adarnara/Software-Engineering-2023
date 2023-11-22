const userRepo = require("../Repository/userRepo");

class ProfileController {
    async updateProfile(request, response) {
        const { userId } = request.params; // Extracting id from request params

        try {
            let body = '';
            request.on('data', chunk => {
                body += chunk.toString();
            });

            request.on('end', async () => {
                const userUpdateData = JSON.parse(body);
                try {
                    const updatedUser = await userRepo.updateById(userId, userUpdateData);

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
        } catch (error) {
            console.error('Request Handling Error:', error);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    }
}

module.exports = new ProfileController();
