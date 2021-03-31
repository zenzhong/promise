(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /*
     * @Author: 小指
     * @Date: 2021-03-31 18:01:29
     * @LastEditTime: 2021-03-31 20:04:08
     * @LastEditors: 小指
     * @Description: 手写Promise
     */
    var PENDING = 'pending';
    var FULFILLED = 'fulfilled';
    var REJECTED = 'rejected';
    var Promise = /** @class */ (function () {
        function Promise(executor) {
            var _this = this;
            this.state = PENDING; // 状态
            this.value = undefined; // 成功结果
            this.reason = undefined; // 失败原因
            this.onFulfilled = []; // 成功回调
            this.onRejected = []; // 失败回调
            this.onFinished = []; // 结束回调
            var resolve = function (value) {
                if (_this.state === PENDING) {
                    _this.state = FULFILLED;
                    _this.value = value;
                    // 订阅Fulfilled事件，运行所有Fulfilled回调函数
                    _this.onFulfilled.forEach(function (fn) { return fn(value); });
                    // 再运行所有Finished回调函数
                    _this.onFinished.forEach(function (fn) { return fn(); });
                }
            };
            var reject = function (e) {
                if (_this.state === PENDING) {
                    _this.state = REJECTED;
                    _this.reason = e;
                    // 订阅Rejected事件，运行所有Rejected回调函数
                    _this.onRejected.forEach(function (fn) { return fn(e); });
                    // 再运行所有Finished回调函数
                    _this.onFinished.forEach(function (fn) { return fn(); });
                }
            };
            try {
                executor(resolve, reject);
            }
            catch (e) {
                reject(e);
            }
        }
        Promise.prototype.then = function (onFulfilled, onRejected) {
            var _this = this;
            var resolvePromise = function (promise2, x, resolve, reject) {
                if (x === promise2) {
                    return reject(new TypeError('Chaining cycle detected for promise'));
                }
                var called = false;
                if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
                    try {
                        var then = x.then;
                        if (typeof then === 'function') {
                            then.call(x, function (y) {
                                if (called) {
                                    return;
                                }
                                called = true;
                                resolvePromise(promise2, y, resolve, reject);
                            }, function (e) {
                                if (called) {
                                    return;
                                }
                                called = true;
                                reject(e);
                            });
                        }
                        else {
                            resolve(x);
                        }
                    }
                    catch (e) {
                        if (called) {
                            return;
                        }
                        called = true;
                        reject(e);
                    }
                }
                else {
                    resolve(x);
                }
            };
            // 初始化参数
            onFulfilled =
                typeof onFulfilled === 'function'
                    ? onFulfilled
                    : function (value) { return value; };
            onRejected =
                typeof onRejected === 'function'
                    ? onRejected
                    : function (e) {
                        throw e;
                    };
            var self = this;
            var promise2 = new Promise(function (resolve, reject) {
                if (self.state === FULFILLED) {
                    setTimeout(function () {
                        try {
                            var x = onFulfilled(_this.value);
                            resolvePromise(promise2, x, resolve, reject);
                        }
                        catch (e) {
                            reject(e);
                        }
                    }, 0);
                }
                else if (self.state === REJECTED) {
                    setTimeout(function () {
                        try {
                            var x = onRejected(self.reason);
                            resolvePromise(promise2, x, resolve, reject);
                        }
                        catch (e) {
                            reject(e);
                        }
                    }, 0);
                }
                else if (self.state === PENDING) {
                    self.onFulfilled.push(function () {
                        setTimeout(function () {
                            try {
                                var x = onFulfilled(self.value);
                                resolvePromise(promise2, x, resolve, reject);
                            }
                            catch (e) {
                                reject(e);
                            }
                        }, 0);
                    });
                    self.onRejected.push(function () {
                        setTimeout(function () {
                            try {
                                var x = onRejected(self.reason);
                                resolvePromise(promise2, x, resolve, reject);
                            }
                            catch (e) {
                                reject(e);
                            }
                        }, 0);
                    });
                }
            });
            return promise2;
        };
        Promise.prototype.catch = function (onRejected) {
            return this.then(undefined, onRejected);
        };
        Promise.prototype.finally = function (onFinished) {
            onFinished =
                typeof onFinished === 'function'
                    ? onFinished
                    : function () { };
            if (this.state === FULFILLED || this.state === REJECTED) {
                setTimeout(function () {
                    onFinished();
                }, 0);
            }
            else if (this.state === PENDING) {
                this.onFinished.push(function () {
                    setTimeout(function () {
                        onFinished();
                    }, 0);
                });
            }
        };
        Promise.resolve = function (value) {
            return new Promise(function (resolve) {
                resolve(value);
            });
        };
        Promise.reject = function (e) {
            return new Promise(function (resolve, reject) {
                reject(e);
            });
        };
        Promise.race = function (promises) {
            return new Promise(function (resolve, reject) {
                for (var i = 0; i < promises.length; i++) {
                    promises[i].then(resolve, reject);
                }
            });
        };
        Promise.all = function (promises) {
            var fulfills = [];
            var resolveAmount = 0;
            var resolveFn = function (value, index, resolve) {
                fulfills[index] = value;
                resolveAmount++;
                if (resolveAmount === promises.length) {
                    resolve(fulfills);
                }
            };
            return new Promise(function (resolve, reject) {
                var _loop_1 = function (i) {
                    promises[i].then(function (value) { return resolveFn(value, i, resolve); }, reject);
                };
                for (var i = 0; i < promises.length; i++) {
                    _loop_1(i);
                }
            });
        };
        Promise.any = function (promises) {
            var rejectAmount = 0;
            var rejectFn = function (reject) {
                rejectAmount++;
                if (rejectAmount === promises.length) {
                    reject(new Error('No Promise in Promise.any was resolved'));
                }
            };
            return new Promise(function (resolve, reject) {
                for (var i = 0; i < promises.length; i++) {
                    promises[i].then(resolve, function () { return rejectFn(reject); });
                }
            });
        };
        Promise.allSettled = function (promises) {
            var settledRes = [];
            var settledAmount = 0;
            var resolveFn = function (value, index, resolve) {
                settledAmount++;
                settledRes[index] = {
                    status: FULFILLED,
                    value: value,
                };
                if (settledAmount === promises.length) {
                    resolve(settledRes);
                }
            };
            var rejectFn = function (reason, index, resolve) {
                settledAmount++;
                settledRes[index] = {
                    status: REJECTED,
                    reason: reason,
                };
                if (settledAmount === promises.length) {
                    resolve(settledRes);
                }
            };
            return new Promise(function (resolve) {
                var _loop_2 = function (i) {
                    promises[i].then(function (value) { return resolveFn(value, i, resolve); }, function (reason) { return rejectFn(reason, i, resolve); });
                };
                for (var i = 0; i < promises.length; i++) {
                    _loop_2(i);
                }
            });
        };
        Promise.deferred = function () {
            var dfd = {};
            dfd.promise = new Promise(function (resolve, reject) {
                dfd.resolve = resolve;
                dfd.reject = reject;
            });
            return dfd;
        };
        return Promise;
    }());
    exports.default = Promise;
});
