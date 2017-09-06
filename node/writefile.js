var fs = require('fs');

var logStream = fs.createWriteStream('E:\\data R\\Tcc\\eventsfull.json', {flags:'a'});

function writefile (str) {
  logStream.write(str);
}

module.exports = writefile;