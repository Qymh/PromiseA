(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.MyPromise = factory());
}(this, function () { 'use strict';

  var MyPromise = (function () {
      function MyPromise(fn) {
          var _this = this;
          this.status = 'pending';
          this.value = '';
          this.resolvedCalls = [];
          this.rejectedCalls = [];
          this.resolve = function (value) {
              if (value instanceof MyPromise) {
                  return value.then(_this.resolve, _this.reject);
              }
              setTimeout(function () {
                  if (_this.status === 'pending') {
                      _this.status = 'resolved';
                      _this.value = value;
                      _this.resolvedCalls.forEach(function (v) { return v(); });
                  }
              });
              return undefined;
          };
          this.reject = function (reason) {
              setTimeout(function () {
                  if (_this.status === 'pending') {
                      _this.status = 'rejected';
                      _this.value = reason;
                      _this.rejectedCalls.forEach(function (v) { return v(); });
                  }
              });
          };
          try {
              fn(this.resolve, this.reject);
          }
          catch (error) {
              this.reject(error);
          }
      }
      MyPromise.prototype.then = function (resolvedFn, rejectedFn) {
          var _this = this;
          var promise2 = new MyPromise(function () { });
          resolvedFn = typeof resolvedFn === 'function' ? resolvedFn : function (v) { return v; };
          rejectedFn =
              typeof rejectedFn === 'function'
                  ? rejectedFn
                  : function (e) {
                      throw e;
                  };
          switch (this.status) {
              case 'pending':
                  promise2 = new MyPromise(function (resolve, reject) {
                      _this.resolvedCalls.push(function () {
                          try {
                              var res = resolvedFn(_this.value);
                              _this.hanlderPromise(promise2, res, resolve, reject);
                          }
                          catch (error) {
                              reject(error);
                          }
                      });
                      _this.rejectedCalls.push(function () {
                          try {
                              var res = rejectedFn(_this.value);
                              _this.hanlderPromise(promise2, res, resolve, reject);
                          }
                          catch (error) {
                              reject(error);
                          }
                      });
                  });
                  break;
              case 'resolved':
                  promise2 = new MyPromise(function (resolve, reject) {
                      setTimeout(function () {
                          try {
                              var res = resolvedFn(_this.value);
                              _this.hanlderPromise(promise2, res, resolve, reject);
                          }
                          catch (error) {
                              reject(error);
                          }
                      });
                  });
                  break;
              case 'rejected':
                  promise2 = new MyPromise(function (resolve, reject) {
                      setTimeout(function () {
                          try {
                              var res = rejectedFn(_this.value);
                              _this.hanlderPromise(promise2, res, resolve, reject);
                          }
                          catch (error) {
                              reject(error);
                          }
                      });
                  });
                  break;
          }
          return promise2;
      };
      MyPromise.prototype.hanlderPromise = function (pre, cur, resolve, reject) {
          var _this = this;
          if (pre === cur) {
              return reject(new TypeError('Error'));
          }
          if (cur instanceof MyPromise) {
              if (cur.status === 'pending') {
                  cur.then(function (value) { return _this.hanlderPromise(pre, value, resolve, reject); }, reject);
              }
              else {
                  cur.then(resolve, reject);
              }
              return;
          }
          var called = false;
          if (cur !== null &&
              (typeof cur === 'function' || typeof cur === 'object')) {
              try {
                  var then = cur.then;
                  if (typeof then === 'function') {
                      then.call(cur, function (value) {
                          if (called)
                              return;
                          called = true;
                          _this.hanlderPromise(pre, value, resolve, reject);
                      }, function (e) {
                          if (called)
                              return;
                          called = true;
                          reject(e);
                      });
                  }
                  else {
                      resolve(cur);
                  }
              }
              catch (error) {
                  if (called)
                      return;
                  called = true;
                  reject(error);
              }
          }
          else {
              resolve(cur);
          }
      };
      return MyPromise;
  }());
  var promiseA_ = {
      MyPromise: MyPromise,
      resolved: function (value) {
          return new MyPromise(function (resolve) { return resolve(value); });
      },
      rejected: function (reason) {
          return new MyPromise(function (resolve, reject) { return reject(reason); });
      },
      deferred: function () {
          var resolve, reject;
          var p = new MyPromise(function (_resolve, _reject) {
              resolve = _resolve;
              reject = _reject;
          });
          return {
              promise: p,
              resolve: function (value) {
                  resolve(value);
              },
              reject: function (value) {
                  reject(value);
              }
          };
      }
  };

  return promiseA_;

}));
