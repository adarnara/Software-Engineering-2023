const { spawn } = require('child_process');
const readline = require('readline');

// Function to start Elasticsearch
const startElasticsearch = async () => {
    const command = './config/elasticsearch-8.11.1/bin/elasticsearch';

    const elasticsearchProcess = spawn(command);

    elasticsearchProcess.on('exit', (code) => {
        console.error(`Error: Elasticsearch process exited with code ${code}`);
    });

    elasticsearchProcess.stderr.on('data', (data) => {
        // Handle stderr if needed
    });

    const rl = readline.createInterface({
        input: elasticsearchProcess.stdout,
        terminal: false
    });

    setTimeout(() => {
        console.log("Elastic Search is starting...");
    }, 30000); // 30 seconds delay
};

// Export the function
module.exports = startElasticsearch;
