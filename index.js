var http = require('http');
var cheerio = require("cheerio");

getRebirth(1,1).then(bodies => console.log(bodies));

function getRebirth(from, to) {
    var promises = [];
    for(var i = from; i <= to; i++){
        promises.push(getBody("/rebirth-index/rebirth-chapter-"+i+"/").then(parseBody));
    }
    return Promise.all(promises);
}

function parseBody(html) {
    var body = cheerio.load(html);
    return Promise.resolve({
        title: body(".entry-title").html(),
        body: body("[itemprop=articleBody]").html()
    });
}


function getBody(path) {
    return new Promise(function (resolve) {
        http.get({
            host: 'www.wuxiaworld.com',
            path: path
        }, function (response) {
            // Continuously update stream with data
            var body = '';
            response.on('data', function (d) {
                body += d;
            });
            response.on('end', function () {
                resolve(body);
            });
        });
    });

}