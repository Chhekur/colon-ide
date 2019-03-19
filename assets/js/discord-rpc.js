const DiscordRPC = require('discord-rpc');
const fs = require('fs');
const path = require('path');
const functions = require('../../menu/functions.js');

let settings_file = fs.readFileSync(path.join(functions.getUserDataPath(), 'settings.json'));
settings_file = JSON.parse(settings_file);


// console.log('loading discord-rpc.js');
if (settings_file.discord['discord-rpc-enable']){
    const clientId = '544485914198409217';

    DiscordRPC.register(clientId);

    const rpc = new DiscordRPC.Client({ transport: 'ipc' });
    const startTimestamp = new Date();

    async function setActivity() {
      if (!rpc || !mainWindow || ! settings_file.discord['discord-rpc-enable']) {
        return;
      }

      // const boops = await mainWindow.webContents.executeJavaScript('window.boops');
      functions.getCurrentWorkingFile(function(filename){
      	// console.log('hello');
    	  	rpc.setActivity({
    	    details: `Working on ${filename}`,
    	    state: settings_file.discord['discord-status'],
    	    startTimestamp,
    	    largeImageKey: 'icon',
    	    largeImageText: 'A flexible text editor',
    	    smallImageKey: 'snek_small',
    	    smallImageText: 'A flexible text editor',
    	    instance: false,
    	  });
      })
      
    }

    rpc.on('ready', () => {
      setActivity();

      // activity can only be set every 15 seconds
      setInterval(() => {
        setActivity();
      }, 15e3);
    });

    rpc.login({ clientId }).catch(console.error);
}