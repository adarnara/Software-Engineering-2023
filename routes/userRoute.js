const { createUser, memberLogin, getAllUsers,sellerLogin} = require('../controller/userCtrl');

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

async function register(path,request, response) {
  try {
    const postData = await getPostData(request);
    const userData = JSON.parse(postData);
    const result = await createUser(path,{ body: userData }, response);
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Internal Server Error' }));
  }
}
async function login(path,request, response){
  try {
    const postData = await getPostData(request);
    const userData = JSON.parse(postData);
    if(path === '/member/login'){
      const result = await memberLogin({ body: userData }, response);
    }
    else if ( path === '/seller/login'){
      const result = await sellerLogin({ body: userData }, response);
    }
  } catch (error) {
    console.log(error)
    response.writeHead(500, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Internal Server Error' }));
  }

}
async function allUsers(request,response){
    try{
      getAllUsers(request, response)
    }
    catch(error){
      response.writeHead(500, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ message: 'server error Unable to get all users' }))
    }
}

module.exports = {
  register,
  login,
  allUsers
};
