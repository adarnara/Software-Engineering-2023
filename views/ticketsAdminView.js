async function displayFirstOpenTicket(ticketData) {
  const ticketContainer = document.getElementById('getFirstOpen');
  if (ticketData.message == "No tickets."){
    const message = document.createElement('p');
    message.textContent = `There are no Open Tickets. All tickets have been resolved`;
    ticketContainer.innerHTML = '';
    ticketContainer.appendChild(message);
  }
  else{
    const statusElem = document.createElement('p');
    statusElem.textContent = `Status: ${ticketData.status}`;
    const descriptionElem = document.createElement('p');
    descriptionElem.textContent = `Description: ${ticketData.description}`;
    const createdDate = document.createElement('p');
    createdDate.textContent = `Date Created: ${ticketData.createdDate}`;
    const firstName = document.createElement('p');
    firstName.textContent = `User's First Name: ${ticketData.userData.firstName}`;
    const lastName = document.createElement('p');
    lastName.textContent = `User's Last Name: ${ticketData.userData.lastName}`;
    const email = document.createElement('p');
    email.textContent = `User's email: ${ticketData.userData.email}`;
    const role = document.createElement('p');
    role.textContent = `User's role: ${ticketData.userData.role}`;
    ticketContainer.innerHTML = '';
    ticketContainer.appendChild(statusElem);
    ticketContainer.appendChild(createdDate);
    ticketContainer.appendChild(descriptionElem);
    ticketContainer.appendChild(firstName);
    ticketContainer.appendChild(lastName);
    ticketContainer.appendChild(email);
    ticketContainer.appendChild(role);
  }
  }

  async function displayAllOpenTickets(ticketsData) {
    const ticketContainer = document.getElementById('getAllOpen');
    if (!ticketContainer) {
        console.error('The ticket container element does not exist.');
        return;
    }
    ticketContainer.innerHTML = '';
    if (Array.isArray(ticketsData) && ticketsData.length === 0) {
        const message = document.createElement('div');
        message.textContent = `There are no Open Tickets. All tickets have been resolved`;
        ticketContainer.appendChild(message);
    }
    else if (ticketsData.message === "No tickets.") {
        const message = document.createElement('div');
        message.textContent = `There are no Open Tickets. All tickets have been resolved`;
        ticketContainer.appendChild(message);
    }
    else{
    ticketContainer.innerHTML = '';
    ticketsData.forEach((ticketData, index) => {
        const ticketDiv = document.createElement('div');
        ticketDiv.classList.add('ticket');
        const statusElem = document.createElement('p');
        statusElem.textContent = `Status: ${ticketData.status}`;
        const descriptionElem = document.createElement('p');
        descriptionElem.textContent = `Description: ${ticketData.description}`;
        const createdDate = document.createElement('p');
        createdDate.textContent = `Date Created: ${ticketData.createdDate}`;
        const firstName = document.createElement('p');
        firstName.textContent = `User's First Name: ${ticketData.userData.firstName}`;
        const lastName = document.createElement('p');
        lastName.textContent = `User's Last Name: ${ticketData.userData.lastName}`;
        const email = document.createElement('p');
        email.textContent = `User's email: ${ticketData.userData.email}`;
        const role = document.createElement('p');
        role.textContent = `User's role: ${ticketData.userData.role}`;
        ticketDiv.appendChild(statusElem);
        ticketDiv.appendChild(descriptionElem);
        ticketDiv.appendChild(createdDate);
        ticketDiv.appendChild(firstName);
        ticketDiv.appendChild(lastName);
        ticketDiv.appendChild(email);
        ticketDiv.appendChild(role);
        ticketContainer.appendChild(ticketDiv);
        if (index < ticketsData.length - 1) {
            const divider = document.createElement('hr');
            ticketContainer.appendChild(divider);
        }
    });
  }
  }

  async function displayAllResolvedTickets(ticketsData){
    const ticketContainer = document.getElementById('getAllResolved');
    if (!ticketContainer) {
        console.error('The ticket container element does not exist.');
        return;
    }
    ticketContainer.innerHTML = '';
    ticketsData.forEach((ticketData, index) => {
        const ticketDiv = document.createElement('div');
        ticketDiv.classList.add('ticket');
        const statusElem = document.createElement('p');
        statusElem.textContent = `Status: ${ticketData.status}`;
        const descriptionElem = document.createElement('p');
        descriptionElem.textContent = `Description: ${ticketData.description}`;
        const createdDate = document.createElement('p');
        createdDate.textContent = `Date Created: ${ticketData.createdDate}`;
        const firstName = document.createElement('p');
        firstName.textContent = `User's First Name: ${ticketData.userData.firstName}`;
        const lastName = document.createElement('p');
        lastName.textContent = `User's Last Name: ${ticketData.userData.lastName}`;
        const email = document.createElement('p');
        email.textContent = `User's email: ${ticketData.userData.email}`;
        const role = document.createElement('p');
        role.textContent = `User's role: ${ticketData.userData.role}`;
        const resolDate = document.createElement('p');
        resolDate.textContent = `Resolution Date: ${ticketData.closureDate}`;
        const resolDescription = document.createElement('p');
        resolDescription.textContent = `Resolution Description: ${ticketData.resolutionDescription}`;
        ticketDiv.appendChild(statusElem);
        ticketDiv.appendChild(descriptionElem);
        ticketDiv.appendChild(createdDate);
        ticketDiv.appendChild(firstName);
        ticketDiv.appendChild(lastName);
        ticketDiv.appendChild(email);
        ticketDiv.appendChild(role);
        ticketDiv.appendChild(resolDate);
        ticketDiv.appendChild(resolDescription);
        ticketContainer.appendChild(ticketDiv);
        if (index < ticketsData.length - 1) {
            const divider = document.createElement('hr');
            ticketContainer.appendChild(divider);
        }
    });
  }

  function openResolveForm() {
    var resolveForm = document.querySelector('.resolve-form');
    resolveForm.style.display = 'block';
}

function submitResolve() {
    var resolveText = document.getElementById('resolveText').value;
    console.log('Resolution:', resolveText);

    fetch('http://localhost:3000/ticket-resolution', { 
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resolution: resolveText })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        window.location.reload();
        return response.json();
    })
    .catch(error => {
        console.error('Error submitting resolution:', error);
    });

    var resolveForm = document.querySelector('.resolve-form');
    resolveForm.style.display = 'none';
}

  document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3000/getFirstOpen', { method: 'GET' })
    .then(response => response.json())
    .then(async data => {
      await displayFirstOpenTicket(data);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });

  fetch('http://localhost:3000/getAllOpen', { method: 'GET' })
  .then(response => response.json())
  .then(async data => {
    await displayAllOpenTickets(data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
  fetch('http://localhost:3000/getAllResolved', { method: 'GET' })
  .then(response => response.json())
  .then(async data => {
    await displayAllResolvedTickets(data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
  const resolveButton = document.querySelector('#resolveButton');
    const submitButton = document.querySelector('#submitButton');

    if(resolveButton) {
        resolveButton.addEventListener('click', openResolveForm);
    }

    if(submitButton) {
        submitButton.addEventListener('click', submitResolve);
    }
});