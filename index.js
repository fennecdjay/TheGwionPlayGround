const http = require('http');
const { execSync, spawn } = require('child_process');
const fs = require('fs')

/* run command helper */
function run(cwd, command) {
  try {
    return execSync(command, { cwd, encoding: "utf8" });
  } catch (err) {
    console.log(err);
  }
}

/* serve static files, eg mp3s */
function serve_static(request, response) {
  const url = __dirname + request.url;
  if(url.indexOf('..') != -1 || url.indexOf('\0') != -1) {
    response.writeHead(404);
    response.end("invalid request");
    return;
  }
  fs.readFile(__dirname + request.url, function (err, data) {
    if (err) {
      response.writeHead(404);
      response.end(JSON.stringify(err));
      return;
    }
    response.writeHead(200);
    response.end(data);
  });
}

/* read the logs */
function read(tmpdir) {
  try {
    return fs.readFileSync(`${tmpdir}/out`, 'utf8');
  } catch (err) {
    console.error(err);
  }
}

/* check if there is an mp3 */
function has_mp3(tmpdir) {
  var present = run('.', `test -f ${ tmpdir }/gwion.mp3 || echo 'Nope'`);
  if(present.indexOf('Nope') == -1)
    return true;
  return false;
}


/* return the logs
 * if there is an mp3
 * add a player to the response
 */
function build_log(tmpdir) {
  const log = read(tmpdir);
  if(!has_mp3(tmpdir))
    return log;
  return `${ log }<br><audio controls src="https://TheGwionPlayGround.fennecdjay.repl.co/${tmpdir}/gwion.mp3" type="audio/mp3">Your browser does not support the audio element.</audio>`;
}

/* the command exited with an error code
 * respond with some error message
 * and clean up
 */
function smth_happened(response, tmpdir) {
  response.end(JSON.stringify(`something went wrong`));
  run('.', 'rm -rf ' + tmpdir);
}

/* the command succeded
 * respond and clean up (later)
 */
function respond(response, tmpdir) {
  const log = build_log(tmpdir);
  response.end(JSON.stringify(log));
  spawn('bash', ['./clean.sh', tmpdir]);
}

http.createServer((request, response) => {
  if(request.url === "/") {
    let body = [];
    request.on('error', (err) => {
      console.error(err);
    }).on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      const code = Buffer.concat(body).toString();
      const tmpdir = run('.', 'mktemp -d workspace/XXXXXXXX').slice(0, -1);
      response.setHeader("Access-Control-Allow-Origin", "*");
      const gwion = spawn('bash', ['./scripts/run.sh', tmpdir, code]);
      gwion.on('close', (code) => {
        if (!code)
          respond(response, tmpdir);
        else
          smth_happened(response, tmpdir);
      });
    });
  } else
    serve_static(request, response);
}).listen(8080);