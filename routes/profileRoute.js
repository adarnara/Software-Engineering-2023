const profileController = require('../controller/profileCtrl');

const profileRoutes = {
    'PUT/profile/updateProfile': async (request, response) => {
        await profileController.updateProfile(request, response);
    },
    'GET/profile/getUser': async (request, response) => {
        await profileController.getUserById(request, response);
    },
};

module.exports = profileRoutes;
