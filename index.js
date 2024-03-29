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
// getEmperor(2000, 2199);

// getRecord(364, 595);
// getRecord(596, 795);
// getRecord(796, 1124);
// getRecord(1125, 1265);
// getRecord(1266, 1357);
// getRecord(2257, 2451);

getNecro(1051, 1051);

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

function getRecord(from, to) {
    const tasks = [];
    const f = i => () => getBody(`/novel/rmji/rmji-chapter-${i}/`)
      .then(parseBody)
      .then(makeHtml)
      .then(x => new Promise(resolve => setTimeout(() => resolve(x), randMilis())));
    for (let i = from; i <= to; i++) {
        tasks.push(f(i));
    }
    return runSerial(tasks).then((promises) => writeFile("record-" + from + "-" + to, promises.join("")));
}

function getNecro(from, to) {
    const tasks = [];
    const f = i => () => {
        return getBody(`/novel/necropolis-immortal/necro-chapter-${i}`)
          .then(parseBody)
          .then(makeHtml)
          .then(x => new Promise(resolve => setTimeout(() => resolve(x), randMilis())));
    };
    for (let i = from; i <= to; i++) {
        tasks.push(f(i));
    }
    return runSerial(tasks).then((promises) => writeFile("necro-" + from + "-" + to, promises.join("")));
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
            // .set("Cookie", "WuxiaWorld.Auth=CfDJ8CO0SncLTtpIpyTeLBgDP0xNKECqC8vxalyqPAsNoiiohPOenAi18bTfCkH0OVT1M3-tq3z1SmFcWO1UMxvsxF7OEC66y2k-EEOG2gMSqJItQciGVMD_HHZlv6asfBsyieHo8iM3ASs8tLaO_3vMqOpx_xbrQBCB7oUZ4ofSyP_jhyS1Xg-oHgKN6IrkppNM7_jZgbzUHKfLx77D6NBCTw3HAB68Ssa6uyrePQwsOn48cKOqYxm3aQrwo9zXNZeGSbZtZGd_uzIQaW2VMqcgKQSYdpd6dgzuP4TsR787aetBNela7pMCwxu2QDieLtoDiBSJ5cs-MCA2icau9fieYaWjvV0dO72yUj9NGMgwE_yNyOrZiUra9DNxZftLrFEMvGdLjXNgOsvfZ6EMKliNvjqy9hfeeOQOKS9nQoZ_vxv-TMUS1tvWaKVslRyope0VkNeWkMD4XJsCrmh4o8wXaoiWm9t06e-QXTlnXOLQQ-kGR8UNWfL33RKE_70Os19v-eGNYjWZ9fm5EvcqjsOmcpCxxW97ki-4vWi-nyRk9UAg71o_7jYlYoXV0Gt6I3b-Fek5mApbSQOfFxb8XM4Ckym7vEozgqaJaORSippnYijXfdl-WmV0qkuDy4x58olMkAe1ac2cgNWtVpT11hDQ7po0DpShGdFPA3G2sbS1TDSpAOR1gcyRGOcL6YRbvF__WfmiklgDehSD7eu8uxw91TATYEatM5aKZafuDJU9bS5It0CyrwAfmcxpnEl0RRTPXX_6QbwlmB-XSaPKoolD-mlw_qYgmTEwvjEm-zws4e_ZxxYHY-qpSPtdoqnjq3wtqcPxDotCL5v0ViTSDRjY6ss5zafDBb8KF1YXacYRyITcK-PCfwTzLexvFH9WLSqZp1LkpUPxtX-L7YaHJ_XvDzrqIaNS4Ifnx7qmEKfwvMXsSUTNJmOsjb1q6ARXhIswkI2OxNA4yUpAKVDoFhQXRrzcpM1BHI63MB54cSAu-rKihKceLZzDFzcjGXA698FX0apMkWcv-wFv3_lat3GjfWq8h8F5A0hvgKE4wAue2yL8")
            .set("Cookie", "WuxiaWorld.CsrfToken=CfDJ8CO0SncLTtpIpyTeLBgDP0zs6gb-N3OqqLdYZYEWdJSXgFPnxl4a4oxV4NbMtFoxNhfj5whsobO7Z_4PScGSBsddd7-0MvcSvVncYfgAvLhEiyW2wvLNSw3XIRYibfis0qZU7OQBOcEkxa5rRHhUFEU")
            .withCredentials()
            .then((res) => {
                console.log("done", path);
                console.log(res.text);
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
