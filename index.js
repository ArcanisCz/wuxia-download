var http = require('http');
var cheerio = require("cheerio");
var fs = require('fs');

// getRebirth(101,137);
// getSotr(700, 754);
// getWmW(450, 500);
// getIssth(10, 1558, 1599);
getAwe(413,469);

function getIssth(book, from, to) {
    var promises = [];
    for(var i = from; i <= to; i++){
        promises.push(getBody("/issth-index/issth-book-"+book+"-chapter-"+i+"/").then(parseBody).then(makeHtml));
    }
    return Promise.all(promises).then((promises) => writeFile("issth-"+from+"-"+to, promises.join("")));
}

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

function getAwe(from, to) {
    var tasks = [];
    const f = i => () => getBody("/awe-index/awe-chapter-"+i+"/")
        .then(parseBody)
        .then(makeHtml)
        .then(x => new Promise(resolve => setTimeout(() => resolve(x), 100)));
    for(var i = from; i <= to; i++){
        tasks.push(f(i));
    }
    return runSerial(tasks).then((promises) => writeFile("awe-"+from+"-"+to, promises.join("")));
}

function runSerial(tasks) {
    const concat = list => Array.prototype.concat.bind(list)
    const promiseConcat = f => x => f().then(concat(x))
    const promiseReduce = (acc, x) => acc.then(promiseConcat(x))
    return tasks.reduce(promiseReduce, Promise.resolve([]))
}

function parseBody(html) {
    var body = cheerio.load(html);
    const content = body(".entry-content");
    return Promise.resolve({
        title: body(".entry-title").html(),
        content: content.html(),
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
                console.log("done", path);
                resolve(body);
            });
        });
    });

}
