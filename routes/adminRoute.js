const { createAdmin, Login} = require('../controller/adminCtrl');

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

async function adminRegister(request, response) {
  try {
    const postData = await getPostData(request);
    const adminData = JSON.parse(postData);
    const result = await createAdmin({ body: adminData }, response);
  } catch (error) {
    console.log(error)
    response.writeHead(500, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Internal Server Error' }));
  }
}
async function adminLogin(request, response){
  try {
    const postData = await getPostData(request);
    const adminData = JSON.parse(postData);
    const result = await Login({ body: adminData }, response);
  } catch (error) {
    console.log(error)
    response.writeHead(500, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Internal Server Error' }));
  }

}

module.exports = {
  adminRegister,
  adminLogin
};