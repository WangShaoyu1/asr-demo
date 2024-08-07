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