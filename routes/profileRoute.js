const profileController = require('../controller/profileCtrl');

const profileRoutes = {
    'PUT/profile/updateProfile/': async (request, response) => {
        await profileController.updateProfile(request, response);
    },
};

module.exports = profileRoutes;
