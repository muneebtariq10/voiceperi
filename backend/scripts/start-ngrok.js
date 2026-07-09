const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const NGROK_PORT = 3000;
const ENV_PATH = path.join(__dirname, '..', '.env');

console.log(`Starting ngrok on port ${NGROK_PORT}...`);

// Assuming ngrok is installed globally or in PATH
const ngrokProcess = spawn('ngrok', ['http', NGROK_PORT, '--log=stdout'], {
  shell: true,
});

let urlFound = false;

ngrokProcess.stdout.on('data', (data) => {
  const output = data.toString();
  
  // Look for the URL in ngrok's logs
  const urlMatch = output.match(/url=(https:\/\/[a-zA-Z0-9-]+\.ngrok-free\.app)/);
  if (urlMatch && !urlFound) {
    urlFound = true;
    const publicUrl = urlMatch[1];
    console.log(`\n✅ Ngrok Tunnel Established: ${publicUrl}`);
    
    // Update .env file
    if (fs.existsSync(ENV_PATH)) {
      let envContent = fs.readFileSync(ENV_PATH, 'utf8');
      
      const newRetellWebhook = `${publicUrl}/api/retell-webhook`;
      const newStripeWebhook = `${publicUrl}/api/webhook`;

      // Update RETELL_WEBHOOK_URL
      if (envContent.includes('RETELL_WEBHOOK_URL=')) {
        envContent = envContent.replace(/RETELL_WEBHOOK_URL=.*/g, `RETELL_WEBHOOK_URL=${newRetellWebhook}`);
      } else {
        envContent += `\nRETELL_WEBHOOK_URL=${newRetellWebhook}`;
      }

      console.log(`\nUpdated RETELL_WEBHOOK_URL to: ${newRetellWebhook}`);
      console.log(`Please update your Stripe Webhook in the Stripe Dashboard to point to: ${newStripeWebhook}`);

      fs.writeFileSync(ENV_PATH, envContent, 'utf8');
      console.log('✅ Updated backend/.env automatically.\n');
      console.log('Leave this terminal running. Press Ctrl+C to stop the tunnel.');
    } else {
      console.error('.env file not found at:', ENV_PATH);
    }
  }
});

ngrokProcess.stderr.on('data', (data) => {
  console.error(`ngrok error: ${data}`);
});

ngrokProcess.on('close', (code) => {
  console.log(`ngrok process exited with code ${code}`);
});
