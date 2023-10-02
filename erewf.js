let url = "https://cdn152.akamai-content-network.com/bcdn_token=6Wk0Q9dyShjFLHyPbvcs4klZkkzb12dXSaP_93ThBm4&expires=1696092839&token_path=%2F0fcba1fe-517e-440a-ba8c-0a13ea0dff57%2F/0fcba1fe-517e-440a-ba8c-0a13ea0dff57/1280x720/video932.ts";
let axios = require("axios");
let fs = require("fs");
axios
    .get(url, {
        headers: {
            Origin: "https://missav.com",
            Referer: "https://missav.com/en",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        },
        responseType: "arraybuffer",
    })
    .then((res) => {
        // console.log(res.data);
        fs.appendFile(`./download/video932.ts`, res.data, () => {});
        // let ws = fs.createWriteStream(`./aaaa.mp4`, res);
        // res.data.pipe(ws);
    })
    .catch((res) => {
        console.log(res);
    });
