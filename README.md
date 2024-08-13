# 1、运行工程
1.yarn install  
2.npm run dev
# 2、文件解释
需要关注的是src/components下面的ASR NLP
1. ASR/iat.js：声学的各种状态，包含开始拾语，结束拾音等等。需要关注的是recorder.onStop
2. ASR/index：页面demo，仅供示意，可根据产品设计调整
3. NL/index：为NLP处理函数
4. ASR/iat.js，recorder.onStop的函数回调，用于执行NLP会话接口。具体的，resultText是拾语结束后的文本
5. NL/index，getAnswerFromDify是NLP会话接口，接入企业内模型问答服务或者各种商用大模型或者，看产品设计

# 3、注意事项
1. 点击开始唤醒的按钮后会一直拾音，使用了Web Speech API，其依赖谷歌服务，需使用科学上网
   https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Speech_API
2. 唤醒词是【小影】，匹配逻辑在isMatch，里面的命中算法按需优化，命中唤醒词后开始调用第三方语音识别服务

