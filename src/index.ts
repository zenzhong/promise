/*
 * @Author: 小指
 * @Date: 2021-03-31 18:01:29
 * @LastEditTime: 2021-03-31 20:04:08
 * @LastEditors: 小指
 * @Description: 手写Promise
 */
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

type Resolve = (value: any) => void;
type Reject = (e: any) => void;

export default class Promise {
  state: 'pending' | 'fulfilled' | 'rejected';
  value: any;
  reason: any;
  onFulfilled: Function[];
  onRejected: Function[];
  onFinished: Function[];
  constructor(executor: (resolve: Resolve, reject: Reject) => void) {
    this.state = PENDING; // 状态
    this.value = undefined; // 成功结果
    this.reason = undefined; // 失败原因
    this.onFulfilled = []; // 成功回调
    this.onRejected = []; // 失败回调
    this.onFinished = []; // 结束回调

    const resolve = (value: any) => {
      if (this.state === PENDING) {
        this.state = FULFILLED;
        this.value = value;
        // 订阅Fulfilled事件，运行所有Fulfilled回调函数
        this.onFulfilled.forEach((fn) => fn(value));
        // 再运行所有Finished回调函数
        this.onFinished.forEach((fn) => fn());
      }
    };
    const reject = (e: any) => {
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.reason = e;
        // 订阅Rejected事件，运行所有Rejected回调函数
        this.onRejected.forEach((fn) => fn(e));
        // 再运行所有Finished回调函数
        this.onFinished.forEach((fn) => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilled?: Resolve, onRejected?: Reject) {
    const resolvePromise = (promise2: Promise, x: Promise, resolve: Resolve, reject: Reject) => {
      if (x === promise2) {
        return reject(new TypeError('Chaining cycle detected for promise'));
      }
      let called: boolean = false;
      if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
        try {
          let then = x.then;
          if (typeof then === 'function') {
            then.call(
              x,
              (y) => {
                if (called) {
                  return;
                }
                called = true;
                resolvePromise(promise2, y, resolve, reject);
              },
              (e) => {
                if (called) {
                  return;
                }
                called = true;
                reject(e);
              }
            );
          } else {
            resolve(x);
          }
        } catch (e) {
          if (called) {
            return;
          }
          called = true;
          reject(e);
        }
      } else {
        resolve(x);
      }
    };
    // 初始化参数
    onFulfilled =
      typeof onFulfilled === 'function'
        ? onFulfilled
        : (value: any) => value;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (e) => {
          throw e;
        };

    const self = this;
    const promise2 = new Promise((resolve, reject) => {
      if (self.state === FULFILLED) {
        setTimeout(() => {
          try {
            let x = (onFulfilled as Function)(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else if (self.state === REJECTED) {
        setTimeout(() => {
          try {
            let x = (onRejected as Function)(self.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else if (self.state === PENDING) {
        self.onFulfilled.push(() => {
          setTimeout(() => {
            try {
              let x = (onFulfilled as Function)(self.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        self.onRejected.push(() => {
          setTimeout(() => {
            try {
              let x = (onRejected as Function)(self.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });

    return promise2;
  }

  catch(onRejected: Reject) {
    return this.then(undefined, onRejected);
  }

  finally(onFinished: () => void) {
    onFinished =
      typeof onFinished === 'function'
        ? onFinished
        : () => { };
    if (this.state === FULFILLED || this.state === REJECTED) {
      setTimeout(() => {
        onFinished();
      }, 0);
    } else if (this.state === PENDING) {
      this.onFinished.push(() => {
        setTimeout(() => {
          onFinished();
        }, 0);
      });
    }
  }

  static resolve(value: any) {
    return new Promise((resolve) => {
      resolve(value);
    })
  }

  static reject(e: any) {
    return new Promise((resolve, reject) => {
      reject(e)
    });
  }

  static race(promises: Promise[]) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        promises[i].then(resolve, reject);
      }
    });
  }

  static all(promises: Promise[]) {
    const fulfills: any[] = [];
    let resolveAmount = 0;

    const resolveFn = (value: any, index: number, resolve: Resolve) => {
      fulfills[index] = value;
      resolveAmount++;
      if (resolveAmount === promises.length) {
        resolve(fulfills);
      }
    };

    return new Promise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        promises[i].then((value) => resolveFn(value, i, resolve), reject);
      }
    });
  }

  static any(promises: Promise[]) {
    let rejectAmount = 0;

    const rejectFn = (reject: Reject) => {
      rejectAmount++;
      if (rejectAmount === promises.length) {
        reject(new Error('No Promise in Promise.any was resolved'))
      }
    };

    return new Promise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        promises[i].then(resolve, () => rejectFn(reject));
      }
    });
  }

  static allSettled(promises: Promise[]) {
    let settledRes: any[] = [];
    let settledAmount = 0;

    const resolveFn = (value: any, index: number, resolve: Resolve) => {
      settledAmount++;
      settledRes[index] = {
        status: FULFILLED,
        value,
      };

      if (settledAmount === promises.length) {
        resolve(settledRes);
      }
    };

    const rejectFn = (reason: Error, index: number, resolve: Resolve) => {
      settledAmount++;
      settledRes[index] = {
        status: REJECTED,
        reason,
      };

      if (settledAmount === promises.length) {
        resolve(settledRes);
      }
    };

    return new Promise((resolve) => {
      for (let i = 0; i < promises.length; i++) {
        promises[i].then(
          (value: any) => resolveFn(value, i, resolve),
          (reason: Error) => rejectFn(reason, i, resolve),
        );
      }
    });
  }

  static deferred() {
    let dfd: {
      promise?: Promise;
      resolve?: Resolve;
      reject?: Reject;
    } = {};
    dfd.promise = new Promise((resolve, reject) => {
      dfd.resolve = resolve;
      dfd.reject = reject;
    });
    return dfd;
  }
}