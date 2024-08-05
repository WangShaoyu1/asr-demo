import {md5} from "js-md5";
import recorder from "../Asr/iat.js";
// 如下url,可以测试环境、生产环境使用
const authInfoUrl = "https://vdh-api.test.yingzi.com/haigate/api/v1/haiAuthorize"
const queryNlpUrl = " https://vdh-api.test.yingzi.com/haigate/api/v1/haiQtxt2Anim"
const AppId = "6006805041792430"
const APPkey = "TTZ92YT1mSDRLSGs5Mv1bMYJ"
const AppSecret = "qBHOHn8OUHc17ulW756E2YmcpuMVqNnh"
const AvatarId = "11100040000595780000000000000000"
const sdkVer = "'v6.0.0'"
const avatarVersion = "v9.0.0"

class nlp {
    constructor() {
        this.appId = AppId;
        this.appkey = APPkey;
        this.appSecret = AppSecret;
        this.avatarId = AvatarId;
        this.sdkVer = sdkVer;
        this.avatarVersion = avatarVersion;
        this.lang = 'cn'
    }

    auth() {
        let ts = Date.now();
        let params = {
            avatarId: this.avatarId,
            appId: this.appId,
            appKey: this.appId,
            token: md5(this.appId + this.appkey + ts + this.appSecret),
            deviceId: 'web#' + ts,
            sdkVer: sdkVer
        };
        // if (this.opts.userId) {
        //     params.userId = this.opts.userId;
        // }

        fetch(authInfoUrl, {
            method: "POST",
            mode: "cors",//no-cors/cors/same-origin/navigate
            body: JSON.stringify(params),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
            .then(response => {
                console.log("response1:", response);
                return response;
            })
            .then(result => {
                if (!result.state) {
                    alert("用户认证失败！");
                    return
                }

                // setCookie('user-token', json.data.accessToken, 1)
                // 或者存在其他某个地方，后面的请求会用到
                localStorage.setItem('user-token', result.data.accessToken);
                console.log("result-accessToken:", result)
            });
    }

    getAnswer({txt, isInit, onFinished, onFailed, timeout = 30000, onTimeout, tag, opts}) {
        let answers = [];
        const ask = (txt) => {
            this.chatId = '' + (new Date()).getTime();
            let params, streamId, retry_times = 3;

            if (!streamId) { // beginning of chat
                params = {
                    text: this.encode(txt), reqId: this.chatId,
                };

                if (isInit) {
                    params.tag = {init_state: 'true'};
                }
            } else { // streaming of chat
                params = {
                    reqId: this.chatId, streamId
                };
            }
            if (params.tag) {
                Object.assign(params.tag, tag);
            } else {
                params.tag = tag;
            }
            if (opts) {
                Object.assign(params, opts);
            }

            params.sdkVer = this.sdkVer;
            params.avatarId = this.avatarId;
            params.version = this.avatarVersion;
            params.lang = this.lang;

            fetch(queryNlpUrl, {
                method: "POST",
                mode: "no-cors",
                credentials: "same-origin",// include/same-origin/omit
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "user-token": localStorage.getItem('user-token')
                },
                body: JSON.stringify(params)
            }).then(response => response.json()).then(result => {
                if (result.state === true) {
                    if (result.data) {
                        if (result.data.text === 'DEFAULT') {

                            answers.push({text: 'DEFAULT', tag: result.data.tag});
                            onFinished(answers);

                        } else {
                            streamId = result.data.streamId;
                            let _echoReqId = result.data.reqId;
                            if (_echoReqId !== this.chatId) {
                                answers = [];
                            } else {
                                let a = this.decode(result.data.origQText);
                                // answers.push(a)
                                answers.push({text: a, tag: result.data.tag});

                                if (streamId) {
                                    this.isStreamingEnd = false;
                                    setTimeout(() => {
                                        ask(txt, streamId); // go on pulling streams
                                    }, 500);
                                } else {
                                    this.isStreamingEnd = true;
                                    onFinished(answers);
                                }
                            }
                        }
                    }
                } else {
                    if (result.state === false) {
                        alert(result.error);
                    } else if (retry_times > 0) { // retry per 0.5 second
                        setTimeout(() => {
                            ask({txt, streamId});
                        }, 500);
                    }
                }
            }).catch(error => {
                console.err("接口出错了：", error)
            })
        }
        ask(txt)
    }

    encode(text) {
        const u8a = new TextEncoder().encode(text);
        const maxArgs = 0x1000;
        let strArr = [];
        for (let i = 0, l = u8a.length; i < l; i += maxArgs) {
            strArr.push(String.fromCharCode.apply(null, u8a.subarray(i, i + maxArgs)));
        }
        return btoa(strArr.join(''));
    }

    decode(str) {
        const aotbArr = atob(str)
        const maxArgs = 0x1000;
        const byteArr = []

        for (const char of aotbArr) {
            byteArr.push(char.charCodeAt(0))
        }

        return new TextDecoder().decode(new Uint8Array(byteArr))
    }
}

export default nlp