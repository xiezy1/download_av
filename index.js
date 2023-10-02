let base_url = "https://cdn152.akamai-content-network.com/bcdn_token=ppksvR35DEdHuSEQ3u9UiUxmSbncycnxtcYLRjjzAP0&expires=1691463780&token_path=%2F9f3af5f5-3e9c-4351-9077-babbf069f7b7%2F/9f3af5f5-3e9c-4351-9077-babbf069f7b7/1280x720/";
const axios = require("axios").default;
const fs = require("fs");
const headers = {
    Origin: "https://missav.com",
    Referer: "https://missav.com/en/ebod-725",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
};

function readLocalRecord() {
    try {
        return fs.readFileSync("./.cache", "utf-8") || 0;
    } catch (error) {
        return 0;
    }
}

function stop(t) {
    return new Promise((resolve) => setTimeout(() => resolve(), t));
}

function splitString() {
    let data = fs.readFileSync("./response.m3u8", "utf-8");
    return data
        .split("\n")
        .slice(5)
        .filter((item) => item.includes("ts"));
}

function download(item) {
    let url = base_url + item;
    return axios.get(url, { headers, responseType: "stream" }).then((res) => {
        let ws = fs.createWriteStream(`./download/${item}`, res);
        res.data.pipe(ws);
    });
}

let videoArr = splitString();

async function start() {
    let s = readLocalRecord();
    let videoLength = videoArr.length;
    for (let i = 0; i < videoLength; i++) {
        if (i < s) continue;
        let item = videoArr[i];
        console.log(i);
        await download(item);
        await stop(50);
    }
}

start();
