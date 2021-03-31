/*
 * @Author: 小指
 * @Date: 2021-03-31 19:59:50
 * @LastEditTime: 2021-03-31 20:21:33
 * @LastEditors: 小指
 * @Description: 测试手写Promise
 */
const Promise = require('../lib/index').default;

const myPromise = new Promise((resolve, reject) => {
  console.log('立即执行');
  setTimeout(() => {
    resolve(1);
  }, 3000);
});

myPromise.then((value) => {
  console.log(value); // 1
}).finally(() => {
  console.log('结束1'); // 结束1
});

Promise.resolve(2).then((value) => {
  console.log(value);
}).finally(() => {
  console.log('结束2'); // 结束2
});

Promise.reject(3).catch((e) => {
  console.log(e); // 3
}).finally(() => {
  console.log('结束3'); // 结束3
});

Promise.all([Promise.resolve(4), Promise.resolve(5)])
  .then((res) => {
    console.log(res); // [ 4, 5 ]
  });

Promise.all([Promise.resolve(6), Promise.reject(7)])
  .catch((e) => {
    console.log(e); // 7
  });

Promise.race([Promise.resolve(8), Promise.resolve(9)])
  .then((res) => {
    console.log(res); // 8
  });

Promise.race([Promise.reject(10), Promise.reject(11)])
  .catch((e) => {
    console.log(e); // 10
  });

Promise.any([Promise.resolve(12), Promise.reject(13)])
  .then((res) => {
    console.log(res); // 12
  });

Promise.any([Promise.reject(14), Promise.reject(15)])
  .catch((e) => {
    console.log(e); // Error: No Promise in Promise.any was resolved
  });

Promise.allSettled([Promise.resolve(16), Promise.reject(17)])
  .then((res) => {
    // [
    //   { status: 'fulfilled', value: 16 },
    //   { status: 'rejected', reason: 17 }
    // ]
    console.log(res);
  });

Promise.allSettled([Promise.reject(18), Promise.reject(19)])
  .then((res) => {
    // [
    //   { status: 'rejected', reason: 18 },
    //   { status: 'rejected', reason: 19 }
    // ]
    console.log(res);
  });