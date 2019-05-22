(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('core-js/modules/es.array.for-each'), require('core-js/modules/es.function.bind'), require('core-js/modules/web.dom-collections.for-each'), require('core-js/modules/web.timers')) :
  typeof define === 'function' && define.amd ? define(['core-js/modules/es.array.for-each', 'core-js/modules/es.function.bind', 'core-js/modules/web.dom-collections.for-each', 'core-js/modules/web.timers'], factory) :
  (global = global || self, global.MyPromise = factory());
}(this, function () { 'use strict';

  var MyPromise =
  /*#__PURE__*/
  function () {
    function MyPromise(fn) {
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

    var _proto = MyPromise.prototype;

    _proto.resolve = function resolve(value) {
      var _this = this;

      if (value instanceof MyPromise) {
        return value.then(this.resolve, this.reject);
      }

      setTimeout(function () {
        if (_this.status === 'pending') {
          _this.status = 'resolved';
          _this.value = value;

          _this.resolvedCall.forEach(function (v) {
            return v();
          });
        }
      });
    };

    _proto.reject = function reject(reason) {
      var _this2 = this;

      setTimeout(function () {
        if (_this2.status === 'pending') {
          _this2.status = 'rejected';
          _this2.value = reason;

          _this2.rejectedCall.forEach(function (v) {
            return v();
          });
        }
      });
    };

    _proto.then = function then(resolvedFn, rejectedFn) {
      var _this3 = this;

      var promise2;
      resolvedFn = typeof resolvedFn === 'function' ? resolvedFn : function (v) {
        return v;
      };
      rejectedFn = typeof rejectedFn === 'function' ? rejectedFn : function (v) {
        throw v;
      };

      switch (this.status) {
        case 'pending':
          promise2 = new MyPromise(function (resolve, reject) {
            _this3.resolvedCall.push(function () {
              try {
                var res = resolvedFn(_this3.value);

                _this3.handlerPromise(promise2, res, resolve, reject);
              } catch (error) {
                reject(error);
              }
            });

            _this3.rejectedCall.push(function () {
              try {
                var res = rejectedFn(_this3.value);

                _this3.handlerPromise(promise2, res, resolve, reject);
              } catch (error) {
                reject(error);
              }
            });
          });
          break;

        case 'resolved':
          promise2 = new MyPromise(function (resolve, reject) {
            setTimeout(function () {
              try {
                var res = resolvedFn(_this3.value);

                _this3.handlerPromise(promise2, res, resolve, reject);
              } catch (error) {
                reject(error);
              }
            });
          });
          break;

        case 'rejected':
          promise2 = new MyPromise(function (resolve, reject) {
            setTimeout(function () {
              try {
                var res = rejectedFn(_this3.value);

                _this3.handlerPromise(promise2, res, resolve, reject);
              } catch (error) {
                reject(error);
              }
            });
          });
          break;
      }

      return promise2;
    };

    _proto.handlerPromise = function handlerPromise(pre, cur, resolve, reject) {
      var _this4 = this;

      if (pre === cur) {
        return reject(new TypeError('Error'));
      }

      if (cur instanceof MyPromise) {
        if (cur.status === 'pending') {
          cur.then(function (value) {
            _this4.handlerPromise(pre, value, resolve, reject);
          }, reject);
        } else {
          cur.then(resolve, reject);
        }

        return;
      }

      var called;

      if (cur !== null && (typeof cur === 'object' || typeof cur === 'function')) {
        try {
          var then = cur.then;

          if (typeof then === 'function') {
            then.call(cur, function (value) {
              if (called) return;
              called = true;

              _this4.handlerPromise(pre, value, resolve, reject);
            }, function (e) {
              if (called) return;
              called = true;
              reject(e);
            });
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
    };

    return MyPromise;
  }();

  var promiseA_ = {
    MyPromise: MyPromise,
    resolved: function resolved(value) {
      var p = new MyPromise(function (resolve) {
        resolve.call(p, value);
      });
      return p;
    },
    rejected: function rejected(value) {
      var p = new MyPromise(function (resolve, reject) {
        reject.call(p, value);
      });
      return p;
    },
    deferred: function deferred() {
      var _resolve2, _reject2;

      var a = new MyPromise(function (_resolve, _reject) {
        _resolve2 = _resolve.bind(a);
        _reject2 = _reject.bind(a);
      });
      return {
        promise: a,
        resolve: function resolve(value) {
          return _resolve2(value);
        },
        reject: function reject(value) {
          return _reject2(value);
        }
      };
    }
  };

  return promiseA_;

}));
