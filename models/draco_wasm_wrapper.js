var $jscomp = $jscomp || {}
$jscomp.scope = {}
$jscomp.arrayIteratorImpl = function (n) {
  var k = 0
  return function () {
    return k < n.length ? { done: !1, value: n[k++] } : { done: !0 }
  }
}
$jscomp.arrayIterator = function (n) {
  return { next: $jscomp.arrayIteratorImpl(n) }
}
$jscomp.makeIterator = function (n) {
  var k = 'undefined' != typeof Symbol && Symbol.iterator && n[Symbol.iterator]
  return k ? k.call(n) : $jscomp.arrayIterator(n)
}
$jscomp.ASSUME_ES5 = !1
$jscomp.ASSUME_NO_NATIVE_MAP = !1
$jscomp.ASSUME_NO_NATIVE_SET = !1
$jscomp.SIMPLE_FROUND_POLYFILL = !1
$jscomp.ISOLATE_POLYFILLS = !1
$jscomp.FORCE_POLYFILL_PROMISE = !1
$jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION = !1
$jscomp.getGlobal = function (n) {
  n = [
    'object' == typeof globalThis && globalThis,
    n,
    'object' == typeof window && window,
    'object' == typeof self && self,
    'object' == typeof global && global,
  ]
  for (var k = 0; k < n.length; ++k) {
    var l = n[k]
    if (l && l.Math == Math) return l
  }
  throw Error('Cannot find global object')
}
$jscomp.global = $jscomp.getGlobal(this)
$jscomp.defineProperty =
  $jscomp.ASSUME_ES5 || 'function' == typeof Object.defineProperties
    ? Object.defineProperty
    : function (n, k, l) {
        if (n == Array.prototype || n == Object.prototype) return n
        n[k] = l.value
        return n
      }
$jscomp.IS_SYMBOL_NATIVE =
  'function' === typeof Symbol && 'symbol' === typeof Symbol('x')
$jscomp.TRUST_ES6_POLYFILLS =
  !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE
$jscomp.polyfills = {}
$jscomp.propertyToPolyfillSymbol = {}
$jscomp.POLYFILL_PREFIX = '$jscp$'
var $jscomp$lookupPolyfilledValue = function (n, k) {
  var l = $jscomp.propertyToPolyfillSymbol[k]
  if (null == l) return n[k]
  l = n[l]
  return void 0 !== l ? l : n[k]
}
$jscomp.polyfill = function (n, k, l, u) {
  k &&
    ($jscomp.ISOLATE_POLYFILLS
      ? $jscomp.polyfillIsolated(n, k, l, u)
      : $jscomp.polyfillUnisolated(n, k, l, u))
}
$jscomp.polyfillUnisolated = function (n, k, l, u) {
  l = $jscomp.global
  n = n.split('.')
  for (u = 0; u < n.length - 1; u++) {
    var p = n[u]
    if (!(p in l)) return
    l = l[p]
  }
  n = n[n.length - 1]
  u = l[n]
  k = k(u)
  k != u &&
    null != k &&
    $jscomp.defineProperty(l, n, { configurable: !0, writable: !0, value: k })
}
$jscomp.polyfillIsolated = function (n, k, l, u) {
  var p = n.split('.')
  n = 1 === p.length
  u = p[0]
  u = !n && u in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global
  for (var B = 0; B < p.length - 1; B++) {
    var m = p[B]
    if (!(m in u)) return
    u = u[m]
  }
  p = p[p.length - 1]
  l = $jscomp.IS_SYMBOL_NATIVE && 'es6' === l ? u[p] : null
  k = k(l)
  null != k &&
    (n
      ? $jscomp.defineProperty($jscomp.polyfills, p, {
          configurable: !0,
          writable: !0,
          value: k,
        })
      : k !== l &&
        (void 0 === $jscomp.propertyToPolyfillSymbol[p] &&
          ((l = (1e9 * Math.random()) >>> 0),
          ($jscomp.propertyToPolyfillSymbol[p] = $jscomp.IS_SYMBOL_NATIVE
            ? $jscomp.global.Symbol(p)
            : $jscomp.POLYFILL_PREFIX + l + '$' + p)),
        $jscomp.defineProperty(u, $jscomp.propertyToPolyfillSymbol[p], {
          configurable: !0,
          writable: !0,
          value: k,
        })))
}
$jscomp.polyfill(
  'Promise',
  function (n) {
    function k() {
      this.batch_ = null
    }
    function l(m) {
      return m instanceof p
        ? m
        : new p(function (e, r) {
            e(m)
          })
    }
    if (
      n &&
      (!(
        $jscomp.FORCE_POLYFILL_PROMISE ||
        ($jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION &&
          'undefined' === typeof $jscomp.global.PromiseRejectionEvent)
      ) ||
        !$jscomp.global.Promise ||
        -1 === $jscomp.global.Promise.toString().indexOf('[native code]'))
    )
      return n
    k.prototype.asyncExecute = function (m) {
      if (null == this.batch_) {
        this.batch_ = []
        var e = this
        this.asyncExecuteFunction(function () {
          e.executeBatch_()
        })
      }
      this.batch_.push(m)
    }
    var u = $jscomp.global.setTimeout
    k.prototype.asyncExecuteFunction = function (m) {
      u(m, 0)
    }
    k.prototype.executeBatch_ = function () {
      for (; this.batch_ && this.batch_.length; ) {
        var m = this.batch_
        this.batch_ = []
        for (var e = 0; e < m.length; ++e) {
          var r = m[e]
          m[e] = null
          try {
            r()
          } catch (A) {
            this.asyncThrow_(A)
          }
        }
      }
      this.batch_ = null
    }
    k.prototype.asyncThrow_ = function (m) {
      this.asyncExecuteFunction(function () {
        throw m
      })
    }
    var p = function (m) {
      this.state_ = 0
      this.result_ = void 0
      this.onSettledCallbacks_ = []
      this.isRejectionHandled_ = !1
      var e = this.createResolveAndReject_()
      try {
        m(e.resolve, e.reject)
      } catch (r) {
        e.reject(r)
      }
    }
    p.prototype.createResolveAndReject_ = function () {
      function m(A) {
        return function (H) {
          r || ((r = !0), A.call(e, H))
        }
      }
      var e = this,
        r = !1
      return { resolve: m(this.resolveTo_), reject: m(this.reject_) }
    }
    p.prototype.resolveTo_ = function (m) {
      if (m === this)
        this.reject_(new TypeError('A Promise cannot resolve to itself'))
      else if (m instanceof p) this.settleSameAsPromise_(m)
      else {
        a: switch (typeof m) {
          case 'object':
            var e = null != m
            break a
          case 'function':
            e = !0
            break a
          default:
            e = !1
        }
        e ? this.resolveToNonPromiseObj_(m) : this.fulfill_(m)
      }
    }
    p.prototype.resolveToNonPromiseObj_ = function (m) {
      var e = void 0
      try {
        e = m.then
      } catch (r) {
        this.reject_(r)
        return
      }
      'function' == typeof e
        ? this.settleSameAsThenable_(e, m)
        : this.fulfill_(m)
    }
    p.prototype.reject_ = function (m) {
      this.settle_(2, m)
    }
    p.prototype.fulfill_ = function (m) {
      this.settle_(1, m)
    }
    p.prototype.settle_ = function (m, e) {
      if (0 != this.state_)
        throw Error(
          'Cannot settle(' +
            m +
            ', ' +
            e +
            '): Promise already settled in state' +
            this.state_
        )
      this.state_ = m
      this.result_ = e
      2 === this.state_ && this.scheduleUnhandledRejectionCheck_()
      this.executeOnSettledCallbacks_()
    }
    p.prototype.scheduleUnhandledRejectionCheck_ = function () {
      var m = this
      u(function () {
        if (m.notifyUnhandledRejection_()) {
          var e = $jscomp.global.console
          'undefined' !== typeof e && e.error(m.result_)
        }
      }, 1)
    }
    p.prototype.notifyUnhandledRejection_ = function () {
      if (this.isRejectionHandled_) return !1
      var m = $jscomp.global.CustomEvent,
        e = $jscomp.global.Event,
        r = $jscomp.global.dispatchEvent
      if ('undefined' === typeof r) return !0
      'function' === typeof m
        ? (m = new m('unhandledrejection', { cancelable: !0 }))
        : 'function' === typeof e
        ? (m = new e('unhandledrejection', { cancelable: !0 }))
        : ((m = $jscomp.global.document.createEvent('CustomEvent')),
          m.initCustomEvent('unhandledrejection', !1, !0, m))
      m.promise = this
      m.reason = this.result_
      return r(m)
    }
    p.prototype.executeOnSettledCallbacks_ = function () {
      if (null != this.onSettledCallbacks_) {
        for (var m = 0; m < this.onSettledCallbacks_.length; ++m)
          B.asyncExecute(this.onSettledCallbacks_[m])
        this.onSettledCallbacks_ = null
      }
    }
    var B = new k()
    p.prototype.settleSameAsPromise_ = function (m) {
      var e = this.createResolveAndReject_()
      m.callWhenSettled_(e.resolve, e.reject)
    }
    p.prototype.settleSameAsThenable_ = function (m, e) {
      var r = this.createResolveAndReject_()
      try {
        m.call(e, r.resolve, r.reject)
      } catch (A) {
        r.reject(A)
      }
    }
    p.prototype.then = function (m, e) {
      function r(V, W) {
        return 'function' == typeof V
          ? function (ma) {
              try {
                A(V(ma))
              } catch (c) {
                H(c)
              }
            }
          : W
      }
      var A,
        H,
        ka = new p(function (V, W) {
          A = V
          H = W
        })
      this.callWhenSettled_(r(m, A), r(e, H))
      return ka
    }
    p.prototype.catch = function (m) {
      return this.then(void 0, m)
    }
    p.prototype.callWhenSettled_ = function (m, e) {
      function r() {
        switch (A.state_) {
          case 1:
            m(A.result_)
            break
          case 2:
            e(A.result_)
            break
          default:
            throw Error('Unexpected state: ' + A.state_)
        }
      }
      var A = this
      null == this.onSettledCallbacks_
        ? B.asyncExecute(r)
        : this.onSettledCallbacks_.push(r)
      this.isRejectionHandled_ = !0
    }
    p.resolve = l
    p.reject = function (m) {
      return new p(function (e, r) {
        r(m)
      })
    }
    p.race = function (m) {
      return new p(function (e, r) {
        for (
          var A = $jscomp.makeIterator(m), H = A.next();
          !H.done;
          H = A.next()
        )
          l(H.value).callWhenSettled_(e, r)
      })
    }
    p.all = function (m) {
      var e = $jscomp.makeIterator(m),
        r = e.next()
      return r.done
        ? l([])
        : new p(function (A, H) {
            function ka(ma) {
              return function (c) {
                V[ma] = c
                W--
                0 == W && A(V)
              }
            }
            var V = [],
              W = 0
            do
              V.push(void 0),
                W++,
                l(r.value).callWhenSettled_(ka(V.length - 1), H),
                (r = e.next())
            while (!r.done)
          })
    }
    return p
  },
  'es6',
  'es3'
)
$jscomp.owns = function (n, k) {
  return Object.prototype.hasOwnProperty.call(n, k)
}
$jscomp.assign =
  $jscomp.TRUST_ES6_POLYFILLS && 'function' == typeof Object.assign
    ? Object.assign
    : function (n, k) {
        for (var l = 1; l < arguments.length; l++) {
          var u = arguments[l]
          if (u) for (var p in u) $jscomp.owns(u, p) && (n[p] = u[p])
        }
        return n
      }
