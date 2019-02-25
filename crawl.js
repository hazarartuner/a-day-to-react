const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const filePath = __dirname + '/index.html';
let data = fs.readFileSync(filePath).toString();

// const crawl = { search: /src="(https?:\/\/[^"]+.js)"/, downloadDir: `${__dirname}/js/` } ;
// const crawl = { search: /src="(https?:\/\/[^"]+.jpg)"/, downloadDir: `${__dirname}/images/` } ;
const crawl = { search: /src="(https?:\/\/[^"]+.png)"/, downloadDir: `${__dirname}/images/` } ;

function crawler() {
  let matches = crawl.search.exec(data);

  if (matches) {
    const fileName = path.basename(matches[1]);
    const file = fs.createWriteStream(crawl.downloadDir + fileName);
    const protocol = matches[1].match(/^https/) ? https : http;

    protocol.get(matches[1], function(response) {
      const stream = response.pipe(file);

      stream.on('finish', () => {
        data = data.replace(matches[0], `src="${crawl.downloadDir.replace(`${__dirname}/`, '')}${fileName}"`);

        fs.writeFile(filePath, data, function(err) {
          console.log(err ? "Error" : "Succeed");

          if (!err && matches){
            crawler();
          }
        });
      })
    });

    file.on('error', function (err) {
      console.log(err);
    });
  }
}

crawler();