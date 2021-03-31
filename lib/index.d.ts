declare type Resolve = (value: any) => void;
declare type Reject = (e: any) => void;
export default class Promise {
    state: 'pending' | 'fulfilled' | 'rejected';
    value: any;
    reason: any;
    onFulfilled: Function[];
    onRejected: Function[];
    onFinished: Function[];
    constructor(executor: (resolve: Resolve, reject: Reject) => void);
    then(onFulfilled?: Resolve, onRejected?: Reject): Promise;
    catch(onRejected: Reject): Promise;
    finally(onFinished: () => void): void;
    static resolve(value: any): Promise;
    static reject(e: any): Promise;
    static race(promises: Promise[]): Promise;
    static all(promises: Promise[]): Promise;
    static any(promises: Promise[]): Promise;
    static allSettled(promises: Promise[]): Promise;
    static deferred(): {
        promise?: Promise | undefined;
        resolve?: Resolve | undefined;
        reject?: Reject | undefined;
    };
}
export {};