$jscomp.polyfill(
  'Object.assign',
  function (n) {
    return n || $jscomp.assign
  },
  'es6',
  'es3'
)
$jscomp.polyfill(
  'Math.imul',
  function (n) {
    return n
      ? n
      : function (k, l) {
          k = Number(k)
          l = Number(l)
          var u = k & 65535,
            p = l & 65535
          return (
            (u * p +
              (((((k >>> 16) & 65535) * p + u * ((l >>> 16) & 65535)) << 16) >>>
                0)) |
            0
          )
        }
  },
  'es6',
  'es3'
)
$jscomp.polyfill(
  'Math.fround',
  function (n) {
    if (n) return n
    if ($jscomp.SIMPLE_FROUND_POLYFILL || 'function' !== typeof Float32Array)
      return function (l) {
        return l
      }
    var k = new Float32Array(1)
    return function (l) {
      k[0] = l
      return k[0]
    }
  },
  'es6',
  'es3'
)
$jscomp.polyfill(
  'Math.clz32',
  function (n) {
    return n
      ? n
      : function (k) {
          k = Number(k) >>> 0
          if (0 === k) return 32
          var l = 0
          0 === (k & 4294901760) && ((k <<= 16), (l += 16))
          0 === (k & 4278190080) && ((k <<= 8), (l += 8))
          0 === (k & 4026531840) && ((k <<= 4), (l += 4))
          0 === (k & 3221225472) && ((k <<= 2), (l += 2))
          0 === (k & 2147483648) && l++
          return l
        }
  },
  'es6',
  'es3'
)
$jscomp.polyfill(
  'Math.trunc',
  function (n) {
    return n
      ? n
      : function (k) {
          k = Number(k)
          if (isNaN(k) || Infinity === k || -Infinity === k || 0 === k) return k
          var l = Math.floor(Math.abs(k))
          return 0 > k ? -l : l
        }
  },
  'es6',
  'es3'
)
$jscomp.checkStringArgs = function (n, k, l) {
  if (null == n)
    throw new TypeError(
      "The 'this' value for String.prototype." +
        l +
        ' must not be null or undefined'
    )
  if (k instanceof RegExp)
    throw new TypeError(
      'First argument to String.prototype.' +
        l +
        ' must not be a regular expression'
    )
  return n + ''
}
$jscomp.polyfill(
  'String.prototype.startsWith',
  function (n) {
    return n
      ? n
      : function (k, l) {
          var u = $jscomp.checkStringArgs(this, k, 'startsWith')
          k += ''
          var p = u.length,
            B = k.length
          l = Math.max(0, Math.min(l | 0, u.length))
          for (var m = 0; m < B && l < p; ) if (u[l++] != k[m++]) return !1
          return m >= B
        }
  },
  'es6',
  'es3'
)
$jscomp.polyfill(
  'Array.prototype.copyWithin',
  function (n) {
    function k(l) {
      l = Number(l)
      return Infinity === l || -Infinity === l ? l : l | 0
    }
    return n
      ? n
      : function (l, u, p) {
          var B = this.length
          l = k(l)
          u = k(u)
          p = void 0 === p ? B : k(p)
          l = 0 > l ? Math.max(B + l, 0) : Math.min(l, B)
          u = 0 > u ? Math.max(B + u, 0) : Math.min(u, B)
          p = 0 > p ? Math.max(B + p, 0) : Math.min(p, B)
          if (l < u)
            for (; u < p; )
              u in this ? (this[l++] = this[u++]) : (delete this[l++], u++)
          else
            for (p = Math.min(p, B + u - l), l += p - u; p > u; )
              --p in this ? (this[--l] = this[p]) : delete this[--l]
          return this
        }
  },
  'es6',
  'es3'
)
$jscomp.typedArrayCopyWithin = function (n) {
  return n ? n : Array.prototype.copyWithin
}
$jscomp.polyfill(
  'Int8Array.prototype.copyWithin',
  $jscomp.typedArrayCopyWithin,
  'es6',
  'es5'
)
$jscomp.polyfill(
  'Uint8Array.prototype.copyWithin',
  $jscomp.typedArrayCopyWithin,
  'es6',
  'es5'
)
$jscomp.polyfill(
  'Uint8ClampedArray.prototype.copyWithin',
  $jscomp.typedArrayCopyWithin,
  'es6',
  'es5'
)
$jscomp.polyfill(
  'Int16Array.prototype.copyWithin',
  $jscomp.typedArrayCopyWithin,
  'es6',
  'es5'
)
$jscomp.polyfill(
  'Uint16Array.prototype.copyWithin',
  $jscomp.typedArrayCopyWithin,
  'es6',
  'es5'
)
$jscomp.polyfill(
  'Int32Array.prototype.copyWithin',
  $jscomp.typedArrayCopyWithin,
  'es6',
  'es5'
)
$jscomp.polyfill(
  'Uint32Array.prototype.copyWithin',
  $jscomp.typedArrayCopyWithin,
  'es6',
  'es5'
)
$jscomp.polyfill(
  'Float32Array.prototype.copyWithin',
  $jscomp.typedArrayCopyWithin,
  'es6',
  'es5'
)
$jscomp.polyfill(
  'Float64Array.prototype.copyWithin',
  $jscomp.typedArrayCopyWithin,
  'es6',
  'es5'
)
var DracoDecoderModule = (function () {
  var n =
    'undefined' !== typeof document && document.currentScript
      ? document.currentScript.src
      : void 0
  'undefined' !== typeof __filename && (n = n || __filename)
  return function (k) {
    function l(g) {
      return a.locateFile ? a.locateFile(g, ba) : ba + g
    }
    function u(g) {
      u.shown || (u.shown = {})
      u.shown[g] || ((u.shown[g] = 1), I(g))
    }
    function p(g, b) {
      Object.getOwnPropertyDescriptor(a, g) ||
        Object.defineProperty(a, g, {
          configurable: !0,
          get: function () {
            c(
              'Module.' +
                g +
                ' has been replaced with plain ' +
                b +
                ' (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)'
            )
          },
        })
    }
    function B(g, b) {
      g =
        "'" +
        g +
        "' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)"
      b &&
        (g +=
          '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you')
      return g
    }
    function m(g, b) {
      Object.getOwnPropertyDescriptor(a, g) ||
        Object.defineProperty(a, g, {
          configurable: !0,
          get: function () {
            c(B(g, b))
          },
        })
    }
    function e(g, b) {
      Object.getOwnPropertyDescriptor(a, g) ||
        (a[g] = function () {
          return c(B(g, b))
        })
    }
    function r(g, b) {
      g || c('Assertion failed' + (b ? ': ' + b : ''))
    }
    function A(g, b, d) {
      var f = b + d
      for (d = b; g[d] && !(d >= f); ) ++d
      if (16 < d - b && g.buffer && Pa) return Pa.decode(g.subarray(b, d))
      for (f = ''; b < d; ) {
        var q = g[b++]
        if (q & 128) {
          var v = g[b++] & 63
          if (192 == (q & 224)) f += String.fromCharCode(((q & 31) << 6) | v)
          else {
            var D = g[b++] & 63
            224 == (q & 240)
              ? (q = ((q & 15) << 12) | (v << 6) | D)
              : (240 != (q & 248) &&
                  u(
                    'Invalid UTF-8 leading byte 0x' +
                      q.toString(16) +
                      ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!'
                  ),
                (q = ((q & 7) << 18) | (v << 12) | (D << 6) | (g[b++] & 63)))
            65536 > q
              ? (f += String.fromCharCode(q))
              : ((q -= 65536),
                (f += String.fromCharCode(
                  55296 | (q >> 10),
                  56320 | (q & 1023)
                )))
          }
        } else f += String.fromCharCode(q)
      }
      return f
    }
    function H(g, b) {
      return g ? A(na, g, b) : ''
    }
    function ka(g) {
      Ba = g
      a.HEAP8 = da = new Int8Array(g)
      a.HEAP16 = new Int16Array(g)
      a.HEAP32 = fa = new Int32Array(g)
      a.HEAPU8 = na = new Uint8Array(g)
      a.HEAPU16 = new Uint16Array(g)
      a.HEAPU32 = J = new Uint32Array(g)
      a.HEAPF32 = new Float32Array(g)
      a.HEAPF64 = new Float64Array(g)
    }
    function V() {
      var g = Ca()
      r(0 == (g & 3))
      fa[g >> 2] = 34821223
      fa[(g + 4) >> 2] = 2310721022
      J[0] = 1668509029
    }
    function W() {
      if (!ta) {
        var g = Ca(),
          b = J[g >> 2],
          d = J[(g + 4) >> 2]
        ;(34821223 == b && 2310721022 == d) ||
          c(
            'Stack overflow! Stack cookie has been overwritten at 0x' +
              g.toString(16) +
              ', expected hex dwords 0x89BACDFE and 0x2135467, but received 0x' +
              d.toString(16) +
              ' 0x' +
              b.toString(16)
          )
        1668509029 !== J[0] &&
          c(
            'Runtime error: The application has corrupted its heap memory area (address zero)!'
          )
      }
    }
    function ma(g) {
      ia++
      a.monitorRunDependencies && a.monitorRunDependencies(ia)
      g
        ? (r(!oa[g]),
          (oa[g] = 1),
          null === ja &&
            'undefined' != typeof setInterval &&
            (ja = setInterval(function () {
              if (ta) clearInterval(ja), (ja = null)
              else {
                var b = !1,
                  d
                for (d in oa)
                  b || ((b = !0), I('still waiting on run dependencies:')),
                    I('dependency: ' + d)
                b && I('(end of list)')
              }
            }, 1e4)))
        : I('warning: run dependency added without ID')
    }
    function c(g) {
      if (a.onAbort) a.onAbort(g)
      g = 'Aborted(' + g + ')'
      I(g)
      ta = !0
      g = new WebAssembly.RuntimeError(g)
      Da(g)
      throw g
    }
    function h(g, b) {
      return function () {
        var d = b
        b || (d = a.asm)
        r(
          ua,
          'native function `' + g + '` called before runtime initialization'
        )
        d[g] || r(d[g], 'exported native function `' + g + '` not found')
        return d[g].apply(null, arguments)
      }
    }
    function Qa(g) {
      try {
        if (g == K && pa) return new Uint8Array(pa)
        if (qa) return qa(g)
        throw 'both async and sync fetching of the wasm failed'
      } catch (b) {
        c(b)
      }
    }
    function db() {
      if (!pa && (Ea || la)) {
        if ('function' == typeof fetch && !K.startsWith('file://'))
          return fetch(K, { credentials: 'same-origin' })
            .then(function (g) {
              if (!g.ok) throw "failed to load wasm binary file at '" + K + "'"
              return g.arrayBuffer()
            })
            .catch(function () {
              return Qa(K)
            })
        if (va)
          return new Promise(function (g, b) {
            va(
              K,
              function (d) {
                g(new Uint8Array(d))
              },
              b
            )
          })
      }
      return Promise.resolve().then(function () {
        return Qa(K)
      })
    }
    function Fa(g) {
      for (; 0 < g.length; ) {
        var b = g.shift()
        if ('function' == typeof b) b(a)
        else {
          var d = b.func
          'number' == typeof d
            ? void 0 === b.arg
              ? Ra(d)()
              : Ra(d)(b.arg)
            : d(void 0 === b.arg ? null : b.arg)
        }
      }
    }
    function Ra(g) {
      var b = wa[g]
      b || (g >= wa.length && (wa.length = g + 1), (wa[g] = b = xa.get(g)))
      r(
        xa.get(g) == b,
        'JavaScript-side Wasm function table mirror is out of date!'
      )
      return b
    }
    function eb(g) {
      this.excPtr = g
      this.ptr = g - 24
      this.set_type = function (b) {
        J[(this.ptr + 4) >> 2] = b
      }
      this.get_type = function () {
        return J[(this.ptr + 4) >> 2]
      }
      this.set_destructor = function (b) {
        J[(this.ptr + 8) >> 2] = b
      }
      this.get_destructor = function () {
        return J[(this.ptr + 8) >> 2]
      }
      this.set_refcount = function (b) {
        fa[this.ptr >> 2] = b
      }
      this.set_caught = function (b) {
        da[(this.ptr + 12) >> 0] = b ? 1 : 0
      }
      this.get_caught = function () {
        return 0 != da[(this.ptr + 12) >> 0]
      }
      this.set_rethrown = function (b) {
        da[(this.ptr + 13) >> 0] = b ? 1 : 0
      }
      this.get_rethrown = function () {
        return 0 != da[(this.ptr + 13) >> 0]
      }
      this.init = function (b, d) {
        this.set_adjusted_ptr(0)
        this.set_type(b)
        this.set_destructor(d)
        this.set_refcount(0)
        this.set_caught(!1)
        this.set_rethrown(!1)
      }
      this.add_ref = function () {
        fa[this.ptr >> 2] += 1
      }
      this.release_ref = function () {
        var b = fa[this.ptr >> 2]
        fa[this.ptr >> 2] = b - 1
        r(0 < b)
        return 1 === b
      }
      this.set_adjusted_ptr = function (b) {
        J[(this.ptr + 16) >> 2] = b
      }
      this.get_adjusted_ptr = function () {
        return J[(this.ptr + 16) >> 2]
      }
      this.get_exception_ptr = function () {
        if (fb(this.get_type())) return J[this.excPtr >> 2]
        var b = this.get_adjusted_ptr()
        return 0 !== b ? b : this.excPtr
      }
    }
    function Ga(g) {
      function b() {
        if (!ya && ((ya = !0), (a.calledRun = !0), !ta)) {
          r(!ua)
          ua = !0
          W()
          Fa(Ha)
          Sa(a)
          if (a.onRuntimeInitialized) a.onRuntimeInitialized()
          r(
            !a._main,
            'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]'
          )
          W()
          if (a.postRun)
            for (
              'function' == typeof a.postRun && (a.postRun = [a.postRun]);
              a.postRun.length;

            )
              Ta.unshift(a.postRun.shift())
          Fa(Ta)
        }
      }
      if (!(0 < ia)) {
        Ua()
        V()
        if (a.preRun)
          for (
            'function' == typeof a.preRun && (a.preRun = [a.preRun]);
            a.preRun.length;

          )
            Va.unshift(a.preRun.shift())
        Fa(Va)
        0 < ia ||
          (a.setStatus
            ? (a.setStatus('Running...'),
              setTimeout(function () {
                setTimeout(function () {
                  a.setStatus('')
                }, 1)
                b()
              }, 1))
            : b(),
          W())
      }
    }
    function x() {}
    function C(g) {
      return (g || x).__cache__
    }
    function X(g, b) {
      var d = C(b),
        f = d[g]
      if (f) return f
      f = Object.create((b || x).prototype)
      f.ptr = g
      return (d[g] = f)
    }
    function ha(g) {
      if ('string' === typeof g) {
        for (var b = 0, d = 0; d < g.length; ++d) {
          var f = g.charCodeAt(d)
          55296 <= f &&
            57343 >= f &&
            (f = (65536 + ((f & 1023) << 10)) | (g.charCodeAt(++d) & 1023))
          127 >= f ? ++b : (b = 2047 >= f ? b + 2 : 65535 >= f ? b + 3 : b + 4)
        }
        b = Array(b + 1)
        d = 0
        f = b.length
        if (0 < f) {
          f = d + f - 1
          for (var q = 0; q < g.length; ++q) {
            var v = g.charCodeAt(q)
            if (55296 <= v && 57343 >= v) {
              var D = g.charCodeAt(++q)
              v = (65536 + ((v & 1023) << 10)) | (D & 1023)
            }
            if (127 >= v) {
              if (d >= f) break
              b[d++] = v
            } else {
              if (2047 >= v) {
                if (d + 1 >= f) break
                b[d++] = 192 | (v >> 6)
              } else {
                if (65535 >= v) {
                  if (d + 2 >= f) break
                  b[d++] = 224 | (v >> 12)
                } else {
                  if (d + 3 >= f) break
                  1114111 < v &&
                    u(
                      'Invalid Unicode code point 0x' +
                        v.toString(16) +
                        ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).'
                    )
                  b[d++] = 240 | (v >> 18)
                  b[d++] = 128 | ((v >> 12) & 63)
                }
                b[d++] = 128 | ((v >> 6) & 63)
              }
              b[d++] = 128 | (v & 63)
            }
          }
          b[d] = 0
        }
        g = w.alloc(b, da)
        w.copy(b, da, g)
        return g
      }
      return g
    }
    function Ia(g) {
      if ('object' === typeof g) {
        var b = w.alloc(g, da)
        w.copy(g, da, b)
        return b
      }
      return g
    }
    function ea() {
      throw 'cannot construct a VoidPtr, no constructor in IDL'
    }
    function Y() {
      this.ptr = gb()
      C(Y)[this.ptr] = this
    }
    function U() {
      this.ptr = hb()
      C(U)[this.ptr] = this
    }
    function ca() {
      this.ptr = ib()
      C(ca)[this.ptr] = this
    }
    function y() {
      this.ptr = jb()
      C(y)[this.ptr] = this
    }
    function F() {
      this.ptr = kb()
      C(F)[this.ptr] = this
    }
    function L() {
      this.ptr = lb()
      C(L)[this.ptr] = this
    }
    function M() {
      this.ptr = mb()
      C(M)[this.ptr] = this
    }
    function G() {
      this.ptr = nb()
      C(G)[this.ptr] = this
    }
    function Z() {
      this.ptr = ob()
      C(Z)[this.ptr] = this
    }
    function E() {
      throw 'cannot construct a Status, no constructor in IDL'
    }
    function N() {
      this.ptr = pb()
      C(N)[this.ptr] = this
    }
    function O() {
      this.ptr = qb()
      C(O)[this.ptr] = this
    }
    function P() {
      this.ptr = rb()
      C(P)[this.ptr] = this
    }
    function Q() {
      this.ptr = sb()
      C(Q)[this.ptr] = this
    }
    function R() {
      this.ptr = tb()
      C(R)[this.ptr] = this
    }
    function S() {
      this.ptr = ub()
      C(S)[this.ptr] = this
    }
    function T() {
      this.ptr = vb()
      C(T)[this.ptr] = this
    }
    function z() {
      this.ptr = wb()
      C(z)[this.ptr] = this
    }
    function t() {
      this.ptr = xb()
      C(t)[this.ptr] = this
    }
    k = k || {}
    var a = 'undefined' != typeof k ? k : {},
      Sa,
      Da
    a.ready = new Promise(function (g, b) {
      Sa = g
      Da = b
    })
    Object.getOwnPropertyDescriptor(a.ready, '_free') ||
      (Object.defineProperty(a.ready, '_free', {
        configurable: !0,
        get: function () {
          c(
            'You are getting _free on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }),
      Object.defineProperty(a.ready, '_free', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _free on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(a.ready, '_malloc') ||
      (Object.defineProperty(a.ready, '_malloc', {
        configurable: !0,
        get: function () {
          c(
            'You are getting _malloc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }),
      Object.defineProperty(a.ready, '_malloc', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _malloc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_VoidPtr___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_VoidPtr___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_VoidPtr___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(a.ready, '_emscripten_bind_VoidPtr___destroy___0', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_bind_VoidPtr___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DecoderBuffer_DecoderBuffer_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DecoderBuffer_DecoderBuffer_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DecoderBuffer_DecoderBuffer_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DecoderBuffer_DecoderBuffer_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DecoderBuffer_DecoderBuffer_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DecoderBuffer_Init_2'
    ) ||
      (Object.defineProperty(a.ready, '_emscripten_bind_DecoderBuffer_Init_2', {
        configurable: !0,
        get: function () {
          c(
            'You are getting _emscripten_bind_DecoderBuffer_Init_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }),
      Object.defineProperty(a.ready, '_emscripten_bind_DecoderBuffer_Init_2', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_bind_DecoderBuffer_Init_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DecoderBuffer___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DecoderBuffer___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DecoderBuffer___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DecoderBuffer___destroy___0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DecoderBuffer___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_AttributeTransformData_AttributeTransformData_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeTransformData_AttributeTransformData_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_AttributeTransformData_AttributeTransformData_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeTransformData_AttributeTransformData_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_AttributeTransformData_AttributeTransformData_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_AttributeTransformData_transform_type_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeTransformData_transform_type_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_AttributeTransformData_transform_type_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeTransformData_transform_type_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_AttributeTransformData_transform_type_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_AttributeTransformData___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeTransformData___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_AttributeTransformData___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeTransformData___destroy___0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_AttributeTransformData___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_GeometryAttribute_GeometryAttribute_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_GeometryAttribute_GeometryAttribute_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_GeometryAttribute_GeometryAttribute_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_GeometryAttribute_GeometryAttribute_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_GeometryAttribute_GeometryAttribute_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_GeometryAttribute___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_GeometryAttribute___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_GeometryAttribute___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_GeometryAttribute___destroy___0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_GeometryAttribute___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_PointAttribute_PointAttribute_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_PointAttribute_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_PointAttribute_PointAttribute_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_PointAttribute_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_PointAttribute_PointAttribute_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_PointAttribute_size_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_size_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_PointAttribute_size_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(a.ready, '_emscripten_bind_PointAttribute_size_0', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_bind_PointAttribute_size_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_PointAttribute_GetAttributeTransformData_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_GetAttributeTransformData_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_PointAttribute_GetAttributeTransformData_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_GetAttributeTransformData_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_PointAttribute_GetAttributeTransformData_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_PointAttribute_attribute_type_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_attribute_type_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_PointAttribute_attribute_type_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_attribute_type_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_PointAttribute_attribute_type_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_PointAttribute_data_type_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_data_type_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_PointAttribute_data_type_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_data_type_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_PointAttribute_data_type_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_PointAttribute_num_components_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_num_components_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_PointAttribute_num_components_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_num_components_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_PointAttribute_num_components_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_PointAttribute_normalized_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_normalized_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_PointAttribute_normalized_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_normalized_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_PointAttribute_normalized_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_PointAttribute_byte_stride_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_byte_stride_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_PointAttribute_byte_stride_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_byte_stride_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_PointAttribute_byte_stride_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_PointAttribute_byte_offset_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_byte_offset_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_PointAttribute_byte_offset_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_byte_offset_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_PointAttribute_byte_offset_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_PointAttribute_unique_id_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_unique_id_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_PointAttribute_unique_id_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute_unique_id_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_PointAttribute_unique_id_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_PointAttribute___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_PointAttribute___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointAttribute___destroy___0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_PointAttribute___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_AttributeQuantizationTransform_quantization_bits_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeQuantizationTransform_quantization_bits_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeQuantizationTransform_quantization_bits_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_AttributeQuantizationTransform_min_value_1'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeQuantizationTransform_min_value_1',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_AttributeQuantizationTransform_min_value_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeQuantizationTransform_min_value_1',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_AttributeQuantizationTransform_min_value_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_AttributeQuantizationTransform_range_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeQuantizationTransform_range_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_AttributeQuantizationTransform_range_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeQuantizationTransform_range_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_AttributeQuantizationTransform_range_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_AttributeQuantizationTransform___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeQuantizationTransform___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_AttributeQuantizationTransform___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeQuantizationTransform___destroy___0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_AttributeQuantizationTransform___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_AttributeOctahedronTransform_quantization_bits_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeOctahedronTransform_quantization_bits_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeOctahedronTransform_quantization_bits_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_AttributeOctahedronTransform___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeOctahedronTransform___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_AttributeOctahedronTransform___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_AttributeOctahedronTransform___destroy___0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_AttributeOctahedronTransform___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_PointCloud_PointCloud_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointCloud_PointCloud_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_PointCloud_PointCloud_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointCloud_PointCloud_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_PointCloud_PointCloud_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_PointCloud_num_attributes_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointCloud_num_attributes_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_PointCloud_num_attributes_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointCloud_num_attributes_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_PointCloud_num_attributes_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_PointCloud_num_points_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointCloud_num_points_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_PointCloud_num_points_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointCloud_num_points_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_PointCloud_num_points_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_PointCloud___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointCloud___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_PointCloud___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_PointCloud___destroy___0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_PointCloud___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(a.ready, '_emscripten_bind_Mesh_Mesh_0') ||
      (Object.defineProperty(a.ready, '_emscripten_bind_Mesh_Mesh_0', {
        configurable: !0,
        get: function () {
          c(
            'You are getting _emscripten_bind_Mesh_Mesh_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }),
      Object.defineProperty(a.ready, '_emscripten_bind_Mesh_Mesh_0', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_bind_Mesh_Mesh_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Mesh_num_faces_0'
    ) ||
      (Object.defineProperty(a.ready, '_emscripten_bind_Mesh_num_faces_0', {
        configurable: !0,
        get: function () {
          c(
            'You are getting _emscripten_bind_Mesh_num_faces_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }),
      Object.defineProperty(a.ready, '_emscripten_bind_Mesh_num_faces_0', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_bind_Mesh_num_faces_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Mesh_num_attributes_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Mesh_num_attributes_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Mesh_num_attributes_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(a.ready, '_emscripten_bind_Mesh_num_attributes_0', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_bind_Mesh_num_attributes_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Mesh_num_points_0'
    ) ||
      (Object.defineProperty(a.ready, '_emscripten_bind_Mesh_num_points_0', {
        configurable: !0,
        get: function () {
          c(
            'You are getting _emscripten_bind_Mesh_num_points_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }),
      Object.defineProperty(a.ready, '_emscripten_bind_Mesh_num_points_0', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_bind_Mesh_num_points_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Mesh___destroy___0'
    ) ||
      (Object.defineProperty(a.ready, '_emscripten_bind_Mesh___destroy___0', {
        configurable: !0,
        get: function () {
          c(
            'You are getting _emscripten_bind_Mesh___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }),
      Object.defineProperty(a.ready, '_emscripten_bind_Mesh___destroy___0', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_bind_Mesh___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Metadata_Metadata_0'
    ) ||
      (Object.defineProperty(a.ready, '_emscripten_bind_Metadata_Metadata_0', {
        configurable: !0,
        get: function () {
          c(
            'You are getting _emscripten_bind_Metadata_Metadata_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }),
      Object.defineProperty(a.ready, '_emscripten_bind_Metadata_Metadata_0', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_bind_Metadata_Metadata_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Metadata___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Metadata___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Metadata___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Metadata___destroy___0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Metadata___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Status_code_0'
    ) ||
      (Object.defineProperty(a.ready, '_emscripten_bind_Status_code_0', {
        configurable: !0,
        get: function () {
          c(
            'You are getting _emscripten_bind_Status_code_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }),
      Object.defineProperty(a.ready, '_emscripten_bind_Status_code_0', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_bind_Status_code_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(a.ready, '_emscripten_bind_Status_ok_0') ||
      (Object.defineProperty(a.ready, '_emscripten_bind_Status_ok_0', {
        configurable: !0,
        get: function () {
          c(
            'You are getting _emscripten_bind_Status_ok_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }),
      Object.defineProperty(a.ready, '_emscripten_bind_Status_ok_0', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_bind_Status_ok_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Status_error_msg_0'
    ) ||
      (Object.defineProperty(a.ready, '_emscripten_bind_Status_error_msg_0', {
        configurable: !0,
        get: function () {
          c(
            'You are getting _emscripten_bind_Status_error_msg_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }),
      Object.defineProperty(a.ready, '_emscripten_bind_Status_error_msg_0', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_bind_Status_error_msg_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Status___destroy___0'
    ) ||
      (Object.defineProperty(a.ready, '_emscripten_bind_Status___destroy___0', {
        configurable: !0,
        get: function () {
          c(
            'You are getting _emscripten_bind_Status___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }),
      Object.defineProperty(a.ready, '_emscripten_bind_Status___destroy___0', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_bind_Status___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoFloat32Array_DracoFloat32Array_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoFloat32Array_DracoFloat32Array_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoFloat32Array_DracoFloat32Array_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoFloat32Array_GetValue_1'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoFloat32Array_GetValue_1',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoFloat32Array_GetValue_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoFloat32Array_GetValue_1',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoFloat32Array_GetValue_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoFloat32Array_size_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoFloat32Array_size_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoFloat32Array_size_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoFloat32Array_size_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoFloat32Array_size_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoFloat32Array___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoFloat32Array___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoFloat32Array___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoFloat32Array___destroy___0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoFloat32Array___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoInt8Array_DracoInt8Array_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt8Array_DracoInt8Array_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoInt8Array_DracoInt8Array_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt8Array_DracoInt8Array_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoInt8Array_DracoInt8Array_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoInt8Array_GetValue_1'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt8Array_GetValue_1',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoInt8Array_GetValue_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt8Array_GetValue_1',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoInt8Array_GetValue_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoInt8Array_size_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt8Array_size_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoInt8Array_size_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(a.ready, '_emscripten_bind_DracoInt8Array_size_0', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_bind_DracoInt8Array_size_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoInt8Array___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt8Array___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoInt8Array___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt8Array___destroy___0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoInt8Array___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoUInt8Array_DracoUInt8Array_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt8Array_DracoUInt8Array_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt8Array_DracoUInt8Array_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoUInt8Array_GetValue_1'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt8Array_GetValue_1',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoUInt8Array_GetValue_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt8Array_GetValue_1',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoUInt8Array_GetValue_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoUInt8Array_size_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt8Array_size_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoUInt8Array_size_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt8Array_size_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoUInt8Array_size_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoUInt8Array___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt8Array___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoUInt8Array___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt8Array___destroy___0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoUInt8Array___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoInt16Array_DracoInt16Array_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt16Array_DracoInt16Array_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoInt16Array_DracoInt16Array_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt16Array_DracoInt16Array_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoInt16Array_DracoInt16Array_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoInt16Array_GetValue_1'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt16Array_GetValue_1',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoInt16Array_GetValue_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt16Array_GetValue_1',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoInt16Array_GetValue_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoInt16Array_size_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt16Array_size_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoInt16Array_size_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt16Array_size_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoInt16Array_size_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoInt16Array___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt16Array___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoInt16Array___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt16Array___destroy___0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoInt16Array___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoUInt16Array_DracoUInt16Array_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt16Array_DracoUInt16Array_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt16Array_DracoUInt16Array_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoUInt16Array_GetValue_1'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt16Array_GetValue_1',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoUInt16Array_GetValue_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt16Array_GetValue_1',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoUInt16Array_GetValue_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoUInt16Array_size_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt16Array_size_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoUInt16Array_size_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt16Array_size_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoUInt16Array_size_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoUInt16Array___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt16Array___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoUInt16Array___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt16Array___destroy___0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoUInt16Array___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoInt32Array_DracoInt32Array_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt32Array_DracoInt32Array_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoInt32Array_DracoInt32Array_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt32Array_DracoInt32Array_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoInt32Array_DracoInt32Array_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoInt32Array_GetValue_1'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt32Array_GetValue_1',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoInt32Array_GetValue_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt32Array_GetValue_1',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoInt32Array_GetValue_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoInt32Array_size_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt32Array_size_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoInt32Array_size_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt32Array_size_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoInt32Array_size_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoInt32Array___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt32Array___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoInt32Array___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoInt32Array___destroy___0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoInt32Array___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoUInt32Array_DracoUInt32Array_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt32Array_DracoUInt32Array_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt32Array_DracoUInt32Array_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoUInt32Array_GetValue_1'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt32Array_GetValue_1',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoUInt32Array_GetValue_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt32Array_GetValue_1',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoUInt32Array_GetValue_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoUInt32Array_size_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt32Array_size_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoUInt32Array_size_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt32Array_size_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoUInt32Array_size_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_DracoUInt32Array___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt32Array___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_DracoUInt32Array___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_DracoUInt32Array___destroy___0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_DracoUInt32Array___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_MetadataQuerier_MetadataQuerier_0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier_MetadataQuerier_0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_MetadataQuerier_MetadataQuerier_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier_MetadataQuerier_0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_MetadataQuerier_MetadataQuerier_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_MetadataQuerier_HasEntry_2'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier_HasEntry_2',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_MetadataQuerier_HasEntry_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier_HasEntry_2',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_MetadataQuerier_HasEntry_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_MetadataQuerier_GetIntEntry_2'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier_GetIntEntry_2',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_MetadataQuerier_GetIntEntry_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier_GetIntEntry_2',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_MetadataQuerier_GetIntEntry_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_MetadataQuerier_GetIntEntryArray_3'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier_GetIntEntryArray_3',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_MetadataQuerier_GetIntEntryArray_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier_GetIntEntryArray_3',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_MetadataQuerier_GetIntEntryArray_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_MetadataQuerier_GetDoubleEntry_2'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier_GetDoubleEntry_2',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_MetadataQuerier_GetDoubleEntry_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier_GetDoubleEntry_2',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_MetadataQuerier_GetDoubleEntry_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_MetadataQuerier_GetStringEntry_2'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier_GetStringEntry_2',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_MetadataQuerier_GetStringEntry_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier_GetStringEntry_2',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_MetadataQuerier_GetStringEntry_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_MetadataQuerier_NumEntries_1'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier_NumEntries_1',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_MetadataQuerier_NumEntries_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier_NumEntries_1',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_MetadataQuerier_NumEntries_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_MetadataQuerier_GetEntryName_2'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier_GetEntryName_2',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_MetadataQuerier_GetEntryName_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier_GetEntryName_2',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_MetadataQuerier_GetEntryName_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_MetadataQuerier___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_MetadataQuerier___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_MetadataQuerier___destroy___0',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_MetadataQuerier___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_Decoder_0'
    ) ||
      (Object.defineProperty(a.ready, '_emscripten_bind_Decoder_Decoder_0', {
        configurable: !0,
        get: function () {
          c(
            'You are getting _emscripten_bind_Decoder_Decoder_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }),
      Object.defineProperty(a.ready, '_emscripten_bind_Decoder_Decoder_0', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_bind_Decoder_Decoder_0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_DecodeArrayToPointCloud_3'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_DecodeArrayToPointCloud_3',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_DecodeArrayToPointCloud_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_DecodeArrayToPointCloud_3',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_DecodeArrayToPointCloud_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_DecodeArrayToMesh_3'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_DecodeArrayToMesh_3',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_DecodeArrayToMesh_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_DecodeArrayToMesh_3',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_DecodeArrayToMesh_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetAttributeId_2'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeId_2',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetAttributeId_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeId_2',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetAttributeId_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetAttributeIdByName_2'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeIdByName_2',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetAttributeIdByName_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeIdByName_2',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetAttributeIdByName_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetAttribute_2'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttribute_2',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetAttribute_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttribute_2',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetAttribute_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetAttributeByUniqueId_2'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeByUniqueId_2',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetAttributeByUniqueId_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeByUniqueId_2',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetAttributeByUniqueId_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetMetadata_1'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetMetadata_1',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetMetadata_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(a.ready, '_emscripten_bind_Decoder_GetMetadata_1', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_bind_Decoder_GetMetadata_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetAttributeMetadata_2'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeMetadata_2',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetAttributeMetadata_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeMetadata_2',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetAttributeMetadata_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetFaceFromMesh_3'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetFaceFromMesh_3',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetFaceFromMesh_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetFaceFromMesh_3',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetFaceFromMesh_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetTriangleStripsFromMesh_2'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetTriangleStripsFromMesh_2',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetTriangleStripsFromMesh_2',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetTrianglesUInt16Array_3'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetTrianglesUInt16Array_3',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetTrianglesUInt16Array_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetTrianglesUInt16Array_3',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetTrianglesUInt16Array_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetTrianglesUInt32Array_3'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetTrianglesUInt32Array_3',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetTrianglesUInt32Array_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetTrianglesUInt32Array_3',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetTrianglesUInt32Array_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetAttributeFloat_3'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeFloat_3',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetAttributeFloat_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeFloat_3',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetAttributeFloat_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetAttributeIntForAllPoints_3'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeIntForAllPoints_3',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeIntForAllPoints_3',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_SkipAttributeTransform_1'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_SkipAttributeTransform_1',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_SkipAttributeTransform_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_SkipAttributeTransform_1',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_SkipAttributeTransform_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_DecodeBufferToPointCloud_2'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_DecodeBufferToPointCloud_2',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_DecodeBufferToPointCloud_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_DecodeBufferToPointCloud_2',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_DecodeBufferToPointCloud_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder_DecodeBufferToMesh_2'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_DecodeBufferToMesh_2',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder_DecodeBufferToMesh_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder_DecodeBufferToMesh_2',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_bind_Decoder_DecodeBufferToMesh_2 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_bind_Decoder___destroy___0'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_bind_Decoder___destroy___0',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_bind_Decoder___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(a.ready, '_emscripten_bind_Decoder___destroy___0', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_bind_Decoder___destroy___0 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_GeometryAttribute_Type_INVALID'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_GeometryAttribute_Type_INVALID',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_GeometryAttribute_Type_INVALID on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_GeometryAttribute_Type_INVALID',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_GeometryAttribute_Type_INVALID on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_GeometryAttribute_Type_POSITION'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_GeometryAttribute_Type_POSITION',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_GeometryAttribute_Type_POSITION on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_GeometryAttribute_Type_POSITION',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_GeometryAttribute_Type_POSITION on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_GeometryAttribute_Type_NORMAL'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_GeometryAttribute_Type_NORMAL',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_GeometryAttribute_Type_NORMAL on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_GeometryAttribute_Type_NORMAL',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_GeometryAttribute_Type_NORMAL on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_GeometryAttribute_Type_COLOR'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_GeometryAttribute_Type_COLOR',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_GeometryAttribute_Type_COLOR on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_GeometryAttribute_Type_COLOR',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_GeometryAttribute_Type_COLOR on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_GeometryAttribute_Type_GENERIC'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_GeometryAttribute_Type_GENERIC',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_GeometryAttribute_Type_GENERIC on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_GeometryAttribute_Type_GENERIC',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_GeometryAttribute_Type_GENERIC on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_DataType_DT_INVALID'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_INVALID',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_DataType_DT_INVALID on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_INVALID',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_DataType_DT_INVALID on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_DataType_DT_INT8'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_INT8',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_DataType_DT_INT8 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_INT8',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_DataType_DT_INT8 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_DataType_DT_UINT8'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_UINT8',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_DataType_DT_UINT8 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_UINT8',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_DataType_DT_UINT8 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_DataType_DT_INT16'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_INT16',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_DataType_DT_INT16 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_INT16',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_DataType_DT_INT16 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_DataType_DT_UINT16'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_UINT16',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_DataType_DT_UINT16 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_UINT16',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_DataType_DT_UINT16 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_DataType_DT_INT32'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_INT32',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_DataType_DT_INT32 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_INT32',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_DataType_DT_INT32 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_DataType_DT_UINT32'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_UINT32',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_DataType_DT_UINT32 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_UINT32',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_DataType_DT_UINT32 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_DataType_DT_INT64'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_INT64',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_DataType_DT_INT64 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_INT64',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_DataType_DT_INT64 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_DataType_DT_UINT64'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_UINT64',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_DataType_DT_UINT64 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_UINT64',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_DataType_DT_UINT64 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_DataType_DT_FLOAT32'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_FLOAT32',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_DataType_DT_FLOAT32 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_FLOAT32',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_DataType_DT_FLOAT32 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_DataType_DT_FLOAT64'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_FLOAT64',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_DataType_DT_FLOAT64 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_FLOAT64',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_DataType_DT_FLOAT64 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_DataType_DT_BOOL'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_BOOL',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_DataType_DT_BOOL on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_BOOL',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_DataType_DT_BOOL on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_DataType_DT_TYPES_COUNT'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_TYPES_COUNT',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_DataType_DT_TYPES_COUNT on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_DataType_DT_TYPES_COUNT',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_DataType_DT_TYPES_COUNT on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_StatusCode_OK'
    ) ||
      (Object.defineProperty(a.ready, '_emscripten_enum_draco_StatusCode_OK', {
        configurable: !0,
        get: function () {
          c(
            'You are getting _emscripten_enum_draco_StatusCode_OK on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }),
      Object.defineProperty(a.ready, '_emscripten_enum_draco_StatusCode_OK', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _emscripten_enum_draco_StatusCode_OK on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_StatusCode_DRACO_ERROR'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_StatusCode_DRACO_ERROR',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_StatusCode_DRACO_ERROR on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_StatusCode_DRACO_ERROR',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_StatusCode_DRACO_ERROR on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_StatusCode_IO_ERROR'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_StatusCode_IO_ERROR',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_StatusCode_IO_ERROR on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_StatusCode_IO_ERROR',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_StatusCode_IO_ERROR on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_StatusCode_INVALID_PARAMETER'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_StatusCode_INVALID_PARAMETER',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_StatusCode_INVALID_PARAMETER on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_StatusCode_INVALID_PARAMETER',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_StatusCode_INVALID_PARAMETER on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(
      a.ready,
      '_emscripten_enum_draco_StatusCode_UNKNOWN_VERSION'
    ) ||
      (Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_StatusCode_UNKNOWN_VERSION',
        {
          configurable: !0,
          get: function () {
            c(
              'You are getting _emscripten_enum_draco_StatusCode_UNKNOWN_VERSION on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ),
      Object.defineProperty(
        a.ready,
        '_emscripten_enum_draco_StatusCode_UNKNOWN_VERSION',
        {
          configurable: !0,
          set: function () {
            c(
              'You are setting _emscripten_enum_draco_StatusCode_UNKNOWN_VERSION on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
            )
          },
        }
      ))
    Object.getOwnPropertyDescriptor(a.ready, '_fflush') ||
      (Object.defineProperty(a.ready, '_fflush', {
        configurable: !0,
        get: function () {
          c(
            'You are getting _fflush on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }),
      Object.defineProperty(a.ready, '_fflush', {
        configurable: !0,
        set: function () {
          c(
            'You are setting _fflush on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    Object.getOwnPropertyDescriptor(a.ready, 'onRuntimeInitialized') ||
      (Object.defineProperty(a.ready, 'onRuntimeInitialized', {
        configurable: !0,
        get: function () {
          c(
            'You are getting onRuntimeInitialized on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }),
      Object.defineProperty(a.ready, 'onRuntimeInitialized', {
        configurable: !0,
        set: function () {
          c(
            'You are setting onRuntimeInitialized on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          )
        },
      }))
    var Wa = !1,
      Xa = !1
    a.onRuntimeInitialized = function () {
      Wa = !0
      if (Xa && 'function' === typeof a.onModuleLoaded) a.onModuleLoaded(a)
    }
    a.onModuleParsed = function () {
      Xa = !0
      if (Wa && 'function' === typeof a.onModuleLoaded) a.onModuleLoaded(a)
    }
    a.isVersionSupported = function (g) {
      if ('string' !== typeof g) return !1
      g = g.split('.')
      return 2 > g.length || 3 < g.length
        ? !1
        : 1 == g[0] && 0 <= g[1] && 5 >= g[1]
        ? !0
        : 0 != g[0] || 10 < g[1]
        ? !1
        : !0
    }
    var Ya = Object.assign({}, a),
      Ea = 'object' == typeof window,
      la = 'function' == typeof importScripts,
      Ja =
        'object' == typeof process &&
        'object' == typeof process.versions &&
        'string' == typeof process.versions.node,
      Za = !Ea && !Ja && !la
    if (a.ENVIRONMENT)
      throw Error(
        'Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)'
      )
    var ba = '',
      Ka,
      za
    if (Ja) {
      if ('object' != typeof process || 'function' != typeof require)
        throw Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)'
        )
      ba = la ? require('path').dirname(ba) + '/' : __dirname + '/'
      var $a = function () {
        za || ((Ka = require('fs')), (za = require('path')))
      }
      var La = function (g, b) {
        $a()
        g = za.normalize(g)
        return Ka.readFileSync(g, b ? void 0 : 'utf8')
      }
      var qa = function (g) {
        g = La(g, !0)
        g.buffer || (g = new Uint8Array(g))
        r(g.buffer)
        return g
      }
      var va = function (g, b, d) {
        $a()
        g = za.normalize(g)
        Ka.readFile(g, function (f, q) {
          f ? d(f) : b(q.buffer)
        })
      }
      1 < process.argv.length && process.argv[1].replace(/\\/g, '/')
      process.argv.slice(2)
      a.inspect = function () {
        return '[Emscripten Module object]'
      }
    } else if (Za) {
      if (
        ('object' == typeof process && 'function' === typeof require) ||
        'object' == typeof window ||
        'function' == typeof importScripts
      )
        throw Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)'
        )
      'undefined' != typeof read &&
        (La = function (g) {
          return read(g)
        })
      qa = function (g) {
        if ('function' == typeof readbuffer)
          return new Uint8Array(readbuffer(g))
        g = read(g, 'binary')
        r('object' == typeof g)
        return g
      }
      va = function (g, b, d) {
        setTimeout(function () {
          return b(qa(g))
        }, 0)
      }
      'undefined' != typeof print &&
        ('undefined' == typeof console && (console = {}),
        (console.log = print),
        (console.warn = console.error =
          'undefined' != typeof printErr ? printErr : print))
    } else if (Ea || la) {
      la
        ? (ba = self.location.href)
        : 'undefined' != typeof document &&
          document.currentScript &&
          (ba = document.currentScript.src)
      n && (ba = n)
      ba =
        0 !== ba.indexOf('blob:')
          ? ba.substr(0, ba.replace(/[?#].*/, '').lastIndexOf('/') + 1)
          : ''
      if ('object' != typeof window && 'function' != typeof importScripts)
        throw Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)'
        )
      La = function (g) {
        var b = new XMLHttpRequest()
        b.open('GET', g, !1)
        b.send(null)
        return b.responseText
      }
      la &&
        (qa = function (g) {
          var b = new XMLHttpRequest()
          b.open('GET', g, !1)
          b.responseType = 'arraybuffer'
          b.send(null)
          return new Uint8Array(b.response)
        })
      va = function (g, b, d) {
        var f = new XMLHttpRequest()
        f.open('GET', g, !0)
        f.responseType = 'arraybuffer'
        f.onload = function () {
          200 == f.status || (0 == f.status && f.response) ? b(f.response) : d()
        }
        f.onerror = d
        f.send(null)
      }
    } else throw Error('environment detection error')
    var yb = a.print || console.log.bind(console),
      I = a.printErr || console.warn.bind(console)
    Object.assign(a, Ya)
    Ya = null
    ;(function (g) {
      Object.getOwnPropertyDescriptor(a, g) &&
        c(
          '`Module.' +
            g +
            '` was supplied but `' +
            g +
            '` not included in INCOMING_MODULE_JS_API'
        )
    })('fetchSettings')
    p('arguments', 'arguments_')
    p('thisProgram', 'thisProgram')
    p('quit', 'quit_')
    r(
      'undefined' == typeof a.memoryInitializerPrefixURL,
      'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead'
    )
    r(
      'undefined' == typeof a.pthreadMainPrefixURL,
      'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead'
    )
    r(
      'undefined' == typeof a.cdInitializerPrefixURL,
      'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead'
    )
    r(
      'undefined' == typeof a.filePackagePrefixURL,
      'Module.filePackagePrefixURL option was removed, use Module.locateFile instead'
    )
    r(
      'undefined' == typeof a.read,
      'Module.read option was removed (modify read_ in JS)'
    )
    r(
      'undefined' == typeof a.readAsync,
      'Module.readAsync option was removed (modify readAsync in JS)'
    )
    r(
      'undefined' == typeof a.readBinary,
      'Module.readBinary option was removed (modify readBinary in JS)'
    )
    r(
      'undefined' == typeof a.setWindowTitle,
      'Module.setWindowTitle option was removed (modify setWindowTitle in JS)'
    )
    r(
      'undefined' == typeof a.TOTAL_MEMORY,
      'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY'
    )
    p('read', 'read_')
    p('readAsync', 'readAsync')
    p('readBinary', 'readBinary')
    p('setWindowTitle', 'setWindowTitle')
    r(
      !Za,
      "shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable."
    )
    var pa
    a.wasmBinary && (pa = a.wasmBinary)
    p('wasmBinary', 'wasmBinary')
    p('noExitRuntime', 'noExitRuntime')
    'object' != typeof WebAssembly && c('no native wasm support detected')
    var ra,
      ta = !1,
      Pa = 'undefined' != typeof TextDecoder ? new TextDecoder('utf8') : void 0
    'undefined' != typeof TextDecoder && new TextDecoder('utf-16le')
    var Ba, da, na, fa, J
    a.TOTAL_STACK &&
      r(
        5242880 === a.TOTAL_STACK,
        'the stack size can no longer be determined at runtime'
      )
    var Ma = a.INITIAL_MEMORY || 16777216
    p('INITIAL_MEMORY', 'INITIAL_MEMORY')
    r(
      5242880 <= Ma,
      'INITIAL_MEMORY should be larger than TOTAL_STACK, was ' +
        Ma +
        '! (TOTAL_STACK=5242880)'
    )
    r(
      'undefined' != typeof Int32Array &&
        'undefined' !== typeof Float64Array &&
        void 0 != Int32Array.prototype.subarray &&
        void 0 != Int32Array.prototype.set,
      'JS engine does not provide full typed array support'
    )
    r(
      !a.wasmMemory,
      'Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally'
    )
    r(
      16777216 == Ma,
      'Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically'
    )
    var xa
    ;(function () {
      var g = new Int16Array(1),
        b = new Int8Array(g.buffer)
      g[0] = 25459
      if (115 !== b[0] || 99 !== b[1])
        throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)'
    })()
    var Va = [],
      Ha = [],
      Ta = [],
      ua = !1
    r(
      Math.imul,
      'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    )
    r(
      Math.fround,
      'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    )
    r(
      Math.clz32,
      'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    )
    r(
      Math.trunc,
      'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    )
    var ia = 0,
      ja = null,
      sa = null,
      oa = {},
      aa = {
        error: function () {
          c(
            'Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM'
          )
        },
        init: function () {
          aa.error()
        },
        createDataFile: function () {
          aa.error()
        },
        createPreloadedFile: function () {
          aa.error()
        },
        createLazyFile: function () {
          aa.error()
        },
        open: function () {
          aa.error()
        },
        mkdev: function () {
          aa.error()
        },
        registerDevice: function () {
          aa.error()
        },
        analyzePath: function () {
          aa.error()
        },
        loadFilesFromDB: function () {
          aa.error()
        },
        ErrnoError: function () {
          aa.error()
        },
      }
    a.FS_createDataFile = aa.createDataFile
    a.FS_createPreloadedFile = aa.createPreloadedFile
    var K = 'draco_decoder.wasm'
    K.startsWith('data:application/octet-stream;base64,') || (K = l(K))
    var wa = [],
      zb = 0,
      Ab = [null, [], []],
      cb = {
        __cxa_allocate_exception: function (g) {
          return Bb(g + 24) + 24
        },
        __cxa_throw: function (g, b, d) {
          new eb(g).init(b, d)
          zb++
          throw (
            g +
            ' - Exception catching is disabled, this exception cannot be caught. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.'
          )
        },
        abort: function () {
          c('native code called abort()')
        },
        array_bounds_check_error: function (g, b) {
          throw 'Array index ' + g + ' out of bounds: [0,' + b + ')'
        },
        emscripten_memcpy_big: function (g, b, d) {
          na.copyWithin(g, b, b + d)
        },
        emscripten_resize_heap: function (g) {
          var b = na.length
          g >>>= 0
          r(g > b)
          if (2147483648 < g)
            return (
              I(
                'Cannot enlarge memory, asked to go up to ' +
                  g +
                  ' bytes, but the limit is 2147483648 bytes!'
              ),
              !1
            )
          for (var d = 1; 4 >= d; d *= 2) {
            var f = b * (1 + 0.2 / d)
            f = Math.min(f, g + 100663296)
            var q = Math
            f = Math.max(g, f)
            q = q.min.call(q, 2147483648, f + ((65536 - (f % 65536)) % 65536))
            a: {
              f = q
              try {
                ra.grow((f - Ba.byteLength + 65535) >>> 16)
                ka(ra.buffer)
                var v = 1
                break a
              } catch (D) {
                I(
                  'emscripten_realloc_buffer: Attempted to grow heap from ' +
                    Ba.byteLength +
                    ' bytes to ' +
                    f +
                    ' bytes, but got error: ' +
                    D
                )
              }
              v = void 0
            }
            if (v) return !0
          }
          I(
            'Failed to grow the heap from ' +
              b +
              ' bytes to ' +
              q +
              ' bytes, not enough memory!'
          )
          return !1
        },
        fd_close: function (g) {
          c('fd_close called without SYSCALLS_REQUIRE_FILESYSTEM')
        },
        fd_seek: function (g, b, d, f, q) {
          return 70
        },
        fd_write: function (g, b, d, f) {
          for (var q = 0, v = 0; v < d; v++) {
            var D = J[b >> 2],
              ab = J[(b + 4) >> 2]
            b += 8
            for (var Na = 0; Na < ab; Na++) {
              var bb = g,
                Oa = na[D + Na],
                Aa = Ab[bb]
              r(Aa)
              0 === Oa || 10 === Oa
                ? ((1 === bb ? yb : I)(A(Aa, 0)), (Aa.length = 0))
                : Aa.push(Oa)
            }
            q += ab
          }
          J[f >> 2] = q
          return 0
        },
        setTempRet0: function (g) {},
      }
    ;(function () {
      function g(v, D) {
        a.asm = v.exports
        ra = a.asm.memory
        r(ra, 'memory not found in wasm exports')
        ka(ra.buffer)
        xa = a.asm.__indirect_function_table
        r(xa, 'table not found in wasm exports')
        Ha.unshift(a.asm.__wasm_call_ctors)
        ia--
        a.monitorRunDependencies && a.monitorRunDependencies(ia)
        r(oa['wasm-instantiate'])
        delete oa['wasm-instantiate']
        0 == ia &&
          (null !== ja && (clearInterval(ja), (ja = null)),
          sa && ((v = sa), (sa = null), v()))
      }
      function b(v) {
        r(
          a === q,
          'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?'
        )
        q = null
        g(v.instance)
      }
      function d(v) {
        return db()
          .then(function (D) {
            return WebAssembly.instantiate(D, f)
          })
          .then(function (D) {
            return D
          })
          .then(v, function (D) {
            I('failed to asynchronously prepare wasm: ' + D)
            K.startsWith('file://') &&
              I(
                'warning: Loading from a file URI (' +
                  K +
                  ') is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing'
              )
            c(D)
          })
      }
      var f = { env: cb, wasi_snapshot_preview1: cb }
      ma('wasm-instantiate')
      var q = a
      if (a.instantiateWasm)
        try {
          return a.instantiateWasm(f, g)
        } catch (v) {
          return (
            I('Module.instantiateWasm callback failed with error: ' + v), !1
          )
        }
      ;(function () {
        return pa ||
          'function' != typeof WebAssembly.instantiateStreaming ||
          K.startsWith('data:application/octet-stream;base64,') ||
          K.startsWith('file://') ||
          Ja ||
          'function' != typeof fetch
          ? d(b)
          : fetch(K, { credentials: 'same-origin' }).then(function (v) {
              return WebAssembly.instantiateStreaming(v, f).then(
                b,
                function (D) {
                  I('wasm streaming compile failed: ' + D)
                  I('falling back to ArrayBuffer instantiation')
                  return d(b)
                }
              )
            })
      })().catch(Da)
      return {}
    })()
    a.___wasm_call_ctors = h('__wasm_call_ctors')
    var Cb = (a._emscripten_bind_VoidPtr___destroy___0 = h(
        'emscripten_bind_VoidPtr___destroy___0'
      )),
      gb = (a._emscripten_bind_DecoderBuffer_DecoderBuffer_0 = h(
        'emscripten_bind_DecoderBuffer_DecoderBuffer_0'
      )),
      Db = (a._emscripten_bind_DecoderBuffer_Init_2 = h(
        'emscripten_bind_DecoderBuffer_Init_2'
      )),
      Eb = (a._emscripten_bind_DecoderBuffer___destroy___0 = h(
        'emscripten_bind_DecoderBuffer___destroy___0'
      )),
      hb = (a._emscripten_bind_AttributeTransformData_AttributeTransformData_0 =
        h('emscripten_bind_AttributeTransformData_AttributeTransformData_0')),
      Fb = (a._emscripten_bind_AttributeTransformData_transform_type_0 = h(
        'emscripten_bind_AttributeTransformData_transform_type_0'
      )),
      Gb = (a._emscripten_bind_AttributeTransformData___destroy___0 = h(
        'emscripten_bind_AttributeTransformData___destroy___0'
      )),
      ib = (a._emscripten_bind_GeometryAttribute_GeometryAttribute_0 = h(
        'emscripten_bind_GeometryAttribute_GeometryAttribute_0'
      )),
      Hb = (a._emscripten_bind_GeometryAttribute___destroy___0 = h(
        'emscripten_bind_GeometryAttribute___destroy___0'
      )),
      jb = (a._emscripten_bind_PointAttribute_PointAttribute_0 = h(
        'emscripten_bind_PointAttribute_PointAttribute_0'
      )),
      Ib = (a._emscripten_bind_PointAttribute_size_0 = h(
        'emscripten_bind_PointAttribute_size_0'
      )),
      Jb = (a._emscripten_bind_PointAttribute_GetAttributeTransformData_0 = h(
        'emscripten_bind_PointAttribute_GetAttributeTransformData_0'
      )),
      Kb = (a._emscripten_bind_PointAttribute_attribute_type_0 = h(
        'emscripten_bind_PointAttribute_attribute_type_0'
      )),
      Lb = (a._emscripten_bind_PointAttribute_data_type_0 = h(
        'emscripten_bind_PointAttribute_data_type_0'
      )),
      Mb = (a._emscripten_bind_PointAttribute_num_components_0 = h(
        'emscripten_bind_PointAttribute_num_components_0'
      )),
      Nb = (a._emscripten_bind_PointAttribute_normalized_0 = h(
        'emscripten_bind_PointAttribute_normalized_0'
      )),
      Ob = (a._emscripten_bind_PointAttribute_byte_stride_0 = h(
        'emscripten_bind_PointAttribute_byte_stride_0'
      )),
      Pb = (a._emscripten_bind_PointAttribute_byte_offset_0 = h(
        'emscripten_bind_PointAttribute_byte_offset_0'
      )),
      Qb = (a._emscripten_bind_PointAttribute_unique_id_0 = h(
        'emscripten_bind_PointAttribute_unique_id_0'
      )),
      Rb = (a._emscripten_bind_PointAttribute___destroy___0 = h(
        'emscripten_bind_PointAttribute___destroy___0'
      )),
      kb =
        (a._emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 =
          h(
            'emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0'
          )),
      Sb =
        (a._emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 =
          h(
            'emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1'
          )),
      Tb =
        (a._emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 =
          h(
            'emscripten_bind_AttributeQuantizationTransform_quantization_bits_0'
          )),
      Ub = (a._emscripten_bind_AttributeQuantizationTransform_min_value_1 = h(
        'emscripten_bind_AttributeQuantizationTransform_min_value_1'
      )),
      Vb = (a._emscripten_bind_AttributeQuantizationTransform_range_0 = h(
        'emscripten_bind_AttributeQuantizationTransform_range_0'
      )),
      Wb = (a._emscripten_bind_AttributeQuantizationTransform___destroy___0 = h(
        'emscripten_bind_AttributeQuantizationTransform___destroy___0'
      )),
      lb =
        (a._emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 =
          h(
            'emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0'
          )),
      Xb =
        (a._emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 =
          h(
            'emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1'
          )),
      Yb =
        (a._emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 =
          h(
            'emscripten_bind_AttributeOctahedronTransform_quantization_bits_0'
          )),
      Zb = (a._emscripten_bind_AttributeOctahedronTransform___destroy___0 = h(
        'emscripten_bind_AttributeOctahedronTransform___destroy___0'
      )),
      mb = (a._emscripten_bind_PointCloud_PointCloud_0 = h(
        'emscripten_bind_PointCloud_PointCloud_0'
      )),
      $b = (a._emscripten_bind_PointCloud_num_attributes_0 = h(
        'emscripten_bind_PointCloud_num_attributes_0'
      )),
      ac = (a._emscripten_bind_PointCloud_num_points_0 = h(
        'emscripten_bind_PointCloud_num_points_0'
      )),
      bc = (a._emscripten_bind_PointCloud___destroy___0 = h(
        'emscripten_bind_PointCloud___destroy___0'
      )),
      nb = (a._emscripten_bind_Mesh_Mesh_0 = h('emscripten_bind_Mesh_Mesh_0')),
      cc = (a._emscripten_bind_Mesh_num_faces_0 = h(
        'emscripten_bind_Mesh_num_faces_0'
      )),
      dc = (a._emscripten_bind_Mesh_num_attributes_0 = h(
        'emscripten_bind_Mesh_num_attributes_0'
      )),
      ec = (a._emscripten_bind_Mesh_num_points_0 = h(
        'emscripten_bind_Mesh_num_points_0'
      )),
      fc = (a._emscripten_bind_Mesh___destroy___0 = h(
        'emscripten_bind_Mesh___destroy___0'
      )),
      ob = (a._emscripten_bind_Metadata_Metadata_0 = h(
        'emscripten_bind_Metadata_Metadata_0'
      )),
      gc = (a._emscripten_bind_Metadata___destroy___0 = h(
        'emscripten_bind_Metadata___destroy___0'
      )),
      hc = (a._emscripten_bind_Status_code_0 = h(
        'emscripten_bind_Status_code_0'
      )),
      ic = (a._emscripten_bind_Status_ok_0 = h('emscripten_bind_Status_ok_0')),
      jc = (a._emscripten_bind_Status_error_msg_0 = h(
        'emscripten_bind_Status_error_msg_0'
      )),
      kc = (a._emscripten_bind_Status___destroy___0 = h(
        'emscripten_bind_Status___destroy___0'
      )),
      pb = (a._emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 = h(
        'emscripten_bind_DracoFloat32Array_DracoFloat32Array_0'
      )),
      lc = (a._emscripten_bind_DracoFloat32Array_GetValue_1 = h(
        'emscripten_bind_DracoFloat32Array_GetValue_1'
      )),
      mc = (a._emscripten_bind_DracoFloat32Array_size_0 = h(
        'emscripten_bind_DracoFloat32Array_size_0'
      )),
      nc = (a._emscripten_bind_DracoFloat32Array___destroy___0 = h(
        'emscripten_bind_DracoFloat32Array___destroy___0'
      )),
      qb = (a._emscripten_bind_DracoInt8Array_DracoInt8Array_0 = h(
        'emscripten_bind_DracoInt8Array_DracoInt8Array_0'
      )),
      oc = (a._emscripten_bind_DracoInt8Array_GetValue_1 = h(
        'emscripten_bind_DracoInt8Array_GetValue_1'
      )),
      pc = (a._emscripten_bind_DracoInt8Array_size_0 = h(
        'emscripten_bind_DracoInt8Array_size_0'
      )),
      qc = (a._emscripten_bind_DracoInt8Array___destroy___0 = h(
        'emscripten_bind_DracoInt8Array___destroy___0'
      )),
      rb = (a._emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 = h(
        'emscripten_bind_DracoUInt8Array_DracoUInt8Array_0'
      )),
      rc = (a._emscripten_bind_DracoUInt8Array_GetValue_1 = h(
        'emscripten_bind_DracoUInt8Array_GetValue_1'
      )),
      sc = (a._emscripten_bind_DracoUInt8Array_size_0 = h(
        'emscripten_bind_DracoUInt8Array_size_0'
      )),
      tc = (a._emscripten_bind_DracoUInt8Array___destroy___0 = h(
        'emscripten_bind_DracoUInt8Array___destroy___0'
      )),
      sb = (a._emscripten_bind_DracoInt16Array_DracoInt16Array_0 = h(
        'emscripten_bind_DracoInt16Array_DracoInt16Array_0'
      )),
      uc = (a._emscripten_bind_DracoInt16Array_GetValue_1 = h(
        'emscripten_bind_DracoInt16Array_GetValue_1'
      )),
      vc = (a._emscripten_bind_DracoInt16Array_size_0 = h(
        'emscripten_bind_DracoInt16Array_size_0'
      )),
      wc = (a._emscripten_bind_DracoInt16Array___destroy___0 = h(
        'emscripten_bind_DracoInt16Array___destroy___0'
      )),
      tb = (a._emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 = h(
        'emscripten_bind_DracoUInt16Array_DracoUInt16Array_0'
      )),
      xc = (a._emscripten_bind_DracoUInt16Array_GetValue_1 = h(
        'emscripten_bind_DracoUInt16Array_GetValue_1'
      )),
      yc = (a._emscripten_bind_DracoUInt16Array_size_0 = h(
        'emscripten_bind_DracoUInt16Array_size_0'
      )),
      zc = (a._emscripten_bind_DracoUInt16Array___destroy___0 = h(
        'emscripten_bind_DracoUInt16Array___destroy___0'
      )),
      ub = (a._emscripten_bind_DracoInt32Array_DracoInt32Array_0 = h(
        'emscripten_bind_DracoInt32Array_DracoInt32Array_0'
      )),
      Ac = (a._emscripten_bind_DracoInt32Array_GetValue_1 = h(
        'emscripten_bind_DracoInt32Array_GetValue_1'
      )),
      Bc = (a._emscripten_bind_DracoInt32Array_size_0 = h(
        'emscripten_bind_DracoInt32Array_size_0'
      )),
      Cc = (a._emscripten_bind_DracoInt32Array___destroy___0 = h(
        'emscripten_bind_DracoInt32Array___destroy___0'
      )),
      vb = (a._emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 = h(
        'emscripten_bind_DracoUInt32Array_DracoUInt32Array_0'
      )),
      Dc = (a._emscripten_bind_DracoUInt32Array_GetValue_1 = h(
        'emscripten_bind_DracoUInt32Array_GetValue_1'
      )),
      Ec = (a._emscripten_bind_DracoUInt32Array_size_0 = h(
        'emscripten_bind_DracoUInt32Array_size_0'
      )),
      Fc = (a._emscripten_bind_DracoUInt32Array___destroy___0 = h(
        'emscripten_bind_DracoUInt32Array___destroy___0'
      )),
      wb = (a._emscripten_bind_MetadataQuerier_MetadataQuerier_0 = h(
        'emscripten_bind_MetadataQuerier_MetadataQuerier_0'
      )),
      Gc = (a._emscripten_bind_MetadataQuerier_HasEntry_2 = h(
        'emscripten_bind_MetadataQuerier_HasEntry_2'
      )),
      Hc = (a._emscripten_bind_MetadataQuerier_GetIntEntry_2 = h(
        'emscripten_bind_MetadataQuerier_GetIntEntry_2'
      )),
      Ic = (a._emscripten_bind_MetadataQuerier_GetIntEntryArray_3 = h(
        'emscripten_bind_MetadataQuerier_GetIntEntryArray_3'
      )),
      Jc = (a._emscripten_bind_MetadataQuerier_GetDoubleEntry_2 = h(
        'emscripten_bind_MetadataQuerier_GetDoubleEntry_2'
      )),
      Kc = (a._emscripten_bind_MetadataQuerier_GetStringEntry_2 = h(
        'emscripten_bind_MetadataQuerier_GetStringEntry_2'
      )),
      Lc = (a._emscripten_bind_MetadataQuerier_NumEntries_1 = h(
        'emscripten_bind_MetadataQuerier_NumEntries_1'
      )),
      Mc = (a._emscripten_bind_MetadataQuerier_GetEntryName_2 = h(
        'emscripten_bind_MetadataQuerier_GetEntryName_2'
      )),
      Nc = (a._emscripten_bind_MetadataQuerier___destroy___0 = h(
        'emscripten_bind_MetadataQuerier___destroy___0'
      )),
      xb = (a._emscripten_bind_Decoder_Decoder_0 = h(
        'emscripten_bind_Decoder_Decoder_0'
      )),
      Oc = (a._emscripten_bind_Decoder_DecodeArrayToPointCloud_3 = h(
        'emscripten_bind_Decoder_DecodeArrayToPointCloud_3'
      )),
      Pc = (a._emscripten_bind_Decoder_DecodeArrayToMesh_3 = h(
        'emscripten_bind_Decoder_DecodeArrayToMesh_3'
      )),
      Qc = (a._emscripten_bind_Decoder_GetAttributeId_2 = h(
        'emscripten_bind_Decoder_GetAttributeId_2'
      )),
      Rc = (a._emscripten_bind_Decoder_GetAttributeIdByName_2 = h(
        'emscripten_bind_Decoder_GetAttributeIdByName_2'
      )),
      Sc = (a._emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 = h(
        'emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3'
      )),
      Tc = (a._emscripten_bind_Decoder_GetAttribute_2 = h(
        'emscripten_bind_Decoder_GetAttribute_2'
      )),
      Uc = (a._emscripten_bind_Decoder_GetAttributeByUniqueId_2 = h(
        'emscripten_bind_Decoder_GetAttributeByUniqueId_2'
      )),
      Vc = (a._emscripten_bind_Decoder_GetMetadata_1 = h(
        'emscripten_bind_Decoder_GetMetadata_1'
      )),
      Wc = (a._emscripten_bind_Decoder_GetAttributeMetadata_2 = h(
        'emscripten_bind_Decoder_GetAttributeMetadata_2'
      )),
      Xc = (a._emscripten_bind_Decoder_GetFaceFromMesh_3 = h(
        'emscripten_bind_Decoder_GetFaceFromMesh_3'
      )),
      Yc = (a._emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 = h(
        'emscripten_bind_Decoder_GetTriangleStripsFromMesh_2'
      )),
      Zc = (a._emscripten_bind_Decoder_GetTrianglesUInt16Array_3 = h(
        'emscripten_bind_Decoder_GetTrianglesUInt16Array_3'
      )),
      $c = (a._emscripten_bind_Decoder_GetTrianglesUInt32Array_3 = h(
        'emscripten_bind_Decoder_GetTrianglesUInt32Array_3'
      )),
      ad = (a._emscripten_bind_Decoder_GetAttributeFloat_3 = h(
        'emscripten_bind_Decoder_GetAttributeFloat_3'
      )),
      bd = (a._emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 = h(
        'emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3'
      )),
      cd = (a._emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 = h(
        'emscripten_bind_Decoder_GetAttributeIntForAllPoints_3'
      )),
      dd = (a._emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 = h(
        'emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3'
      )),
      ed = (a._emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 = h(
        'emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3'
      )),
      fd = (a._emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 = h(
        'emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3'
      )),
      gd = (a._emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 = h(
        'emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3'
      )),
      hd = (a._emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 = h(
        'emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3'
      )),
      id = (a._emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 = h(
        'emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3'
      )),
      jd = (a._emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5 = h(
        'emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5'
      )),
      kd = (a._emscripten_bind_Decoder_SkipAttributeTransform_1 = h(
        'emscripten_bind_Decoder_SkipAttributeTransform_1'
      )),
      ld = (a._emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1 = h(
        'emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1'
      )),
      md = (a._emscripten_bind_Decoder_DecodeBufferToPointCloud_2 = h(
        'emscripten_bind_Decoder_DecodeBufferToPointCloud_2'
      )),
      nd = (a._emscripten_bind_Decoder_DecodeBufferToMesh_2 = h(
        'emscripten_bind_Decoder_DecodeBufferToMesh_2'
      )),
      od = (a._emscripten_bind_Decoder___destroy___0 = h(
        'emscripten_bind_Decoder___destroy___0'
      )),
      pd =
        (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM =
          h(
            'emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM'
          )),
      qd =
        (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM =
          h(
            'emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM'
          )),
      rd =
        (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM =
          h(
            'emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM'
          )),
      sd =
        (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM =
          h(
            'emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM'
          )),
      td = (a._emscripten_enum_draco_GeometryAttribute_Type_INVALID = h(
        'emscripten_enum_draco_GeometryAttribute_Type_INVALID'
      )),
      ud = (a._emscripten_enum_draco_GeometryAttribute_Type_POSITION = h(
        'emscripten_enum_draco_GeometryAttribute_Type_POSITION'
      )),
      vd = (a._emscripten_enum_draco_GeometryAttribute_Type_NORMAL = h(
        'emscripten_enum_draco_GeometryAttribute_Type_NORMAL'
      )),
      wd = (a._emscripten_enum_draco_GeometryAttribute_Type_COLOR = h(
        'emscripten_enum_draco_GeometryAttribute_Type_COLOR'
      )),
      xd = (a._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD = h(
        'emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD'
      )),
      yd = (a._emscripten_enum_draco_GeometryAttribute_Type_GENERIC = h(
        'emscripten_enum_draco_GeometryAttribute_Type_GENERIC'
      )),
      zd = (a._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE =
        h('emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE')),
      Ad = (a._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD = h(
        'emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD'
      )),
      Bd = (a._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH = h(
        'emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH'
      )),
      Cd = (a._emscripten_enum_draco_DataType_DT_INVALID = h(
        'emscripten_enum_draco_DataType_DT_INVALID'
      )),
      Dd = (a._emscripten_enum_draco_DataType_DT_INT8 = h(
        'emscripten_enum_draco_DataType_DT_INT8'
      )),
      Ed = (a._emscripten_enum_draco_DataType_DT_UINT8 = h(
        'emscripten_enum_draco_DataType_DT_UINT8'
      )),
      Fd = (a._emscripten_enum_draco_DataType_DT_INT16 = h(
        'emscripten_enum_draco_DataType_DT_INT16'
      )),
      Gd = (a._emscripten_enum_draco_DataType_DT_UINT16 = h(
        'emscripten_enum_draco_DataType_DT_UINT16'
      )),
      Hd = (a._emscripten_enum_draco_DataType_DT_INT32 = h(
        'emscripten_enum_draco_DataType_DT_INT32'
      )),
      Id = (a._emscripten_enum_draco_DataType_DT_UINT32 = h(
        'emscripten_enum_draco_DataType_DT_UINT32'
      )),
      Jd = (a._emscripten_enum_draco_DataType_DT_INT64 = h(
        'emscripten_enum_draco_DataType_DT_INT64'
      )),
      Kd = (a._emscripten_enum_draco_DataType_DT_UINT64 = h(
        'emscripten_enum_draco_DataType_DT_UINT64'
      )),
      Ld = (a._emscripten_enum_draco_DataType_DT_FLOAT32 = h(
        'emscripten_enum_draco_DataType_DT_FLOAT32'
      )),
      Md = (a._emscripten_enum_draco_DataType_DT_FLOAT64 = h(
        'emscripten_enum_draco_DataType_DT_FLOAT64'
      )),
      Nd = (a._emscripten_enum_draco_DataType_DT_BOOL = h(
        'emscripten_enum_draco_DataType_DT_BOOL'
      )),
      Od = (a._emscripten_enum_draco_DataType_DT_TYPES_COUNT = h(
        'emscripten_enum_draco_DataType_DT_TYPES_COUNT'
      )),
      Pd = (a._emscripten_enum_draco_StatusCode_OK = h(
        'emscripten_enum_draco_StatusCode_OK'
      )),
      Qd = (a._emscripten_enum_draco_StatusCode_DRACO_ERROR = h(
        'emscripten_enum_draco_StatusCode_DRACO_ERROR'
      )),
      Rd = (a._emscripten_enum_draco_StatusCode_IO_ERROR = h(
        'emscripten_enum_draco_StatusCode_IO_ERROR'
      )),
      Sd = (a._emscripten_enum_draco_StatusCode_INVALID_PARAMETER = h(
        'emscripten_enum_draco_StatusCode_INVALID_PARAMETER'
      )),
      Td = (a._emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION = h(
        'emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION'
      )),
      Ud = (a._emscripten_enum_draco_StatusCode_UNKNOWN_VERSION = h(
        'emscripten_enum_draco_StatusCode_UNKNOWN_VERSION'
      ))
    a.___errno_location = h('__errno_location')
    a._fflush = h('fflush')
    var Bb = (a._malloc = h('malloc'))
    a._free = h('free')
    var Ua = (a._emscripten_stack_init = function () {
      return (Ua = a._emscripten_stack_init =
        a.asm.emscripten_stack_init).apply(null, arguments)
    })
    a._emscripten_stack_get_free = function () {
      return (a._emscripten_stack_get_free =
        a.asm.emscripten_stack_get_free).apply(null, arguments)
    }
    a._emscripten_stack_get_base = function () {
      return (a._emscripten_stack_get_base =
        a.asm.emscripten_stack_get_base).apply(null, arguments)
    }
    var Ca = (a._emscripten_stack_get_end = function () {
      return (Ca = a._emscripten_stack_get_end =
        a.asm.emscripten_stack_get_end).apply(null, arguments)
    })
    a.stackSave = h('stackSave')
    a.stackRestore = h('stackRestore')
    a.stackAlloc = h('stackAlloc')
    var fb = (a.___cxa_is_pointer_type = h('__cxa_is_pointer_type'))
    a.dynCall_jiji = h('dynCall_jiji')
    e('ccall', !1)
    e('cwrap', !1)
    e('allocate', !1)
    e('UTF8ArrayToString', !1)
    e('UTF8ToString', !1)
    e('stringToUTF8Array', !1)
    e('stringToUTF8', !1)
    e('lengthBytesUTF8', !1)
    e('addOnPreRun', !1)
    e('addOnInit', !1)
    e('addOnPreMain', !1)
    e('addOnExit', !1)
    e('addOnPostRun', !1)
    e('addRunDependency', !0)
    e('removeRunDependency', !0)
    e('FS_createFolder', !1)
    e('FS_createPath', !0)
    e('FS_createDataFile', !0)
    e('FS_createPreloadedFile', !0)
    e('FS_createLazyFile', !0)
    e('FS_createLink', !1)
    e('FS_createDevice', !0)
    e('FS_unlink', !0)
    e('getLEB', !1)
    e('getFunctionTables', !1)
    e('alignFunctionTables', !1)
    e('registerFunctions', !1)
    e('addFunction', !1)
    e('removeFunction', !1)
    e('prettyPrint', !1)
    e('getCompilerSetting', !1)
    e('print', !1)
    e('printErr', !1)
    e('getTempRet0', !1)
    e('setTempRet0', !1)
    e('callMain', !1)
    e('abort', !1)
    e('keepRuntimeAlive', !1)
    e('wasmMemory', !1)
    e('warnOnce', !1)
    e('stackSave', !1)
    e('stackRestore', !1)
    e('stackAlloc', !1)
    e('AsciiToString', !1)
    e('stringToAscii', !1)
    e('UTF16ToString', !1)
    e('stringToUTF16', !1)
    e('lengthBytesUTF16', !1)
    e('UTF32ToString', !1)
    e('stringToUTF32', !1)
    e('lengthBytesUTF32', !1)
    e('allocateUTF8', !1)
    e('allocateUTF8OnStack', !1)
    e('ExitStatus', !1)
    e('intArrayFromString', !1)
    e('intArrayToString', !1)
    e('writeStringToMemory', !1)
    e('writeArrayToMemory', !1)
    e('writeAsciiToMemory', !1)
    a.writeStackCookie = V
    a.checkStackCookie = W
    e('ptrToString', !1)
    e('zeroMemory', !1)
    e('stringToNewUTF8', !1)
    e('getHeapMax', !1)
    e('emscripten_realloc_buffer', !1)
    e('ENV', !1)
    e('ERRNO_CODES', !1)
    e('ERRNO_MESSAGES', !1)
    e('setErrNo', !1)
    e('inetPton4', !1)
    e('inetNtop4', !1)
    e('inetPton6', !1)
    e('inetNtop6', !1)
    e('readSockaddr', !1)
    e('writeSockaddr', !1)
    e('DNS', !1)
    e('getHostByName', !1)
    e('Protocols', !1)
    e('Sockets', !1)
    e('getRandomDevice', !1)
    e('traverseStack', !1)
    e('UNWIND_CACHE', !1)
    e('convertPCtoSourceLocation', !1)
    e('readAsmConstArgsArray', !1)
    e('readAsmConstArgs', !1)
    e('mainThreadEM_ASM', !1)
    e('jstoi_q', !1)
    e('jstoi_s', !1)
    e('getExecutableName', !1)
    e('listenOnce', !1)
    e('autoResumeAudioContext', !1)
    e('dynCallLegacy', !1)
    e('getDynCaller', !1)
    e('dynCall', !1)
    e('handleException', !1)
    e('runtimeKeepalivePush', !1)
    e('runtimeKeepalivePop', !1)
    e('callUserCallback', !1)
    e('maybeExit', !1)
    e('safeSetTimeout', !1)
    e('asmjsMangle', !1)
    e('asyncLoad', !1)
    e('alignMemory', !1)
    e('mmapAlloc', !1)
    e('writeI53ToI64', !1)
    e('writeI53ToI64Clamped', !1)
    e('writeI53ToI64Signaling', !1)
    e('writeI53ToU64Clamped', !1)
    e('writeI53ToU64Signaling', !1)
    e('readI53FromI64', !1)
    e('readI53FromU64', !1)
    e('convertI32PairToI53', !1)
    e('convertI32PairToI53Checked', !1)
    e('convertU32PairToI53', !1)
    e('reallyNegative', !1)
    e('unSign', !1)
    e('strLen', !1)
    e('reSign', !1)
    e('formatString', !1)
    e('setValue', !1)
    e('getValue', !1)
    e('PATH', !1)
    e('PATH_FS', !1)
    e('SYSCALLS', !1)
    e('getSocketFromFD', !1)
    e('getSocketAddress', !1)
    e('JSEvents', !1)
    e('registerKeyEventCallback', !1)
    e('specialHTMLTargets', !1)
    e('maybeCStringToJsString', !1)
    e('findEventTarget', !1)
    e('findCanvasEventTarget', !1)
    e('getBoundingClientRect', !1)
    e('fillMouseEventData', !1)
    e('registerMouseEventCallback', !1)
    e('registerWheelEventCallback', !1)
    e('registerUiEventCallback', !1)
    e('registerFocusEventCallback', !1)
    e('fillDeviceOrientationEventData', !1)
    e('registerDeviceOrientationEventCallback', !1)
    e('fillDeviceMotionEventData', !1)
    e('registerDeviceMotionEventCallback', !1)
    e('screenOrientation', !1)
    e('fillOrientationChangeEventData', !1)
    e('registerOrientationChangeEventCallback', !1)
    e('fillFullscreenChangeEventData', !1)
    e('registerFullscreenChangeEventCallback', !1)
    e('JSEvents_requestFullscreen', !1)
    e('JSEvents_resizeCanvasForFullscreen', !1)
    e('registerRestoreOldStyle', !1)
    e('hideEverythingExceptGivenElement', !1)
    e('restoreHiddenElements', !1)
    e('setLetterbox', !1)
    e('currentFullscreenStrategy', !1)
    e('restoreOldWindowedStyle', !1)
    e('softFullscreenResizeWebGLRenderTarget', !1)
    e('doRequestFullscreen', !1)
    e('fillPointerlockChangeEventData', !1)
    e('registerPointerlockChangeEventCallback', !1)
    e('registerPointerlockErrorEventCallback', !1)
    e('requestPointerLock', !1)
    e('fillVisibilityChangeEventData', !1)
    e('registerVisibilityChangeEventCallback', !1)
    e('registerTouchEventCallback', !1)
    e('fillGamepadEventData', !1)
    e('registerGamepadEventCallback', !1)
    e('registerBeforeUnloadEventCallback', !1)
    e('fillBatteryEventData', !1)
    e('battery', !1)
    e('registerBatteryEventCallback', !1)
    e('setCanvasElementSize', !1)
    e('getCanvasElementSize', !1)
    e('demangle', !1)
    e('demangleAll', !1)
    e('jsStackTrace', !1)
    e('stackTrace', !1)
    e('getEnvStrings', !1)
    e('checkWasiClock', !1)
    e('flush_NO_FILESYSTEM', !1)
    e('dlopenMissingError', !1)
    e('setImmediateWrapped', !1)
    e('clearImmediateWrapped', !1)
    e('polyfillSetImmediate', !1)
    e('uncaughtExceptionCount', !1)
    e('exceptionLast', !1)
    e('exceptionCaught', !1)
    e('ExceptionInfo', !1)
    e('exception_addRef', !1)
    e('exception_decRef', !1)
    e('Browser', !1)
    e('setMainLoop', !1)
    e('wget', !1)
    e('tempFixedLengthArray', !1)
    e('miniTempWebGLFloatBuffers', !1)
    e('heapObjectForWebGLType', !1)
    e('heapAccessShiftForWebGLHeap', !1)
    e('GL', !1)
    e('emscriptenWebGLGet', !1)
    e('computeUnpackAlignedImageSize', !1)
    e('emscriptenWebGLGetTexPixelData', !1)
    e('emscriptenWebGLGetUniform', !1)
    e('webglGetUniformLocation', !1)
    e('webglPrepareUniformLocationsBeforeFirstUse', !1)
    e('webglGetLeftBracePos', !1)
    e('emscriptenWebGLGetVertexAttrib', !1)
    e('writeGLArray', !1)
    e('AL', !1)
    e('SDL_unicode', !1)
    e('SDL_ttfContext', !1)
    e('SDL_audio', !1)
    e('SDL', !1)
    e('SDL_gfx', !1)
    e('GLUT', !1)
    e('EGL', !1)
    e('GLFW_Window', !1)
    e('GLFW', !1)
    e('GLEW', !1)
    e('IDBStore', !1)
    e('runAndAbortIfError', !1)
    m('ALLOC_NORMAL', !1)
    m('ALLOC_STACK', !1)
    var ya
    sa = function b() {
      ya || Ga()
      ya || (sa = b)
    }
    a.run = Ga
    if (a.preInit)
      for (
        'function' == typeof a.preInit && (a.preInit = [a.preInit]);
        0 < a.preInit.length;

      )
        a.preInit.pop()()
    Ga()
    x.prototype = Object.create(x.prototype)
    x.prototype.constructor = x
    x.prototype.__class__ = x
    x.__cache__ = {}
    a.WrapperObject = x
    a.getCache = C
    a.wrapPointer = X
    a.castObject = function (b, d) {
      return X(b.ptr, d)
    }
    a.NULL = X(0)
    a.destroy = function (b) {
      if (!b.__destroy__)
        throw 'Error: Cannot destroy object. (Did you create it yourself?)'
      b.__destroy__()
      delete C(b.__class__)[b.ptr]
    }
    a.compare = function (b, d) {
      return b.ptr === d.ptr
    }
    a.getPointer = function (b) {
      return b.ptr
    }
    a.getClass = function (b) {
      return b.__class__
    }
    var w = {
      buffer: 0,
      size: 0,
      pos: 0,
      temps: [],
      needed: 0,
      prepare: function () {
        if (w.needed) {
          for (var b = 0; b < w.temps.length; b++) a._free(w.temps[b])
          w.temps.length = 0
          a._free(w.buffer)
          w.buffer = 0
          w.size += w.needed
          w.needed = 0
        }
        w.buffer ||
          ((w.size += 128), (w.buffer = a._malloc(w.size)), r(w.buffer))
        w.pos = 0
      },
      alloc: function (b, d) {
        r(w.buffer)
        b = b.length * d.BYTES_PER_ELEMENT
        b = (b + 7) & -8
        w.pos + b >= w.size
          ? (r(0 < b), (w.needed += b), (d = a._malloc(b)), w.temps.push(d))
          : ((d = w.buffer + w.pos), (w.pos += b))
        return d
      },
      copy: function (b, d, f) {
        f >>>= 0
        switch (d.BYTES_PER_ELEMENT) {
          case 2:
            f >>>= 1
            break
          case 4:
            f >>>= 2
            break
          case 8:
            f >>>= 3
        }
        for (var q = 0; q < b.length; q++) d[f + q] = b[q]
      },
    }
    ea.prototype = Object.create(x.prototype)
    ea.prototype.constructor = ea
    ea.prototype.__class__ = ea
    ea.__cache__ = {}
    a.VoidPtr = ea
    ea.prototype.__destroy__ = ea.prototype.__destroy__ = function () {
      Cb(this.ptr)
    }
    Y.prototype = Object.create(x.prototype)
    Y.prototype.constructor = Y
    Y.prototype.__class__ = Y
    Y.__cache__ = {}
    a.DecoderBuffer = Y
    Y.prototype.Init = Y.prototype.Init = function (b, d) {
      var f = this.ptr
      w.prepare()
      'object' == typeof b && (b = Ia(b))
      d && 'object' === typeof d && (d = d.ptr)
      Db(f, b, d)
    }
    Y.prototype.__destroy__ = Y.prototype.__destroy__ = function () {
      Eb(this.ptr)
    }
    U.prototype = Object.create(x.prototype)
    U.prototype.constructor = U
    U.prototype.__class__ = U
    U.__cache__ = {}
    a.AttributeTransformData = U
    U.prototype.transform_type = U.prototype.transform_type = function () {
      return Fb(this.ptr)
    }
    U.prototype.__destroy__ = U.prototype.__destroy__ = function () {
      Gb(this.ptr)
    }
    ca.prototype = Object.create(x.prototype)
    ca.prototype.constructor = ca
    ca.prototype.__class__ = ca
    ca.__cache__ = {}
    a.GeometryAttribute = ca
    ca.prototype.__destroy__ = ca.prototype.__destroy__ = function () {
      Hb(this.ptr)
    }
    y.prototype = Object.create(x.prototype)
    y.prototype.constructor = y
    y.prototype.__class__ = y
    y.__cache__ = {}
    a.PointAttribute = y
    y.prototype.size = y.prototype.size = function () {
      return Ib(this.ptr)
    }
    y.prototype.GetAttributeTransformData =
      y.prototype.GetAttributeTransformData = function () {
        return X(Jb(this.ptr), U)
      }
    y.prototype.attribute_type = y.prototype.attribute_type = function () {
      return Kb(this.ptr)
    }
    y.prototype.data_type = y.prototype.data_type = function () {
      return Lb(this.ptr)
    }
    y.prototype.num_components = y.prototype.num_components = function () {
      return Mb(this.ptr)
    }
    y.prototype.normalized = y.prototype.normalized = function () {
      return !!Nb(this.ptr)
    }
    y.prototype.byte_stride = y.prototype.byte_stride = function () {
      return Ob(this.ptr)
    }
    y.prototype.byte_offset = y.prototype.byte_offset = function () {
      return Pb(this.ptr)
    }
    y.prototype.unique_id = y.prototype.unique_id = function () {
      return Qb(this.ptr)
    }
    y.prototype.__destroy__ = y.prototype.__destroy__ = function () {
      Rb(this.ptr)
    }
    F.prototype = Object.create(x.prototype)
    F.prototype.constructor = F
    F.prototype.__class__ = F
    F.__cache__ = {}
    a.AttributeQuantizationTransform = F
    F.prototype.InitFromAttribute = F.prototype.InitFromAttribute = function (
      b
    ) {
      var d = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      return !!Sb(d, b)
    }
    F.prototype.quantization_bits = F.prototype.quantization_bits =
      function () {
        return Tb(this.ptr)
      }
    F.prototype.min_value = F.prototype.min_value = function (b) {
      var d = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      return Ub(d, b)
    }
    F.prototype.range = F.prototype.range = function () {
      return Vb(this.ptr)
    }
    F.prototype.__destroy__ = F.prototype.__destroy__ = function () {
      Wb(this.ptr)
    }
    L.prototype = Object.create(x.prototype)
    L.prototype.constructor = L
    L.prototype.__class__ = L
    L.__cache__ = {}
    a.AttributeOctahedronTransform = L
    L.prototype.InitFromAttribute = L.prototype.InitFromAttribute = function (
      b
    ) {
      var d = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      return !!Xb(d, b)
    }
    L.prototype.quantization_bits = L.prototype.quantization_bits =
      function () {
        return Yb(this.ptr)
      }
    L.prototype.__destroy__ = L.prototype.__destroy__ = function () {
      Zb(this.ptr)
    }
    M.prototype = Object.create(x.prototype)
    M.prototype.constructor = M
    M.prototype.__class__ = M
    M.__cache__ = {}
    a.PointCloud = M
    M.prototype.num_attributes = M.prototype.num_attributes = function () {
      return $b(this.ptr)
    }
    M.prototype.num_points = M.prototype.num_points = function () {
      return ac(this.ptr)
    }
    M.prototype.__destroy__ = M.prototype.__destroy__ = function () {
      bc(this.ptr)
    }
    G.prototype = Object.create(x.prototype)
    G.prototype.constructor = G
    G.prototype.__class__ = G
    G.__cache__ = {}
    a.Mesh = G
    G.prototype.num_faces = G.prototype.num_faces = function () {
      return cc(this.ptr)
    }
    G.prototype.num_attributes = G.prototype.num_attributes = function () {
      return dc(this.ptr)
    }
    G.prototype.num_points = G.prototype.num_points = function () {
      return ec(this.ptr)
    }
    G.prototype.__destroy__ = G.prototype.__destroy__ = function () {
      fc(this.ptr)
    }
    Z.prototype = Object.create(x.prototype)
    Z.prototype.constructor = Z
    Z.prototype.__class__ = Z
    Z.__cache__ = {}
    a.Metadata = Z
    Z.prototype.__destroy__ = Z.prototype.__destroy__ = function () {
      gc(this.ptr)
    }
    E.prototype = Object.create(x.prototype)
    E.prototype.constructor = E
    E.prototype.__class__ = E
    E.__cache__ = {}
    a.Status = E
    E.prototype.code = E.prototype.code = function () {
      return hc(this.ptr)
    }
    E.prototype.ok = E.prototype.ok = function () {
      return !!ic(this.ptr)
    }
    E.prototype.error_msg = E.prototype.error_msg = function () {
      return H(jc(this.ptr))
    }
    E.prototype.__destroy__ = E.prototype.__destroy__ = function () {
      kc(this.ptr)
    }
    N.prototype = Object.create(x.prototype)
    N.prototype.constructor = N
    N.prototype.__class__ = N
    N.__cache__ = {}
    a.DracoFloat32Array = N
    N.prototype.GetValue = N.prototype.GetValue = function (b) {
      var d = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      return lc(d, b)
    }
    N.prototype.size = N.prototype.size = function () {
      return mc(this.ptr)
    }
    N.prototype.__destroy__ = N.prototype.__destroy__ = function () {
      nc(this.ptr)
    }
    O.prototype = Object.create(x.prototype)
    O.prototype.constructor = O
    O.prototype.__class__ = O
    O.__cache__ = {}
    a.DracoInt8Array = O
    O.prototype.GetValue = O.prototype.GetValue = function (b) {
      var d = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      return oc(d, b)
    }
    O.prototype.size = O.prototype.size = function () {
      return pc(this.ptr)
    }
    O.prototype.__destroy__ = O.prototype.__destroy__ = function () {
      qc(this.ptr)
    }
    P.prototype = Object.create(x.prototype)
    P.prototype.constructor = P
    P.prototype.__class__ = P
    P.__cache__ = {}
    a.DracoUInt8Array = P
    P.prototype.GetValue = P.prototype.GetValue = function (b) {
      var d = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      return rc(d, b)
    }
    P.prototype.size = P.prototype.size = function () {
      return sc(this.ptr)
    }
    P.prototype.__destroy__ = P.prototype.__destroy__ = function () {
      tc(this.ptr)
    }
    Q.prototype = Object.create(x.prototype)
    Q.prototype.constructor = Q
    Q.prototype.__class__ = Q
    Q.__cache__ = {}
    a.DracoInt16Array = Q
    Q.prototype.GetValue = Q.prototype.GetValue = function (b) {
      var d = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      return uc(d, b)
    }
    Q.prototype.size = Q.prototype.size = function () {
      return vc(this.ptr)
    }
    Q.prototype.__destroy__ = Q.prototype.__destroy__ = function () {
      wc(this.ptr)
    }
    R.prototype = Object.create(x.prototype)
    R.prototype.constructor = R
    R.prototype.__class__ = R
    R.__cache__ = {}
    a.DracoUInt16Array = R
    R.prototype.GetValue = R.prototype.GetValue = function (b) {
      var d = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      return xc(d, b)
    }
    R.prototype.size = R.prototype.size = function () {
      return yc(this.ptr)
    }
    R.prototype.__destroy__ = R.prototype.__destroy__ = function () {
      zc(this.ptr)
    }
    S.prototype = Object.create(x.prototype)
    S.prototype.constructor = S
    S.prototype.__class__ = S
    S.__cache__ = {}
    a.DracoInt32Array = S
    S.prototype.GetValue = S.prototype.GetValue = function (b) {
      var d = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      return Ac(d, b)
    }
    S.prototype.size = S.prototype.size = function () {
      return Bc(this.ptr)
    }
    S.prototype.__destroy__ = S.prototype.__destroy__ = function () {
      Cc(this.ptr)
    }
    T.prototype = Object.create(x.prototype)
    T.prototype.constructor = T
    T.prototype.__class__ = T
    T.__cache__ = {}
    a.DracoUInt32Array = T
    T.prototype.GetValue = T.prototype.GetValue = function (b) {
      var d = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      return Dc(d, b)
    }
    T.prototype.size = T.prototype.size = function () {
      return Ec(this.ptr)
    }
    T.prototype.__destroy__ = T.prototype.__destroy__ = function () {
      Fc(this.ptr)
    }
    z.prototype = Object.create(x.prototype)
    z.prototype.constructor = z
    z.prototype.__class__ = z
    z.__cache__ = {}
    a.MetadataQuerier = z
    z.prototype.HasEntry = z.prototype.HasEntry = function (b, d) {
      var f = this.ptr
      w.prepare()
      b && 'object' === typeof b && (b = b.ptr)
      d = d && 'object' === typeof d ? d.ptr : ha(d)
      return !!Gc(f, b, d)
    }
    z.prototype.GetIntEntry = z.prototype.GetIntEntry = function (b, d) {
      var f = this.ptr
      w.prepare()
      b && 'object' === typeof b && (b = b.ptr)
      d = d && 'object' === typeof d ? d.ptr : ha(d)
      return Hc(f, b, d)
    }
    z.prototype.GetIntEntryArray = z.prototype.GetIntEntryArray = function (
      b,
      d,
      f
    ) {
      var q = this.ptr
      w.prepare()
      b && 'object' === typeof b && (b = b.ptr)
      d = d && 'object' === typeof d ? d.ptr : ha(d)
      f && 'object' === typeof f && (f = f.ptr)
      Ic(q, b, d, f)
    }
    z.prototype.GetDoubleEntry = z.prototype.GetDoubleEntry = function (b, d) {
      var f = this.ptr
      w.prepare()
      b && 'object' === typeof b && (b = b.ptr)
      d = d && 'object' === typeof d ? d.ptr : ha(d)
      return Jc(f, b, d)
    }
    z.prototype.GetStringEntry = z.prototype.GetStringEntry = function (b, d) {
      var f = this.ptr
      w.prepare()
      b && 'object' === typeof b && (b = b.ptr)
      d = d && 'object' === typeof d ? d.ptr : ha(d)
      return H(Kc(f, b, d))
    }
    z.prototype.NumEntries = z.prototype.NumEntries = function (b) {
      var d = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      return Lc(d, b)
    }
    z.prototype.GetEntryName = z.prototype.GetEntryName = function (b, d) {
      var f = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      d && 'object' === typeof d && (d = d.ptr)
      return H(Mc(f, b, d))
    }
    z.prototype.__destroy__ = z.prototype.__destroy__ = function () {
      Nc(this.ptr)
    }
    t.prototype = Object.create(x.prototype)
    t.prototype.constructor = t
    t.prototype.__class__ = t
    t.__cache__ = {}
    a.Decoder = t
    t.prototype.DecodeArrayToPointCloud = t.prototype.DecodeArrayToPointCloud =
      function (b, d, f) {
        var q = this.ptr
        w.prepare()
        'object' == typeof b && (b = Ia(b))
        d && 'object' === typeof d && (d = d.ptr)
        f && 'object' === typeof f && (f = f.ptr)
        return X(Oc(q, b, d, f), E)
      }
    t.prototype.DecodeArrayToMesh = t.prototype.DecodeArrayToMesh = function (
      b,
      d,
      f
    ) {
      var q = this.ptr
      w.prepare()
      'object' == typeof b && (b = Ia(b))
      d && 'object' === typeof d && (d = d.ptr)
      f && 'object' === typeof f && (f = f.ptr)
      return X(Pc(q, b, d, f), E)
    }
    t.prototype.GetAttributeId = t.prototype.GetAttributeId = function (b, d) {
      var f = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      d && 'object' === typeof d && (d = d.ptr)
      return Qc(f, b, d)
    }
    t.prototype.GetAttributeIdByName = t.prototype.GetAttributeIdByName =
      function (b, d) {
        var f = this.ptr
        w.prepare()
        b && 'object' === typeof b && (b = b.ptr)
        d = d && 'object' === typeof d ? d.ptr : ha(d)
        return Rc(f, b, d)
      }
    t.prototype.GetAttributeIdByMetadataEntry =
      t.prototype.GetAttributeIdByMetadataEntry = function (b, d, f) {
        var q = this.ptr
        w.prepare()
        b && 'object' === typeof b && (b = b.ptr)
        d = d && 'object' === typeof d ? d.ptr : ha(d)
        f = f && 'object' === typeof f ? f.ptr : ha(f)
        return Sc(q, b, d, f)
      }
    t.prototype.GetAttribute = t.prototype.GetAttribute = function (b, d) {
      var f = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      d && 'object' === typeof d && (d = d.ptr)
      return X(Tc(f, b, d), y)
    }
    t.prototype.GetAttributeByUniqueId = t.prototype.GetAttributeByUniqueId =
      function (b, d) {
        var f = this.ptr
        b && 'object' === typeof b && (b = b.ptr)
        d && 'object' === typeof d && (d = d.ptr)
        return X(Uc(f, b, d), y)
      }
    t.prototype.GetMetadata = t.prototype.GetMetadata = function (b) {
      var d = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      return X(Vc(d, b), Z)
    }
    t.prototype.GetAttributeMetadata = t.prototype.GetAttributeMetadata =
      function (b, d) {
        var f = this.ptr
        b && 'object' === typeof b && (b = b.ptr)
        d && 'object' === typeof d && (d = d.ptr)
        return X(Wc(f, b, d), Z)
      }
    t.prototype.GetFaceFromMesh = t.prototype.GetFaceFromMesh = function (
      b,
      d,
      f
    ) {
      var q = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      d && 'object' === typeof d && (d = d.ptr)
      f && 'object' === typeof f && (f = f.ptr)
      return !!Xc(q, b, d, f)
    }
    t.prototype.GetTriangleStripsFromMesh =
      t.prototype.GetTriangleStripsFromMesh = function (b, d) {
        var f = this.ptr
        b && 'object' === typeof b && (b = b.ptr)
        d && 'object' === typeof d && (d = d.ptr)
        return Yc(f, b, d)
      }
    t.prototype.GetTrianglesUInt16Array = t.prototype.GetTrianglesUInt16Array =
      function (b, d, f) {
        var q = this.ptr
        b && 'object' === typeof b && (b = b.ptr)
        d && 'object' === typeof d && (d = d.ptr)
        f && 'object' === typeof f && (f = f.ptr)
        return !!Zc(q, b, d, f)
      }
    t.prototype.GetTrianglesUInt32Array = t.prototype.GetTrianglesUInt32Array =
      function (b, d, f) {
        var q = this.ptr
        b && 'object' === typeof b && (b = b.ptr)
        d && 'object' === typeof d && (d = d.ptr)
        f && 'object' === typeof f && (f = f.ptr)
        return !!$c(q, b, d, f)
      }
    t.prototype.GetAttributeFloat = t.prototype.GetAttributeFloat = function (
      b,
      d,
      f
    ) {
      var q = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      d && 'object' === typeof d && (d = d.ptr)
      f && 'object' === typeof f && (f = f.ptr)
      return !!ad(q, b, d, f)
    }
    t.prototype.GetAttributeFloatForAllPoints =
      t.prototype.GetAttributeFloatForAllPoints = function (b, d, f) {
        var q = this.ptr
        b && 'object' === typeof b && (b = b.ptr)
        d && 'object' === typeof d && (d = d.ptr)
        f && 'object' === typeof f && (f = f.ptr)
        return !!bd(q, b, d, f)
      }
    t.prototype.GetAttributeIntForAllPoints =
      t.prototype.GetAttributeIntForAllPoints = function (b, d, f) {
        var q = this.ptr
        b && 'object' === typeof b && (b = b.ptr)
        d && 'object' === typeof d && (d = d.ptr)
        f && 'object' === typeof f && (f = f.ptr)
        return !!cd(q, b, d, f)
      }
    t.prototype.GetAttributeInt8ForAllPoints =
      t.prototype.GetAttributeInt8ForAllPoints = function (b, d, f) {
        var q = this.ptr
        b && 'object' === typeof b && (b = b.ptr)
        d && 'object' === typeof d && (d = d.ptr)
        f && 'object' === typeof f && (f = f.ptr)
        return !!dd(q, b, d, f)
      }
    t.prototype.GetAttributeUInt8ForAllPoints =
      t.prototype.GetAttributeUInt8ForAllPoints = function (b, d, f) {
        var q = this.ptr
        b && 'object' === typeof b && (b = b.ptr)
        d && 'object' === typeof d && (d = d.ptr)
        f && 'object' === typeof f && (f = f.ptr)
        return !!ed(q, b, d, f)
      }
    t.prototype.GetAttributeInt16ForAllPoints =
      t.prototype.GetAttributeInt16ForAllPoints = function (b, d, f) {
        var q = this.ptr
        b && 'object' === typeof b && (b = b.ptr)
        d && 'object' === typeof d && (d = d.ptr)
        f && 'object' === typeof f && (f = f.ptr)
        return !!fd(q, b, d, f)
      }
    t.prototype.GetAttributeUInt16ForAllPoints =
      t.prototype.GetAttributeUInt16ForAllPoints = function (b, d, f) {
        var q = this.ptr
        b && 'object' === typeof b && (b = b.ptr)
        d && 'object' === typeof d && (d = d.ptr)
        f && 'object' === typeof f && (f = f.ptr)
        return !!gd(q, b, d, f)
      }
    t.prototype.GetAttributeInt32ForAllPoints =
      t.prototype.GetAttributeInt32ForAllPoints = function (b, d, f) {
        var q = this.ptr
        b && 'object' === typeof b && (b = b.ptr)
        d && 'object' === typeof d && (d = d.ptr)
        f && 'object' === typeof f && (f = f.ptr)
        return !!hd(q, b, d, f)
      }
    t.prototype.GetAttributeUInt32ForAllPoints =
      t.prototype.GetAttributeUInt32ForAllPoints = function (b, d, f) {
        var q = this.ptr
        b && 'object' === typeof b && (b = b.ptr)
        d && 'object' === typeof d && (d = d.ptr)
        f && 'object' === typeof f && (f = f.ptr)
        return !!id(q, b, d, f)
      }
    t.prototype.GetAttributeDataArrayForAllPoints =
      t.prototype.GetAttributeDataArrayForAllPoints = function (b, d, f, q, v) {
        var D = this.ptr
        b && 'object' === typeof b && (b = b.ptr)
        d && 'object' === typeof d && (d = d.ptr)
        f && 'object' === typeof f && (f = f.ptr)
        q && 'object' === typeof q && (q = q.ptr)
        v && 'object' === typeof v && (v = v.ptr)
        return !!jd(D, b, d, f, q, v)
      }
    t.prototype.SkipAttributeTransform = t.prototype.SkipAttributeTransform =
      function (b) {
        var d = this.ptr
        b && 'object' === typeof b && (b = b.ptr)
        kd(d, b)
      }
    t.prototype.GetEncodedGeometryType_Deprecated =
      t.prototype.GetEncodedGeometryType_Deprecated = function (b) {
        var d = this.ptr
        b && 'object' === typeof b && (b = b.ptr)
        return ld(d, b)
      }
    t.prototype.DecodeBufferToPointCloud =
      t.prototype.DecodeBufferToPointCloud = function (b, d) {
        var f = this.ptr
        b && 'object' === typeof b && (b = b.ptr)
        d && 'object' === typeof d && (d = d.ptr)
        return X(md(f, b, d), E)
      }
    t.prototype.DecodeBufferToMesh = t.prototype.DecodeBufferToMesh = function (
      b,
      d
    ) {
      var f = this.ptr
      b && 'object' === typeof b && (b = b.ptr)
      d && 'object' === typeof d && (d = d.ptr)
      return X(nd(f, b, d), E)
    }
    t.prototype.__destroy__ = t.prototype.__destroy__ = function () {
      od(this.ptr)
    }
    ;(function () {
      function b() {
        a.ATTRIBUTE_INVALID_TRANSFORM = pd()
        a.ATTRIBUTE_NO_TRANSFORM = qd()
        a.ATTRIBUTE_QUANTIZATION_TRANSFORM = rd()
        a.ATTRIBUTE_OCTAHEDRON_TRANSFORM = sd()
        a.INVALID = td()
        a.POSITION = ud()
        a.NORMAL = vd()
        a.COLOR = wd()
        a.TEX_COORD = xd()
        a.GENERIC = yd()
        a.INVALID_GEOMETRY_TYPE = zd()
        a.POINT_CLOUD = Ad()
        a.TRIANGULAR_MESH = Bd()
        a.DT_INVALID = Cd()
        a.DT_INT8 = Dd()
        a.DT_UINT8 = Ed()
        a.DT_INT16 = Fd()
        a.DT_UINT16 = Gd()
        a.DT_INT32 = Hd()
        a.DT_UINT32 = Id()
        a.DT_INT64 = Jd()
        a.DT_UINT64 = Kd()
        a.DT_FLOAT32 = Ld()
        a.DT_FLOAT64 = Md()
        a.DT_BOOL = Nd()
        a.DT_TYPES_COUNT = Od()
        a.OK = Pd()
        a.DRACO_ERROR = Qd()
        a.IO_ERROR = Rd()
        a.INVALID_PARAMETER = Sd()
        a.UNSUPPORTED_VERSION = Td()
        a.UNKNOWN_VERSION = Ud()
      }
      ua ? b() : Ha.unshift(b)
    })()
    if ('function' === typeof a.onModuleParsed) a.onModuleParsed()
    a.Decoder.prototype.GetEncodedGeometryType = function (b) {
      if (b.__class__ && b.__class__ === a.DecoderBuffer)
        return a.Decoder.prototype.GetEncodedGeometryType_Deprecated(b)
      if (8 > b.byteLength) return a.INVALID_GEOMETRY_TYPE
      switch (b[7]) {
        case 0:
          return a.POINT_CLOUD
        case 1:
          return a.TRIANGULAR_MESH
        default:
          return a.INVALID_GEOMETRY_TYPE
      }
    }
    return k.ready
  }
})()
'object' === typeof exports && 'object' === typeof module
  ? (module.exports = DracoDecoderModule)
  : 'function' === typeof define && define.amd
  ? define([], function () {
      return DracoDecoderModule
    })
  : 'object' === typeof exports &&
    (exports.DracoDecoderModule = DracoDecoderModule)
