# Software-Engineering-2023
**Course:** 14:332:452 taught by Ivan Marsic

## Initial Setup:

### Install Dependencies
- Run `npm install` to install dependencies into `node_modules`.

### Start the Server
- Run `npm start` to start the server.

### Access the Website
- Open `landingPage.html` through your desired browser to access the website.

## Using Live Server Extension (Go Live)
For a better development experience with live reloading, use the "Go Live" feature:

### Install Live Server Extension
- Add the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) to your IDE (e.g., Visual Studio Code), if not already installed.

### Go Live
- Right-click on `landingPage.html`.
- Select "Open with Live Server" to view your project in the browser.

## Handling Port Conflicts
If encountering conflicts on port 3000 (backend) or 5500 (front end):

### Identify the Process
- Run `lsof -i :3000` or `lsof -i :5500` in the terminal to find the PID (Process ID) of the process using the port.

### Terminate the Process
- Use `kill <PID>` to terminate the process. Replace `<PID>` with the actual Process ID.

## Project Dependencies

### Dependencies:
- `bcrypt`: ^5.1.1
- `cors`: ^2.8.5
- `dotenv`: ^16.3.1
- `jsonwebtoken`: ^9.0.2
- `mongodb`: ^6.3.0
- `mongodb-memory-server`: ^7.6.3
- `mongoose`: ^7.5.2
- `node`: ^21.1.0
- `shippo`: ^1.7.1
- `node-nlp`: ^4.27.0 ([npm package](https://www.npmjs.com/package/node-nlp), [GitHub repository](https://github.com/axa-group/nlp.js))

### Dev Dependencies:
- `jest`: ^29.7.0
- `mongoose`: ^7.5.2
- `stripe`: ^14.2.0
- `supertest`: ^6.3.3