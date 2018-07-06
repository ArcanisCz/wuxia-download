const cheerio = require("cheerio");
const fs = require('fs');
const superagent = require("superagent");

getAwe(537, 563);
// getAwe(564, 712);

function getAwe(from, to) {
    const tasks = [];
    const f = i => () => getBody(`/novel/a-will-eternal/awe-chapter-${i}/`)
        .then(parseBody)
        .then(makeHtml)
        .then(x => new Promise(resolve => setTimeout(() => resolve(x), 100)));
    for (let i = from; i <= to; i++) {
        tasks.push(f(i));
    }
    return runSerial(tasks).then((promises) => writeFile("awe-" + from + "-" + to, promises.join("")));
}

function runSerial(tasks) {
    const concat = list => Array.prototype.concat.bind(list);
    const promiseConcat = f => x => f().then(concat(x));
    const promiseReduce = (acc, x) => acc.then(promiseConcat(x));
    return tasks.reduce(promiseReduce, Promise.resolve([]));
}

function parseBody(html) {
    const body = cheerio.load(html);
    const title = body(".caption img + h4");
    return Promise.resolve({
        title: title.hasClass("text-spoiler") ? "" : title.html(),
        spoilerTitle: title.hasClass("text-spoiler") ? title.html() : "",
        content: body(".fr-view").html(),
    });
}

function makeHtml(body) {
    return Promise.resolve(`<h1>${body.title}<span style="display: none">${body.spoilerTitle}</span></h1>${body.content}<br /><b>${body.spoilerTitle}</b>`);
}

function writeFile(name, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile("./books/" + name + ".html", content, function (err) {
            if (err) {
                console.log(err);
                reject();
            }
            resolve()
        });
    });
}

function getBody(path) {
    return new Promise(function (resolve, reject) {
        superagent.get(`https://www.wuxiaworld.com${path}`)
            .then((res) => {
                console.log("done", path);
                resolve(res.text)
            })
            .catch((err) => {
                reject(err)
            });
    });

}
