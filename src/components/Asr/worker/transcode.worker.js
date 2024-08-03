import transAudioData from "../utils/transAudioData.js";

(function () {
  self.onmessage = function (e) {
    transAudioData.transcode(e.data, self.postMessage);
  };
})();
