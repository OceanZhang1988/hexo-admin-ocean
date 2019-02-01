const spawn = require('child_process').spawn;

function once(fn) {
  var called = false;
  return function () {
    if (!called) fn.apply(this, arguments);
    called = true;
  };
}

module.exports = function (command, message, done) {
  done = once(done);
  const proc = spawn(command, [message], {detached: true});
  let stdout = '';
  let stderr = '';
  proc.stdout.on('data', function(data){stdout += data.toString();});
  proc.stderr.on('data', function(data){stderr += data.toString();});
  proc.on('error', function(err) {
    done(err, {stdout: stdout, stderr: stderr});
  });
  proc.on('close', function () {
    done(null, {stdout: stdout, stderr: stderr});
  });
};

