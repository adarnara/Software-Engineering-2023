document.addEventListener('DOMContentLoaded', function () {
  const adminLoginForm = document.getElementById('adminLoginForm');

  adminLoginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      
      const adminName = document.getElementById('adminName').value;
      const adminKey = document.getElementById('adminKey').value;
      loginAdmin(adminName, adminKey);
  });
});

function showPopup() {
  document.getElementById('loginFailedPopup').style.display = 'block';
}

function closePopup() {
  document.getElementById('loginFailedPopup').style.display = 'none';
}
async function loginAdmin(adminName, adminKey) {
  try {
      const response = await fetch('http://localhost:3000/admin/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              adminName: adminName,
              adminKey: adminKey,
          }),
      });

      const data = await response.json();
      console.log(data)

      if (response.status === 201) {
        const token = data.token
        localStorage.setItem('adminToken', token);
        window.location.href = './dashBoard.html'; 
      } else {
        showPopup()
      }
  } catch (error) {
      console.error('Login Error:', error);
      alert('An error occurred during login.');
  }

}

function logoutAdmin() {
  localStorage.removeItem('adminToken');
  window.location.href = './login.html';
}
