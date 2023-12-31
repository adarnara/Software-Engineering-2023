document.addEventListener('DOMContentLoaded', async function () {
  // Fetch the admin token
  const adminToken = localStorage.getItem('adminToken');
  const adminDetails = await fetchAdminDetails();
    if (adminDetails) {
        document.getElementById('adminName').textContent = adminDetails.adminName;
    } else {
        document.getElementById('adminName').textContent = 'Admin';
    }

    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', function() {
        localStorage.removeItem('adminToken'); // Remove the token
        window.location.href = './login.html'; // Redirect to login page
    });

  if (adminToken) {
      loadUsers(adminToken); // Call loadUsers function with the token
  } else {
      console.error('Admin authentication token not found.');
      // Handle the case where the token is not available
  }
});

let currentPage = 1;
const usersPerPage = 10; // Choose an appropriate number for users per page
let allUsers = []; // This will store all fetched users

async function loadUsers(token) {
  try {
    const response = await fetch('http://localhost:3000/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    allUsers = await response.json(); // Assume this returns an array
    console.log(allUsers)
    if (response.ok) {
      // Sort users by createdAt in descending order (most recent first)
      allUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      renderUsersForPage(currentPage);
    } else {
      console.error('Failed to load users:', allUsers.message);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

function renderUsersForPage(page) {
  const startIndex = (page - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const usersToRender = allUsers.slice(startIndex, endIndex);
  populateUserList(usersToRender);
}
function changePage(offset) {
  const totalPages = Math.ceil(allUsers.length / usersPerPage);
  const newPage = currentPage + offset;

  if (newPage > 0 && newPage <= totalPages) {
    currentPage = newPage;
    renderUsersForPage(currentPage);
  }
}

function populateUserList(users) {
  const userListDiv = document.getElementById('userList');
  userListDiv.innerHTML = ''; // Clear existing content

  users.forEach(user => {
      const userDiv = document.createElement('div');
      userDiv.className = 'user-row';
      userDiv.innerHTML = `
          <span class="user-name">${user.firstName} ${user.lastName}</span>
          <span class="user-role">${user.__t}</span>
          <span class="user-email">${user.email}</span>
          <button class="update-user" onclick="updateUser('${user._id}')">Update</button>
          <button class="delete-user" onclick="deleteUser('${user._id}')">Delete</button>
      `;
      userListDiv.appendChild(userDiv);
  });
  // Update the displayed current page number
  document.getElementById('currentPage').textContent = currentPage;
  // Update the displayed total pages
  document.getElementById('totalPages').textContent = Math.ceil(allUsers.length / usersPerPage);
}

function updateUser(userId) {
  // Store userId in a global variable or in the modal element for later use
  document.getElementById('updateUserModal').setAttribute('data-userid', userId);

  // Show the modal
  document.getElementById('updateUserModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('updateUserModal').style.display = 'none';
}
async function submitUserUpdate() {
  const userId = document.getElementById('updateUserModal').getAttribute('data-userid');
  const firstName = document.getElementById('updateFirstName').value;
  const lastName = document.getElementById('updateLastName').value;
  const email = document.getElementById('updateEmail').value;

  const token = localStorage.getItem('adminToken');
  if (!token) {
      console.error('No admin token found');
      return;
  }

  try {
      const response = await fetch(`http://localhost:3000/updateUser/${userId}`, {
          method: 'PUT',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ firstName, lastName, email })
      });

      if (response.ok) {
          console.log('User updated successfully');
          // Optionally, refresh the user list
          loadUsers(token);
      } else {
          console.error('Failed to update user:', await response.text());
      }
  } catch (error) {
      console.error('Error updating user:', error);
  }

  // Close the modal
  closeModal();
}


async function deleteUser(userId) {
  // Confirmation before deletion
  if (!confirm('Are you sure you want to delete this user?')) {
      return;
  }

  const token = localStorage.getItem('adminToken');
  if (!token) {
      console.error('No admin token found');
      return;
  }

  try {
      const response = await fetch(`http://localhost:3000/user/${userId}`, {
          method: 'DELETE',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      });

      if (response.ok) {
          console.log('User deleted successfully');
          // Optionally, refresh the user list
          loadUsers(token);
      } else {
          console.error('Failed to delete user:', await response.text());
      }
  } catch (error) {
      console.error('Error deleting user:', error);
  }
}


async function fetchAdminDetails() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
      console.error('No admin token found');
      return null;
  }

  try {
      const response = await fetch('http://localhost:3000/admintoken', { 
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      return await response.json();
  } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      return null;
  }
}

