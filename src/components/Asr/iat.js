import CryptoJS from "crypto-js";

//APPID，APISecret，APIKey在控制台-我的应用-语音听写（流式版）页面获取
const APPID = "a327ed87";
const API_SECRET = "ZjQ1MDNjYTgzODU5NmI4N2RjYTVkYmFk";
const API_KEY = "7399714c1813180a6f1d8d699eb85339";

let btnStatus = "UNDEFINED"; // "UNDEFINED" "CONNECTING" "OPEN" "CLOSING" "CLOSED"

const recorder = new RecorderManager("./");

recorder.onStart = () => {
    changeBtnStatus("OPEN");
};
let iatWS;
let resultText = "";
let resultTextTemp = "";


/**
 * 获取websocket url
 * 该接口需要后端提供，这里为了方便前端处理
 */
function getWebSocketUrl() {
    // 请求地址根据语种不同变化
    var url = "wss://iat-api.xfyun.cn/v2/iat";
    var host = "iat-api.xfyun.cn";
    var apiKey = API_KEY;
    var apiSecret = API_SECRET;
    var date = new Date().toGMTString();
    var algorithm = "hmac-sha256";
    var headers = "host date request-line";
    var signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
    var signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
    var signature = CryptoJS.enc.Base64.stringify(signatureSha);
    var authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
    var authorization = btoa(authorizationOrigin);
    url = `${url}?authorization=${authorization}&date=${date}&host=${host}`;
    return url;
}

function toBase64(buffer) {
    var binary = "";
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function changeBtnStatus(status) {
    recorder?.onWillStatusChange?.(btnStatus, status)
    btnStatus = status;
    if (status === "CONNECTING") {
        resultText = "";
        resultTextTemp = "";
    } else if (status === "OPEN") {

    } else if (status === "CLOSING") {

    } else if (status === "CLOSED") {

    }
}

function renderResult(resultData) {
    // 识别结束
    let jsonData = JSON.parse(resultData);
    if (jsonData.data && jsonData.data.result) {
        let data = jsonData.data.result;
        let str = "";
        let ws = data.ws;
        for (let i = 0; i < ws.length; i++) {
            str = str + ws[i].cw[0].w;
        }
        // 开启wpgs会有此字段(前提：在控制台开通动态修正功能)
        // 取值为 "apd"时表示该片结果是追加到前面的最终结果；取值为"rpl" 时表示替换前面的部分结果，替换范围为rg字段

        if (data.pgs) {
            if (data.pgs === "apd") {
                // 将resultTextTemp同步给resultText
                resultText = resultTextTemp;
            }
            // 将结果存储在resultTextTemp中
            resultTextTemp = resultText + str;
        } else {
            resultText = resultText + str;
        }

        recorder?.onTextChange?.(resultTextTemp || resultText || "")
    }
    if (jsonData.code === 0 && jsonData.data.status === 2) {
        iatWS.close();
    }
    if (jsonData.code !== 0) {
        iatWS.close();
        console.error(jsonData);
    }
}

function connectWebSocket() {
    const websocketUrl = getWebSocketUrl();
    if ("WebSocket" in window) {
        iatWS = new WebSocket(websocketUrl);
    } else if ("MozWebSocket" in window) {
        iatWS = new MozWebSocket(websocketUrl);
    } else {
        alert("浏览器不支持WebSocket");
        return;
    }
    changeBtnStatus("CONNECTING");
    iatWS.onopen = (e) => {
        // 开始录音
        recorder.start({
            sampleRate: 16000,
            frameSize: 1280,
        });
        var params = {
            common: {
                app_id: APPID,
            },
            business: {
                language: "zh_cn",
                domain: "iat",
                accent: "mandarin",
                vad_eos: 5000,
                dwa: "wpgs",
            },
            data: {
                status: 0,
                format: "audio/L16;rate=16000",
                encoding: "raw",
            },
        };
        iatWS.send(JSON.stringify(params));
    };
    iatWS.onmessage = (e) => {
        renderResult(e.data);
    };
    iatWS.onerror = (e) => {
        console.error('iatWS error:', e);
        recorder.stop();
        changeBtnStatus("CLOSED");
    };
    iatWS.onclose = (e) => {
        recorder.stop();
        changeBtnStatus("CLOSED");
    };
}

recorder.onFrameRecorded = ({isLastFrame, frameBuffer}) => {
    if (iatWS.readyState === iatWS.OPEN) {
        console.log("isLastFrame:", isLastFrame);
        iatWS.send(
            JSON.stringify({
                data: {
                    status: isLastFrame ? 2 : 1,
                    format: "audio/L16;rate=16000",
                    encoding: "raw",
                    audio: toBase64(frameBuffer),
                },
            })
        );
        if (isLastFrame) {
            changeBtnStatus("CLOSING");
        }
    }
};
recorder.onStop = () => {
};

// btnControl.onclick = function () {
//   if (btnStatus === "UNDEFINED" || btnStatus === "CLOSED") {
//     connectWebSocket();
//   } else if (btnStatus === "CONNECTING" || btnStatus === "OPEN") {
//     // 结束录音
//     recorder.stop();
//   }
// };

recorder.changeStatus = changeBtnStatus;
recorder.getStatus = () => btnStatus;
recorder.connectWebSocket = connectWebSocket;
recorder.closeWebSocket = () => {
    iatWS?.close()
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        const readyState = iatWS?.readyState
        if ([0, 1].includes(readyState)) {
            iatWS?.close()
        }
    }
})

export default recorder;
