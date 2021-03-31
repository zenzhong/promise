<!--
 * @Author: 小指
 * @Date: 2021-03-31 17:59:11
 * @LastEditTime: 2021-03-31 20:25:47
 * @LastEditors: 小指
 * @Description: 说明文档
-->
# promise

手写符合Promise A+的Promise封装，使用方法同最新Promise。

具体使用查看[MDN Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)

## 快速使用

## 安装

```bash
npm i zzq-promise
```

### 使用

```js
const Promise = require('zzq-promise').default;

new Promise((resolve, reject) => {
  resolve(1);
}).then((res) => {
  console.log(res);
}).catch((e) => {
  console.log(e);
}).finally(() => {
  console.log('Finished');
});
```