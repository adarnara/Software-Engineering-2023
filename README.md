#Software-Engineering-2023

Course: 14:332:452 taught by Ivan Marsic

Initial Setup:

	1.	Install Dependencies
	•	Run npm install to install dependencies into node_modules.
	2.	Start the Server
	•	Run npm start to start the server.
	3.	Access the Website
	•	Open landingPage.html through your desired browser to access the website.

#Using Live Server Extension (Go Live)

To use the “Go Live” feature for a better development experience:

	1.	Install Live Server Extension
	•	If not already installed, add the Live Server extension to your IDE (e.g., Visual Studio Code).
	2.	Go Live
	•	Right-click on landingPage.html.
	•	Select “Open with Live Server” to view your project in the browser with live reloading.

Handling Port Conflicts

If something is already running on port 3000 (backend) or 5500 (front end):

	1.	Identify the Process
	•	Run lsof -i :3000 or lsof -i :5500 in the terminal to find the PID (Process ID) of the process using the port.
	2.	Terminate the Process
	•	Use kill <PID> to terminate the process. Replace <PID> with the actual Process ID.

Project Dependencies

Dependencies:

	•	@elastic/elasticsearch: ^8.10.0
	•	bcrypt: ^5.1.1
	•	child_process: ^1.0.2
	•	cors: ^2.8.5
	•	dotenv: ^16.3.1
	•	jsonwebtoken: ^9.0.2
	•	moment-timezone: ^0.5.43
	•	mongodb: ^6.3.0
	•	mongodb-memory-server: ^7.6.3
	•	mongoose: ^7.5.2
	•	natural: ^6.9.2
	•	node: ^21.1.0
	•	readline: ^1.3.0
	•	shippo: ^1.7.1

Dev Dependencies:

	•	jest: ^29.7.0
	•	mongoose: ^7.5.2
	•	node-nlp: ^4.27.0
	•	path: ^0.12.7
	•	stripe: ^14.2.0
	•	supertest: ^6.3.3

Scripts:

	•	test: “jest –forceExit –detectOpenHandles –watchAll –runInBand”}