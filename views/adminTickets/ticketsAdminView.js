const adminToken = localStorage.getItem('adminToken');
document.addEventListener('DOMContentLoaded', function () {
  
  if (!adminToken) {
      console.error('No admin token found. Redirecting to login.');
      window.location.href = 'login.html';
      return;
  }

  loadOpenTickets();
  loadResolvedTickets();
});

let currentResolvingTicketId = null;

function loadOpenTickets() {
  fetch('http://localhost:3000/getAllOpen', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
  })
  .then(response => response.json())
  .then(tickets => displayTickets(tickets, 'openTickets'))
  .catch(error => console.error('Error loading open tickets:', error));
}

function loadResolvedTickets() {
  fetch('http://localhost:3000/getAllResolved', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
  })
  .then(response => response.json())
  .then(tickets => displayTickets(tickets, 'resolvedTickets'))
  .catch(error => console.error('Error loading resolved tickets:', error));
}

function displayTickets(tickets, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  tickets.forEach(ticket => {
      const ticketDiv = document.createElement('div');
      ticketDiv.className = 'ticket';
      ticketDiv.innerHTML = `
          <p>Status: ${ticket.status}</p>
          <p>Description: ${ticket.description}</p>
          <p>Date Created: ${ticket.createdDate}</p>
          <p>User's First Name: ${ticket.userData.firstName}</p>
          <p>User's Last Name: ${ticket.userData.lastName}</p>
          <p>User's Email: ${ticket.userData.email}</p>
          <p>User's Role: ${ticket.userData.role}</p>
          ${ticket.resolutionDate ? `<p>Resolution Date: ${ticket.resolutionDate}</p>` : ''}
          ${ticket.resolutionDescription ? `<p>Resolution Description: ${ticket.resolutionDescription}</p>` : ''}
      `;
      
      if (containerId === 'openTickets') {
          const resolveButton = document.createElement('button');
          resolveButton.textContent = 'Resolve';
          resolveButton.onclick = () => openResolveModal(ticket._id);
          ticketDiv.appendChild(resolveButton);
      }

      container.appendChild(ticketDiv);
  });
}
function toggleTickets(type) {
  let openTicketsContainer = document.getElementById('openTicketsContainer');
  let resolvedTicketsContainer = document.getElementById('resolvedTicketsContainer');

  if (type === 'open') {
      openTicketsContainer.style.display = 'block';
      resolvedTicketsContainer.style.display = 'none';
  } else {
      openTicketsContainer.style.display = 'none';
      resolvedTicketsContainer.style.display = 'block';
  }
}
function openResolveModal(ticketId) {
  currentResolvingTicketId = ticketId;
  document.getElementById('resolveModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('resolveModal').style.display = 'none';
}

function submitResolution() {
  const resolution = document.getElementById('resolutionDescription').value;
  if (!resolution) {
      alert('Resolution description cannot be empty.');
      return;
  }

  fetch(`http://localhost:3000/resolveTicket/${currentResolvingTicketId}`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ resolution })
  })
  .then(response => {
      if (response.ok) {
          alert('Ticket resolved successfully.');
          closeModal();
          loadOpenTickets();
          loadResolvedTickets();
      } else {
          alert('Failed to resolve ticket.');
      }
  })
  .catch(error => {
      console.error('Error resolving ticket:', error);
      alert('An error occurred while resolving the ticket.');
  });
}