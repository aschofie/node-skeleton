import fs from 'node:fs';
import readline from 'node:readline';
import { execSync } from 'node:child_process';

async function processFile() {
  const fileStream = fs.createReadStream('testData.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log('Starting to POST data to localhost:3000/onboarding...');

  let count = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;

    count++;
    try {
      // Using curl to POST each line as requested
      // We escape the line content to safely pass it to the shell
      const command = `curl -s -X POST -H "Content-Type: application/json" -d '${line.replace(/'/g, "'\\''")}' http://localhost:3000/onboarding`;
      
      console.log(`[${count}] POSTing: ${line}`);
      const response = execSync(command).toString();
      
      if (response) {
        console.log(`Response: ${response}`);
      }
    } catch (error) {
      console.error(`Error POSTing line ${count}: ${error.message}`);
    }
  }

  console.log('Finished processing all lines.');
}

processFile().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
