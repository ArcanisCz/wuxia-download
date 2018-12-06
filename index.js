const cheerio = require("cheerio");
const fs = require('fs');
const superagent = require("superagent");

// getAwe(537, 563);
// getAwe(564, 712);
// getAwe(713, 742);
// getAwe(747, 759);
// getAwe(760, 779);

// getSotr(846, 852);
// getSotr(853, 876);
// 2 weird urls here
// getSotr(879, 902);
// getSotr(903, 1011);
// getSotr(1012, 1076);
// getSotr(1077, 1141);
// getSotr(1142, 1188);
// getSotr(1189, 1203);
// getSotr(1204, 1265);
// getSotr(1266, 1309);
// getSotr(1310, 1366);
// getSotr(1341, 1362);
getSotr(1363, 1379);


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

function getSotr(from, to) {
    const tasks = [];
    const f = i => () => getBody(`/novel/sovereign-of-the-three-realms/sotr-chapter-${i}/`)
        .then(parseBody)
        .then(makeHtml)
        .then(x => new Promise(resolve => setTimeout(() => resolve(x), randMilis())));
    for (let i = from; i <= to; i++) {
        tasks.push(f(i));
    }
    return runSerial(tasks).then((promises) => writeFile("sotr-" + from + "-" + to, promises.join("")));
}

function runSerial(tasks) {
    const concat = list => Array.prototype.concat.bind(list);
    const promiseConcat = f => x => f().then(concat(x));
    const promiseReduce = (acc, x) => acc.then(promiseConcat(x));
    return tasks.reduce(promiseReduce, Promise.resolve([]));
}

function parseBody(html) {
    const $ = cheerio.load(html);
    const title = $(".caption img + h4");
    const a = $($("body").find('.panel-default .fr-view'));
    return Promise.resolve({
        title: title.hasClass("text-spoiler") ? "" : title.html(),
        spoilerTitle: title.hasClass("text-spoiler") ? title.html() : "",
        content: a.html(),
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
                // console.log(res.text);
                resolve(res.text)
            })
            .catch((err) => {
                reject(err)
            });
    });

}

function randMilis() {
    return Math.round(Math.random() * 500);
}
