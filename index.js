var http = require('http');
var cheerio = require("cheerio");
var fs = require('fs');

// getRebirth(101,137);
// getSotr(406,459);
getWmW(450, 500);

function getWmW(from, to) {
    var promises = [];
    for(var i = from; i <= to; i++){
        promises.push(getBody("/wmw-index/wmw-chapter-"+i+"/").then(parseBody).then(makeHtml));
    }
    return Promise.all(promises).then((promises) => writeFile("wmw-"+from+"-"+to, promises.join("")));
}

function getRebirth(from, to) {
    var promises = [];
    for(var i = from; i <= to; i++){
        promises.push(getBody("/rebirth-index/rebirth-chapter-"+i+"/").then(parseBody).then(makeHtml));
    }
    return Promise.all(promises).then((promises) => writeFile("rebirth-"+from+"-"+to, promises.join("")));
}

function getSotr(from, to) {
    var promises = [];
    for(var i = from; i <= to; i++){
        promises.push(getBody("/sotr-index/sotr-chapter-"+i+"/").then(parseBody).then(makeHtml));
    }
    return Promise.all(promises).then((promises) => writeFile("sotr-"+from+"-"+to, promises.join("")));
}

function parseBody(html) {
    var body = cheerio.load(html);
    const content = body("[itemprop=articleBody]").html();
    return Promise.resolve({
        title: body(".entry-title").html(),
        content: content
    });
}

function makeHtml(body) {
    return Promise.resolve("<h1>"+body.title+"</h1>"+body.content);
}

function writeFile(name, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile("./books/"+name+".html", content, function(err) {
            if(err) {
                return console.log(err);
                reject();
            }
           resolve()
        });
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