var sys = require('sys')
var exec = require('child_process').exec;

dir = exec("ls -la", function(err, stdout, stderr) {
  if (err) {
    console.log(err);
  }
  console.log(stdout);
});

dir.on('exit', function (code) {
  // exit code is code
});