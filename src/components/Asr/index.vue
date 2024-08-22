<script setup lang="ts">
import {ref} from "vue";
import Iat from "./iat";
import pinyin from 'pinyin';

type Status = "UNDEFINED" | "OPEN" | "CLOSING" | "CLOSED";

const asrText = ref("");
const status = ref<Status>("UNDEFINED")

const start = () => {
  if (["UNDEFINED", "CLOSED"].includes(Iat.getStatus())) {
    asrText.value = "";
    Iat.connectWebSocket();
  }
};

const stop = () => {
  if (Iat.getStatus() === "CONNECTING") {
    Iat.closeWebSocket();
  }
  Iat.stop();
};

Iat.onWillStatusChange = (oldStatus: Status, newStatus: Status) => {
  console.log("status change", oldStatus, newStatus);
  status.value = newStatus
};

Iat.onTextChange = (text: string) => {
  asrText.value = text;
};

const isMatch = (texts = '') => {
  if (texts.length < 2) {
    return false
  }
  const last2Texts = pinyin(texts.slice(-2))
  return last2Texts[0][0].startsWith('xi') && (last2Texts[1][0].startsWith('yǐn') || 
  last2Texts[1][0].startsWith('yīn')
  || last2Texts[1][0].startsWith('yín')
  )
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true; // 默认false，用户停止说话时，语音识别将结束
recognition.interimResults = true; // 默认值false，代表语音识别器的返回值不会改变
recognition.onstart = function () {
  // console.log("onstart");
};
recognition.onresult = (event) => {
  console.log("onresult", event);
  let interim_transcript = "";
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
    } else {
      interim_transcript += event.results[i][0].transcript;
    }
  }
  if (!interim_transcript ) {
    return
  }
  if (isMatch(interim_transcript)) {
    if (status.value === 'OPEN') {
      stop()
    }
    start()
  }
};
recognition.onend = function () {
  // console.log("onend");
  wake()
};
recognition.onerror = function (event) {
  console.error("onerror", event);
};

// 开始唤醒
const wake = () => {
  recognition.lang = "zh-CN";
  recognition.start();
};

wake()
</script>

<template>
  <button @click="start" :disabled="!['CLOSED', 'UNDEFINED'].includes(status)">开始拾音</button>
  <button @click="stop" :disabled="status !== 'OPEN'">结束拾音</button>
  状态: {{ status }}
  <br/>
  <textarea :value="asrText"/>
</template>

<style scoped>
textarea {
  width: 400px;
}
</style>
