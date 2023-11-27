const userRepository = require('../Repository/userRepo');
const bcrypt = require('bcrypt');

class ForgetPasswordController {
    async changePassword(request, response) {
        try {
            const { email, oldPassword, newPassword } = request.body;

            if (!email || !oldPassword || !newPassword) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ message: 'Missing email, oldPassword, or newPassword field' }));
                return;
            }

            // Find the user by email
            const user = await userRepository.findByEmail(email);

            if (!user) {
                response.writeHead(404, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ message: 'User not found' }));
                return;
            }

            // Compare the  old password with the bcrypt hashed password stored in the DB
            const passwordMatch = await bcrypt.compare(oldPassword, user.password);

            if (!passwordMatch) {
                response.writeHead(401, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ message: 'Incorrect old password' }));
                return;
            }

            // Update the password
            const saltRounds = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
            user.password = hashedNewPassword;

            // Save the updated hashed password to the database
            const updatedUser = await userRepository.updateById(user._id, user);

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                success: true,
                message: 'Password updated successfully',
                user: updatedUser,
            }));
        } catch (error) {
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: error.message }));
        }
    }
}

module.exports = new ForgetPasswordController();
