async function displayFirstOpenTicket(ticketData) {
    const ticketContainer = document.getElementById('getFirstOpen');
        if (!ticketContainer) {
      console.error('The ticket container element does not exist.');
      return;
    }
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

  async function displayAllOpenTickets(ticketsData) {
    const ticketContainer = document.getElementById('getAllOpen');
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
});