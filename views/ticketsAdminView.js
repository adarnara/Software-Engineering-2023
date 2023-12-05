async function displayTicket(ticketData) {
    const ticketContainer = document.getElementById('getFirstOpen');
        if (!ticketContainer) {
      console.error('The ticket container element does not exist.');
      return;
    }
    /*
    const userID = document.createElement('p');
    userID.textContent = `User ID: ${ticketData.userId}`;
    */
    console.log(ticketData);
    const descriptionElem = document.createElement('p');
    descriptionElem.textContent = `Description: ${ticketData.description}`;

    const createdDate = document.createElement('p');
    createdDate.textContent = `Date Created: ${ticketData.createdDate}`;
    
    const statusElem = document.createElement('p');
    statusElem.textContent = `Status: ${ticketData.status}`;
  
    ticketContainer.innerHTML = '';
    //ticketContainer.appendChild(userID);
    ticketContainer.appendChild(statusElem);
    ticketContainer.appendChild(createdDate);
    ticketContainer.appendChild(descriptionElem);
  }
  
  // Ensure DOM is fully loaded before running the script
  document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/getFirstOpen', { method: 'GET' })
      .then(response => response.json())
      .then(async data => {
        await displayTicket(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  });
  