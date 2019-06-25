var os = require('os');
var pty = require('node-pty');
var Terminal = require('xterm').Terminal;
var fs = require('fs');
let fit = require('../../node_modules/xterm/lib/addons/fit/fit.js');

// Initialize node-pty with an appropriate shell
Terminal.applyAddon(fit);
var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
// const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];
const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
//   cols: 10,
//   rows: 500,
  cwd: ((file.path != undefined) && (fs.existsSync(file.path))) ? path.join(file.path, '..') : process.env.HOME,
  // cwd: '.',
  env: process.env
});
console.log(file.path);
// console.log(process.env);

// Initialize xterm.js and attach it to the DOM
global.xterm = new Terminal({ allowTransparency: true });
xterm.open(document.getElementById('terminal'));
xterm.fit();
xterm.setOption('theme', {
    background: 'rgba(255,255,255,0)'
});
console.log(xterm);

// Setup communication between xterm.js and node-pty
xterm.on('data', (data) => {
    // console.log(data);
  ptyProcess.write(data);
});
ptyProcess.on('data', function (data) {
    // console.log(data);
  xterm.write(data);
});

$('.terminal-container').css('display', 'none');
$('.xterm-screen').css('height', '100%');