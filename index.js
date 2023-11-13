class Bass_class {
    constructor(id) {
        this.id = id && id.toLowerCase();
        this.videoSourceList = [];
        this.redownloadList = [];
        this.proxy = "http://127.0.0.1:10809";
        this.request = require("request");
        this.axios = require("axios");
        this.fs = require("fs");
        this.path = require("path");
        this.exec = require("child_process").exec;
    }

    _get(options) {
        return new Promise((resolve, reject) => {
            this.request(options, function (error, response) {
                if (error) reject(error);
                else resolve(response);
            });
        });
    }

    _generateHeader(url) {
        return {
            url,
            method: "GET",
            proxy: this.proxy,
            headers: {
                Accept: "*/*",
                Host: "missav.com",
                Connection: "keep-alive",
                Origin: "https://missav.com",
                Referer: "https://missav.com/en/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
            },
        };
    }

    async _getVideoSourceList() {
        this.url = `https://missav.com/dm44/en/${this.id}`;
        let { body } = await this._get(this._generateHeader(this.url));
        let result = /eval\(.*\)/g.exec(body);
        if (result) {
            let source, source842, source1280, sourceFhd;
            eval(result[0]);
            if (source1280) {
                this.base_url = source1280.replace("video.m3u8", "");
                let { data } = await this.axios.get(source1280, {
                    headers: {
                        Origin: "https://missav.com",
                        Referer: "https://missav.com/en",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                    },
                });
                this.videoSourceList = data
                    .split("\n")
                    .slice(5)
                    .filter((item) => item.includes("ts"));
            } else {
                console.log(source1280);
            }
        } else {
            console.log("未找到资源或程序失效");
        }
    }

    _stop(t) {
        return new Promise((resolve) => setTimeout(() => resolve(), t));
    }

    _download(item) {
        let url = this.base_url + item;
        return this.axios
            .get(url, {
                headers: {
                    Origin: "https://missav.com",
                    Referer: "https://missav.com/en",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                },
                responseType: "stream",
            })
            .then((res) => {
                let ws = this.fs.createWriteStream(`./download/${item}`, res);
                res.data.pipe(ws);
                this.redownloadList.filter(({ v }) => v != item);
            })
            .catch((res) => {
                this.redownloadList.push(res.config.url);
                console.log("下载出错 稍后即将重新尝试");
            });
    }

    _readLocalRecord() {
        try {
            return this.fs.readFileSync("./.cache", "utf-8") || 0;
        } catch (error) {
            return 0;
        }
    }

    generFileText() {
        let result = "";
        let fileList = this.fs
            .readdirSync("./download")
            .map((item) => item.match(/\d+/g)[0])
            .sort((a, b) => a - b)
            .map((item) => `video${item}.ts`);
        fileList.forEach((item) => {
            let file = this.path.join(__dirname, `/download/${item}`);
            result += `file '${file}'\n`;
        });
        this.fs.writeFileSync("file.txt", result, "utf-8");
    }

    async mergeFile() {
        this.generFileText();
        if (process.platform == "win32") this.exec("ffmpeg.exe -f concat -safe 0 -i file.txt -c copy output.mp4");
        else if (process.platform == "linux") this.exec("sh ./1.bat");
    }

    async start() {
        try {
            this.redownloadList = JSON.parse(this.fs.readFileSync("./redownloadList.json", "utf-8"));
        } catch (error) {
            this.redownloadList = [];
        }
        await this._getVideoSourceList();
        console.log("视频地址获取成功");
        let c = this._readLocalRecord();
        console.log("开始下载");
        let arrLength = this.videoSourceList.length;
        for (let i = c; i < arrLength; i++) {
            await this._download(this.videoSourceList[i]);
            await this._stop(50);
            if (i % 20 == 0) console.log("下载进度：", (i / arrLength).toFixed(2) * 100);
            else if (i == arrLength) console.log("下载进度：", (i / arrLength).toFixed(2) * 100);
        }
        console.log("开始下载失败项");
        for (let i in this.redownloadList) {
            await this._download(this.redownloadList[i]).then;
            await this._stop(50);
        }
        if (this.redownloadList.length == 0) await this.mergeFile();
        else {
            console.log("有视频未下载成功 请重新运行");
            this.fs.writeFileSync("./redownloadList.json", JSON.stringify(this.redownloadList), "utf-8");
        }
    }
}

new Bass_class("miaa-404").start();
