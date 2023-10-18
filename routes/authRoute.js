const { createMember, memberLogin} = require('../controller/memberCtrl');

function getPostData(request) {
  return new Promise((resolve, reject) => {
    try {
      let body = '';
      request.on('data', chunk => {
        body += chunk.toString(); 
      });
      request.on('end', () => {
        resolve(body);
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function register(request, response) {
  try {
    const postData = await getPostData(request);
    const userData = JSON.parse(postData);
    const result = await createMember({ body: userData }, response);
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Internal Server Error' }));
  }
}
async function login(request, response){
  try {
    const postData = await getPostData(request);
    const userData = JSON.parse(postData);
    const result = await memberLogin({ body: userData }, response);
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Internal Server Error' }));
  }

}

module.exports = {
  register,
  login
};
