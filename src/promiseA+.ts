class MyPromise {
  private resolvedCalls: Array<Function>;
  private rejectedCalls: Array<Function>;
  private resolve: ResolveFn<any>;
  private reject: RejectFn<any>;

  public status: MyPromiseStatus;
  public value: any;

  constructor(fn: MyPromiseFn<any>) {
    this.status = 'pending';
    this.value = '';
    this.resolvedCalls = [];
    this.rejectedCalls = [];

    this.resolve = value => {
      if (value instanceof MyPromise) {
        return value.then(this.resolve, this.reject);
      }
      setTimeout(() => {
        if (this.status === 'pending') {
          this.status = 'resolved';
          this.value = value;
          this.resolvedCalls.forEach(v => v());
        }
      });
      return undefined;
    };

    this.reject = reason => {
      setTimeout(() => {
        if (this.status === 'pending') {
          this.status = 'rejected';
          this.value = reason;
          this.rejectedCalls.forEach(v => v());
        }
      });
    };

    try {
      fn(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }

  then(resolvedFn: any, rejectedFn: any) {
    let promise2: MyPromise = new MyPromise(() => {});
    resolvedFn = typeof resolvedFn === 'function' ? resolvedFn : (v: any) => v;
    rejectedFn =
      typeof rejectedFn === 'function'
        ? rejectedFn
        : (e: any) => {
            throw e;
          };
    switch (this.status) {
      case 'pending':
        promise2 = new MyPromise((resolve, reject) => {
          this.resolvedCalls.push(() => {
            try {
              const res = resolvedFn(this.value);
              this.hanlderPromise(promise2, res, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
          this.rejectedCalls.push(() => {
            try {
              const res = rejectedFn(this.value);
              this.hanlderPromise(promise2, res, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
        break;
      case 'resolved':
        promise2 = new MyPromise((resolve, reject) => {
          setTimeout(() => {
            try {
              const res = resolvedFn(this.value);
              this.hanlderPromise(promise2, res, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
        break;
      case 'rejected':
        promise2 = new MyPromise((resolve, reject) => {
          setTimeout(() => {
            try {
              const res = rejectedFn(this.value);
              this.hanlderPromise(promise2, res, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
        break;
    }
    return promise2;
  }

  hanlderPromise(
    pre: MyPromise,
    cur: any,
    resolve: ResolveFn<any>,
    reject: RejectFn<any>
  ) {
    if (pre === cur) {
      return reject(new TypeError('Error'));
    }
    if (cur instanceof MyPromise) {
      if (cur.status === 'pending') {
        cur.then(
          (value: any) => this.hanlderPromise(pre, value, resolve, reject),
          reject
        );
      } else {
        cur.then(resolve, reject);
      }
      return;
    }

    let called = false;
    if (
      cur !== null &&
      (typeof cur === 'function' || typeof cur === 'object')
    ) {
      try {
        let then: any = cur.then;
        if (typeof then === 'function') {
          then.call(
            cur,
            (value: any) => {
              if (called) return;
              called = true;
              this.hanlderPromise(pre, value, resolve, reject);
            },
            (e: any) => {
              if (called) return;
              called = true;
              reject(e);
            }
          );
        } else {
          resolve(cur);
        }
      } catch (error) {
        if (called) return;
        called = true;
        reject(error);
      }
    } else {
      resolve(cur);
    }
  }
}

export default {
  MyPromise,
  resolved(value?: any) {
    return new MyPromise(resolve => resolve(value));
  },
  rejected(reason?: any) {
    return new MyPromise((resolve, reject) => reject(reason));
  },
  deferred() {
    let resolve: ResolveFn<any>, reject: RejectFn<any>;
    const p = new MyPromise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    return {
      promise: p,
      resolve(value: any) {
        resolve(value);
      },
      reject(value: any) {
        reject(value);
      }
    };
  }
};
