const http = require('http');
const { execSync, spawn } = require('child_process');
const fs = require('fs')


function run(cwd, command) {
  try {
    var res = execSync(command, { cwd, encoding: "utf8" });}
  catch (e) {
    console.log("execSync errors while running:", command);
    console.log(e);
  } 
  return res;
}

function read(tmpdir) {
  try {
    return fs.readFileSync(`${tmpdir}/out`, 'utf8');
  } catch (err) {
    console.error(err);
  }
}

http.createServer((request, response) => {
if(request.url === "/") {
  let body = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
const code = body;
    const tmpdir = run('.', 'mktemp -d workspace/XXXXXXXX').slice(0, -1);
    const gwion = spawn('bash', ['./run.sh', tmpdir, code]);
  gwion.on('close', (code) => {
 //   if (code) {
 //     message.reply(`something went wrong`);
 //     run('.', 'rm -rf ' + tmpdir);
 //     return;
 //   }
const result= `${ read(tmpdir) }<br><audio controls src="https://TheGwionPlayGround.fennecdjay.repl.co/${tmpdir}/gwion.mp3" type="audio/mp3">Your browser does not support the audio element.</audio>`;
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.end(JSON.stringify(result));
      spawn('bash', ['./clean.sh', tmpdir]);
  });
  });
} else {
  const url = __dirname + request.url;
  if(url.indexOf('..') != -1 || url.indexOf('\0') != -1) {
    response.writeHead(404);
    response.end("invalid request");
    return;
  }
  fs.readFile(__dirname + request.url, function (err,data) {
    if (err) {
      response.writeHead(404);
      response.end(JSON.stringify(err));
      return;
    }
    response.writeHead(200);
    response.end(data);
  });
}


}).listen(8080);