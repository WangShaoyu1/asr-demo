export function isAudioFile(file) {
  var mimeTypes = [
    "audio/mp4",
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "audio/x-m4a",
  ];
  return mimeTypes.includes(file.type);
}

export function splitWords(str: string): string[] {
  // 定义分隔符正则表达式，包括逗号、句号、感叹号、问号和空格
  const delimiterRegex = /[\,\.\!\?\s]+/;
  // 使用正则表达式分割字符串
  const words = str.split(delimiterRegex);
  return words;
}

export function groupStrings(
  strings: string[],
  length: number = 100
): string[] {
  const MAX_LENGTH = length; // 每个输出字符串的最大长度
  const output: string[] = []; // 输出结果
  let currentString = ""; // 当前正在构建的字符串

  for (const str of strings) {
    if (currentString.length + str.length + 1 > MAX_LENGTH) {
      // 如果当前字符串加上新字符串的长度已经超过了最大长度，那么将当前字符串加入输出结果
      output.push(currentString);
      currentString = str; // 开始构建一个新的字符串
    } else {
      // 如果当前字符串加上新字符串的长度还没有超过最大长度，那么将两个字符串连接起来
      currentString += (currentString.length > 0 ? " " : "") + str;
    }
  }

  if (currentString.length > 0) {
    // 将最后一个字符串加入输出结果
    output.push(currentString);
  }

  return output;
}

export function removeSymbols(str: string): string {
  // 定义正则表达式，匹配所有非字母数字字符,留下几个标点符号
  const regex = /[^a-zA-Z0-9,\?\!\.\s\u00C0-\u1FFF\u2C00-\uD7FF]/g;
  // 使用正则表达式替换字符串中的所有符号
  const result = str.replace(regex, "");
  // 返回处理后的字符串
  return result;
}
