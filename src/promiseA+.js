class MyPromise {
  constructor(fn) {
    this.status = 'pending';
    this.value = '';
    this.resolvedCall = [];
    this.rejectedCall = [];

    try {
      fn(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }

  resolve(value) {
    if (value instanceof MyPromise) {
      return value.then(this.resolve, this.reject);
    }
    setTimeout(() => {
      if (this.status === 'pending') {
        this.status = 'resolved';
        this.value = value;
        this.resolvedCall.forEach(v => v());
      }
    });
  }

  reject(reason) {
    setTimeout(() => {
      if (this.status === 'pending') {
        this.status = 'rejected';
        this.value = reason;
        this.rejectedCall.forEach(v => v());
      }
    });
  }

  then(resolvedFn, rejectedFn) {
    let promise2;
    resolvedFn = typeof resolvedFn === 'function' ? resolvedFn : v => v;
    rejectedFn =
      typeof rejectedFn === 'function'
        ? rejectedFn
        : v => {
            throw v;
          };
    switch (this.status) {
      case 'pending':
        promise2 = new MyPromise((resolve, reject) => {
          this.resolvedCall.push(() => {
            try {
              const res = resolvedFn(this.value);
              this.handlerPromise(promise2, res, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
          this.rejectedCall.push(() => {
            try {
              const res = rejectedFn(this.value);
              this.handlerPromise(promise2, res, resolve, reject);
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
              this.handlerPromise(promise2, res, resolve, reject);
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
              this.handlerPromise(promise2, res, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
        break;
    }
    return promise2;
  }

  handlerPromise(pre, cur, resolve, reject) {
    if (pre === cur) {
      return reject(new TypeError('Error'));
    }
    if (cur instanceof MyPromise) {
      if (cur.status === 'pending') {
        cur.then(value => {
          this.handlerPromise(pre, value, resolve, reject);
        }, reject);
      } else {
        cur.then(resolve, reject);
      }
      return;
    }

    let called;

    if (
      cur !== null &&
      (typeof cur === 'object' || typeof cur === 'function')
    ) {
      try {
        let then = cur.then;
        if (typeof then === 'function') {
          then.call(
            cur,
            value => {
              if (called) return;
              called = true;
              this.handlerPromise(pre, value, resolve, reject);
            },
            e => {
              if (called) return;
              called = true;
              reject(e);
            }
          );
        } else {
          resolve(cur);
        }
      } catch (e) {
        if (called) return;
        called = true;
        reject(e);
      }
    } else {
      resolve(cur);
    }
  }
}

export default {
  MyPromise,
  resolved(value) {
    const p = new MyPromise(resolve => {
      resolve.call(p, value);
    });
    return p;
  },
  rejected(value) {
    const p = new MyPromise((resolve, reject) => {
      reject.call(p, value);
    });
    return p;
  },
  deferred() {
    let resolve, reject;
    const a = new MyPromise((_resolve, _reject) => {
      resolve = _resolve.bind(a);
      reject = _reject.bind(a);
    });
    return {
      promise: a,
      resolve(value) {
        return resolve(value);
      },
      reject(value) {
        return reject(value);
      }
    };
  }
};
