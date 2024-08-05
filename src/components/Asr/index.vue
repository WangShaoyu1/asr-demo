<script setup lang="ts">
import {ref} from "vue";
import Iat from "./iat";
import nlp from '../NLP/index'

type Status = "UNDEFINED" | "OPEN" | "CLOSING" | "CLOSED";

const asrText = ref("");
const status = ref<Status>("UNDEFINED")

const start = () => {
  asrText.value = ''
  Iat.connectWebSocket();
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
(new nlp()).auth()
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
