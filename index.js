const cheerio = require("cheerio");
const fs = require('fs');
const superagent = require("superagent");

// getAwe(760, 779);
// getAwe(942, 1028);
// getAwe(1029, 1071);
// getAwe(1100, 1150);
// getAwe(1151, 1159);
// getAwe(1164, 1180);
// getAwe(1181, 1249);
// getAwe(1263, 1293);

// getSotr(1363, 1379);
// getSotr(1395, 1401);
// getSotr(1410, 1511);
// getSotr(1511, 1523);
// getSotr(1524, 1596);
// getSotr(1597, 1691);

// getEmperor(1, 99);
// getEmperor(100, 199);
// getEmperor(200, 299);
// getEmperor(400, 499);
// getEmperor(500, 599);
// getEmperor(600, 699);
// getEmperor(700, 799);
// getEmperor(800, 899);
// getEmperor(900, 999);
// getEmperor(1121, 1199);
// getEmperor(1200, 1299);
// getEmperor(1300, 1399);
// getEmperor(1400, 1499);
// getEmperor(1600, 1699);
// getEmperor(1700, 1799);
// getEmperor(1800, 1999);
getEmperor(2000, 2199);

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

function getEmperor(from, to) {
    const tasks = [];
    const f = i => () => getBody(`/novel/emperors-domination/emperor-chapter-${i}/`)
        .then(parseBody)
        .then(makeHtml)
        .then(x => new Promise(resolve => setTimeout(() => resolve(x), randMilis())));
    for (let i = from; i <= to; i++) {
        tasks.push(f(i));
    }
    return runSerial(tasks).then((promises) => writeFile("emperor-" + from + "-" + to, promises.join("")));
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
