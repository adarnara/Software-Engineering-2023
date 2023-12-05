document.addEventListener('DOMContentLoaded', function () {
  const adminRegistrationForm = document.getElementById('adminRegistrationForm');

  adminRegistrationForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const adminName = document.getElementById('newAdminName').value;
      const adminKey = document.getElementById('newAdminKey').value;

      registerAdmin(adminName, adminKey);
  });
});

async function registerAdmin(adminName, adminKey) {
  try {
      const response = await fetch('http://localhost:3000/admin/register', {
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

      if (response.status === 201) {
          alert('Admin Registered Successfully!');
          window.location.href = '/views/admin/login.html'
      } else {
          // Handle errors (like admin already exists)
          alert(data.message);
      }
  } catch (error) {
      console.error('Registration Error:', error);
      alert('An error occurred during registration.');
  }
}
