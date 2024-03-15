const { app: electronApp, Menu, Tray } = require('electron');
const path = require('path');

const { readFile } = require('fs');
const express = require('express');
const cors = require('cors');

const { exec } = require('child_process');





let tray;

electronApp.whenReady().then(() => {
    // Tray
    const icon = path.join(__dirname, '../../images/icon.png');
    tray = new Tray(icon);
    tray.setToolTip('Keyboard over Network to TTS');

    // Network
    checkConnectionStatus();
    setTray();
    setInterval(() => { 
        checkConnectionStatus();
        setTray();
    }, 10000);

    // App
    loadSettings();
    startExpressApp();
});





// Tray

function setTray() {
    const contextMenu = Menu.buildFromTemplate([ 
        { label: `IP: ${IP_ADDRESS}` }, 
        { label: `PORT: ${PORT}` }, 
        { label: 'Shutdown', click: () => electronApp.exit() }
    ]);
    
    tray.setContextMenu(contextMenu);
}





// Network

let IP_ADDRESS = 'No Router';
let PORT = 7979;

function getIPAddress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
      var iface = interfaces[devName];
  
      for (var i = 0; i < iface.length; i++) {
        var alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
          return alias.address;
      }
    }
    return '0.0.0.0';
}

function checkConnectionStatus() {
    let NEW_IP_ADDRESS = getIPAddress();

    if (NEW_IP_ADDRESS === '0.0.0.0') {
        console.log('No connection to router detected.');
        IP_ADDRESS = 'No Router';
        return false;
    }

    if (IP_ADDRESS === NEW_IP_ADDRESS) {
        return false
    }

    IP_ADDRESS = NEW_IP_ADDRESS;
    if (expressApp) {
        expressApp.listen(PORT, IP_ADDRESS, () => console.log(`App available at http://${IP_ADDRESS}:${PORT}.`));
    }
    return true;
}




// App

let voice = '';
let outputDevice = '';

const pathToBalcon = path.join(__dirname + '../../../balcon/balcon.exe');
let command = pathToBalcon;

function loadSettings() {
    // Voice
    readFile(path.join(__dirname, '../../settings/voice.txt'), 'utf-8', (err, txt) => {
        if (txt === '') {
            return;
        }
        
        voice = txt;
        
        command += ` -n "${voice}"`;
        
        console.log(`Voice: ${voice}.`);
    });

    // Output Device
    readFile(path.join(__dirname, '../../settings/output-device.txt'), 'utf-8', (err, txt) => {
        outputDevice = txt;
        
        if (outputDevice === '') {
            return;
        }

        let queryOutputDevices = '';
        exec(
            `${pathToBalcon} -g`, 
            (err, stdout, stderr) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (stderr) {
                    console.log(stderr);
                    return;
                }

                queryOutputDevices = stdout;
                console.log(queryOutputDevices);

                if (queryOutputDevices.includes(outputDevice)) {
                    command += ` -r "${outputDevice}"`;

                    console.log(`Output device "${outputDevice}".`);
                }
                else {
                    electronApp.exit();
                }
            }
        );
    });
}

let expressApp;

function startExpressApp() {
    expressApp = express();
    expressApp.use(express.text());
    expressApp.use(express.urlencoded({ extended: true }));
    expressApp.use(express.static(path.join(__dirname, '../client')));
    expressApp.use( cors({ origin: '*' }) );

    expressApp.listen(PORT, IP_ADDRESS, () => console.log(`App available at http://${IP_ADDRESS}:${PORT}.`));

    expressApp.get('/', (request, response) => {
        response.sendFile(path.join(__dirname, '../client/client.html'), 'text/html');
    });
    
    expressApp.post('/input', (request, response) => {
        console.log(request.body);

        exec(
            `${command} -t "${request.body}"`, 
            (err, stdout, stderr) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (stderr) {
                    console.log(stderr);
                    return;
                }
            }
        );
    
        response.sendStatus(200);
    });
}
