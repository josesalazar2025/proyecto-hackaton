(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const o of document.querySelectorAll('link[rel="modulepreload"]')) n(o);
  new MutationObserver((o) => {
    for (const a of o)
      if (a.type === "childList")
        for (const l of a.addedNodes)
          l.tagName === "LINK" && l.rel === "modulepreload" && n(l);
  }).observe(document, { childList: !0, subtree: !0 });
  function e(o) {
    const a = {};
    return (
      o.integrity && (a.integrity = o.integrity),
      o.referrerPolicy && (a.referrerPolicy = o.referrerPolicy),
      o.crossOrigin === "use-credentials"
        ? (a.credentials = "include")
        : o.crossOrigin === "anonymous"
          ? (a.credentials = "omit")
          : (a.credentials = "same-origin"),
      a
    );
  }
  function n(o) {
    if (o.ep) return;
    o.ep = !0;
    const a = e(o);
    fetch(o.href, a);
  }
})();
const le = Object.create(null);
le.open = "0";
le.close = "1";
le.ping = "2";
le.pong = "3";
le.message = "4";
le.upgrade = "5";
le.noop = "6";
const zn = Object.create(null);
Object.keys(le).forEach((i) => {
  zn[le[i]] = i;
});
const po = { type: "error", data: "parser error" },
  Kl =
    typeof Blob == "function" ||
    (typeof Blob < "u" &&
      Object.prototype.toString.call(Blob) === "[object BlobConstructor]"),
  Xl = typeof ArrayBuffer == "function",
  Jl = (i) =>
    typeof ArrayBuffer.isView == "function"
      ? ArrayBuffer.isView(i)
      : i && i.buffer instanceof ArrayBuffer,
  Io = ({ type: i, data: t }, e, n) =>
    Kl && t instanceof Blob
      ? e
        ? n(t)
        : ga(t, n)
      : Xl && (t instanceof ArrayBuffer || Jl(t))
        ? e
          ? n(t)
          : ga(new Blob([t]), n)
        : n(le[i] + (t || "")),
  ga = (i, t) => {
    const e = new FileReader();
    return (
      (e.onload = function () {
        const n = e.result.split(",")[1];
        t("b" + (n || ""));
      }),
      e.readAsDataURL(i)
    );
  };
function ma(i) {
  return i instanceof Uint8Array
    ? i
    : i instanceof ArrayBuffer
      ? new Uint8Array(i)
      : new Uint8Array(i.buffer, i.byteOffset, i.byteLength);
}
let Ys;
function sd(i, t) {
  if (Kl && i.data instanceof Blob)
    return i.data.arrayBuffer().then(ma).then(t);
  if (Xl && (i.data instanceof ArrayBuffer || Jl(i.data))) return t(ma(i.data));
  Io(i, !1, (e) => {
    (Ys || (Ys = new TextEncoder()), t(Ys.encode(e)));
  });
}
const _a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
  Di = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let i = 0; i < _a.length; i++) Di[_a.charCodeAt(i)] = i;
const od = (i) => {
    let t = i.length * 0.75,
      e = i.length,
      n,
      o = 0,
      a,
      l,
      c,
      u;
    i[i.length - 1] === "=" && (t--, i[i.length - 2] === "=" && t--);
    const d = new ArrayBuffer(t),
      p = new Uint8Array(d);
    for (n = 0; n < e; n += 4)
      ((a = Di[i.charCodeAt(n)]),
        (l = Di[i.charCodeAt(n + 1)]),
        (c = Di[i.charCodeAt(n + 2)]),
        (u = Di[i.charCodeAt(n + 3)]),
        (p[o++] = (a << 2) | (l >> 4)),
        (p[o++] = ((l & 15) << 4) | (c >> 2)),
        (p[o++] = ((c & 3) << 6) | (u & 63)));
    return d;
  },
  rd = typeof ArrayBuffer == "function",
  Bo = (i, t) => {
    if (typeof i != "string") return { type: "message", data: Ql(i, t) };
    const e = i.charAt(0);
    return e === "b"
      ? { type: "message", data: ad(i.substring(1), t) }
      : zn[e]
        ? i.length > 1
          ? { type: zn[e], data: i.substring(1) }
          : { type: zn[e] }
        : po;
  },
  ad = (i, t) => {
    if (rd) {
      const e = od(i);
      return Ql(e, t);
    } else return { base64: !0, data: i };
  },
  Ql = (i, t) =>
    t === "blob"
      ? i instanceof Blob
        ? i
        : new Blob([i])
      : i instanceof ArrayBuffer
        ? i
        : i.buffer,
  tc = "",
  ld = (i, t) => {
    const e = i.length,
      n = new Array(e);
    let o = 0;
    i.forEach((a, l) => {
      Io(a, !1, (c) => {
        ((n[l] = c), ++o === e && t(n.join(tc)));
      });
    });
  },
  cd = (i, t) => {
    const e = i.split(tc),
      n = [];
    for (let o = 0; o < e.length; o++) {
      const a = Bo(e[o], t);
      if ((n.push(a), a.type === "error")) break;
    }
    return n;
  };
function hd() {
  return new TransformStream({
    transform(i, t) {
      sd(i, (e) => {
        const n = e.length;
        let o;
        if (n < 126)
          ((o = new Uint8Array(1)), new DataView(o.buffer).setUint8(0, n));
        else if (n < 65536) {
          o = new Uint8Array(3);
          const a = new DataView(o.buffer);
          (a.setUint8(0, 126), a.setUint16(1, n));
        } else {
          o = new Uint8Array(9);
          const a = new DataView(o.buffer);
          (a.setUint8(0, 127), a.setBigUint64(1, BigInt(n)));
        }
        (i.data && typeof i.data != "string" && (o[0] |= 128),
          t.enqueue(o),
          t.enqueue(e));
      });
    },
  });
}
let Gs;
function wn(i) {
  return i.reduce((t, e) => t + e.length, 0);
}
function Pn(i, t) {
  if (i[0].length === t) return i.shift();
  const e = new Uint8Array(t);
  let n = 0;
  for (let o = 0; o < t; o++)
    ((e[o] = i[0][n++]), n === i[0].length && (i.shift(), (n = 0)));
  return (i.length && n < i[0].length && (i[0] = i[0].slice(n)), e);
}
function ud(i, t) {
  Gs || (Gs = new TextDecoder());
  const e = [];
  let n = 0,
    o = -1,
    a = !1;
  return new TransformStream({
    transform(l, c) {
      for (e.push(l); ; ) {
        if (n === 0) {
          if (wn(e) < 1) break;
          const u = Pn(e, 1);
          ((a = (u[0] & 128) === 128),
            (o = u[0] & 127),
            o < 126 ? (n = 3) : o === 126 ? (n = 1) : (n = 2));
        } else if (n === 1) {
          if (wn(e) < 2) break;
          const u = Pn(e, 2);
          ((o = new DataView(u.buffer, u.byteOffset, u.length).getUint16(0)),
            (n = 3));
        } else if (n === 2) {
          if (wn(e) < 8) break;
          const u = Pn(e, 8),
            d = new DataView(u.buffer, u.byteOffset, u.length),
            p = d.getUint32(0);
          if (p > Math.pow(2, 21) - 1) {
            c.enqueue(po);
            break;
          }
          ((o = p * Math.pow(2, 32) + d.getUint32(4)), (n = 3));
        } else {
          if (wn(e) < o) break;
          const u = Pn(e, o);
          (c.enqueue(Bo(a ? u : Gs.decode(u), t)), (n = 0));
        }
        if (o === 0 || o > i) {
          c.enqueue(po);
          break;
        }
      }
    },
  });
}
const ec = 4;
function Lt(i) {
  if (i) return dd(i);
}
function dd(i) {
  for (var t in Lt.prototype) i[t] = Lt.prototype[t];
  return i;
}
Lt.prototype.on = Lt.prototype.addEventListener = function (i, t) {
  return (
    (this._callbacks = this._callbacks || {}),
    (this._callbacks["$" + i] = this._callbacks["$" + i] || []).push(t),
    this
  );
};
Lt.prototype.once = function (i, t) {
  function e() {
    (this.off(i, e), t.apply(this, arguments));
  }
  return ((e.fn = t), this.on(i, e), this);
};
Lt.prototype.off =
  Lt.prototype.removeListener =
  Lt.prototype.removeAllListeners =
  Lt.prototype.removeEventListener =
    function (i, t) {
      if (((this._callbacks = this._callbacks || {}), arguments.length == 0))
        return ((this._callbacks = {}), this);
      var e = this._callbacks["$" + i];
      if (!e) return this;
      if (arguments.length == 1) return (delete this._callbacks["$" + i], this);
      for (var n, o = 0; o < e.length; o++)
        if (((n = e[o]), n === t || n.fn === t)) {
          e.splice(o, 1);
          break;
        }
      return (e.length === 0 && delete this._callbacks["$" + i], this);
    };
Lt.prototype.emit = function (i) {
  this._callbacks = this._callbacks || {};
  for (
    var t = new Array(arguments.length - 1),
      e = this._callbacks["$" + i],
      n = 1;
    n < arguments.length;
    n++
  )
    t[n - 1] = arguments[n];
  if (e) {
    e = e.slice(0);
    for (var n = 0, o = e.length; n < o; ++n) e[n].apply(this, t);
  }
  return this;
};
Lt.prototype.emitReserved = Lt.prototype.emit;
Lt.prototype.listeners = function (i) {
  return (
    (this._callbacks = this._callbacks || {}),
    this._callbacks["$" + i] || []
  );
};
Lt.prototype.hasListeners = function (i) {
  return !!this.listeners(i).length;
};
const ss =
    typeof Promise == "function" && typeof Promise.resolve == "function"
      ? (t) => Promise.resolve().then(t)
      : (t, e) => e(t, 0),
  Yt =
    typeof self < "u"
      ? self
      : typeof window < "u"
        ? window
        : Function("return this")(),
  fd = "arraybuffer";
function ic(i, ...t) {
  return t.reduce((e, n) => (i.hasOwnProperty(n) && (e[n] = i[n]), e), {});
}
const pd = Yt.setTimeout,
  gd = Yt.clearTimeout;
function os(i, t) {
  t.useNativeTimers
    ? ((i.setTimeoutFn = pd.bind(Yt)), (i.clearTimeoutFn = gd.bind(Yt)))
    : ((i.setTimeoutFn = Yt.setTimeout.bind(Yt)),
      (i.clearTimeoutFn = Yt.clearTimeout.bind(Yt)));
}
const md = 1.33;
function _d(i) {
  return typeof i == "string"
    ? yd(i)
    : Math.ceil((i.byteLength || i.size) * md);
}
function yd(i) {
  let t = 0,
    e = 0;
  for (let n = 0, o = i.length; n < o; n++)
    ((t = i.charCodeAt(n)),
      t < 128
        ? (e += 1)
        : t < 2048
          ? (e += 2)
          : t < 55296 || t >= 57344
            ? (e += 3)
            : (n++, (e += 4)));
  return e;
}
function nc() {
  return (
    Date.now().toString(36).substring(3) +
    Math.random().toString(36).substring(2, 5)
  );
}
function vd(i) {
  let t = "";
  for (let e in i)
    i.hasOwnProperty(e) &&
      (t.length && (t += "&"),
      (t += encodeURIComponent(e) + "=" + encodeURIComponent(i[e])));
  return t;
}
function bd(i) {
  let t = {},
    e = i.split("&");
  for (let n = 0, o = e.length; n < o; n++) {
    let a = e[n].split("=");
    t[decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
  }
  return t;
}
class xd extends Error {
  constructor(t, e, n) {
    (super(t),
      (this.description = e),
      (this.context = n),
      (this.type = "TransportError"));
  }
}
class Do extends Lt {
  constructor(t) {
    (super(),
      (this.writable = !1),
      os(this, t),
      (this.opts = t),
      (this.query = t.query),
      (this.socket = t.socket),
      (this.supportsBinary = !t.forceBase64));
  }
  onError(t, e, n) {
    return (super.emitReserved("error", new xd(t, e, n)), this);
  }
  open() {
    return ((this.readyState = "opening"), this.doOpen(), this);
  }
  close() {
    return (
      (this.readyState === "opening" || this.readyState === "open") &&
        (this.doClose(), this.onClose()),
      this
    );
  }
  send(t) {
    this.readyState === "open" && this.write(t);
  }
  onOpen() {
    ((this.readyState = "open"),
      (this.writable = !0),
      super.emitReserved("open"));
  }
  onData(t) {
    const e = Bo(t, this.socket.binaryType);
    this.onPacket(e);
  }
  onPacket(t) {
    super.emitReserved("packet", t);
  }
  onClose(t) {
    ((this.readyState = "closed"), super.emitReserved("close", t));
  }
  pause(t) {}
  createUri(t, e = {}) {
    return (
      t +
      "://" +
      this._hostname() +
      this._port() +
      this.opts.path +
      this._query(e)
    );
  }
  _hostname() {
    const t = this.opts.hostname;
    return t.indexOf(":") === -1 ? t : "[" + t + "]";
  }
  _port() {
    return this.opts.port &&
      ((this.opts.secure && Number(this.opts.port) !== 443) ||
        (!this.opts.secure && Number(this.opts.port) !== 80))
      ? ":" + this.opts.port
      : "";
  }
  _query(t) {
    const e = vd(t);
    return e.length ? "?" + e : "";
  }
}
class wd extends Do {
  constructor() {
    (super(...arguments), (this._polling = !1));
  }
  get name() {
    return "polling";
  }
  doOpen() {
    this._poll();
  }
  pause(t) {
    this.readyState = "pausing";
    const e = () => {
      ((this.readyState = "paused"), t());
    };
    if (this._polling || !this.writable) {
      let n = 0;
      (this._polling &&
        (n++,
        this.once("pollComplete", function () {
          --n || e();
        })),
        this.writable ||
          (n++,
          this.once("drain", function () {
            --n || e();
          })));
    } else e();
  }
  _poll() {
    ((this._polling = !0), this.doPoll(), this.emitReserved("poll"));
  }
  onData(t) {
    const e = (n) => {
      if (
        (this.readyState === "opening" && n.type === "open" && this.onOpen(),
        n.type === "close")
      )
        return (
          this.onClose({ description: "transport closed by the server" }),
          !1
        );
      this.onPacket(n);
    };
    (cd(t, this.socket.binaryType).forEach(e),
      this.readyState !== "closed" &&
        ((this._polling = !1),
        this.emitReserved("pollComplete"),
        this.readyState === "open" && this._poll()));
  }
  doClose() {
    const t = () => {
      this.write([{ type: "close" }]);
    };
    this.readyState === "open" ? t() : this.once("open", t);
  }
  write(t) {
    ((this.writable = !1),
      ld(t, (e) => {
        this.doWrite(e, () => {
          ((this.writable = !0), this.emitReserved("drain"));
        });
      }));
  }
  uri() {
    const t = this.opts.secure ? "https" : "http",
      e = this.query || {};
    return (
      this.opts.timestampRequests !== !1 &&
        (e[this.opts.timestampParam] = nc()),
      !this.supportsBinary && !e.sid && (e.b64 = 1),
      this.createUri(t, e)
    );
  }
}
let sc = !1;
try {
  sc = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {}
const Pd = sc;
function kd() {}
class Sd extends wd {
  constructor(t) {
    if ((super(t), typeof location < "u")) {
      const e = location.protocol === "https:";
      let n = location.port;
      (n || (n = e ? "443" : "80"),
        (this.xd =
          (typeof location < "u" && t.hostname !== location.hostname) ||
          n !== t.port));
    }
  }
  doWrite(t, e) {
    const n = this.request({ method: "POST", data: t });
    (n.on("success", e),
      n.on("error", (o, a) => {
        this.onError("xhr post error", o, a);
      }));
  }
  doPoll() {
    const t = this.request();
    (t.on("data", this.onData.bind(this)),
      t.on("error", (e, n) => {
        this.onError("xhr poll error", e, n);
      }),
      (this.pollXhr = t));
  }
}
class re extends Lt {
  constructor(t, e, n) {
    (super(),
      (this.createRequest = t),
      os(this, n),
      (this._opts = n),
      (this._method = n.method || "GET"),
      (this._uri = e),
      (this._data = n.data !== void 0 ? n.data : null),
      this._create());
  }
  _create() {
    var t;
    const e = ic(
      this._opts,
      "agent",
      "pfx",
      "key",
      "passphrase",
      "cert",
      "ca",
      "ciphers",
      "rejectUnauthorized",
      "autoUnref",
    );
    e.xdomain = !!this._opts.xd;
    const n = (this._xhr = this.createRequest(e));
    try {
      n.open(this._method, this._uri, !0);
      try {
        if (this._opts.extraHeaders) {
          n.setDisableHeaderCheck && n.setDisableHeaderCheck(!0);
          for (let o in this._opts.extraHeaders)
            this._opts.extraHeaders.hasOwnProperty(o) &&
              n.setRequestHeader(o, this._opts.extraHeaders[o]);
        }
      } catch {}
      if (this._method === "POST")
        try {
          n.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
        } catch {}
      try {
        n.setRequestHeader("Accept", "*/*");
      } catch {}
      ((t = this._opts.cookieJar) === null || t === void 0 || t.addCookies(n),
        "withCredentials" in n &&
          (n.withCredentials = this._opts.withCredentials),
        this._opts.requestTimeout && (n.timeout = this._opts.requestTimeout),
        (n.onreadystatechange = () => {
          var o;
          (n.readyState === 3 &&
            ((o = this._opts.cookieJar) === null ||
              o === void 0 ||
              o.parseCookies(n.getResponseHeader("set-cookie"))),
            n.readyState === 4 &&
              (n.status === 200 || n.status === 1223
                ? this._onLoad()
                : this.setTimeoutFn(() => {
                    this._onError(typeof n.status == "number" ? n.status : 0);
                  }, 0)));
        }),
        n.send(this._data));
    } catch (o) {
      this.setTimeoutFn(() => {
        this._onError(o);
      }, 0);
      return;
    }
    typeof document < "u" &&
      ((this._index = re.requestsCount++), (re.requests[this._index] = this));
  }
  _onError(t) {
    (this.emitReserved("error", t, this._xhr), this._cleanup(!0));
  }
  _cleanup(t) {
    if (!(typeof this._xhr > "u" || this._xhr === null)) {
      if (((this._xhr.onreadystatechange = kd), t))
        try {
          this._xhr.abort();
        } catch {}
      (typeof document < "u" && delete re.requests[this._index],
        (this._xhr = null));
    }
  }
  _onLoad() {
    const t = this._xhr.responseText;
    t !== null &&
      (this.emitReserved("data", t),
      this.emitReserved("success"),
      this._cleanup());
  }
  abort() {
    this._cleanup();
  }
}
re.requestsCount = 0;
re.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function") attachEvent("onunload", ya);
  else if (typeof addEventListener == "function") {
    const i = "onpagehide" in Yt ? "pagehide" : "unload";
    addEventListener(i, ya, !1);
  }
}
function ya() {
  for (let i in re.requests)
    re.requests.hasOwnProperty(i) && re.requests[i].abort();
}
const Md = (function () {
  const i = oc({ xdomain: !1 });
  return i && i.responseType !== null;
})();
class Ld extends Sd {
  constructor(t) {
    super(t);
    const e = t && t.forceBase64;
    this.supportsBinary = Md && !e;
  }
  request(t = {}) {
    return (
      Object.assign(t, { xd: this.xd }, this.opts),
      new re(oc, this.uri(), t)
    );
  }
}
function oc(i) {
  const t = i.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!t || Pd)) return new XMLHttpRequest();
  } catch {}
  if (!t)
    try {
      return new Yt[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {}
}
const rc =
  typeof navigator < "u" &&
  typeof navigator.product == "string" &&
  navigator.product.toLowerCase() === "reactnative";
class Cd extends Do {
  get name() {
    return "websocket";
  }
  doOpen() {
    const t = this.uri(),
      e = this.opts.protocols,
      n = rc
        ? {}
        : ic(
            this.opts,
            "agent",
            "perMessageDeflate",
            "pfx",
            "key",
            "passphrase",
            "cert",
            "ca",
            "ciphers",
            "rejectUnauthorized",
            "localAddress",
            "protocolVersion",
            "origin",
            "maxPayload",
            "family",
            "checkServerIdentity",
          );
    this.opts.extraHeaders && (n.headers = this.opts.extraHeaders);
    try {
      this.ws = this.createSocket(t, e, n);
    } catch (o) {
      return this.emitReserved("error", o);
    }
    ((this.ws.binaryType = this.socket.binaryType), this.addEventListeners());
  }
  addEventListeners() {
    ((this.ws.onopen = () => {
      (this.opts.autoUnref && this.ws._socket.unref(), this.onOpen());
    }),
      (this.ws.onclose = (t) =>
        this.onClose({
          description: "websocket connection closed",
          context: t,
        })),
      (this.ws.onmessage = (t) => this.onData(t.data)),
      (this.ws.onerror = (t) => this.onError("websocket error", t)));
  }
  write(t) {
    this.writable = !1;
    for (let e = 0; e < t.length; e++) {
      const n = t[e],
        o = e === t.length - 1;
      Io(n, this.supportsBinary, (a) => {
        try {
          this.doWrite(n, a);
        } catch {}
        o &&
          ss(() => {
            ((this.writable = !0), this.emitReserved("drain"));
          }, this.setTimeoutFn);
      });
    }
  }
  doClose() {
    typeof this.ws < "u" &&
      ((this.ws.onerror = () => {}), this.ws.close(), (this.ws = null));
  }
  uri() {
    const t = this.opts.secure ? "wss" : "ws",
      e = this.query || {};
    return (
      this.opts.timestampRequests && (e[this.opts.timestampParam] = nc()),
      this.supportsBinary || (e.b64 = 1),
      this.createUri(t, e)
    );
  }
}
const Ks = Yt.WebSocket || Yt.MozWebSocket;
class Td extends Cd {
  createSocket(t, e, n) {
    return rc ? new Ks(t, e, n) : e ? new Ks(t, e) : new Ks(t);
  }
  doWrite(t, e) {
    this.ws.send(e);
  }
}
class Ed extends Do {
  get name() {
    return "webtransport";
  }
  doOpen() {
    try {
      this._transport = new WebTransport(
        this.createUri("https"),
        this.opts.transportOptions[this.name],
      );
    } catch (t) {
      return this.emitReserved("error", t);
    }
    (this._transport.closed
      .then(() => {
        this.onClose();
      })
      .catch((t) => {
        this.onError("webtransport error", t);
      }),
      this._transport.ready.then(() => {
        this._transport.createBidirectionalStream().then((t) => {
          const e = ud(Number.MAX_SAFE_INTEGER, this.socket.binaryType),
            n = t.readable.pipeThrough(e).getReader(),
            o = hd();
          (o.readable.pipeTo(t.writable),
            (this._writer = o.writable.getWriter()));
          const a = () => {
            n.read()
              .then(({ done: c, value: u }) => {
                c || (this.onPacket(u), a());
              })
              .catch((c) => {});
          };
          a();
          const l = { type: "open" };
          (this.query.sid && (l.data = `{"sid":"${this.query.sid}"}`),
            this._writer.write(l).then(() => this.onOpen()));
        });
      }));
  }
  write(t) {
    this.writable = !1;
    for (let e = 0; e < t.length; e++) {
      const n = t[e],
        o = e === t.length - 1;
      this._writer.write(n).then(() => {
        o &&
          ss(() => {
            ((this.writable = !0), this.emitReserved("drain"));
          }, this.setTimeoutFn);
      });
    }
  }
  doClose() {
    var t;
    (t = this._transport) === null || t === void 0 || t.close();
  }
}
const Ad = { websocket: Td, webtransport: Ed, polling: Ld },
  Od =
    /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
  Id = [
    "source",
    "protocol",
    "authority",
    "userInfo",
    "user",
    "password",
    "host",
    "port",
    "relative",
    "path",
    "directory",
    "file",
    "query",
    "anchor",
  ];
function go(i) {
  if (i.length > 8e3) throw "URI too long";
  const t = i,
    e = i.indexOf("["),
    n = i.indexOf("]");
  e != -1 &&
    n != -1 &&
    (i =
      i.substring(0, e) +
      i.substring(e, n).replace(/:/g, ";") +
      i.substring(n, i.length));
  let o = Od.exec(i || ""),
    a = {},
    l = 14;
  for (; l--; ) a[Id[l]] = o[l] || "";
  return (
    e != -1 &&
      n != -1 &&
      ((a.source = t),
      (a.host = a.host.substring(1, a.host.length - 1).replace(/;/g, ":")),
      (a.authority = a.authority
        .replace("[", "")
        .replace("]", "")
        .replace(/;/g, ":")),
      (a.ipv6uri = !0)),
    (a.pathNames = Bd(a, a.path)),
    (a.queryKey = Dd(a, a.query)),
    a
  );
}
function Bd(i, t) {
  const e = /\/{2,9}/g,
    n = t.replace(e, "/").split("/");
  return (
    (t.slice(0, 1) == "/" || t.length === 0) && n.splice(0, 1),
    t.slice(-1) == "/" && n.splice(n.length - 1, 1),
    n
  );
}
function Dd(i, t) {
  const e = {};
  return (
    t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function (n, o, a) {
      o && (e[o] = a);
    }),
    e
  );
}
const mo =
    typeof addEventListener == "function" &&
    typeof removeEventListener == "function",
  Nn = [];
mo &&
  addEventListener(
    "offline",
    () => {
      Nn.forEach((i) => i());
    },
    !1,
  );
class Te extends Lt {
  constructor(t, e) {
    if (
      (super(),
      (this.binaryType = fd),
      (this.writeBuffer = []),
      (this._prevBufferLen = 0),
      (this._pingInterval = -1),
      (this._pingTimeout = -1),
      (this._maxPayload = -1),
      (this._pingTimeoutTime = 1 / 0),
      t && typeof t == "object" && ((e = t), (t = null)),
      t)
    ) {
      const n = go(t);
      ((e.hostname = n.host),
        (e.secure = n.protocol === "https" || n.protocol === "wss"),
        (e.port = n.port),
        n.query && (e.query = n.query));
    } else e.host && (e.hostname = go(e.host).host);
    (os(this, e),
      (this.secure =
        e.secure != null
          ? e.secure
          : typeof location < "u" && location.protocol === "https:"),
      e.hostname && !e.port && (e.port = this.secure ? "443" : "80"),
      (this.hostname =
        e.hostname ||
        (typeof location < "u" ? location.hostname : "localhost")),
      (this.port =
        e.port ||
        (typeof location < "u" && location.port
          ? location.port
          : this.secure
            ? "443"
            : "80")),
      (this.transports = []),
      (this._transportsByName = {}),
      e.transports.forEach((n) => {
        const o = n.prototype.name;
        (this.transports.push(o), (this._transportsByName[o] = n));
      }),
      (this.opts = Object.assign(
        {
          path: "/engine.io",
          agent: !1,
          withCredentials: !1,
          upgrade: !0,
          timestampParam: "t",
          rememberUpgrade: !1,
          addTrailingSlash: !0,
          rejectUnauthorized: !0,
          perMessageDeflate: { threshold: 1024 },
          transportOptions: {},
          closeOnBeforeunload: !1,
        },
        e,
      )),
      (this.opts.path =
        this.opts.path.replace(/\/$/, "") +
        (this.opts.addTrailingSlash ? "/" : "")),
      typeof this.opts.query == "string" &&
        (this.opts.query = bd(this.opts.query)),
      mo &&
        (this.opts.closeOnBeforeunload &&
          ((this._beforeunloadEventListener = () => {
            this.transport &&
              (this.transport.removeAllListeners(), this.transport.close());
          }),
          addEventListener(
            "beforeunload",
            this._beforeunloadEventListener,
            !1,
          )),
        this.hostname !== "localhost" &&
          ((this._offlineEventListener = () => {
            this._onClose("transport close", {
              description: "network connection lost",
            });
          }),
          Nn.push(this._offlineEventListener))),
      this.opts.withCredentials && (this._cookieJar = void 0),
      this._open());
  }
  createTransport(t) {
    const e = Object.assign({}, this.opts.query);
    ((e.EIO = ec), (e.transport = t), this.id && (e.sid = this.id));
    const n = Object.assign(
      {},
      this.opts,
      {
        query: e,
        socket: this,
        hostname: this.hostname,
        secure: this.secure,
        port: this.port,
      },
      this.opts.transportOptions[t],
    );
    return new this._transportsByName[t](n);
  }
  _open() {
    if (this.transports.length === 0) {
      this.setTimeoutFn(() => {
        this.emitReserved("error", "No transports available");
      }, 0);
      return;
    }
    const t =
      this.opts.rememberUpgrade &&
      Te.priorWebsocketSuccess &&
      this.transports.indexOf("websocket") !== -1
        ? "websocket"
        : this.transports[0];
    this.readyState = "opening";
    const e = this.createTransport(t);
    (e.open(), this.setTransport(e));
  }
  setTransport(t) {
    (this.transport && this.transport.removeAllListeners(),
      (this.transport = t),
      t
        .on("drain", this._onDrain.bind(this))
        .on("packet", this._onPacket.bind(this))
        .on("error", this._onError.bind(this))
        .on("close", (e) => this._onClose("transport close", e)));
  }
  onOpen() {
    ((this.readyState = "open"),
      (Te.priorWebsocketSuccess = this.transport.name === "websocket"),
      this.emitReserved("open"),
      this.flush());
  }
  _onPacket(t) {
    if (
      this.readyState === "opening" ||
      this.readyState === "open" ||
      this.readyState === "closing"
    )
      switch (
        (this.emitReserved("packet", t), this.emitReserved("heartbeat"), t.type)
      ) {
        case "open":
          this.onHandshake(JSON.parse(t.data));
          break;
        case "ping":
          (this._sendPacket("pong"),
            this.emitReserved("ping"),
            this.emitReserved("pong"),
            this._resetPingTimeout());
          break;
        case "error":
          const e = new Error("server error");
          ((e.code = t.data), this._onError(e));
          break;
        case "message":
          (this.emitReserved("data", t.data),
            this.emitReserved("message", t.data));
          break;
      }
  }
  onHandshake(t) {
    (this.emitReserved("handshake", t),
      (this.id = t.sid),
      (this.transport.query.sid = t.sid),
      (this._pingInterval = t.pingInterval),
      (this._pingTimeout = t.pingTimeout),
      (this._maxPayload = t.maxPayload),
      this.onOpen(),
      this.readyState !== "closed" && this._resetPingTimeout());
  }
  _resetPingTimeout() {
    this.clearTimeoutFn(this._pingTimeoutTimer);
    const t = this._pingInterval + this._pingTimeout;
    ((this._pingTimeoutTime = Date.now() + t),
      (this._pingTimeoutTimer = this.setTimeoutFn(() => {
        this._onClose("ping timeout");
      }, t)),
      this.opts.autoUnref && this._pingTimeoutTimer.unref());
  }
  _onDrain() {
    (this.writeBuffer.splice(0, this._prevBufferLen),
      (this._prevBufferLen = 0),
      this.writeBuffer.length === 0
        ? this.emitReserved("drain")
        : this.flush());
  }
  flush() {
    if (
      this.readyState !== "closed" &&
      this.transport.writable &&
      !this.upgrading &&
      this.writeBuffer.length
    ) {
      const t = this._getWritablePackets();
      (this.transport.send(t),
        (this._prevBufferLen = t.length),
        this.emitReserved("flush"));
    }
  }
  _getWritablePackets() {
    if (
      !(
        this._maxPayload &&
        this.transport.name === "polling" &&
        this.writeBuffer.length > 1
      )
    )
      return this.writeBuffer;
    let e = 1;
    for (let n = 0; n < this.writeBuffer.length; n++) {
      const o = this.writeBuffer[n].data;
      if ((o && (e += _d(o)), n > 0 && e > this._maxPayload))
        return this.writeBuffer.slice(0, n);
      e += 2;
    }
    return this.writeBuffer;
  }
  _hasPingExpired() {
    if (!this._pingTimeoutTime) return !0;
    const t = Date.now() > this._pingTimeoutTime;
    return (
      t &&
        ((this._pingTimeoutTime = 0),
        ss(() => {
          this._onClose("ping timeout");
        }, this.setTimeoutFn)),
      t
    );
  }
  write(t, e, n) {
    return (this._sendPacket("message", t, e, n), this);
  }
  send(t, e, n) {
    return (this._sendPacket("message", t, e, n), this);
  }
  _sendPacket(t, e, n, o) {
    if (
      (typeof e == "function" && ((o = e), (e = void 0)),
      typeof n == "function" && ((o = n), (n = null)),
      this.readyState === "closing" || this.readyState === "closed")
    )
      return;
    ((n = n || {}), (n.compress = n.compress !== !1));
    const a = { type: t, data: e, options: n };
    (this.emitReserved("packetCreate", a),
      this.writeBuffer.push(a),
      o && this.once("flush", o),
      this.flush());
  }
  close() {
    const t = () => {
        (this._onClose("forced close"), this.transport.close());
      },
      e = () => {
        (this.off("upgrade", e), this.off("upgradeError", e), t());
      },
      n = () => {
        (this.once("upgrade", e), this.once("upgradeError", e));
      };
    return (
      (this.readyState === "opening" || this.readyState === "open") &&
        ((this.readyState = "closing"),
        this.writeBuffer.length
          ? this.once("drain", () => {
              this.upgrading ? n() : t();
            })
          : this.upgrading
            ? n()
            : t()),
      this
    );
  }
  _onError(t) {
    if (
      ((Te.priorWebsocketSuccess = !1),
      this.opts.tryAllTransports &&
        this.transports.length > 1 &&
        this.readyState === "opening")
    )
      return (this.transports.shift(), this._open());
    (this.emitReserved("error", t), this._onClose("transport error", t));
  }
  _onClose(t, e) {
    if (
      this.readyState === "opening" ||
      this.readyState === "open" ||
      this.readyState === "closing"
    ) {
      if (
        (this.clearTimeoutFn(this._pingTimeoutTimer),
        this.transport.removeAllListeners("close"),
        this.transport.close(),
        this.transport.removeAllListeners(),
        mo &&
          (this._beforeunloadEventListener &&
            removeEventListener(
              "beforeunload",
              this._beforeunloadEventListener,
              !1,
            ),
          this._offlineEventListener))
      ) {
        const n = Nn.indexOf(this._offlineEventListener);
        n !== -1 && Nn.splice(n, 1);
      }
      ((this.readyState = "closed"),
        (this.id = null),
        this.emitReserved("close", t, e),
        (this.writeBuffer = []),
        (this._prevBufferLen = 0));
    }
  }
}
Te.protocol = ec;
class Rd extends Te {
  constructor() {
    (super(...arguments), (this._upgrades = []));
  }
  onOpen() {
    if ((super.onOpen(), this.readyState === "open" && this.opts.upgrade))
      for (let t = 0; t < this._upgrades.length; t++)
        this._probe(this._upgrades[t]);
  }
  _probe(t) {
    let e = this.createTransport(t),
      n = !1;
    Te.priorWebsocketSuccess = !1;
    const o = () => {
      n ||
        (e.send([{ type: "ping", data: "probe" }]),
        e.once("packet", (m) => {
          if (!n)
            if (m.type === "pong" && m.data === "probe") {
              if (
                ((this.upgrading = !0), this.emitReserved("upgrading", e), !e)
              )
                return;
              ((Te.priorWebsocketSuccess = e.name === "websocket"),
                this.transport.pause(() => {
                  n ||
                    (this.readyState !== "closed" &&
                      (p(),
                      this.setTransport(e),
                      e.send([{ type: "upgrade" }]),
                      this.emitReserved("upgrade", e),
                      (e = null),
                      (this.upgrading = !1),
                      this.flush()));
                }));
            } else {
              const _ = new Error("probe error");
              ((_.transport = e.name), this.emitReserved("upgradeError", _));
            }
        }));
    };
    function a() {
      n || ((n = !0), p(), e.close(), (e = null));
    }
    const l = (m) => {
      const _ = new Error("probe error: " + m);
      ((_.transport = e.name), a(), this.emitReserved("upgradeError", _));
    };
    function c() {
      l("transport closed");
    }
    function u() {
      l("socket closed");
    }
    function d(m) {
      e && m.name !== e.name && a();
    }
    const p = () => {
      (e.removeListener("open", o),
        e.removeListener("error", l),
        e.removeListener("close", c),
        this.off("close", u),
        this.off("upgrading", d));
    };
    (e.once("open", o),
      e.once("error", l),
      e.once("close", c),
      this.once("close", u),
      this.once("upgrading", d),
      this._upgrades.indexOf("webtransport") !== -1 && t !== "webtransport"
        ? this.setTimeoutFn(() => {
            n || e.open();
          }, 200)
        : e.open());
  }
  onHandshake(t) {
    ((this._upgrades = this._filterUpgrades(t.upgrades)), super.onHandshake(t));
  }
  _filterUpgrades(t) {
    const e = [];
    for (let n = 0; n < t.length; n++)
      ~this.transports.indexOf(t[n]) && e.push(t[n]);
    return e;
  }
}
let zd = class extends Rd {
  constructor(t, e = {}) {
    const n = typeof t == "object" ? t : e;
    ((!n.transports || (n.transports && typeof n.transports[0] == "string")) &&
      (n.transports = (n.transports || ["polling", "websocket", "webtransport"])
        .map((o) => Ad[o])
        .filter((o) => !!o)),
      super(t, n));
  }
};
function Nd(i, t = "", e) {
  let n = i;
  ((e = e || (typeof location < "u" && location)),
    i == null && (i = e.protocol + "//" + e.host),
    typeof i == "string" &&
      (i.charAt(0) === "/" &&
        (i.charAt(1) === "/" ? (i = e.protocol + i) : (i = e.host + i)),
      /^(https?|wss?):\/\//.test(i) ||
        (typeof e < "u" ? (i = e.protocol + "//" + i) : (i = "https://" + i)),
      (n = go(i))),
    n.port ||
      (/^(http|ws)$/.test(n.protocol)
        ? (n.port = "80")
        : /^(http|ws)s$/.test(n.protocol) && (n.port = "443")),
    (n.path = n.path || "/"));
  const a = n.host.indexOf(":") !== -1 ? "[" + n.host + "]" : n.host;
  return (
    (n.id = n.protocol + "://" + a + ":" + n.port + t),
    (n.href =
      n.protocol + "://" + a + (e && e.port === n.port ? "" : ":" + n.port)),
    n
  );
}
const Fd = typeof ArrayBuffer == "function",
  Hd = (i) =>
    typeof ArrayBuffer.isView == "function"
      ? ArrayBuffer.isView(i)
      : i.buffer instanceof ArrayBuffer,
  ac = Object.prototype.toString,
  Wd =
    typeof Blob == "function" ||
    (typeof Blob < "u" && ac.call(Blob) === "[object BlobConstructor]"),
  Vd =
    typeof File == "function" ||
    (typeof File < "u" && ac.call(File) === "[object FileConstructor]");
function Ro(i) {
  return (
    (Fd && (i instanceof ArrayBuffer || Hd(i))) ||
    (Wd && i instanceof Blob) ||
    (Vd && i instanceof File)
  );
}
function Fn(i, t) {
  if (!i || typeof i != "object") return !1;
  if (Array.isArray(i)) {
    for (let e = 0, n = i.length; e < n; e++) if (Fn(i[e])) return !0;
    return !1;
  }
  if (Ro(i)) return !0;
  if (i.toJSON && typeof i.toJSON == "function" && arguments.length === 1)
    return Fn(i.toJSON(), !0);
  for (const e in i)
    if (Object.prototype.hasOwnProperty.call(i, e) && Fn(i[e])) return !0;
  return !1;
}
function Zd(i) {
  const t = [],
    e = i.data,
    n = i;
  return (
    (n.data = _o(e, t)),
    (n.attachments = t.length),
    { packet: n, buffers: t }
  );
}
function _o(i, t) {
  if (!i) return i;
  if (Ro(i)) {
    const e = { _placeholder: !0, num: t.length };
    return (t.push(i), e);
  } else if (Array.isArray(i)) {
    const e = new Array(i.length);
    for (let n = 0; n < i.length; n++) e[n] = _o(i[n], t);
    return e;
  } else if (typeof i == "object" && !(i instanceof Date)) {
    const e = {};
    for (const n in i)
      Object.prototype.hasOwnProperty.call(i, n) && (e[n] = _o(i[n], t));
    return e;
  }
  return i;
}
function jd(i, t) {
  return ((i.data = yo(i.data, t)), delete i.attachments, i);
}
function yo(i, t) {
  if (!i) return i;
  if (i && i._placeholder === !0) {
    if (typeof i.num == "number" && i.num >= 0 && i.num < t.length)
      return t[i.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(i))
    for (let e = 0; e < i.length; e++) i[e] = yo(i[e], t);
  else if (typeof i == "object")
    for (const e in i)
      Object.prototype.hasOwnProperty.call(i, e) && (i[e] = yo(i[e], t));
  return i;
}
const $d = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener",
];
var it;
(function (i) {
  ((i[(i.CONNECT = 0)] = "CONNECT"),
    (i[(i.DISCONNECT = 1)] = "DISCONNECT"),
    (i[(i.EVENT = 2)] = "EVENT"),
    (i[(i.ACK = 3)] = "ACK"),
    (i[(i.CONNECT_ERROR = 4)] = "CONNECT_ERROR"),
    (i[(i.BINARY_EVENT = 5)] = "BINARY_EVENT"),
    (i[(i.BINARY_ACK = 6)] = "BINARY_ACK"));
})(it || (it = {}));
class Ud {
  constructor(t) {
    this.replacer = t;
  }
  encode(t) {
    return (t.type === it.EVENT || t.type === it.ACK) && Fn(t)
      ? this.encodeAsBinary({
          type: t.type === it.EVENT ? it.BINARY_EVENT : it.BINARY_ACK,
          nsp: t.nsp,
          data: t.data,
          id: t.id,
        })
      : [this.encodeAsString(t)];
  }
  encodeAsString(t) {
    let e = "" + t.type;
    return (
      (t.type === it.BINARY_EVENT || t.type === it.BINARY_ACK) &&
        (e += t.attachments + "-"),
      t.nsp && t.nsp !== "/" && (e += t.nsp + ","),
      t.id != null && (e += t.id),
      t.data != null && (e += JSON.stringify(t.data, this.replacer)),
      e
    );
  }
  encodeAsBinary(t) {
    const e = Zd(t),
      n = this.encodeAsString(e.packet),
      o = e.buffers;
    return (o.unshift(n), o);
  }
}
class zo extends Lt {
  constructor(t) {
    (super(),
      (this.opts = Object.assign(
        { reviver: void 0, maxAttachments: 10 },
        typeof t == "function" ? { reviver: t } : t,
      )));
  }
  add(t) {
    let e;
    if (typeof t == "string") {
      if (this.reconstructor)
        throw new Error("got plaintext data when reconstructing a packet");
      e = this.decodeString(t);
      const n = e.type === it.BINARY_EVENT;
      n || e.type === it.BINARY_ACK
        ? ((e.type = n ? it.EVENT : it.ACK),
          (this.reconstructor = new qd(e)),
          e.attachments === 0 && super.emitReserved("decoded", e))
        : super.emitReserved("decoded", e);
    } else if (Ro(t) || t.base64)
      if (this.reconstructor)
        ((e = this.reconstructor.takeBinaryData(t)),
          e && ((this.reconstructor = null), super.emitReserved("decoded", e)));
      else throw new Error("got binary data when not reconstructing a packet");
    else throw new Error("Unknown type: " + t);
  }
  decodeString(t) {
    let e = 0;
    const n = { type: Number(t.charAt(0)) };
    if (it[n.type] === void 0) throw new Error("unknown packet type " + n.type);
    if (n.type === it.BINARY_EVENT || n.type === it.BINARY_ACK) {
      const a = e + 1;
      for (; t.charAt(++e) !== "-" && e != t.length; );
      const l = t.substring(a, e);
      if (l != Number(l) || t.charAt(e) !== "-")
        throw new Error("Illegal attachments");
      const c = Number(l);
      if (!Yd(c) || c < 0) throw new Error("Illegal attachments");
      if (c > this.opts.maxAttachments) throw new Error("too many attachments");
      n.attachments = c;
    }
    if (t.charAt(e + 1) === "/") {
      const a = e + 1;
      for (; ++e && !(t.charAt(e) === "," || e === t.length); );
      n.nsp = t.substring(a, e);
    } else n.nsp = "/";
    const o = t.charAt(e + 1);
    if (o !== "" && Number(o) == o) {
      const a = e + 1;
      for (; ++e; ) {
        const l = t.charAt(e);
        if (l == null || Number(l) != l) {
          --e;
          break;
        }
        if (e === t.length) break;
      }
      n.id = Number(t.substring(a, e + 1));
    }
    if (t.charAt(++e)) {
      const a = this.tryParse(t.substr(e));
      if (zo.isPayloadValid(n.type, a)) n.data = a;
      else throw new Error("invalid payload");
    }
    return n;
  }
  tryParse(t) {
    try {
      return JSON.parse(t, this.opts.reviver);
    } catch {
      return !1;
    }
  }
  static isPayloadValid(t, e) {
    switch (t) {
      case it.CONNECT:
        return va(e);
      case it.DISCONNECT:
        return e === void 0;
      case it.CONNECT_ERROR:
        return typeof e == "string" || va(e);
      case it.EVENT:
      case it.BINARY_EVENT:
        return (
          Array.isArray(e) &&
          (typeof e[0] == "number" ||
            (typeof e[0] == "string" && $d.indexOf(e[0]) === -1))
        );
      case it.ACK:
      case it.BINARY_ACK:
        return Array.isArray(e);
    }
  }
  destroy() {
    this.reconstructor &&
      (this.reconstructor.finishedReconstruction(),
      (this.reconstructor = null));
  }
}
class qd {
  constructor(t) {
    ((this.packet = t), (this.buffers = []), (this.reconPack = t));
  }
  takeBinaryData(t) {
    if (
      (this.buffers.push(t), this.buffers.length === this.reconPack.attachments)
    ) {
      const e = jd(this.reconPack, this.buffers);
      return (this.finishedReconstruction(), e);
    }
    return null;
  }
  finishedReconstruction() {
    ((this.reconPack = null), (this.buffers = []));
  }
}
const Yd =
  Number.isInteger ||
  function (i) {
    return typeof i == "number" && isFinite(i) && Math.floor(i) === i;
  };
function va(i) {
  return Object.prototype.toString.call(i) === "[object Object]";
}
const Gd = Object.freeze(
  Object.defineProperty(
    {
      __proto__: null,
      Decoder: zo,
      Encoder: Ud,
      get PacketType() {
        return it;
      },
    },
    Symbol.toStringTag,
    { value: "Module" },
  ),
);
function Xt(i, t, e) {
  return (
    i.on(t, e),
    function () {
      i.off(t, e);
    }
  );
}
const Kd = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  newListener: 1,
  removeListener: 1,
});
class lc extends Lt {
  constructor(t, e, n) {
    (super(),
      (this.connected = !1),
      (this.recovered = !1),
      (this.receiveBuffer = []),
      (this.sendBuffer = []),
      (this._queue = []),
      (this._queueSeq = 0),
      (this.ids = 0),
      (this.acks = {}),
      (this.flags = {}),
      (this.io = t),
      (this.nsp = e),
      n && n.auth && (this.auth = n.auth),
      (this._opts = Object.assign({}, n)),
      this.io._autoConnect && this.open());
  }
  get disconnected() {
    return !this.connected;
  }
  subEvents() {
    if (this.subs) return;
    const t = this.io;
    this.subs = [
      Xt(t, "open", this.onopen.bind(this)),
      Xt(t, "packet", this.onpacket.bind(this)),
      Xt(t, "error", this.onerror.bind(this)),
      Xt(t, "close", this.onclose.bind(this)),
    ];
  }
  get active() {
    return !!this.subs;
  }
  connect() {
    return this.connected
      ? this
      : (this.subEvents(),
        this.io._reconnecting || this.io.open(),
        this.io._readyState === "open" && this.onopen(),
        this);
  }
  open() {
    return this.connect();
  }
  send(...t) {
    return (t.unshift("message"), this.emit.apply(this, t), this);
  }
  emit(t, ...e) {
    var n, o, a;
    if (Kd.hasOwnProperty(t))
      throw new Error('"' + t.toString() + '" is a reserved event name');
    if (
      (e.unshift(t),
      this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
    )
      return (this._addToQueue(e), this);
    const l = { type: it.EVENT, data: e };
    if (
      ((l.options = {}),
      (l.options.compress = this.flags.compress !== !1),
      typeof e[e.length - 1] == "function")
    ) {
      const p = this.ids++,
        m = e.pop();
      (this._registerAckCallback(p, m), (l.id = p));
    }
    const c =
        (o =
          (n = this.io.engine) === null || n === void 0
            ? void 0
            : n.transport) === null || o === void 0
          ? void 0
          : o.writable,
      u =
        this.connected &&
        !(
          !((a = this.io.engine) === null || a === void 0) &&
          a._hasPingExpired()
        );
    return (
      (this.flags.volatile && !c) ||
        (u
          ? (this.notifyOutgoingListeners(l), this.packet(l))
          : this.sendBuffer.push(l)),
      (this.flags = {}),
      this
    );
  }
  _registerAckCallback(t, e) {
    var n;
    const o =
      (n = this.flags.timeout) !== null && n !== void 0
        ? n
        : this._opts.ackTimeout;
    if (o === void 0) {
      this.acks[t] = e;
      return;
    }
    const a = this.io.setTimeoutFn(() => {
        delete this.acks[t];
        for (let c = 0; c < this.sendBuffer.length; c++)
          this.sendBuffer[c].id === t && this.sendBuffer.splice(c, 1);
        e.call(this, new Error("operation has timed out"));
      }, o),
      l = (...c) => {
        (this.io.clearTimeoutFn(a), e.apply(this, c));
      };
    ((l.withError = !0), (this.acks[t] = l));
  }
  emitWithAck(t, ...e) {
    return new Promise((n, o) => {
      const a = (l, c) => (l ? o(l) : n(c));
      ((a.withError = !0), e.push(a), this.emit(t, ...e));
    });
  }
  _addToQueue(t) {
    let e;
    typeof t[t.length - 1] == "function" && (e = t.pop());
    const n = {
      id: this._queueSeq++,
      tryCount: 0,
      pending: !1,
      args: t,
      flags: Object.assign({ fromQueue: !0 }, this.flags),
    };
    (t.push(
      (o, ...a) => (
        this._queue[0],
        o !== null
          ? n.tryCount > this._opts.retries && (this._queue.shift(), e && e(o))
          : (this._queue.shift(), e && e(null, ...a)),
        (n.pending = !1),
        this._drainQueue()
      ),
    ),
      this._queue.push(n),
      this._drainQueue());
  }
  _drainQueue(t = !1) {
    if (!this.connected || this._queue.length === 0) return;
    const e = this._queue[0];
    (e.pending && !t) ||
      ((e.pending = !0),
      e.tryCount++,
      (this.flags = e.flags),
      this.emit.apply(this, e.args));
  }
  packet(t) {
    ((t.nsp = this.nsp), this.io._packet(t));
  }
  onopen() {
    typeof this.auth == "function"
      ? this.auth((t) => {
          this._sendConnectPacket(t);
        })
      : this._sendConnectPacket(this.auth);
  }
  _sendConnectPacket(t) {
    this.packet({
      type: it.CONNECT,
      data: this._pid
        ? Object.assign({ pid: this._pid, offset: this._lastOffset }, t)
        : t,
    });
  }
  onerror(t) {
    this.connected || this.emitReserved("connect_error", t);
  }
  onclose(t, e) {
    ((this.connected = !1),
      delete this.id,
      this.emitReserved("disconnect", t, e),
      this._clearAcks());
  }
  _clearAcks() {
    Object.keys(this.acks).forEach((t) => {
      if (!this.sendBuffer.some((n) => String(n.id) === t)) {
        const n = this.acks[t];
        (delete this.acks[t],
          n.withError &&
            n.call(this, new Error("socket has been disconnected")));
      }
    });
  }
  onpacket(t) {
    if (t.nsp === this.nsp)
      switch (t.type) {
        case it.CONNECT:
          t.data && t.data.sid
            ? this.onconnect(t.data.sid, t.data.pid)
            : this.emitReserved(
                "connect_error",
                new Error(
                  "It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)",
                ),
              );
          break;
        case it.EVENT:
        case it.BINARY_EVENT:
          this.onevent(t);
          break;
        case it.ACK:
        case it.BINARY_ACK:
          this.onack(t);
          break;
        case it.DISCONNECT:
          this.ondisconnect();
          break;
        case it.CONNECT_ERROR:
          this.destroy();
          const n = new Error(t.data.message);
          ((n.data = t.data.data), this.emitReserved("connect_error", n));
          break;
      }
  }
  onevent(t) {
    const e = t.data || [];
    (t.id != null && e.push(this.ack(t.id)),
      this.connected
        ? this.emitEvent(e)
        : this.receiveBuffer.push(Object.freeze(e)));
  }
  emitEvent(t) {
    if (this._anyListeners && this._anyListeners.length) {
      const e = this._anyListeners.slice();
      for (const n of e) n.apply(this, t);
    }
    (super.emit.apply(this, t),
      this._pid &&
        t.length &&
        typeof t[t.length - 1] == "string" &&
        (this._lastOffset = t[t.length - 1]));
  }
  ack(t) {
    const e = this;
    let n = !1;
    return function (...o) {
      n || ((n = !0), e.packet({ type: it.ACK, id: t, data: o }));
    };
  }
  onack(t) {
    const e = this.acks[t.id];
    typeof e == "function" &&
      (delete this.acks[t.id],
      e.withError && t.data.unshift(null),
      e.apply(this, t.data));
  }
  onconnect(t, e) {
    ((this.id = t),
      (this.recovered = e && this._pid === e),
      (this._pid = e),
      (this.connected = !0),
      this.emitBuffered(),
      this._drainQueue(!0),
      this.emitReserved("connect"));
  }
  emitBuffered() {
    (this.receiveBuffer.forEach((t) => this.emitEvent(t)),
      (this.receiveBuffer = []),
      this.sendBuffer.forEach((t) => {
        (this.notifyOutgoingListeners(t), this.packet(t));
      }),
      (this.sendBuffer = []));
  }
  ondisconnect() {
    (this.destroy(), this.onclose("io server disconnect"));
  }
  destroy() {
    (this.subs && (this.subs.forEach((t) => t()), (this.subs = void 0)),
      this.io._destroy(this));
  }
  disconnect() {
    return (
      this.connected && this.packet({ type: it.DISCONNECT }),
      this.destroy(),
      this.connected && this.onclose("io client disconnect"),
      this
    );
  }
  close() {
    return this.disconnect();
  }
  compress(t) {
    return ((this.flags.compress = t), this);
  }
  get volatile() {
    return ((this.flags.volatile = !0), this);
  }
  timeout(t) {
    return ((this.flags.timeout = t), this);
  }
  onAny(t) {
    return (
      (this._anyListeners = this._anyListeners || []),
      this._anyListeners.push(t),
      this
    );
  }
  prependAny(t) {
    return (
      (this._anyListeners = this._anyListeners || []),
      this._anyListeners.unshift(t),
      this
    );
  }
  offAny(t) {
    if (!this._anyListeners) return this;
    if (t) {
      const e = this._anyListeners;
      for (let n = 0; n < e.length; n++)
        if (t === e[n]) return (e.splice(n, 1), this);
    } else this._anyListeners = [];
    return this;
  }
  listenersAny() {
    return this._anyListeners || [];
  }
  onAnyOutgoing(t) {
    return (
      (this._anyOutgoingListeners = this._anyOutgoingListeners || []),
      this._anyOutgoingListeners.push(t),
      this
    );
  }
  prependAnyOutgoing(t) {
    return (
      (this._anyOutgoingListeners = this._anyOutgoingListeners || []),
      this._anyOutgoingListeners.unshift(t),
      this
    );
  }
  offAnyOutgoing(t) {
    if (!this._anyOutgoingListeners) return this;
    if (t) {
      const e = this._anyOutgoingListeners;
      for (let n = 0; n < e.length; n++)
        if (t === e[n]) return (e.splice(n, 1), this);
    } else this._anyOutgoingListeners = [];
    return this;
  }
  listenersAnyOutgoing() {
    return this._anyOutgoingListeners || [];
  }
  notifyOutgoingListeners(t) {
    if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
      const e = this._anyOutgoingListeners.slice();
      for (const n of e) n.apply(this, t.data);
    }
  }
}
function pi(i) {
  ((i = i || {}),
    (this.ms = i.min || 100),
    (this.max = i.max || 1e4),
    (this.factor = i.factor || 2),
    (this.jitter = i.jitter > 0 && i.jitter <= 1 ? i.jitter : 0),
    (this.attempts = 0));
}
pi.prototype.duration = function () {
  var i = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var t = Math.random(),
      e = Math.floor(t * this.jitter * i);
    i = (Math.floor(t * 10) & 1) == 0 ? i - e : i + e;
  }
  return Math.min(i, this.max) | 0;
};
pi.prototype.reset = function () {
  this.attempts = 0;
};
pi.prototype.setMin = function (i) {
  this.ms = i;
};
pi.prototype.setMax = function (i) {
  this.max = i;
};
pi.prototype.setJitter = function (i) {
  this.jitter = i;
};
class vo extends Lt {
  constructor(t, e) {
    var n;
    (super(),
      (this.nsps = {}),
      (this.subs = []),
      t && typeof t == "object" && ((e = t), (t = void 0)),
      (e = e || {}),
      (e.path = e.path || "/socket.io"),
      (this.opts = e),
      os(this, e),
      this.reconnection(e.reconnection !== !1),
      this.reconnectionAttempts(e.reconnectionAttempts || 1 / 0),
      this.reconnectionDelay(e.reconnectionDelay || 1e3),
      this.reconnectionDelayMax(e.reconnectionDelayMax || 5e3),
      this.randomizationFactor(
        (n = e.randomizationFactor) !== null && n !== void 0 ? n : 0.5,
      ),
      (this.backoff = new pi({
        min: this.reconnectionDelay(),
        max: this.reconnectionDelayMax(),
        jitter: this.randomizationFactor(),
      })),
      this.timeout(e.timeout == null ? 2e4 : e.timeout),
      (this._readyState = "closed"),
      (this.uri = t));
    const o = e.parser || Gd;
    ((this.encoder = new o.Encoder()),
      (this.decoder = new o.Decoder()),
      (this._autoConnect = e.autoConnect !== !1),
      this._autoConnect && this.open());
  }
  reconnection(t) {
    return arguments.length
      ? ((this._reconnection = !!t), t || (this.skipReconnect = !0), this)
      : this._reconnection;
  }
  reconnectionAttempts(t) {
    return t === void 0
      ? this._reconnectionAttempts
      : ((this._reconnectionAttempts = t), this);
  }
  reconnectionDelay(t) {
    var e;
    return t === void 0
      ? this._reconnectionDelay
      : ((this._reconnectionDelay = t),
        (e = this.backoff) === null || e === void 0 || e.setMin(t),
        this);
  }
  randomizationFactor(t) {
    var e;
    return t === void 0
      ? this._randomizationFactor
      : ((this._randomizationFactor = t),
        (e = this.backoff) === null || e === void 0 || e.setJitter(t),
        this);
  }
  reconnectionDelayMax(t) {
    var e;
    return t === void 0
      ? this._reconnectionDelayMax
      : ((this._reconnectionDelayMax = t),
        (e = this.backoff) === null || e === void 0 || e.setMax(t),
        this);
  }
  timeout(t) {
    return arguments.length ? ((this._timeout = t), this) : this._timeout;
  }
  maybeReconnectOnOpen() {
    !this._reconnecting &&
      this._reconnection &&
      this.backoff.attempts === 0 &&
      this.reconnect();
  }
  open(t) {
    if (~this._readyState.indexOf("open")) return this;
    this.engine = new zd(this.uri, this.opts);
    const e = this.engine,
      n = this;
    ((this._readyState = "opening"), (this.skipReconnect = !1));
    const o = Xt(e, "open", function () {
        (n.onopen(), t && t());
      }),
      a = (c) => {
        (this.cleanup(),
          (this._readyState = "closed"),
          this.emitReserved("error", c),
          t ? t(c) : this.maybeReconnectOnOpen());
      },
      l = Xt(e, "error", a);
    if (this._timeout !== !1) {
      const c = this._timeout,
        u = this.setTimeoutFn(() => {
          (o(), a(new Error("timeout")), e.close());
        }, c);
      (this.opts.autoUnref && u.unref(),
        this.subs.push(() => {
          this.clearTimeoutFn(u);
        }));
    }
    return (this.subs.push(o), this.subs.push(l), this);
  }
  connect(t) {
    return this.open(t);
  }
  onopen() {
    (this.cleanup(), (this._readyState = "open"), this.emitReserved("open"));
    const t = this.engine;
    this.subs.push(
      Xt(t, "ping", this.onping.bind(this)),
      Xt(t, "data", this.ondata.bind(this)),
      Xt(t, "error", this.onerror.bind(this)),
      Xt(t, "close", this.onclose.bind(this)),
      Xt(this.decoder, "decoded", this.ondecoded.bind(this)),
    );
  }
  onping() {
    this.emitReserved("ping");
  }
  ondata(t) {
    try {
      this.decoder.add(t);
    } catch (e) {
      this.onclose("parse error", e);
    }
  }
  ondecoded(t) {
    ss(() => {
      this.emitReserved("packet", t);
    }, this.setTimeoutFn);
  }
  onerror(t) {
    this.emitReserved("error", t);
  }
  socket(t, e) {
    let n = this.nsps[t];
    return (
      n
        ? this._autoConnect && !n.active && n.connect()
        : ((n = new lc(this, t, e)), (this.nsps[t] = n)),
      n
    );
  }
  _destroy(t) {
    const e = Object.keys(this.nsps);
    for (const n of e) if (this.nsps[n].active) return;
    this._close();
  }
  _packet(t) {
    const e = this.encoder.encode(t);
    for (let n = 0; n < e.length; n++) this.engine.write(e[n], t.options);
  }
  cleanup() {
    (this.subs.forEach((t) => t()),
      (this.subs.length = 0),
      this.decoder.destroy());
  }
  _close() {
    ((this.skipReconnect = !0),
      (this._reconnecting = !1),
      this.onclose("forced close"));
  }
  disconnect() {
    return this._close();
  }
  onclose(t, e) {
    var n;
    (this.cleanup(),
      (n = this.engine) === null || n === void 0 || n.close(),
      this.backoff.reset(),
      (this._readyState = "closed"),
      this.emitReserved("close", t, e),
      this._reconnection && !this.skipReconnect && this.reconnect());
  }
  reconnect() {
    if (this._reconnecting || this.skipReconnect) return this;
    const t = this;
    if (this.backoff.attempts >= this._reconnectionAttempts)
      (this.backoff.reset(),
        this.emitReserved("reconnect_failed"),
        (this._reconnecting = !1));
    else {
      const e = this.backoff.duration();
      this._reconnecting = !0;
      const n = this.setTimeoutFn(() => {
        t.skipReconnect ||
          (this.emitReserved("reconnect_attempt", t.backoff.attempts),
          !t.skipReconnect &&
            t.open((o) => {
              o
                ? ((t._reconnecting = !1),
                  t.reconnect(),
                  this.emitReserved("reconnect_error", o))
                : t.onreconnect();
            }));
      }, e);
      (this.opts.autoUnref && n.unref(),
        this.subs.push(() => {
          this.clearTimeoutFn(n);
        }));
    }
  }
  onreconnect() {
    const t = this.backoff.attempts;
    ((this._reconnecting = !1),
      this.backoff.reset(),
      this.emitReserved("reconnect", t));
  }
}
const Ti = {};
function Hn(i, t) {
  (typeof i == "object" && ((t = i), (i = void 0)), (t = t || {}));
  const e = Nd(i, t.path || "/socket.io"),
    n = e.source,
    o = e.id,
    a = e.path,
    l = Ti[o] && a in Ti[o].nsps,
    c = t.forceNew || t["force new connection"] || t.multiplex === !1 || l;
  let u;
  return (
    c ? (u = new vo(n, t)) : (Ti[o] || (Ti[o] = new vo(n, t)), (u = Ti[o])),
    e.query && !t.query && (t.query = e.queryKey),
    u.socket(e.path, t)
  );
}
Object.assign(Hn, { Manager: vo, Socket: lc, io: Hn, connect: Hn });
const Ht = "/api/v1",
  No = "polysignal_token";
function cc() {
  return localStorage.getItem(No);
}
function hc(i) {
  localStorage.setItem(No, i);
}
function uc() {
  localStorage.removeItem(No);
}
function dc() {
  return !!cc();
}
async function Xd(i, t) {
  const e = await Wt(`${Ht}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email: i, password: t }),
    skipAuth: !0,
  });
  return (e.token && hc(e.token), e);
}
async function Jd(i, t) {
  const e = await Wt(`${Ht}/auth/register`, {
    method: "POST",
    body: JSON.stringify({ email: i, password: t }),
    skipAuth: !0,
  });
  return (e.token && hc(e.token), e);
}
function ba() {
  uc();
}
async function Qd() {
  return Wt(`${Ht}/auth/me`);
}
async function Wt(i, t = {}) {
  const e = { "Content-Type": "application/json", ...t.headers };
  if (!t.skipAuth) {
    const a = cc();
    a && (e.Authorization = `Bearer ${a}`);
  }
  const n = await fetch(i, { headers: e, ...t });
  if (!n.ok) {
    n.status === 401 && uc();
    const a = await n.text().catch(() => "");
    throw new Error(`HTTP ${n.status}: ${a}`);
  }
  if (n.status === 204) return null;
  const o = await n.json();
  return o && o.ok === !0 && "data" in o ? o.data : o;
}
async function tf(i = {}) {
  const t = new URLSearchParams(i).toString();
  return Wt(`${Ht}/markets${t ? "?" + t : ""}`);
}
async function fc(i, t = "1w") {
  return Wt(`${Ht}/markets/${i}/history?interval=${t}`);
}
async function ef(i) {
  if (!i || i.length === 0) return [];
  const t = new URLSearchParams({ marketIds: i.join(",") }).toString();
  return Wt(`${Ht}/markets/signals/latest?${t}`);
}
async function nf() {
  return Wt(`${Ht}/positions`);
}
async function sf(i, t = 1e3) {
  return Wt(`${Ht}/positions/suggestion/${i}?bankroll=${t}`);
}
async function of(i) {
  return Wt(`${Ht}/positions`, { method: "POST", body: JSON.stringify(i) });
}
async function rf(i) {
  return Wt(`${Ht}/positions/${i}`, { method: "DELETE" });
}
async function af() {
  return Wt(`${Ht}/watchlist`);
}
async function lf(i) {
  return Wt(`${Ht}/watchlist/${i}`, { method: "DELETE" });
}
async function cf() {
  return Wt(`${Ht}/alerts`);
}
async function hf() {
  return Wt(`${Ht}/stats`);
}
function tn(i) {
  return (i + 0.5) | 0;
}
const Se = (i, t, e) => Math.max(Math.min(i, e), t);
function Ri(i) {
  return Se(tn(i * 2.55), 0, 255);
}
function Ee(i) {
  return Se(tn(i * 255), 0, 255);
}
function _e(i) {
  return Se(tn(i / 2.55) / 100, 0, 1);
}
function xa(i) {
  return Se(tn(i * 100), 0, 100);
}
const Ut = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    A: 10,
    B: 11,
    C: 12,
    D: 13,
    E: 14,
    F: 15,
    a: 10,
    b: 11,
    c: 12,
    d: 13,
    e: 14,
    f: 15,
  },
  bo = [..."0123456789ABCDEF"],
  uf = (i) => bo[i & 15],
  df = (i) => bo[(i & 240) >> 4] + bo[i & 15],
  kn = (i) => (i & 240) >> 4 === (i & 15),
  ff = (i) => kn(i.r) && kn(i.g) && kn(i.b) && kn(i.a);
function pf(i) {
  var t = i.length,
    e;
  return (
    i[0] === "#" &&
      (t === 4 || t === 5
        ? (e = {
            r: 255 & (Ut[i[1]] * 17),
            g: 255 & (Ut[i[2]] * 17),
            b: 255 & (Ut[i[3]] * 17),
            a: t === 5 ? Ut[i[4]] * 17 : 255,
          })
        : (t === 7 || t === 9) &&
          (e = {
            r: (Ut[i[1]] << 4) | Ut[i[2]],
            g: (Ut[i[3]] << 4) | Ut[i[4]],
            b: (Ut[i[5]] << 4) | Ut[i[6]],
            a: t === 9 ? (Ut[i[7]] << 4) | Ut[i[8]] : 255,
          })),
    e
  );
}
const gf = (i, t) => (i < 255 ? t(i) : "");
function mf(i) {
  var t = ff(i) ? uf : df;
  return i ? "#" + t(i.r) + t(i.g) + t(i.b) + gf(i.a, t) : void 0;
}
const _f =
  /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
function pc(i, t, e) {
  const n = t * Math.min(e, 1 - e),
    o = (a, l = (a + i / 30) % 12) =>
      e - n * Math.max(Math.min(l - 3, 9 - l, 1), -1);
  return [o(0), o(8), o(4)];
}
function yf(i, t, e) {
  const n = (o, a = (o + i / 60) % 6) =>
    e - e * t * Math.max(Math.min(a, 4 - a, 1), 0);
  return [n(5), n(3), n(1)];
}
function vf(i, t, e) {
  const n = pc(i, 1, 0.5);
  let o;
  for (t + e > 1 && ((o = 1 / (t + e)), (t *= o), (e *= o)), o = 0; o < 3; o++)
    ((n[o] *= 1 - t - e), (n[o] += t));
  return n;
}
function bf(i, t, e, n, o) {
  return i === o
    ? (t - e) / n + (t < e ? 6 : 0)
    : t === o
      ? (e - i) / n + 2
      : (i - t) / n + 4;
}
function Fo(i) {
  const e = i.r / 255,
    n = i.g / 255,
    o = i.b / 255,
    a = Math.max(e, n, o),
    l = Math.min(e, n, o),
    c = (a + l) / 2;
  let u, d, p;
  return (
    a !== l &&
      ((p = a - l),
      (d = c > 0.5 ? p / (2 - a - l) : p / (a + l)),
      (u = bf(e, n, o, p, a)),
      (u = u * 60 + 0.5)),
    [u | 0, d || 0, c]
  );
}
function Ho(i, t, e, n) {
  return (Array.isArray(t) ? i(t[0], t[1], t[2]) : i(t, e, n)).map(Ee);
}
function Wo(i, t, e) {
  return Ho(pc, i, t, e);
}
function xf(i, t, e) {
  return Ho(vf, i, t, e);
}
function wf(i, t, e) {
  return Ho(yf, i, t, e);
}
function gc(i) {
  return ((i % 360) + 360) % 360;
}
function Pf(i) {
  const t = _f.exec(i);
  let e = 255,
    n;
  if (!t) return;
  t[5] !== n && (e = t[6] ? Ri(+t[5]) : Ee(+t[5]));
  const o = gc(+t[2]),
    a = +t[3] / 100,
    l = +t[4] / 100;
  return (
    t[1] === "hwb"
      ? (n = xf(o, a, l))
      : t[1] === "hsv"
        ? (n = wf(o, a, l))
        : (n = Wo(o, a, l)),
    { r: n[0], g: n[1], b: n[2], a: e }
  );
}
function kf(i, t) {
  var e = Fo(i);
  ((e[0] = gc(e[0] + t)),
    (e = Wo(e)),
    (i.r = e[0]),
    (i.g = e[1]),
    (i.b = e[2]));
}
function Sf(i) {
  if (!i) return;
  const t = Fo(i),
    e = t[0],
    n = xa(t[1]),
    o = xa(t[2]);
  return i.a < 255
    ? `hsla(${e}, ${n}%, ${o}%, ${_e(i.a)})`
    : `hsl(${e}, ${n}%, ${o}%)`;
}
const wa = {
    x: "dark",
    Z: "light",
    Y: "re",
    X: "blu",
    W: "gr",
    V: "medium",
    U: "slate",
    A: "ee",
    T: "ol",
    S: "or",
    B: "ra",
    C: "lateg",
    D: "ights",
    R: "in",
    Q: "turquois",
    E: "hi",
    P: "ro",
    O: "al",
    N: "le",
    M: "de",
    L: "yello",
    F: "en",
    K: "ch",
    G: "arks",
    H: "ea",
    I: "ightg",
    J: "wh",
  },
  Pa = {
    OiceXe: "f0f8ff",
    antiquewEte: "faebd7",
    aqua: "ffff",
    aquamarRe: "7fffd4",
    azuY: "f0ffff",
    beige: "f5f5dc",
    bisque: "ffe4c4",
    black: "0",
    blanKedOmond: "ffebcd",
    Xe: "ff",
    XeviTet: "8a2be2",
    bPwn: "a52a2a",
    burlywood: "deb887",
    caMtXe: "5f9ea0",
    KartYuse: "7fff00",
    KocTate: "d2691e",
    cSO: "ff7f50",
    cSnflowerXe: "6495ed",
    cSnsilk: "fff8dc",
    crimson: "dc143c",
    cyan: "ffff",
    xXe: "8b",
    xcyan: "8b8b",
    xgTMnPd: "b8860b",
    xWay: "a9a9a9",
    xgYF: "6400",
    xgYy: "a9a9a9",
    xkhaki: "bdb76b",
    xmagFta: "8b008b",
    xTivegYF: "556b2f",
    xSange: "ff8c00",
    xScEd: "9932cc",
    xYd: "8b0000",
    xsOmon: "e9967a",
    xsHgYF: "8fbc8f",
    xUXe: "483d8b",
    xUWay: "2f4f4f",
    xUgYy: "2f4f4f",
    xQe: "ced1",
    xviTet: "9400d3",
    dAppRk: "ff1493",
    dApskyXe: "bfff",
    dimWay: "696969",
    dimgYy: "696969",
    dodgerXe: "1e90ff",
    fiYbrick: "b22222",
    flSOwEte: "fffaf0",
    foYstWAn: "228b22",
    fuKsia: "ff00ff",
    gaRsbSo: "dcdcdc",
    ghostwEte: "f8f8ff",
    gTd: "ffd700",
    gTMnPd: "daa520",
    Way: "808080",
    gYF: "8000",
    gYFLw: "adff2f",
    gYy: "808080",
    honeyMw: "f0fff0",
    hotpRk: "ff69b4",
    RdianYd: "cd5c5c",
    Rdigo: "4b0082",
    ivSy: "fffff0",
    khaki: "f0e68c",
    lavFMr: "e6e6fa",
    lavFMrXsh: "fff0f5",
    lawngYF: "7cfc00",
    NmoncEffon: "fffacd",
    ZXe: "add8e6",
    ZcSO: "f08080",
    Zcyan: "e0ffff",
    ZgTMnPdLw: "fafad2",
    ZWay: "d3d3d3",
    ZgYF: "90ee90",
    ZgYy: "d3d3d3",
    ZpRk: "ffb6c1",
    ZsOmon: "ffa07a",
    ZsHgYF: "20b2aa",
    ZskyXe: "87cefa",
    ZUWay: "778899",
    ZUgYy: "778899",
    ZstAlXe: "b0c4de",
    ZLw: "ffffe0",
    lime: "ff00",
    limegYF: "32cd32",
    lRF: "faf0e6",
    magFta: "ff00ff",
    maPon: "800000",
    VaquamarRe: "66cdaa",
    VXe: "cd",
    VScEd: "ba55d3",
    VpurpN: "9370db",
    VsHgYF: "3cb371",
    VUXe: "7b68ee",
    VsprRggYF: "fa9a",
    VQe: "48d1cc",
    VviTetYd: "c71585",
    midnightXe: "191970",
    mRtcYam: "f5fffa",
    mistyPse: "ffe4e1",
    moccasR: "ffe4b5",
    navajowEte: "ffdead",
    navy: "80",
    Tdlace: "fdf5e6",
    Tive: "808000",
    TivedBb: "6b8e23",
    Sange: "ffa500",
    SangeYd: "ff4500",
    ScEd: "da70d6",
    pOegTMnPd: "eee8aa",
    pOegYF: "98fb98",
    pOeQe: "afeeee",
    pOeviTetYd: "db7093",
    papayawEp: "ffefd5",
    pHKpuff: "ffdab9",
    peru: "cd853f",
    pRk: "ffc0cb",
    plum: "dda0dd",
    powMrXe: "b0e0e6",
    purpN: "800080",
    YbeccapurpN: "663399",
    Yd: "ff0000",
    Psybrown: "bc8f8f",
    PyOXe: "4169e1",
    saddNbPwn: "8b4513",
    sOmon: "fa8072",
    sandybPwn: "f4a460",
    sHgYF: "2e8b57",
    sHshell: "fff5ee",
    siFna: "a0522d",
    silver: "c0c0c0",
    skyXe: "87ceeb",
    UXe: "6a5acd",
    UWay: "708090",
    UgYy: "708090",
    snow: "fffafa",
    sprRggYF: "ff7f",
    stAlXe: "4682b4",
    tan: "d2b48c",
    teO: "8080",
    tEstN: "d8bfd8",
    tomato: "ff6347",
    Qe: "40e0d0",
    viTet: "ee82ee",
    JHt: "f5deb3",
    wEte: "ffffff",
    wEtesmoke: "f5f5f5",
    Lw: "ffff00",
    LwgYF: "9acd32",
  };
function Mf() {
  const i = {},
    t = Object.keys(Pa),
    e = Object.keys(wa);
  let n, o, a, l, c;
  for (n = 0; n < t.length; n++) {
    for (l = c = t[n], o = 0; o < e.length; o++)
      ((a = e[o]), (c = c.replace(a, wa[a])));
    ((a = parseInt(Pa[l], 16)),
      (i[c] = [(a >> 16) & 255, (a >> 8) & 255, a & 255]));
  }
  return i;
}
let Sn;
function Lf(i) {
  Sn || ((Sn = Mf()), (Sn.transparent = [0, 0, 0, 0]));
  const t = Sn[i.toLowerCase()];
  return t && { r: t[0], g: t[1], b: t[2], a: t.length === 4 ? t[3] : 255 };
}
const Cf =
  /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
function Tf(i) {
  const t = Cf.exec(i);
  let e = 255,
    n,
    o,
    a;
  if (t) {
    if (t[7] !== n) {
      const l = +t[7];
      e = t[8] ? Ri(l) : Se(l * 255, 0, 255);
    }
    return (
      (n = +t[1]),
      (o = +t[3]),
      (a = +t[5]),
      (n = 255 & (t[2] ? Ri(n) : Se(n, 0, 255))),
      (o = 255 & (t[4] ? Ri(o) : Se(o, 0, 255))),
      (a = 255 & (t[6] ? Ri(a) : Se(a, 0, 255))),
      { r: n, g: o, b: a, a: e }
    );
  }
}
function Ef(i) {
  return (
    i &&
    (i.a < 255
      ? `rgba(${i.r}, ${i.g}, ${i.b}, ${_e(i.a)})`
      : `rgb(${i.r}, ${i.g}, ${i.b})`)
  );
}
const Xs = (i) =>
    i <= 0.0031308 ? i * 12.92 : Math.pow(i, 1 / 2.4) * 1.055 - 0.055,
  li = (i) => (i <= 0.04045 ? i / 12.92 : Math.pow((i + 0.055) / 1.055, 2.4));
function Af(i, t, e) {
  const n = li(_e(i.r)),
    o = li(_e(i.g)),
    a = li(_e(i.b));
  return {
    r: Ee(Xs(n + e * (li(_e(t.r)) - n))),
    g: Ee(Xs(o + e * (li(_e(t.g)) - o))),
    b: Ee(Xs(a + e * (li(_e(t.b)) - a))),
    a: i.a + e * (t.a - i.a),
  };
}
function Mn(i, t, e) {
  if (i) {
    let n = Fo(i);
    ((n[t] = Math.max(0, Math.min(n[t] + n[t] * e, t === 0 ? 360 : 1))),
      (n = Wo(n)),
      (i.r = n[0]),
      (i.g = n[1]),
      (i.b = n[2]));
  }
}
function mc(i, t) {
  return i && Object.assign(t || {}, i);
}
function ka(i) {
  var t = { r: 0, g: 0, b: 0, a: 255 };
  return (
    Array.isArray(i)
      ? i.length >= 3 &&
        ((t = { r: i[0], g: i[1], b: i[2], a: 255 }),
        i.length > 3 && (t.a = Ee(i[3])))
      : ((t = mc(i, { r: 0, g: 0, b: 0, a: 1 })), (t.a = Ee(t.a))),
    t
  );
}
function Of(i) {
  return i.charAt(0) === "r" ? Tf(i) : Pf(i);
}
class $i {
  constructor(t) {
    if (t instanceof $i) return t;
    const e = typeof t;
    let n;
    (e === "object"
      ? (n = ka(t))
      : e === "string" && (n = pf(t) || Lf(t) || Of(t)),
      (this._rgb = n),
      (this._valid = !!n));
  }
  get valid() {
    return this._valid;
  }
  get rgb() {
    var t = mc(this._rgb);
    return (t && (t.a = _e(t.a)), t);
  }
  set rgb(t) {
    this._rgb = ka(t);
  }
  rgbString() {
    return this._valid ? Ef(this._rgb) : void 0;
  }
  hexString() {
    return this._valid ? mf(this._rgb) : void 0;
  }
  hslString() {
    return this._valid ? Sf(this._rgb) : void 0;
  }
  mix(t, e) {
    if (t) {
      const n = this.rgb,
        o = t.rgb;
      let a;
      const l = e === a ? 0.5 : e,
        c = 2 * l - 1,
        u = n.a - o.a,
        d = ((c * u === -1 ? c : (c + u) / (1 + c * u)) + 1) / 2;
      ((a = 1 - d),
        (n.r = 255 & (d * n.r + a * o.r + 0.5)),
        (n.g = 255 & (d * n.g + a * o.g + 0.5)),
        (n.b = 255 & (d * n.b + a * o.b + 0.5)),
        (n.a = l * n.a + (1 - l) * o.a),
        (this.rgb = n));
    }
    return this;
  }
  interpolate(t, e) {
    return (t && (this._rgb = Af(this._rgb, t._rgb, e)), this);
  }
  clone() {
    return new $i(this.rgb);
  }
  alpha(t) {
    return ((this._rgb.a = Ee(t)), this);
  }
  clearer(t) {
    const e = this._rgb;
    return ((e.a *= 1 - t), this);
  }
  greyscale() {
    const t = this._rgb,
      e = tn(t.r * 0.3 + t.g * 0.59 + t.b * 0.11);
    return ((t.r = t.g = t.b = e), this);
  }
  opaquer(t) {
    const e = this._rgb;
    return ((e.a *= 1 + t), this);
  }
  negate() {
    const t = this._rgb;
    return ((t.r = 255 - t.r), (t.g = 255 - t.g), (t.b = 255 - t.b), this);
  }
  lighten(t) {
    return (Mn(this._rgb, 2, t), this);
  }
  darken(t) {
    return (Mn(this._rgb, 2, -t), this);
  }
  saturate(t) {
    return (Mn(this._rgb, 1, t), this);
  }
  desaturate(t) {
    return (Mn(this._rgb, 1, -t), this);
  }
  rotate(t) {
    return (kf(this._rgb, t), this);
  }
}
function pe() {}
const If = (() => {
  let i = 0;
  return () => i++;
})();
function tt(i) {
  return i == null;
}
function _t(i) {
  if (Array.isArray && Array.isArray(i)) return !0;
  const t = Object.prototype.toString.call(i);
  return t.slice(0, 7) === "[object" && t.slice(-6) === "Array]";
}
function et(i) {
  return i !== null && Object.prototype.toString.call(i) === "[object Object]";
}
function wt(i) {
  return (typeof i == "number" || i instanceof Number) && isFinite(+i);
}
function Vt(i, t) {
  return wt(i) ? i : t;
}
function q(i, t) {
  return typeof i > "u" ? t : i;
}
const Bf = (i, t) =>
    typeof i == "string" && i.endsWith("%") ? parseFloat(i) / 100 : +i / t,
  _c = (i, t) =>
    typeof i == "string" && i.endsWith("%") ? (parseFloat(i) / 100) * t : +i;
function ft(i, t, e) {
  if (i && typeof i.call == "function") return i.apply(e, t);
}
function ht(i, t, e, n) {
  let o, a, l;
  if (_t(i)) for (a = i.length, o = 0; o < a; o++) t.call(e, i[o], o);
  else if (et(i))
    for (l = Object.keys(i), a = l.length, o = 0; o < a; o++)
      t.call(e, i[l[o]], l[o]);
}
function Zn(i, t) {
  let e, n, o, a;
  if (!i || !t || i.length !== t.length) return !1;
  for (e = 0, n = i.length; e < n; ++e)
    if (
      ((o = i[e]),
      (a = t[e]),
      o.datasetIndex !== a.datasetIndex || o.index !== a.index)
    )
      return !1;
  return !0;
}
function jn(i) {
  if (_t(i)) return i.map(jn);
  if (et(i)) {
    const t = Object.create(null),
      e = Object.keys(i),
      n = e.length;
    let o = 0;
    for (; o < n; ++o) t[e[o]] = jn(i[e[o]]);
    return t;
  }
  return i;
}
function yc(i) {
  return ["__proto__", "prototype", "constructor"].indexOf(i) === -1;
}
function Df(i, t, e, n) {
  if (!yc(i)) return;
  const o = t[i],
    a = e[i];
  et(o) && et(a) ? Ui(o, a, n) : (t[i] = jn(a));
}
function Ui(i, t, e) {
  const n = _t(t) ? t : [t],
    o = n.length;
  if (!et(i)) return i;
  e = e || {};
  const a = e.merger || Df;
  let l;
  for (let c = 0; c < o; ++c) {
    if (((l = n[c]), !et(l))) continue;
    const u = Object.keys(l);
    for (let d = 0, p = u.length; d < p; ++d) a(u[d], i, l, e);
  }
  return i;
}
function Wi(i, t) {
  return Ui(i, t, { merger: Rf });
}
function Rf(i, t, e) {
  if (!yc(i)) return;
  const n = t[i],
    o = e[i];
  et(n) && et(o)
    ? Wi(n, o)
    : Object.prototype.hasOwnProperty.call(t, i) || (t[i] = jn(o));
}
const Sa = { "": (i) => i, x: (i) => i.x, y: (i) => i.y };
function zf(i) {
  const t = i.split("."),
    e = [];
  let n = "";
  for (const o of t)
    ((n += o),
      n.endsWith("\\") ? (n = n.slice(0, -1) + ".") : (e.push(n), (n = "")));
  return e;
}
function Nf(i) {
  const t = zf(i);
  return (e) => {
    for (const n of t) {
      if (n === "") break;
      e = e && e[n];
    }
    return e;
  };
}
function Oe(i, t) {
  return (Sa[t] || (Sa[t] = Nf(t)))(i);
}
function Vo(i) {
  return i.charAt(0).toUpperCase() + i.slice(1);
}
const qi = (i) => typeof i < "u",
  Ie = (i) => typeof i == "function",
  Ma = (i, t) => {
    if (i.size !== t.size) return !1;
    for (const e of i) if (!t.has(e)) return !1;
    return !0;
  };
function Ff(i) {
  return i.type === "mouseup" || i.type === "click" || i.type === "contextmenu";
}
const lt = Math.PI,
  gt = 2 * lt,
  Hf = gt + lt,
  $n = Number.POSITIVE_INFINITY,
  Wf = lt / 180,
  kt = lt / 2,
  We = lt / 4,
  La = (lt * 2) / 3,
  Me = Math.log10,
  ae = Math.sign;
function Vi(i, t, e) {
  return Math.abs(i - t) < e;
}
function Ca(i) {
  const t = Math.round(i);
  i = Vi(i, t, i / 1e3) ? t : i;
  const e = Math.pow(10, Math.floor(Me(i))),
    n = i / e;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * e;
}
function Vf(i) {
  const t = [],
    e = Math.sqrt(i);
  let n;
  for (n = 1; n < e; n++) i % n === 0 && (t.push(n), t.push(i / n));
  return (e === (e | 0) && t.push(e), t.sort((o, a) => o - a).pop(), t);
}
function Zf(i) {
  return (
    typeof i == "symbol" ||
    (typeof i == "object" &&
      i !== null &&
      !(Symbol.toPrimitive in i || "toString" in i || "valueOf" in i))
  );
}
function ui(i) {
  return !Zf(i) && !isNaN(parseFloat(i)) && isFinite(i);
}
function jf(i, t) {
  const e = Math.round(i);
  return e - t <= i && e + t >= i;
}
function vc(i, t, e) {
  let n, o, a;
  for (n = 0, o = i.length; n < o; n++)
    ((a = i[n][e]),
      isNaN(a) || ((t.min = Math.min(t.min, a)), (t.max = Math.max(t.max, a))));
}
function Jt(i) {
  return i * (lt / 180);
}
function Zo(i) {
  return i * (180 / lt);
}
function Ta(i) {
  if (!wt(i)) return;
  let t = 1,
    e = 0;
  for (; Math.round(i * t) / t !== i; ) ((t *= 10), e++);
  return e;
}
function bc(i, t) {
  const e = t.x - i.x,
    n = t.y - i.y,
    o = Math.sqrt(e * e + n * n);
  let a = Math.atan2(n, e);
  return (a < -0.5 * lt && (a += gt), { angle: a, distance: o });
}
function xo(i, t) {
  return Math.sqrt(Math.pow(t.x - i.x, 2) + Math.pow(t.y - i.y, 2));
}
function $f(i, t) {
  return ((i - t + Hf) % gt) - lt;
}
function It(i) {
  return ((i % gt) + gt) % gt;
}
function Yi(i, t, e, n) {
  const o = It(i),
    a = It(t),
    l = It(e),
    c = It(a - o),
    u = It(l - o),
    d = It(o - a),
    p = It(o - l);
  return o === a || o === l || (n && a === l) || (c > u && d < p);
}
function Et(i, t, e) {
  return Math.max(t, Math.min(e, i));
}
function Uf(i) {
  return Et(i, -32768, 32767);
}
function ye(i, t, e, n = 1e-6) {
  return i >= Math.min(t, e) - n && i <= Math.max(t, e) + n;
}
function jo(i, t, e) {
  e = e || ((l) => i[l] < t);
  let n = i.length - 1,
    o = 0,
    a;
  for (; n - o > 1; ) ((a = (o + n) >> 1), e(a) ? (o = a) : (n = a));
  return { lo: o, hi: n };
}
const ve = (i, t, e, n) =>
    jo(
      i,
      e,
      n
        ? (o) => {
            const a = i[o][t];
            return a < e || (a === e && i[o + 1][t] === e);
          }
        : (o) => i[o][t] < e,
    ),
  qf = (i, t, e) => jo(i, e, (n) => i[n][t] >= e);
function Yf(i, t, e) {
  let n = 0,
    o = i.length;
  for (; n < o && i[n] < t; ) n++;
  for (; o > n && i[o - 1] > e; ) o--;
  return n > 0 || o < i.length ? i.slice(n, o) : i;
}
const xc = ["push", "pop", "shift", "splice", "unshift"];
function Gf(i, t) {
  if (i._chartjs) {
    i._chartjs.listeners.push(t);
    return;
  }
  (Object.defineProperty(i, "_chartjs", {
    configurable: !0,
    enumerable: !1,
    value: { listeners: [t] },
  }),
    xc.forEach((e) => {
      const n = "_onData" + Vo(e),
        o = i[e];
      Object.defineProperty(i, e, {
        configurable: !0,
        enumerable: !1,
        value(...a) {
          const l = o.apply(this, a);
          return (
            i._chartjs.listeners.forEach((c) => {
              typeof c[n] == "function" && c[n](...a);
            }),
            l
          );
        },
      });
    }));
}
function Ea(i, t) {
  const e = i._chartjs;
  if (!e) return;
  const n = e.listeners,
    o = n.indexOf(t);
  (o !== -1 && n.splice(o, 1),
    !(n.length > 0) &&
      (xc.forEach((a) => {
        delete i[a];
      }),
      delete i._chartjs));
}
function wc(i) {
  const t = new Set(i);
  return t.size === i.length ? i : Array.from(t);
}
const Pc = (function () {
  return typeof window > "u"
    ? function (i) {
        return i();
      }
    : window.requestAnimationFrame;
})();
function kc(i, t) {
  let e = [],
    n = !1;
  return function (...o) {
    ((e = o),
      n ||
        ((n = !0),
        Pc.call(window, () => {
          ((n = !1), i.apply(t, e));
        })));
  };
}
function Kf(i, t) {
  let e;
  return function (...n) {
    return (
      t ? (clearTimeout(e), (e = setTimeout(i, t, n))) : i.apply(this, n),
      t
    );
  };
}
const $o = (i) => (i === "start" ? "left" : i === "end" ? "right" : "center"),
  Ot = (i, t, e) => (i === "start" ? t : i === "end" ? e : (t + e) / 2),
  Xf = (i, t, e, n) =>
    i === (n ? "left" : "right") ? e : i === "center" ? (t + e) / 2 : t;
function Sc(i, t, e) {
  const n = t.length;
  let o = 0,
    a = n;
  if (i._sorted) {
    const { iScale: l, vScale: c, _parsed: u } = i,
      d = i.dataset && i.dataset.options ? i.dataset.options.spanGaps : null,
      p = l.axis,
      { min: m, max: _, minDefined: v, maxDefined: x } = l.getUserBounds();
    if (v) {
      if (
        ((o = Math.min(
          ve(u, p, m).lo,
          e ? n : ve(t, p, l.getPixelForValue(m)).lo,
        )),
        d)
      ) {
        const b = u
          .slice(0, o + 1)
          .reverse()
          .findIndex((w) => !tt(w[c.axis]));
        o -= Math.max(0, b);
      }
      o = Et(o, 0, n - 1);
    }
    if (x) {
      let b = Math.max(
        ve(u, l.axis, _, !0).hi + 1,
        e ? 0 : ve(t, p, l.getPixelForValue(_), !0).hi + 1,
      );
      if (d) {
        const w = u.slice(b - 1).findIndex((k) => !tt(k[c.axis]));
        b += Math.max(0, w);
      }
      a = Et(b, o, n) - o;
    } else a = n - o;
  }
  return { start: o, count: a };
}
function Mc(i) {
  const { xScale: t, yScale: e, _scaleRanges: n } = i,
    o = { xmin: t.min, xmax: t.max, ymin: e.min, ymax: e.max };
  if (!n) return ((i._scaleRanges = o), !0);
  const a =
    n.xmin !== t.min ||
    n.xmax !== t.max ||
    n.ymin !== e.min ||
    n.ymax !== e.max;
  return (Object.assign(n, o), a);
}
const Ln = (i) => i === 0 || i === 1,
  Aa = (i, t, e) =>
    -(Math.pow(2, 10 * (i -= 1)) * Math.sin(((i - t) * gt) / e)),
  Oa = (i, t, e) => Math.pow(2, -10 * i) * Math.sin(((i - t) * gt) / e) + 1,
  Zi = {
    linear: (i) => i,
    easeInQuad: (i) => i * i,
    easeOutQuad: (i) => -i * (i - 2),
    easeInOutQuad: (i) =>
      (i /= 0.5) < 1 ? 0.5 * i * i : -0.5 * (--i * (i - 2) - 1),
    easeInCubic: (i) => i * i * i,
    easeOutCubic: (i) => (i -= 1) * i * i + 1,
    easeInOutCubic: (i) =>
      (i /= 0.5) < 1 ? 0.5 * i * i * i : 0.5 * ((i -= 2) * i * i + 2),
    easeInQuart: (i) => i * i * i * i,
    easeOutQuart: (i) => -((i -= 1) * i * i * i - 1),
    easeInOutQuart: (i) =>
      (i /= 0.5) < 1 ? 0.5 * i * i * i * i : -0.5 * ((i -= 2) * i * i * i - 2),
    easeInQuint: (i) => i * i * i * i * i,
    easeOutQuint: (i) => (i -= 1) * i * i * i * i + 1,
    easeInOutQuint: (i) =>
      (i /= 0.5) < 1
        ? 0.5 * i * i * i * i * i
        : 0.5 * ((i -= 2) * i * i * i * i + 2),
    easeInSine: (i) => -Math.cos(i * kt) + 1,
    easeOutSine: (i) => Math.sin(i * kt),
    easeInOutSine: (i) => -0.5 * (Math.cos(lt * i) - 1),
    easeInExpo: (i) => (i === 0 ? 0 : Math.pow(2, 10 * (i - 1))),
    easeOutExpo: (i) => (i === 1 ? 1 : -Math.pow(2, -10 * i) + 1),
    easeInOutExpo: (i) =>
      Ln(i)
        ? i
        : i < 0.5
          ? 0.5 * Math.pow(2, 10 * (i * 2 - 1))
          : 0.5 * (-Math.pow(2, -10 * (i * 2 - 1)) + 2),
    easeInCirc: (i) => (i >= 1 ? i : -(Math.sqrt(1 - i * i) - 1)),
    easeOutCirc: (i) => Math.sqrt(1 - (i -= 1) * i),
    easeInOutCirc: (i) =>
      (i /= 0.5) < 1
        ? -0.5 * (Math.sqrt(1 - i * i) - 1)
        : 0.5 * (Math.sqrt(1 - (i -= 2) * i) + 1),
    easeInElastic: (i) => (Ln(i) ? i : Aa(i, 0.075, 0.3)),
    easeOutElastic: (i) => (Ln(i) ? i : Oa(i, 0.075, 0.3)),
    easeInOutElastic(i) {
      return Ln(i)
        ? i
        : i < 0.5
          ? 0.5 * Aa(i * 2, 0.1125, 0.45)
          : 0.5 + 0.5 * Oa(i * 2 - 1, 0.1125, 0.45);
    },
    easeInBack(i) {
      return i * i * ((1.70158 + 1) * i - 1.70158);
    },
    easeOutBack(i) {
      return (i -= 1) * i * ((1.70158 + 1) * i + 1.70158) + 1;
    },
    easeInOutBack(i) {
      let t = 1.70158;
      return (i /= 0.5) < 1
        ? 0.5 * (i * i * (((t *= 1.525) + 1) * i - t))
        : 0.5 * ((i -= 2) * i * (((t *= 1.525) + 1) * i + t) + 2);
    },
    easeInBounce: (i) => 1 - Zi.easeOutBounce(1 - i),
    easeOutBounce(i) {
      return i < 1 / 2.75
        ? 7.5625 * i * i
        : i < 2 / 2.75
          ? 7.5625 * (i -= 1.5 / 2.75) * i + 0.75
          : i < 2.5 / 2.75
            ? 7.5625 * (i -= 2.25 / 2.75) * i + 0.9375
            : 7.5625 * (i -= 2.625 / 2.75) * i + 0.984375;
    },
    easeInOutBounce: (i) =>
      i < 0.5
        ? Zi.easeInBounce(i * 2) * 0.5
        : Zi.easeOutBounce(i * 2 - 1) * 0.5 + 0.5,
  };
function Uo(i) {
  if (i && typeof i == "object") {
    const t = i.toString();
    return t === "[object CanvasPattern]" || t === "[object CanvasGradient]";
  }
  return !1;
}
function Ia(i) {
  return Uo(i) ? i : new $i(i);
}
function Js(i) {
  return Uo(i) ? i : new $i(i).saturate(0.5).darken(0.1).hexString();
}
const Jf = ["x", "y", "borderWidth", "radius", "tension"],
  Qf = ["color", "borderColor", "backgroundColor"];
function tp(i) {
  (i.set("animation", {
    delay: void 0,
    duration: 1e3,
    easing: "easeOutQuart",
    fn: void 0,
    from: void 0,
    loop: void 0,
    to: void 0,
    type: void 0,
  }),
    i.describe("animation", {
      _fallback: !1,
      _indexable: !1,
      _scriptable: (t) =>
        t !== "onProgress" && t !== "onComplete" && t !== "fn",
    }),
    i.set("animations", {
      colors: { type: "color", properties: Qf },
      numbers: { type: "number", properties: Jf },
    }),
    i.describe("animations", { _fallback: "animation" }),
    i.set("transitions", {
      active: { animation: { duration: 400 } },
      resize: { animation: { duration: 0 } },
      show: {
        animations: {
          colors: { from: "transparent" },
          visible: { type: "boolean", duration: 0 },
        },
      },
      hide: {
        animations: {
          colors: { to: "transparent" },
          visible: { type: "boolean", easing: "linear", fn: (t) => t | 0 },
        },
      },
    }));
}
function ep(i) {
  i.set("layout", {
    autoPadding: !0,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  });
}
const Ba = new Map();
function ip(i, t) {
  t = t || {};
  const e = i + JSON.stringify(t);
  let n = Ba.get(e);
  return (n || ((n = new Intl.NumberFormat(i, t)), Ba.set(e, n)), n);
}
function en(i, t, e) {
  return ip(t, e).format(i);
}
const Lc = {
  values(i) {
    return _t(i) ? i : "" + i;
  },
  numeric(i, t, e) {
    if (i === 0) return "0";
    const n = this.chart.options.locale;
    let o,
      a = i;
    if (e.length > 1) {
      const d = Math.max(Math.abs(e[0].value), Math.abs(e[e.length - 1].value));
      ((d < 1e-4 || d > 1e15) && (o = "scientific"), (a = np(i, e)));
    }
    const l = Me(Math.abs(a)),
      c = isNaN(l) ? 1 : Math.max(Math.min(-1 * Math.floor(l), 20), 0),
      u = { notation: o, minimumFractionDigits: c, maximumFractionDigits: c };
    return (Object.assign(u, this.options.ticks.format), en(i, n, u));
  },
  logarithmic(i, t, e) {
    if (i === 0) return "0";
    const n = e[t].significand || i / Math.pow(10, Math.floor(Me(i)));
    return [1, 2, 3, 5, 10, 15].includes(n) || t > 0.8 * e.length
      ? Lc.numeric.call(this, i, t, e)
      : "";
  },
};
function np(i, t) {
  let e = t.length > 3 ? t[2].value - t[1].value : t[1].value - t[0].value;
  return (
    Math.abs(e) >= 1 && i !== Math.floor(i) && (e = i - Math.floor(i)),
    e
  );
}
var rs = { formatters: Lc };
function sp(i) {
  (i.set("scale", {
    display: !0,
    offset: !1,
    reverse: !1,
    beginAtZero: !1,
    bounds: "ticks",
    clip: !0,
    grace: 0,
    grid: {
      display: !0,
      lineWidth: 1,
      drawOnChartArea: !0,
      drawTicks: !0,
      tickLength: 8,
      tickWidth: (t, e) => e.lineWidth,
      tickColor: (t, e) => e.color,
      offset: !1,
    },
    border: { display: !0, dash: [], dashOffset: 0, width: 1 },
    title: { display: !1, text: "", padding: { top: 4, bottom: 4 } },
    ticks: {
      minRotation: 0,
      maxRotation: 50,
      mirror: !1,
      textStrokeWidth: 0,
      textStrokeColor: "",
      padding: 3,
      display: !0,
      autoSkip: !0,
      autoSkipPadding: 3,
      labelOffset: 0,
      callback: rs.formatters.values,
      minor: {},
      major: {},
      align: "center",
      crossAlign: "near",
      showLabelBackdrop: !1,
      backdropColor: "rgba(255, 255, 255, 0.75)",
      backdropPadding: 2,
    },
  }),
    i.route("scale.ticks", "color", "", "color"),
    i.route("scale.grid", "color", "", "borderColor"),
    i.route("scale.border", "color", "", "borderColor"),
    i.route("scale.title", "color", "", "color"),
    i.describe("scale", {
      _fallback: !1,
      _scriptable: (t) =>
        !t.startsWith("before") &&
        !t.startsWith("after") &&
        t !== "callback" &&
        t !== "parser",
      _indexable: (t) =>
        t !== "borderDash" && t !== "tickBorderDash" && t !== "dash",
    }),
    i.describe("scales", { _fallback: "scale" }),
    i.describe("scale.ticks", {
      _scriptable: (t) => t !== "backdropPadding" && t !== "callback",
      _indexable: (t) => t !== "backdropPadding",
    }));
}
const Ke = Object.create(null),
  wo = Object.create(null);
function ji(i, t) {
  if (!t) return i;
  const e = t.split(".");
  for (let n = 0, o = e.length; n < o; ++n) {
    const a = e[n];
    i = i[a] || (i[a] = Object.create(null));
  }
  return i;
}
function Qs(i, t, e) {
  return typeof t == "string" ? Ui(ji(i, t), e) : Ui(ji(i, ""), t);
}
class op {
  constructor(t, e) {
    ((this.animation = void 0),
      (this.backgroundColor = "rgba(0,0,0,0.1)"),
      (this.borderColor = "rgba(0,0,0,0.1)"),
      (this.color = "#666"),
      (this.datasets = {}),
      (this.devicePixelRatio = (n) => n.chart.platform.getDevicePixelRatio()),
      (this.elements = {}),
      (this.events = [
        "mousemove",
        "mouseout",
        "click",
        "touchstart",
        "touchmove",
      ]),
      (this.font = {
        family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        size: 12,
        style: "normal",
        lineHeight: 1.2,
        weight: null,
      }),
      (this.hover = {}),
      (this.hoverBackgroundColor = (n, o) => Js(o.backgroundColor)),
      (this.hoverBorderColor = (n, o) => Js(o.borderColor)),
      (this.hoverColor = (n, o) => Js(o.color)),
      (this.indexAxis = "x"),
      (this.interaction = {
        mode: "nearest",
        intersect: !0,
        includeInvisible: !1,
      }),
      (this.maintainAspectRatio = !0),
      (this.onHover = null),
      (this.onClick = null),
      (this.parsing = !0),
      (this.plugins = {}),
      (this.responsive = !0),
      (this.scale = void 0),
      (this.scales = {}),
      (this.showLine = !0),
      (this.drawActiveElementsOnTop = !0),
      this.describe(t),
      this.apply(e));
  }
  set(t, e) {
    return Qs(this, t, e);
  }
  get(t) {
    return ji(this, t);
  }
  describe(t, e) {
    return Qs(wo, t, e);
  }
  override(t, e) {
    return Qs(Ke, t, e);
  }
  route(t, e, n, o) {
    const a = ji(this, t),
      l = ji(this, n),
      c = "_" + e;
    Object.defineProperties(a, {
      [c]: { value: a[e], writable: !0 },
      [e]: {
        enumerable: !0,
        get() {
          const u = this[c],
            d = l[o];
          return et(u) ? Object.assign({}, d, u) : q(u, d);
        },
        set(u) {
          this[c] = u;
        },
      },
    });
  }
  apply(t) {
    t.forEach((e) => e(this));
  }
}
var yt = new op(
  {
    _scriptable: (i) => !i.startsWith("on"),
    _indexable: (i) => i !== "events",
    hover: { _fallback: "interaction" },
    interaction: { _scriptable: !1, _indexable: !1 },
  },
  [tp, ep, sp],
);
function rp(i) {
  return !i || tt(i.size) || tt(i.family)
    ? null
    : (i.style ? i.style + " " : "") +
        (i.weight ? i.weight + " " : "") +
        i.size +
        "px " +
        i.family;
}
function Un(i, t, e, n, o) {
  let a = t[o];
  return (
    a || ((a = t[o] = i.measureText(o).width), e.push(o)),
    a > n && (n = a),
    n
  );
}
function ap(i, t, e, n) {
  n = n || {};
  let o = (n.data = n.data || {}),
    a = (n.garbageCollect = n.garbageCollect || []);
  (n.font !== t &&
    ((o = n.data = {}), (a = n.garbageCollect = []), (n.font = t)),
    i.save(),
    (i.font = t));
  let l = 0;
  const c = e.length;
  let u, d, p, m, _;
  for (u = 0; u < c; u++)
    if (((m = e[u]), m != null && !_t(m))) l = Un(i, o, a, l, m);
    else if (_t(m))
      for (d = 0, p = m.length; d < p; d++)
        ((_ = m[d]), _ != null && !_t(_) && (l = Un(i, o, a, l, _)));
  i.restore();
  const v = a.length / 2;
  if (v > e.length) {
    for (u = 0; u < v; u++) delete o[a[u]];
    a.splice(0, v);
  }
  return l;
}
function Ve(i, t, e) {
  const n = i.currentDevicePixelRatio,
    o = e !== 0 ? Math.max(e / 2, 0.5) : 0;
  return Math.round((t - o) * n) / n + o;
}
function Da(i, t) {
  (!t && !i) ||
    ((t = t || i.getContext("2d")),
    t.save(),
    t.resetTransform(),
    t.clearRect(0, 0, i.width, i.height),
    t.restore());
}
function Po(i, t, e, n) {
  Cc(i, t, e, n, null);
}
function Cc(i, t, e, n, o) {
  let a, l, c, u, d, p, m, _;
  const v = t.pointStyle,
    x = t.rotation,
    b = t.radius;
  let w = (x || 0) * Wf;
  if (
    v &&
    typeof v == "object" &&
    ((a = v.toString()),
    a === "[object HTMLImageElement]" || a === "[object HTMLCanvasElement]")
  ) {
    (i.save(),
      i.translate(e, n),
      i.rotate(w),
      i.drawImage(v, -v.width / 2, -v.height / 2, v.width, v.height),
      i.restore());
    return;
  }
  if (!(isNaN(b) || b <= 0)) {
    switch ((i.beginPath(), v)) {
      default:
        (o ? i.ellipse(e, n, o / 2, b, 0, 0, gt) : i.arc(e, n, b, 0, gt),
          i.closePath());
        break;
      case "triangle":
        ((p = o ? o / 2 : b),
          i.moveTo(e + Math.sin(w) * p, n - Math.cos(w) * b),
          (w += La),
          i.lineTo(e + Math.sin(w) * p, n - Math.cos(w) * b),
          (w += La),
          i.lineTo(e + Math.sin(w) * p, n - Math.cos(w) * b),
          i.closePath());
        break;
      case "rectRounded":
        ((d = b * 0.516),
          (u = b - d),
          (l = Math.cos(w + We) * u),
          (m = Math.cos(w + We) * (o ? o / 2 - d : u)),
          (c = Math.sin(w + We) * u),
          (_ = Math.sin(w + We) * (o ? o / 2 - d : u)),
          i.arc(e - m, n - c, d, w - lt, w - kt),
          i.arc(e + _, n - l, d, w - kt, w),
          i.arc(e + m, n + c, d, w, w + kt),
          i.arc(e - _, n + l, d, w + kt, w + lt),
          i.closePath());
        break;
      case "rect":
        if (!x) {
          ((u = Math.SQRT1_2 * b),
            (p = o ? o / 2 : u),
            i.rect(e - p, n - u, 2 * p, 2 * u));
          break;
        }
        w += We;
      case "rectRot":
        ((m = Math.cos(w) * (o ? o / 2 : b)),
          (l = Math.cos(w) * b),
          (c = Math.sin(w) * b),
          (_ = Math.sin(w) * (o ? o / 2 : b)),
          i.moveTo(e - m, n - c),
          i.lineTo(e + _, n - l),
          i.lineTo(e + m, n + c),
          i.lineTo(e - _, n + l),
          i.closePath());
        break;
      case "crossRot":
        w += We;
      case "cross":
        ((m = Math.cos(w) * (o ? o / 2 : b)),
          (l = Math.cos(w) * b),
          (c = Math.sin(w) * b),
          (_ = Math.sin(w) * (o ? o / 2 : b)),
          i.moveTo(e - m, n - c),
          i.lineTo(e + m, n + c),
          i.moveTo(e + _, n - l),
          i.lineTo(e - _, n + l));
        break;
      case "star":
        ((m = Math.cos(w) * (o ? o / 2 : b)),
          (l = Math.cos(w) * b),
          (c = Math.sin(w) * b),
          (_ = Math.sin(w) * (o ? o / 2 : b)),
          i.moveTo(e - m, n - c),
          i.lineTo(e + m, n + c),
          i.moveTo(e + _, n - l),
          i.lineTo(e - _, n + l),
          (w += We),
          (m = Math.cos(w) * (o ? o / 2 : b)),
          (l = Math.cos(w) * b),
          (c = Math.sin(w) * b),
          (_ = Math.sin(w) * (o ? o / 2 : b)),
          i.moveTo(e - m, n - c),
          i.lineTo(e + m, n + c),
          i.moveTo(e + _, n - l),
          i.lineTo(e - _, n + l));
        break;
      case "line":
        ((l = o ? o / 2 : Math.cos(w) * b),
          (c = Math.sin(w) * b),
          i.moveTo(e - l, n - c),
          i.lineTo(e + l, n + c));
        break;
      case "dash":
        (i.moveTo(e, n),
          i.lineTo(e + Math.cos(w) * (o ? o / 2 : b), n + Math.sin(w) * b));
        break;
      case !1:
        i.closePath();
        break;
    }
    (i.fill(), t.borderWidth > 0 && i.stroke());
  }
}
function be(i, t, e) {
  return (
    (e = e || 0.5),
    !t ||
      (i &&
        i.x > t.left - e &&
        i.x < t.right + e &&
        i.y > t.top - e &&
        i.y < t.bottom + e)
  );
}
function as(i, t) {
  (i.save(),
    i.beginPath(),
    i.rect(t.left, t.top, t.right - t.left, t.bottom - t.top),
    i.clip());
}
function ls(i) {
  i.restore();
}
function lp(i, t, e, n, o) {
  if (!t) return i.lineTo(e.x, e.y);
  if (o === "middle") {
    const a = (t.x + e.x) / 2;
    (i.lineTo(a, t.y), i.lineTo(a, e.y));
  } else (o === "after") != !!n ? i.lineTo(t.x, e.y) : i.lineTo(e.x, t.y);
  i.lineTo(e.x, e.y);
}
function cp(i, t, e, n) {
  if (!t) return i.lineTo(e.x, e.y);
  i.bezierCurveTo(
    n ? t.cp1x : t.cp2x,
    n ? t.cp1y : t.cp2y,
    n ? e.cp2x : e.cp1x,
    n ? e.cp2y : e.cp1y,
    e.x,
    e.y,
  );
}
function hp(i, t) {
  (t.translation && i.translate(t.translation[0], t.translation[1]),
    tt(t.rotation) || i.rotate(t.rotation),
    t.color && (i.fillStyle = t.color),
    t.textAlign && (i.textAlign = t.textAlign),
    t.textBaseline && (i.textBaseline = t.textBaseline));
}
function up(i, t, e, n, o) {
  if (o.strikethrough || o.underline) {
    const a = i.measureText(n),
      l = t - a.actualBoundingBoxLeft,
      c = t + a.actualBoundingBoxRight,
      u = e - a.actualBoundingBoxAscent,
      d = e + a.actualBoundingBoxDescent,
      p = o.strikethrough ? (u + d) / 2 : d;
    ((i.strokeStyle = i.fillStyle),
      i.beginPath(),
      (i.lineWidth = o.decorationWidth || 2),
      i.moveTo(l, p),
      i.lineTo(c, p),
      i.stroke());
  }
}
function dp(i, t) {
  const e = i.fillStyle;
  ((i.fillStyle = t.color),
    i.fillRect(t.left, t.top, t.width, t.height),
    (i.fillStyle = e));
}
function Xe(i, t, e, n, o, a = {}) {
  const l = _t(t) ? t : [t],
    c = a.strokeWidth > 0 && a.strokeColor !== "";
  let u, d;
  for (i.save(), i.font = o.string, hp(i, a), u = 0; u < l.length; ++u)
    ((d = l[u]),
      a.backdrop && dp(i, a.backdrop),
      c &&
        (a.strokeColor && (i.strokeStyle = a.strokeColor),
        tt(a.strokeWidth) || (i.lineWidth = a.strokeWidth),
        i.strokeText(d, e, n, a.maxWidth)),
      i.fillText(d, e, n, a.maxWidth),
      up(i, e, n, d, a),
      (n += Number(o.lineHeight)));
  i.restore();
}
function Gi(i, t) {
  const { x: e, y: n, w: o, h: a, radius: l } = t;
  (i.arc(e + l.topLeft, n + l.topLeft, l.topLeft, 1.5 * lt, lt, !0),
    i.lineTo(e, n + a - l.bottomLeft),
    i.arc(e + l.bottomLeft, n + a - l.bottomLeft, l.bottomLeft, lt, kt, !0),
    i.lineTo(e + o - l.bottomRight, n + a),
    i.arc(
      e + o - l.bottomRight,
      n + a - l.bottomRight,
      l.bottomRight,
      kt,
      0,
      !0,
    ),
    i.lineTo(e + o, n + l.topRight),
    i.arc(e + o - l.topRight, n + l.topRight, l.topRight, 0, -kt, !0),
    i.lineTo(e + l.topLeft, n));
}
const fp = /^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/,
  pp = /^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;
function gp(i, t) {
  const e = ("" + i).match(fp);
  if (!e || e[1] === "normal") return t * 1.2;
  switch (((i = +e[2]), e[3])) {
    case "px":
      return i;
    case "%":
      i /= 100;
      break;
  }
  return t * i;
}
const mp = (i) => +i || 0;
function qo(i, t) {
  const e = {},
    n = et(t),
    o = n ? Object.keys(t) : t,
    a = et(i) ? (n ? (l) => q(i[l], i[t[l]]) : (l) => i[l]) : () => i;
  for (const l of o) e[l] = mp(a(l));
  return e;
}
function Tc(i) {
  return qo(i, { top: "y", right: "x", bottom: "y", left: "x" });
}
function qe(i) {
  return qo(i, ["topLeft", "topRight", "bottomLeft", "bottomRight"]);
}
function Dt(i) {
  const t = Tc(i);
  return ((t.width = t.left + t.right), (t.height = t.top + t.bottom), t);
}
function Ct(i, t) {
  ((i = i || {}), (t = t || yt.font));
  let e = q(i.size, t.size);
  typeof e == "string" && (e = parseInt(e, 10));
  let n = q(i.style, t.style);
  n &&
    !("" + n).match(pp) &&
    (console.warn('Invalid font style specified: "' + n + '"'), (n = void 0));
  const o = {
    family: q(i.family, t.family),
    lineHeight: gp(q(i.lineHeight, t.lineHeight), e),
    size: e,
    style: n,
    weight: q(i.weight, t.weight),
    string: "",
  };
  return ((o.string = rp(o)), o);
}
function zi(i, t, e, n) {
  let o, a, l;
  for (o = 0, a = i.length; o < a; ++o)
    if (((l = i[o]), l !== void 0 && l !== void 0)) return l;
}
function _p(i, t, e) {
  const { min: n, max: o } = i,
    a = _c(t, (o - n) / 2),
    l = (c, u) => (e && c === 0 ? 0 : c + u);
  return { min: l(n, -Math.abs(a)), max: l(o, a) };
}
function Be(i, t) {
  return Object.assign(Object.create(i), t);
}
function Yo(i, t = [""], e, n, o = () => i[0]) {
  const a = e || i;
  typeof n > "u" && (n = Ic("_fallback", i));
  const l = {
    [Symbol.toStringTag]: "Object",
    _cacheable: !0,
    _scopes: i,
    _rootScopes: a,
    _fallback: n,
    _getTarget: o,
    override: (c) => Yo([c, ...i], t, a, n),
  };
  return new Proxy(l, {
    deleteProperty(c, u) {
      return (delete c[u], delete c._keys, delete i[0][u], !0);
    },
    get(c, u) {
      return Ac(c, u, () => Sp(u, t, i, c));
    },
    getOwnPropertyDescriptor(c, u) {
      return Reflect.getOwnPropertyDescriptor(c._scopes[0], u);
    },
    getPrototypeOf() {
      return Reflect.getPrototypeOf(i[0]);
    },
    has(c, u) {
      return za(c).includes(u);
    },
    ownKeys(c) {
      return za(c);
    },
    set(c, u, d) {
      const p = c._storage || (c._storage = o());
      return ((c[u] = p[u] = d), delete c._keys, !0);
    },
  });
}
function di(i, t, e, n) {
  const o = {
    _cacheable: !1,
    _proxy: i,
    _context: t,
    _subProxy: e,
    _stack: new Set(),
    _descriptors: Ec(i, n),
    setContext: (a) => di(i, a, e, n),
    override: (a) => di(i.override(a), t, e, n),
  };
  return new Proxy(o, {
    deleteProperty(a, l) {
      return (delete a[l], delete i[l], !0);
    },
    get(a, l, c) {
      return Ac(a, l, () => vp(a, l, c));
    },
    getOwnPropertyDescriptor(a, l) {
      return a._descriptors.allKeys
        ? Reflect.has(i, l)
          ? { enumerable: !0, configurable: !0 }
          : void 0
        : Reflect.getOwnPropertyDescriptor(i, l);
    },
    getPrototypeOf() {
      return Reflect.getPrototypeOf(i);
    },
    has(a, l) {
      return Reflect.has(i, l);
    },
    ownKeys() {
      return Reflect.ownKeys(i);
    },
    set(a, l, c) {
      return ((i[l] = c), delete a[l], !0);
    },
  });
}
function Ec(i, t = { scriptable: !0, indexable: !0 }) {
  const {
    _scriptable: e = t.scriptable,
    _indexable: n = t.indexable,
    _allKeys: o = t.allKeys,
  } = i;
  return {
    allKeys: o,
    scriptable: e,
    indexable: n,
    isScriptable: Ie(e) ? e : () => e,
    isIndexable: Ie(n) ? n : () => n,
  };
}
const yp = (i, t) => (i ? i + Vo(t) : t),
  Go = (i, t) =>
    et(t) &&
    i !== "adapters" &&
    (Object.getPrototypeOf(t) === null || t.constructor === Object);
function Ac(i, t, e) {
  if (Object.prototype.hasOwnProperty.call(i, t) || t === "constructor")
    return i[t];
  const n = e();
  return ((i[t] = n), n);
}
function vp(i, t, e) {
  const { _proxy: n, _context: o, _subProxy: a, _descriptors: l } = i;
  let c = n[t];
  return (
    Ie(c) && l.isScriptable(t) && (c = bp(t, c, i, e)),
    _t(c) && c.length && (c = xp(t, c, i, l.isIndexable)),
    Go(t, c) && (c = di(c, o, a && a[t], l)),
    c
  );
}
function bp(i, t, e, n) {
  const { _proxy: o, _context: a, _subProxy: l, _stack: c } = e;
  if (c.has(i))
    throw new Error(
      "Recursion detected: " + Array.from(c).join("->") + "->" + i,
    );
  c.add(i);
  let u = t(a, l || n);
  return (c.delete(i), Go(i, u) && (u = Ko(o._scopes, o, i, u)), u);
}
function xp(i, t, e, n) {
  const { _proxy: o, _context: a, _subProxy: l, _descriptors: c } = e;
  if (typeof a.index < "u" && n(i)) return t[a.index % t.length];
  if (et(t[0])) {
    const u = t,
      d = o._scopes.filter((p) => p !== u);
    t = [];
    for (const p of u) {
      const m = Ko(d, o, i, p);
      t.push(di(m, a, l && l[i], c));
    }
  }
  return t;
}
function Oc(i, t, e) {
  return Ie(i) ? i(t, e) : i;
}
const wp = (i, t) => (i === !0 ? t : typeof i == "string" ? Oe(t, i) : void 0);
function Pp(i, t, e, n, o) {
  for (const a of t) {
    const l = wp(e, a);
    if (l) {
      i.add(l);
      const c = Oc(l._fallback, e, o);
      if (typeof c < "u" && c !== e && c !== n) return c;
    } else if (l === !1 && typeof n < "u" && e !== n) return null;
  }
  return !1;
}
function Ko(i, t, e, n) {
  const o = t._rootScopes,
    a = Oc(t._fallback, e, n),
    l = [...i, ...o],
    c = new Set();
  c.add(n);
  let u = Ra(c, l, e, a || e, n);
  return u === null ||
    (typeof a < "u" && a !== e && ((u = Ra(c, l, a, u, n)), u === null))
    ? !1
    : Yo(Array.from(c), [""], o, a, () => kp(t, e, n));
}
function Ra(i, t, e, n, o) {
  for (; e; ) e = Pp(i, t, e, n, o);
  return e;
}
function kp(i, t, e) {
  const n = i._getTarget();
  t in n || (n[t] = {});
  const o = n[t];
  return _t(o) && et(e) ? e : o || {};
}
function Sp(i, t, e, n) {
  let o;
  for (const a of t)
    if (((o = Ic(yp(a, i), e)), typeof o < "u"))
      return Go(i, o) ? Ko(e, n, i, o) : o;
}
function Ic(i, t) {
  for (const e of t) {
    if (!e) continue;
    const n = e[i];
    if (typeof n < "u") return n;
  }
}
function za(i) {
  let t = i._keys;
  return (t || (t = i._keys = Mp(i._scopes)), t);
}
function Mp(i) {
  const t = new Set();
  for (const e of i)
    for (const n of Object.keys(e).filter((o) => !o.startsWith("_"))) t.add(n);
  return Array.from(t);
}
function Bc(i, t, e, n) {
  const { iScale: o } = i,
    { key: a = "r" } = this._parsing,
    l = new Array(n);
  let c, u, d, p;
  for (c = 0, u = n; c < u; ++c)
    ((d = c + e), (p = t[d]), (l[c] = { r: o.parse(Oe(p, a), d) }));
  return l;
}
const Lp = Number.EPSILON || 1e-14,
  fi = (i, t) => t < i.length && !i[t].skip && i[t],
  Dc = (i) => (i === "x" ? "y" : "x");
function Cp(i, t, e, n) {
  const o = i.skip ? t : i,
    a = t,
    l = e.skip ? t : e,
    c = xo(a, o),
    u = xo(l, a);
  let d = c / (c + u),
    p = u / (c + u);
  ((d = isNaN(d) ? 0 : d), (p = isNaN(p) ? 0 : p));
  const m = n * d,
    _ = n * p;
  return {
    previous: { x: a.x - m * (l.x - o.x), y: a.y - m * (l.y - o.y) },
    next: { x: a.x + _ * (l.x - o.x), y: a.y + _ * (l.y - o.y) },
  };
}
function Tp(i, t, e) {
  const n = i.length;
  let o,
    a,
    l,
    c,
    u,
    d = fi(i, 0);
  for (let p = 0; p < n - 1; ++p)
    if (((u = d), (d = fi(i, p + 1)), !(!u || !d))) {
      if (Vi(t[p], 0, Lp)) {
        e[p] = e[p + 1] = 0;
        continue;
      }
      ((o = e[p] / t[p]),
        (a = e[p + 1] / t[p]),
        (c = Math.pow(o, 2) + Math.pow(a, 2)),
        !(c <= 9) &&
          ((l = 3 / Math.sqrt(c)),
          (e[p] = o * l * t[p]),
          (e[p + 1] = a * l * t[p])));
    }
}
function Ep(i, t, e = "x") {
  const n = Dc(e),
    o = i.length;
  let a,
    l,
    c,
    u = fi(i, 0);
  for (let d = 0; d < o; ++d) {
    if (((l = c), (c = u), (u = fi(i, d + 1)), !c)) continue;
    const p = c[e],
      m = c[n];
    (l &&
      ((a = (p - l[e]) / 3),
      (c[`cp1${e}`] = p - a),
      (c[`cp1${n}`] = m - a * t[d])),
      u &&
        ((a = (u[e] - p) / 3),
        (c[`cp2${e}`] = p + a),
        (c[`cp2${n}`] = m + a * t[d])));
  }
}
function Ap(i, t = "x") {
  const e = Dc(t),
    n = i.length,
    o = Array(n).fill(0),
    a = Array(n);
  let l,
    c,
    u,
    d = fi(i, 0);
  for (l = 0; l < n; ++l)
    if (((c = u), (u = d), (d = fi(i, l + 1)), !!u)) {
      if (d) {
        const p = d[t] - u[t];
        o[l] = p !== 0 ? (d[e] - u[e]) / p : 0;
      }
      a[l] = c
        ? d
          ? ae(o[l - 1]) !== ae(o[l])
            ? 0
            : (o[l - 1] + o[l]) / 2
          : o[l - 1]
        : o[l];
    }
  (Tp(i, o, a), Ep(i, a, t));
}
function Cn(i, t, e) {
  return Math.max(Math.min(i, e), t);
}
function Op(i, t) {
  let e,
    n,
    o,
    a,
    l,
    c = be(i[0], t);
  for (e = 0, n = i.length; e < n; ++e)
    ((l = a),
      (a = c),
      (c = e < n - 1 && be(i[e + 1], t)),
      a &&
        ((o = i[e]),
        l &&
          ((o.cp1x = Cn(o.cp1x, t.left, t.right)),
          (o.cp1y = Cn(o.cp1y, t.top, t.bottom))),
        c &&
          ((o.cp2x = Cn(o.cp2x, t.left, t.right)),
          (o.cp2y = Cn(o.cp2y, t.top, t.bottom)))));
}
function Ip(i, t, e, n, o) {
  let a, l, c, u;
  if (
    (t.spanGaps && (i = i.filter((d) => !d.skip)),
    t.cubicInterpolationMode === "monotone")
  )
    Ap(i, o);
  else {
    let d = n ? i[i.length - 1] : i[0];
    for (a = 0, l = i.length; a < l; ++a)
      ((c = i[a]),
        (u = Cp(d, c, i[Math.min(a + 1, l - (n ? 0 : 1)) % l], t.tension)),
        (c.cp1x = u.previous.x),
        (c.cp1y = u.previous.y),
        (c.cp2x = u.next.x),
        (c.cp2y = u.next.y),
        (d = c));
  }
  t.capBezierPoints && Op(i, e);
}
function Xo() {
  return typeof window < "u" && typeof document < "u";
}
function Jo(i) {
  let t = i.parentNode;
  return (t && t.toString() === "[object ShadowRoot]" && (t = t.host), t);
}
function qn(i, t, e) {
  let n;
  return (
    typeof i == "string"
      ? ((n = parseInt(i, 10)),
        i.indexOf("%") !== -1 && (n = (n / 100) * t.parentNode[e]))
      : (n = i),
    n
  );
}
const cs = (i) => i.ownerDocument.defaultView.getComputedStyle(i, null);
function Bp(i, t) {
  return cs(i).getPropertyValue(t);
}
const Dp = ["top", "right", "bottom", "left"];
function Ye(i, t, e) {
  const n = {};
  e = e ? "-" + e : "";
  for (let o = 0; o < 4; o++) {
    const a = Dp[o];
    n[a] = parseFloat(i[t + "-" + a + e]) || 0;
  }
  return ((n.width = n.left + n.right), (n.height = n.top + n.bottom), n);
}
const Rp = (i, t, e) => (i > 0 || t > 0) && (!e || !e.shadowRoot);
function zp(i, t) {
  const e = i.touches,
    n = e && e.length ? e[0] : i,
    { offsetX: o, offsetY: a } = n;
  let l = !1,
    c,
    u;
  if (Rp(o, a, i.target)) ((c = o), (u = a));
  else {
    const d = t.getBoundingClientRect();
    ((c = n.clientX - d.left), (u = n.clientY - d.top), (l = !0));
  }
  return { x: c, y: u, box: l };
}
function $e(i, t) {
  if ("native" in i) return i;
  const { canvas: e, currentDevicePixelRatio: n } = t,
    o = cs(e),
    a = o.boxSizing === "border-box",
    l = Ye(o, "padding"),
    c = Ye(o, "border", "width"),
    { x: u, y: d, box: p } = zp(i, e),
    m = l.left + (p && c.left),
    _ = l.top + (p && c.top);
  let { width: v, height: x } = t;
  return (
    a && ((v -= l.width + c.width), (x -= l.height + c.height)),
    {
      x: Math.round((((u - m) / v) * e.width) / n),
      y: Math.round((((d - _) / x) * e.height) / n),
    }
  );
}
function Np(i, t, e) {
  let n, o;
  if (t === void 0 || e === void 0) {
    const a = i && Jo(i);
    if (!a) ((t = i.clientWidth), (e = i.clientHeight));
    else {
      const l = a.getBoundingClientRect(),
        c = cs(a),
        u = Ye(c, "border", "width"),
        d = Ye(c, "padding");
      ((t = l.width - d.width - u.width),
        (e = l.height - d.height - u.height),
        (n = qn(c.maxWidth, a, "clientWidth")),
        (o = qn(c.maxHeight, a, "clientHeight")));
    }
  }
  return { width: t, height: e, maxWidth: n || $n, maxHeight: o || $n };
}
const Le = (i) => Math.round(i * 10) / 10;
function Fp(i, t, e, n) {
  const o = cs(i),
    a = Ye(o, "margin"),
    l = qn(o.maxWidth, i, "clientWidth") || $n,
    c = qn(o.maxHeight, i, "clientHeight") || $n,
    u = Np(i, t, e);
  let { width: d, height: p } = u;
  if (o.boxSizing === "content-box") {
    const _ = Ye(o, "border", "width"),
      v = Ye(o, "padding");
    ((d -= v.width + _.width), (p -= v.height + _.height));
  }
  return (
    (d = Math.max(0, d - a.width)),
    (p = Math.max(0, n ? d / n : p - a.height)),
    (d = Le(Math.min(d, l, u.maxWidth))),
    (p = Le(Math.min(p, c, u.maxHeight))),
    d && !p && (p = Le(d / 2)),
    (t !== void 0 || e !== void 0) &&
      n &&
      u.height &&
      p > u.height &&
      ((p = u.height), (d = Le(Math.floor(p * n)))),
    { width: d, height: p }
  );
}
function Na(i, t, e) {
  const n = t || 1,
    o = Le(i.height * n),
    a = Le(i.width * n);
  ((i.height = Le(i.height)), (i.width = Le(i.width)));
  const l = i.canvas;
  return (
    l.style &&
      (e || (!l.style.height && !l.style.width)) &&
      ((l.style.height = `${i.height}px`), (l.style.width = `${i.width}px`)),
    i.currentDevicePixelRatio !== n || l.height !== o || l.width !== a
      ? ((i.currentDevicePixelRatio = n),
        (l.height = o),
        (l.width = a),
        i.ctx.setTransform(n, 0, 0, n, 0, 0),
        !0)
      : !1
  );
}
const Hp = (function () {
  let i = !1;
  try {
    const t = {
      get passive() {
        return ((i = !0), !1);
      },
    };
    Xo() &&
      (window.addEventListener("test", null, t),
      window.removeEventListener("test", null, t));
  } catch {}
  return i;
})();
function Fa(i, t) {
  const e = Bp(i, t),
    n = e && e.match(/^(\d+)(\.\d+)?px$/);
  return n ? +n[1] : void 0;
}
function Ue(i, t, e, n) {
  return { x: i.x + e * (t.x - i.x), y: i.y + e * (t.y - i.y) };
}
function Wp(i, t, e, n) {
  return {
    x: i.x + e * (t.x - i.x),
    y:
      n === "middle"
        ? e < 0.5
          ? i.y
          : t.y
        : n === "after"
          ? e < 1
            ? i.y
            : t.y
          : e > 0
            ? t.y
            : i.y,
  };
}
function Vp(i, t, e, n) {
  const o = { x: i.cp2x, y: i.cp2y },
    a = { x: t.cp1x, y: t.cp1y },
    l = Ue(i, o, e),
    c = Ue(o, a, e),
    u = Ue(a, t, e),
    d = Ue(l, c, e),
    p = Ue(c, u, e);
  return Ue(d, p, e);
}
const Zp = function (i, t) {
    return {
      x(e) {
        return i + i + t - e;
      },
      setWidth(e) {
        t = e;
      },
      textAlign(e) {
        return e === "center" ? e : e === "right" ? "left" : "right";
      },
      xPlus(e, n) {
        return e - n;
      },
      leftForLtr(e, n) {
        return e - n;
      },
    };
  },
  jp = function () {
    return {
      x(i) {
        return i;
      },
      setWidth(i) {},
      textAlign(i) {
        return i;
      },
      xPlus(i, t) {
        return i + t;
      },
      leftForLtr(i, t) {
        return i;
      },
    };
  };
function hi(i, t, e) {
  return i ? Zp(t, e) : jp();
}
function Rc(i, t) {
  let e, n;
  (t === "ltr" || t === "rtl") &&
    ((e = i.canvas.style),
    (n = [e.getPropertyValue("direction"), e.getPropertyPriority("direction")]),
    e.setProperty("direction", t, "important"),
    (i.prevTextDirection = n));
}
function zc(i, t) {
  t !== void 0 &&
    (delete i.prevTextDirection,
    i.canvas.style.setProperty("direction", t[0], t[1]));
}
function Nc(i) {
  return i === "angle"
    ? { between: Yi, compare: $f, normalize: It }
    : { between: ye, compare: (t, e) => t - e, normalize: (t) => t };
}
function Ha({ start: i, end: t, count: e, loop: n, style: o }) {
  return {
    start: i % e,
    end: t % e,
    loop: n && (t - i + 1) % e === 0,
    style: o,
  };
}
function $p(i, t, e) {
  const { property: n, start: o, end: a } = e,
    { between: l, normalize: c } = Nc(n),
    u = t.length;
  let { start: d, end: p, loop: m } = i,
    _,
    v;
  if (m) {
    for (d += u, p += u, _ = 0, v = u; _ < v && l(c(t[d % u][n]), o, a); ++_)
      (d--, p--);
    ((d %= u), (p %= u));
  }
  return (p < d && (p += u), { start: d, end: p, loop: m, style: i.style });
}
function Fc(i, t, e) {
  if (!e) return [i];
  const { property: n, start: o, end: a } = e,
    l = t.length,
    { compare: c, between: u, normalize: d } = Nc(n),
    { start: p, end: m, loop: _, style: v } = $p(i, t, e),
    x = [];
  let b = !1,
    w = null,
    k,
    C,
    E;
  const A = () => u(o, E, k) && c(o, E) !== 0,
    T = () => c(a, k) === 0 || u(a, E, k),
    B = () => b || A(),
    D = () => !b || T();
  for (let R = p, H = p; R <= m; ++R)
    ((C = t[R % l]),
      !C.skip &&
        ((k = d(C[n])),
        k !== E &&
          ((b = u(k, o, a)),
          w === null && B() && (w = c(k, o) === 0 ? R : H),
          w !== null &&
            D() &&
            (x.push(Ha({ start: w, end: R, loop: _, count: l, style: v })),
            (w = null)),
          (H = R),
          (E = k))));
  return (
    w !== null && x.push(Ha({ start: w, end: m, loop: _, count: l, style: v })),
    x
  );
}
function Hc(i, t) {
  const e = [],
    n = i.segments;
  for (let o = 0; o < n.length; o++) {
    const a = Fc(n[o], i.points, t);
    a.length && e.push(...a);
  }
  return e;
}
function Up(i, t, e, n) {
  let o = 0,
    a = t - 1;
  if (e && !n) for (; o < t && !i[o].skip; ) o++;
  for (; o < t && i[o].skip; ) o++;
  for (o %= t, e && (a += o); a > o && i[a % t].skip; ) a--;
  return ((a %= t), { start: o, end: a });
}
function qp(i, t, e, n) {
  const o = i.length,
    a = [];
  let l = t,
    c = i[t],
    u;
  for (u = t + 1; u <= e; ++u) {
    const d = i[u % o];
    (d.skip || d.stop
      ? c.skip ||
        ((n = !1),
        a.push({ start: t % o, end: (u - 1) % o, loop: n }),
        (t = l = d.stop ? u : null))
      : ((l = u), c.skip && (t = u)),
      (c = d));
  }
  return (l !== null && a.push({ start: t % o, end: l % o, loop: n }), a);
}
function Yp(i, t) {
  const e = i.points,
    n = i.options.spanGaps,
    o = e.length;
  if (!o) return [];
  const a = !!i._loop,
    { start: l, end: c } = Up(e, o, a, n);
  if (n === !0) return Wa(i, [{ start: l, end: c, loop: a }], e, t);
  const u = c < l ? c + o : c,
    d = !!i._fullLoop && l === 0 && c === o - 1;
  return Wa(i, qp(e, l, u, d), e, t);
}
function Wa(i, t, e, n) {
  return !n || !n.setContext || !e ? t : Gp(i, t, e, n);
}
function Gp(i, t, e, n) {
  const o = i._chart.getContext(),
    a = Va(i.options),
    {
      _datasetIndex: l,
      options: { spanGaps: c },
    } = i,
    u = e.length,
    d = [];
  let p = a,
    m = t[0].start,
    _ = m;
  function v(x, b, w, k) {
    const C = c ? -1 : 1;
    if (x !== b) {
      for (x += u; e[x % u].skip; ) x -= C;
      for (; e[b % u].skip; ) b += C;
      x % u !== b % u &&
        (d.push({ start: x % u, end: b % u, loop: w, style: k }),
        (p = k),
        (m = b % u));
    }
  }
  for (const x of t) {
    m = c ? m : x.start;
    let b = e[m % u],
      w;
    for (_ = m + 1; _ <= x.end; _++) {
      const k = e[_ % u];
      ((w = Va(
        n.setContext(
          Be(o, {
            type: "segment",
            p0: b,
            p1: k,
            p0DataIndex: (_ - 1) % u,
            p1DataIndex: _ % u,
            datasetIndex: l,
          }),
        ),
      )),
        Kp(w, p) && v(m, _ - 1, x.loop, p),
        (b = k),
        (p = w));
    }
    m < _ - 1 && v(m, _ - 1, x.loop, p);
  }
  return d;
}
function Va(i) {
  return {
    backgroundColor: i.backgroundColor,
    borderCapStyle: i.borderCapStyle,
    borderDash: i.borderDash,
    borderDashOffset: i.borderDashOffset,
    borderJoinStyle: i.borderJoinStyle,
    borderWidth: i.borderWidth,
    borderColor: i.borderColor,
  };
}
function Kp(i, t) {
  if (!t) return !1;
  const e = [],
    n = function (o, a) {
      return Uo(a) ? (e.includes(a) || e.push(a), e.indexOf(a)) : a;
    };
  return JSON.stringify(i, n) !== JSON.stringify(t, n);
}
function Tn(i, t, e) {
  return i.options.clip ? i[e] : t[e];
}
function Xp(i, t) {
  const { xScale: e, yScale: n } = i;
  return e && n
    ? {
        left: Tn(e, t, "left"),
        right: Tn(e, t, "right"),
        top: Tn(n, t, "top"),
        bottom: Tn(n, t, "bottom"),
      }
    : t;
}
function Wc(i, t) {
  const e = t._clip;
  if (e.disabled) return !1;
  const n = Xp(t, i.chartArea);
  return {
    left: e.left === !1 ? 0 : n.left - (e.left === !0 ? 0 : e.left),
    right: e.right === !1 ? i.width : n.right + (e.right === !0 ? 0 : e.right),
    top: e.top === !1 ? 0 : n.top - (e.top === !0 ? 0 : e.top),
    bottom:
      e.bottom === !1 ? i.height : n.bottom + (e.bottom === !0 ? 0 : e.bottom),
  };
}
class Jp {
  constructor() {
    ((this._request = null),
      (this._charts = new Map()),
      (this._running = !1),
      (this._lastDate = void 0));
  }
  _notify(t, e, n, o) {
    const a = e.listeners[o],
      l = e.duration;
    a.forEach((c) =>
      c({
        chart: t,
        initial: e.initial,
        numSteps: l,
        currentStep: Math.min(n - e.start, l),
      }),
    );
  }
  _refresh() {
    this._request ||
      ((this._running = !0),
      (this._request = Pc.call(window, () => {
        (this._update(),
          (this._request = null),
          this._running && this._refresh());
      })));
  }
  _update(t = Date.now()) {
    let e = 0;
    (this._charts.forEach((n, o) => {
      if (!n.running || !n.items.length) return;
      const a = n.items;
      let l = a.length - 1,
        c = !1,
        u;
      for (; l >= 0; --l)
        ((u = a[l]),
          u._active
            ? (u._total > n.duration && (n.duration = u._total),
              u.tick(t),
              (c = !0))
            : ((a[l] = a[a.length - 1]), a.pop()));
      (c && (o.draw(), this._notify(o, n, t, "progress")),
        a.length ||
          ((n.running = !1),
          this._notify(o, n, t, "complete"),
          (n.initial = !1)),
        (e += a.length));
    }),
      (this._lastDate = t),
      e === 0 && (this._running = !1));
  }
  _getAnims(t) {
    const e = this._charts;
    let n = e.get(t);
    return (
      n ||
        ((n = {
          running: !1,
          initial: !0,
          items: [],
          listeners: { complete: [], progress: [] },
        }),
        e.set(t, n)),
      n
    );
  }
  listen(t, e, n) {
    this._getAnims(t).listeners[e].push(n);
  }
  add(t, e) {
    !e || !e.length || this._getAnims(t).items.push(...e);
  }
  has(t) {
    return this._getAnims(t).items.length > 0;
  }
  start(t) {
    const e = this._charts.get(t);
    e &&
      ((e.running = !0),
      (e.start = Date.now()),
      (e.duration = e.items.reduce((n, o) => Math.max(n, o._duration), 0)),
      this._refresh());
  }
  running(t) {
    if (!this._running) return !1;
    const e = this._charts.get(t);
    return !(!e || !e.running || !e.items.length);
  }
  stop(t) {
    const e = this._charts.get(t);
    if (!e || !e.items.length) return;
    const n = e.items;
    let o = n.length - 1;
    for (; o >= 0; --o) n[o].cancel();
    ((e.items = []), this._notify(t, e, Date.now(), "complete"));
  }
  remove(t) {
    return this._charts.delete(t);
  }
}
var ge = new Jp();
const Za = "transparent",
  Qp = {
    boolean(i, t, e) {
      return e > 0.5 ? t : i;
    },
    color(i, t, e) {
      const n = Ia(i || Za),
        o = n.valid && Ia(t || Za);
      return o && o.valid ? o.mix(n, e).hexString() : t;
    },
    number(i, t, e) {
      return i + (t - i) * e;
    },
  };
class tg {
  constructor(t, e, n, o) {
    const a = e[n];
    o = zi([t.to, o, a, t.from]);
    const l = zi([t.from, a, o]);
    ((this._active = !0),
      (this._fn = t.fn || Qp[t.type || typeof l]),
      (this._easing = Zi[t.easing] || Zi.linear),
      (this._start = Math.floor(Date.now() + (t.delay || 0))),
      (this._duration = this._total = Math.floor(t.duration)),
      (this._loop = !!t.loop),
      (this._target = e),
      (this._prop = n),
      (this._from = l),
      (this._to = o),
      (this._promises = void 0));
  }
  active() {
    return this._active;
  }
  update(t, e, n) {
    if (this._active) {
      this._notify(!1);
      const o = this._target[this._prop],
        a = n - this._start,
        l = this._duration - a;
      ((this._start = n),
        (this._duration = Math.floor(Math.max(l, t.duration))),
        (this._total += a),
        (this._loop = !!t.loop),
        (this._to = zi([t.to, e, o, t.from])),
        (this._from = zi([t.from, o, e])));
    }
  }
  cancel() {
    this._active &&
      (this.tick(Date.now()), (this._active = !1), this._notify(!1));
  }
  tick(t) {
    const e = t - this._start,
      n = this._duration,
      o = this._prop,
      a = this._from,
      l = this._loop,
      c = this._to;
    let u;
    if (((this._active = a !== c && (l || e < n)), !this._active)) {
      ((this._target[o] = c), this._notify(!0));
      return;
    }
    if (e < 0) {
      this._target[o] = a;
      return;
    }
    ((u = (e / n) % 2),
      (u = l && u > 1 ? 2 - u : u),
      (u = this._easing(Math.min(1, Math.max(0, u)))),
      (this._target[o] = this._fn(a, c, u)));
  }
  wait() {
    const t = this._promises || (this._promises = []);
    return new Promise((e, n) => {
      t.push({ res: e, rej: n });
    });
  }
  _notify(t) {
    const e = t ? "res" : "rej",
      n = this._promises || [];
    for (let o = 0; o < n.length; o++) n[o][e]();
  }
}
class Vc {
  constructor(t, e) {
    ((this._chart = t), (this._properties = new Map()), this.configure(e));
  }
  configure(t) {
    if (!et(t)) return;
    const e = Object.keys(yt.animation),
      n = this._properties;
    Object.getOwnPropertyNames(t).forEach((o) => {
      const a = t[o];
      if (!et(a)) return;
      const l = {};
      for (const c of e) l[c] = a[c];
      ((_t(a.properties) && a.properties) || [o]).forEach((c) => {
        (c === o || !n.has(c)) && n.set(c, l);
      });
    });
  }
  _animateOptions(t, e) {
    const n = e.options,
      o = ig(t, n);
    if (!o) return [];
    const a = this._createAnimations(o, n);
    return (
      n.$shared &&
        eg(t.options.$animations, n).then(
          () => {
            t.options = n;
          },
          () => {},
        ),
      a
    );
  }
  _createAnimations(t, e) {
    const n = this._properties,
      o = [],
      a = t.$animations || (t.$animations = {}),
      l = Object.keys(e),
      c = Date.now();
    let u;
    for (u = l.length - 1; u >= 0; --u) {
      const d = l[u];
      if (d.charAt(0) === "$") continue;
      if (d === "options") {
        o.push(...this._animateOptions(t, e));
        continue;
      }
      const p = e[d];
      let m = a[d];
      const _ = n.get(d);
      if (m)
        if (_ && m.active()) {
          m.update(_, p, c);
          continue;
        } else m.cancel();
      if (!_ || !_.duration) {
        t[d] = p;
        continue;
      }
      ((a[d] = m = new tg(_, t, d, p)), o.push(m));
    }
    return o;
  }
  update(t, e) {
    if (this._properties.size === 0) {
      Object.assign(t, e);
      return;
    }
    const n = this._createAnimations(t, e);
    if (n.length) return (ge.add(this._chart, n), !0);
  }
}
function eg(i, t) {
  const e = [],
    n = Object.keys(t);
  for (let o = 0; o < n.length; o++) {
    const a = i[n[o]];
    a && a.active() && e.push(a.wait());
  }
  return Promise.all(e);
}
function ig(i, t) {
  if (!t) return;
  let e = i.options;
  if (!e) {
    i.options = t;
    return;
  }
  return (
    e.$shared &&
      (i.options = e = Object.assign({}, e, { $shared: !1, $animations: {} })),
    e
  );
}
function ja(i, t) {
  const e = (i && i.options) || {},
    n = e.reverse,
    o = e.min === void 0 ? t : 0,
    a = e.max === void 0 ? t : 0;
  return { start: n ? a : o, end: n ? o : a };
}
function ng(i, t, e) {
  if (e === !1) return !1;
  const n = ja(i, e),
    o = ja(t, e);
  return { top: o.end, right: n.end, bottom: o.start, left: n.start };
}
function sg(i) {
  let t, e, n, o;
  return (
    et(i)
      ? ((t = i.top), (e = i.right), (n = i.bottom), (o = i.left))
      : (t = e = n = o = i),
    { top: t, right: e, bottom: n, left: o, disabled: i === !1 }
  );
}
function Zc(i, t) {
  const e = [],
    n = i._getSortedDatasetMetas(t);
  let o, a;
  for (o = 0, a = n.length; o < a; ++o) e.push(n[o].index);
  return e;
}
function $a(i, t, e, n = {}) {
  const o = i.keys,
    a = n.mode === "single";
  let l, c, u, d;
  if (t === null) return;
  let p = !1;
  for (l = 0, c = o.length; l < c; ++l) {
    if (((u = +o[l]), u === e)) {
      if (((p = !0), n.all)) continue;
      break;
    }
    ((d = i.values[u]), wt(d) && (a || t === 0 || ae(t) === ae(d)) && (t += d));
  }
  return !p && !n.all ? 0 : t;
}
function og(i, t) {
  const { iScale: e, vScale: n } = t,
    o = e.axis === "x" ? "x" : "y",
    a = n.axis === "x" ? "x" : "y",
    l = Object.keys(i),
    c = new Array(l.length);
  let u, d, p;
  for (u = 0, d = l.length; u < d; ++u)
    ((p = l[u]), (c[u] = { [o]: p, [a]: i[p] }));
  return c;
}
function to(i, t) {
  const e = i && i.options.stacked;
  return e || (e === void 0 && t.stack !== void 0);
}
function rg(i, t, e) {
  return `${i.id}.${t.id}.${e.stack || e.type}`;
}
function ag(i) {
  const { min: t, max: e, minDefined: n, maxDefined: o } = i.getUserBounds();
  return {
    min: n ? t : Number.NEGATIVE_INFINITY,
    max: o ? e : Number.POSITIVE_INFINITY,
  };
}
function lg(i, t, e) {
  const n = i[t] || (i[t] = {});
  return n[e] || (n[e] = {});
}
function Ua(i, t, e, n) {
  for (const o of t.getMatchingVisibleMetas(n).reverse()) {
    const a = i[o.index];
    if ((e && a > 0) || (!e && a < 0)) return o.index;
  }
  return null;
}
function qa(i, t) {
  const { chart: e, _cachedMeta: n } = i,
    o = e._stacks || (e._stacks = {}),
    { iScale: a, vScale: l, index: c } = n,
    u = a.axis,
    d = l.axis,
    p = rg(a, l, n),
    m = t.length;
  let _;
  for (let v = 0; v < m; ++v) {
    const x = t[v],
      { [u]: b, [d]: w } = x,
      k = x._stacks || (x._stacks = {});
    ((_ = k[d] = lg(o, p, b)),
      (_[c] = w),
      (_._top = Ua(_, l, !0, n.type)),
      (_._bottom = Ua(_, l, !1, n.type)));
    const C = _._visualValues || (_._visualValues = {});
    C[c] = w;
  }
}
function eo(i, t) {
  const e = i.scales;
  return Object.keys(e)
    .filter((n) => e[n].axis === t)
    .shift();
}
function cg(i, t) {
  return Be(i, {
    active: !1,
    dataset: void 0,
    datasetIndex: t,
    index: t,
    mode: "default",
    type: "dataset",
  });
}
function hg(i, t, e) {
  return Be(i, {
    active: !1,
    dataIndex: t,
    parsed: void 0,
    raw: void 0,
    element: e,
    index: t,
    mode: "default",
    type: "data",
  });
}
function Ei(i, t) {
  const e = i.controller.index,
    n = i.vScale && i.vScale.axis;
  if (n) {
    t = t || i._parsed;
    for (const o of t) {
      const a = o._stacks;
      if (!a || a[n] === void 0 || a[n][e] === void 0) return;
      (delete a[n][e],
        a[n]._visualValues !== void 0 &&
          a[n]._visualValues[e] !== void 0 &&
          delete a[n]._visualValues[e]);
    }
  }
}
const io = (i) => i === "reset" || i === "none",
  Ya = (i, t) => (t ? i : Object.assign({}, i)),
  ug = (i, t, e) =>
    i && !t.hidden && t._stacked && { keys: Zc(e, !0), values: null };
class De {
  static defaults = {};
  static datasetElementType = null;
  static dataElementType = null;
  constructor(t, e) {
    ((this.chart = t),
      (this._ctx = t.ctx),
      (this.index = e),
      (this._cachedDataOpts = {}),
      (this._cachedMeta = this.getMeta()),
      (this._type = this._cachedMeta.type),
      (this.options = void 0),
      (this._parsing = !1),
      (this._data = void 0),
      (this._objectData = void 0),
      (this._sharedOptions = void 0),
      (this._drawStart = void 0),
      (this._drawCount = void 0),
      (this.enableOptionSharing = !1),
      (this.supportsDecimation = !1),
      (this.$context = void 0),
      (this._syncList = []),
      (this.datasetElementType = new.target.datasetElementType),
      (this.dataElementType = new.target.dataElementType),
      this.initialize());
  }
  initialize() {
    const t = this._cachedMeta;
    (this.configure(),
      this.linkScales(),
      (t._stacked = to(t.vScale, t)),
      this.addElements(),
      this.options.fill &&
        !this.chart.isPluginEnabled("filler") &&
        console.warn(
          "Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options",
        ));
  }
  updateIndex(t) {
    (this.index !== t && Ei(this._cachedMeta), (this.index = t));
  }
  linkScales() {
    const t = this.chart,
      e = this._cachedMeta,
      n = this.getDataset(),
      o = (m, _, v, x) => (m === "x" ? _ : m === "r" ? x : v),
      a = (e.xAxisID = q(n.xAxisID, eo(t, "x"))),
      l = (e.yAxisID = q(n.yAxisID, eo(t, "y"))),
      c = (e.rAxisID = q(n.rAxisID, eo(t, "r"))),
      u = e.indexAxis,
      d = (e.iAxisID = o(u, a, l, c)),
      p = (e.vAxisID = o(u, l, a, c));
    ((e.xScale = this.getScaleForId(a)),
      (e.yScale = this.getScaleForId(l)),
      (e.rScale = this.getScaleForId(c)),
      (e.iScale = this.getScaleForId(d)),
      (e.vScale = this.getScaleForId(p)));
  }
  getDataset() {
    return this.chart.data.datasets[this.index];
  }
  getMeta() {
    return this.chart.getDatasetMeta(this.index);
  }
  getScaleForId(t) {
    return this.chart.scales[t];
  }
  _getOtherScale(t) {
    const e = this._cachedMeta;
    return t === e.iScale ? e.vScale : e.iScale;
  }
  reset() {
    this._update("reset");
  }
  _destroy() {
    const t = this._cachedMeta;
    (this._data && Ea(this._data, this), t._stacked && Ei(t));
  }
  _dataCheck() {
    const t = this.getDataset(),
      e = t.data || (t.data = []),
      n = this._data;
    if (et(e)) {
      const o = this._cachedMeta;
      this._data = og(e, o);
    } else if (n !== e) {
      if (n) {
        Ea(n, this);
        const o = this._cachedMeta;
        (Ei(o), (o._parsed = []));
      }
      (e && Object.isExtensible(e) && Gf(e, this),
        (this._syncList = []),
        (this._data = e));
    }
  }
  addElements() {
    const t = this._cachedMeta;
    (this._dataCheck(),
      this.datasetElementType && (t.dataset = new this.datasetElementType()));
  }
  buildOrUpdateElements(t) {
    const e = this._cachedMeta,
      n = this.getDataset();
    let o = !1;
    this._dataCheck();
    const a = e._stacked;
    ((e._stacked = to(e.vScale, e)),
      e.stack !== n.stack && ((o = !0), Ei(e), (e.stack = n.stack)),
      this._resyncElements(t),
      (o || a !== e._stacked) &&
        (qa(this, e._parsed), (e._stacked = to(e.vScale, e))));
  }
  configure() {
    const t = this.chart.config,
      e = t.datasetScopeKeys(this._type),
      n = t.getOptionScopes(this.getDataset(), e, !0);
    ((this.options = t.createResolver(n, this.getContext())),
      (this._parsing = this.options.parsing),
      (this._cachedDataOpts = {}));
  }
  parse(t, e) {
    const { _cachedMeta: n, _data: o } = this,
      { iScale: a, _stacked: l } = n,
      c = a.axis;
    let u = t === 0 && e === o.length ? !0 : n._sorted,
      d = t > 0 && n._parsed[t - 1],
      p,
      m,
      _;
    if (this._parsing === !1) ((n._parsed = o), (n._sorted = !0), (_ = o));
    else {
      _t(o[t])
        ? (_ = this.parseArrayData(n, o, t, e))
        : et(o[t])
          ? (_ = this.parseObjectData(n, o, t, e))
          : (_ = this.parsePrimitiveData(n, o, t, e));
      const v = () => m[c] === null || (d && m[c] < d[c]);
      for (p = 0; p < e; ++p)
        ((n._parsed[p + t] = m = _[p]), u && (v() && (u = !1), (d = m)));
      n._sorted = u;
    }
    l && qa(this, _);
  }
  parsePrimitiveData(t, e, n, o) {
    const { iScale: a, vScale: l } = t,
      c = a.axis,
      u = l.axis,
      d = a.getLabels(),
      p = a === l,
      m = new Array(o);
    let _, v, x;
    for (_ = 0, v = o; _ < v; ++_)
      ((x = _ + n),
        (m[_] = { [c]: p || a.parse(d[x], x), [u]: l.parse(e[x], x) }));
    return m;
  }
  parseArrayData(t, e, n, o) {
    const { xScale: a, yScale: l } = t,
      c = new Array(o);
    let u, d, p, m;
    for (u = 0, d = o; u < d; ++u)
      ((p = u + n),
        (m = e[p]),
        (c[u] = { x: a.parse(m[0], p), y: l.parse(m[1], p) }));
    return c;
  }
  parseObjectData(t, e, n, o) {
    const { xScale: a, yScale: l } = t,
      { xAxisKey: c = "x", yAxisKey: u = "y" } = this._parsing,
      d = new Array(o);
    let p, m, _, v;
    for (p = 0, m = o; p < m; ++p)
      ((_ = p + n),
        (v = e[_]),
        (d[p] = { x: a.parse(Oe(v, c), _), y: l.parse(Oe(v, u), _) }));
    return d;
  }
  getParsed(t) {
    return this._cachedMeta._parsed[t];
  }
  getDataElement(t) {
    return this._cachedMeta.data[t];
  }
  applyStack(t, e, n) {
    const o = this.chart,
      a = this._cachedMeta,
      l = e[t.axis],
      c = { keys: Zc(o, !0), values: e._stacks[t.axis]._visualValues };
    return $a(c, l, a.index, { mode: n });
  }
  updateRangeFromParsed(t, e, n, o) {
    const a = n[e.axis];
    let l = a === null ? NaN : a;
    const c = o && n._stacks[e.axis];
    (o && c && ((o.values = c), (l = $a(o, a, this._cachedMeta.index))),
      (t.min = Math.min(t.min, l)),
      (t.max = Math.max(t.max, l)));
  }
  getMinMax(t, e) {
    const n = this._cachedMeta,
      o = n._parsed,
      a = n._sorted && t === n.iScale,
      l = o.length,
      c = this._getOtherScale(t),
      u = ug(e, n, this.chart),
      d = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
      { min: p, max: m } = ag(c);
    let _, v;
    function x() {
      v = o[_];
      const b = v[c.axis];
      return !wt(v[t.axis]) || p > b || m < b;
    }
    for (
      _ = 0;
      _ < l && !(!x() && (this.updateRangeFromParsed(d, t, v, u), a));
      ++_
    );
    if (a) {
      for (_ = l - 1; _ >= 0; --_)
        if (!x()) {
          this.updateRangeFromParsed(d, t, v, u);
          break;
        }
    }
    return d;
  }
  getAllParsedValues(t) {
    const e = this._cachedMeta._parsed,
      n = [];
    let o, a, l;
    for (o = 0, a = e.length; o < a; ++o)
      ((l = e[o][t.axis]), wt(l) && n.push(l));
    return n;
  }
  getMaxOverflow() {
    return !1;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta,
      n = e.iScale,
      o = e.vScale,
      a = this.getParsed(t);
    return {
      label: n ? "" + n.getLabelForValue(a[n.axis]) : "",
      value: o ? "" + o.getLabelForValue(a[o.axis]) : "",
    };
  }
  _update(t) {
    const e = this._cachedMeta;
    (this.update(t || "default"),
      (e._clip = sg(
        q(this.options.clip, ng(e.xScale, e.yScale, this.getMaxOverflow())),
      )));
  }
  update(t) {}
  draw() {
    const t = this._ctx,
      e = this.chart,
      n = this._cachedMeta,
      o = n.data || [],
      a = e.chartArea,
      l = [],
      c = this._drawStart || 0,
      u = this._drawCount || o.length - c,
      d = this.options.drawActiveElementsOnTop;
    let p;
    for (n.dataset && n.dataset.draw(t, a, c, u), p = c; p < c + u; ++p) {
      const m = o[p];
      m.hidden || (m.active && d ? l.push(m) : m.draw(t, a));
    }
    for (p = 0; p < l.length; ++p) l[p].draw(t, a);
  }
  getStyle(t, e) {
    const n = e ? "active" : "default";
    return t === void 0 && this._cachedMeta.dataset
      ? this.resolveDatasetElementOptions(n)
      : this.resolveDataElementOptions(t || 0, n);
  }
  getContext(t, e, n) {
    const o = this.getDataset();
    let a;
    if (t >= 0 && t < this._cachedMeta.data.length) {
      const l = this._cachedMeta.data[t];
      ((a = l.$context || (l.$context = hg(this.getContext(), t, l))),
        (a.parsed = this.getParsed(t)),
        (a.raw = o.data[t]),
        (a.index = a.dataIndex = t));
    } else
      ((a =
        this.$context ||
        (this.$context = cg(this.chart.getContext(), this.index))),
        (a.dataset = o),
        (a.index = a.datasetIndex = this.index));
    return ((a.active = !!e), (a.mode = n), a);
  }
  resolveDatasetElementOptions(t) {
    return this._resolveElementOptions(this.datasetElementType.id, t);
  }
  resolveDataElementOptions(t, e) {
    return this._resolveElementOptions(this.dataElementType.id, e, t);
  }
  _resolveElementOptions(t, e = "default", n) {
    const o = e === "active",
      a = this._cachedDataOpts,
      l = t + "-" + e,
      c = a[l],
      u = this.enableOptionSharing && qi(n);
    if (c) return Ya(c, u);
    const d = this.chart.config,
      p = d.datasetElementScopeKeys(this._type, t),
      m = o ? [`${t}Hover`, "hover", t, ""] : [t, ""],
      _ = d.getOptionScopes(this.getDataset(), p),
      v = Object.keys(yt.elements[t]),
      x = () => this.getContext(n, o, e),
      b = d.resolveNamedOptions(_, v, x, m);
    return (
      b.$shared && ((b.$shared = u), (a[l] = Object.freeze(Ya(b, u)))),
      b
    );
  }
  _resolveAnimations(t, e, n) {
    const o = this.chart,
      a = this._cachedDataOpts,
      l = `animation-${e}`,
      c = a[l];
    if (c) return c;
    let u;
    if (o.options.animation !== !1) {
      const p = this.chart.config,
        m = p.datasetAnimationScopeKeys(this._type, e),
        _ = p.getOptionScopes(this.getDataset(), m);
      u = p.createResolver(_, this.getContext(t, n, e));
    }
    const d = new Vc(o, u && u.animations);
    return (u && u._cacheable && (a[l] = Object.freeze(d)), d);
  }
  getSharedOptions(t) {
    if (t.$shared)
      return (
        this._sharedOptions || (this._sharedOptions = Object.assign({}, t))
      );
  }
  includeOptions(t, e) {
    return !e || io(t) || this.chart._animationsDisabled;
  }
  _getSharedOptions(t, e) {
    const n = this.resolveDataElementOptions(t, e),
      o = this._sharedOptions,
      a = this.getSharedOptions(n),
      l = this.includeOptions(e, a) || a !== o;
    return (
      this.updateSharedOptions(a, e, n),
      { sharedOptions: a, includeOptions: l }
    );
  }
  updateElement(t, e, n, o) {
    io(o) ? Object.assign(t, n) : this._resolveAnimations(e, o).update(t, n);
  }
  updateSharedOptions(t, e, n) {
    t && !io(e) && this._resolveAnimations(void 0, e).update(t, n);
  }
  _setStyle(t, e, n, o) {
    t.active = o;
    const a = this.getStyle(e, o);
    this._resolveAnimations(e, n, o).update(t, {
      options: (!o && this.getSharedOptions(a)) || a,
    });
  }
  removeHoverStyle(t, e, n) {
    this._setStyle(t, n, "active", !1);
  }
  setHoverStyle(t, e, n) {
    this._setStyle(t, n, "active", !0);
  }
  _removeDatasetHoverStyle() {
    const t = this._cachedMeta.dataset;
    t && this._setStyle(t, void 0, "active", !1);
  }
  _setDatasetHoverStyle() {
    const t = this._cachedMeta.dataset;
    t && this._setStyle(t, void 0, "active", !0);
  }
  _resyncElements(t) {
    const e = this._data,
      n = this._cachedMeta.data;
    for (const [c, u, d] of this._syncList) this[c](u, d);
    this._syncList = [];
    const o = n.length,
      a = e.length,
      l = Math.min(a, o);
    (l && this.parse(0, l),
      a > o
        ? this._insertElements(o, a - o, t)
        : a < o && this._removeElements(a, o - a));
  }
  _insertElements(t, e, n = !0) {
    const o = this._cachedMeta,
      a = o.data,
      l = t + e;
    let c;
    const u = (d) => {
      for (d.length += e, c = d.length - 1; c >= l; c--) d[c] = d[c - e];
    };
    for (u(a), c = t; c < l; ++c) a[c] = new this.dataElementType();
    (this._parsing && u(o._parsed),
      this.parse(t, e),
      n && this.updateElements(a, t, e, "reset"));
  }
  updateElements(t, e, n, o) {}
  _removeElements(t, e) {
    const n = this._cachedMeta;
    if (this._parsing) {
      const o = n._parsed.splice(t, e);
      n._stacked && Ei(n, o);
    }
    n.data.splice(t, e);
  }
  _sync(t) {
    if (this._parsing) this._syncList.push(t);
    else {
      const [e, n, o] = t;
      this[e](n, o);
    }
    this.chart._dataChanges.push([this.index, ...t]);
  }
  _onDataPush() {
    const t = arguments.length;
    this._sync(["_insertElements", this.getDataset().data.length - t, t]);
  }
  _onDataPop() {
    this._sync(["_removeElements", this._cachedMeta.data.length - 1, 1]);
  }
  _onDataShift() {
    this._sync(["_removeElements", 0, 1]);
  }
  _onDataSplice(t, e) {
    e && this._sync(["_removeElements", t, e]);
    const n = arguments.length - 2;
    n && this._sync(["_insertElements", t, n]);
  }
  _onDataUnshift() {
    this._sync(["_insertElements", 0, arguments.length]);
  }
}
function dg(i, t) {
  if (!i._cache.$bar) {
    const e = i.getMatchingVisibleMetas(t);
    let n = [];
    for (let o = 0, a = e.length; o < a; o++)
      n = n.concat(e[o].controller.getAllParsedValues(i));
    i._cache.$bar = wc(n.sort((o, a) => o - a));
  }
  return i._cache.$bar;
}
function fg(i) {
  const t = i.iScale,
    e = dg(t, i.type);
  let n = t._length,
    o,
    a,
    l,
    c;
  const u = () => {
    l === 32767 ||
      l === -32768 ||
      (qi(c) && (n = Math.min(n, Math.abs(l - c) || n)), (c = l));
  };
  for (o = 0, a = e.length; o < a; ++o) ((l = t.getPixelForValue(e[o])), u());
  for (c = void 0, o = 0, a = t.ticks.length; o < a; ++o)
    ((l = t.getPixelForTick(o)), u());
  return n;
}
function pg(i, t, e, n) {
  const o = e.barThickness;
  let a, l;
  return (
    tt(o)
      ? ((a = t.min * e.categoryPercentage), (l = e.barPercentage))
      : ((a = o * n), (l = 1)),
    { chunk: a / n, ratio: l, start: t.pixels[i] - a / 2 }
  );
}
function gg(i, t, e, n) {
  const o = t.pixels,
    a = o[i];
  let l = i > 0 ? o[i - 1] : null,
    c = i < o.length - 1 ? o[i + 1] : null;
  const u = e.categoryPercentage;
  (l === null && (l = a - (c === null ? t.end - t.start : c - a)),
    c === null && (c = a + a - l));
  const d = a - ((a - Math.min(l, c)) / 2) * u;
  return {
    chunk: ((Math.abs(c - l) / 2) * u) / n,
    ratio: e.barPercentage,
    start: d,
  };
}
function mg(i, t, e, n) {
  const o = e.parse(i[0], n),
    a = e.parse(i[1], n),
    l = Math.min(o, a),
    c = Math.max(o, a);
  let u = l,
    d = c;
  (Math.abs(l) > Math.abs(c) && ((u = c), (d = l)),
    (t[e.axis] = d),
    (t._custom = { barStart: u, barEnd: d, start: o, end: a, min: l, max: c }));
}
function jc(i, t, e, n) {
  return (_t(i) ? mg(i, t, e, n) : (t[e.axis] = e.parse(i, n)), t);
}
function Ga(i, t, e, n) {
  const o = i.iScale,
    a = i.vScale,
    l = o.getLabels(),
    c = o === a,
    u = [];
  let d, p, m, _;
  for (d = e, p = e + n; d < p; ++d)
    ((_ = t[d]),
      (m = {}),
      (m[o.axis] = c || o.parse(l[d], d)),
      u.push(jc(_, m, a, d)));
  return u;
}
function no(i) {
  return i && i.barStart !== void 0 && i.barEnd !== void 0;
}
function _g(i, t, e) {
  return i !== 0 ? ae(i) : (t.isHorizontal() ? 1 : -1) * (t.min >= e ? 1 : -1);
}
function yg(i) {
  let t, e, n, o, a;
  return (
    i.horizontal
      ? ((t = i.base > i.x), (e = "left"), (n = "right"))
      : ((t = i.base < i.y), (e = "bottom"), (n = "top")),
    t ? ((o = "end"), (a = "start")) : ((o = "start"), (a = "end")),
    { start: e, end: n, reverse: t, top: o, bottom: a }
  );
}
function vg(i, t, e, n) {
  let o = t.borderSkipped;
  const a = {};
  if (!o) {
    i.borderSkipped = a;
    return;
  }
  if (o === !0) {
    i.borderSkipped = { top: !0, right: !0, bottom: !0, left: !0 };
    return;
  }
  const { start: l, end: c, reverse: u, top: d, bottom: p } = yg(i);
  (o === "middle" &&
    e &&
    ((i.enableBorderRadius = !0),
    (e._top || 0) === n
      ? (o = d)
      : (e._bottom || 0) === n
        ? (o = p)
        : ((a[Ka(p, l, c, u)] = !0), (o = d))),
    (a[Ka(o, l, c, u)] = !0),
    (i.borderSkipped = a));
}
function Ka(i, t, e, n) {
  return (n ? ((i = bg(i, t, e)), (i = Xa(i, e, t))) : (i = Xa(i, t, e)), i);
}
function bg(i, t, e) {
  return i === t ? e : i === e ? t : i;
}
function Xa(i, t, e) {
  return i === "start" ? t : i === "end" ? e : i;
}
function xg(i, { inflateAmount: t }, e) {
  i.inflateAmount = t === "auto" ? (e === 1 ? 0.33 : 0) : t;
}
class wg extends De {
  static id = "bar";
  static defaults = {
    datasetElementType: !1,
    dataElementType: "bar",
    categoryPercentage: 0.8,
    barPercentage: 0.9,
    grouped: !0,
    animations: {
      numbers: {
        type: "number",
        properties: ["x", "y", "base", "width", "height"],
      },
    },
  };
  static overrides = {
    scales: {
      _index_: { type: "category", offset: !0, grid: { offset: !0 } },
      _value_: { type: "linear", beginAtZero: !0 },
    },
  };
  parsePrimitiveData(t, e, n, o) {
    return Ga(t, e, n, o);
  }
  parseArrayData(t, e, n, o) {
    return Ga(t, e, n, o);
  }
  parseObjectData(t, e, n, o) {
    const { iScale: a, vScale: l } = t,
      { xAxisKey: c = "x", yAxisKey: u = "y" } = this._parsing,
      d = a.axis === "x" ? c : u,
      p = l.axis === "x" ? c : u,
      m = [];
    let _, v, x, b;
    for (_ = n, v = n + o; _ < v; ++_)
      ((b = e[_]),
        (x = {}),
        (x[a.axis] = a.parse(Oe(b, d), _)),
        m.push(jc(Oe(b, p), x, l, _)));
    return m;
  }
  updateRangeFromParsed(t, e, n, o) {
    super.updateRangeFromParsed(t, e, n, o);
    const a = n._custom;
    a &&
      e === this._cachedMeta.vScale &&
      ((t.min = Math.min(t.min, a.min)), (t.max = Math.max(t.max, a.max)));
  }
  getMaxOverflow() {
    return 0;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta,
      { iScale: n, vScale: o } = e,
      a = this.getParsed(t),
      l = a._custom,
      c = no(l)
        ? "[" + l.start + ", " + l.end + "]"
        : "" + o.getLabelForValue(a[o.axis]);
    return { label: "" + n.getLabelForValue(a[n.axis]), value: c };
  }
  initialize() {
    ((this.enableOptionSharing = !0), super.initialize());
    const t = this._cachedMeta;
    t.stack = this.getDataset().stack;
  }
  update(t) {
    const e = this._cachedMeta;
    this.updateElements(e.data, 0, e.data.length, t);
  }
  updateElements(t, e, n, o) {
    const a = o === "reset",
      {
        index: l,
        _cachedMeta: { vScale: c },
      } = this,
      u = c.getBasePixel(),
      d = c.isHorizontal(),
      p = this._getRuler(),
      { sharedOptions: m, includeOptions: _ } = this._getSharedOptions(e, o);
    for (let v = e; v < e + n; v++) {
      const x = this.getParsed(v),
        b =
          a || tt(x[c.axis])
            ? { base: u, head: u }
            : this._calculateBarValuePixels(v),
        w = this._calculateBarIndexPixels(v, p),
        k = (x._stacks || {})[c.axis],
        C = {
          horizontal: d,
          base: b.base,
          enableBorderRadius:
            !k || no(x._custom) || l === k._top || l === k._bottom,
          x: d ? b.head : w.center,
          y: d ? w.center : b.head,
          height: d ? w.size : Math.abs(b.size),
          width: d ? Math.abs(b.size) : w.size,
        };
      _ &&
        (C.options =
          m || this.resolveDataElementOptions(v, t[v].active ? "active" : o));
      const E = C.options || t[v].options;
      (vg(C, E, k, l), xg(C, E, p.ratio), this.updateElement(t[v], v, C, o));
    }
  }
  _getStacks(t, e) {
    const { iScale: n } = this._cachedMeta,
      o = n
        .getMatchingVisibleMetas(this._type)
        .filter((p) => p.controller.options.grouped),
      a = n.options.stacked,
      l = [],
      c = this._cachedMeta.controller.getParsed(e),
      u = c && c[n.axis],
      d = (p) => {
        const m = p._parsed.find((v) => v[n.axis] === u),
          _ = m && m[p.vScale.axis];
        if (tt(_) || isNaN(_)) return !0;
      };
    for (const p of o)
      if (
        !(e !== void 0 && d(p)) &&
        ((a === !1 ||
          l.indexOf(p.stack) === -1 ||
          (a === void 0 && p.stack === void 0)) &&
          l.push(p.stack),
        p.index === t)
      )
        break;
    return (l.length || l.push(void 0), l);
  }
  _getStackCount(t) {
    return this._getStacks(void 0, t).length;
  }
  _getAxisCount() {
    return this._getAxis().length;
  }
  getFirstScaleIdForIndexAxis() {
    const t = this.chart.scales,
      e = this.chart.options.indexAxis;
    return Object.keys(t)
      .filter((n) => t[n].axis === e)
      .shift();
  }
  _getAxis() {
    const t = {},
      e = this.getFirstScaleIdForIndexAxis();
    for (const n of this.chart.data.datasets)
      t[q(this.chart.options.indexAxis === "x" ? n.xAxisID : n.yAxisID, e)] =
        !0;
    return Object.keys(t);
  }
  _getStackIndex(t, e, n) {
    const o = this._getStacks(t, n),
      a = e !== void 0 ? o.indexOf(e) : -1;
    return a === -1 ? o.length - 1 : a;
  }
  _getRuler() {
    const t = this.options,
      e = this._cachedMeta,
      n = e.iScale,
      o = [];
    let a, l;
    for (a = 0, l = e.data.length; a < l; ++a)
      o.push(n.getPixelForValue(this.getParsed(a)[n.axis], a));
    const c = t.barThickness;
    return {
      min: c || fg(e),
      pixels: o,
      start: n._startPixel,
      end: n._endPixel,
      stackCount: this._getStackCount(),
      scale: n,
      grouped: t.grouped,
      ratio: c ? 1 : t.categoryPercentage * t.barPercentage,
    };
  }
  _calculateBarValuePixels(t) {
    const {
        _cachedMeta: { vScale: e, _stacked: n, index: o },
        options: { base: a, minBarLength: l },
      } = this,
      c = a || 0,
      u = this.getParsed(t),
      d = u._custom,
      p = no(d);
    let m = u[e.axis],
      _ = 0,
      v = n ? this.applyStack(e, u, n) : m,
      x,
      b;
    (v !== m && ((_ = v - m), (v = m)),
      p &&
        ((m = d.barStart),
        (v = d.barEnd - d.barStart),
        m !== 0 && ae(m) !== ae(d.barEnd) && (_ = 0),
        (_ += m)));
    const w = !tt(a) && !p ? a : _;
    let k = e.getPixelForValue(w);
    if (
      (this.chart.getDataVisibility(t)
        ? (x = e.getPixelForValue(_ + v))
        : (x = k),
      (b = x - k),
      Math.abs(b) < l)
    ) {
      ((b = _g(b, e, c) * l), m === c && (k -= b / 2));
      const C = e.getPixelForDecimal(0),
        E = e.getPixelForDecimal(1),
        A = Math.min(C, E),
        T = Math.max(C, E);
      ((k = Math.max(Math.min(k, T), A)),
        (x = k + b),
        n &&
          !p &&
          (u._stacks[e.axis]._visualValues[o] =
            e.getValueForPixel(x) - e.getValueForPixel(k)));
    }
    if (k === e.getPixelForValue(c)) {
      const C = (ae(b) * e.getLineWidthForValue(c)) / 2;
      ((k += C), (b -= C));
    }
    return { size: b, base: k, head: x, center: x + b / 2 };
  }
  _calculateBarIndexPixels(t, e) {
    const n = e.scale,
      o = this.options,
      a = o.skipNull,
      l = q(o.maxBarThickness, 1 / 0);
    let c, u;
    const d = this._getAxisCount();
    if (e.grouped) {
      const p = a ? this._getStackCount(t) : e.stackCount,
        m = o.barThickness === "flex" ? gg(t, e, o, p * d) : pg(t, e, o, p * d),
        _ =
          this.chart.options.indexAxis === "x"
            ? this.getDataset().xAxisID
            : this.getDataset().yAxisID,
        v = this._getAxis().indexOf(q(_, this.getFirstScaleIdForIndexAxis())),
        x =
          this._getStackIndex(
            this.index,
            this._cachedMeta.stack,
            a ? t : void 0,
          ) + v;
      ((c = m.start + m.chunk * x + m.chunk / 2),
        (u = Math.min(l, m.chunk * m.ratio)));
    } else
      ((c = n.getPixelForValue(this.getParsed(t)[n.axis], t)),
        (u = Math.min(l, e.min * e.ratio)));
    return { base: c - u / 2, head: c + u / 2, center: c, size: u };
  }
  draw() {
    const t = this._cachedMeta,
      e = t.vScale,
      n = t.data,
      o = n.length;
    let a = 0;
    for (; a < o; ++a)
      this.getParsed(a)[e.axis] !== null &&
        !n[a].hidden &&
        n[a].draw(this._ctx);
  }
}
class Pg extends De {
  static id = "bubble";
  static defaults = {
    datasetElementType: !1,
    dataElementType: "point",
    animations: {
      numbers: {
        type: "number",
        properties: ["x", "y", "borderWidth", "radius"],
      },
    },
  };
  static overrides = {
    scales: { x: { type: "linear" }, y: { type: "linear" } },
  };
  initialize() {
    ((this.enableOptionSharing = !0), super.initialize());
  }
  parsePrimitiveData(t, e, n, o) {
    const a = super.parsePrimitiveData(t, e, n, o);
    for (let l = 0; l < a.length; l++)
      a[l]._custom = this.resolveDataElementOptions(l + n).radius;
    return a;
  }
  parseArrayData(t, e, n, o) {
    const a = super.parseArrayData(t, e, n, o);
    for (let l = 0; l < a.length; l++) {
      const c = e[n + l];
      a[l]._custom = q(c[2], this.resolveDataElementOptions(l + n).radius);
    }
    return a;
  }
  parseObjectData(t, e, n, o) {
    const a = super.parseObjectData(t, e, n, o);
    for (let l = 0; l < a.length; l++) {
      const c = e[n + l];
      a[l]._custom = q(
        c && c.r && +c.r,
        this.resolveDataElementOptions(l + n).radius,
      );
    }
    return a;
  }
  getMaxOverflow() {
    const t = this._cachedMeta.data;
    let e = 0;
    for (let n = t.length - 1; n >= 0; --n)
      e = Math.max(e, t[n].size(this.resolveDataElementOptions(n)) / 2);
    return e > 0 && e;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta,
      n = this.chart.data.labels || [],
      { xScale: o, yScale: a } = e,
      l = this.getParsed(t),
      c = o.getLabelForValue(l.x),
      u = a.getLabelForValue(l.y),
      d = l._custom;
    return {
      label: n[t] || "",
      value: "(" + c + ", " + u + (d ? ", " + d : "") + ")",
    };
  }
  update(t) {
    const e = this._cachedMeta.data;
    this.updateElements(e, 0, e.length, t);
  }
  updateElements(t, e, n, o) {
    const a = o === "reset",
      { iScale: l, vScale: c } = this._cachedMeta,
      { sharedOptions: u, includeOptions: d } = this._getSharedOptions(e, o),
      p = l.axis,
      m = c.axis;
    for (let _ = e; _ < e + n; _++) {
      const v = t[_],
        x = !a && this.getParsed(_),
        b = {},
        w = (b[p] = a ? l.getPixelForDecimal(0.5) : l.getPixelForValue(x[p])),
        k = (b[m] = a ? c.getBasePixel() : c.getPixelForValue(x[m]));
      ((b.skip = isNaN(w) || isNaN(k)),
        d &&
          ((b.options =
            u || this.resolveDataElementOptions(_, v.active ? "active" : o)),
          a && (b.options.radius = 0)),
        this.updateElement(v, _, b, o));
    }
  }
  resolveDataElementOptions(t, e) {
    const n = this.getParsed(t);
    let o = super.resolveDataElementOptions(t, e);
    o.$shared && (o = Object.assign({}, o, { $shared: !1 }));
    const a = o.radius;
    return (
      e !== "active" && (o.radius = 0),
      (o.radius += q(n && n._custom, a)),
      o
    );
  }
}
function kg(i, t, e) {
  let n = 1,
    o = 1,
    a = 0,
    l = 0;
  if (t < gt) {
    const c = i,
      u = c + t,
      d = Math.cos(c),
      p = Math.sin(c),
      m = Math.cos(u),
      _ = Math.sin(u),
      v = (E, A, T) => (Yi(E, c, u, !0) ? 1 : Math.max(A, A * e, T, T * e)),
      x = (E, A, T) => (Yi(E, c, u, !0) ? -1 : Math.min(A, A * e, T, T * e)),
      b = v(0, d, m),
      w = v(kt, p, _),
      k = x(lt, d, m),
      C = x(lt + kt, p, _);
    ((n = (b - k) / 2),
      (o = (w - C) / 2),
      (a = -(b + k) / 2),
      (l = -(w + C) / 2));
  }
  return { ratioX: n, ratioY: o, offsetX: a, offsetY: l };
}
class Qo extends De {
  static id = "doughnut";
  static defaults = {
    datasetElementType: !1,
    dataElementType: "arc",
    animation: { animateRotate: !0, animateScale: !1 },
    animations: {
      numbers: {
        type: "number",
        properties: [
          "circumference",
          "endAngle",
          "innerRadius",
          "outerRadius",
          "startAngle",
          "x",
          "y",
          "offset",
          "borderWidth",
          "spacing",
        ],
      },
    },
    cutout: "50%",
    rotation: 0,
    circumference: 360,
    radius: "100%",
    spacing: 0,
    indexAxis: "r",
  };
  static descriptors = {
    _scriptable: (t) => t !== "spacing",
    _indexable: (t) =>
      t !== "spacing" &&
      !t.startsWith("borderDash") &&
      !t.startsWith("hoverBorderDash"),
  };
  static overrides = {
    aspectRatio: 1,
    plugins: {
      legend: {
        labels: {
          generateLabels(t) {
            const e = t.data,
              {
                labels: {
                  pointStyle: n,
                  textAlign: o,
                  color: a,
                  useBorderRadius: l,
                  borderRadius: c,
                },
              } = t.legend.options;
            return e.labels.length && e.datasets.length
              ? e.labels.map((u, d) => {
                  const m = t.getDatasetMeta(0).controller.getStyle(d);
                  return {
                    text: u,
                    fillStyle: m.backgroundColor,
                    fontColor: a,
                    hidden: !t.getDataVisibility(d),
                    lineDash: m.borderDash,
                    lineDashOffset: m.borderDashOffset,
                    lineJoin: m.borderJoinStyle,
                    lineWidth: m.borderWidth,
                    strokeStyle: m.borderColor,
                    textAlign: o,
                    pointStyle: n,
                    borderRadius: l && (c || m.borderRadius),
                    index: d,
                  };
                })
              : [];
          },
        },
        onClick(t, e, n) {
          (n.chart.toggleDataVisibility(e.index), n.chart.update());
        },
      },
    },
  };
  constructor(t, e) {
    (super(t, e),
      (this.enableOptionSharing = !0),
      (this.innerRadius = void 0),
      (this.outerRadius = void 0),
      (this.offsetX = void 0),
      (this.offsetY = void 0));
  }
  linkScales() {}
  parse(t, e) {
    const n = this.getDataset().data,
      o = this._cachedMeta;
    if (this._parsing === !1) o._parsed = n;
    else {
      let a = (u) => +n[u];
      if (et(n[t])) {
        const { key: u = "value" } = this._parsing;
        a = (d) => +Oe(n[d], u);
      }
      let l, c;
      for (l = t, c = t + e; l < c; ++l) o._parsed[l] = a(l);
    }
  }
  _getRotation() {
    return Jt(this.options.rotation - 90);
  }
  _getCircumference() {
    return Jt(this.options.circumference);
  }
  _getRotationExtents() {
    let t = gt,
      e = -gt;
    for (let n = 0; n < this.chart.data.datasets.length; ++n)
      if (
        this.chart.isDatasetVisible(n) &&
        this.chart.getDatasetMeta(n).type === this._type
      ) {
        const o = this.chart.getDatasetMeta(n).controller,
          a = o._getRotation(),
          l = o._getCircumference();
        ((t = Math.min(t, a)), (e = Math.max(e, a + l)));
      }
    return { rotation: t, circumference: e - t };
  }
  update(t) {
    const e = this.chart,
      { chartArea: n } = e,
      o = this._cachedMeta,
      a = o.data,
      l =
        this.getMaxBorderWidth() + this.getMaxOffset(a) + this.options.spacing,
      c = Math.max((Math.min(n.width, n.height) - l) / 2, 0),
      u = Math.min(Bf(this.options.cutout, c), 1),
      d = this._getRingWeight(this.index),
      { circumference: p, rotation: m } = this._getRotationExtents(),
      { ratioX: _, ratioY: v, offsetX: x, offsetY: b } = kg(m, p, u),
      w = (n.width - l) / _,
      k = (n.height - l) / v,
      C = Math.max(Math.min(w, k) / 2, 0),
      E = _c(this.options.radius, C),
      A = Math.max(E * u, 0),
      T = (E - A) / this._getVisibleDatasetWeightTotal();
    ((this.offsetX = x * E),
      (this.offsetY = b * E),
      (o.total = this.calculateTotal()),
      (this.outerRadius = E - T * this._getRingWeightOffset(this.index)),
      (this.innerRadius = Math.max(this.outerRadius - T * d, 0)),
      this.updateElements(a, 0, a.length, t));
  }
  _circumference(t, e) {
    const n = this.options,
      o = this._cachedMeta,
      a = this._getCircumference();
    return (e && n.animation.animateRotate) ||
      !this.chart.getDataVisibility(t) ||
      o._parsed[t] === null ||
      o.data[t].hidden
      ? 0
      : this.calculateCircumference((o._parsed[t] * a) / gt);
  }
  updateElements(t, e, n, o) {
    const a = o === "reset",
      l = this.chart,
      c = l.chartArea,
      d = l.options.animation,
      p = (c.left + c.right) / 2,
      m = (c.top + c.bottom) / 2,
      _ = a && d.animateScale,
      v = _ ? 0 : this.innerRadius,
      x = _ ? 0 : this.outerRadius,
      { sharedOptions: b, includeOptions: w } = this._getSharedOptions(e, o);
    let k = this._getRotation(),
      C;
    for (C = 0; C < e; ++C) k += this._circumference(C, a);
    for (C = e; C < e + n; ++C) {
      const E = this._circumference(C, a),
        A = t[C],
        T = {
          x: p + this.offsetX,
          y: m + this.offsetY,
          startAngle: k,
          endAngle: k + E,
          circumference: E,
          outerRadius: x,
          innerRadius: v,
        };
      (w &&
        (T.options =
          b || this.resolveDataElementOptions(C, A.active ? "active" : o)),
        (k += E),
        this.updateElement(A, C, T, o));
    }
  }
  calculateTotal() {
    const t = this._cachedMeta,
      e = t.data;
    let n = 0,
      o;
    for (o = 0; o < e.length; o++) {
      const a = t._parsed[o];
      a !== null &&
        !isNaN(a) &&
        this.chart.getDataVisibility(o) &&
        !e[o].hidden &&
        (n += Math.abs(a));
    }
    return n;
  }
  calculateCircumference(t) {
    const e = this._cachedMeta.total;
    return e > 0 && !isNaN(t) ? gt * (Math.abs(t) / e) : 0;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta,
      n = this.chart,
      o = n.data.labels || [],
      a = en(e._parsed[t], n.options.locale);
    return { label: o[t] || "", value: a };
  }
  getMaxBorderWidth(t) {
    let e = 0;
    const n = this.chart;
    let o, a, l, c, u;
    if (!t) {
      for (o = 0, a = n.data.datasets.length; o < a; ++o)
        if (n.isDatasetVisible(o)) {
          ((l = n.getDatasetMeta(o)), (t = l.data), (c = l.controller));
          break;
        }
    }
    if (!t) return 0;
    for (o = 0, a = t.length; o < a; ++o)
      ((u = c.resolveDataElementOptions(o)),
        u.borderAlign !== "inner" &&
          (e = Math.max(e, u.borderWidth || 0, u.hoverBorderWidth || 0)));
    return e;
  }
  getMaxOffset(t) {
    let e = 0;
    for (let n = 0, o = t.length; n < o; ++n) {
      const a = this.resolveDataElementOptions(n);
      e = Math.max(e, a.offset || 0, a.hoverOffset || 0);
    }
    return e;
  }
  _getRingWeightOffset(t) {
    let e = 0;
    for (let n = 0; n < t; ++n)
      this.chart.isDatasetVisible(n) && (e += this._getRingWeight(n));
    return e;
  }
  _getRingWeight(t) {
    return Math.max(q(this.chart.data.datasets[t].weight, 1), 0);
  }
  _getVisibleDatasetWeightTotal() {
    return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
  }
}
class Sg extends De {
  static id = "line";
  static defaults = {
    datasetElementType: "line",
    dataElementType: "point",
    showLine: !0,
    spanGaps: !1,
  };
  static overrides = {
    scales: { _index_: { type: "category" }, _value_: { type: "linear" } },
  };
  initialize() {
    ((this.enableOptionSharing = !0),
      (this.supportsDecimation = !0),
      super.initialize());
  }
  update(t) {
    const e = this._cachedMeta,
      { dataset: n, data: o = [], _dataset: a } = e,
      l = this.chart._animationsDisabled;
    let { start: c, count: u } = Sc(e, o, l);
    ((this._drawStart = c),
      (this._drawCount = u),
      Mc(e) && ((c = 0), (u = o.length)),
      (n._chart = this.chart),
      (n._datasetIndex = this.index),
      (n._decimated = !!a._decimated),
      (n.points = o));
    const d = this.resolveDatasetElementOptions(t);
    (this.options.showLine || (d.borderWidth = 0),
      (d.segment = this.options.segment),
      this.updateElement(n, void 0, { animated: !l, options: d }, t),
      this.updateElements(o, c, u, t));
  }
  updateElements(t, e, n, o) {
    const a = o === "reset",
      { iScale: l, vScale: c, _stacked: u, _dataset: d } = this._cachedMeta,
      { sharedOptions: p, includeOptions: m } = this._getSharedOptions(e, o),
      _ = l.axis,
      v = c.axis,
      { spanGaps: x, segment: b } = this.options,
      w = ui(x) ? x : Number.POSITIVE_INFINITY,
      k = this.chart._animationsDisabled || a || o === "none",
      C = e + n,
      E = t.length;
    let A = e > 0 && this.getParsed(e - 1);
    for (let T = 0; T < E; ++T) {
      const B = t[T],
        D = k ? B : {};
      if (T < e || T >= C) {
        D.skip = !0;
        continue;
      }
      const R = this.getParsed(T),
        H = tt(R[v]),
        U = (D[_] = l.getPixelForValue(R[_], T)),
        W = (D[v] =
          a || H
            ? c.getBasePixel()
            : c.getPixelForValue(u ? this.applyStack(c, R, u) : R[v], T));
      ((D.skip = isNaN(U) || isNaN(W) || H),
        (D.stop = T > 0 && Math.abs(R[_] - A[_]) > w),
        b && ((D.parsed = R), (D.raw = d.data[T])),
        m &&
          (D.options =
            p || this.resolveDataElementOptions(T, B.active ? "active" : o)),
        k || this.updateElement(B, T, D, o),
        (A = R));
    }
  }
  getMaxOverflow() {
    const t = this._cachedMeta,
      e = t.dataset,
      n = (e.options && e.options.borderWidth) || 0,
      o = t.data || [];
    if (!o.length) return n;
    const a = o[0].size(this.resolveDataElementOptions(0)),
      l = o[o.length - 1].size(this.resolveDataElementOptions(o.length - 1));
    return Math.max(n, a, l) / 2;
  }
  draw() {
    const t = this._cachedMeta;
    (t.dataset.updateControlPoints(this.chart.chartArea, t.iScale.axis),
      super.draw());
  }
}
class $c extends De {
  static id = "polarArea";
  static defaults = {
    dataElementType: "arc",
    animation: { animateRotate: !0, animateScale: !0 },
    animations: {
      numbers: {
        type: "number",
        properties: [
          "x",
          "y",
          "startAngle",
          "endAngle",
          "innerRadius",
          "outerRadius",
        ],
      },
    },
    indexAxis: "r",
    startAngle: 0,
  };
  static overrides = {
    aspectRatio: 1,
    plugins: {
      legend: {
        labels: {
          generateLabels(t) {
            const e = t.data;
            if (e.labels.length && e.datasets.length) {
              const {
                labels: { pointStyle: n, color: o },
              } = t.legend.options;
              return e.labels.map((a, l) => {
                const u = t.getDatasetMeta(0).controller.getStyle(l);
                return {
                  text: a,
                  fillStyle: u.backgroundColor,
                  strokeStyle: u.borderColor,
                  fontColor: o,
                  lineWidth: u.borderWidth,
                  pointStyle: n,
                  hidden: !t.getDataVisibility(l),
                  index: l,
                };
              });
            }
            return [];
          },
        },
        onClick(t, e, n) {
          (n.chart.toggleDataVisibility(e.index), n.chart.update());
        },
      },
    },
    scales: {
      r: {
        type: "radialLinear",
        angleLines: { display: !1 },
        beginAtZero: !0,
        grid: { circular: !0 },
        pointLabels: { display: !1 },
        startAngle: 0,
      },
    },
  };
  constructor(t, e) {
    (super(t, e), (this.innerRadius = void 0), (this.outerRadius = void 0));
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta,
      n = this.chart,
      o = n.data.labels || [],
      a = en(e._parsed[t].r, n.options.locale);
    return { label: o[t] || "", value: a };
  }
  parseObjectData(t, e, n, o) {
    return Bc.bind(this)(t, e, n, o);
  }
  update(t) {
    const e = this._cachedMeta.data;
    (this._updateRadius(), this.updateElements(e, 0, e.length, t));
  }
  getMinMax() {
    const t = this._cachedMeta,
      e = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY };
    return (
      t.data.forEach((n, o) => {
        const a = this.getParsed(o).r;
        !isNaN(a) &&
          this.chart.getDataVisibility(o) &&
          (a < e.min && (e.min = a), a > e.max && (e.max = a));
      }),
      e
    );
  }
  _updateRadius() {
    const t = this.chart,
      e = t.chartArea,
      n = t.options,
      o = Math.min(e.right - e.left, e.bottom - e.top),
      a = Math.max(o / 2, 0),
      l = Math.max(n.cutoutPercentage ? (a / 100) * n.cutoutPercentage : 1, 0),
      c = (a - l) / t.getVisibleDatasetCount();
    ((this.outerRadius = a - c * this.index),
      (this.innerRadius = this.outerRadius - c));
  }
  updateElements(t, e, n, o) {
    const a = o === "reset",
      l = this.chart,
      u = l.options.animation,
      d = this._cachedMeta.rScale,
      p = d.xCenter,
      m = d.yCenter,
      _ = d.getIndexAngle(0) - 0.5 * lt;
    let v = _,
      x;
    const b = 360 / this.countVisibleElements();
    for (x = 0; x < e; ++x) v += this._computeAngle(x, o, b);
    for (x = e; x < e + n; x++) {
      const w = t[x];
      let k = v,
        C = v + this._computeAngle(x, o, b),
        E = l.getDataVisibility(x)
          ? d.getDistanceFromCenterForValue(this.getParsed(x).r)
          : 0;
      ((v = C),
        a && (u.animateScale && (E = 0), u.animateRotate && (k = C = _)));
      const A = {
        x: p,
        y: m,
        innerRadius: 0,
        outerRadius: E,
        startAngle: k,
        endAngle: C,
        options: this.resolveDataElementOptions(x, w.active ? "active" : o),
      };
      this.updateElement(w, x, A, o);
    }
  }
  countVisibleElements() {
    const t = this._cachedMeta;
    let e = 0;
    return (
      t.data.forEach((n, o) => {
        !isNaN(this.getParsed(o).r) && this.chart.getDataVisibility(o) && e++;
      }),
      e
    );
  }
  _computeAngle(t, e, n) {
    return this.chart.getDataVisibility(t)
      ? Jt(this.resolveDataElementOptions(t, e).angle || n)
      : 0;
  }
}
class Mg extends Qo {
  static id = "pie";
  static defaults = {
    cutout: 0,
    rotation: 0,
    circumference: 360,
    radius: "100%",
  };
}
class Lg extends De {
  static id = "radar";
  static defaults = {
    datasetElementType: "line",
    dataElementType: "point",
    indexAxis: "r",
    showLine: !0,
    elements: { line: { fill: "start" } },
  };
  static overrides = {
    aspectRatio: 1,
    scales: { r: { type: "radialLinear" } },
  };
  getLabelAndValue(t) {
    const e = this._cachedMeta.vScale,
      n = this.getParsed(t);
    return {
      label: e.getLabels()[t],
      value: "" + e.getLabelForValue(n[e.axis]),
    };
  }
  parseObjectData(t, e, n, o) {
    return Bc.bind(this)(t, e, n, o);
  }
  update(t) {
    const e = this._cachedMeta,
      n = e.dataset,
      o = e.data || [],
      a = e.iScale.getLabels();
    if (((n.points = o), t !== "resize")) {
      const l = this.resolveDatasetElementOptions(t);
      this.options.showLine || (l.borderWidth = 0);
      const c = { _loop: !0, _fullLoop: a.length === o.length, options: l };
      this.updateElement(n, void 0, c, t);
    }
    this.updateElements(o, 0, o.length, t);
  }
  updateElements(t, e, n, o) {
    const a = this._cachedMeta.rScale,
      l = o === "reset";
    for (let c = e; c < e + n; c++) {
      const u = t[c],
        d = this.resolveDataElementOptions(c, u.active ? "active" : o),
        p = a.getPointPositionForValue(c, this.getParsed(c).r),
        m = l ? a.xCenter : p.x,
        _ = l ? a.yCenter : p.y,
        v = {
          x: m,
          y: _,
          angle: p.angle,
          skip: isNaN(m) || isNaN(_),
          options: d,
        };
      this.updateElement(u, c, v, o);
    }
  }
}
class Cg extends De {
  static id = "scatter";
  static defaults = {
    datasetElementType: !1,
    dataElementType: "point",
    showLine: !1,
    fill: !1,
  };
  static overrides = {
    interaction: { mode: "point" },
    scales: { x: { type: "linear" }, y: { type: "linear" } },
  };
  getLabelAndValue(t) {
    const e = this._cachedMeta,
      n = this.chart.data.labels || [],
      { xScale: o, yScale: a } = e,
      l = this.getParsed(t),
      c = o.getLabelForValue(l.x),
      u = a.getLabelForValue(l.y);
    return { label: n[t] || "", value: "(" + c + ", " + u + ")" };
  }
  update(t) {
    const e = this._cachedMeta,
      { data: n = [] } = e,
      o = this.chart._animationsDisabled;
    let { start: a, count: l } = Sc(e, n, o);
    if (
      ((this._drawStart = a),
      (this._drawCount = l),
      Mc(e) && ((a = 0), (l = n.length)),
      this.options.showLine)
    ) {
      this.datasetElementType || this.addElements();
      const { dataset: c, _dataset: u } = e;
      ((c._chart = this.chart),
        (c._datasetIndex = this.index),
        (c._decimated = !!u._decimated),
        (c.points = n));
      const d = this.resolveDatasetElementOptions(t);
      ((d.segment = this.options.segment),
        this.updateElement(c, void 0, { animated: !o, options: d }, t));
    } else
      this.datasetElementType &&
        (delete e.dataset, (this.datasetElementType = !1));
    this.updateElements(n, a, l, t);
  }
  addElements() {
    const { showLine: t } = this.options;
    (!this.datasetElementType &&
      t &&
      (this.datasetElementType = this.chart.registry.getElement("line")),
      super.addElements());
  }
  updateElements(t, e, n, o) {
    const a = o === "reset",
      { iScale: l, vScale: c, _stacked: u, _dataset: d } = this._cachedMeta,
      p = this.resolveDataElementOptions(e, o),
      m = this.getSharedOptions(p),
      _ = this.includeOptions(o, m),
      v = l.axis,
      x = c.axis,
      { spanGaps: b, segment: w } = this.options,
      k = ui(b) ? b : Number.POSITIVE_INFINITY,
      C = this.chart._animationsDisabled || a || o === "none";
    let E = e > 0 && this.getParsed(e - 1);
    for (let A = e; A < e + n; ++A) {
      const T = t[A],
        B = this.getParsed(A),
        D = C ? T : {},
        R = tt(B[x]),
        H = (D[v] = l.getPixelForValue(B[v], A)),
        U = (D[x] =
          a || R
            ? c.getBasePixel()
            : c.getPixelForValue(u ? this.applyStack(c, B, u) : B[x], A));
      ((D.skip = isNaN(H) || isNaN(U) || R),
        (D.stop = A > 0 && Math.abs(B[v] - E[v]) > k),
        w && ((D.parsed = B), (D.raw = d.data[A])),
        _ &&
          (D.options =
            m || this.resolveDataElementOptions(A, T.active ? "active" : o)),
        C || this.updateElement(T, A, D, o),
        (E = B));
    }
    this.updateSharedOptions(m, o, p);
  }
  getMaxOverflow() {
    const t = this._cachedMeta,
      e = t.data || [];
    if (!this.options.showLine) {
      let c = 0;
      for (let u = e.length - 1; u >= 0; --u)
        c = Math.max(c, e[u].size(this.resolveDataElementOptions(u)) / 2);
      return c > 0 && c;
    }
    const n = t.dataset,
      o = (n.options && n.options.borderWidth) || 0;
    if (!e.length) return o;
    const a = e[0].size(this.resolveDataElementOptions(0)),
      l = e[e.length - 1].size(this.resolveDataElementOptions(e.length - 1));
    return Math.max(o, a, l) / 2;
  }
}
var Tg = Object.freeze({
  __proto__: null,
  BarController: wg,
  BubbleController: Pg,
  DoughnutController: Qo,
  LineController: Sg,
  PieController: Mg,
  PolarAreaController: $c,
  RadarController: Lg,
  ScatterController: Cg,
});
function Ze() {
  throw new Error(
    "This method is not implemented: Check that a complete date adapter is provided.",
  );
}
class tr {
  static override(t) {
    Object.assign(tr.prototype, t);
  }
  options;
  constructor(t) {
    this.options = t || {};
  }
  init() {}
  formats() {
    return Ze();
  }
  parse() {
    return Ze();
  }
  format() {
    return Ze();
  }
  add() {
    return Ze();
  }
  diff() {
    return Ze();
  }
  startOf() {
    return Ze();
  }
  endOf() {
    return Ze();
  }
}
var Eg = { _date: tr };
function Ag(i, t, e, n) {
  const { controller: o, data: a, _sorted: l } = i,
    c = o._cachedMeta.iScale,
    u = i.dataset && i.dataset.options ? i.dataset.options.spanGaps : null;
  if (c && t === c.axis && t !== "r" && l && a.length) {
    const d = c._reversePixels ? qf : ve;
    if (n) {
      if (o._sharedOptions) {
        const p = a[0],
          m = typeof p.getRange == "function" && p.getRange(t);
        if (m) {
          const _ = d(a, t, e - m),
            v = d(a, t, e + m);
          return { lo: _.lo, hi: v.hi };
        }
      }
    } else {
      const p = d(a, t, e);
      if (u) {
        const { vScale: m } = o._cachedMeta,
          { _parsed: _ } = i,
          v = _.slice(0, p.lo + 1)
            .reverse()
            .findIndex((b) => !tt(b[m.axis]));
        p.lo -= Math.max(0, v);
        const x = _.slice(p.hi).findIndex((b) => !tt(b[m.axis]));
        p.hi += Math.max(0, x);
      }
      return p;
    }
  }
  return { lo: 0, hi: a.length - 1 };
}
function hs(i, t, e, n, o) {
  const a = i.getSortedVisibleDatasetMetas(),
    l = e[t];
  for (let c = 0, u = a.length; c < u; ++c) {
    const { index: d, data: p } = a[c],
      { lo: m, hi: _ } = Ag(a[c], t, l, o);
    for (let v = m; v <= _; ++v) {
      const x = p[v];
      x.skip || n(x, d, v);
    }
  }
}
function Og(i) {
  const t = i.indexOf("x") !== -1,
    e = i.indexOf("y") !== -1;
  return function (n, o) {
    const a = t ? Math.abs(n.x - o.x) : 0,
      l = e ? Math.abs(n.y - o.y) : 0;
    return Math.sqrt(Math.pow(a, 2) + Math.pow(l, 2));
  };
}
function so(i, t, e, n, o) {
  const a = [];
  return (
    (!o && !i.isPointInArea(t)) ||
      hs(
        i,
        e,
        t,
        function (c, u, d) {
          (!o && !be(c, i.chartArea, 0)) ||
            (c.inRange(t.x, t.y, n) &&
              a.push({ element: c, datasetIndex: u, index: d }));
        },
        !0,
      ),
    a
  );
}
function Ig(i, t, e, n) {
  let o = [];
  function a(l, c, u) {
    const { startAngle: d, endAngle: p } = l.getProps(
        ["startAngle", "endAngle"],
        n,
      ),
      { angle: m } = bc(l, { x: t.x, y: t.y });
    Yi(m, d, p) && o.push({ element: l, datasetIndex: c, index: u });
  }
  return (hs(i, e, t, a), o);
}
function Bg(i, t, e, n, o, a) {
  let l = [];
  const c = Og(e);
  let u = Number.POSITIVE_INFINITY;
  function d(p, m, _) {
    const v = p.inRange(t.x, t.y, o);
    if (n && !v) return;
    const x = p.getCenterPoint(o);
    if (!(!!a || i.isPointInArea(x)) && !v) return;
    const w = c(t, x);
    w < u
      ? ((l = [{ element: p, datasetIndex: m, index: _ }]), (u = w))
      : w === u && l.push({ element: p, datasetIndex: m, index: _ });
  }
  return (hs(i, e, t, d), l);
}
function oo(i, t, e, n, o, a) {
  return !a && !i.isPointInArea(t)
    ? []
    : e === "r" && !n
      ? Ig(i, t, e, o)
      : Bg(i, t, e, n, o, a);
}
function Ja(i, t, e, n, o) {
  const a = [],
    l = e === "x" ? "inXRange" : "inYRange";
  let c = !1;
  return (
    hs(i, e, t, (u, d, p) => {
      u[l] &&
        u[l](t[e], o) &&
        (a.push({ element: u, datasetIndex: d, index: p }),
        (c = c || u.inRange(t.x, t.y, o)));
    }),
    n && !c ? [] : a
  );
}
var Dg = {
  modes: {
    index(i, t, e, n) {
      const o = $e(t, i),
        a = e.axis || "x",
        l = e.includeInvisible || !1,
        c = e.intersect ? so(i, o, a, n, l) : oo(i, o, a, !1, n, l),
        u = [];
      return c.length
        ? (i.getSortedVisibleDatasetMetas().forEach((d) => {
            const p = c[0].index,
              m = d.data[p];
            m &&
              !m.skip &&
              u.push({ element: m, datasetIndex: d.index, index: p });
          }),
          u)
        : [];
    },
    dataset(i, t, e, n) {
      const o = $e(t, i),
        a = e.axis || "xy",
        l = e.includeInvisible || !1;
      let c = e.intersect ? so(i, o, a, n, l) : oo(i, o, a, !1, n, l);
      if (c.length > 0) {
        const u = c[0].datasetIndex,
          d = i.getDatasetMeta(u).data;
        c = [];
        for (let p = 0; p < d.length; ++p)
          c.push({ element: d[p], datasetIndex: u, index: p });
      }
      return c;
    },
    point(i, t, e, n) {
      const o = $e(t, i),
        a = e.axis || "xy",
        l = e.includeInvisible || !1;
      return so(i, o, a, n, l);
    },
    nearest(i, t, e, n) {
      const o = $e(t, i),
        a = e.axis || "xy",
        l = e.includeInvisible || !1;
      return oo(i, o, a, e.intersect, n, l);
    },
    x(i, t, e, n) {
      const o = $e(t, i);
      return Ja(i, o, "x", e.intersect, n);
    },
    y(i, t, e, n) {
      const o = $e(t, i);
      return Ja(i, o, "y", e.intersect, n);
    },
  },
};
const Uc = ["left", "top", "right", "bottom"];
function Ai(i, t) {
  return i.filter((e) => e.pos === t);
}
function Qa(i, t) {
  return i.filter((e) => Uc.indexOf(e.pos) === -1 && e.box.axis === t);
}
function Oi(i, t) {
  return i.sort((e, n) => {
    const o = t ? n : e,
      a = t ? e : n;
    return o.weight === a.weight ? o.index - a.index : o.weight - a.weight;
  });
}
function Rg(i) {
  const t = [];
  let e, n, o, a, l, c;
  for (e = 0, n = (i || []).length; e < n; ++e)
    ((o = i[e]),
      ({
        position: a,
        options: { stack: l, stackWeight: c = 1 },
      } = o),
      t.push({
        index: e,
        box: o,
        pos: a,
        horizontal: o.isHorizontal(),
        weight: o.weight,
        stack: l && a + l,
        stackWeight: c,
      }));
  return t;
}
function zg(i) {
  const t = {};
  for (const e of i) {
    const { stack: n, pos: o, stackWeight: a } = e;
    if (!n || !Uc.includes(o)) continue;
    const l = t[n] || (t[n] = { count: 0, placed: 0, weight: 0, size: 0 });
    (l.count++, (l.weight += a));
  }
  return t;
}
function Ng(i, t) {
  const e = zg(i),
    { vBoxMaxWidth: n, hBoxMaxHeight: o } = t;
  let a, l, c;
  for (a = 0, l = i.length; a < l; ++a) {
    c = i[a];
    const { fullSize: u } = c.box,
      d = e[c.stack],
      p = d && c.stackWeight / d.weight;
    c.horizontal
      ? ((c.width = p ? p * n : u && t.availableWidth), (c.height = o))
      : ((c.width = n), (c.height = p ? p * o : u && t.availableHeight));
  }
  return e;
}
function Fg(i) {
  const t = Rg(i),
    e = Oi(
      t.filter((d) => d.box.fullSize),
      !0,
    ),
    n = Oi(Ai(t, "left"), !0),
    o = Oi(Ai(t, "right")),
    a = Oi(Ai(t, "top"), !0),
    l = Oi(Ai(t, "bottom")),
    c = Qa(t, "x"),
    u = Qa(t, "y");
  return {
    fullSize: e,
    leftAndTop: n.concat(a),
    rightAndBottom: o.concat(u).concat(l).concat(c),
    chartArea: Ai(t, "chartArea"),
    vertical: n.concat(o).concat(u),
    horizontal: a.concat(l).concat(c),
  };
}
function tl(i, t, e, n) {
  return Math.max(i[e], t[e]) + Math.max(i[n], t[n]);
}
function qc(i, t) {
  ((i.top = Math.max(i.top, t.top)),
    (i.left = Math.max(i.left, t.left)),
    (i.bottom = Math.max(i.bottom, t.bottom)),
    (i.right = Math.max(i.right, t.right)));
}
function Hg(i, t, e, n) {
  const { pos: o, box: a } = e,
    l = i.maxPadding;
  if (!et(o)) {
    e.size && (i[o] -= e.size);
    const m = n[e.stack] || { size: 0, count: 1 };
    ((m.size = Math.max(m.size, e.horizontal ? a.height : a.width)),
      (e.size = m.size / m.count),
      (i[o] += e.size));
  }
  a.getPadding && qc(l, a.getPadding());
  const c = Math.max(0, t.outerWidth - tl(l, i, "left", "right")),
    u = Math.max(0, t.outerHeight - tl(l, i, "top", "bottom")),
    d = c !== i.w,
    p = u !== i.h;
  return (
    (i.w = c),
    (i.h = u),
    e.horizontal ? { same: d, other: p } : { same: p, other: d }
  );
}
function Wg(i) {
  const t = i.maxPadding;
  function e(n) {
    const o = Math.max(t[n] - i[n], 0);
    return ((i[n] += o), o);
  }
  ((i.y += e("top")), (i.x += e("left")), e("right"), e("bottom"));
}
function Vg(i, t) {
  const e = t.maxPadding;
  function n(o) {
    const a = { left: 0, top: 0, right: 0, bottom: 0 };
    return (
      o.forEach((l) => {
        a[l] = Math.max(t[l], e[l]);
      }),
      a
    );
  }
  return n(i ? ["left", "right"] : ["top", "bottom"]);
}
function Ni(i, t, e, n) {
  const o = [];
  let a, l, c, u, d, p;
  for (a = 0, l = i.length, d = 0; a < l; ++a) {
    ((c = i[a]),
      (u = c.box),
      u.update(c.width || t.w, c.height || t.h, Vg(c.horizontal, t)));
    const { same: m, other: _ } = Hg(t, e, c, n);
    ((d |= m && o.length), (p = p || _), u.fullSize || o.push(c));
  }
  return (d && Ni(o, t, e, n)) || p;
}
function En(i, t, e, n, o) {
  ((i.top = e),
    (i.left = t),
    (i.right = t + n),
    (i.bottom = e + o),
    (i.width = n),
    (i.height = o));
}
function el(i, t, e, n) {
  const o = e.padding;
  let { x: a, y: l } = t;
  for (const c of i) {
    const u = c.box,
      d = n[c.stack] || { placed: 0, weight: 1 },
      p = c.stackWeight / d.weight || 1;
    if (c.horizontal) {
      const m = t.w * p,
        _ = d.size || u.height;
      (qi(d.start) && (l = d.start),
        u.fullSize
          ? En(u, o.left, l, e.outerWidth - o.right - o.left, _)
          : En(u, t.left + d.placed, l, m, _),
        (d.start = l),
        (d.placed += m),
        (l = u.bottom));
    } else {
      const m = t.h * p,
        _ = d.size || u.width;
      (qi(d.start) && (a = d.start),
        u.fullSize
          ? En(u, a, o.top, _, e.outerHeight - o.bottom - o.top)
          : En(u, a, t.top + d.placed, _, m),
        (d.start = a),
        (d.placed += m),
        (a = u.right));
    }
  }
  ((t.x = a), (t.y = l));
}
var Bt = {
  addBox(i, t) {
    (i.boxes || (i.boxes = []),
      (t.fullSize = t.fullSize || !1),
      (t.position = t.position || "top"),
      (t.weight = t.weight || 0),
      (t._layers =
        t._layers ||
        function () {
          return [
            {
              z: 0,
              draw(e) {
                t.draw(e);
              },
            },
          ];
        }),
      i.boxes.push(t));
  },
  removeBox(i, t) {
    const e = i.boxes ? i.boxes.indexOf(t) : -1;
    e !== -1 && i.boxes.splice(e, 1);
  },
  configure(i, t, e) {
    ((t.fullSize = e.fullSize),
      (t.position = e.position),
      (t.weight = e.weight));
  },
  update(i, t, e, n) {
    if (!i) return;
    const o = Dt(i.options.layout.padding),
      a = Math.max(t - o.width, 0),
      l = Math.max(e - o.height, 0),
      c = Fg(i.boxes),
      u = c.vertical,
      d = c.horizontal;
    ht(i.boxes, (b) => {
      typeof b.beforeLayout == "function" && b.beforeLayout();
    });
    const p =
        u.reduce(
          (b, w) => (w.box.options && w.box.options.display === !1 ? b : b + 1),
          0,
        ) || 1,
      m = Object.freeze({
        outerWidth: t,
        outerHeight: e,
        padding: o,
        availableWidth: a,
        availableHeight: l,
        vBoxMaxWidth: a / 2 / p,
        hBoxMaxHeight: l / 2,
      }),
      _ = Object.assign({}, o);
    qc(_, Dt(n));
    const v = Object.assign(
        { maxPadding: _, w: a, h: l, x: o.left, y: o.top },
        o,
      ),
      x = Ng(u.concat(d), m);
    (Ni(c.fullSize, v, m, x),
      Ni(u, v, m, x),
      Ni(d, v, m, x) && Ni(u, v, m, x),
      Wg(v),
      el(c.leftAndTop, v, m, x),
      (v.x += v.w),
      (v.y += v.h),
      el(c.rightAndBottom, v, m, x),
      (i.chartArea = {
        left: v.left,
        top: v.top,
        right: v.left + v.w,
        bottom: v.top + v.h,
        height: v.h,
        width: v.w,
      }),
      ht(c.chartArea, (b) => {
        const w = b.box;
        (Object.assign(w, i.chartArea),
          w.update(v.w, v.h, { left: 0, top: 0, right: 0, bottom: 0 }));
      }));
  },
};
class Yc {
  acquireContext(t, e) {}
  releaseContext(t) {
    return !1;
  }
  addEventListener(t, e, n) {}
  removeEventListener(t, e, n) {}
  getDevicePixelRatio() {
    return 1;
  }
  getMaximumSize(t, e, n, o) {
    return (
      (e = Math.max(0, e || t.width)),
      (n = n || t.height),
      { width: e, height: Math.max(0, o ? Math.floor(e / o) : n) }
    );
  }
  isAttached(t) {
    return !0;
  }
  updateConfig(t) {}
}
class Zg extends Yc {
  acquireContext(t) {
    return (t && t.getContext && t.getContext("2d")) || null;
  }
  updateConfig(t) {
    t.options.animation = !1;
  }
}
const Wn = "$chartjs",
  jg = {
    touchstart: "mousedown",
    touchmove: "mousemove",
    touchend: "mouseup",
    pointerenter: "mouseenter",
    pointerdown: "mousedown",
    pointermove: "mousemove",
    pointerup: "mouseup",
    pointerleave: "mouseout",
    pointerout: "mouseout",
  },
  il = (i) => i === null || i === "";
function $g(i, t) {
  const e = i.style,
    n = i.getAttribute("height"),
    o = i.getAttribute("width");
  if (
    ((i[Wn] = {
      initial: {
        height: n,
        width: o,
        style: { display: e.display, height: e.height, width: e.width },
      },
    }),
    (e.display = e.display || "block"),
    (e.boxSizing = e.boxSizing || "border-box"),
    il(o))
  ) {
    const a = Fa(i, "width");
    a !== void 0 && (i.width = a);
  }
  if (il(n))
    if (i.style.height === "") i.height = i.width / (t || 2);
    else {
      const a = Fa(i, "height");
      a !== void 0 && (i.height = a);
    }
  return i;
}
const Gc = Hp ? { passive: !0 } : !1;
function Ug(i, t, e) {
  i && i.addEventListener(t, e, Gc);
}
function qg(i, t, e) {
  i && i.canvas && i.canvas.removeEventListener(t, e, Gc);
}
function Yg(i, t) {
  const e = jg[i.type] || i.type,
    { x: n, y: o } = $e(i, t);
  return {
    type: e,
    chart: t,
    native: i,
    x: n !== void 0 ? n : null,
    y: o !== void 0 ? o : null,
  };
}
function Yn(i, t) {
  for (const e of i) if (e === t || e.contains(t)) return !0;
}
function Gg(i, t, e) {
  const n = i.canvas,
    o = new MutationObserver((a) => {
      let l = !1;
      for (const c of a)
        ((l = l || Yn(c.addedNodes, n)), (l = l && !Yn(c.removedNodes, n)));
      l && e();
    });
  return (o.observe(document, { childList: !0, subtree: !0 }), o);
}
function Kg(i, t, e) {
  const n = i.canvas,
    o = new MutationObserver((a) => {
      let l = !1;
      for (const c of a)
        ((l = l || Yn(c.removedNodes, n)), (l = l && !Yn(c.addedNodes, n)));
      l && e();
    });
  return (o.observe(document, { childList: !0, subtree: !0 }), o);
}
const Ki = new Map();
let nl = 0;
function Kc() {
  const i = window.devicePixelRatio;
  i !== nl &&
    ((nl = i),
    Ki.forEach((t, e) => {
      e.currentDevicePixelRatio !== i && t();
    }));
}
function Xg(i, t) {
  (Ki.size || window.addEventListener("resize", Kc), Ki.set(i, t));
}
function Jg(i) {
  (Ki.delete(i), Ki.size || window.removeEventListener("resize", Kc));
}
function Qg(i, t, e) {
  const n = i.canvas,
    o = n && Jo(n);
  if (!o) return;
  const a = kc((c, u) => {
      const d = o.clientWidth;
      (e(c, u), d < o.clientWidth && e());
    }, window),
    l = new ResizeObserver((c) => {
      const u = c[0],
        d = u.contentRect.width,
        p = u.contentRect.height;
      (d === 0 && p === 0) || a(d, p);
    });
  return (l.observe(o), Xg(i, a), l);
}
function ro(i, t, e) {
  (e && e.disconnect(), t === "resize" && Jg(i));
}
function tm(i, t, e) {
  const n = i.canvas,
    o = kc((a) => {
      i.ctx !== null && e(Yg(a, i));
    }, i);
  return (Ug(n, t, o), o);
}
class em extends Yc {
  acquireContext(t, e) {
    const n = t && t.getContext && t.getContext("2d");
    return n && n.canvas === t ? ($g(t, e), n) : null;
  }
  releaseContext(t) {
    const e = t.canvas;
    if (!e[Wn]) return !1;
    const n = e[Wn].initial;
    ["height", "width"].forEach((a) => {
      const l = n[a];
      tt(l) ? e.removeAttribute(a) : e.setAttribute(a, l);
    });
    const o = n.style || {};
    return (
      Object.keys(o).forEach((a) => {
        e.style[a] = o[a];
      }),
      (e.width = e.width),
      delete e[Wn],
      !0
    );
  }
  addEventListener(t, e, n) {
    this.removeEventListener(t, e);
    const o = t.$proxies || (t.$proxies = {}),
      l = { attach: Gg, detach: Kg, resize: Qg }[e] || tm;
    o[e] = l(t, e, n);
  }
  removeEventListener(t, e) {
    const n = t.$proxies || (t.$proxies = {}),
      o = n[e];
    if (!o) return;
    ((({ attach: ro, detach: ro, resize: ro })[e] || qg)(t, e, o),
      (n[e] = void 0));
  }
  getDevicePixelRatio() {
    return window.devicePixelRatio;
  }
  getMaximumSize(t, e, n, o) {
    return Fp(t, e, n, o);
  }
  isAttached(t) {
    const e = t && Jo(t);
    return !!(e && e.isConnected);
  }
}
function im(i) {
  return !Xo() || (typeof OffscreenCanvas < "u" && i instanceof OffscreenCanvas)
    ? Zg
    : em;
}
let xe = class {
  static defaults = {};
  static defaultRoutes = void 0;
  x;
  y;
  active = !1;
  options;
  $animations;
  tooltipPosition(t) {
    const { x: e, y: n } = this.getProps(["x", "y"], t);
    return { x: e, y: n };
  }
  hasValue() {
    return ui(this.x) && ui(this.y);
  }
  getProps(t, e) {
    const n = this.$animations;
    if (!e || !n) return this;
    const o = {};
    return (
      t.forEach((a) => {
        o[a] = n[a] && n[a].active() ? n[a]._to : this[a];
      }),
      o
    );
  }
};
function nm(i, t) {
  const e = i.options.ticks,
    n = sm(i),
    o = Math.min(e.maxTicksLimit || n, n),
    a = e.major.enabled ? rm(t) : [],
    l = a.length,
    c = a[0],
    u = a[l - 1],
    d = [];
  if (l > o) return (am(t, d, a, l / o), d);
  const p = om(a, t, o);
  if (l > 0) {
    let m, _;
    const v = l > 1 ? Math.round((u - c) / (l - 1)) : null;
    for (An(t, d, p, tt(v) ? 0 : c - v, c), m = 0, _ = l - 1; m < _; m++)
      An(t, d, p, a[m], a[m + 1]);
    return (An(t, d, p, u, tt(v) ? t.length : u + v), d);
  }
  return (An(t, d, p), d);
}
function sm(i) {
  const t = i.options.offset,
    e = i._tickSize(),
    n = i._length / e + (t ? 0 : 1),
    o = i._maxLength / e;
  return Math.floor(Math.min(n, o));
}
function om(i, t, e) {
  const n = lm(i),
    o = t.length / e;
  if (!n) return Math.max(o, 1);
  const a = Vf(n);
  for (let l = 0, c = a.length - 1; l < c; l++) {
    const u = a[l];
    if (u > o) return u;
  }
  return Math.max(o, 1);
}
function rm(i) {
  const t = [];
  let e, n;
  for (e = 0, n = i.length; e < n; e++) i[e].major && t.push(e);
  return t;
}
function am(i, t, e, n) {
  let o = 0,
    a = e[0],
    l;
  for (n = Math.ceil(n), l = 0; l < i.length; l++)
    l === a && (t.push(i[l]), o++, (a = e[o * n]));
}
function An(i, t, e, n, o) {
  const a = q(n, 0),
    l = Math.min(q(o, i.length), i.length);
  let c = 0,
    u,
    d,
    p;
  for (
    e = Math.ceil(e), o && ((u = o - n), (e = u / Math.floor(u / e))), p = a;
    p < 0;
  )
    (c++, (p = Math.round(a + c * e)));
  for (d = Math.max(a, 0); d < l; d++)
    d === p && (t.push(i[d]), c++, (p = Math.round(a + c * e)));
}
function lm(i) {
  const t = i.length;
  let e, n;
  if (t < 2) return !1;
  for (n = i[0], e = 1; e < t; ++e) if (i[e] - i[e - 1] !== n) return !1;
  return n;
}
const cm = (i) => (i === "left" ? "right" : i === "right" ? "left" : i),
  sl = (i, t, e) => (t === "top" || t === "left" ? i[t] + e : i[t] - e),
  ol = (i, t) => Math.min(t || i, i);
function rl(i, t) {
  const e = [],
    n = i.length / t,
    o = i.length;
  let a = 0;
  for (; a < o; a += n) e.push(i[Math.floor(a)]);
  return e;
}
function hm(i, t, e) {
  const n = i.ticks.length,
    o = Math.min(t, n - 1),
    a = i._startPixel,
    l = i._endPixel,
    c = 1e-6;
  let u = i.getPixelForTick(o),
    d;
  if (
    !(
      e &&
      (n === 1
        ? (d = Math.max(u - a, l - u))
        : t === 0
          ? (d = (i.getPixelForTick(1) - u) / 2)
          : (d = (u - i.getPixelForTick(o - 1)) / 2),
      (u += o < t ? d : -d),
      u < a - c || u > l + c)
    )
  )
    return u;
}
function um(i, t) {
  ht(i, (e) => {
    const n = e.gc,
      o = n.length / 2;
    let a;
    if (o > t) {
      for (a = 0; a < o; ++a) delete e.data[n[a]];
      n.splice(0, o);
    }
  });
}
function Ii(i) {
  return i.drawTicks ? i.tickLength : 0;
}
function al(i, t) {
  if (!i.display) return 0;
  const e = Ct(i.font, t),
    n = Dt(i.padding);
  return (_t(i.text) ? i.text.length : 1) * e.lineHeight + n.height;
}
function dm(i, t) {
  return Be(i, { scale: t, type: "scale" });
}
function fm(i, t, e) {
  return Be(i, { tick: e, index: t, type: "tick" });
}
function pm(i, t, e) {
  let n = $o(i);
  return (((e && t !== "right") || (!e && t === "right")) && (n = cm(n)), n);
}
function gm(i, t, e, n) {
  const { top: o, left: a, bottom: l, right: c, chart: u } = i,
    { chartArea: d, scales: p } = u;
  let m = 0,
    _,
    v,
    x;
  const b = l - o,
    w = c - a;
  if (i.isHorizontal()) {
    if (((v = Ot(n, a, c)), et(e))) {
      const k = Object.keys(e)[0],
        C = e[k];
      x = p[k].getPixelForValue(C) + b - t;
    } else
      e === "center" ? (x = (d.bottom + d.top) / 2 + b - t) : (x = sl(i, e, t));
    _ = c - a;
  } else {
    if (et(e)) {
      const k = Object.keys(e)[0],
        C = e[k];
      v = p[k].getPixelForValue(C) - w + t;
    } else
      e === "center" ? (v = (d.left + d.right) / 2 - w + t) : (v = sl(i, e, t));
    ((x = Ot(n, l, o)), (m = e === "left" ? -kt : kt));
  }
  return { titleX: v, titleY: x, maxWidth: _, rotation: m };
}
class Je extends xe {
  constructor(t) {
    (super(),
      (this.id = t.id),
      (this.type = t.type),
      (this.options = void 0),
      (this.ctx = t.ctx),
      (this.chart = t.chart),
      (this.top = void 0),
      (this.bottom = void 0),
      (this.left = void 0),
      (this.right = void 0),
      (this.width = void 0),
      (this.height = void 0),
      (this._margins = { left: 0, right: 0, top: 0, bottom: 0 }),
      (this.maxWidth = void 0),
      (this.maxHeight = void 0),
      (this.paddingTop = void 0),
      (this.paddingBottom = void 0),
      (this.paddingLeft = void 0),
      (this.paddingRight = void 0),
      (this.axis = void 0),
      (this.labelRotation = void 0),
      (this.min = void 0),
      (this.max = void 0),
      (this._range = void 0),
      (this.ticks = []),
      (this._gridLineItems = null),
      (this._labelItems = null),
      (this._labelSizes = null),
      (this._length = 0),
      (this._maxLength = 0),
      (this._longestTextCache = {}),
      (this._startPixel = void 0),
      (this._endPixel = void 0),
      (this._reversePixels = !1),
      (this._userMax = void 0),
      (this._userMin = void 0),
      (this._suggestedMax = void 0),
      (this._suggestedMin = void 0),
      (this._ticksLength = 0),
      (this._borderValue = 0),
      (this._cache = {}),
      (this._dataLimitsCached = !1),
      (this.$context = void 0));
  }
  init(t) {
    ((this.options = t.setContext(this.getContext())),
      (this.axis = t.axis),
      (this._userMin = this.parse(t.min)),
      (this._userMax = this.parse(t.max)),
      (this._suggestedMin = this.parse(t.suggestedMin)),
      (this._suggestedMax = this.parse(t.suggestedMax)));
  }
  parse(t, e) {
    return t;
  }
  getUserBounds() {
    let { _userMin: t, _userMax: e, _suggestedMin: n, _suggestedMax: o } = this;
    return (
      (t = Vt(t, Number.POSITIVE_INFINITY)),
      (e = Vt(e, Number.NEGATIVE_INFINITY)),
      (n = Vt(n, Number.POSITIVE_INFINITY)),
      (o = Vt(o, Number.NEGATIVE_INFINITY)),
      { min: Vt(t, n), max: Vt(e, o), minDefined: wt(t), maxDefined: wt(e) }
    );
  }
  getMinMax(t) {
    let { min: e, max: n, minDefined: o, maxDefined: a } = this.getUserBounds(),
      l;
    if (o && a) return { min: e, max: n };
    const c = this.getMatchingVisibleMetas();
    for (let u = 0, d = c.length; u < d; ++u)
      ((l = c[u].controller.getMinMax(this, t)),
        o || (e = Math.min(e, l.min)),
        a || (n = Math.max(n, l.max)));
    return (
      (e = a && e > n ? n : e),
      (n = o && e > n ? e : n),
      { min: Vt(e, Vt(n, e)), max: Vt(n, Vt(e, n)) }
    );
  }
  getPadding() {
    return {
      left: this.paddingLeft || 0,
      top: this.paddingTop || 0,
      right: this.paddingRight || 0,
      bottom: this.paddingBottom || 0,
    };
  }
  getTicks() {
    return this.ticks;
  }
  getLabels() {
    const t = this.chart.data;
    return (
      this.options.labels ||
      (this.isHorizontal() ? t.xLabels : t.yLabels) ||
      t.labels ||
      []
    );
  }
  getLabelItems(t = this.chart.chartArea) {
    return this._labelItems || (this._labelItems = this._computeLabelItems(t));
  }
  beforeLayout() {
    ((this._cache = {}), (this._dataLimitsCached = !1));
  }
  beforeUpdate() {
    ft(this.options.beforeUpdate, [this]);
  }
  update(t, e, n) {
    const { beginAtZero: o, grace: a, ticks: l } = this.options,
      c = l.sampleSize;
    (this.beforeUpdate(),
      (this.maxWidth = t),
      (this.maxHeight = e),
      (this._margins = n =
        Object.assign({ left: 0, right: 0, top: 0, bottom: 0 }, n)),
      (this.ticks = null),
      (this._labelSizes = null),
      (this._gridLineItems = null),
      (this._labelItems = null),
      this.beforeSetDimensions(),
      this.setDimensions(),
      this.afterSetDimensions(),
      (this._maxLength = this.isHorizontal()
        ? this.width + n.left + n.right
        : this.height + n.top + n.bottom),
      this._dataLimitsCached ||
        (this.beforeDataLimits(),
        this.determineDataLimits(),
        this.afterDataLimits(),
        (this._range = _p(this, a, o)),
        (this._dataLimitsCached = !0)),
      this.beforeBuildTicks(),
      (this.ticks = this.buildTicks() || []),
      this.afterBuildTicks());
    const u = c < this.ticks.length;
    (this._convertTicksToLabels(u ? rl(this.ticks, c) : this.ticks),
      this.configure(),
      this.beforeCalculateLabelRotation(),
      this.calculateLabelRotation(),
      this.afterCalculateLabelRotation(),
      l.display &&
        (l.autoSkip || l.source === "auto") &&
        ((this.ticks = nm(this, this.ticks)),
        (this._labelSizes = null),
        this.afterAutoSkip()),
      u && this._convertTicksToLabels(this.ticks),
      this.beforeFit(),
      this.fit(),
      this.afterFit(),
      this.afterUpdate());
  }
  configure() {
    let t = this.options.reverse,
      e,
      n;
    (this.isHorizontal()
      ? ((e = this.left), (n = this.right))
      : ((e = this.top), (n = this.bottom), (t = !t)),
      (this._startPixel = e),
      (this._endPixel = n),
      (this._reversePixels = t),
      (this._length = n - e),
      (this._alignToPixels = this.options.alignToPixels));
  }
  afterUpdate() {
    ft(this.options.afterUpdate, [this]);
  }
  beforeSetDimensions() {
    ft(this.options.beforeSetDimensions, [this]);
  }
  setDimensions() {
    (this.isHorizontal()
      ? ((this.width = this.maxWidth),
        (this.left = 0),
        (this.right = this.width))
      : ((this.height = this.maxHeight),
        (this.top = 0),
        (this.bottom = this.height)),
      (this.paddingLeft = 0),
      (this.paddingTop = 0),
      (this.paddingRight = 0),
      (this.paddingBottom = 0));
  }
  afterSetDimensions() {
    ft(this.options.afterSetDimensions, [this]);
  }
  _callHooks(t) {
    (this.chart.notifyPlugins(t, this.getContext()),
      ft(this.options[t], [this]));
  }
  beforeDataLimits() {
    this._callHooks("beforeDataLimits");
  }
  determineDataLimits() {}
  afterDataLimits() {
    this._callHooks("afterDataLimits");
  }
  beforeBuildTicks() {
    this._callHooks("beforeBuildTicks");
  }
  buildTicks() {
    return [];
  }
  afterBuildTicks() {
    this._callHooks("afterBuildTicks");
  }
  beforeTickToLabelConversion() {
    ft(this.options.beforeTickToLabelConversion, [this]);
  }
  generateTickLabels(t) {
    const e = this.options.ticks;
    let n, o, a;
    for (n = 0, o = t.length; n < o; n++)
      ((a = t[n]), (a.label = ft(e.callback, [a.value, n, t], this)));
  }
  afterTickToLabelConversion() {
    ft(this.options.afterTickToLabelConversion, [this]);
  }
  beforeCalculateLabelRotation() {
    ft(this.options.beforeCalculateLabelRotation, [this]);
  }
  calculateLabelRotation() {
    const t = this.options,
      e = t.ticks,
      n = ol(this.ticks.length, t.ticks.maxTicksLimit),
      o = e.minRotation || 0,
      a = e.maxRotation;
    let l = o,
      c,
      u,
      d;
    if (
      !this._isVisible() ||
      !e.display ||
      o >= a ||
      n <= 1 ||
      !this.isHorizontal()
    ) {
      this.labelRotation = o;
      return;
    }
    const p = this._getLabelSizes(),
      m = p.widest.width,
      _ = p.highest.height,
      v = Et(this.chart.width - m, 0, this.maxWidth);
    ((c = t.offset ? this.maxWidth / n : v / (n - 1)),
      m + 6 > c &&
        ((c = v / (n - (t.offset ? 0.5 : 1))),
        (u =
          this.maxHeight -
          Ii(t.grid) -
          e.padding -
          al(t.title, this.chart.options.font)),
        (d = Math.sqrt(m * m + _ * _)),
        (l = Zo(
          Math.min(
            Math.asin(Et((p.highest.height + 6) / c, -1, 1)),
            Math.asin(Et(u / d, -1, 1)) - Math.asin(Et(_ / d, -1, 1)),
          ),
        )),
        (l = Math.max(o, Math.min(a, l)))),
      (this.labelRotation = l));
  }
  afterCalculateLabelRotation() {
    ft(this.options.afterCalculateLabelRotation, [this]);
  }
  afterAutoSkip() {}
  beforeFit() {
    ft(this.options.beforeFit, [this]);
  }
  fit() {
    const t = { width: 0, height: 0 },
      {
        chart: e,
        options: { ticks: n, title: o, grid: a },
      } = this,
      l = this._isVisible(),
      c = this.isHorizontal();
    if (l) {
      const u = al(o, e.options.font);
      if (
        (c
          ? ((t.width = this.maxWidth), (t.height = Ii(a) + u))
          : ((t.height = this.maxHeight), (t.width = Ii(a) + u)),
        n.display && this.ticks.length)
      ) {
        const {
            first: d,
            last: p,
            widest: m,
            highest: _,
          } = this._getLabelSizes(),
          v = n.padding * 2,
          x = Jt(this.labelRotation),
          b = Math.cos(x),
          w = Math.sin(x);
        if (c) {
          const k = n.mirror ? 0 : w * m.width + b * _.height;
          t.height = Math.min(this.maxHeight, t.height + k + v);
        } else {
          const k = n.mirror ? 0 : b * m.width + w * _.height;
          t.width = Math.min(this.maxWidth, t.width + k + v);
        }
        this._calculatePadding(d, p, w, b);
      }
    }
    (this._handleMargins(),
      c
        ? ((this.width = this._length =
            e.width - this._margins.left - this._margins.right),
          (this.height = t.height))
        : ((this.width = t.width),
          (this.height = this._length =
            e.height - this._margins.top - this._margins.bottom)));
  }
  _calculatePadding(t, e, n, o) {
    const {
        ticks: { align: a, padding: l },
        position: c,
      } = this.options,
      u = this.labelRotation !== 0,
      d = c !== "top" && this.axis === "x";
    if (this.isHorizontal()) {
      const p = this.getPixelForTick(0) - this.left,
        m = this.right - this.getPixelForTick(this.ticks.length - 1);
      let _ = 0,
        v = 0;
      (u
        ? d
          ? ((_ = o * t.width), (v = n * e.height))
          : ((_ = n * t.height), (v = o * e.width))
        : a === "start"
          ? (v = e.width)
          : a === "end"
            ? (_ = t.width)
            : a !== "inner" && ((_ = t.width / 2), (v = e.width / 2)),
        (this.paddingLeft = Math.max(
          ((_ - p + l) * this.width) / (this.width - p),
          0,
        )),
        (this.paddingRight = Math.max(
          ((v - m + l) * this.width) / (this.width - m),
          0,
        )));
    } else {
      let p = e.height / 2,
        m = t.height / 2;
      (a === "start"
        ? ((p = 0), (m = t.height))
        : a === "end" && ((p = e.height), (m = 0)),
        (this.paddingTop = p + l),
        (this.paddingBottom = m + l));
    }
  }
  _handleMargins() {
    this._margins &&
      ((this._margins.left = Math.max(this.paddingLeft, this._margins.left)),
      (this._margins.top = Math.max(this.paddingTop, this._margins.top)),
      (this._margins.right = Math.max(this.paddingRight, this._margins.right)),
      (this._margins.bottom = Math.max(
        this.paddingBottom,
        this._margins.bottom,
      )));
  }
  afterFit() {
    ft(this.options.afterFit, [this]);
  }
  isHorizontal() {
    const { axis: t, position: e } = this.options;
    return e === "top" || e === "bottom" || t === "x";
  }
  isFullSize() {
    return this.options.fullSize;
  }
  _convertTicksToLabels(t) {
    (this.beforeTickToLabelConversion(), this.generateTickLabels(t));
    let e, n;
    for (e = 0, n = t.length; e < n; e++)
      tt(t[e].label) && (t.splice(e, 1), n--, e--);
    this.afterTickToLabelConversion();
  }
  _getLabelSizes() {
    let t = this._labelSizes;
    if (!t) {
      const e = this.options.ticks.sampleSize;
      let n = this.ticks;
      (e < n.length && (n = rl(n, e)),
        (this._labelSizes = t =
          this._computeLabelSizes(
            n,
            n.length,
            this.options.ticks.maxTicksLimit,
          )));
    }
    return t;
  }
  _computeLabelSizes(t, e, n) {
    const { ctx: o, _longestTextCache: a } = this,
      l = [],
      c = [],
      u = Math.floor(e / ol(e, n));
    let d = 0,
      p = 0,
      m,
      _,
      v,
      x,
      b,
      w,
      k,
      C,
      E,
      A,
      T;
    for (m = 0; m < e; m += u) {
      if (
        ((x = t[m].label),
        (b = this._resolveTickFontOptions(m)),
        (o.font = w = b.string),
        (k = a[w] = a[w] || { data: {}, gc: [] }),
        (C = b.lineHeight),
        (E = A = 0),
        !tt(x) && !_t(x))
      )
        ((E = Un(o, k.data, k.gc, E, x)), (A = C));
      else if (_t(x))
        for (_ = 0, v = x.length; _ < v; ++_)
          ((T = x[_]),
            !tt(T) && !_t(T) && ((E = Un(o, k.data, k.gc, E, T)), (A += C)));
      (l.push(E), c.push(A), (d = Math.max(E, d)), (p = Math.max(A, p)));
    }
    um(a, e);
    const B = l.indexOf(d),
      D = c.indexOf(p),
      R = (H) => ({ width: l[H] || 0, height: c[H] || 0 });
    return {
      first: R(0),
      last: R(e - 1),
      widest: R(B),
      highest: R(D),
      widths: l,
      heights: c,
    };
  }
  getLabelForValue(t) {
    return t;
  }
  getPixelForValue(t, e) {
    return NaN;
  }
  getValueForPixel(t) {}
  getPixelForTick(t) {
    const e = this.ticks;
    return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t].value);
  }
  getPixelForDecimal(t) {
    this._reversePixels && (t = 1 - t);
    const e = this._startPixel + t * this._length;
    return Uf(this._alignToPixels ? Ve(this.chart, e, 0) : e);
  }
  getDecimalForPixel(t) {
    const e = (t - this._startPixel) / this._length;
    return this._reversePixels ? 1 - e : e;
  }
  getBasePixel() {
    return this.getPixelForValue(this.getBaseValue());
  }
  getBaseValue() {
    const { min: t, max: e } = this;
    return t < 0 && e < 0 ? e : t > 0 && e > 0 ? t : 0;
  }
  getContext(t) {
    const e = this.ticks || [];
    if (t >= 0 && t < e.length) {
      const n = e[t];
      return n.$context || (n.$context = fm(this.getContext(), t, n));
    }
    return this.$context || (this.$context = dm(this.chart.getContext(), this));
  }
  _tickSize() {
    const t = this.options.ticks,
      e = Jt(this.labelRotation),
      n = Math.abs(Math.cos(e)),
      o = Math.abs(Math.sin(e)),
      a = this._getLabelSizes(),
      l = t.autoSkipPadding || 0,
      c = a ? a.widest.width + l : 0,
      u = a ? a.highest.height + l : 0;
    return this.isHorizontal()
      ? u * n > c * o
        ? c / n
        : u / o
      : u * o < c * n
        ? u / n
        : c / o;
  }
  _isVisible() {
    const t = this.options.display;
    return t !== "auto" ? !!t : this.getMatchingVisibleMetas().length > 0;
  }
  _computeGridLineItems(t) {
    const e = this.axis,
      n = this.chart,
      o = this.options,
      { grid: a, position: l, border: c } = o,
      u = a.offset,
      d = this.isHorizontal(),
      m = this.ticks.length + (u ? 1 : 0),
      _ = Ii(a),
      v = [],
      x = c.setContext(this.getContext()),
      b = x.display ? x.width : 0,
      w = b / 2,
      k = function (Y) {
        return Ve(n, Y, b);
      };
    let C, E, A, T, B, D, R, H, U, W, j, xt;
    if (l === "top")
      ((C = k(this.bottom)),
        (D = this.bottom - _),
        (H = C - w),
        (W = k(t.top) + w),
        (xt = t.bottom));
    else if (l === "bottom")
      ((C = k(this.top)),
        (W = t.top),
        (xt = k(t.bottom) - w),
        (D = C + w),
        (H = this.top + _));
    else if (l === "left")
      ((C = k(this.right)),
        (B = this.right - _),
        (R = C - w),
        (U = k(t.left) + w),
        (j = t.right));
    else if (l === "right")
      ((C = k(this.left)),
        (U = t.left),
        (j = k(t.right) - w),
        (B = C + w),
        (R = this.left + _));
    else if (e === "x") {
      if (l === "center") C = k((t.top + t.bottom) / 2 + 0.5);
      else if (et(l)) {
        const Y = Object.keys(l)[0],
          ct = l[Y];
        C = k(this.chart.scales[Y].getPixelForValue(ct));
      }
      ((W = t.top), (xt = t.bottom), (D = C + w), (H = D + _));
    } else if (e === "y") {
      if (l === "center") C = k((t.left + t.right) / 2);
      else if (et(l)) {
        const Y = Object.keys(l)[0],
          ct = l[Y];
        C = k(this.chart.scales[Y].getPixelForValue(ct));
      }
      ((B = C - w), (R = B - _), (U = t.left), (j = t.right));
    }
    const ut = q(o.ticks.maxTicksLimit, m),
      rt = Math.max(1, Math.ceil(m / ut));
    for (E = 0; E < m; E += rt) {
      const Y = this.getContext(E),
        ct = a.setContext(Y),
        F = c.setContext(Y),
        pt = ct.lineWidth,
        V = ct.color,
        nt = F.dash || [],
        mt = F.dashOffset,
        vt = ct.tickWidth,
        Q = ct.tickColor,
        st = ct.tickBorderDash || [],
        G = ct.tickBorderDashOffset;
      ((A = hm(this, E, u)),
        A !== void 0 &&
          ((T = Ve(n, A, pt)),
          d ? (B = R = U = j = T) : (D = H = W = xt = T),
          v.push({
            tx1: B,
            ty1: D,
            tx2: R,
            ty2: H,
            x1: U,
            y1: W,
            x2: j,
            y2: xt,
            width: pt,
            color: V,
            borderDash: nt,
            borderDashOffset: mt,
            tickWidth: vt,
            tickColor: Q,
            tickBorderDash: st,
            tickBorderDashOffset: G,
          })));
    }
    return ((this._ticksLength = m), (this._borderValue = C), v);
  }
  _computeLabelItems(t) {
    const e = this.axis,
      n = this.options,
      { position: o, ticks: a } = n,
      l = this.isHorizontal(),
      c = this.ticks,
      { align: u, crossAlign: d, padding: p, mirror: m } = a,
      _ = Ii(n.grid),
      v = _ + p,
      x = m ? -p : v,
      b = -Jt(this.labelRotation),
      w = [];
    let k,
      C,
      E,
      A,
      T,
      B,
      D,
      R,
      H,
      U,
      W,
      j,
      xt = "middle";
    if (o === "top")
      ((B = this.bottom - x), (D = this._getXAxisLabelAlignment()));
    else if (o === "bottom")
      ((B = this.top + x), (D = this._getXAxisLabelAlignment()));
    else if (o === "left") {
      const rt = this._getYAxisLabelAlignment(_);
      ((D = rt.textAlign), (T = rt.x));
    } else if (o === "right") {
      const rt = this._getYAxisLabelAlignment(_);
      ((D = rt.textAlign), (T = rt.x));
    } else if (e === "x") {
      if (o === "center") B = (t.top + t.bottom) / 2 + v;
      else if (et(o)) {
        const rt = Object.keys(o)[0],
          Y = o[rt];
        B = this.chart.scales[rt].getPixelForValue(Y) + v;
      }
      D = this._getXAxisLabelAlignment();
    } else if (e === "y") {
      if (o === "center") T = (t.left + t.right) / 2 - v;
      else if (et(o)) {
        const rt = Object.keys(o)[0],
          Y = o[rt];
        T = this.chart.scales[rt].getPixelForValue(Y);
      }
      D = this._getYAxisLabelAlignment(_).textAlign;
    }
    e === "y" &&
      (u === "start" ? (xt = "top") : u === "end" && (xt = "bottom"));
    const ut = this._getLabelSizes();
    for (k = 0, C = c.length; k < C; ++k) {
      ((E = c[k]), (A = E.label));
      const rt = a.setContext(this.getContext(k));
      ((R = this.getPixelForTick(k) + a.labelOffset),
        (H = this._resolveTickFontOptions(k)),
        (U = H.lineHeight),
        (W = _t(A) ? A.length : 1));
      const Y = W / 2,
        ct = rt.color,
        F = rt.textStrokeColor,
        pt = rt.textStrokeWidth;
      let V = D;
      l
        ? ((T = R),
          D === "inner" &&
            (k === C - 1
              ? (V = this.options.reverse ? "left" : "right")
              : k === 0
                ? (V = this.options.reverse ? "right" : "left")
                : (V = "center")),
          o === "top"
            ? d === "near" || b !== 0
              ? (j = -W * U + U / 2)
              : d === "center"
                ? (j = -ut.highest.height / 2 - Y * U + U)
                : (j = -ut.highest.height + U / 2)
            : d === "near" || b !== 0
              ? (j = U / 2)
              : d === "center"
                ? (j = ut.highest.height / 2 - Y * U)
                : (j = ut.highest.height - W * U),
          m && (j *= -1),
          b !== 0 && !rt.showLabelBackdrop && (T += (U / 2) * Math.sin(b)))
        : ((B = R), (j = ((1 - W) * U) / 2));
      let nt;
      if (rt.showLabelBackdrop) {
        const mt = Dt(rt.backdropPadding),
          vt = ut.heights[k],
          Q = ut.widths[k];
        let st = j - mt.top,
          G = 0 - mt.left;
        switch (xt) {
          case "middle":
            st -= vt / 2;
            break;
          case "bottom":
            st -= vt;
            break;
        }
        switch (D) {
          case "center":
            G -= Q / 2;
            break;
          case "right":
            G -= Q;
            break;
          case "inner":
            k === C - 1 ? (G -= Q) : k > 0 && (G -= Q / 2);
            break;
        }
        nt = {
          left: G,
          top: st,
          width: Q + mt.width,
          height: vt + mt.height,
          color: rt.backdropColor,
        };
      }
      w.push({
        label: A,
        font: H,
        textOffset: j,
        options: {
          rotation: b,
          color: ct,
          strokeColor: F,
          strokeWidth: pt,
          textAlign: V,
          textBaseline: xt,
          translation: [T, B],
          backdrop: nt,
        },
      });
    }
    return w;
  }
  _getXAxisLabelAlignment() {
    const { position: t, ticks: e } = this.options;
    if (-Jt(this.labelRotation)) return t === "top" ? "left" : "right";
    let o = "center";
    return (
      e.align === "start"
        ? (o = "left")
        : e.align === "end"
          ? (o = "right")
          : e.align === "inner" && (o = "inner"),
      o
    );
  }
  _getYAxisLabelAlignment(t) {
    const {
        position: e,
        ticks: { crossAlign: n, mirror: o, padding: a },
      } = this.options,
      l = this._getLabelSizes(),
      c = t + a,
      u = l.widest.width;
    let d, p;
    return (
      e === "left"
        ? o
          ? ((p = this.right + a),
            n === "near"
              ? (d = "left")
              : n === "center"
                ? ((d = "center"), (p += u / 2))
                : ((d = "right"), (p += u)))
          : ((p = this.right - c),
            n === "near"
              ? (d = "right")
              : n === "center"
                ? ((d = "center"), (p -= u / 2))
                : ((d = "left"), (p = this.left)))
        : e === "right"
          ? o
            ? ((p = this.left + a),
              n === "near"
                ? (d = "right")
                : n === "center"
                  ? ((d = "center"), (p -= u / 2))
                  : ((d = "left"), (p -= u)))
            : ((p = this.left + c),
              n === "near"
                ? (d = "left")
                : n === "center"
                  ? ((d = "center"), (p += u / 2))
                  : ((d = "right"), (p = this.right)))
          : (d = "right"),
      { textAlign: d, x: p }
    );
  }
  _computeLabelArea() {
    if (this.options.ticks.mirror) return;
    const t = this.chart,
      e = this.options.position;
    if (e === "left" || e === "right")
      return { top: 0, left: this.left, bottom: t.height, right: this.right };
    if (e === "top" || e === "bottom")
      return { top: this.top, left: 0, bottom: this.bottom, right: t.width };
  }
  drawBackground() {
    const {
      ctx: t,
      options: { backgroundColor: e },
      left: n,
      top: o,
      width: a,
      height: l,
    } = this;
    e && (t.save(), (t.fillStyle = e), t.fillRect(n, o, a, l), t.restore());
  }
  getLineWidthForValue(t) {
    const e = this.options.grid;
    if (!this._isVisible() || !e.display) return 0;
    const o = this.ticks.findIndex((a) => a.value === t);
    return o >= 0 ? e.setContext(this.getContext(o)).lineWidth : 0;
  }
  drawGrid(t) {
    const e = this.options.grid,
      n = this.ctx,
      o =
        this._gridLineItems ||
        (this._gridLineItems = this._computeGridLineItems(t));
    let a, l;
    const c = (u, d, p) => {
      !p.width ||
        !p.color ||
        (n.save(),
        (n.lineWidth = p.width),
        (n.strokeStyle = p.color),
        n.setLineDash(p.borderDash || []),
        (n.lineDashOffset = p.borderDashOffset),
        n.beginPath(),
        n.moveTo(u.x, u.y),
        n.lineTo(d.x, d.y),
        n.stroke(),
        n.restore());
    };
    if (e.display)
      for (a = 0, l = o.length; a < l; ++a) {
        const u = o[a];
        (e.drawOnChartArea && c({ x: u.x1, y: u.y1 }, { x: u.x2, y: u.y2 }, u),
          e.drawTicks &&
            c(
              { x: u.tx1, y: u.ty1 },
              { x: u.tx2, y: u.ty2 },
              {
                color: u.tickColor,
                width: u.tickWidth,
                borderDash: u.tickBorderDash,
                borderDashOffset: u.tickBorderDashOffset,
              },
            ));
      }
  }
  drawBorder() {
    const {
        chart: t,
        ctx: e,
        options: { border: n, grid: o },
      } = this,
      a = n.setContext(this.getContext()),
      l = n.display ? a.width : 0;
    if (!l) return;
    const c = o.setContext(this.getContext(0)).lineWidth,
      u = this._borderValue;
    let d, p, m, _;
    (this.isHorizontal()
      ? ((d = Ve(t, this.left, l) - l / 2),
        (p = Ve(t, this.right, c) + c / 2),
        (m = _ = u))
      : ((m = Ve(t, this.top, l) - l / 2),
        (_ = Ve(t, this.bottom, c) + c / 2),
        (d = p = u)),
      e.save(),
      (e.lineWidth = a.width),
      (e.strokeStyle = a.color),
      e.beginPath(),
      e.moveTo(d, m),
      e.lineTo(p, _),
      e.stroke(),
      e.restore());
  }
  drawLabels(t) {
    if (!this.options.ticks.display) return;
    const n = this.ctx,
      o = this._computeLabelArea();
    o && as(n, o);
    const a = this.getLabelItems(t);
    for (const l of a) {
      const c = l.options,
        u = l.font,
        d = l.label,
        p = l.textOffset;
      Xe(n, d, 0, p, u, c);
    }
    o && ls(n);
  }
  drawTitle() {
    const {
      ctx: t,
      options: { position: e, title: n, reverse: o },
    } = this;
    if (!n.display) return;
    const a = Ct(n.font),
      l = Dt(n.padding),
      c = n.align;
    let u = a.lineHeight / 2;
    e === "bottom" || e === "center" || et(e)
      ? ((u += l.bottom),
        _t(n.text) && (u += a.lineHeight * (n.text.length - 1)))
      : (u += l.top);
    const {
      titleX: d,
      titleY: p,
      maxWidth: m,
      rotation: _,
    } = gm(this, u, e, c);
    Xe(t, n.text, 0, 0, a, {
      color: n.color,
      maxWidth: m,
      rotation: _,
      textAlign: pm(c, e, o),
      textBaseline: "middle",
      translation: [d, p],
    });
  }
  draw(t) {
    this._isVisible() &&
      (this.drawBackground(),
      this.drawGrid(t),
      this.drawBorder(),
      this.drawTitle(),
      this.drawLabels(t));
  }
  _layers() {
    const t = this.options,
      e = (t.ticks && t.ticks.z) || 0,
      n = q(t.grid && t.grid.z, -1),
      o = q(t.border && t.border.z, 0);
    return !this._isVisible() || this.draw !== Je.prototype.draw
      ? [
          {
            z: e,
            draw: (a) => {
              this.draw(a);
            },
          },
        ]
      : [
          {
            z: n,
            draw: (a) => {
              (this.drawBackground(), this.drawGrid(a), this.drawTitle());
            },
          },
          {
            z: o,
            draw: () => {
              this.drawBorder();
            },
          },
          {
            z: e,
            draw: (a) => {
              this.drawLabels(a);
            },
          },
        ];
  }
  getMatchingVisibleMetas(t) {
    const e = this.chart.getSortedVisibleDatasetMetas(),
      n = this.axis + "AxisID",
      o = [];
    let a, l;
    for (a = 0, l = e.length; a < l; ++a) {
      const c = e[a];
      c[n] === this.id && (!t || c.type === t) && o.push(c);
    }
    return o;
  }
  _resolveTickFontOptions(t) {
    const e = this.options.ticks.setContext(this.getContext(t));
    return Ct(e.font);
  }
  _maxDigits() {
    const t = this._resolveTickFontOptions(0).lineHeight;
    return (this.isHorizontal() ? this.width : this.height) / t;
  }
}
class On {
  constructor(t, e, n) {
    ((this.type = t),
      (this.scope = e),
      (this.override = n),
      (this.items = Object.create(null)));
  }
  isForType(t) {
    return Object.prototype.isPrototypeOf.call(
      this.type.prototype,
      t.prototype,
    );
  }
  register(t) {
    const e = Object.getPrototypeOf(t);
    let n;
    ym(e) && (n = this.register(e));
    const o = this.items,
      a = t.id,
      l = this.scope + "." + a;
    if (!a) throw new Error("class does not have id: " + t);
    return (
      a in o ||
        ((o[a] = t),
        mm(t, l, n),
        this.override && yt.override(t.id, t.overrides)),
      l
    );
  }
  get(t) {
    return this.items[t];
  }
  unregister(t) {
    const e = this.items,
      n = t.id,
      o = this.scope;
    (n in e && delete e[n],
      o && n in yt[o] && (delete yt[o][n], this.override && delete Ke[n]));
  }
}
function mm(i, t, e) {
  const n = Ui(Object.create(null), [
    e ? yt.get(e) : {},
    yt.get(t),
    i.defaults,
  ]);
  (yt.set(t, n),
    i.defaultRoutes && _m(t, i.defaultRoutes),
    i.descriptors && yt.describe(t, i.descriptors));
}
function _m(i, t) {
  Object.keys(t).forEach((e) => {
    const n = e.split("."),
      o = n.pop(),
      a = [i].concat(n).join("."),
      l = t[e].split("."),
      c = l.pop(),
      u = l.join(".");
    yt.route(a, o, u, c);
  });
}
function ym(i) {
  return "id" in i && "defaults" in i;
}
class vm {
  constructor() {
    ((this.controllers = new On(De, "datasets", !0)),
      (this.elements = new On(xe, "elements")),
      (this.plugins = new On(Object, "plugins")),
      (this.scales = new On(Je, "scales")),
      (this._typedRegistries = [this.controllers, this.scales, this.elements]));
  }
  add(...t) {
    this._each("register", t);
  }
  remove(...t) {
    this._each("unregister", t);
  }
  addControllers(...t) {
    this._each("register", t, this.controllers);
  }
  addElements(...t) {
    this._each("register", t, this.elements);
  }
  addPlugins(...t) {
    this._each("register", t, this.plugins);
  }
  addScales(...t) {
    this._each("register", t, this.scales);
  }
  getController(t) {
    return this._get(t, this.controllers, "controller");
  }
  getElement(t) {
    return this._get(t, this.elements, "element");
  }
  getPlugin(t) {
    return this._get(t, this.plugins, "plugin");
  }
  getScale(t) {
    return this._get(t, this.scales, "scale");
  }
  removeControllers(...t) {
    this._each("unregister", t, this.controllers);
  }
  removeElements(...t) {
    this._each("unregister", t, this.elements);
  }
  removePlugins(...t) {
    this._each("unregister", t, this.plugins);
  }
  removeScales(...t) {
    this._each("unregister", t, this.scales);
  }
  _each(t, e, n) {
    [...e].forEach((o) => {
      const a = n || this._getRegistryForType(o);
      n || a.isForType(o) || (a === this.plugins && o.id)
        ? this._exec(t, a, o)
        : ht(o, (l) => {
            const c = n || this._getRegistryForType(l);
            this._exec(t, c, l);
          });
    });
  }
  _exec(t, e, n) {
    const o = Vo(t);
    (ft(n["before" + o], [], n), e[t](n), ft(n["after" + o], [], n));
  }
  _getRegistryForType(t) {
    for (let e = 0; e < this._typedRegistries.length; e++) {
      const n = this._typedRegistries[e];
      if (n.isForType(t)) return n;
    }
    return this.plugins;
  }
  _get(t, e, n) {
    const o = e.get(t);
    if (o === void 0)
      throw new Error('"' + t + '" is not a registered ' + n + ".");
    return o;
  }
}
var se = new vm();
class bm {
  constructor() {
    this._init = void 0;
  }
  notify(t, e, n, o) {
    if (
      (e === "beforeInit" &&
        ((this._init = this._createDescriptors(t, !0)),
        this._notify(this._init, t, "install")),
      this._init === void 0)
    )
      return;
    const a = o ? this._descriptors(t).filter(o) : this._descriptors(t),
      l = this._notify(a, t, e, n);
    return (
      e === "afterDestroy" &&
        (this._notify(a, t, "stop"),
        this._notify(this._init, t, "uninstall"),
        (this._init = void 0)),
      l
    );
  }
  _notify(t, e, n, o) {
    o = o || {};
    for (const a of t) {
      const l = a.plugin,
        c = l[n],
        u = [e, o, a.options];
      if (ft(c, u, l) === !1 && o.cancelable) return !1;
    }
    return !0;
  }
  invalidate() {
    tt(this._cache) || ((this._oldCache = this._cache), (this._cache = void 0));
  }
  _descriptors(t) {
    if (this._cache) return this._cache;
    const e = (this._cache = this._createDescriptors(t));
    return (this._notifyStateChanges(t), e);
  }
  _createDescriptors(t, e) {
    const n = t && t.config,
      o = q(n.options && n.options.plugins, {}),
      a = xm(n);
    return o === !1 && !e ? [] : Pm(t, a, o, e);
  }
  _notifyStateChanges(t) {
    const e = this._oldCache || [],
      n = this._cache,
      o = (a, l) =>
        a.filter((c) => !l.some((u) => c.plugin.id === u.plugin.id));
    (this._notify(o(e, n), t, "stop"), this._notify(o(n, e), t, "start"));
  }
}
function xm(i) {
  const t = {},
    e = [],
    n = Object.keys(se.plugins.items);
  for (let a = 0; a < n.length; a++) e.push(se.getPlugin(n[a]));
  const o = i.plugins || [];
  for (let a = 0; a < o.length; a++) {
    const l = o[a];
    e.indexOf(l) === -1 && (e.push(l), (t[l.id] = !0));
  }
  return { plugins: e, localIds: t };
}
function wm(i, t) {
  return !t && i === !1 ? null : i === !0 ? {} : i;
}
function Pm(i, { plugins: t, localIds: e }, n, o) {
  const a = [],
    l = i.getContext();
  for (const c of t) {
    const u = c.id,
      d = wm(n[u], o);
    d !== null &&
      a.push({
        plugin: c,
        options: km(i.config, { plugin: c, local: e[u] }, d, l),
      });
  }
  return a;
}
function km(i, { plugin: t, local: e }, n, o) {
  const a = i.pluginScopeKeys(t),
    l = i.getOptionScopes(n, a);
  return (
    e && t.defaults && l.push(t.defaults),
    i.createResolver(l, o, [""], { scriptable: !1, indexable: !1, allKeys: !0 })
  );
}
function ko(i, t) {
  const e = yt.datasets[i] || {};
  return (
    ((t.datasets || {})[i] || {}).indexAxis || t.indexAxis || e.indexAxis || "x"
  );
}
function Sm(i, t) {
  let e = i;
  return (
    i === "_index_" ? (e = t) : i === "_value_" && (e = t === "x" ? "y" : "x"),
    e
  );
}
function Mm(i, t) {
  return i === t ? "_index_" : "_value_";
}
function ll(i) {
  if (i === "x" || i === "y" || i === "r") return i;
}
function Lm(i) {
  if (i === "top" || i === "bottom") return "x";
  if (i === "left" || i === "right") return "y";
}
function So(i, ...t) {
  if (ll(i)) return i;
  for (const e of t) {
    const n =
      e.axis || Lm(e.position) || (i.length > 1 && ll(i[0].toLowerCase()));
    if (n) return n;
  }
  throw new Error(
    `Cannot determine type of '${i}' axis. Please provide 'axis' or 'position' option.`,
  );
}
function cl(i, t, e) {
  if (e[t + "AxisID"] === i) return { axis: t };
}
function Cm(i, t) {
  if (t.data && t.data.datasets) {
    const e = t.data.datasets.filter((n) => n.xAxisID === i || n.yAxisID === i);
    if (e.length) return cl(i, "x", e[0]) || cl(i, "y", e[0]);
  }
  return {};
}
function Tm(i, t) {
  const e = Ke[i.type] || { scales: {} },
    n = t.scales || {},
    o = ko(i.type, t),
    a = Object.create(null);
  return (
    Object.keys(n).forEach((l) => {
      const c = n[l];
      if (!et(c))
        return console.error(`Invalid scale configuration for scale: ${l}`);
      if (c._proxy)
        return console.warn(
          `Ignoring resolver passed as options for scale: ${l}`,
        );
      const u = So(l, c, Cm(l, i), yt.scales[c.type]),
        d = Mm(u, o),
        p = e.scales || {};
      a[l] = Wi(Object.create(null), [{ axis: u }, c, p[u], p[d]]);
    }),
    i.data.datasets.forEach((l) => {
      const c = l.type || i.type,
        u = l.indexAxis || ko(c, t),
        p = (Ke[c] || {}).scales || {};
      Object.keys(p).forEach((m) => {
        const _ = Sm(m, u),
          v = l[_ + "AxisID"] || _;
        ((a[v] = a[v] || Object.create(null)),
          Wi(a[v], [{ axis: _ }, n[v], p[m]]));
      });
    }),
    Object.keys(a).forEach((l) => {
      const c = a[l];
      Wi(c, [yt.scales[c.type], yt.scale]);
    }),
    a
  );
}
function Xc(i) {
  const t = i.options || (i.options = {});
  ((t.plugins = q(t.plugins, {})), (t.scales = Tm(i, t)));
}
function Jc(i) {
  return (
    (i = i || {}),
    (i.datasets = i.datasets || []),
    (i.labels = i.labels || []),
    i
  );
}
function Em(i) {
  return ((i = i || {}), (i.data = Jc(i.data)), Xc(i), i);
}
const hl = new Map(),
  Qc = new Set();
function In(i, t) {
  let e = hl.get(i);
  return (e || ((e = t()), hl.set(i, e), Qc.add(e)), e);
}
const Bi = (i, t, e) => {
  const n = Oe(t, e);
  n !== void 0 && i.add(n);
};
class Am {
  constructor(t) {
    ((this._config = Em(t)),
      (this._scopeCache = new Map()),
      (this._resolverCache = new Map()));
  }
  get platform() {
    return this._config.platform;
  }
  get type() {
    return this._config.type;
  }
  set type(t) {
    this._config.type = t;
  }
  get data() {
    return this._config.data;
  }
  set data(t) {
    this._config.data = Jc(t);
  }
  get options() {
    return this._config.options;
  }
  set options(t) {
    this._config.options = t;
  }
  get plugins() {
    return this._config.plugins;
  }
  update() {
    const t = this._config;
    (this.clearCache(), Xc(t));
  }
  clearCache() {
    (this._scopeCache.clear(), this._resolverCache.clear());
  }
  datasetScopeKeys(t) {
    return In(t, () => [[`datasets.${t}`, ""]]);
  }
  datasetAnimationScopeKeys(t, e) {
    return In(`${t}.transition.${e}`, () => [
      [`datasets.${t}.transitions.${e}`, `transitions.${e}`],
      [`datasets.${t}`, ""],
    ]);
  }
  datasetElementScopeKeys(t, e) {
    return In(`${t}-${e}`, () => [
      [`datasets.${t}.elements.${e}`, `datasets.${t}`, `elements.${e}`, ""],
    ]);
  }
  pluginScopeKeys(t) {
    const e = t.id,
      n = this.type;
    return In(`${n}-plugin-${e}`, () => [
      [`plugins.${e}`, ...(t.additionalOptionScopes || [])],
    ]);
  }
  _cachedScopes(t, e) {
    const n = this._scopeCache;
    let o = n.get(t);
    return ((!o || e) && ((o = new Map()), n.set(t, o)), o);
  }
  getOptionScopes(t, e, n) {
    const { options: o, type: a } = this,
      l = this._cachedScopes(t, n),
      c = l.get(e);
    if (c) return c;
    const u = new Set();
    e.forEach((p) => {
      (t && (u.add(t), p.forEach((m) => Bi(u, t, m))),
        p.forEach((m) => Bi(u, o, m)),
        p.forEach((m) => Bi(u, Ke[a] || {}, m)),
        p.forEach((m) => Bi(u, yt, m)),
        p.forEach((m) => Bi(u, wo, m)));
    });
    const d = Array.from(u);
    return (
      d.length === 0 && d.push(Object.create(null)),
      Qc.has(e) && l.set(e, d),
      d
    );
  }
  chartOptionScopes() {
    const { options: t, type: e } = this;
    return [t, Ke[e] || {}, yt.datasets[e] || {}, { type: e }, yt, wo];
  }
  resolveNamedOptions(t, e, n, o = [""]) {
    const a = { $shared: !0 },
      { resolver: l, subPrefixes: c } = ul(this._resolverCache, t, o);
    let u = l;
    if (Im(l, e)) {
      ((a.$shared = !1), (n = Ie(n) ? n() : n));
      const d = this.createResolver(t, n, c);
      u = di(l, n, d);
    }
    for (const d of e) a[d] = u[d];
    return a;
  }
  createResolver(t, e, n = [""], o) {
    const { resolver: a } = ul(this._resolverCache, t, n);
    return et(e) ? di(a, e, void 0, o) : a;
  }
}
function ul(i, t, e) {
  let n = i.get(t);
  n || ((n = new Map()), i.set(t, n));
  const o = e.join();
  let a = n.get(o);
  return (
    a ||
      ((a = {
        resolver: Yo(t, e),
        subPrefixes: e.filter((c) => !c.toLowerCase().includes("hover")),
      }),
      n.set(o, a)),
    a
  );
}
const Om = (i) => et(i) && Object.getOwnPropertyNames(i).some((t) => Ie(i[t]));
function Im(i, t) {
  const { isScriptable: e, isIndexable: n } = Ec(i);
  for (const o of t) {
    const a = e(o),
      l = n(o),
      c = (l || a) && i[o];
    if ((a && (Ie(c) || Om(c))) || (l && _t(c))) return !0;
  }
  return !1;
}
var Bm = "4.5.1";
const Dm = ["top", "bottom", "left", "right", "chartArea"];
function dl(i, t) {
  return i === "top" || i === "bottom" || (Dm.indexOf(i) === -1 && t === "x");
}
function fl(i, t) {
  return function (e, n) {
    return e[i] === n[i] ? e[t] - n[t] : e[i] - n[i];
  };
}
function pl(i) {
  const t = i.chart,
    e = t.options.animation;
  (t.notifyPlugins("afterRender"), ft(e && e.onComplete, [i], t));
}
function Rm(i) {
  const t = i.chart,
    e = t.options.animation;
  ft(e && e.onProgress, [i], t);
}
function th(i) {
  return (
    Xo() && typeof i == "string"
      ? (i = document.getElementById(i))
      : i && i.length && (i = i[0]),
    i && i.canvas && (i = i.canvas),
    i
  );
}
const Vn = {},
  gl = (i) => {
    const t = th(i);
    return Object.values(Vn)
      .filter((e) => e.canvas === t)
      .pop();
  };
function zm(i, t, e) {
  const n = Object.keys(i);
  for (const o of n) {
    const a = +o;
    if (a >= t) {
      const l = i[o];
      (delete i[o], (e > 0 || a > t) && (i[a + e] = l));
    }
  }
}
function Nm(i, t, e, n) {
  return !e || i.type === "mouseout" ? null : n ? t : i;
}
class er {
  static defaults = yt;
  static instances = Vn;
  static overrides = Ke;
  static registry = se;
  static version = Bm;
  static getChart = gl;
  static register(...t) {
    (se.add(...t), ml());
  }
  static unregister(...t) {
    (se.remove(...t), ml());
  }
  constructor(t, e) {
    const n = (this.config = new Am(e)),
      o = th(t),
      a = gl(o);
    if (a)
      throw new Error(
        "Canvas is already in use. Chart with ID '" +
          a.id +
          "' must be destroyed before the canvas with ID '" +
          a.canvas.id +
          "' can be reused.",
      );
    const l = n.createResolver(n.chartOptionScopes(), this.getContext());
    ((this.platform = new (n.platform || im(o))()),
      this.platform.updateConfig(n));
    const c = this.platform.acquireContext(o, l.aspectRatio),
      u = c && c.canvas,
      d = u && u.height,
      p = u && u.width;
    if (
      ((this.id = If()),
      (this.ctx = c),
      (this.canvas = u),
      (this.width = p),
      (this.height = d),
      (this._options = l),
      (this._aspectRatio = this.aspectRatio),
      (this._layers = []),
      (this._metasets = []),
      (this._stacks = void 0),
      (this.boxes = []),
      (this.currentDevicePixelRatio = void 0),
      (this.chartArea = void 0),
      (this._active = []),
      (this._lastEvent = void 0),
      (this._listeners = {}),
      (this._responsiveListeners = void 0),
      (this._sortedMetasets = []),
      (this.scales = {}),
      (this._plugins = new bm()),
      (this.$proxies = {}),
      (this._hiddenIndices = {}),
      (this.attached = !1),
      (this._animationsDisabled = void 0),
      (this.$context = void 0),
      (this._doResize = Kf((m) => this.update(m), l.resizeDelay || 0)),
      (this._dataChanges = []),
      (Vn[this.id] = this),
      !c || !u)
    ) {
      console.error(
        "Failed to create chart: can't acquire context from the given item",
      );
      return;
    }
    (ge.listen(this, "complete", pl),
      ge.listen(this, "progress", Rm),
      this._initialize(),
      this.attached && this.update());
  }
  get aspectRatio() {
    const {
      options: { aspectRatio: t, maintainAspectRatio: e },
      width: n,
      height: o,
      _aspectRatio: a,
    } = this;
    return tt(t) ? (e && a ? a : o ? n / o : null) : t;
  }
  get data() {
    return this.config.data;
  }
  set data(t) {
    this.config.data = t;
  }
  get options() {
    return this._options;
  }
  set options(t) {
    this.config.options = t;
  }
  get registry() {
    return se;
  }
  _initialize() {
    return (
      this.notifyPlugins("beforeInit"),
      this.options.responsive
        ? this.resize()
        : Na(this, this.options.devicePixelRatio),
      this.bindEvents(),
      this.notifyPlugins("afterInit"),
      this
    );
  }
  clear() {
    return (Da(this.canvas, this.ctx), this);
  }
  stop() {
    return (ge.stop(this), this);
  }
  resize(t, e) {
    ge.running(this)
      ? (this._resizeBeforeDraw = { width: t, height: e })
      : this._resize(t, e);
  }
  _resize(t, e) {
    const n = this.options,
      o = this.canvas,
      a = n.maintainAspectRatio && this.aspectRatio,
      l = this.platform.getMaximumSize(o, t, e, a),
      c = n.devicePixelRatio || this.platform.getDevicePixelRatio(),
      u = this.width ? "resize" : "attach";
    ((this.width = l.width),
      (this.height = l.height),
      (this._aspectRatio = this.aspectRatio),
      Na(this, c, !0) &&
        (this.notifyPlugins("resize", { size: l }),
        ft(n.onResize, [this, l], this),
        this.attached && this._doResize(u) && this.render()));
  }
  ensureScalesHaveIDs() {
    const e = this.options.scales || {};
    ht(e, (n, o) => {
      n.id = o;
    });
  }
  buildOrUpdateScales() {
    const t = this.options,
      e = t.scales,
      n = this.scales,
      o = Object.keys(n).reduce((l, c) => ((l[c] = !1), l), {});
    let a = [];
    (e &&
      (a = a.concat(
        Object.keys(e).map((l) => {
          const c = e[l],
            u = So(l, c),
            d = u === "r",
            p = u === "x";
          return {
            options: c,
            dposition: d ? "chartArea" : p ? "bottom" : "left",
            dtype: d ? "radialLinear" : p ? "category" : "linear",
          };
        }),
      )),
      ht(a, (l) => {
        const c = l.options,
          u = c.id,
          d = So(u, c),
          p = q(c.type, l.dtype);
        ((c.position === void 0 || dl(c.position, d) !== dl(l.dposition)) &&
          (c.position = l.dposition),
          (o[u] = !0));
        let m = null;
        if (u in n && n[u].type === p) m = n[u];
        else {
          const _ = se.getScale(p);
          ((m = new _({ id: u, type: p, ctx: this.ctx, chart: this })),
            (n[m.id] = m));
        }
        m.init(c, t);
      }),
      ht(o, (l, c) => {
        l || delete n[c];
      }),
      ht(n, (l) => {
        (Bt.configure(this, l, l.options), Bt.addBox(this, l));
      }));
  }
  _updateMetasets() {
    const t = this._metasets,
      e = this.data.datasets.length,
      n = t.length;
    if ((t.sort((o, a) => o.index - a.index), n > e)) {
      for (let o = e; o < n; ++o) this._destroyDatasetMeta(o);
      t.splice(e, n - e);
    }
    this._sortedMetasets = t.slice(0).sort(fl("order", "index"));
  }
  _removeUnreferencedMetasets() {
    const {
      _metasets: t,
      data: { datasets: e },
    } = this;
    (t.length > e.length && delete this._stacks,
      t.forEach((n, o) => {
        e.filter((a) => a === n._dataset).length === 0 &&
          this._destroyDatasetMeta(o);
      }));
  }
  buildOrUpdateControllers() {
    const t = [],
      e = this.data.datasets;
    let n, o;
    for (this._removeUnreferencedMetasets(), n = 0, o = e.length; n < o; n++) {
      const a = e[n];
      let l = this.getDatasetMeta(n);
      const c = a.type || this.config.type;
      if (
        (l.type &&
          l.type !== c &&
          (this._destroyDatasetMeta(n), (l = this.getDatasetMeta(n))),
        (l.type = c),
        (l.indexAxis = a.indexAxis || ko(c, this.options)),
        (l.order = a.order || 0),
        (l.index = n),
        (l.label = "" + a.label),
        (l.visible = this.isDatasetVisible(n)),
        l.controller)
      )
        (l.controller.updateIndex(n), l.controller.linkScales());
      else {
        const u = se.getController(c),
          { datasetElementType: d, dataElementType: p } = yt.datasets[c];
        (Object.assign(u, {
          dataElementType: se.getElement(p),
          datasetElementType: d && se.getElement(d),
        }),
          (l.controller = new u(this, n)),
          t.push(l.controller));
      }
    }
    return (this._updateMetasets(), t);
  }
  _resetElements() {
    ht(
      this.data.datasets,
      (t, e) => {
        this.getDatasetMeta(e).controller.reset();
      },
      this,
    );
  }
  reset() {
    (this._resetElements(), this.notifyPlugins("reset"));
  }
  update(t) {
    const e = this.config;
    e.update();
    const n = (this._options = e.createResolver(
        e.chartOptionScopes(),
        this.getContext(),
      )),
      o = (this._animationsDisabled = !n.animation);
    if (
      (this._updateScales(),
      this._checkEventBindings(),
      this._updateHiddenIndices(),
      this._plugins.invalidate(),
      this.notifyPlugins("beforeUpdate", { mode: t, cancelable: !0 }) === !1)
    )
      return;
    const a = this.buildOrUpdateControllers();
    this.notifyPlugins("beforeElementsUpdate");
    let l = 0;
    for (let d = 0, p = this.data.datasets.length; d < p; d++) {
      const { controller: m } = this.getDatasetMeta(d),
        _ = !o && a.indexOf(m) === -1;
      (m.buildOrUpdateElements(_), (l = Math.max(+m.getMaxOverflow(), l)));
    }
    ((l = this._minPadding = n.layout.autoPadding ? l : 0),
      this._updateLayout(l),
      o ||
        ht(a, (d) => {
          d.reset();
        }),
      this._updateDatasets(t),
      this.notifyPlugins("afterUpdate", { mode: t }),
      this._layers.sort(fl("z", "_idx")));
    const { _active: c, _lastEvent: u } = this;
    (u
      ? this._eventHandler(u, !0)
      : c.length && this._updateHoverStyles(c, c, !0),
      this.render());
  }
  _updateScales() {
    (ht(this.scales, (t) => {
      Bt.removeBox(this, t);
    }),
      this.ensureScalesHaveIDs(),
      this.buildOrUpdateScales());
  }
  _checkEventBindings() {
    const t = this.options,
      e = new Set(Object.keys(this._listeners)),
      n = new Set(t.events);
    (!Ma(e, n) || !!this._responsiveListeners !== t.responsive) &&
      (this.unbindEvents(), this.bindEvents());
  }
  _updateHiddenIndices() {
    const { _hiddenIndices: t } = this,
      e = this._getUniformDataChanges() || [];
    for (const { method: n, start: o, count: a } of e) {
      const l = n === "_removeElements" ? -a : a;
      zm(t, o, l);
    }
  }
  _getUniformDataChanges() {
    const t = this._dataChanges;
    if (!t || !t.length) return;
    this._dataChanges = [];
    const e = this.data.datasets.length,
      n = (a) =>
        new Set(
          t
            .filter((l) => l[0] === a)
            .map((l, c) => c + "," + l.splice(1).join(",")),
        ),
      o = n(0);
    for (let a = 1; a < e; a++) if (!Ma(o, n(a))) return;
    return Array.from(o)
      .map((a) => a.split(","))
      .map((a) => ({ method: a[1], start: +a[2], count: +a[3] }));
  }
  _updateLayout(t) {
    if (this.notifyPlugins("beforeLayout", { cancelable: !0 }) === !1) return;
    Bt.update(this, this.width, this.height, t);
    const e = this.chartArea,
      n = e.width <= 0 || e.height <= 0;
    ((this._layers = []),
      ht(
        this.boxes,
        (o) => {
          (n && o.position === "chartArea") ||
            (o.configure && o.configure(), this._layers.push(...o._layers()));
        },
        this,
      ),
      this._layers.forEach((o, a) => {
        o._idx = a;
      }),
      this.notifyPlugins("afterLayout"));
  }
  _updateDatasets(t) {
    if (
      this.notifyPlugins("beforeDatasetsUpdate", {
        mode: t,
        cancelable: !0,
      }) !== !1
    ) {
      for (let e = 0, n = this.data.datasets.length; e < n; ++e)
        this.getDatasetMeta(e).controller.configure();
      for (let e = 0, n = this.data.datasets.length; e < n; ++e)
        this._updateDataset(e, Ie(t) ? t({ datasetIndex: e }) : t);
      this.notifyPlugins("afterDatasetsUpdate", { mode: t });
    }
  }
  _updateDataset(t, e) {
    const n = this.getDatasetMeta(t),
      o = { meta: n, index: t, mode: e, cancelable: !0 };
    this.notifyPlugins("beforeDatasetUpdate", o) !== !1 &&
      (n.controller._update(e),
      (o.cancelable = !1),
      this.notifyPlugins("afterDatasetUpdate", o));
  }
  render() {
    this.notifyPlugins("beforeRender", { cancelable: !0 }) !== !1 &&
      (ge.has(this)
        ? this.attached && !ge.running(this) && ge.start(this)
        : (this.draw(), pl({ chart: this })));
  }
  draw() {
    let t;
    if (this._resizeBeforeDraw) {
      const { width: n, height: o } = this._resizeBeforeDraw;
      ((this._resizeBeforeDraw = null), this._resize(n, o));
    }
    if (
      (this.clear(),
      this.width <= 0 ||
        this.height <= 0 ||
        this.notifyPlugins("beforeDraw", { cancelable: !0 }) === !1)
    )
      return;
    const e = this._layers;
    for (t = 0; t < e.length && e[t].z <= 0; ++t) e[t].draw(this.chartArea);
    for (this._drawDatasets(); t < e.length; ++t) e[t].draw(this.chartArea);
    this.notifyPlugins("afterDraw");
  }
  _getSortedDatasetMetas(t) {
    const e = this._sortedMetasets,
      n = [];
    let o, a;
    for (o = 0, a = e.length; o < a; ++o) {
      const l = e[o];
      (!t || l.visible) && n.push(l);
    }
    return n;
  }
  getSortedVisibleDatasetMetas() {
    return this._getSortedDatasetMetas(!0);
  }
  _drawDatasets() {
    if (this.notifyPlugins("beforeDatasetsDraw", { cancelable: !0 }) === !1)
      return;
    const t = this.getSortedVisibleDatasetMetas();
    for (let e = t.length - 1; e >= 0; --e) this._drawDataset(t[e]);
    this.notifyPlugins("afterDatasetsDraw");
  }
  _drawDataset(t) {
    const e = this.ctx,
      n = { meta: t, index: t.index, cancelable: !0 },
      o = Wc(this, t);
    this.notifyPlugins("beforeDatasetDraw", n) !== !1 &&
      (o && as(e, o),
      t.controller.draw(),
      o && ls(e),
      (n.cancelable = !1),
      this.notifyPlugins("afterDatasetDraw", n));
  }
  isPointInArea(t) {
    return be(t, this.chartArea, this._minPadding);
  }
  getElementsAtEventForMode(t, e, n, o) {
    const a = Dg.modes[e];
    return typeof a == "function" ? a(this, t, n, o) : [];
  }
  getDatasetMeta(t) {
    const e = this.data.datasets[t],
      n = this._metasets;
    let o = n.filter((a) => a && a._dataset === e).pop();
    return (
      o ||
        ((o = {
          type: null,
          data: [],
          dataset: null,
          controller: null,
          hidden: null,
          xAxisID: null,
          yAxisID: null,
          order: (e && e.order) || 0,
          index: t,
          _dataset: e,
          _parsed: [],
          _sorted: !1,
        }),
        n.push(o)),
      o
    );
  }
  getContext() {
    return (
      this.$context ||
      (this.$context = Be(null, { chart: this, type: "chart" }))
    );
  }
  getVisibleDatasetCount() {
    return this.getSortedVisibleDatasetMetas().length;
  }
  isDatasetVisible(t) {
    const e = this.data.datasets[t];
    if (!e) return !1;
    const n = this.getDatasetMeta(t);
    return typeof n.hidden == "boolean" ? !n.hidden : !e.hidden;
  }
  setDatasetVisibility(t, e) {
    const n = this.getDatasetMeta(t);
    n.hidden = !e;
  }
  toggleDataVisibility(t) {
    this._hiddenIndices[t] = !this._hiddenIndices[t];
  }
  getDataVisibility(t) {
    return !this._hiddenIndices[t];
  }
  _updateVisibility(t, e, n) {
    const o = n ? "show" : "hide",
      a = this.getDatasetMeta(t),
      l = a.controller._resolveAnimations(void 0, o);
    qi(e)
      ? ((a.data[e].hidden = !n), this.update())
      : (this.setDatasetVisibility(t, n),
        l.update(a, { visible: n }),
        this.update((c) => (c.datasetIndex === t ? o : void 0)));
  }
  hide(t, e) {
    this._updateVisibility(t, e, !1);
  }
  show(t, e) {
    this._updateVisibility(t, e, !0);
  }
  _destroyDatasetMeta(t) {
    const e = this._metasets[t];
    (e && e.controller && e.controller._destroy(), delete this._metasets[t]);
  }
  _stop() {
    let t, e;
    for (
      this.stop(), ge.remove(this), t = 0, e = this.data.datasets.length;
      t < e;
      ++t
    )
      this._destroyDatasetMeta(t);
  }
  destroy() {
    this.notifyPlugins("beforeDestroy");
    const { canvas: t, ctx: e } = this;
    (this._stop(),
      this.config.clearCache(),
      t &&
        (this.unbindEvents(),
        Da(t, e),
        this.platform.releaseContext(e),
        (this.canvas = null),
        (this.ctx = null)),
      delete Vn[this.id],
      this.notifyPlugins("afterDestroy"));
  }
  toBase64Image(...t) {
    return this.canvas.toDataURL(...t);
  }
  bindEvents() {
    (this.bindUserEvents(),
      this.options.responsive
        ? this.bindResponsiveEvents()
        : (this.attached = !0));
  }
  bindUserEvents() {
    const t = this._listeners,
      e = this.platform,
      n = (a, l) => {
        (e.addEventListener(this, a, l), (t[a] = l));
      },
      o = (a, l, c) => {
        ((a.offsetX = l), (a.offsetY = c), this._eventHandler(a));
      };
    ht(this.options.events, (a) => n(a, o));
  }
  bindResponsiveEvents() {
    this._responsiveListeners || (this._responsiveListeners = {});
    const t = this._responsiveListeners,
      e = this.platform,
      n = (u, d) => {
        (e.addEventListener(this, u, d), (t[u] = d));
      },
      o = (u, d) => {
        t[u] && (e.removeEventListener(this, u, d), delete t[u]);
      },
      a = (u, d) => {
        this.canvas && this.resize(u, d);
      };
    let l;
    const c = () => {
      (o("attach", c),
        (this.attached = !0),
        this.resize(),
        n("resize", a),
        n("detach", l));
    };
    ((l = () => {
      ((this.attached = !1),
        o("resize", a),
        this._stop(),
        this._resize(0, 0),
        n("attach", c));
    }),
      e.isAttached(this.canvas) ? c() : l());
  }
  unbindEvents() {
    (ht(this._listeners, (t, e) => {
      this.platform.removeEventListener(this, e, t);
    }),
      (this._listeners = {}),
      ht(this._responsiveListeners, (t, e) => {
        this.platform.removeEventListener(this, e, t);
      }),
      (this._responsiveListeners = void 0));
  }
  updateHoverStyle(t, e, n) {
    const o = n ? "set" : "remove";
    let a, l, c, u;
    for (
      e === "dataset" &&
        ((a = this.getDatasetMeta(t[0].datasetIndex)),
        a.controller["_" + o + "DatasetHoverStyle"]()),
        c = 0,
        u = t.length;
      c < u;
      ++c
    ) {
      l = t[c];
      const d = l && this.getDatasetMeta(l.datasetIndex).controller;
      d && d[o + "HoverStyle"](l.element, l.datasetIndex, l.index);
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(t) {
    const e = this._active || [],
      n = t.map(({ datasetIndex: a, index: l }) => {
        const c = this.getDatasetMeta(a);
        if (!c) throw new Error("No dataset found at index " + a);
        return { datasetIndex: a, element: c.data[l], index: l };
      });
    !Zn(n, e) &&
      ((this._active = n),
      (this._lastEvent = null),
      this._updateHoverStyles(n, e));
  }
  notifyPlugins(t, e, n) {
    return this._plugins.notify(this, t, e, n);
  }
  isPluginEnabled(t) {
    return this._plugins._cache.filter((e) => e.plugin.id === t).length === 1;
  }
  _updateHoverStyles(t, e, n) {
    const o = this.options.hover,
      a = (u, d) =>
        u.filter(
          (p) =>
            !d.some(
              (m) => p.datasetIndex === m.datasetIndex && p.index === m.index,
            ),
        ),
      l = a(e, t),
      c = n ? t : a(t, e);
    (l.length && this.updateHoverStyle(l, o.mode, !1),
      c.length && o.mode && this.updateHoverStyle(c, o.mode, !0));
  }
  _eventHandler(t, e) {
    const n = {
        event: t,
        replay: e,
        cancelable: !0,
        inChartArea: this.isPointInArea(t),
      },
      o = (l) =>
        (l.options.events || this.options.events).includes(t.native.type);
    if (this.notifyPlugins("beforeEvent", n, o) === !1) return;
    const a = this._handleEvent(t, e, n.inChartArea);
    return (
      (n.cancelable = !1),
      this.notifyPlugins("afterEvent", n, o),
      (a || n.changed) && this.render(),
      this
    );
  }
  _handleEvent(t, e, n) {
    const { _active: o = [], options: a } = this,
      l = e,
      c = this._getActiveElements(t, o, n, l),
      u = Ff(t),
      d = Nm(t, this._lastEvent, n, u);
    n &&
      ((this._lastEvent = null),
      ft(a.onHover, [t, c, this], this),
      u && ft(a.onClick, [t, c, this], this));
    const p = !Zn(c, o);
    return (
      (p || e) && ((this._active = c), this._updateHoverStyles(c, o, e)),
      (this._lastEvent = d),
      p
    );
  }
  _getActiveElements(t, e, n, o) {
    if (t.type === "mouseout") return [];
    if (!n) return e;
    const a = this.options.hover;
    return this.getElementsAtEventForMode(t, a.mode, a, o);
  }
}
function ml() {
  return ht(er.instances, (i) => i._plugins.invalidate());
}
function Fm(i, t, e) {
  const {
      startAngle: n,
      x: o,
      y: a,
      outerRadius: l,
      innerRadius: c,
      options: u,
    } = t,
    { borderWidth: d, borderJoinStyle: p } = u,
    m = Math.min(d / l, It(n - e));
  if ((i.beginPath(), i.arc(o, a, l - d / 2, n + m / 2, e - m / 2), c > 0)) {
    const _ = Math.min(d / c, It(n - e));
    i.arc(o, a, c + d / 2, e - _ / 2, n + _ / 2, !0);
  } else {
    const _ = Math.min(d / 2, l * It(n - e));
    if (p === "round") i.arc(o, a, _, e - lt / 2, n + lt / 2, !0);
    else if (p === "bevel") {
      const v = 2 * _ * _,
        x = -v * Math.cos(e + lt / 2) + o,
        b = -v * Math.sin(e + lt / 2) + a,
        w = v * Math.cos(n + lt / 2) + o,
        k = v * Math.sin(n + lt / 2) + a;
      (i.lineTo(x, b), i.lineTo(w, k));
    }
  }
  (i.closePath(),
    i.moveTo(0, 0),
    i.rect(0, 0, i.canvas.width, i.canvas.height),
    i.clip("evenodd"));
}
function Hm(i, t, e) {
  const {
    startAngle: n,
    pixelMargin: o,
    x: a,
    y: l,
    outerRadius: c,
    innerRadius: u,
  } = t;
  let d = o / c;
  (i.beginPath(),
    i.arc(a, l, c, n - d, e + d),
    u > o
      ? ((d = o / u), i.arc(a, l, u, e + d, n - d, !0))
      : i.arc(a, l, o, e + kt, n - kt),
    i.closePath(),
    i.clip());
}
function Wm(i) {
  return qo(i, ["outerStart", "outerEnd", "innerStart", "innerEnd"]);
}
function Vm(i, t, e, n) {
  const o = Wm(i.options.borderRadius),
    a = (e - t) / 2,
    l = Math.min(a, (n * t) / 2),
    c = (u) => {
      const d = ((e - Math.min(a, u)) * n) / 2;
      return Et(u, 0, Math.min(a, d));
    };
  return {
    outerStart: c(o.outerStart),
    outerEnd: c(o.outerEnd),
    innerStart: Et(o.innerStart, 0, l),
    innerEnd: Et(o.innerEnd, 0, l),
  };
}
function ci(i, t, e, n) {
  return { x: e + i * Math.cos(t), y: n + i * Math.sin(t) };
}
function Gn(i, t, e, n, o, a) {
  const { x: l, y: c, startAngle: u, pixelMargin: d, innerRadius: p } = t,
    m = Math.max(t.outerRadius + n + e - d, 0),
    _ = p > 0 ? p + n + e + d : 0;
  let v = 0;
  const x = o - u;
  if (n) {
    const rt = p > 0 ? p - n : 0,
      Y = m > 0 ? m - n : 0,
      ct = (rt + Y) / 2,
      F = ct !== 0 ? (x * ct) / (ct + n) : x;
    v = (x - F) / 2;
  }
  const b = Math.max(0.001, x * m - e / lt) / m,
    w = (x - b) / 2,
    k = u + w + v,
    C = o - w - v,
    {
      outerStart: E,
      outerEnd: A,
      innerStart: T,
      innerEnd: B,
    } = Vm(t, _, m, C - k),
    D = m - E,
    R = m - A,
    H = k + E / D,
    U = C - A / R,
    W = _ + T,
    j = _ + B,
    xt = k + T / W,
    ut = C - B / j;
  if ((i.beginPath(), a)) {
    const rt = (H + U) / 2;
    if ((i.arc(l, c, m, H, rt), i.arc(l, c, m, rt, U), A > 0)) {
      const pt = ci(R, U, l, c);
      i.arc(pt.x, pt.y, A, U, C + kt);
    }
    const Y = ci(j, C, l, c);
    if ((i.lineTo(Y.x, Y.y), B > 0)) {
      const pt = ci(j, ut, l, c);
      i.arc(pt.x, pt.y, B, C + kt, ut + Math.PI);
    }
    const ct = (C - B / _ + (k + T / _)) / 2;
    if (
      (i.arc(l, c, _, C - B / _, ct, !0),
      i.arc(l, c, _, ct, k + T / _, !0),
      T > 0)
    ) {
      const pt = ci(W, xt, l, c);
      i.arc(pt.x, pt.y, T, xt + Math.PI, k - kt);
    }
    const F = ci(D, k, l, c);
    if ((i.lineTo(F.x, F.y), E > 0)) {
      const pt = ci(D, H, l, c);
      i.arc(pt.x, pt.y, E, k - kt, H);
    }
  } else {
    i.moveTo(l, c);
    const rt = Math.cos(H) * m + l,
      Y = Math.sin(H) * m + c;
    i.lineTo(rt, Y);
    const ct = Math.cos(U) * m + l,
      F = Math.sin(U) * m + c;
    i.lineTo(ct, F);
  }
  i.closePath();
}
function Zm(i, t, e, n, o) {
  const { fullCircles: a, startAngle: l, circumference: c } = t;
  let u = t.endAngle;
  if (a) {
    Gn(i, t, e, n, u, o);
    for (let d = 0; d < a; ++d) i.fill();
    isNaN(c) || (u = l + (c % gt || gt));
  }
  return (Gn(i, t, e, n, u, o), i.fill(), u);
}
function jm(i, t, e, n, o) {
  const { fullCircles: a, startAngle: l, circumference: c, options: u } = t,
    {
      borderWidth: d,
      borderJoinStyle: p,
      borderDash: m,
      borderDashOffset: _,
      borderRadius: v,
    } = u,
    x = u.borderAlign === "inner";
  if (!d) return;
  (i.setLineDash(m || []),
    (i.lineDashOffset = _),
    x
      ? ((i.lineWidth = d * 2), (i.lineJoin = p || "round"))
      : ((i.lineWidth = d), (i.lineJoin = p || "bevel")));
  let b = t.endAngle;
  if (a) {
    Gn(i, t, e, n, b, o);
    for (let w = 0; w < a; ++w) i.stroke();
    isNaN(c) || (b = l + (c % gt || gt));
  }
  (x && Hm(i, t, b),
    u.selfJoin && b - l >= lt && v === 0 && p !== "miter" && Fm(i, t, b),
    a || (Gn(i, t, e, n, b, o), i.stroke()));
}
class $m extends xe {
  static id = "arc";
  static defaults = {
    borderAlign: "center",
    borderColor: "#fff",
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: void 0,
    borderRadius: 0,
    borderWidth: 2,
    offset: 0,
    spacing: 0,
    angle: void 0,
    circular: !0,
    selfJoin: !1,
  };
  static defaultRoutes = { backgroundColor: "backgroundColor" };
  static descriptors = {
    _scriptable: !0,
    _indexable: (t) => t !== "borderDash",
  };
  circumference;
  endAngle;
  fullCircles;
  innerRadius;
  outerRadius;
  pixelMargin;
  startAngle;
  constructor(t) {
    (super(),
      (this.options = void 0),
      (this.circumference = void 0),
      (this.startAngle = void 0),
      (this.endAngle = void 0),
      (this.innerRadius = void 0),
      (this.outerRadius = void 0),
      (this.pixelMargin = 0),
      (this.fullCircles = 0),
      t && Object.assign(this, t));
  }
  inRange(t, e, n) {
    const o = this.getProps(["x", "y"], n),
      { angle: a, distance: l } = bc(o, { x: t, y: e }),
      {
        startAngle: c,
        endAngle: u,
        innerRadius: d,
        outerRadius: p,
        circumference: m,
      } = this.getProps(
        [
          "startAngle",
          "endAngle",
          "innerRadius",
          "outerRadius",
          "circumference",
        ],
        n,
      ),
      _ = (this.options.spacing + this.options.borderWidth) / 2,
      v = q(m, u - c),
      x = Yi(a, c, u) && c !== u,
      b = v >= gt || x,
      w = ye(l, d + _, p + _);
    return b && w;
  }
  getCenterPoint(t) {
    const {
        x: e,
        y: n,
        startAngle: o,
        endAngle: a,
        innerRadius: l,
        outerRadius: c,
      } = this.getProps(
        ["x", "y", "startAngle", "endAngle", "innerRadius", "outerRadius"],
        t,
      ),
      { offset: u, spacing: d } = this.options,
      p = (o + a) / 2,
      m = (l + c + d + u) / 2;
    return { x: e + Math.cos(p) * m, y: n + Math.sin(p) * m };
  }
  tooltipPosition(t) {
    return this.getCenterPoint(t);
  }
  draw(t) {
    const { options: e, circumference: n } = this,
      o = (e.offset || 0) / 4,
      a = (e.spacing || 0) / 2,
      l = e.circular;
    if (
      ((this.pixelMargin = e.borderAlign === "inner" ? 0.33 : 0),
      (this.fullCircles = n > gt ? Math.floor(n / gt) : 0),
      n === 0 || this.innerRadius < 0 || this.outerRadius < 0)
    )
      return;
    t.save();
    const c = (this.startAngle + this.endAngle) / 2;
    t.translate(Math.cos(c) * o, Math.sin(c) * o);
    const u = 1 - Math.sin(Math.min(lt, n || 0)),
      d = o * u;
    ((t.fillStyle = e.backgroundColor),
      (t.strokeStyle = e.borderColor),
      Zm(t, this, d, a, l),
      jm(t, this, d, a, l),
      t.restore());
  }
}
function eh(i, t, e = t) {
  ((i.lineCap = q(e.borderCapStyle, t.borderCapStyle)),
    i.setLineDash(q(e.borderDash, t.borderDash)),
    (i.lineDashOffset = q(e.borderDashOffset, t.borderDashOffset)),
    (i.lineJoin = q(e.borderJoinStyle, t.borderJoinStyle)),
    (i.lineWidth = q(e.borderWidth, t.borderWidth)),
    (i.strokeStyle = q(e.borderColor, t.borderColor)));
}
function Um(i, t, e) {
  i.lineTo(e.x, e.y);
}
function qm(i) {
  return i.stepped
    ? lp
    : i.tension || i.cubicInterpolationMode === "monotone"
      ? cp
      : Um;
}
function ih(i, t, e = {}) {
  const n = i.length,
    { start: o = 0, end: a = n - 1 } = e,
    { start: l, end: c } = t,
    u = Math.max(o, l),
    d = Math.min(a, c),
    p = (o < l && a < l) || (o > c && a > c);
  return {
    count: n,
    start: u,
    loop: t.loop,
    ilen: d < u && !p ? n + d - u : d - u,
  };
}
function Ym(i, t, e, n) {
  const { points: o, options: a } = t,
    { count: l, start: c, loop: u, ilen: d } = ih(o, e, n),
    p = qm(a);
  let { move: m = !0, reverse: _ } = n || {},
    v,
    x,
    b;
  for (v = 0; v <= d; ++v)
    ((x = o[(c + (_ ? d - v : v)) % l]),
      !x.skip &&
        (m ? (i.moveTo(x.x, x.y), (m = !1)) : p(i, b, x, _, a.stepped),
        (b = x)));
  return (u && ((x = o[(c + (_ ? d : 0)) % l]), p(i, b, x, _, a.stepped)), !!u);
}
function Gm(i, t, e, n) {
  const o = t.points,
    { count: a, start: l, ilen: c } = ih(o, e, n),
    { move: u = !0, reverse: d } = n || {};
  let p = 0,
    m = 0,
    _,
    v,
    x,
    b,
    w,
    k;
  const C = (A) => (l + (d ? c - A : A)) % a,
    E = () => {
      b !== w && (i.lineTo(p, w), i.lineTo(p, b), i.lineTo(p, k));
    };
  for (u && ((v = o[C(0)]), i.moveTo(v.x, v.y)), _ = 0; _ <= c; ++_) {
    if (((v = o[C(_)]), v.skip)) continue;
    const A = v.x,
      T = v.y,
      B = A | 0;
    (B === x
      ? (T < b ? (b = T) : T > w && (w = T), (p = (m * p + A) / ++m))
      : (E(), i.lineTo(A, T), (x = B), (m = 0), (b = w = T)),
      (k = T));
  }
  E();
}
function Mo(i) {
  const t = i.options,
    e = t.borderDash && t.borderDash.length;
  return !i._decimated &&
    !i._loop &&
    !t.tension &&
    t.cubicInterpolationMode !== "monotone" &&
    !t.stepped &&
    !e
    ? Gm
    : Ym;
}
function Km(i) {
  return i.stepped
    ? Wp
    : i.tension || i.cubicInterpolationMode === "monotone"
      ? Vp
      : Ue;
}
function Xm(i, t, e, n) {
  let o = t._path;
  (o || ((o = t._path = new Path2D()), t.path(o, e, n) && o.closePath()),
    eh(i, t.options),
    i.stroke(o));
}
function Jm(i, t, e, n) {
  const { segments: o, options: a } = t,
    l = Mo(t);
  for (const c of o)
    (eh(i, a, c.style),
      i.beginPath(),
      l(i, t, c, { start: e, end: e + n - 1 }) && i.closePath(),
      i.stroke());
}
const Qm = typeof Path2D == "function";
function t_(i, t, e, n) {
  Qm && !t.options.segment ? Xm(i, t, e, n) : Jm(i, t, e, n);
}
class us extends xe {
  static id = "line";
  static defaults = {
    borderCapStyle: "butt",
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: "miter",
    borderWidth: 3,
    capBezierPoints: !0,
    cubicInterpolationMode: "default",
    fill: !1,
    spanGaps: !1,
    stepped: !1,
    tension: 0,
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor",
  };
  static descriptors = {
    _scriptable: !0,
    _indexable: (t) => t !== "borderDash" && t !== "fill",
  };
  constructor(t) {
    (super(),
      (this.animated = !0),
      (this.options = void 0),
      (this._chart = void 0),
      (this._loop = void 0),
      (this._fullLoop = void 0),
      (this._path = void 0),
      (this._points = void 0),
      (this._segments = void 0),
      (this._decimated = !1),
      (this._pointsUpdated = !1),
      (this._datasetIndex = void 0),
      t && Object.assign(this, t));
  }
  updateControlPoints(t, e) {
    const n = this.options;
    if (
      (n.tension || n.cubicInterpolationMode === "monotone") &&
      !n.stepped &&
      !this._pointsUpdated
    ) {
      const o = n.spanGaps ? this._loop : this._fullLoop;
      (Ip(this._points, n, t, o, e), (this._pointsUpdated = !0));
    }
  }
  set points(t) {
    ((this._points = t),
      delete this._segments,
      delete this._path,
      (this._pointsUpdated = !1));
  }
  get points() {
    return this._points;
  }
  get segments() {
    return this._segments || (this._segments = Yp(this, this.options.segment));
  }
  first() {
    const t = this.segments,
      e = this.points;
    return t.length && e[t[0].start];
  }
  last() {
    const t = this.segments,
      e = this.points,
      n = t.length;
    return n && e[t[n - 1].end];
  }
  interpolate(t, e) {
    const n = this.options,
      o = t[e],
      a = this.points,
      l = Hc(this, { property: e, start: o, end: o });
    if (!l.length) return;
    const c = [],
      u = Km(n);
    let d, p;
    for (d = 0, p = l.length; d < p; ++d) {
      const { start: m, end: _ } = l[d],
        v = a[m],
        x = a[_];
      if (v === x) {
        c.push(v);
        continue;
      }
      const b = Math.abs((o - v[e]) / (x[e] - v[e])),
        w = u(v, x, b, n.stepped);
      ((w[e] = t[e]), c.push(w));
    }
    return c.length === 1 ? c[0] : c;
  }
  pathSegment(t, e, n) {
    return Mo(this)(t, this, e, n);
  }
  path(t, e, n) {
    const o = this.segments,
      a = Mo(this);
    let l = this._loop;
    ((e = e || 0), (n = n || this.points.length - e));
    for (const c of o) l &= a(t, this, c, { start: e, end: e + n - 1 });
    return !!l;
  }
  draw(t, e, n, o) {
    const a = this.options || {};
    ((this.points || []).length &&
      a.borderWidth &&
      (t.save(), t_(t, this, n, o), t.restore()),
      this.animated && ((this._pointsUpdated = !1), (this._path = void 0)));
  }
}
function _l(i, t, e, n) {
  const o = i.options,
    { [e]: a } = i.getProps([e], n);
  return Math.abs(t - a) < o.radius + o.hitRadius;
}
class e_ extends xe {
  static id = "point";
  parsed;
  skip;
  stop;
  static defaults = {
    borderWidth: 1,
    hitRadius: 1,
    hoverBorderWidth: 1,
    hoverRadius: 4,
    pointStyle: "circle",
    radius: 3,
    rotation: 0,
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor",
  };
  constructor(t) {
    (super(),
      (this.options = void 0),
      (this.parsed = void 0),
      (this.skip = void 0),
      (this.stop = void 0),
      t && Object.assign(this, t));
  }
  inRange(t, e, n) {
    const o = this.options,
      { x: a, y: l } = this.getProps(["x", "y"], n);
    return (
      Math.pow(t - a, 2) + Math.pow(e - l, 2) <
      Math.pow(o.hitRadius + o.radius, 2)
    );
  }
  inXRange(t, e) {
    return _l(this, t, "x", e);
  }
  inYRange(t, e) {
    return _l(this, t, "y", e);
  }
  getCenterPoint(t) {
    const { x: e, y: n } = this.getProps(["x", "y"], t);
    return { x: e, y: n };
  }
  size(t) {
    t = t || this.options || {};
    let e = t.radius || 0;
    e = Math.max(e, (e && t.hoverRadius) || 0);
    const n = (e && t.borderWidth) || 0;
    return (e + n) * 2;
  }
  draw(t, e) {
    const n = this.options;
    this.skip ||
      n.radius < 0.1 ||
      !be(this, e, this.size(n) / 2) ||
      ((t.strokeStyle = n.borderColor),
      (t.lineWidth = n.borderWidth),
      (t.fillStyle = n.backgroundColor),
      Po(t, n, this.x, this.y));
  }
  getRange() {
    const t = this.options || {};
    return t.radius + t.hitRadius;
  }
}
function nh(i, t) {
  const {
    x: e,
    y: n,
    base: o,
    width: a,
    height: l,
  } = i.getProps(["x", "y", "base", "width", "height"], t);
  let c, u, d, p, m;
  return (
    i.horizontal
      ? ((m = l / 2),
        (c = Math.min(e, o)),
        (u = Math.max(e, o)),
        (d = n - m),
        (p = n + m))
      : ((m = a / 2),
        (c = e - m),
        (u = e + m),
        (d = Math.min(n, o)),
        (p = Math.max(n, o))),
    { left: c, top: d, right: u, bottom: p }
  );
}
function Ce(i, t, e, n) {
  return i ? 0 : Et(t, e, n);
}
function i_(i, t, e) {
  const n = i.options.borderWidth,
    o = i.borderSkipped,
    a = Tc(n);
  return {
    t: Ce(o.top, a.top, 0, e),
    r: Ce(o.right, a.right, 0, t),
    b: Ce(o.bottom, a.bottom, 0, e),
    l: Ce(o.left, a.left, 0, t),
  };
}
function n_(i, t, e) {
  const { enableBorderRadius: n } = i.getProps(["enableBorderRadius"]),
    o = i.options.borderRadius,
    a = qe(o),
    l = Math.min(t, e),
    c = i.borderSkipped,
    u = n || et(o);
  return {
    topLeft: Ce(!u || c.top || c.left, a.topLeft, 0, l),
    topRight: Ce(!u || c.top || c.right, a.topRight, 0, l),
    bottomLeft: Ce(!u || c.bottom || c.left, a.bottomLeft, 0, l),
    bottomRight: Ce(!u || c.bottom || c.right, a.bottomRight, 0, l),
  };
}
function s_(i) {
  const t = nh(i),
    e = t.right - t.left,
    n = t.bottom - t.top,
    o = i_(i, e / 2, n / 2),
    a = n_(i, e / 2, n / 2);
  return {
    outer: { x: t.left, y: t.top, w: e, h: n, radius: a },
    inner: {
      x: t.left + o.l,
      y: t.top + o.t,
      w: e - o.l - o.r,
      h: n - o.t - o.b,
      radius: {
        topLeft: Math.max(0, a.topLeft - Math.max(o.t, o.l)),
        topRight: Math.max(0, a.topRight - Math.max(o.t, o.r)),
        bottomLeft: Math.max(0, a.bottomLeft - Math.max(o.b, o.l)),
        bottomRight: Math.max(0, a.bottomRight - Math.max(o.b, o.r)),
      },
    },
  };
}
function ao(i, t, e, n) {
  const o = t === null,
    a = e === null,
    c = i && !(o && a) && nh(i, n);
  return c && (o || ye(t, c.left, c.right)) && (a || ye(e, c.top, c.bottom));
}
function o_(i) {
  return i.topLeft || i.topRight || i.bottomLeft || i.bottomRight;
}
function r_(i, t) {
  i.rect(t.x, t.y, t.w, t.h);
}
function lo(i, t, e = {}) {
  const n = i.x !== e.x ? -t : 0,
    o = i.y !== e.y ? -t : 0,
    a = (i.x + i.w !== e.x + e.w ? t : 0) - n,
    l = (i.y + i.h !== e.y + e.h ? t : 0) - o;
  return { x: i.x + n, y: i.y + o, w: i.w + a, h: i.h + l, radius: i.radius };
}
class a_ extends xe {
  static id = "bar";
  static defaults = {
    borderSkipped: "start",
    borderWidth: 0,
    borderRadius: 0,
    inflateAmount: "auto",
    pointStyle: void 0,
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor",
  };
  constructor(t) {
    (super(),
      (this.options = void 0),
      (this.horizontal = void 0),
      (this.base = void 0),
      (this.width = void 0),
      (this.height = void 0),
      (this.inflateAmount = void 0),
      t && Object.assign(this, t));
  }
  draw(t) {
    const {
        inflateAmount: e,
        options: { borderColor: n, backgroundColor: o },
      } = this,
      { inner: a, outer: l } = s_(this),
      c = o_(l.radius) ? Gi : r_;
    (t.save(),
      (l.w !== a.w || l.h !== a.h) &&
        (t.beginPath(),
        c(t, lo(l, e, a)),
        t.clip(),
        c(t, lo(a, -e, l)),
        (t.fillStyle = n),
        t.fill("evenodd")),
      t.beginPath(),
      c(t, lo(a, e)),
      (t.fillStyle = o),
      t.fill(),
      t.restore());
  }
  inRange(t, e, n) {
    return ao(this, t, e, n);
  }
  inXRange(t, e) {
    return ao(this, t, null, e);
  }
  inYRange(t, e) {
    return ao(this, null, t, e);
  }
  getCenterPoint(t) {
    const {
      x: e,
      y: n,
      base: o,
      horizontal: a,
    } = this.getProps(["x", "y", "base", "horizontal"], t);
    return { x: a ? (e + o) / 2 : e, y: a ? n : (n + o) / 2 };
  }
  getRange(t) {
    return t === "x" ? this.width / 2 : this.height / 2;
  }
}
var l_ = Object.freeze({
  __proto__: null,
  ArcElement: $m,
  BarElement: a_,
  LineElement: us,
  PointElement: e_,
});
const Lo = [
    "rgb(54, 162, 235)",
    "rgb(255, 99, 132)",
    "rgb(255, 159, 64)",
    "rgb(255, 205, 86)",
    "rgb(75, 192, 192)",
    "rgb(153, 102, 255)",
    "rgb(201, 203, 207)",
  ],
  yl = Lo.map((i) => i.replace("rgb(", "rgba(").replace(")", ", 0.5)"));
function sh(i) {
  return Lo[i % Lo.length];
}
function oh(i) {
  return yl[i % yl.length];
}
function c_(i, t) {
  return ((i.borderColor = sh(t)), (i.backgroundColor = oh(t)), ++t);
}
function h_(i, t) {
  return ((i.backgroundColor = i.data.map(() => sh(t++))), t);
}
function u_(i, t) {
  return ((i.backgroundColor = i.data.map(() => oh(t++))), t);
}
function d_(i) {
  let t = 0;
  return (e, n) => {
    const o = i.getDatasetMeta(n).controller;
    o instanceof Qo
      ? (t = h_(e, t))
      : o instanceof $c
        ? (t = u_(e, t))
        : o && (t = c_(e, t));
  };
}
function vl(i) {
  let t;
  for (t in i) if (i[t].borderColor || i[t].backgroundColor) return !0;
  return !1;
}
function f_(i) {
  return i && (i.borderColor || i.backgroundColor);
}
function p_() {
  return (
    yt.borderColor !== "rgba(0,0,0,0.1)" ||
    yt.backgroundColor !== "rgba(0,0,0,0.1)"
  );
}
var g_ = {
  id: "colors",
  defaults: { enabled: !0, forceOverride: !1 },
  beforeLayout(i, t, e) {
    if (!e.enabled) return;
    const {
        data: { datasets: n },
        options: o,
      } = i.config,
      { elements: a } = o,
      l = vl(n) || f_(o) || (a && vl(a)) || p_();
    if (!e.forceOverride && l) return;
    const c = d_(i);
    n.forEach(c);
  },
};
function m_(i, t, e, n, o) {
  const a = o.samples || n;
  if (a >= e) return i.slice(t, t + e);
  const l = [],
    c = (e - 2) / (a - 2);
  let u = 0;
  const d = t + e - 1;
  let p = t,
    m,
    _,
    v,
    x,
    b;
  for (l[u++] = i[p], m = 0; m < a - 2; m++) {
    let w = 0,
      k = 0,
      C;
    const E = Math.floor((m + 1) * c) + 1 + t,
      A = Math.min(Math.floor((m + 2) * c) + 1, e) + t,
      T = A - E;
    for (C = E; C < A; C++) ((w += i[C].x), (k += i[C].y));
    ((w /= T), (k /= T));
    const B = Math.floor(m * c) + 1 + t,
      D = Math.min(Math.floor((m + 1) * c) + 1, e) + t,
      { x: R, y: H } = i[p];
    for (v = x = -1, C = B; C < D; C++)
      ((x = 0.5 * Math.abs((R - w) * (i[C].y - H) - (R - i[C].x) * (k - H))),
        x > v && ((v = x), (_ = i[C]), (b = C)));
    ((l[u++] = _), (p = b));
  }
  return ((l[u++] = i[d]), l);
}
function __(i, t, e, n) {
  let o = 0,
    a = 0,
    l,
    c,
    u,
    d,
    p,
    m,
    _,
    v,
    x,
    b;
  const w = [],
    k = t + e - 1,
    C = i[t].x,
    A = i[k].x - C;
  for (l = t; l < t + e; ++l) {
    ((c = i[l]), (u = ((c.x - C) / A) * n), (d = c.y));
    const T = u | 0;
    if (T === p)
      (d < x ? ((x = d), (m = l)) : d > b && ((b = d), (_ = l)),
        (o = (a * o + c.x) / ++a));
    else {
      const B = l - 1;
      if (!tt(m) && !tt(_)) {
        const D = Math.min(m, _),
          R = Math.max(m, _);
        (D !== v && D !== B && w.push({ ...i[D], x: o }),
          R !== v && R !== B && w.push({ ...i[R], x: o }));
      }
      (l > 0 && B !== v && w.push(i[B]),
        w.push(c),
        (p = T),
        (a = 0),
        (x = b = d),
        (m = _ = v = l));
    }
  }
  return w;
}
function rh(i) {
  if (i._decimated) {
    const t = i._data;
    (delete i._decimated,
      delete i._data,
      Object.defineProperty(i, "data", {
        configurable: !0,
        enumerable: !0,
        writable: !0,
        value: t,
      }));
  }
}
function bl(i) {
  i.data.datasets.forEach((t) => {
    rh(t);
  });
}
function y_(i, t) {
  const e = t.length;
  let n = 0,
    o;
  const { iScale: a } = i,
    { min: l, max: c, minDefined: u, maxDefined: d } = a.getUserBounds();
  return (
    u && (n = Et(ve(t, a.axis, l).lo, 0, e - 1)),
    d ? (o = Et(ve(t, a.axis, c).hi + 1, n, e) - n) : (o = e - n),
    { start: n, count: o }
  );
}
var v_ = {
  id: "decimation",
  defaults: { algorithm: "min-max", enabled: !1 },
  beforeElementsUpdate: (i, t, e) => {
    if (!e.enabled) {
      bl(i);
      return;
    }
    const n = i.width;
    i.data.datasets.forEach((o, a) => {
      const { _data: l, indexAxis: c } = o,
        u = i.getDatasetMeta(a),
        d = l || o.data;
      if (
        zi([c, i.options.indexAxis]) === "y" ||
        !u.controller.supportsDecimation
      )
        return;
      const p = i.scales[u.xAxisID];
      if ((p.type !== "linear" && p.type !== "time") || i.options.parsing)
        return;
      let { start: m, count: _ } = y_(u, d);
      const v = e.threshold || 4 * n;
      if (_ <= v) {
        rh(o);
        return;
      }
      tt(l) &&
        ((o._data = d),
        delete o.data,
        Object.defineProperty(o, "data", {
          configurable: !0,
          enumerable: !0,
          get: function () {
            return this._decimated;
          },
          set: function (b) {
            this._data = b;
          },
        }));
      let x;
      switch (e.algorithm) {
        case "lttb":
          x = m_(d, m, _, n, e);
          break;
        case "min-max":
          x = __(d, m, _, n);
          break;
        default:
          throw new Error(`Unsupported decimation algorithm '${e.algorithm}'`);
      }
      o._decimated = x;
    });
  },
  destroy(i) {
    bl(i);
  },
};
function b_(i, t, e) {
  const n = i.segments,
    o = i.points,
    a = t.points,
    l = [];
  for (const c of n) {
    let { start: u, end: d } = c;
    d = ds(u, d, o);
    const p = Co(e, o[u], o[d], c.loop);
    if (!t.segments) {
      l.push({ source: c, target: p, start: o[u], end: o[d] });
      continue;
    }
    const m = Hc(t, p);
    for (const _ of m) {
      const v = Co(e, a[_.start], a[_.end], _.loop),
        x = Fc(c, o, v);
      for (const b of x)
        l.push({
          source: b,
          target: _,
          start: { [e]: xl(p, v, "start", Math.max) },
          end: { [e]: xl(p, v, "end", Math.min) },
        });
    }
  }
  return l;
}
function Co(i, t, e, n) {
  if (n) return;
  let o = t[i],
    a = e[i];
  return (
    i === "angle" && ((o = It(o)), (a = It(a))),
    { property: i, start: o, end: a }
  );
}
function x_(i, t) {
  const { x: e = null, y: n = null } = i || {},
    o = t.points,
    a = [];
  return (
    t.segments.forEach(({ start: l, end: c }) => {
      c = ds(l, c, o);
      const u = o[l],
        d = o[c];
      n !== null
        ? (a.push({ x: u.x, y: n }), a.push({ x: d.x, y: n }))
        : e !== null && (a.push({ x: e, y: u.y }), a.push({ x: e, y: d.y }));
    }),
    a
  );
}
function ds(i, t, e) {
  for (; t > i; t--) {
    const n = e[t];
    if (!isNaN(n.x) && !isNaN(n.y)) break;
  }
  return t;
}
function xl(i, t, e, n) {
  return i && t ? n(i[e], t[e]) : i ? i[e] : t ? t[e] : 0;
}
function ah(i, t) {
  let e = [],
    n = !1;
  return (
    _t(i) ? ((n = !0), (e = i)) : (e = x_(i, t)),
    e.length
      ? new us({ points: e, options: { tension: 0 }, _loop: n, _fullLoop: n })
      : null
  );
}
function wl(i) {
  return i && i.fill !== !1;
}
function w_(i, t, e) {
  let o = i[t].fill;
  const a = [t];
  let l;
  if (!e) return o;
  for (; o !== !1 && a.indexOf(o) === -1; ) {
    if (!wt(o)) return o;
    if (((l = i[o]), !l)) return !1;
    if (l.visible) return o;
    (a.push(o), (o = l.fill));
  }
  return !1;
}
function P_(i, t, e) {
  const n = L_(i);
  if (et(n)) return isNaN(n.value) ? !1 : n;
  let o = parseFloat(n);
  return wt(o) && Math.floor(o) === o
    ? k_(n[0], t, o, e)
    : ["origin", "start", "end", "stack", "shape"].indexOf(n) >= 0 && n;
}
function k_(i, t, e, n) {
  return (
    (i === "-" || i === "+") && (e = t + e),
    e === t || e < 0 || e >= n ? !1 : e
  );
}
function S_(i, t) {
  let e = null;
  return (
    i === "start"
      ? (e = t.bottom)
      : i === "end"
        ? (e = t.top)
        : et(i)
          ? (e = t.getPixelForValue(i.value))
          : t.getBasePixel && (e = t.getBasePixel()),
    e
  );
}
function M_(i, t, e) {
  let n;
  return (
    i === "start"
      ? (n = e)
      : i === "end"
        ? (n = t.options.reverse ? t.min : t.max)
        : et(i)
          ? (n = i.value)
          : (n = t.getBaseValue()),
    n
  );
}
function L_(i) {
  const t = i.options,
    e = t.fill;
  let n = q(e && e.target, e);
  return (
    n === void 0 && (n = !!t.backgroundColor),
    n === !1 || n === null ? !1 : n === !0 ? "origin" : n
  );
}
function C_(i) {
  const { scale: t, index: e, line: n } = i,
    o = [],
    a = n.segments,
    l = n.points,
    c = T_(t, e);
  c.push(ah({ x: null, y: t.bottom }, n));
  for (let u = 0; u < a.length; u++) {
    const d = a[u];
    for (let p = d.start; p <= d.end; p++) E_(o, l[p], c);
  }
  return new us({ points: o, options: {} });
}
function T_(i, t) {
  const e = [],
    n = i.getMatchingVisibleMetas("line");
  for (let o = 0; o < n.length; o++) {
    const a = n[o];
    if (a.index === t) break;
    a.hidden || e.unshift(a.dataset);
  }
  return e;
}
function E_(i, t, e) {
  const n = [];
  for (let o = 0; o < e.length; o++) {
    const a = e[o],
      { first: l, last: c, point: u } = A_(a, t, "x");
    if (!(!u || (l && c))) {
      if (l) n.unshift(u);
      else if ((i.push(u), !c)) break;
    }
  }
  i.push(...n);
}
function A_(i, t, e) {
  const n = i.interpolate(t, e);
  if (!n) return {};
  const o = n[e],
    a = i.segments,
    l = i.points;
  let c = !1,
    u = !1;
  for (let d = 0; d < a.length; d++) {
    const p = a[d],
      m = l[p.start][e],
      _ = l[p.end][e];
    if (ye(o, m, _)) {
      ((c = o === m), (u = o === _));
      break;
    }
  }
  return { first: c, last: u, point: n };
}
class lh {
  constructor(t) {
    ((this.x = t.x), (this.y = t.y), (this.radius = t.radius));
  }
  pathSegment(t, e, n) {
    const { x: o, y: a, radius: l } = this;
    return (
      (e = e || { start: 0, end: gt }),
      t.arc(o, a, l, e.end, e.start, !0),
      !n.bounds
    );
  }
  interpolate(t) {
    const { x: e, y: n, radius: o } = this,
      a = t.angle;
    return { x: e + Math.cos(a) * o, y: n + Math.sin(a) * o, angle: a };
  }
}
function O_(i) {
  const { chart: t, fill: e, line: n } = i;
  if (wt(e)) return I_(t, e);
  if (e === "stack") return C_(i);
  if (e === "shape") return !0;
  const o = B_(i);
  return o instanceof lh ? o : ah(o, n);
}
function I_(i, t) {
  const e = i.getDatasetMeta(t);
  return e && i.isDatasetVisible(t) ? e.dataset : null;
}
function B_(i) {
  return (i.scale || {}).getPointPositionForValue ? R_(i) : D_(i);
}
function D_(i) {
  const { scale: t = {}, fill: e } = i,
    n = S_(e, t);
  if (wt(n)) {
    const o = t.isHorizontal();
    return { x: o ? n : null, y: o ? null : n };
  }
  return null;
}
function R_(i) {
  const { scale: t, fill: e } = i,
    n = t.options,
    o = t.getLabels().length,
    a = n.reverse ? t.max : t.min,
    l = M_(e, t, a),
    c = [];
  if (n.grid.circular) {
    const u = t.getPointPositionForValue(0, a);
    return new lh({
      x: u.x,
      y: u.y,
      radius: t.getDistanceFromCenterForValue(l),
    });
  }
  for (let u = 0; u < o; ++u) c.push(t.getPointPositionForValue(u, l));
  return c;
}
function co(i, t, e) {
  const n = O_(t),
    { chart: o, index: a, line: l, scale: c, axis: u } = t,
    d = l.options,
    p = d.fill,
    m = d.backgroundColor,
    { above: _ = m, below: v = m } = p || {},
    x = o.getDatasetMeta(a),
    b = Wc(o, x);
  n &&
    l.points.length &&
    (as(i, e),
    z_(i, {
      line: l,
      target: n,
      above: _,
      below: v,
      area: e,
      scale: c,
      axis: u,
      clip: b,
    }),
    ls(i));
}
function z_(i, t) {
  const {
      line: e,
      target: n,
      above: o,
      below: a,
      area: l,
      scale: c,
      clip: u,
    } = t,
    d = e._loop ? "angle" : t.axis;
  i.save();
  let p = a;
  (a !== o &&
    (d === "x"
      ? (Pl(i, n, l.top),
        ho(i, { line: e, target: n, color: o, scale: c, property: d, clip: u }),
        i.restore(),
        i.save(),
        Pl(i, n, l.bottom))
      : d === "y" &&
        (kl(i, n, l.left),
        ho(i, { line: e, target: n, color: a, scale: c, property: d, clip: u }),
        i.restore(),
        i.save(),
        kl(i, n, l.right),
        (p = o))),
    ho(i, { line: e, target: n, color: p, scale: c, property: d, clip: u }),
    i.restore());
}
function Pl(i, t, e) {
  const { segments: n, points: o } = t;
  let a = !0,
    l = !1;
  i.beginPath();
  for (const c of n) {
    const { start: u, end: d } = c,
      p = o[u],
      m = o[ds(u, d, o)];
    (a
      ? (i.moveTo(p.x, p.y), (a = !1))
      : (i.lineTo(p.x, e), i.lineTo(p.x, p.y)),
      (l = !!t.pathSegment(i, c, { move: l })),
      l ? i.closePath() : i.lineTo(m.x, e));
  }
  (i.lineTo(t.first().x, e), i.closePath(), i.clip());
}
function kl(i, t, e) {
  const { segments: n, points: o } = t;
  let a = !0,
    l = !1;
  i.beginPath();
  for (const c of n) {
    const { start: u, end: d } = c,
      p = o[u],
      m = o[ds(u, d, o)];
    (a
      ? (i.moveTo(p.x, p.y), (a = !1))
      : (i.lineTo(e, p.y), i.lineTo(p.x, p.y)),
      (l = !!t.pathSegment(i, c, { move: l })),
      l ? i.closePath() : i.lineTo(e, m.y));
  }
  (i.lineTo(e, t.first().y), i.closePath(), i.clip());
}
function ho(i, t) {
  const { line: e, target: n, property: o, color: a, scale: l, clip: c } = t,
    u = b_(e, n, o);
  for (const { source: d, target: p, start: m, end: _ } of u) {
    const { style: { backgroundColor: v = a } = {} } = d,
      x = n !== !0;
    (i.save(), (i.fillStyle = v), N_(i, l, c, x && Co(o, m, _)), i.beginPath());
    const b = !!e.pathSegment(i, d);
    let w;
    if (x) {
      b ? i.closePath() : Sl(i, n, _, o);
      const k = !!n.pathSegment(i, p, { move: b, reverse: !0 });
      ((w = b && k), w || Sl(i, n, m, o));
    }
    (i.closePath(), i.fill(w ? "evenodd" : "nonzero"), i.restore());
  }
}
function N_(i, t, e, n) {
  const o = t.chart.chartArea,
    { property: a, start: l, end: c } = n || {};
  if (a === "x" || a === "y") {
    let u, d, p, m;
    (a === "x"
      ? ((u = l), (d = o.top), (p = c), (m = o.bottom))
      : ((u = o.left), (d = l), (p = o.right), (m = c)),
      i.beginPath(),
      e &&
        ((u = Math.max(u, e.left)),
        (p = Math.min(p, e.right)),
        (d = Math.max(d, e.top)),
        (m = Math.min(m, e.bottom))),
      i.rect(u, d, p - u, m - d),
      i.clip());
  }
}
function Sl(i, t, e, n) {
  const o = t.interpolate(e, n);
  o && i.lineTo(o.x, o.y);
}
var F_ = {
  id: "filler",
  afterDatasetsUpdate(i, t, e) {
    const n = (i.data.datasets || []).length,
      o = [];
    let a, l, c, u;
    for (l = 0; l < n; ++l)
      ((a = i.getDatasetMeta(l)),
        (c = a.dataset),
        (u = null),
        c &&
          c.options &&
          c instanceof us &&
          (u = {
            visible: i.isDatasetVisible(l),
            index: l,
            fill: P_(c, l, n),
            chart: i,
            axis: a.controller.options.indexAxis,
            scale: a.vScale,
            line: c,
          }),
        (a.$filler = u),
        o.push(u));
    for (l = 0; l < n; ++l)
      ((u = o[l]), !(!u || u.fill === !1) && (u.fill = w_(o, l, e.propagate)));
  },
  beforeDraw(i, t, e) {
    const n = e.drawTime === "beforeDraw",
      o = i.getSortedVisibleDatasetMetas(),
      a = i.chartArea;
    for (let l = o.length - 1; l >= 0; --l) {
      const c = o[l].$filler;
      c &&
        (c.line.updateControlPoints(a, c.axis), n && c.fill && co(i.ctx, c, a));
    }
  },
  beforeDatasetsDraw(i, t, e) {
    if (e.drawTime !== "beforeDatasetsDraw") return;
    const n = i.getSortedVisibleDatasetMetas();
    for (let o = n.length - 1; o >= 0; --o) {
      const a = n[o].$filler;
      wl(a) && co(i.ctx, a, i.chartArea);
    }
  },
  beforeDatasetDraw(i, t, e) {
    const n = t.meta.$filler;
    !wl(n) || e.drawTime !== "beforeDatasetDraw" || co(i.ctx, n, i.chartArea);
  },
  defaults: { propagate: !0, drawTime: "beforeDatasetDraw" },
};
const Ml = (i, t) => {
    let { boxHeight: e = t, boxWidth: n = t } = i;
    return (
      i.usePointStyle &&
        ((e = Math.min(e, t)), (n = i.pointStyleWidth || Math.min(n, t))),
      { boxWidth: n, boxHeight: e, itemHeight: Math.max(t, e) }
    );
  },
  H_ = (i, t) =>
    i !== null &&
    t !== null &&
    i.datasetIndex === t.datasetIndex &&
    i.index === t.index;
class Ll extends xe {
  constructor(t) {
    (super(),
      (this._added = !1),
      (this.legendHitBoxes = []),
      (this._hoveredItem = null),
      (this.doughnutMode = !1),
      (this.chart = t.chart),
      (this.options = t.options),
      (this.ctx = t.ctx),
      (this.legendItems = void 0),
      (this.columnSizes = void 0),
      (this.lineWidths = void 0),
      (this.maxHeight = void 0),
      (this.maxWidth = void 0),
      (this.top = void 0),
      (this.bottom = void 0),
      (this.left = void 0),
      (this.right = void 0),
      (this.height = void 0),
      (this.width = void 0),
      (this._margins = void 0),
      (this.position = void 0),
      (this.weight = void 0),
      (this.fullSize = void 0));
  }
  update(t, e, n) {
    ((this.maxWidth = t),
      (this.maxHeight = e),
      (this._margins = n),
      this.setDimensions(),
      this.buildLabels(),
      this.fit());
  }
  setDimensions() {
    this.isHorizontal()
      ? ((this.width = this.maxWidth),
        (this.left = this._margins.left),
        (this.right = this.width))
      : ((this.height = this.maxHeight),
        (this.top = this._margins.top),
        (this.bottom = this.height));
  }
  buildLabels() {
    const t = this.options.labels || {};
    let e = ft(t.generateLabels, [this.chart], this) || [];
    (t.filter && (e = e.filter((n) => t.filter(n, this.chart.data))),
      t.sort && (e = e.sort((n, o) => t.sort(n, o, this.chart.data))),
      this.options.reverse && e.reverse(),
      (this.legendItems = e));
  }
  fit() {
    const { options: t, ctx: e } = this;
    if (!t.display) {
      this.width = this.height = 0;
      return;
    }
    const n = t.labels,
      o = Ct(n.font),
      a = o.size,
      l = this._computeTitleHeight(),
      { boxWidth: c, itemHeight: u } = Ml(n, a);
    let d, p;
    ((e.font = o.string),
      this.isHorizontal()
        ? ((d = this.maxWidth), (p = this._fitRows(l, a, c, u) + 10))
        : ((p = this.maxHeight), (d = this._fitCols(l, o, c, u) + 10)),
      (this.width = Math.min(d, t.maxWidth || this.maxWidth)),
      (this.height = Math.min(p, t.maxHeight || this.maxHeight)));
  }
  _fitRows(t, e, n, o) {
    const {
        ctx: a,
        maxWidth: l,
        options: {
          labels: { padding: c },
        },
      } = this,
      u = (this.legendHitBoxes = []),
      d = (this.lineWidths = [0]),
      p = o + c;
    let m = t;
    ((a.textAlign = "left"), (a.textBaseline = "middle"));
    let _ = -1,
      v = -p;
    return (
      this.legendItems.forEach((x, b) => {
        const w = n + e / 2 + a.measureText(x.text).width;
        ((b === 0 || d[d.length - 1] + w + 2 * c > l) &&
          ((m += p), (d[d.length - (b > 0 ? 0 : 1)] = 0), (v += p), _++),
          (u[b] = { left: 0, top: v, row: _, width: w, height: o }),
          (d[d.length - 1] += w + c));
      }),
      m
    );
  }
  _fitCols(t, e, n, o) {
    const {
        ctx: a,
        maxHeight: l,
        options: {
          labels: { padding: c },
        },
      } = this,
      u = (this.legendHitBoxes = []),
      d = (this.columnSizes = []),
      p = l - t;
    let m = c,
      _ = 0,
      v = 0,
      x = 0,
      b = 0;
    return (
      this.legendItems.forEach((w, k) => {
        const { itemWidth: C, itemHeight: E } = W_(n, e, a, w, o);
        (k > 0 &&
          v + E + 2 * c > p &&
          ((m += _ + c),
          d.push({ width: _, height: v }),
          (x += _ + c),
          b++,
          (_ = v = 0)),
          (u[k] = { left: x, top: v, col: b, width: C, height: E }),
          (_ = Math.max(_, C)),
          (v += E + c));
      }),
      (m += _),
      d.push({ width: _, height: v }),
      m
    );
  }
  adjustHitBoxes() {
    if (!this.options.display) return;
    const t = this._computeTitleHeight(),
      {
        legendHitBoxes: e,
        options: {
          align: n,
          labels: { padding: o },
          rtl: a,
        },
      } = this,
      l = hi(a, this.left, this.width);
    if (this.isHorizontal()) {
      let c = 0,
        u = Ot(n, this.left + o, this.right - this.lineWidths[c]);
      for (const d of e)
        (c !== d.row &&
          ((c = d.row),
          (u = Ot(n, this.left + o, this.right - this.lineWidths[c]))),
          (d.top += this.top + t + o),
          (d.left = l.leftForLtr(l.x(u), d.width)),
          (u += d.width + o));
    } else {
      let c = 0,
        u = Ot(n, this.top + t + o, this.bottom - this.columnSizes[c].height);
      for (const d of e)
        (d.col !== c &&
          ((c = d.col),
          (u = Ot(
            n,
            this.top + t + o,
            this.bottom - this.columnSizes[c].height,
          ))),
          (d.top = u),
          (d.left += this.left + o),
          (d.left = l.leftForLtr(l.x(d.left), d.width)),
          (u += d.height + o));
    }
  }
  isHorizontal() {
    return (
      this.options.position === "top" || this.options.position === "bottom"
    );
  }
  draw() {
    if (this.options.display) {
      const t = this.ctx;
      (as(t, this), this._draw(), ls(t));
    }
  }
  _draw() {
    const { options: t, columnSizes: e, lineWidths: n, ctx: o } = this,
      { align: a, labels: l } = t,
      c = yt.color,
      u = hi(t.rtl, this.left, this.width),
      d = Ct(l.font),
      { padding: p } = l,
      m = d.size,
      _ = m / 2;
    let v;
    (this.drawTitle(),
      (o.textAlign = u.textAlign("left")),
      (o.textBaseline = "middle"),
      (o.lineWidth = 0.5),
      (o.font = d.string));
    const { boxWidth: x, boxHeight: b, itemHeight: w } = Ml(l, m),
      k = function (B, D, R) {
        if (isNaN(x) || x <= 0 || isNaN(b) || b < 0) return;
        o.save();
        const H = q(R.lineWidth, 1);
        if (
          ((o.fillStyle = q(R.fillStyle, c)),
          (o.lineCap = q(R.lineCap, "butt")),
          (o.lineDashOffset = q(R.lineDashOffset, 0)),
          (o.lineJoin = q(R.lineJoin, "miter")),
          (o.lineWidth = H),
          (o.strokeStyle = q(R.strokeStyle, c)),
          o.setLineDash(q(R.lineDash, [])),
          l.usePointStyle)
        ) {
          const U = {
              radius: (b * Math.SQRT2) / 2,
              pointStyle: R.pointStyle,
              rotation: R.rotation,
              borderWidth: H,
            },
            W = u.xPlus(B, x / 2),
            j = D + _;
          Cc(o, U, W, j, l.pointStyleWidth && x);
        } else {
          const U = D + Math.max((m - b) / 2, 0),
            W = u.leftForLtr(B, x),
            j = qe(R.borderRadius);
          (o.beginPath(),
            Object.values(j).some((xt) => xt !== 0)
              ? Gi(o, { x: W, y: U, w: x, h: b, radius: j })
              : o.rect(W, U, x, b),
            o.fill(),
            H !== 0 && o.stroke());
        }
        o.restore();
      },
      C = function (B, D, R) {
        Xe(o, R.text, B, D + w / 2, d, {
          strikethrough: R.hidden,
          textAlign: u.textAlign(R.textAlign),
        });
      },
      E = this.isHorizontal(),
      A = this._computeTitleHeight();
    (E
      ? (v = {
          x: Ot(a, this.left + p, this.right - n[0]),
          y: this.top + p + A,
          line: 0,
        })
      : (v = {
          x: this.left + p,
          y: Ot(a, this.top + A + p, this.bottom - e[0].height),
          line: 0,
        }),
      Rc(this.ctx, t.textDirection));
    const T = w + p;
    (this.legendItems.forEach((B, D) => {
      ((o.strokeStyle = B.fontColor), (o.fillStyle = B.fontColor));
      const R = o.measureText(B.text).width,
        H = u.textAlign(B.textAlign || (B.textAlign = l.textAlign)),
        U = x + _ + R;
      let W = v.x,
        j = v.y;
      (u.setWidth(this.width),
        E
          ? D > 0 &&
            W + U + p > this.right &&
            ((j = v.y += T),
            v.line++,
            (W = v.x = Ot(a, this.left + p, this.right - n[v.line])))
          : D > 0 &&
            j + T > this.bottom &&
            ((W = v.x = W + e[v.line].width + p),
            v.line++,
            (j = v.y =
              Ot(a, this.top + A + p, this.bottom - e[v.line].height))));
      const xt = u.x(W);
      if (
        (k(xt, j, B),
        (W = Xf(H, W + x + _, E ? W + U : this.right, t.rtl)),
        C(u.x(W), j, B),
        E)
      )
        v.x += U + p;
      else if (typeof B.text != "string") {
        const ut = d.lineHeight;
        v.y += ch(B, ut) + p;
      } else v.y += T;
    }),
      zc(this.ctx, t.textDirection));
  }
  drawTitle() {
    const t = this.options,
      e = t.title,
      n = Ct(e.font),
      o = Dt(e.padding);
    if (!e.display) return;
    const a = hi(t.rtl, this.left, this.width),
      l = this.ctx,
      c = e.position,
      u = n.size / 2,
      d = o.top + u;
    let p,
      m = this.left,
      _ = this.width;
    if (this.isHorizontal())
      ((_ = Math.max(...this.lineWidths)),
        (p = this.top + d),
        (m = Ot(t.align, m, this.right - _)));
    else {
      const x = this.columnSizes.reduce((b, w) => Math.max(b, w.height), 0);
      p =
        d +
        Ot(
          t.align,
          this.top,
          this.bottom - x - t.labels.padding - this._computeTitleHeight(),
        );
    }
    const v = Ot(c, m, m + _);
    ((l.textAlign = a.textAlign($o(c))),
      (l.textBaseline = "middle"),
      (l.strokeStyle = e.color),
      (l.fillStyle = e.color),
      (l.font = n.string),
      Xe(l, e.text, v, p, n));
  }
  _computeTitleHeight() {
    const t = this.options.title,
      e = Ct(t.font),
      n = Dt(t.padding);
    return t.display ? e.lineHeight + n.height : 0;
  }
  _getLegendItemAt(t, e) {
    let n, o, a;
    if (ye(t, this.left, this.right) && ye(e, this.top, this.bottom)) {
      for (a = this.legendHitBoxes, n = 0; n < a.length; ++n)
        if (
          ((o = a[n]),
          ye(t, o.left, o.left + o.width) && ye(e, o.top, o.top + o.height))
        )
          return this.legendItems[n];
    }
    return null;
  }
  handleEvent(t) {
    const e = this.options;
    if (!j_(t.type, e)) return;
    const n = this._getLegendItemAt(t.x, t.y);
    if (t.type === "mousemove" || t.type === "mouseout") {
      const o = this._hoveredItem,
        a = H_(o, n);
      (o && !a && ft(e.onLeave, [t, o, this], this),
        (this._hoveredItem = n),
        n && !a && ft(e.onHover, [t, n, this], this));
    } else n && ft(e.onClick, [t, n, this], this);
  }
}
function W_(i, t, e, n, o) {
  const a = V_(n, i, t, e),
    l = Z_(o, n, t.lineHeight);
  return { itemWidth: a, itemHeight: l };
}
function V_(i, t, e, n) {
  let o = i.text;
  return (
    o &&
      typeof o != "string" &&
      (o = o.reduce((a, l) => (a.length > l.length ? a : l))),
    t + e.size / 2 + n.measureText(o).width
  );
}
function Z_(i, t, e) {
  let n = i;
  return (typeof t.text != "string" && (n = ch(t, e)), n);
}
function ch(i, t) {
  const e = i.text ? i.text.length : 0;
  return t * e;
}
function j_(i, t) {
  return !!(
    ((i === "mousemove" || i === "mouseout") && (t.onHover || t.onLeave)) ||
    (t.onClick && (i === "click" || i === "mouseup"))
  );
}
var $_ = {
  id: "legend",
  _element: Ll,
  start(i, t, e) {
    const n = (i.legend = new Ll({ ctx: i.ctx, options: e, chart: i }));
    (Bt.configure(i, n, e), Bt.addBox(i, n));
  },
  stop(i) {
    (Bt.removeBox(i, i.legend), delete i.legend);
  },
  beforeUpdate(i, t, e) {
    const n = i.legend;
    (Bt.configure(i, n, e), (n.options = e));
  },
  afterUpdate(i) {
    const t = i.legend;
    (t.buildLabels(), t.adjustHitBoxes());
  },
  afterEvent(i, t) {
    t.replay || i.legend.handleEvent(t.event);
  },
  defaults: {
    display: !0,
    position: "top",
    align: "center",
    fullSize: !0,
    reverse: !1,
    weight: 1e3,
    onClick(i, t, e) {
      const n = t.datasetIndex,
        o = e.chart;
      o.isDatasetVisible(n)
        ? (o.hide(n), (t.hidden = !0))
        : (o.show(n), (t.hidden = !1));
    },
    onHover: null,
    onLeave: null,
    labels: {
      color: (i) => i.chart.options.color,
      boxWidth: 40,
      padding: 10,
      generateLabels(i) {
        const t = i.data.datasets,
          {
            labels: {
              usePointStyle: e,
              pointStyle: n,
              textAlign: o,
              color: a,
              useBorderRadius: l,
              borderRadius: c,
            },
          } = i.legend.options;
        return i._getSortedDatasetMetas().map((u) => {
          const d = u.controller.getStyle(e ? 0 : void 0),
            p = Dt(d.borderWidth);
          return {
            text: t[u.index].label,
            fillStyle: d.backgroundColor,
            fontColor: a,
            hidden: !u.visible,
            lineCap: d.borderCapStyle,
            lineDash: d.borderDash,
            lineDashOffset: d.borderDashOffset,
            lineJoin: d.borderJoinStyle,
            lineWidth: (p.width + p.height) / 4,
            strokeStyle: d.borderColor,
            pointStyle: n || d.pointStyle,
            rotation: d.rotation,
            textAlign: o || d.textAlign,
            borderRadius: l && (c || d.borderRadius),
            datasetIndex: u.index,
          };
        }, this);
      },
    },
    title: {
      color: (i) => i.chart.options.color,
      display: !1,
      position: "center",
      text: "",
    },
  },
  descriptors: {
    _scriptable: (i) => !i.startsWith("on"),
    labels: {
      _scriptable: (i) => !["generateLabels", "filter", "sort"].includes(i),
    },
  },
};
class ir extends xe {
  constructor(t) {
    (super(),
      (this.chart = t.chart),
      (this.options = t.options),
      (this.ctx = t.ctx),
      (this._padding = void 0),
      (this.top = void 0),
      (this.bottom = void 0),
      (this.left = void 0),
      (this.right = void 0),
      (this.width = void 0),
      (this.height = void 0),
      (this.position = void 0),
      (this.weight = void 0),
      (this.fullSize = void 0));
  }
  update(t, e) {
    const n = this.options;
    if (((this.left = 0), (this.top = 0), !n.display)) {
      this.width = this.height = this.right = this.bottom = 0;
      return;
    }
    ((this.width = this.right = t), (this.height = this.bottom = e));
    const o = _t(n.text) ? n.text.length : 1;
    this._padding = Dt(n.padding);
    const a = o * Ct(n.font).lineHeight + this._padding.height;
    this.isHorizontal() ? (this.height = a) : (this.width = a);
  }
  isHorizontal() {
    const t = this.options.position;
    return t === "top" || t === "bottom";
  }
  _drawArgs(t) {
    const { top: e, left: n, bottom: o, right: a, options: l } = this,
      c = l.align;
    let u = 0,
      d,
      p,
      m;
    return (
      this.isHorizontal()
        ? ((p = Ot(c, n, a)), (m = e + t), (d = a - n))
        : (l.position === "left"
            ? ((p = n + t), (m = Ot(c, o, e)), (u = lt * -0.5))
            : ((p = a - t), (m = Ot(c, e, o)), (u = lt * 0.5)),
          (d = o - e)),
      { titleX: p, titleY: m, maxWidth: d, rotation: u }
    );
  }
  draw() {
    const t = this.ctx,
      e = this.options;
    if (!e.display) return;
    const n = Ct(e.font),
      a = n.lineHeight / 2 + this._padding.top,
      { titleX: l, titleY: c, maxWidth: u, rotation: d } = this._drawArgs(a);
    Xe(t, e.text, 0, 0, n, {
      color: e.color,
      maxWidth: u,
      rotation: d,
      textAlign: $o(e.align),
      textBaseline: "middle",
      translation: [l, c],
    });
  }
}
function U_(i, t) {
  const e = new ir({ ctx: i.ctx, options: t, chart: i });
  (Bt.configure(i, e, t), Bt.addBox(i, e), (i.titleBlock = e));
}
var q_ = {
  id: "title",
  _element: ir,
  start(i, t, e) {
    U_(i, e);
  },
  stop(i) {
    const t = i.titleBlock;
    (Bt.removeBox(i, t), delete i.titleBlock);
  },
  beforeUpdate(i, t, e) {
    const n = i.titleBlock;
    (Bt.configure(i, n, e), (n.options = e));
  },
  defaults: {
    align: "center",
    display: !1,
    font: { weight: "bold" },
    fullSize: !0,
    padding: 10,
    position: "top",
    text: "",
    weight: 2e3,
  },
  defaultRoutes: { color: "color" },
  descriptors: { _scriptable: !0, _indexable: !1 },
};
const Bn = new WeakMap();
var Y_ = {
  id: "subtitle",
  start(i, t, e) {
    const n = new ir({ ctx: i.ctx, options: e, chart: i });
    (Bt.configure(i, n, e), Bt.addBox(i, n), Bn.set(i, n));
  },
  stop(i) {
    (Bt.removeBox(i, Bn.get(i)), Bn.delete(i));
  },
  beforeUpdate(i, t, e) {
    const n = Bn.get(i);
    (Bt.configure(i, n, e), (n.options = e));
  },
  defaults: {
    align: "center",
    display: !1,
    font: { weight: "normal" },
    fullSize: !0,
    padding: 0,
    position: "top",
    text: "",
    weight: 1500,
  },
  defaultRoutes: { color: "color" },
  descriptors: { _scriptable: !0, _indexable: !1 },
};
const Fi = {
  average(i) {
    if (!i.length) return !1;
    let t,
      e,
      n = new Set(),
      o = 0,
      a = 0;
    for (t = 0, e = i.length; t < e; ++t) {
      const c = i[t].element;
      if (c && c.hasValue()) {
        const u = c.tooltipPosition();
        (n.add(u.x), (o += u.y), ++a);
      }
    }
    return a === 0 || n.size === 0
      ? !1
      : { x: [...n].reduce((c, u) => c + u) / n.size, y: o / a };
  },
  nearest(i, t) {
    if (!i.length) return !1;
    let e = t.x,
      n = t.y,
      o = Number.POSITIVE_INFINITY,
      a,
      l,
      c;
    for (a = 0, l = i.length; a < l; ++a) {
      const u = i[a].element;
      if (u && u.hasValue()) {
        const d = u.getCenterPoint(),
          p = xo(t, d);
        p < o && ((o = p), (c = u));
      }
    }
    if (c) {
      const u = c.tooltipPosition();
      ((e = u.x), (n = u.y));
    }
    return { x: e, y: n };
  },
};
function ne(i, t) {
  return (t && (_t(t) ? Array.prototype.push.apply(i, t) : i.push(t)), i);
}
function me(i) {
  return (typeof i == "string" || i instanceof String) &&
    i.indexOf(`
`) > -1
    ? i.split(`
`)
    : i;
}
function G_(i, t) {
  const { element: e, datasetIndex: n, index: o } = t,
    a = i.getDatasetMeta(n).controller,
    { label: l, value: c } = a.getLabelAndValue(o);
  return {
    chart: i,
    label: l,
    parsed: a.getParsed(o),
    raw: i.data.datasets[n].data[o],
    formattedValue: c,
    dataset: a.getDataset(),
    dataIndex: o,
    datasetIndex: n,
    element: e,
  };
}
function Cl(i, t) {
  const e = i.chart.ctx,
    { body: n, footer: o, title: a } = i,
    { boxWidth: l, boxHeight: c } = t,
    u = Ct(t.bodyFont),
    d = Ct(t.titleFont),
    p = Ct(t.footerFont),
    m = a.length,
    _ = o.length,
    v = n.length,
    x = Dt(t.padding);
  let b = x.height,
    w = 0,
    k = n.reduce(
      (A, T) => A + T.before.length + T.lines.length + T.after.length,
      0,
    );
  if (
    ((k += i.beforeBody.length + i.afterBody.length),
    m &&
      (b += m * d.lineHeight + (m - 1) * t.titleSpacing + t.titleMarginBottom),
    k)
  ) {
    const A = t.displayColors ? Math.max(c, u.lineHeight) : u.lineHeight;
    b += v * A + (k - v) * u.lineHeight + (k - 1) * t.bodySpacing;
  }
  _ && (b += t.footerMarginTop + _ * p.lineHeight + (_ - 1) * t.footerSpacing);
  let C = 0;
  const E = function (A) {
    w = Math.max(w, e.measureText(A).width + C);
  };
  return (
    e.save(),
    (e.font = d.string),
    ht(i.title, E),
    (e.font = u.string),
    ht(i.beforeBody.concat(i.afterBody), E),
    (C = t.displayColors ? l + 2 + t.boxPadding : 0),
    ht(n, (A) => {
      (ht(A.before, E), ht(A.lines, E), ht(A.after, E));
    }),
    (C = 0),
    (e.font = p.string),
    ht(i.footer, E),
    e.restore(),
    (w += x.width),
    { width: w, height: b }
  );
}
function K_(i, t) {
  const { y: e, height: n } = t;
  return e < n / 2 ? "top" : e > i.height - n / 2 ? "bottom" : "center";
}
function X_(i, t, e, n) {
  const { x: o, width: a } = n,
    l = e.caretSize + e.caretPadding;
  if ((i === "left" && o + a + l > t.width) || (i === "right" && o - a - l < 0))
    return !0;
}
function J_(i, t, e, n) {
  const { x: o, width: a } = e,
    {
      width: l,
      chartArea: { left: c, right: u },
    } = i;
  let d = "center";
  return (
    n === "center"
      ? (d = o <= (c + u) / 2 ? "left" : "right")
      : o <= a / 2
        ? (d = "left")
        : o >= l - a / 2 && (d = "right"),
    X_(d, i, t, e) && (d = "center"),
    d
  );
}
function Tl(i, t, e) {
  const n = e.yAlign || t.yAlign || K_(i, e);
  return { xAlign: e.xAlign || t.xAlign || J_(i, t, e, n), yAlign: n };
}
function Q_(i, t) {
  let { x: e, width: n } = i;
  return (t === "right" ? (e -= n) : t === "center" && (e -= n / 2), e);
}
function ty(i, t, e) {
  let { y: n, height: o } = i;
  return (
    t === "top" ? (n += e) : t === "bottom" ? (n -= o + e) : (n -= o / 2),
    n
  );
}
function El(i, t, e, n) {
  const { caretSize: o, caretPadding: a, cornerRadius: l } = i,
    { xAlign: c, yAlign: u } = e,
    d = o + a,
    { topLeft: p, topRight: m, bottomLeft: _, bottomRight: v } = qe(l);
  let x = Q_(t, c);
  const b = ty(t, u, d);
  return (
    u === "center"
      ? c === "left"
        ? (x += d)
        : c === "right" && (x -= d)
      : c === "left"
        ? (x -= Math.max(p, _) + o)
        : c === "right" && (x += Math.max(m, v) + o),
    { x: Et(x, 0, n.width - t.width), y: Et(b, 0, n.height - t.height) }
  );
}
function Dn(i, t, e) {
  const n = Dt(e.padding);
  return t === "center"
    ? i.x + i.width / 2
    : t === "right"
      ? i.x + i.width - n.right
      : i.x + n.left;
}
function Al(i) {
  return ne([], me(i));
}
function ey(i, t, e) {
  return Be(i, { tooltip: t, tooltipItems: e, type: "tooltip" });
}
function Ol(i, t) {
  const e = t && t.dataset && t.dataset.tooltip && t.dataset.tooltip.callbacks;
  return e ? i.override(e) : i;
}
const hh = {
  beforeTitle: pe,
  title(i) {
    if (i.length > 0) {
      const t = i[0],
        e = t.chart.data.labels,
        n = e ? e.length : 0;
      if (this && this.options && this.options.mode === "dataset")
        return t.dataset.label || "";
      if (t.label) return t.label;
      if (n > 0 && t.dataIndex < n) return e[t.dataIndex];
    }
    return "";
  },
  afterTitle: pe,
  beforeBody: pe,
  beforeLabel: pe,
  label(i) {
    if (this && this.options && this.options.mode === "dataset")
      return i.label + ": " + i.formattedValue || i.formattedValue;
    let t = i.dataset.label || "";
    t && (t += ": ");
    const e = i.formattedValue;
    return (tt(e) || (t += e), t);
  },
  labelColor(i) {
    const e = i.chart
      .getDatasetMeta(i.datasetIndex)
      .controller.getStyle(i.dataIndex);
    return {
      borderColor: e.borderColor,
      backgroundColor: e.backgroundColor,
      borderWidth: e.borderWidth,
      borderDash: e.borderDash,
      borderDashOffset: e.borderDashOffset,
      borderRadius: 0,
    };
  },
  labelTextColor() {
    return this.options.bodyColor;
  },
  labelPointStyle(i) {
    const e = i.chart
      .getDatasetMeta(i.datasetIndex)
      .controller.getStyle(i.dataIndex);
    return { pointStyle: e.pointStyle, rotation: e.rotation };
  },
  afterLabel: pe,
  afterBody: pe,
  beforeFooter: pe,
  footer: pe,
  afterFooter: pe,
};
function Nt(i, t, e, n) {
  const o = i[t].call(e, n);
  return typeof o > "u" ? hh[t].call(e, n) : o;
}
class Il extends xe {
  static positioners = Fi;
  constructor(t) {
    (super(),
      (this.opacity = 0),
      (this._active = []),
      (this._eventPosition = void 0),
      (this._size = void 0),
      (this._cachedAnimations = void 0),
      (this._tooltipItems = []),
      (this.$animations = void 0),
      (this.$context = void 0),
      (this.chart = t.chart),
      (this.options = t.options),
      (this.dataPoints = void 0),
      (this.title = void 0),
      (this.beforeBody = void 0),
      (this.body = void 0),
      (this.afterBody = void 0),
      (this.footer = void 0),
      (this.xAlign = void 0),
      (this.yAlign = void 0),
      (this.x = void 0),
      (this.y = void 0),
      (this.height = void 0),
      (this.width = void 0),
      (this.caretX = void 0),
      (this.caretY = void 0),
      (this.labelColors = void 0),
      (this.labelPointStyles = void 0),
      (this.labelTextColors = void 0));
  }
  initialize(t) {
    ((this.options = t),
      (this._cachedAnimations = void 0),
      (this.$context = void 0));
  }
  _resolveAnimations() {
    const t = this._cachedAnimations;
    if (t) return t;
    const e = this.chart,
      n = this.options.setContext(this.getContext()),
      o = n.enabled && e.options.animation && n.animations,
      a = new Vc(this.chart, o);
    return (o._cacheable && (this._cachedAnimations = Object.freeze(a)), a);
  }
  getContext() {
    return (
      this.$context ||
      (this.$context = ey(this.chart.getContext(), this, this._tooltipItems))
    );
  }
  getTitle(t, e) {
    const { callbacks: n } = e,
      o = Nt(n, "beforeTitle", this, t),
      a = Nt(n, "title", this, t),
      l = Nt(n, "afterTitle", this, t);
    let c = [];
    return ((c = ne(c, me(o))), (c = ne(c, me(a))), (c = ne(c, me(l))), c);
  }
  getBeforeBody(t, e) {
    return Al(Nt(e.callbacks, "beforeBody", this, t));
  }
  getBody(t, e) {
    const { callbacks: n } = e,
      o = [];
    return (
      ht(t, (a) => {
        const l = { before: [], lines: [], after: [] },
          c = Ol(n, a);
        (ne(l.before, me(Nt(c, "beforeLabel", this, a))),
          ne(l.lines, Nt(c, "label", this, a)),
          ne(l.after, me(Nt(c, "afterLabel", this, a))),
          o.push(l));
      }),
      o
    );
  }
  getAfterBody(t, e) {
    return Al(Nt(e.callbacks, "afterBody", this, t));
  }
  getFooter(t, e) {
    const { callbacks: n } = e,
      o = Nt(n, "beforeFooter", this, t),
      a = Nt(n, "footer", this, t),
      l = Nt(n, "afterFooter", this, t);
    let c = [];
    return ((c = ne(c, me(o))), (c = ne(c, me(a))), (c = ne(c, me(l))), c);
  }
  _createItems(t) {
    const e = this._active,
      n = this.chart.data,
      o = [],
      a = [],
      l = [];
    let c = [],
      u,
      d;
    for (u = 0, d = e.length; u < d; ++u) c.push(G_(this.chart, e[u]));
    return (
      t.filter && (c = c.filter((p, m, _) => t.filter(p, m, _, n))),
      t.itemSort && (c = c.sort((p, m) => t.itemSort(p, m, n))),
      ht(c, (p) => {
        const m = Ol(t.callbacks, p);
        (o.push(Nt(m, "labelColor", this, p)),
          a.push(Nt(m, "labelPointStyle", this, p)),
          l.push(Nt(m, "labelTextColor", this, p)));
      }),
      (this.labelColors = o),
      (this.labelPointStyles = a),
      (this.labelTextColors = l),
      (this.dataPoints = c),
      c
    );
  }
  update(t, e) {
    const n = this.options.setContext(this.getContext()),
      o = this._active;
    let a,
      l = [];
    if (!o.length) this.opacity !== 0 && (a = { opacity: 0 });
    else {
      const c = Fi[n.position].call(this, o, this._eventPosition);
      ((l = this._createItems(n)),
        (this.title = this.getTitle(l, n)),
        (this.beforeBody = this.getBeforeBody(l, n)),
        (this.body = this.getBody(l, n)),
        (this.afterBody = this.getAfterBody(l, n)),
        (this.footer = this.getFooter(l, n)));
      const u = (this._size = Cl(this, n)),
        d = Object.assign({}, c, u),
        p = Tl(this.chart, n, d),
        m = El(n, d, p, this.chart);
      ((this.xAlign = p.xAlign),
        (this.yAlign = p.yAlign),
        (a = {
          opacity: 1,
          x: m.x,
          y: m.y,
          width: u.width,
          height: u.height,
          caretX: c.x,
          caretY: c.y,
        }));
    }
    ((this._tooltipItems = l),
      (this.$context = void 0),
      a && this._resolveAnimations().update(this, a),
      t &&
        n.external &&
        n.external.call(this, { chart: this.chart, tooltip: this, replay: e }));
  }
  drawCaret(t, e, n, o) {
    const a = this.getCaretPosition(t, n, o);
    (e.lineTo(a.x1, a.y1), e.lineTo(a.x2, a.y2), e.lineTo(a.x3, a.y3));
  }
  getCaretPosition(t, e, n) {
    const { xAlign: o, yAlign: a } = this,
      { caretSize: l, cornerRadius: c } = n,
      { topLeft: u, topRight: d, bottomLeft: p, bottomRight: m } = qe(c),
      { x: _, y: v } = t,
      { width: x, height: b } = e;
    let w, k, C, E, A, T;
    return (
      a === "center"
        ? ((A = v + b / 2),
          o === "left"
            ? ((w = _), (k = w - l), (E = A + l), (T = A - l))
            : ((w = _ + x), (k = w + l), (E = A - l), (T = A + l)),
          (C = w))
        : (o === "left"
            ? (k = _ + Math.max(u, p) + l)
            : o === "right"
              ? (k = _ + x - Math.max(d, m) - l)
              : (k = this.caretX),
          a === "top"
            ? ((E = v), (A = E - l), (w = k - l), (C = k + l))
            : ((E = v + b), (A = E + l), (w = k + l), (C = k - l)),
          (T = E)),
      { x1: w, x2: k, x3: C, y1: E, y2: A, y3: T }
    );
  }
  drawTitle(t, e, n) {
    const o = this.title,
      a = o.length;
    let l, c, u;
    if (a) {
      const d = hi(n.rtl, this.x, this.width);
      for (
        t.x = Dn(this, n.titleAlign, n),
          e.textAlign = d.textAlign(n.titleAlign),
          e.textBaseline = "middle",
          l = Ct(n.titleFont),
          c = n.titleSpacing,
          e.fillStyle = n.titleColor,
          e.font = l.string,
          u = 0;
        u < a;
        ++u
      )
        (e.fillText(o[u], d.x(t.x), t.y + l.lineHeight / 2),
          (t.y += l.lineHeight + c),
          u + 1 === a && (t.y += n.titleMarginBottom - c));
    }
  }
  _drawColorBox(t, e, n, o, a) {
    const l = this.labelColors[n],
      c = this.labelPointStyles[n],
      { boxHeight: u, boxWidth: d } = a,
      p = Ct(a.bodyFont),
      m = Dn(this, "left", a),
      _ = o.x(m),
      v = u < p.lineHeight ? (p.lineHeight - u) / 2 : 0,
      x = e.y + v;
    if (a.usePointStyle) {
      const b = {
          radius: Math.min(d, u) / 2,
          pointStyle: c.pointStyle,
          rotation: c.rotation,
          borderWidth: 1,
        },
        w = o.leftForLtr(_, d) + d / 2,
        k = x + u / 2;
      ((t.strokeStyle = a.multiKeyBackground),
        (t.fillStyle = a.multiKeyBackground),
        Po(t, b, w, k),
        (t.strokeStyle = l.borderColor),
        (t.fillStyle = l.backgroundColor),
        Po(t, b, w, k));
    } else {
      ((t.lineWidth = et(l.borderWidth)
        ? Math.max(...Object.values(l.borderWidth))
        : l.borderWidth || 1),
        (t.strokeStyle = l.borderColor),
        t.setLineDash(l.borderDash || []),
        (t.lineDashOffset = l.borderDashOffset || 0));
      const b = o.leftForLtr(_, d),
        w = o.leftForLtr(o.xPlus(_, 1), d - 2),
        k = qe(l.borderRadius);
      Object.values(k).some((C) => C !== 0)
        ? (t.beginPath(),
          (t.fillStyle = a.multiKeyBackground),
          Gi(t, { x: b, y: x, w: d, h: u, radius: k }),
          t.fill(),
          t.stroke(),
          (t.fillStyle = l.backgroundColor),
          t.beginPath(),
          Gi(t, { x: w, y: x + 1, w: d - 2, h: u - 2, radius: k }),
          t.fill())
        : ((t.fillStyle = a.multiKeyBackground),
          t.fillRect(b, x, d, u),
          t.strokeRect(b, x, d, u),
          (t.fillStyle = l.backgroundColor),
          t.fillRect(w, x + 1, d - 2, u - 2));
    }
    t.fillStyle = this.labelTextColors[n];
  }
  drawBody(t, e, n) {
    const { body: o } = this,
      {
        bodySpacing: a,
        bodyAlign: l,
        displayColors: c,
        boxHeight: u,
        boxWidth: d,
        boxPadding: p,
      } = n,
      m = Ct(n.bodyFont);
    let _ = m.lineHeight,
      v = 0;
    const x = hi(n.rtl, this.x, this.width),
      b = function (R) {
        (e.fillText(R, x.x(t.x + v), t.y + _ / 2), (t.y += _ + a));
      },
      w = x.textAlign(l);
    let k, C, E, A, T, B, D;
    for (
      e.textAlign = l,
        e.textBaseline = "middle",
        e.font = m.string,
        t.x = Dn(this, w, n),
        e.fillStyle = n.bodyColor,
        ht(this.beforeBody, b),
        v = c && w !== "right" ? (l === "center" ? d / 2 + p : d + 2 + p) : 0,
        A = 0,
        B = o.length;
      A < B;
      ++A
    ) {
      for (
        k = o[A],
          C = this.labelTextColors[A],
          e.fillStyle = C,
          ht(k.before, b),
          E = k.lines,
          c &&
            E.length &&
            (this._drawColorBox(e, t, A, x, n),
            (_ = Math.max(m.lineHeight, u))),
          T = 0,
          D = E.length;
        T < D;
        ++T
      )
        (b(E[T]), (_ = m.lineHeight));
      ht(k.after, b);
    }
    ((v = 0), (_ = m.lineHeight), ht(this.afterBody, b), (t.y -= a));
  }
  drawFooter(t, e, n) {
    const o = this.footer,
      a = o.length;
    let l, c;
    if (a) {
      const u = hi(n.rtl, this.x, this.width);
      for (
        t.x = Dn(this, n.footerAlign, n),
          t.y += n.footerMarginTop,
          e.textAlign = u.textAlign(n.footerAlign),
          e.textBaseline = "middle",
          l = Ct(n.footerFont),
          e.fillStyle = n.footerColor,
          e.font = l.string,
          c = 0;
        c < a;
        ++c
      )
        (e.fillText(o[c], u.x(t.x), t.y + l.lineHeight / 2),
          (t.y += l.lineHeight + n.footerSpacing));
    }
  }
  drawBackground(t, e, n, o) {
    const { xAlign: a, yAlign: l } = this,
      { x: c, y: u } = t,
      { width: d, height: p } = n,
      {
        topLeft: m,
        topRight: _,
        bottomLeft: v,
        bottomRight: x,
      } = qe(o.cornerRadius);
    ((e.fillStyle = o.backgroundColor),
      (e.strokeStyle = o.borderColor),
      (e.lineWidth = o.borderWidth),
      e.beginPath(),
      e.moveTo(c + m, u),
      l === "top" && this.drawCaret(t, e, n, o),
      e.lineTo(c + d - _, u),
      e.quadraticCurveTo(c + d, u, c + d, u + _),
      l === "center" && a === "right" && this.drawCaret(t, e, n, o),
      e.lineTo(c + d, u + p - x),
      e.quadraticCurveTo(c + d, u + p, c + d - x, u + p),
      l === "bottom" && this.drawCaret(t, e, n, o),
      e.lineTo(c + v, u + p),
      e.quadraticCurveTo(c, u + p, c, u + p - v),
      l === "center" && a === "left" && this.drawCaret(t, e, n, o),
      e.lineTo(c, u + m),
      e.quadraticCurveTo(c, u, c + m, u),
      e.closePath(),
      e.fill(),
      o.borderWidth > 0 && e.stroke());
  }
  _updateAnimationTarget(t) {
    const e = this.chart,
      n = this.$animations,
      o = n && n.x,
      a = n && n.y;
    if (o || a) {
      const l = Fi[t.position].call(this, this._active, this._eventPosition);
      if (!l) return;
      const c = (this._size = Cl(this, t)),
        u = Object.assign({}, l, this._size),
        d = Tl(e, t, u),
        p = El(t, u, d, e);
      (o._to !== p.x || a._to !== p.y) &&
        ((this.xAlign = d.xAlign),
        (this.yAlign = d.yAlign),
        (this.width = c.width),
        (this.height = c.height),
        (this.caretX = l.x),
        (this.caretY = l.y),
        this._resolveAnimations().update(this, p));
    }
  }
  _willRender() {
    return !!this.opacity;
  }
  draw(t) {
    const e = this.options.setContext(this.getContext());
    let n = this.opacity;
    if (!n) return;
    this._updateAnimationTarget(e);
    const o = { width: this.width, height: this.height },
      a = { x: this.x, y: this.y };
    n = Math.abs(n) < 0.001 ? 0 : n;
    const l = Dt(e.padding),
      c =
        this.title.length ||
        this.beforeBody.length ||
        this.body.length ||
        this.afterBody.length ||
        this.footer.length;
    e.enabled &&
      c &&
      (t.save(),
      (t.globalAlpha = n),
      this.drawBackground(a, t, o, e),
      Rc(t, e.textDirection),
      (a.y += l.top),
      this.drawTitle(a, t, e),
      this.drawBody(a, t, e),
      this.drawFooter(a, t, e),
      zc(t, e.textDirection),
      t.restore());
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(t, e) {
    const n = this._active,
      o = t.map(({ datasetIndex: c, index: u }) => {
        const d = this.chart.getDatasetMeta(c);
        if (!d) throw new Error("Cannot find a dataset at index " + c);
        return { datasetIndex: c, element: d.data[u], index: u };
      }),
      a = !Zn(n, o),
      l = this._positionChanged(o, e);
    (a || l) &&
      ((this._active = o),
      (this._eventPosition = e),
      (this._ignoreReplayEvents = !0),
      this.update(!0));
  }
  handleEvent(t, e, n = !0) {
    if (e && this._ignoreReplayEvents) return !1;
    this._ignoreReplayEvents = !1;
    const o = this.options,
      a = this._active || [],
      l = this._getActiveElements(t, a, e, n),
      c = this._positionChanged(l, t),
      u = e || !Zn(l, a) || c;
    return (
      u &&
        ((this._active = l),
        (o.enabled || o.external) &&
          ((this._eventPosition = { x: t.x, y: t.y }), this.update(!0, e))),
      u
    );
  }
  _getActiveElements(t, e, n, o) {
    const a = this.options;
    if (t.type === "mouseout") return [];
    if (!o)
      return e.filter(
        (c) =>
          this.chart.data.datasets[c.datasetIndex] &&
          this.chart
            .getDatasetMeta(c.datasetIndex)
            .controller.getParsed(c.index) !== void 0,
      );
    const l = this.chart.getElementsAtEventForMode(t, a.mode, a, n);
    return (a.reverse && l.reverse(), l);
  }
  _positionChanged(t, e) {
    const { caretX: n, caretY: o, options: a } = this,
      l = Fi[a.position].call(this, t, e);
    return l !== !1 && (n !== l.x || o !== l.y);
  }
}
var iy = {
    id: "tooltip",
    _element: Il,
    positioners: Fi,
    afterInit(i, t, e) {
      e && (i.tooltip = new Il({ chart: i, options: e }));
    },
    beforeUpdate(i, t, e) {
      i.tooltip && i.tooltip.initialize(e);
    },
    reset(i, t, e) {
      i.tooltip && i.tooltip.initialize(e);
    },
    afterDraw(i) {
      const t = i.tooltip;
      if (t && t._willRender()) {
        const e = { tooltip: t };
        if (
          i.notifyPlugins("beforeTooltipDraw", { ...e, cancelable: !0 }) === !1
        )
          return;
        (t.draw(i.ctx), i.notifyPlugins("afterTooltipDraw", e));
      }
    },
    afterEvent(i, t) {
      if (i.tooltip) {
        const e = t.replay;
        i.tooltip.handleEvent(t.event, e, t.inChartArea) && (t.changed = !0);
      }
    },
    defaults: {
      enabled: !0,
      external: null,
      position: "average",
      backgroundColor: "rgba(0,0,0,0.8)",
      titleColor: "#fff",
      titleFont: { weight: "bold" },
      titleSpacing: 2,
      titleMarginBottom: 6,
      titleAlign: "left",
      bodyColor: "#fff",
      bodySpacing: 2,
      bodyFont: {},
      bodyAlign: "left",
      footerColor: "#fff",
      footerSpacing: 2,
      footerMarginTop: 6,
      footerFont: { weight: "bold" },
      footerAlign: "left",
      padding: 6,
      caretPadding: 2,
      caretSize: 5,
      cornerRadius: 6,
      boxHeight: (i, t) => t.bodyFont.size,
      boxWidth: (i, t) => t.bodyFont.size,
      multiKeyBackground: "#fff",
      displayColors: !0,
      boxPadding: 0,
      borderColor: "rgba(0,0,0,0)",
      borderWidth: 0,
      animation: { duration: 400, easing: "easeOutQuart" },
      animations: {
        numbers: {
          type: "number",
          properties: ["x", "y", "width", "height", "caretX", "caretY"],
        },
        opacity: { easing: "linear", duration: 200 },
      },
      callbacks: hh,
    },
    defaultRoutes: { bodyFont: "font", footerFont: "font", titleFont: "font" },
    descriptors: {
      _scriptable: (i) =>
        i !== "filter" && i !== "itemSort" && i !== "external",
      _indexable: !1,
      callbacks: { _scriptable: !1, _indexable: !1 },
      animation: { _fallback: !1 },
      animations: { _fallback: "animation" },
    },
    additionalOptionScopes: ["interaction"],
  },
  ny = Object.freeze({
    __proto__: null,
    Colors: g_,
    Decimation: v_,
    Filler: F_,
    Legend: $_,
    SubTitle: Y_,
    Title: q_,
    Tooltip: iy,
  });
const sy = (i, t, e, n) => (
  typeof t == "string"
    ? ((e = i.push(t) - 1), n.unshift({ index: e, label: t }))
    : isNaN(t) && (e = null),
  e
);
function oy(i, t, e, n) {
  const o = i.indexOf(t);
  if (o === -1) return sy(i, t, e, n);
  const a = i.lastIndexOf(t);
  return o !== a ? e : o;
}
const ry = (i, t) => (i === null ? null : Et(Math.round(i), 0, t));
function Bl(i) {
  const t = this.getLabels();
  return i >= 0 && i < t.length ? t[i] : i;
}
class ay extends Je {
  static id = "category";
  static defaults = { ticks: { callback: Bl } };
  constructor(t) {
    (super(t),
      (this._startValue = void 0),
      (this._valueRange = 0),
      (this._addedLabels = []));
  }
  init(t) {
    const e = this._addedLabels;
    if (e.length) {
      const n = this.getLabels();
      for (const { index: o, label: a } of e) n[o] === a && n.splice(o, 1);
      this._addedLabels = [];
    }
    super.init(t);
  }
  parse(t, e) {
    if (tt(t)) return null;
    const n = this.getLabels();
    return (
      (e =
        isFinite(e) && n[e] === t ? e : oy(n, t, q(e, t), this._addedLabels)),
      ry(e, n.length - 1)
    );
  }
  determineDataLimits() {
    const { minDefined: t, maxDefined: e } = this.getUserBounds();
    let { min: n, max: o } = this.getMinMax(!0);
    (this.options.bounds === "ticks" &&
      (t || (n = 0), e || (o = this.getLabels().length - 1)),
      (this.min = n),
      (this.max = o));
  }
  buildTicks() {
    const t = this.min,
      e = this.max,
      n = this.options.offset,
      o = [];
    let a = this.getLabels();
    ((a = t === 0 && e === a.length - 1 ? a : a.slice(t, e + 1)),
      (this._valueRange = Math.max(a.length - (n ? 0 : 1), 1)),
      (this._startValue = this.min - (n ? 0.5 : 0)));
    for (let l = t; l <= e; l++) o.push({ value: l });
    return o;
  }
  getLabelForValue(t) {
    return Bl.call(this, t);
  }
  configure() {
    (super.configure(),
      this.isHorizontal() || (this._reversePixels = !this._reversePixels));
  }
  getPixelForValue(t) {
    return (
      typeof t != "number" && (t = this.parse(t)),
      t === null
        ? NaN
        : this.getPixelForDecimal((t - this._startValue) / this._valueRange)
    );
  }
  getPixelForTick(t) {
    const e = this.ticks;
    return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t].value);
  }
  getValueForPixel(t) {
    return Math.round(
      this._startValue + this.getDecimalForPixel(t) * this._valueRange,
    );
  }
  getBasePixel() {
    return this.bottom;
  }
}
function ly(i, t) {
  const e = [],
    {
      bounds: o,
      step: a,
      min: l,
      max: c,
      precision: u,
      count: d,
      maxTicks: p,
      maxDigits: m,
      includeBounds: _,
    } = i,
    v = a || 1,
    x = p - 1,
    { min: b, max: w } = t,
    k = !tt(l),
    C = !tt(c),
    E = !tt(d),
    A = (w - b) / (m + 1);
  let T = Ca((w - b) / x / v) * v,
    B,
    D,
    R,
    H;
  if (T < 1e-14 && !k && !C) return [{ value: b }, { value: w }];
  ((H = Math.ceil(w / T) - Math.floor(b / T)),
    H > x && (T = Ca((H * T) / x / v) * v),
    tt(u) || ((B = Math.pow(10, u)), (T = Math.ceil(T * B) / B)),
    o === "ticks"
      ? ((D = Math.floor(b / T) * T), (R = Math.ceil(w / T) * T))
      : ((D = b), (R = w)),
    k && C && a && jf((c - l) / a, T / 1e3)
      ? ((H = Math.round(Math.min((c - l) / T, p))),
        (T = (c - l) / H),
        (D = l),
        (R = c))
      : E
        ? ((D = k ? l : D), (R = C ? c : R), (H = d - 1), (T = (R - D) / H))
        : ((H = (R - D) / T),
          Vi(H, Math.round(H), T / 1e3)
            ? (H = Math.round(H))
            : (H = Math.ceil(H))));
  const U = Math.max(Ta(T), Ta(D));
  ((B = Math.pow(10, tt(u) ? U : u)),
    (D = Math.round(D * B) / B),
    (R = Math.round(R * B) / B));
  let W = 0;
  for (
    k &&
    (_ && D !== l
      ? (e.push({ value: l }),
        D < l && W++,
        Vi(Math.round((D + W * T) * B) / B, l, Dl(l, A, i)) && W++)
      : D < l && W++);
    W < H;
    ++W
  ) {
    const j = Math.round((D + W * T) * B) / B;
    if (C && j > c) break;
    e.push({ value: j });
  }
  return (
    C && _ && R !== c
      ? e.length && Vi(e[e.length - 1].value, c, Dl(c, A, i))
        ? (e[e.length - 1].value = c)
        : e.push({ value: c })
      : (!C || R === c) && e.push({ value: R }),
    e
  );
}
function Dl(i, t, { horizontal: e, minRotation: n }) {
  const o = Jt(n),
    a = (e ? Math.sin(o) : Math.cos(o)) || 0.001,
    l = 0.75 * t * ("" + i).length;
  return Math.min(t / a, l);
}
class Kn extends Je {
  constructor(t) {
    (super(t),
      (this.start = void 0),
      (this.end = void 0),
      (this._startValue = void 0),
      (this._endValue = void 0),
      (this._valueRange = 0));
  }
  parse(t, e) {
    return tt(t) ||
      ((typeof t == "number" || t instanceof Number) && !isFinite(+t))
      ? null
      : +t;
  }
  handleTickRangeOptions() {
    const { beginAtZero: t } = this.options,
      { minDefined: e, maxDefined: n } = this.getUserBounds();
    let { min: o, max: a } = this;
    const l = (u) => (o = e ? o : u),
      c = (u) => (a = n ? a : u);
    if (t) {
      const u = ae(o),
        d = ae(a);
      u < 0 && d < 0 ? c(0) : u > 0 && d > 0 && l(0);
    }
    if (o === a) {
      let u = a === 0 ? 1 : Math.abs(a * 0.05);
      (c(a + u), t || l(o - u));
    }
    ((this.min = o), (this.max = a));
  }
  getTickLimit() {
    const t = this.options.ticks;
    let { maxTicksLimit: e, stepSize: n } = t,
      o;
    return (
      n
        ? ((o = Math.ceil(this.max / n) - Math.floor(this.min / n) + 1),
          o > 1e3 &&
            (console.warn(
              `scales.${this.id}.ticks.stepSize: ${n} would result generating up to ${o} ticks. Limiting to 1000.`,
            ),
            (o = 1e3)))
        : ((o = this.computeTickLimit()), (e = e || 11)),
      e && (o = Math.min(e, o)),
      o
    );
  }
  computeTickLimit() {
    return Number.POSITIVE_INFINITY;
  }
  buildTicks() {
    const t = this.options,
      e = t.ticks;
    let n = this.getTickLimit();
    n = Math.max(2, n);
    const o = {
        maxTicks: n,
        bounds: t.bounds,
        min: t.min,
        max: t.max,
        precision: e.precision,
        step: e.stepSize,
        count: e.count,
        maxDigits: this._maxDigits(),
        horizontal: this.isHorizontal(),
        minRotation: e.minRotation || 0,
        includeBounds: e.includeBounds !== !1,
      },
      a = this._range || this,
      l = ly(o, a);
    return (
      t.bounds === "ticks" && vc(l, this, "value"),
      t.reverse
        ? (l.reverse(), (this.start = this.max), (this.end = this.min))
        : ((this.start = this.min), (this.end = this.max)),
      l
    );
  }
  configure() {
    const t = this.ticks;
    let e = this.min,
      n = this.max;
    if ((super.configure(), this.options.offset && t.length)) {
      const o = (n - e) / Math.max(t.length - 1, 1) / 2;
      ((e -= o), (n += o));
    }
    ((this._startValue = e), (this._endValue = n), (this._valueRange = n - e));
  }
  getLabelForValue(t) {
    return en(t, this.chart.options.locale, this.options.ticks.format);
  }
}
class cy extends Kn {
  static id = "linear";
  static defaults = { ticks: { callback: rs.formatters.numeric } };
  determineDataLimits() {
    const { min: t, max: e } = this.getMinMax(!0);
    ((this.min = wt(t) ? t : 0),
      (this.max = wt(e) ? e : 1),
      this.handleTickRangeOptions());
  }
  computeTickLimit() {
    const t = this.isHorizontal(),
      e = t ? this.width : this.height,
      n = Jt(this.options.ticks.minRotation),
      o = (t ? Math.sin(n) : Math.cos(n)) || 0.001,
      a = this._resolveTickFontOptions(0);
    return Math.ceil(e / Math.min(40, a.lineHeight / o));
  }
  getPixelForValue(t) {
    return t === null
      ? NaN
      : this.getPixelForDecimal((t - this._startValue) / this._valueRange);
  }
  getValueForPixel(t) {
    return this._startValue + this.getDecimalForPixel(t) * this._valueRange;
  }
}
const Xi = (i) => Math.floor(Me(i)),
  je = (i, t) => Math.pow(10, Xi(i) + t);
function Rl(i) {
  return i / Math.pow(10, Xi(i)) === 1;
}
function zl(i, t, e) {
  const n = Math.pow(10, e),
    o = Math.floor(i / n);
  return Math.ceil(t / n) - o;
}
function hy(i, t) {
  const e = t - i;
  let n = Xi(e);
  for (; zl(i, t, n) > 10; ) n++;
  for (; zl(i, t, n) < 10; ) n--;
  return Math.min(n, Xi(i));
}
function uy(i, { min: t, max: e }) {
  t = Vt(i.min, t);
  const n = [],
    o = Xi(t);
  let a = hy(t, e),
    l = a < 0 ? Math.pow(10, Math.abs(a)) : 1;
  const c = Math.pow(10, a),
    u = o > a ? Math.pow(10, o) : 0,
    d = Math.round((t - u) * l) / l,
    p = Math.floor((t - u) / c / 10) * c * 10;
  let m = Math.floor((d - p) / Math.pow(10, a)),
    _ = Vt(i.min, Math.round((u + p + m * Math.pow(10, a)) * l) / l);
  for (; _ < e; )
    (n.push({ value: _, major: Rl(_), significand: m }),
      m >= 10 ? (m = m < 15 ? 15 : 20) : m++,
      m >= 20 && (a++, (m = 2), (l = a >= 0 ? 1 : l)),
      (_ = Math.round((u + p + m * Math.pow(10, a)) * l) / l));
  const v = Vt(i.max, _);
  return (n.push({ value: v, major: Rl(v), significand: m }), n);
}
class dy extends Je {
  static id = "logarithmic";
  static defaults = {
    ticks: { callback: rs.formatters.logarithmic, major: { enabled: !0 } },
  };
  constructor(t) {
    (super(t),
      (this.start = void 0),
      (this.end = void 0),
      (this._startValue = void 0),
      (this._valueRange = 0));
  }
  parse(t, e) {
    const n = Kn.prototype.parse.apply(this, [t, e]);
    if (n === 0) {
      this._zero = !0;
      return;
    }
    return wt(n) && n > 0 ? n : null;
  }
  determineDataLimits() {
    const { min: t, max: e } = this.getMinMax(!0);
    ((this.min = wt(t) ? Math.max(0, t) : null),
      (this.max = wt(e) ? Math.max(0, e) : null),
      this.options.beginAtZero && (this._zero = !0),
      this._zero &&
        this.min !== this._suggestedMin &&
        !wt(this._userMin) &&
        (this.min = t === je(this.min, 0) ? je(this.min, -1) : je(this.min, 0)),
      this.handleTickRangeOptions());
  }
  handleTickRangeOptions() {
    const { minDefined: t, maxDefined: e } = this.getUserBounds();
    let n = this.min,
      o = this.max;
    const a = (c) => (n = t ? n : c),
      l = (c) => (o = e ? o : c);
    (n === o && (n <= 0 ? (a(1), l(10)) : (a(je(n, -1)), l(je(o, 1)))),
      n <= 0 && a(je(o, -1)),
      o <= 0 && l(je(n, 1)),
      (this.min = n),
      (this.max = o));
  }
  buildTicks() {
    const t = this.options,
      e = { min: this._userMin, max: this._userMax },
      n = uy(e, this);
    return (
      t.bounds === "ticks" && vc(n, this, "value"),
      t.reverse
        ? (n.reverse(), (this.start = this.max), (this.end = this.min))
        : ((this.start = this.min), (this.end = this.max)),
      n
    );
  }
  getLabelForValue(t) {
    return t === void 0
      ? "0"
      : en(t, this.chart.options.locale, this.options.ticks.format);
  }
  configure() {
    const t = this.min;
    (super.configure(),
      (this._startValue = Me(t)),
      (this._valueRange = Me(this.max) - Me(t)));
  }
  getPixelForValue(t) {
    return (
      (t === void 0 || t === 0) && (t = this.min),
      t === null || isNaN(t)
        ? NaN
        : this.getPixelForDecimal(
            t === this.min ? 0 : (Me(t) - this._startValue) / this._valueRange,
          )
    );
  }
  getValueForPixel(t) {
    const e = this.getDecimalForPixel(t);
    return Math.pow(10, this._startValue + e * this._valueRange);
  }
}
function To(i) {
  const t = i.ticks;
  if (t.display && i.display) {
    const e = Dt(t.backdropPadding);
    return q(t.font && t.font.size, yt.font.size) + e.height;
  }
  return 0;
}
function fy(i, t, e) {
  return (
    (e = _t(e) ? e : [e]),
    { w: ap(i, t.string, e), h: e.length * t.lineHeight }
  );
}
function Nl(i, t, e, n, o) {
  return i === n || i === o
    ? { start: t - e / 2, end: t + e / 2 }
    : i < n || i > o
      ? { start: t - e, end: t }
      : { start: t, end: t + e };
}
function py(i) {
  const t = {
      l: i.left + i._padding.left,
      r: i.right - i._padding.right,
      t: i.top + i._padding.top,
      b: i.bottom - i._padding.bottom,
    },
    e = Object.assign({}, t),
    n = [],
    o = [],
    a = i._pointLabels.length,
    l = i.options.pointLabels,
    c = l.centerPointLabels ? lt / a : 0;
  for (let u = 0; u < a; u++) {
    const d = l.setContext(i.getPointLabelContext(u));
    o[u] = d.padding;
    const p = i.getPointPosition(u, i.drawingArea + o[u], c),
      m = Ct(d.font),
      _ = fy(i.ctx, m, i._pointLabels[u]);
    n[u] = _;
    const v = It(i.getIndexAngle(u) + c),
      x = Math.round(Zo(v)),
      b = Nl(x, p.x, _.w, 0, 180),
      w = Nl(x, p.y, _.h, 90, 270);
    gy(e, t, v, b, w);
  }
  (i.setCenterPoint(t.l - e.l, e.r - t.r, t.t - e.t, e.b - t.b),
    (i._pointLabelItems = yy(i, n, o)));
}
function gy(i, t, e, n, o) {
  const a = Math.abs(Math.sin(e)),
    l = Math.abs(Math.cos(e));
  let c = 0,
    u = 0;
  (n.start < t.l
    ? ((c = (t.l - n.start) / a), (i.l = Math.min(i.l, t.l - c)))
    : n.end > t.r && ((c = (n.end - t.r) / a), (i.r = Math.max(i.r, t.r + c))),
    o.start < t.t
      ? ((u = (t.t - o.start) / l), (i.t = Math.min(i.t, t.t - u)))
      : o.end > t.b &&
        ((u = (o.end - t.b) / l), (i.b = Math.max(i.b, t.b + u))));
}
function my(i, t, e) {
  const n = i.drawingArea,
    { extra: o, additionalAngle: a, padding: l, size: c } = e,
    u = i.getPointPosition(t, n + o + l, a),
    d = Math.round(Zo(It(u.angle + kt))),
    p = xy(u.y, c.h, d),
    m = vy(d),
    _ = by(u.x, c.w, m);
  return {
    visible: !0,
    x: u.x,
    y: p,
    textAlign: m,
    left: _,
    top: p,
    right: _ + c.w,
    bottom: p + c.h,
  };
}
function _y(i, t) {
  if (!t) return !0;
  const { left: e, top: n, right: o, bottom: a } = i;
  return !(
    be({ x: e, y: n }, t) ||
    be({ x: e, y: a }, t) ||
    be({ x: o, y: n }, t) ||
    be({ x: o, y: a }, t)
  );
}
function yy(i, t, e) {
  const n = [],
    o = i._pointLabels.length,
    a = i.options,
    { centerPointLabels: l, display: c } = a.pointLabels,
    u = { extra: To(a) / 2, additionalAngle: l ? lt / o : 0 };
  let d;
  for (let p = 0; p < o; p++) {
    ((u.padding = e[p]), (u.size = t[p]));
    const m = my(i, p, u);
    (n.push(m), c === "auto" && ((m.visible = _y(m, d)), m.visible && (d = m)));
  }
  return n;
}
function vy(i) {
  return i === 0 || i === 180 ? "center" : i < 180 ? "left" : "right";
}
function by(i, t, e) {
  return (e === "right" ? (i -= t) : e === "center" && (i -= t / 2), i);
}
function xy(i, t, e) {
  return (
    e === 90 || e === 270 ? (i -= t / 2) : (e > 270 || e < 90) && (i -= t),
    i
  );
}
function wy(i, t, e) {
  const { left: n, top: o, right: a, bottom: l } = e,
    { backdropColor: c } = t;
  if (!tt(c)) {
    const u = qe(t.borderRadius),
      d = Dt(t.backdropPadding);
    i.fillStyle = c;
    const p = n - d.left,
      m = o - d.top,
      _ = a - n + d.width,
      v = l - o + d.height;
    Object.values(u).some((x) => x !== 0)
      ? (i.beginPath(), Gi(i, { x: p, y: m, w: _, h: v, radius: u }), i.fill())
      : i.fillRect(p, m, _, v);
  }
}
function Py(i, t) {
  const {
    ctx: e,
    options: { pointLabels: n },
  } = i;
  for (let o = t - 1; o >= 0; o--) {
    const a = i._pointLabelItems[o];
    if (!a.visible) continue;
    const l = n.setContext(i.getPointLabelContext(o));
    wy(e, l, a);
    const c = Ct(l.font),
      { x: u, y: d, textAlign: p } = a;
    Xe(e, i._pointLabels[o], u, d + c.lineHeight / 2, c, {
      color: l.color,
      textAlign: p,
      textBaseline: "middle",
    });
  }
}
function uh(i, t, e, n) {
  const { ctx: o } = i;
  if (e) o.arc(i.xCenter, i.yCenter, t, 0, gt);
  else {
    let a = i.getPointPosition(0, t);
    o.moveTo(a.x, a.y);
    for (let l = 1; l < n; l++)
      ((a = i.getPointPosition(l, t)), o.lineTo(a.x, a.y));
  }
}
function ky(i, t, e, n, o) {
  const a = i.ctx,
    l = t.circular,
    { color: c, lineWidth: u } = t;
  (!l && !n) ||
    !c ||
    !u ||
    e < 0 ||
    (a.save(),
    (a.strokeStyle = c),
    (a.lineWidth = u),
    a.setLineDash(o.dash || []),
    (a.lineDashOffset = o.dashOffset),
    a.beginPath(),
    uh(i, e, l, n),
    a.closePath(),
    a.stroke(),
    a.restore());
}
function Sy(i, t, e) {
  return Be(i, { label: e, index: t, type: "pointLabel" });
}
class My extends Kn {
  static id = "radialLinear";
  static defaults = {
    display: !0,
    animate: !0,
    position: "chartArea",
    angleLines: {
      display: !0,
      lineWidth: 1,
      borderDash: [],
      borderDashOffset: 0,
    },
    grid: { circular: !1 },
    startAngle: 0,
    ticks: { showLabelBackdrop: !0, callback: rs.formatters.numeric },
    pointLabels: {
      backdropColor: void 0,
      backdropPadding: 2,
      display: !0,
      font: { size: 10 },
      callback(t) {
        return t;
      },
      padding: 5,
      centerPointLabels: !1,
    },
  };
  static defaultRoutes = {
    "angleLines.color": "borderColor",
    "pointLabels.color": "color",
    "ticks.color": "color",
  };
  static descriptors = { angleLines: { _fallback: "grid" } };
  constructor(t) {
    (super(t),
      (this.xCenter = void 0),
      (this.yCenter = void 0),
      (this.drawingArea = void 0),
      (this._pointLabels = []),
      (this._pointLabelItems = []));
  }
  setDimensions() {
    const t = (this._padding = Dt(To(this.options) / 2)),
      e = (this.width = this.maxWidth - t.width),
      n = (this.height = this.maxHeight - t.height);
    ((this.xCenter = Math.floor(this.left + e / 2 + t.left)),
      (this.yCenter = Math.floor(this.top + n / 2 + t.top)),
      (this.drawingArea = Math.floor(Math.min(e, n) / 2)));
  }
  determineDataLimits() {
    const { min: t, max: e } = this.getMinMax(!1);
    ((this.min = wt(t) && !isNaN(t) ? t : 0),
      (this.max = wt(e) && !isNaN(e) ? e : 0),
      this.handleTickRangeOptions());
  }
  computeTickLimit() {
    return Math.ceil(this.drawingArea / To(this.options));
  }
  generateTickLabels(t) {
    (Kn.prototype.generateTickLabels.call(this, t),
      (this._pointLabels = this.getLabels()
        .map((e, n) => {
          const o = ft(this.options.pointLabels.callback, [e, n], this);
          return o || o === 0 ? o : "";
        })
        .filter((e, n) => this.chart.getDataVisibility(n))));
  }
  fit() {
    const t = this.options;
    t.display && t.pointLabels.display
      ? py(this)
      : this.setCenterPoint(0, 0, 0, 0);
  }
  setCenterPoint(t, e, n, o) {
    ((this.xCenter += Math.floor((t - e) / 2)),
      (this.yCenter += Math.floor((n - o) / 2)),
      (this.drawingArea -= Math.min(
        this.drawingArea / 2,
        Math.max(t, e, n, o),
      )));
  }
  getIndexAngle(t) {
    const e = gt / (this._pointLabels.length || 1),
      n = this.options.startAngle || 0;
    return It(t * e + Jt(n));
  }
  getDistanceFromCenterForValue(t) {
    if (tt(t)) return NaN;
    const e = this.drawingArea / (this.max - this.min);
    return this.options.reverse ? (this.max - t) * e : (t - this.min) * e;
  }
  getValueForDistanceFromCenter(t) {
    if (tt(t)) return NaN;
    const e = t / (this.drawingArea / (this.max - this.min));
    return this.options.reverse ? this.max - e : this.min + e;
  }
  getPointLabelContext(t) {
    const e = this._pointLabels || [];
    if (t >= 0 && t < e.length) {
      const n = e[t];
      return Sy(this.getContext(), t, n);
    }
  }
  getPointPosition(t, e, n = 0) {
    const o = this.getIndexAngle(t) - kt + n;
    return {
      x: Math.cos(o) * e + this.xCenter,
      y: Math.sin(o) * e + this.yCenter,
      angle: o,
    };
  }
  getPointPositionForValue(t, e) {
    return this.getPointPosition(t, this.getDistanceFromCenterForValue(e));
  }
  getBasePosition(t) {
    return this.getPointPositionForValue(t || 0, this.getBaseValue());
  }
  getPointLabelPosition(t) {
    const { left: e, top: n, right: o, bottom: a } = this._pointLabelItems[t];
    return { left: e, top: n, right: o, bottom: a };
  }
  drawBackground() {
    const {
      backgroundColor: t,
      grid: { circular: e },
    } = this.options;
    if (t) {
      const n = this.ctx;
      (n.save(),
        n.beginPath(),
        uh(
          this,
          this.getDistanceFromCenterForValue(this._endValue),
          e,
          this._pointLabels.length,
        ),
        n.closePath(),
        (n.fillStyle = t),
        n.fill(),
        n.restore());
    }
  }
  drawGrid() {
    const t = this.ctx,
      e = this.options,
      { angleLines: n, grid: o, border: a } = e,
      l = this._pointLabels.length;
    let c, u, d;
    if (
      (e.pointLabels.display && Py(this, l),
      o.display &&
        this.ticks.forEach((p, m) => {
          if (m !== 0 || (m === 0 && this.min < 0)) {
            u = this.getDistanceFromCenterForValue(p.value);
            const _ = this.getContext(m),
              v = o.setContext(_),
              x = a.setContext(_);
            ky(this, v, u, l, x);
          }
        }),
      n.display)
    ) {
      for (t.save(), c = l - 1; c >= 0; c--) {
        const p = n.setContext(this.getPointLabelContext(c)),
          { color: m, lineWidth: _ } = p;
        !_ ||
          !m ||
          ((t.lineWidth = _),
          (t.strokeStyle = m),
          t.setLineDash(p.borderDash),
          (t.lineDashOffset = p.borderDashOffset),
          (u = this.getDistanceFromCenterForValue(
            e.reverse ? this.min : this.max,
          )),
          (d = this.getPointPosition(c, u)),
          t.beginPath(),
          t.moveTo(this.xCenter, this.yCenter),
          t.lineTo(d.x, d.y),
          t.stroke());
      }
      t.restore();
    }
  }
  drawBorder() {}
  drawLabels() {
    const t = this.ctx,
      e = this.options,
      n = e.ticks;
    if (!n.display) return;
    const o = this.getIndexAngle(0);
    let a, l;
    (t.save(),
      t.translate(this.xCenter, this.yCenter),
      t.rotate(o),
      (t.textAlign = "center"),
      (t.textBaseline = "middle"),
      this.ticks.forEach((c, u) => {
        if (u === 0 && this.min >= 0 && !e.reverse) return;
        const d = n.setContext(this.getContext(u)),
          p = Ct(d.font);
        if (
          ((a = this.getDistanceFromCenterForValue(this.ticks[u].value)),
          d.showLabelBackdrop)
        ) {
          ((t.font = p.string),
            (l = t.measureText(c.label).width),
            (t.fillStyle = d.backdropColor));
          const m = Dt(d.backdropPadding);
          t.fillRect(
            -l / 2 - m.left,
            -a - p.size / 2 - m.top,
            l + m.width,
            p.size + m.height,
          );
        }
        Xe(t, c.label, 0, -a, p, {
          color: d.color,
          strokeColor: d.textStrokeColor,
          strokeWidth: d.textStrokeWidth,
        });
      }),
      t.restore());
  }
  drawTitle() {}
}
const fs = {
    millisecond: { common: !0, size: 1, steps: 1e3 },
    second: { common: !0, size: 1e3, steps: 60 },
    minute: { common: !0, size: 6e4, steps: 60 },
    hour: { common: !0, size: 36e5, steps: 24 },
    day: { common: !0, size: 864e5, steps: 30 },
    week: { common: !1, size: 6048e5, steps: 4 },
    month: { common: !0, size: 2628e6, steps: 12 },
    quarter: { common: !1, size: 7884e6, steps: 4 },
    year: { common: !0, size: 3154e7 },
  },
  Ft = Object.keys(fs);
function Fl(i, t) {
  return i - t;
}
function Hl(i, t) {
  if (tt(t)) return null;
  const e = i._adapter,
    { parser: n, round: o, isoWeekday: a } = i._parseOpts;
  let l = t;
  return (
    typeof n == "function" && (l = n(l)),
    wt(l) || (l = typeof n == "string" ? e.parse(l, n) : e.parse(l)),
    l === null
      ? null
      : (o &&
          (l =
            o === "week" && (ui(a) || a === !0)
              ? e.startOf(l, "isoWeek", a)
              : e.startOf(l, o)),
        +l)
  );
}
function Wl(i, t, e, n) {
  const o = Ft.length;
  for (let a = Ft.indexOf(i); a < o - 1; ++a) {
    const l = fs[Ft[a]],
      c = l.steps ? l.steps : Number.MAX_SAFE_INTEGER;
    if (l.common && Math.ceil((e - t) / (c * l.size)) <= n) return Ft[a];
  }
  return Ft[o - 1];
}
function Ly(i, t, e, n, o) {
  for (let a = Ft.length - 1; a >= Ft.indexOf(e); a--) {
    const l = Ft[a];
    if (fs[l].common && i._adapter.diff(o, n, l) >= t - 1) return l;
  }
  return Ft[e ? Ft.indexOf(e) : 0];
}
function Cy(i) {
  for (let t = Ft.indexOf(i) + 1, e = Ft.length; t < e; ++t)
    if (fs[Ft[t]].common) return Ft[t];
}
function Vl(i, t, e) {
  if (!e) i[t] = !0;
  else if (e.length) {
    const { lo: n, hi: o } = jo(e, t),
      a = e[n] >= t ? e[n] : e[o];
    i[a] = !0;
  }
}
function Ty(i, t, e, n) {
  const o = i._adapter,
    a = +o.startOf(t[0].value, n),
    l = t[t.length - 1].value;
  let c, u;
  for (c = a; c <= l; c = +o.add(c, 1, n))
    ((u = e[c]), u >= 0 && (t[u].major = !0));
  return t;
}
function Zl(i, t, e) {
  const n = [],
    o = {},
    a = t.length;
  let l, c;
  for (l = 0; l < a; ++l)
    ((c = t[l]), (o[c] = l), n.push({ value: c, major: !1 }));
  return a === 0 || !e ? n : Ty(i, n, o, e);
}
class Eo extends Je {
  static id = "time";
  static defaults = {
    bounds: "data",
    adapters: {},
    time: {
      parser: !1,
      unit: !1,
      round: !1,
      isoWeekday: !1,
      minUnit: "millisecond",
      displayFormats: {},
    },
    ticks: { source: "auto", callback: !1, major: { enabled: !1 } },
  };
  constructor(t) {
    (super(t),
      (this._cache = { data: [], labels: [], all: [] }),
      (this._unit = "day"),
      (this._majorUnit = void 0),
      (this._offsets = {}),
      (this._normalized = !1),
      (this._parseOpts = void 0));
  }
  init(t, e = {}) {
    const n = t.time || (t.time = {}),
      o = (this._adapter = new Eg._date(t.adapters.date));
    (o.init(e),
      Wi(n.displayFormats, o.formats()),
      (this._parseOpts = {
        parser: n.parser,
        round: n.round,
        isoWeekday: n.isoWeekday,
      }),
      super.init(t),
      (this._normalized = e.normalized));
  }
  parse(t, e) {
    return t === void 0 ? null : Hl(this, t);
  }
  beforeLayout() {
    (super.beforeLayout(), (this._cache = { data: [], labels: [], all: [] }));
  }
  determineDataLimits() {
    const t = this.options,
      e = this._adapter,
      n = t.time.unit || "day";
    let { min: o, max: a, minDefined: l, maxDefined: c } = this.getUserBounds();
    function u(d) {
      (!l && !isNaN(d.min) && (o = Math.min(o, d.min)),
        !c && !isNaN(d.max) && (a = Math.max(a, d.max)));
    }
    ((!l || !c) &&
      (u(this._getLabelBounds()),
      (t.bounds !== "ticks" || t.ticks.source !== "labels") &&
        u(this.getMinMax(!1))),
      (o = wt(o) && !isNaN(o) ? o : +e.startOf(Date.now(), n)),
      (a = wt(a) && !isNaN(a) ? a : +e.endOf(Date.now(), n) + 1),
      (this.min = Math.min(o, a - 1)),
      (this.max = Math.max(o + 1, a)));
  }
  _getLabelBounds() {
    const t = this.getLabelTimestamps();
    let e = Number.POSITIVE_INFINITY,
      n = Number.NEGATIVE_INFINITY;
    return (
      t.length && ((e = t[0]), (n = t[t.length - 1])),
      { min: e, max: n }
    );
  }
  buildTicks() {
    const t = this.options,
      e = t.time,
      n = t.ticks,
      o = n.source === "labels" ? this.getLabelTimestamps() : this._generate();
    t.bounds === "ticks" &&
      o.length &&
      ((this.min = this._userMin || o[0]),
      (this.max = this._userMax || o[o.length - 1]));
    const a = this.min,
      l = this.max,
      c = Yf(o, a, l);
    return (
      (this._unit =
        e.unit ||
        (n.autoSkip
          ? Wl(e.minUnit, this.min, this.max, this._getLabelCapacity(a))
          : Ly(this, c.length, e.minUnit, this.min, this.max))),
      (this._majorUnit =
        !n.major.enabled || this._unit === "year" ? void 0 : Cy(this._unit)),
      this.initOffsets(o),
      t.reverse && c.reverse(),
      Zl(this, c, this._majorUnit)
    );
  }
  afterAutoSkip() {
    this.options.offsetAfterAutoskip &&
      this.initOffsets(this.ticks.map((t) => +t.value));
  }
  initOffsets(t = []) {
    let e = 0,
      n = 0,
      o,
      a;
    this.options.offset &&
      t.length &&
      ((o = this.getDecimalForValue(t[0])),
      t.length === 1
        ? (e = 1 - o)
        : (e = (this.getDecimalForValue(t[1]) - o) / 2),
      (a = this.getDecimalForValue(t[t.length - 1])),
      t.length === 1
        ? (n = a)
        : (n = (a - this.getDecimalForValue(t[t.length - 2])) / 2));
    const l = t.length < 3 ? 0.5 : 0.25;
    ((e = Et(e, 0, l)),
      (n = Et(n, 0, l)),
      (this._offsets = { start: e, end: n, factor: 1 / (e + 1 + n) }));
  }
  _generate() {
    const t = this._adapter,
      e = this.min,
      n = this.max,
      o = this.options,
      a = o.time,
      l = a.unit || Wl(a.minUnit, e, n, this._getLabelCapacity(e)),
      c = q(o.ticks.stepSize, 1),
      u = l === "week" ? a.isoWeekday : !1,
      d = ui(u) || u === !0,
      p = {};
    let m = e,
      _,
      v;
    if (
      (d && (m = +t.startOf(m, "isoWeek", u)),
      (m = +t.startOf(m, d ? "day" : l)),
      t.diff(n, e, l) > 1e5 * c)
    )
      throw new Error(
        e + " and " + n + " are too far apart with stepSize of " + c + " " + l,
      );
    const x = o.ticks.source === "data" && this.getDataTimestamps();
    for (_ = m, v = 0; _ < n; _ = +t.add(_, c, l), v++) Vl(p, _, x);
    return (
      (_ === n || o.bounds === "ticks" || v === 1) && Vl(p, _, x),
      Object.keys(p)
        .sort(Fl)
        .map((b) => +b)
    );
  }
  getLabelForValue(t) {
    const e = this._adapter,
      n = this.options.time;
    return n.tooltipFormat
      ? e.format(t, n.tooltipFormat)
      : e.format(t, n.displayFormats.datetime);
  }
  format(t, e) {
    const o = this.options.time.displayFormats,
      a = this._unit,
      l = e || o[a];
    return this._adapter.format(t, l);
  }
  _tickFormatFunction(t, e, n, o) {
    const a = this.options,
      l = a.ticks.callback;
    if (l) return ft(l, [t, e, n], this);
    const c = a.time.displayFormats,
      u = this._unit,
      d = this._majorUnit,
      p = u && c[u],
      m = d && c[d],
      _ = n[e],
      v = d && m && _ && _.major;
    return this._adapter.format(t, o || (v ? m : p));
  }
  generateTickLabels(t) {
    let e, n, o;
    for (e = 0, n = t.length; e < n; ++e)
      ((o = t[e]), (o.label = this._tickFormatFunction(o.value, e, t)));
  }
  getDecimalForValue(t) {
    return t === null ? NaN : (t - this.min) / (this.max - this.min);
  }
  getPixelForValue(t) {
    const e = this._offsets,
      n = this.getDecimalForValue(t);
    return this.getPixelForDecimal((e.start + n) * e.factor);
  }
  getValueForPixel(t) {
    const e = this._offsets,
      n = this.getDecimalForPixel(t) / e.factor - e.end;
    return this.min + n * (this.max - this.min);
  }
  _getLabelSize(t) {
    const e = this.options.ticks,
      n = this.ctx.measureText(t).width,
      o = Jt(this.isHorizontal() ? e.maxRotation : e.minRotation),
      a = Math.cos(o),
      l = Math.sin(o),
      c = this._resolveTickFontOptions(0).size;
    return { w: n * a + c * l, h: n * l + c * a };
  }
  _getLabelCapacity(t) {
    const e = this.options.time,
      n = e.displayFormats,
      o = n[e.unit] || n.millisecond,
      a = this._tickFormatFunction(t, 0, Zl(this, [t], this._majorUnit), o),
      l = this._getLabelSize(a),
      c =
        Math.floor(this.isHorizontal() ? this.width / l.w : this.height / l.h) -
        1;
    return c > 0 ? c : 1;
  }
  getDataTimestamps() {
    let t = this._cache.data || [],
      e,
      n;
    if (t.length) return t;
    const o = this.getMatchingVisibleMetas();
    if (this._normalized && o.length)
      return (this._cache.data = o[0].controller.getAllParsedValues(this));
    for (e = 0, n = o.length; e < n; ++e)
      t = t.concat(o[e].controller.getAllParsedValues(this));
    return (this._cache.data = this.normalize(t));
  }
  getLabelTimestamps() {
    const t = this._cache.labels || [];
    let e, n;
    if (t.length) return t;
    const o = this.getLabels();
    for (e = 0, n = o.length; e < n; ++e) t.push(Hl(this, o[e]));
    return (this._cache.labels = this._normalized ? t : this.normalize(t));
  }
  normalize(t) {
    return wc(t.sort(Fl));
  }
}
function Rn(i, t, e) {
  let n = 0,
    o = i.length - 1,
    a,
    l,
    c,
    u;
  e
    ? (t >= i[n].pos && t <= i[o].pos && ({ lo: n, hi: o } = ve(i, "pos", t)),
      ({ pos: a, time: c } = i[n]),
      ({ pos: l, time: u } = i[o]))
    : (t >= i[n].time &&
        t <= i[o].time &&
        ({ lo: n, hi: o } = ve(i, "time", t)),
      ({ time: a, pos: c } = i[n]),
      ({ time: l, pos: u } = i[o]));
  const d = l - a;
  return d ? c + ((u - c) * (t - a)) / d : c;
}
class Ey extends Eo {
  static id = "timeseries";
  static defaults = Eo.defaults;
  constructor(t) {
    (super(t),
      (this._table = []),
      (this._minPos = void 0),
      (this._tableRange = void 0));
  }
  initOffsets() {
    const t = this._getTimestampsForTable(),
      e = (this._table = this.buildLookupTable(t));
    ((this._minPos = Rn(e, this.min)),
      (this._tableRange = Rn(e, this.max) - this._minPos),
      super.initOffsets(t));
  }
  buildLookupTable(t) {
    const { min: e, max: n } = this,
      o = [],
      a = [];
    let l, c, u, d, p;
    for (l = 0, c = t.length; l < c; ++l)
      ((d = t[l]), d >= e && d <= n && o.push(d));
    if (o.length < 2)
      return [
        { time: e, pos: 0 },
        { time: n, pos: 1 },
      ];
    for (l = 0, c = o.length; l < c; ++l)
      ((p = o[l + 1]),
        (u = o[l - 1]),
        (d = o[l]),
        Math.round((p + u) / 2) !== d && a.push({ time: d, pos: l / (c - 1) }));
    return a;
  }
  _generate() {
    const t = this.min,
      e = this.max;
    let n = super.getDataTimestamps();
    return (
      (!n.includes(t) || !n.length) && n.splice(0, 0, t),
      (!n.includes(e) || n.length === 1) && n.push(e),
      n.sort((o, a) => o - a)
    );
  }
  _getTimestampsForTable() {
    let t = this._cache.all || [];
    if (t.length) return t;
    const e = this.getDataTimestamps(),
      n = this.getLabelTimestamps();
    return (
      e.length && n.length
        ? (t = this.normalize(e.concat(n)))
        : (t = e.length ? e : n),
      (t = this._cache.all = t),
      t
    );
  }
  getDecimalForValue(t) {
    return (Rn(this._table, t) - this._minPos) / this._tableRange;
  }
  getValueForPixel(t) {
    const e = this._offsets,
      n = this.getDecimalForPixel(t) / e.factor - e.end;
    return Rn(this._table, n * this._tableRange + this._minPos, !0);
  }
}
var Ay = Object.freeze({
  __proto__: null,
  CategoryScale: ay,
  LinearScale: cy,
  LogarithmicScale: dy,
  RadialLinearScale: My,
  TimeScale: Eo,
  TimeSeriesScale: Ey,
});
const Oy = [Tg, l_, ny, Ay];
er.register(...Oy);
let uo = null;
function Xn(i, t, e = []) {
  const n = document.getElementById(i);
  if (!n) return;
  uo && uo.destroy();
  const o = n.parentElement;
  if (o) {
    const d = o.querySelector(".chart-label"),
      p = d ? d.offsetHeight + 6 : 24;
    n.style.height = `${o.clientHeight - p - 28}px`;
  }
  let a, l;
  if (e.length >= 2)
    ((a = e.map((d) => +(d.p * 100).toFixed(2))),
      (l = e.map((d) => {
        const p = new Date(d.t * 1e3);
        return `${p.getMonth() + 1}/${p.getDate()} ${p.getHours()}h`;
      })));
  else {
    const d = t * 100;
    ((a = Array.from({ length: 8 }, (p, m) => {
      const _ = (Math.random() - 0.5) * 8;
      return Math.max(5, Math.min(95, d - 12 + (m / 7) * 12 + _));
    })),
      (a[a.length - 1] = d),
      (l = ["7d", "6d", "5d", "4d", "3d", "2d", "1d", "ahora"]));
  }
  const c = a[a.length - 1],
    u = c > 50 ? "#22d37a" : c < 40 ? "#f04040" : "#f0a020";
  uo = new er(n, {
    type: "line",
    data: {
      labels: l,
      datasets: [
        {
          data: a,
          borderColor: u,
          borderWidth: 1.5,
          pointRadius: 0,
          fill: !1,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: !0,
      maintainAspectRatio: !1,
      plugins: { legend: { display: !1 }, tooltip: { enabled: !1 } },
      scales: { x: { display: !1 }, y: { display: !1 } },
      animation: { duration: 600 },
    },
  });
}
function Jn(i, t, e) {
  const n = document.getElementById(i);
  if (!n) return;
  ((n.innerHTML = ""), (n.className = "sparkline"));
  const o = t * 100;
  for (let l = 0; l < 12; l++) {
    const c = Math.max(4, Math.min(24, o / 4 + (Math.random() - 0.5) * 8)),
      u = document.createElement("div");
    ((u.className = "spark-bar"),
      (u.style.height = c + "px"),
      (u.style.background = e === "yes" ? "#0d6e3a" : "#7a1a1a"),
      n.appendChild(u));
  }
  const a = document.createElement("div");
  ((a.className = "spark-bar"),
    (a.style.height = Math.min(28, o / 3.5) + "px"),
    (a.style.background = e === "yes" ? "#22d37a" : "#f04040"),
    n.appendChild(a));
}
function Iy(i) {
  return i && i.__esModule && Object.prototype.hasOwnProperty.call(i, "default")
    ? i.default
    : i;
}
var Hi = { exports: {} };
var By = Hi.exports,
  jl;
function Dy() {
  return (
    jl ||
      ((jl = 1),
      (function (i, t) {
        (function (e, n) {
          n(t);
        })(By, function (e) {
          var n = "1.9.4";
          function o(s) {
            var r, h, f, g;
            for (h = 1, f = arguments.length; h < f; h++) {
              g = arguments[h];
              for (r in g) s[r] = g[r];
            }
            return s;
          }
          var a =
            Object.create ||
            (function () {
              function s() {}
              return function (r) {
                return ((s.prototype = r), new s());
              };
            })();
          function l(s, r) {
            var h = Array.prototype.slice;
            if (s.bind) return s.bind.apply(s, h.call(arguments, 1));
            var f = h.call(arguments, 2);
            return function () {
              return s.apply(
                r,
                f.length ? f.concat(h.call(arguments)) : arguments,
              );
            };
          }
          var c = 0;
          function u(s) {
            return ("_leaflet_id" in s || (s._leaflet_id = ++c), s._leaflet_id);
          }
          function d(s, r, h) {
            var f, g, y, P;
            return (
              (P = function () {
                ((f = !1), g && (y.apply(h, g), (g = !1)));
              }),
              (y = function () {
                f
                  ? (g = arguments)
                  : (s.apply(h, arguments), setTimeout(P, r), (f = !0));
              }),
              y
            );
          }
          function p(s, r, h) {
            var f = r[1],
              g = r[0],
              y = f - g;
            return s === f && h ? s : ((((s - g) % y) + y) % y) + g;
          }
          function m() {
            return !1;
          }
          function _(s, r) {
            if (r === !1) return s;
            var h = Math.pow(10, r === void 0 ? 6 : r);
            return Math.round(s * h) / h;
          }
          function v(s) {
            return s.trim ? s.trim() : s.replace(/^\s+|\s+$/g, "");
          }
          function x(s) {
            return v(s).split(/\s+/);
          }
          function b(s, r) {
            Object.prototype.hasOwnProperty.call(s, "options") ||
              (s.options = s.options ? a(s.options) : {});
            for (var h in r) s.options[h] = r[h];
            return s.options;
          }
          function w(s, r, h) {
            var f = [];
            for (var g in s)
              f.push(
                encodeURIComponent(h ? g.toUpperCase() : g) +
                  "=" +
                  encodeURIComponent(s[g]),
              );
            return (!r || r.indexOf("?") === -1 ? "?" : "&") + f.join("&");
          }
          var k = /\{ *([\w_ -]+) *\}/g;
          function C(s, r) {
            return s.replace(k, function (h, f) {
              var g = r[f];
              if (g === void 0)
                throw new Error("No value provided for variable " + h);
              return (typeof g == "function" && (g = g(r)), g);
            });
          }
          var E =
            Array.isArray ||
            function (s) {
              return Object.prototype.toString.call(s) === "[object Array]";
            };
          function A(s, r) {
            for (var h = 0; h < s.length; h++) if (s[h] === r) return h;
            return -1;
          }
          var T = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
          function B(s) {
            return (
              window["webkit" + s] || window["moz" + s] || window["ms" + s]
            );
          }
          var D = 0;
          function R(s) {
            var r = +new Date(),
              h = Math.max(0, 16 - (r - D));
            return ((D = r + h), window.setTimeout(s, h));
          }
          var H =
              window.requestAnimationFrame || B("RequestAnimationFrame") || R,
            U =
              window.cancelAnimationFrame ||
              B("CancelAnimationFrame") ||
              B("CancelRequestAnimationFrame") ||
              function (s) {
                window.clearTimeout(s);
              };
          function W(s, r, h) {
            if (h && H === R) s.call(r);
            else return H.call(window, l(s, r));
          }
          function j(s) {
            s && U.call(window, s);
          }
          var xt = {
            __proto__: null,
            extend: o,
            create: a,
            bind: l,
            get lastId() {
              return c;
            },
            stamp: u,
            throttle: d,
            wrapNum: p,
            falseFn: m,
            formatNum: _,
            trim: v,
            splitWords: x,
            setOptions: b,
            getParamString: w,
            template: C,
            isArray: E,
            indexOf: A,
            emptyImageUrl: T,
            requestFn: H,
            cancelFn: U,
            requestAnimFrame: W,
            cancelAnimFrame: j,
          };
          function ut() {}
          ((ut.extend = function (s) {
            var r = function () {
                (b(this),
                  this.initialize && this.initialize.apply(this, arguments),
                  this.callInitHooks());
              },
              h = (r.__super__ = this.prototype),
              f = a(h);
            ((f.constructor = r), (r.prototype = f));
            for (var g in this)
              Object.prototype.hasOwnProperty.call(this, g) &&
                g !== "prototype" &&
                g !== "__super__" &&
                (r[g] = this[g]);
            return (
              s.statics && o(r, s.statics),
              s.includes &&
                (rt(s.includes), o.apply(null, [f].concat(s.includes))),
              o(f, s),
              delete f.statics,
              delete f.includes,
              f.options &&
                ((f.options = h.options ? a(h.options) : {}),
                o(f.options, s.options)),
              (f._initHooks = []),
              (f.callInitHooks = function () {
                if (!this._initHooksCalled) {
                  (h.callInitHooks && h.callInitHooks.call(this),
                    (this._initHooksCalled = !0));
                  for (var y = 0, P = f._initHooks.length; y < P; y++)
                    f._initHooks[y].call(this);
                }
              }),
              r
            );
          }),
            (ut.include = function (s) {
              var r = this.prototype.options;
              return (
                o(this.prototype, s),
                s.options &&
                  ((this.prototype.options = r), this.mergeOptions(s.options)),
                this
              );
            }),
            (ut.mergeOptions = function (s) {
              return (o(this.prototype.options, s), this);
            }),
            (ut.addInitHook = function (s) {
              var r = Array.prototype.slice.call(arguments, 1),
                h =
                  typeof s == "function"
                    ? s
                    : function () {
                        this[s].apply(this, r);
                      };
              return (
                (this.prototype._initHooks = this.prototype._initHooks || []),
                this.prototype._initHooks.push(h),
                this
              );
            }));
          function rt(s) {
            if (!(typeof L > "u" || !L || !L.Mixin)) {
              s = E(s) ? s : [s];
              for (var r = 0; r < s.length; r++)
                s[r] === L.Mixin.Events &&
                  console.warn(
                    "Deprecated include of L.Mixin.Events: this property will be removed in future releases, please inherit from L.Evented instead.",
                    new Error().stack,
                  );
            }
          }
          var Y = {
            on: function (s, r, h) {
              if (typeof s == "object") for (var f in s) this._on(f, s[f], r);
              else {
                s = x(s);
                for (var g = 0, y = s.length; g < y; g++) this._on(s[g], r, h);
              }
              return this;
            },
            off: function (s, r, h) {
              if (!arguments.length) delete this._events;
              else if (typeof s == "object")
                for (var f in s) this._off(f, s[f], r);
              else {
                s = x(s);
                for (
                  var g = arguments.length === 1, y = 0, P = s.length;
                  y < P;
                  y++
                )
                  g ? this._off(s[y]) : this._off(s[y], r, h);
              }
              return this;
            },
            _on: function (s, r, h, f) {
              if (typeof r != "function") {
                console.warn("wrong listener type: " + typeof r);
                return;
              }
              if (this._listens(s, r, h) === !1) {
                h === this && (h = void 0);
                var g = { fn: r, ctx: h };
                (f && (g.once = !0),
                  (this._events = this._events || {}),
                  (this._events[s] = this._events[s] || []),
                  this._events[s].push(g));
              }
            },
            _off: function (s, r, h) {
              var f, g, y;
              if (this._events && ((f = this._events[s]), !!f)) {
                if (arguments.length === 1) {
                  if (this._firingCount)
                    for (g = 0, y = f.length; g < y; g++) f[g].fn = m;
                  delete this._events[s];
                  return;
                }
                if (typeof r != "function") {
                  console.warn("wrong listener type: " + typeof r);
                  return;
                }
                var P = this._listens(s, r, h);
                if (P !== !1) {
                  var S = f[P];
                  (this._firingCount &&
                    ((S.fn = m), (this._events[s] = f = f.slice())),
                    f.splice(P, 1));
                }
              }
            },
            fire: function (s, r, h) {
              if (!this.listens(s, h)) return this;
              var f = o({}, r, {
                type: s,
                target: this,
                sourceTarget: (r && r.sourceTarget) || this,
              });
              if (this._events) {
                var g = this._events[s];
                if (g) {
                  this._firingCount = this._firingCount + 1 || 1;
                  for (var y = 0, P = g.length; y < P; y++) {
                    var S = g[y],
                      M = S.fn;
                    (S.once && this.off(s, M, S.ctx), M.call(S.ctx || this, f));
                  }
                  this._firingCount--;
                }
              }
              return (h && this._propagateEvent(f), this);
            },
            listens: function (s, r, h, f) {
              typeof s != "string" &&
                console.warn('"string" type argument expected');
              var g = r;
              typeof r != "function" && ((f = !!r), (g = void 0), (h = void 0));
              var y = this._events && this._events[s];
              if (y && y.length && this._listens(s, g, h) !== !1) return !0;
              if (f) {
                for (var P in this._eventParents)
                  if (this._eventParents[P].listens(s, r, h, f)) return !0;
              }
              return !1;
            },
            _listens: function (s, r, h) {
              if (!this._events) return !1;
              var f = this._events[s] || [];
              if (!r) return !!f.length;
              h === this && (h = void 0);
              for (var g = 0, y = f.length; g < y; g++)
                if (f[g].fn === r && f[g].ctx === h) return g;
              return !1;
            },
            once: function (s, r, h) {
              if (typeof s == "object")
                for (var f in s) this._on(f, s[f], r, !0);
              else {
                s = x(s);
                for (var g = 0, y = s.length; g < y; g++)
                  this._on(s[g], r, h, !0);
              }
              return this;
            },
            addEventParent: function (s) {
              return (
                (this._eventParents = this._eventParents || {}),
                (this._eventParents[u(s)] = s),
                this
              );
            },
            removeEventParent: function (s) {
              return (
                this._eventParents && delete this._eventParents[u(s)],
                this
              );
            },
            _propagateEvent: function (s) {
              for (var r in this._eventParents)
                this._eventParents[r].fire(
                  s.type,
                  o({ layer: s.target, propagatedFrom: s.target }, s),
                  !0,
                );
            },
          };
          ((Y.addEventListener = Y.on),
            (Y.removeEventListener = Y.clearAllEventListeners = Y.off),
            (Y.addOneTimeEventListener = Y.once),
            (Y.fireEvent = Y.fire),
            (Y.hasEventListeners = Y.listens));
          var ct = ut.extend(Y);
          function F(s, r, h) {
            ((this.x = h ? Math.round(s) : s),
              (this.y = h ? Math.round(r) : r));
          }
          var pt =
            Math.trunc ||
            function (s) {
              return s > 0 ? Math.floor(s) : Math.ceil(s);
            };
          F.prototype = {
            clone: function () {
              return new F(this.x, this.y);
            },
            add: function (s) {
              return this.clone()._add(V(s));
            },
            _add: function (s) {
              return ((this.x += s.x), (this.y += s.y), this);
            },
            subtract: function (s) {
              return this.clone()._subtract(V(s));
            },
            _subtract: function (s) {
              return ((this.x -= s.x), (this.y -= s.y), this);
            },
            divideBy: function (s) {
              return this.clone()._divideBy(s);
            },
            _divideBy: function (s) {
              return ((this.x /= s), (this.y /= s), this);
            },
            multiplyBy: function (s) {
              return this.clone()._multiplyBy(s);
            },
            _multiplyBy: function (s) {
              return ((this.x *= s), (this.y *= s), this);
            },
            scaleBy: function (s) {
              return new F(this.x * s.x, this.y * s.y);
            },
            unscaleBy: function (s) {
              return new F(this.x / s.x, this.y / s.y);
            },
            round: function () {
              return this.clone()._round();
            },
            _round: function () {
              return (
                (this.x = Math.round(this.x)),
                (this.y = Math.round(this.y)),
                this
              );
            },
            floor: function () {
              return this.clone()._floor();
            },
            _floor: function () {
              return (
                (this.x = Math.floor(this.x)),
                (this.y = Math.floor(this.y)),
                this
              );
            },
            ceil: function () {
              return this.clone()._ceil();
            },
            _ceil: function () {
              return (
                (this.x = Math.ceil(this.x)),
                (this.y = Math.ceil(this.y)),
                this
              );
            },
            trunc: function () {
              return this.clone()._trunc();
            },
            _trunc: function () {
              return ((this.x = pt(this.x)), (this.y = pt(this.y)), this);
            },
            distanceTo: function (s) {
              s = V(s);
              var r = s.x - this.x,
                h = s.y - this.y;
              return Math.sqrt(r * r + h * h);
            },
            equals: function (s) {
              return ((s = V(s)), s.x === this.x && s.y === this.y);
            },
            contains: function (s) {
              return (
                (s = V(s)),
                Math.abs(s.x) <= Math.abs(this.x) &&
                  Math.abs(s.y) <= Math.abs(this.y)
              );
            },
            toString: function () {
              return "Point(" + _(this.x) + ", " + _(this.y) + ")";
            },
          };
          function V(s, r, h) {
            return s instanceof F
              ? s
              : E(s)
                ? new F(s[0], s[1])
                : s == null
                  ? s
                  : typeof s == "object" && "x" in s && "y" in s
                    ? new F(s.x, s.y)
                    : new F(s, r, h);
          }
          function nt(s, r) {
            if (s)
              for (var h = r ? [s, r] : s, f = 0, g = h.length; f < g; f++)
                this.extend(h[f]);
          }
          nt.prototype = {
            extend: function (s) {
              var r, h;
              if (!s) return this;
              if (s instanceof F || typeof s[0] == "number" || "x" in s)
                r = h = V(s);
              else if (((s = mt(s)), (r = s.min), (h = s.max), !r || !h))
                return this;
              return (
                !this.min && !this.max
                  ? ((this.min = r.clone()), (this.max = h.clone()))
                  : ((this.min.x = Math.min(r.x, this.min.x)),
                    (this.max.x = Math.max(h.x, this.max.x)),
                    (this.min.y = Math.min(r.y, this.min.y)),
                    (this.max.y = Math.max(h.y, this.max.y))),
                this
              );
            },
            getCenter: function (s) {
              return V(
                (this.min.x + this.max.x) / 2,
                (this.min.y + this.max.y) / 2,
                s,
              );
            },
            getBottomLeft: function () {
              return V(this.min.x, this.max.y);
            },
            getTopRight: function () {
              return V(this.max.x, this.min.y);
            },
            getTopLeft: function () {
              return this.min;
            },
            getBottomRight: function () {
              return this.max;
            },
            getSize: function () {
              return this.max.subtract(this.min);
            },
            contains: function (s) {
              var r, h;
              return (
                typeof s[0] == "number" || s instanceof F
                  ? (s = V(s))
                  : (s = mt(s)),
                s instanceof nt ? ((r = s.min), (h = s.max)) : (r = h = s),
                r.x >= this.min.x &&
                  h.x <= this.max.x &&
                  r.y >= this.min.y &&
                  h.y <= this.max.y
              );
            },
            intersects: function (s) {
              s = mt(s);
              var r = this.min,
                h = this.max,
                f = s.min,
                g = s.max,
                y = g.x >= r.x && f.x <= h.x,
                P = g.y >= r.y && f.y <= h.y;
              return y && P;
            },
            overlaps: function (s) {
              s = mt(s);
              var r = this.min,
                h = this.max,
                f = s.min,
                g = s.max,
                y = g.x > r.x && f.x < h.x,
                P = g.y > r.y && f.y < h.y;
              return y && P;
            },
            isValid: function () {
              return !!(this.min && this.max);
            },
            pad: function (s) {
              var r = this.min,
                h = this.max,
                f = Math.abs(r.x - h.x) * s,
                g = Math.abs(r.y - h.y) * s;
              return mt(V(r.x - f, r.y - g), V(h.x + f, h.y + g));
            },
            equals: function (s) {
              return s
                ? ((s = mt(s)),
                  this.min.equals(s.getTopLeft()) &&
                    this.max.equals(s.getBottomRight()))
                : !1;
            },
          };
          function mt(s, r) {
            return !s || s instanceof nt ? s : new nt(s, r);
          }
          function vt(s, r) {
            if (s)
              for (var h = r ? [s, r] : s, f = 0, g = h.length; f < g; f++)
                this.extend(h[f]);
          }
          vt.prototype = {
            extend: function (s) {
              var r = this._southWest,
                h = this._northEast,
                f,
                g;
              if (s instanceof st) ((f = s), (g = s));
              else if (s instanceof vt) {
                if (((f = s._southWest), (g = s._northEast), !f || !g))
                  return this;
              } else return s ? this.extend(G(s) || Q(s)) : this;
              return (
                !r && !h
                  ? ((this._southWest = new st(f.lat, f.lng)),
                    (this._northEast = new st(g.lat, g.lng)))
                  : ((r.lat = Math.min(f.lat, r.lat)),
                    (r.lng = Math.min(f.lng, r.lng)),
                    (h.lat = Math.max(g.lat, h.lat)),
                    (h.lng = Math.max(g.lng, h.lng))),
                this
              );
            },
            pad: function (s) {
              var r = this._southWest,
                h = this._northEast,
                f = Math.abs(r.lat - h.lat) * s,
                g = Math.abs(r.lng - h.lng) * s;
              return new vt(
                new st(r.lat - f, r.lng - g),
                new st(h.lat + f, h.lng + g),
              );
            },
            getCenter: function () {
              return new st(
                (this._southWest.lat + this._northEast.lat) / 2,
                (this._southWest.lng + this._northEast.lng) / 2,
              );
            },
            getSouthWest: function () {
              return this._southWest;
            },
            getNorthEast: function () {
              return this._northEast;
            },
            getNorthWest: function () {
              return new st(this.getNorth(), this.getWest());
            },
            getSouthEast: function () {
              return new st(this.getSouth(), this.getEast());
            },
            getWest: function () {
              return this._southWest.lng;
            },
            getSouth: function () {
              return this._southWest.lat;
            },
            getEast: function () {
              return this._northEast.lng;
            },
            getNorth: function () {
              return this._northEast.lat;
            },
            contains: function (s) {
              typeof s[0] == "number" || s instanceof st || "lat" in s
                ? (s = G(s))
                : (s = Q(s));
              var r = this._southWest,
                h = this._northEast,
                f,
                g;
              return (
                s instanceof vt
                  ? ((f = s.getSouthWest()), (g = s.getNorthEast()))
                  : (f = g = s),
                f.lat >= r.lat &&
                  g.lat <= h.lat &&
                  f.lng >= r.lng &&
                  g.lng <= h.lng
              );
            },
            intersects: function (s) {
              s = Q(s);
              var r = this._southWest,
                h = this._northEast,
                f = s.getSouthWest(),
                g = s.getNorthEast(),
                y = g.lat >= r.lat && f.lat <= h.lat,
                P = g.lng >= r.lng && f.lng <= h.lng;
              return y && P;
            },
            overlaps: function (s) {
              s = Q(s);
              var r = this._southWest,
                h = this._northEast,
                f = s.getSouthWest(),
                g = s.getNorthEast(),
                y = g.lat > r.lat && f.lat < h.lat,
                P = g.lng > r.lng && f.lng < h.lng;
              return y && P;
            },
            toBBoxString: function () {
              return [
                this.getWest(),
                this.getSouth(),
                this.getEast(),
                this.getNorth(),
              ].join(",");
            },
            equals: function (s, r) {
              return s
                ? ((s = Q(s)),
                  this._southWest.equals(s.getSouthWest(), r) &&
                    this._northEast.equals(s.getNorthEast(), r))
                : !1;
            },
            isValid: function () {
              return !!(this._southWest && this._northEast);
            },
          };
          function Q(s, r) {
            return s instanceof vt ? s : new vt(s, r);
          }
          function st(s, r, h) {
            if (isNaN(s) || isNaN(r))
              throw new Error("Invalid LatLng object: (" + s + ", " + r + ")");
            ((this.lat = +s), (this.lng = +r), h !== void 0 && (this.alt = +h));
          }
          st.prototype = {
            equals: function (s, r) {
              if (!s) return !1;
              s = G(s);
              var h = Math.max(
                Math.abs(this.lat - s.lat),
                Math.abs(this.lng - s.lng),
              );
              return h <= (r === void 0 ? 1e-9 : r);
            },
            toString: function (s) {
              return "LatLng(" + _(this.lat, s) + ", " + _(this.lng, s) + ")";
            },
            distanceTo: function (s) {
              return we.distance(this, G(s));
            },
            wrap: function () {
              return we.wrapLatLng(this);
            },
            toBounds: function (s) {
              var r = (180 * s) / 40075017,
                h = r / Math.cos((Math.PI / 180) * this.lat);
              return Q(
                [this.lat - r, this.lng - h],
                [this.lat + r, this.lng + h],
              );
            },
            clone: function () {
              return new st(this.lat, this.lng, this.alt);
            },
          };
          function G(s, r, h) {
            return s instanceof st
              ? s
              : E(s) && typeof s[0] != "object"
                ? s.length === 3
                  ? new st(s[0], s[1], s[2])
                  : s.length === 2
                    ? new st(s[0], s[1])
                    : null
                : s == null
                  ? s
                  : typeof s == "object" && "lat" in s
                    ? new st(s.lat, "lng" in s ? s.lng : s.lon, s.alt)
                    : r === void 0
                      ? null
                      : new st(s, r, h);
          }
          var ce = {
              latLngToPoint: function (s, r) {
                var h = this.projection.project(s),
                  f = this.scale(r);
                return this.transformation._transform(h, f);
              },
              pointToLatLng: function (s, r) {
                var h = this.scale(r),
                  f = this.transformation.untransform(s, h);
                return this.projection.unproject(f);
              },
              project: function (s) {
                return this.projection.project(s);
              },
              unproject: function (s) {
                return this.projection.unproject(s);
              },
              scale: function (s) {
                return 256 * Math.pow(2, s);
              },
              zoom: function (s) {
                return Math.log(s / 256) / Math.LN2;
              },
              getProjectedBounds: function (s) {
                if (this.infinite) return null;
                var r = this.projection.bounds,
                  h = this.scale(s),
                  f = this.transformation.transform(r.min, h),
                  g = this.transformation.transform(r.max, h);
                return new nt(f, g);
              },
              infinite: !1,
              wrapLatLng: function (s) {
                var r = this.wrapLng ? p(s.lng, this.wrapLng, !0) : s.lng,
                  h = this.wrapLat ? p(s.lat, this.wrapLat, !0) : s.lat,
                  f = s.alt;
                return new st(h, r, f);
              },
              wrapLatLngBounds: function (s) {
                var r = s.getCenter(),
                  h = this.wrapLatLng(r),
                  f = r.lat - h.lat,
                  g = r.lng - h.lng;
                if (f === 0 && g === 0) return s;
                var y = s.getSouthWest(),
                  P = s.getNorthEast(),
                  S = new st(y.lat - f, y.lng - g),
                  M = new st(P.lat - f, P.lng - g);
                return new vt(S, M);
              },
            },
            we = o({}, ce, {
              wrapLng: [-180, 180],
              R: 6371e3,
              distance: function (s, r) {
                var h = Math.PI / 180,
                  f = s.lat * h,
                  g = r.lat * h,
                  y = Math.sin(((r.lat - s.lat) * h) / 2),
                  P = Math.sin(((r.lng - s.lng) * h) / 2),
                  S = y * y + Math.cos(f) * Math.cos(g) * P * P,
                  M = 2 * Math.atan2(Math.sqrt(S), Math.sqrt(1 - S));
                return this.R * M;
              },
            }),
            or = 6378137,
            ps = {
              R: or,
              MAX_LATITUDE: 85.0511287798,
              project: function (s) {
                var r = Math.PI / 180,
                  h = this.MAX_LATITUDE,
                  f = Math.max(Math.min(h, s.lat), -h),
                  g = Math.sin(f * r);
                return new F(
                  this.R * s.lng * r,
                  (this.R * Math.log((1 + g) / (1 - g))) / 2,
                );
              },
              unproject: function (s) {
                var r = 180 / Math.PI;
                return new st(
                  (2 * Math.atan(Math.exp(s.y / this.R)) - Math.PI / 2) * r,
                  (s.x * r) / this.R,
                );
              },
              bounds: (function () {
                var s = or * Math.PI;
                return new nt([-s, -s], [s, s]);
              })(),
            };
          function gs(s, r, h, f) {
            if (E(s)) {
              ((this._a = s[0]),
                (this._b = s[1]),
                (this._c = s[2]),
                (this._d = s[3]));
              return;
            }
            ((this._a = s), (this._b = r), (this._c = h), (this._d = f));
          }
          gs.prototype = {
            transform: function (s, r) {
              return this._transform(s.clone(), r);
            },
            _transform: function (s, r) {
              return (
                (r = r || 1),
                (s.x = r * (this._a * s.x + this._b)),
                (s.y = r * (this._c * s.y + this._d)),
                s
              );
            },
            untransform: function (s, r) {
              return (
                (r = r || 1),
                new F(
                  (s.x / r - this._b) / this._a,
                  (s.y / r - this._d) / this._c,
                )
              );
            },
          };
          function gi(s, r, h, f) {
            return new gs(s, r, h, f);
          }
          var ms = o({}, we, {
              code: "EPSG:3857",
              projection: ps,
              transformation: (function () {
                var s = 0.5 / (Math.PI * ps.R);
                return gi(s, 0.5, -s, 0.5);
              })(),
            }),
            Bh = o({}, ms, { code: "EPSG:900913" });
          function rr(s) {
            return document.createElementNS("http://www.w3.org/2000/svg", s);
          }
          function ar(s, r) {
            var h = "",
              f,
              g,
              y,
              P,
              S,
              M;
            for (f = 0, y = s.length; f < y; f++) {
              for (S = s[f], g = 0, P = S.length; g < P; g++)
                ((M = S[g]), (h += (g ? "L" : "M") + M.x + " " + M.y));
              h += r ? (Z.svg ? "z" : "x") : "";
            }
            return h || "M0 0";
          }
          var _s = document.documentElement.style,
            nn = "ActiveXObject" in window,
            Dh = nn && !document.addEventListener,
            lr = "msLaunchUri" in navigator && !("documentMode" in document),
            ys = Qt("webkit"),
            cr = Qt("android"),
            hr = Qt("android 2") || Qt("android 3"),
            Rh = parseInt(
              /WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1],
              10,
            ),
            zh = cr && Qt("Google") && Rh < 537 && !("AudioNode" in window),
            vs = !!window.opera,
            ur = !lr && Qt("chrome"),
            dr = Qt("gecko") && !ys && !vs && !nn,
            Nh = !ur && Qt("safari"),
            fr = Qt("phantom"),
            pr = "OTransition" in _s,
            Fh = navigator.platform.indexOf("Win") === 0,
            gr = nn && "transition" in _s,
            bs =
              "WebKitCSSMatrix" in window &&
              "m11" in new window.WebKitCSSMatrix() &&
              !hr,
            mr = "MozPerspective" in _s,
            Hh = !window.L_DISABLE_3D && (gr || bs || mr) && !pr && !fr,
            mi = typeof orientation < "u" || Qt("mobile"),
            Wh = mi && ys,
            Vh = mi && bs,
            _r = !window.PointerEvent && window.MSPointerEvent,
            yr = !!(window.PointerEvent || _r),
            vr = "ontouchstart" in window || !!window.TouchEvent,
            Zh = !window.L_NO_TOUCH && (vr || yr),
            jh = mi && vs,
            $h = mi && dr,
            Uh =
              (window.devicePixelRatio ||
                window.screen.deviceXDPI / window.screen.logicalXDPI) > 1,
            qh = (function () {
              var s = !1;
              try {
                var r = Object.defineProperty({}, "passive", {
                  get: function () {
                    s = !0;
                  },
                });
                (window.addEventListener("testPassiveEventSupport", m, r),
                  window.removeEventListener("testPassiveEventSupport", m, r));
              } catch {}
              return s;
            })(),
            Yh = (function () {
              return !!document.createElement("canvas").getContext;
            })(),
            xs = !!(document.createElementNS && rr("svg").createSVGRect),
            Gh =
              !!xs &&
              (function () {
                var s = document.createElement("div");
                return (
                  (s.innerHTML = "<svg/>"),
                  (s.firstChild && s.firstChild.namespaceURI) ===
                    "http://www.w3.org/2000/svg"
                );
              })(),
            Kh =
              !xs &&
              (function () {
                try {
                  var s = document.createElement("div");
                  s.innerHTML = '<v:shape adj="1"/>';
                  var r = s.firstChild;
                  return (
                    (r.style.behavior = "url(#default#VML)"),
                    r && typeof r.adj == "object"
                  );
                } catch {
                  return !1;
                }
              })(),
            Xh = navigator.platform.indexOf("Mac") === 0,
            Jh = navigator.platform.indexOf("Linux") === 0;
          function Qt(s) {
            return navigator.userAgent.toLowerCase().indexOf(s) >= 0;
          }
          var Z = {
              ie: nn,
              ielt9: Dh,
              edge: lr,
              webkit: ys,
              android: cr,
              android23: hr,
              androidStock: zh,
              opera: vs,
              chrome: ur,
              gecko: dr,
              safari: Nh,
              phantom: fr,
              opera12: pr,
              win: Fh,
              ie3d: gr,
              webkit3d: bs,
              gecko3d: mr,
              any3d: Hh,
              mobile: mi,
              mobileWebkit: Wh,
              mobileWebkit3d: Vh,
              msPointer: _r,
              pointer: yr,
              touch: Zh,
              touchNative: vr,
              mobileOpera: jh,
              mobileGecko: $h,
              retina: Uh,
              passiveEvents: qh,
              canvas: Yh,
              svg: xs,
              vml: Kh,
              inlineSvg: Gh,
              mac: Xh,
              linux: Jh,
            },
            br = Z.msPointer ? "MSPointerDown" : "pointerdown",
            xr = Z.msPointer ? "MSPointerMove" : "pointermove",
            wr = Z.msPointer ? "MSPointerUp" : "pointerup",
            Pr = Z.msPointer ? "MSPointerCancel" : "pointercancel",
            ws = {
              touchstart: br,
              touchmove: xr,
              touchend: wr,
              touchcancel: Pr,
            },
            kr = {
              touchstart: su,
              touchmove: sn,
              touchend: sn,
              touchcancel: sn,
            },
            Qe = {},
            Sr = !1;
          function Qh(s, r, h) {
            return (
              r === "touchstart" && nu(),
              kr[r]
                ? ((h = kr[r].bind(this, h)),
                  s.addEventListener(ws[r], h, !1),
                  h)
                : (console.warn("wrong event specified:", r), m)
            );
          }
          function tu(s, r, h) {
            if (!ws[r]) {
              console.warn("wrong event specified:", r);
              return;
            }
            s.removeEventListener(ws[r], h, !1);
          }
          function eu(s) {
            Qe[s.pointerId] = s;
          }
          function iu(s) {
            Qe[s.pointerId] && (Qe[s.pointerId] = s);
          }
          function Mr(s) {
            delete Qe[s.pointerId];
          }
          function nu() {
            Sr ||
              (document.addEventListener(br, eu, !0),
              document.addEventListener(xr, iu, !0),
              document.addEventListener(wr, Mr, !0),
              document.addEventListener(Pr, Mr, !0),
              (Sr = !0));
          }
          function sn(s, r) {
            if (r.pointerType !== (r.MSPOINTER_TYPE_MOUSE || "mouse")) {
              r.touches = [];
              for (var h in Qe) r.touches.push(Qe[h]);
              ((r.changedTouches = [r]), s(r));
            }
          }
          function su(s, r) {
            (r.MSPOINTER_TYPE_TOUCH &&
              r.pointerType === r.MSPOINTER_TYPE_TOUCH &&
              At(r),
              sn(s, r));
          }
          function ou(s) {
            var r = {},
              h,
              f;
            for (f in s) ((h = s[f]), (r[f] = h && h.bind ? h.bind(s) : h));
            return (
              (s = r),
              (r.type = "dblclick"),
              (r.detail = 2),
              (r.isTrusted = !1),
              (r._simulated = !0),
              r
            );
          }
          var ru = 200;
          function au(s, r) {
            s.addEventListener("dblclick", r);
            var h = 0,
              f;
            function g(y) {
              if (y.detail !== 1) {
                f = y.detail;
                return;
              }
              if (
                !(
                  y.pointerType === "mouse" ||
                  (y.sourceCapabilities &&
                    !y.sourceCapabilities.firesTouchEvents)
                )
              ) {
                var P = Ar(y);
                if (
                  !(
                    P.some(function (M) {
                      return M instanceof HTMLLabelElement && M.attributes.for;
                    }) &&
                    !P.some(function (M) {
                      return (
                        M instanceof HTMLInputElement ||
                        M instanceof HTMLSelectElement
                      );
                    })
                  )
                ) {
                  var S = Date.now();
                  (S - h <= ru ? (f++, f === 2 && r(ou(y))) : (f = 1), (h = S));
                }
              }
            }
            return (
              s.addEventListener("click", g),
              { dblclick: r, simDblclick: g }
            );
          }
          function lu(s, r) {
            (s.removeEventListener("dblclick", r.dblclick),
              s.removeEventListener("click", r.simDblclick));
          }
          var Ps = an([
              "transform",
              "webkitTransform",
              "OTransform",
              "MozTransform",
              "msTransform",
            ]),
            _i = an([
              "webkitTransition",
              "transition",
              "OTransition",
              "MozTransition",
              "msTransition",
            ]),
            Lr =
              _i === "webkitTransition" || _i === "OTransition"
                ? _i + "End"
                : "transitionend";
          function Cr(s) {
            return typeof s == "string" ? document.getElementById(s) : s;
          }
          function yi(s, r) {
            var h = s.style[r] || (s.currentStyle && s.currentStyle[r]);
            if ((!h || h === "auto") && document.defaultView) {
              var f = document.defaultView.getComputedStyle(s, null);
              h = f ? f[r] : null;
            }
            return h === "auto" ? null : h;
          }
          function at(s, r, h) {
            var f = document.createElement(s);
            return ((f.className = r || ""), h && h.appendChild(f), f);
          }
          function bt(s) {
            var r = s.parentNode;
            r && r.removeChild(s);
          }
          function on(s) {
            for (; s.firstChild; ) s.removeChild(s.firstChild);
          }
          function ti(s) {
            var r = s.parentNode;
            r && r.lastChild !== s && r.appendChild(s);
          }
          function ei(s) {
            var r = s.parentNode;
            r && r.firstChild !== s && r.insertBefore(s, r.firstChild);
          }
          function ks(s, r) {
            if (s.classList !== void 0) return s.classList.contains(r);
            var h = rn(s);
            return (
              h.length > 0 && new RegExp("(^|\\s)" + r + "(\\s|$)").test(h)
            );
          }
          function X(s, r) {
            if (s.classList !== void 0)
              for (var h = x(r), f = 0, g = h.length; f < g; f++)
                s.classList.add(h[f]);
            else if (!ks(s, r)) {
              var y = rn(s);
              Ss(s, (y ? y + " " : "") + r);
            }
          }
          function Pt(s, r) {
            s.classList !== void 0
              ? s.classList.remove(r)
              : Ss(s, v((" " + rn(s) + " ").replace(" " + r + " ", " ")));
          }
          function Ss(s, r) {
            s.className.baseVal === void 0
              ? (s.className = r)
              : (s.className.baseVal = r);
          }
          function rn(s) {
            return (
              s.correspondingElement && (s = s.correspondingElement),
              s.className.baseVal === void 0 ? s.className : s.className.baseVal
            );
          }
          function Zt(s, r) {
            "opacity" in s.style
              ? (s.style.opacity = r)
              : "filter" in s.style && cu(s, r);
          }
          function cu(s, r) {
            var h = !1,
              f = "DXImageTransform.Microsoft.Alpha";
            try {
              h = s.filters.item(f);
            } catch {
              if (r === 1) return;
            }
            ((r = Math.round(r * 100)),
              h
                ? ((h.Enabled = r !== 100), (h.Opacity = r))
                : (s.style.filter += " progid:" + f + "(opacity=" + r + ")"));
          }
          function an(s) {
            for (
              var r = document.documentElement.style, h = 0;
              h < s.length;
              h++
            )
              if (s[h] in r) return s[h];
            return !1;
          }
          function Re(s, r, h) {
            var f = r || new F(0, 0);
            s.style[Ps] =
              (Z.ie3d
                ? "translate(" + f.x + "px," + f.y + "px)"
                : "translate3d(" + f.x + "px," + f.y + "px,0)") +
              (h ? " scale(" + h + ")" : "");
          }
          function St(s, r) {
            ((s._leaflet_pos = r),
              Z.any3d
                ? Re(s, r)
                : ((s.style.left = r.x + "px"), (s.style.top = r.y + "px")));
          }
          function ze(s) {
            return s._leaflet_pos || new F(0, 0);
          }
          var vi, bi, Ms;
          if ("onselectstart" in document)
            ((vi = function () {
              K(window, "selectstart", At);
            }),
              (bi = function () {
                dt(window, "selectstart", At);
              }));
          else {
            var xi = an([
              "userSelect",
              "WebkitUserSelect",
              "OUserSelect",
              "MozUserSelect",
              "msUserSelect",
            ]);
            ((vi = function () {
              if (xi) {
                var s = document.documentElement.style;
                ((Ms = s[xi]), (s[xi] = "none"));
              }
            }),
              (bi = function () {
                xi &&
                  ((document.documentElement.style[xi] = Ms), (Ms = void 0));
              }));
          }
          function Ls() {
            K(window, "dragstart", At);
          }
          function Cs() {
            dt(window, "dragstart", At);
          }
          var ln, Ts;
          function Es(s) {
            for (; s.tabIndex === -1; ) s = s.parentNode;
            s.style &&
              (cn(),
              (ln = s),
              (Ts = s.style.outlineStyle),
              (s.style.outlineStyle = "none"),
              K(window, "keydown", cn));
          }
          function cn() {
            ln &&
              ((ln.style.outlineStyle = Ts),
              (ln = void 0),
              (Ts = void 0),
              dt(window, "keydown", cn));
          }
          function Tr(s) {
            do s = s.parentNode;
            while ((!s.offsetWidth || !s.offsetHeight) && s !== document.body);
            return s;
          }
          function As(s) {
            var r = s.getBoundingClientRect();
            return {
              x: r.width / s.offsetWidth || 1,
              y: r.height / s.offsetHeight || 1,
              boundingClientRect: r,
            };
          }
          var hu = {
            __proto__: null,
            TRANSFORM: Ps,
            TRANSITION: _i,
            TRANSITION_END: Lr,
            get: Cr,
            getStyle: yi,
            create: at,
            remove: bt,
            empty: on,
            toFront: ti,
            toBack: ei,
            hasClass: ks,
            addClass: X,
            removeClass: Pt,
            setClass: Ss,
            getClass: rn,
            setOpacity: Zt,
            testProp: an,
            setTransform: Re,
            setPosition: St,
            getPosition: ze,
            get disableTextSelection() {
              return vi;
            },
            get enableTextSelection() {
              return bi;
            },
            disableImageDrag: Ls,
            enableImageDrag: Cs,
            preventOutline: Es,
            restoreOutline: cn,
            getSizedParentNode: Tr,
            getScale: As,
          };
          function K(s, r, h, f) {
            if (r && typeof r == "object") for (var g in r) Is(s, g, r[g], h);
            else {
              r = x(r);
              for (var y = 0, P = r.length; y < P; y++) Is(s, r[y], h, f);
            }
            return this;
          }
          var te = "_leaflet_events";
          function dt(s, r, h, f) {
            if (arguments.length === 1) (Er(s), delete s[te]);
            else if (r && typeof r == "object")
              for (var g in r) Bs(s, g, r[g], h);
            else if (((r = x(r)), arguments.length === 2))
              Er(s, function (S) {
                return A(r, S) !== -1;
              });
            else for (var y = 0, P = r.length; y < P; y++) Bs(s, r[y], h, f);
            return this;
          }
          function Er(s, r) {
            for (var h in s[te]) {
              var f = h.split(/\d/)[0];
              (!r || r(f)) && Bs(s, f, null, null, h);
            }
          }
          var Os = {
            mouseenter: "mouseover",
            mouseleave: "mouseout",
            wheel: !("onwheel" in window) && "mousewheel",
          };
          function Is(s, r, h, f) {
            var g = r + u(h) + (f ? "_" + u(f) : "");
            if (s[te] && s[te][g]) return this;
            var y = function (S) {
                return h.call(f || s, S || window.event);
              },
              P = y;
            (!Z.touchNative && Z.pointer && r.indexOf("touch") === 0
              ? (y = Qh(s, r, y))
              : Z.touch && r === "dblclick"
                ? (y = au(s, y))
                : "addEventListener" in s
                  ? r === "touchstart" ||
                    r === "touchmove" ||
                    r === "wheel" ||
                    r === "mousewheel"
                    ? s.addEventListener(
                        Os[r] || r,
                        y,
                        Z.passiveEvents ? { passive: !1 } : !1,
                      )
                    : r === "mouseenter" || r === "mouseleave"
                      ? ((y = function (S) {
                          ((S = S || window.event), Rs(s, S) && P(S));
                        }),
                        s.addEventListener(Os[r], y, !1))
                      : s.addEventListener(r, P, !1)
                  : s.attachEvent("on" + r, y),
              (s[te] = s[te] || {}),
              (s[te][g] = y));
          }
          function Bs(s, r, h, f, g) {
            g = g || r + u(h) + (f ? "_" + u(f) : "");
            var y = s[te] && s[te][g];
            if (!y) return this;
            (!Z.touchNative && Z.pointer && r.indexOf("touch") === 0
              ? tu(s, r, y)
              : Z.touch && r === "dblclick"
                ? lu(s, y)
                : "removeEventListener" in s
                  ? s.removeEventListener(Os[r] || r, y, !1)
                  : s.detachEvent("on" + r, y),
              (s[te][g] = null));
          }
          function Ne(s) {
            return (
              s.stopPropagation
                ? s.stopPropagation()
                : s.originalEvent
                  ? (s.originalEvent._stopped = !0)
                  : (s.cancelBubble = !0),
              this
            );
          }
          function Ds(s) {
            return (Is(s, "wheel", Ne), this);
          }
          function wi(s) {
            return (
              K(s, "mousedown touchstart dblclick contextmenu", Ne),
              (s._leaflet_disable_click = !0),
              this
            );
          }
          function At(s) {
            return (
              s.preventDefault ? s.preventDefault() : (s.returnValue = !1),
              this
            );
          }
          function Fe(s) {
            return (At(s), Ne(s), this);
          }
          function Ar(s) {
            if (s.composedPath) return s.composedPath();
            for (var r = [], h = s.target; h; ) (r.push(h), (h = h.parentNode));
            return r;
          }
          function Or(s, r) {
            if (!r) return new F(s.clientX, s.clientY);
            var h = As(r),
              f = h.boundingClientRect;
            return new F(
              (s.clientX - f.left) / h.x - r.clientLeft,
              (s.clientY - f.top) / h.y - r.clientTop,
            );
          }
          var uu =
            Z.linux && Z.chrome
              ? window.devicePixelRatio
              : Z.mac
                ? window.devicePixelRatio * 3
                : window.devicePixelRatio > 0
                  ? 2 * window.devicePixelRatio
                  : 1;
          function Ir(s) {
            return Z.edge
              ? s.wheelDeltaY / 2
              : s.deltaY && s.deltaMode === 0
                ? -s.deltaY / uu
                : s.deltaY && s.deltaMode === 1
                  ? -s.deltaY * 20
                  : s.deltaY && s.deltaMode === 2
                    ? -s.deltaY * 60
                    : s.deltaX || s.deltaZ
                      ? 0
                      : s.wheelDelta
                        ? (s.wheelDeltaY || s.wheelDelta) / 2
                        : s.detail && Math.abs(s.detail) < 32765
                          ? -s.detail * 20
                          : s.detail
                            ? (s.detail / -32765) * 60
                            : 0;
          }
          function Rs(s, r) {
            var h = r.relatedTarget;
            if (!h) return !0;
            try {
              for (; h && h !== s; ) h = h.parentNode;
            } catch {
              return !1;
            }
            return h !== s;
          }
          var du = {
              __proto__: null,
              on: K,
              off: dt,
              stopPropagation: Ne,
              disableScrollPropagation: Ds,
              disableClickPropagation: wi,
              preventDefault: At,
              stop: Fe,
              getPropagationPath: Ar,
              getMousePosition: Or,
              getWheelDelta: Ir,
              isExternalTarget: Rs,
              addListener: K,
              removeListener: dt,
            },
            Br = ct.extend({
              run: function (s, r, h, f) {
                (this.stop(),
                  (this._el = s),
                  (this._inProgress = !0),
                  (this._duration = h || 0.25),
                  (this._easeOutPower = 1 / Math.max(f || 0.5, 0.2)),
                  (this._startPos = ze(s)),
                  (this._offset = r.subtract(this._startPos)),
                  (this._startTime = +new Date()),
                  this.fire("start"),
                  this._animate());
              },
              stop: function () {
                this._inProgress && (this._step(!0), this._complete());
              },
              _animate: function () {
                ((this._animId = W(this._animate, this)), this._step());
              },
              _step: function (s) {
                var r = +new Date() - this._startTime,
                  h = this._duration * 1e3;
                r < h
                  ? this._runFrame(this._easeOut(r / h), s)
                  : (this._runFrame(1), this._complete());
              },
              _runFrame: function (s, r) {
                var h = this._startPos.add(this._offset.multiplyBy(s));
                (r && h._round(), St(this._el, h), this.fire("step"));
              },
              _complete: function () {
                (j(this._animId), (this._inProgress = !1), this.fire("end"));
              },
              _easeOut: function (s) {
                return 1 - Math.pow(1 - s, this._easeOutPower);
              },
            }),
            ot = ct.extend({
              options: {
                crs: ms,
                center: void 0,
                zoom: void 0,
                minZoom: void 0,
                maxZoom: void 0,
                layers: [],
                maxBounds: void 0,
                renderer: void 0,
                zoomAnimation: !0,
                zoomAnimationThreshold: 4,
                fadeAnimation: !0,
                markerZoomAnimation: !0,
                transform3DLimit: 8388608,
                zoomSnap: 1,
                zoomDelta: 1,
                trackResize: !0,
              },
              initialize: function (s, r) {
                ((r = b(this, r)),
                  (this._handlers = []),
                  (this._layers = {}),
                  (this._zoomBoundLayers = {}),
                  (this._sizeChanged = !0),
                  this._initContainer(s),
                  this._initLayout(),
                  (this._onResize = l(this._onResize, this)),
                  this._initEvents(),
                  r.maxBounds && this.setMaxBounds(r.maxBounds),
                  r.zoom !== void 0 && (this._zoom = this._limitZoom(r.zoom)),
                  r.center &&
                    r.zoom !== void 0 &&
                    this.setView(G(r.center), r.zoom, { reset: !0 }),
                  this.callInitHooks(),
                  (this._zoomAnimated =
                    _i &&
                    Z.any3d &&
                    !Z.mobileOpera &&
                    this.options.zoomAnimation),
                  this._zoomAnimated &&
                    (this._createAnimProxy(),
                    K(this._proxy, Lr, this._catchTransitionEnd, this)),
                  this._addLayers(this.options.layers));
              },
              setView: function (s, r, h) {
                if (
                  ((r = r === void 0 ? this._zoom : this._limitZoom(r)),
                  (s = this._limitCenter(G(s), r, this.options.maxBounds)),
                  (h = h || {}),
                  this._stop(),
                  this._loaded && !h.reset && h !== !0)
                ) {
                  h.animate !== void 0 &&
                    ((h.zoom = o({ animate: h.animate }, h.zoom)),
                    (h.pan = o(
                      { animate: h.animate, duration: h.duration },
                      h.pan,
                    )));
                  var f =
                    this._zoom !== r
                      ? this._tryAnimatedZoom &&
                        this._tryAnimatedZoom(s, r, h.zoom)
                      : this._tryAnimatedPan(s, h.pan);
                  if (f) return (clearTimeout(this._sizeTimer), this);
                }
                return (
                  this._resetView(s, r, h.pan && h.pan.noMoveStart),
                  this
                );
              },
              setZoom: function (s, r) {
                return this._loaded
                  ? this.setView(this.getCenter(), s, { zoom: r })
                  : ((this._zoom = s), this);
              },
              zoomIn: function (s, r) {
                return (
                  (s = s || (Z.any3d ? this.options.zoomDelta : 1)),
                  this.setZoom(this._zoom + s, r)
                );
              },
              zoomOut: function (s, r) {
                return (
                  (s = s || (Z.any3d ? this.options.zoomDelta : 1)),
                  this.setZoom(this._zoom - s, r)
                );
              },
              setZoomAround: function (s, r, h) {
                var f = this.getZoomScale(r),
                  g = this.getSize().divideBy(2),
                  y = s instanceof F ? s : this.latLngToContainerPoint(s),
                  P = y.subtract(g).multiplyBy(1 - 1 / f),
                  S = this.containerPointToLatLng(g.add(P));
                return this.setView(S, r, { zoom: h });
              },
              _getBoundsCenterZoom: function (s, r) {
                ((r = r || {}), (s = s.getBounds ? s.getBounds() : Q(s)));
                var h = V(r.paddingTopLeft || r.padding || [0, 0]),
                  f = V(r.paddingBottomRight || r.padding || [0, 0]),
                  g = this.getBoundsZoom(s, !1, h.add(f));
                if (
                  ((g =
                    typeof r.maxZoom == "number" ? Math.min(r.maxZoom, g) : g),
                  g === 1 / 0)
                )
                  return { center: s.getCenter(), zoom: g };
                var y = f.subtract(h).divideBy(2),
                  P = this.project(s.getSouthWest(), g),
                  S = this.project(s.getNorthEast(), g),
                  M = this.unproject(P.add(S).divideBy(2).add(y), g);
                return { center: M, zoom: g };
              },
              fitBounds: function (s, r) {
                if (((s = Q(s)), !s.isValid()))
                  throw new Error("Bounds are not valid.");
                var h = this._getBoundsCenterZoom(s, r);
                return this.setView(h.center, h.zoom, r);
              },
              fitWorld: function (s) {
                return this.fitBounds(
                  [
                    [-90, -180],
                    [90, 180],
                  ],
                  s,
                );
              },
              panTo: function (s, r) {
                return this.setView(s, this._zoom, { pan: r });
              },
              panBy: function (s, r) {
                if (((s = V(s).round()), (r = r || {}), !s.x && !s.y))
                  return this.fire("moveend");
                if (r.animate !== !0 && !this.getSize().contains(s))
                  return (
                    this._resetView(
                      this.unproject(this.project(this.getCenter()).add(s)),
                      this.getZoom(),
                    ),
                    this
                  );
                if (
                  (this._panAnim ||
                    ((this._panAnim = new Br()),
                    this._panAnim.on(
                      {
                        step: this._onPanTransitionStep,
                        end: this._onPanTransitionEnd,
                      },
                      this,
                    )),
                  r.noMoveStart || this.fire("movestart"),
                  r.animate !== !1)
                ) {
                  X(this._mapPane, "leaflet-pan-anim");
                  var h = this._getMapPanePos().subtract(s).round();
                  this._panAnim.run(
                    this._mapPane,
                    h,
                    r.duration || 0.25,
                    r.easeLinearity,
                  );
                } else (this._rawPanBy(s), this.fire("move").fire("moveend"));
                return this;
              },
              flyTo: function (s, r, h) {
                if (((h = h || {}), h.animate === !1 || !Z.any3d))
                  return this.setView(s, r, h);
                this._stop();
                var f = this.project(this.getCenter()),
                  g = this.project(s),
                  y = this.getSize(),
                  P = this._zoom;
                ((s = G(s)), (r = r === void 0 ? P : r));
                var S = Math.max(y.x, y.y),
                  M = S * this.getZoomScale(P, r),
                  O = g.distanceTo(f) || 1,
                  N = 1.42,
                  $ = N * N;
                function J(Mt) {
                  var xn = Mt ? -1 : 1,
                    td = Mt ? M : S,
                    ed = M * M - S * S + xn * $ * $ * O * O,
                    id = 2 * td * $ * O,
                    qs = ed / id,
                    pa = Math.sqrt(qs * qs + 1) - qs,
                    nd = pa < 1e-9 ? -18 : Math.log(pa);
                  return nd;
                }
                function Rt(Mt) {
                  return (Math.exp(Mt) - Math.exp(-Mt)) / 2;
                }
                function Tt(Mt) {
                  return (Math.exp(Mt) + Math.exp(-Mt)) / 2;
                }
                function $t(Mt) {
                  return Rt(Mt) / Tt(Mt);
                }
                var zt = J(0);
                function ai(Mt) {
                  return S * (Tt(zt) / Tt(zt + N * Mt));
                }
                function Ku(Mt) {
                  return (S * (Tt(zt) * $t(zt + N * Mt) - Rt(zt))) / $;
                }
                function Xu(Mt) {
                  return 1 - Math.pow(1 - Mt, 1.5);
                }
                var Ju = Date.now(),
                  da = (J(1) - zt) / N,
                  Qu = h.duration ? 1e3 * h.duration : 1e3 * da * 0.8;
                function fa() {
                  var Mt = (Date.now() - Ju) / Qu,
                    xn = Xu(Mt) * da;
                  Mt <= 1
                    ? ((this._flyToFrame = W(fa, this)),
                      this._move(
                        this.unproject(
                          f.add(g.subtract(f).multiplyBy(Ku(xn) / O)),
                          P,
                        ),
                        this.getScaleZoom(S / ai(xn), P),
                        { flyTo: !0 },
                      ))
                    : this._move(s, r)._moveEnd(!0);
                }
                return (
                  this._moveStart(!0, h.noMoveStart),
                  fa.call(this),
                  this
                );
              },
              flyToBounds: function (s, r) {
                var h = this._getBoundsCenterZoom(s, r);
                return this.flyTo(h.center, h.zoom, r);
              },
              setMaxBounds: function (s) {
                return (
                  (s = Q(s)),
                  this.listens("moveend", this._panInsideMaxBounds) &&
                    this.off("moveend", this._panInsideMaxBounds),
                  s.isValid()
                    ? ((this.options.maxBounds = s),
                      this._loaded && this._panInsideMaxBounds(),
                      this.on("moveend", this._panInsideMaxBounds))
                    : ((this.options.maxBounds = null), this)
                );
              },
              setMinZoom: function (s) {
                var r = this.options.minZoom;
                return (
                  (this.options.minZoom = s),
                  this._loaded &&
                  r !== s &&
                  (this.fire("zoomlevelschange"),
                  this.getZoom() < this.options.minZoom)
                    ? this.setZoom(s)
                    : this
                );
              },
              setMaxZoom: function (s) {
                var r = this.options.maxZoom;
                return (
                  (this.options.maxZoom = s),
                  this._loaded &&
                  r !== s &&
                  (this.fire("zoomlevelschange"),
                  this.getZoom() > this.options.maxZoom)
                    ? this.setZoom(s)
                    : this
                );
              },
              panInsideBounds: function (s, r) {
                this._enforcingBounds = !0;
                var h = this.getCenter(),
                  f = this._limitCenter(h, this._zoom, Q(s));
                return (
                  h.equals(f) || this.panTo(f, r),
                  (this._enforcingBounds = !1),
                  this
                );
              },
              panInside: function (s, r) {
                r = r || {};
                var h = V(r.paddingTopLeft || r.padding || [0, 0]),
                  f = V(r.paddingBottomRight || r.padding || [0, 0]),
                  g = this.project(this.getCenter()),
                  y = this.project(s),
                  P = this.getPixelBounds(),
                  S = mt([P.min.add(h), P.max.subtract(f)]),
                  M = S.getSize();
                if (!S.contains(y)) {
                  this._enforcingBounds = !0;
                  var O = y.subtract(S.getCenter()),
                    N = S.extend(y).getSize().subtract(M);
                  ((g.x += O.x < 0 ? -N.x : N.x),
                    (g.y += O.y < 0 ? -N.y : N.y),
                    this.panTo(this.unproject(g), r),
                    (this._enforcingBounds = !1));
                }
                return this;
              },
              invalidateSize: function (s) {
                if (!this._loaded) return this;
                s = o({ animate: !1, pan: !0 }, s === !0 ? { animate: !0 } : s);
                var r = this.getSize();
                ((this._sizeChanged = !0), (this._lastCenter = null));
                var h = this.getSize(),
                  f = r.divideBy(2).round(),
                  g = h.divideBy(2).round(),
                  y = f.subtract(g);
                return !y.x && !y.y
                  ? this
                  : (s.animate && s.pan
                      ? this.panBy(y)
                      : (s.pan && this._rawPanBy(y),
                        this.fire("move"),
                        s.debounceMoveend
                          ? (clearTimeout(this._sizeTimer),
                            (this._sizeTimer = setTimeout(
                              l(this.fire, this, "moveend"),
                              200,
                            )))
                          : this.fire("moveend")),
                    this.fire("resize", { oldSize: r, newSize: h }));
              },
              stop: function () {
                return (
                  this.setZoom(this._limitZoom(this._zoom)),
                  this.options.zoomSnap || this.fire("viewreset"),
                  this._stop()
                );
              },
              locate: function (s) {
                if (
                  ((s = this._locateOptions =
                    o({ timeout: 1e4, watch: !1 }, s)),
                  !("geolocation" in navigator))
                )
                  return (
                    this._handleGeolocationError({
                      code: 0,
                      message: "Geolocation not supported.",
                    }),
                    this
                  );
                var r = l(this._handleGeolocationResponse, this),
                  h = l(this._handleGeolocationError, this);
                return (
                  s.watch
                    ? (this._locationWatchId =
                        navigator.geolocation.watchPosition(r, h, s))
                    : navigator.geolocation.getCurrentPosition(r, h, s),
                  this
                );
              },
              stopLocate: function () {
                return (
                  navigator.geolocation &&
                    navigator.geolocation.clearWatch &&
                    navigator.geolocation.clearWatch(this._locationWatchId),
                  this._locateOptions && (this._locateOptions.setView = !1),
                  this
                );
              },
              _handleGeolocationError: function (s) {
                if (this._container._leaflet_id) {
                  var r = s.code,
                    h =
                      s.message ||
                      (r === 1
                        ? "permission denied"
                        : r === 2
                          ? "position unavailable"
                          : "timeout");
                  (this._locateOptions.setView &&
                    !this._loaded &&
                    this.fitWorld(),
                    this.fire("locationerror", {
                      code: r,
                      message: "Geolocation error: " + h + ".",
                    }));
                }
              },
              _handleGeolocationResponse: function (s) {
                if (this._container._leaflet_id) {
                  var r = s.coords.latitude,
                    h = s.coords.longitude,
                    f = new st(r, h),
                    g = f.toBounds(s.coords.accuracy * 2),
                    y = this._locateOptions;
                  if (y.setView) {
                    var P = this.getBoundsZoom(g);
                    this.setView(f, y.maxZoom ? Math.min(P, y.maxZoom) : P);
                  }
                  var S = { latlng: f, bounds: g, timestamp: s.timestamp };
                  for (var M in s.coords)
                    typeof s.coords[M] == "number" && (S[M] = s.coords[M]);
                  this.fire("locationfound", S);
                }
              },
              addHandler: function (s, r) {
                if (!r) return this;
                var h = (this[s] = new r(this));
                return (
                  this._handlers.push(h),
                  this.options[s] && h.enable(),
                  this
                );
              },
              remove: function () {
                if (
                  (this._initEvents(!0),
                  this.options.maxBounds &&
                    this.off("moveend", this._panInsideMaxBounds),
                  this._containerId !== this._container._leaflet_id)
                )
                  throw new Error(
                    "Map container is being reused by another instance",
                  );
                try {
                  (delete this._container._leaflet_id,
                    delete this._containerId);
                } catch {
                  ((this._container._leaflet_id = void 0),
                    (this._containerId = void 0));
                }
                (this._locationWatchId !== void 0 && this.stopLocate(),
                  this._stop(),
                  bt(this._mapPane),
                  this._clearControlPos && this._clearControlPos(),
                  this._resizeRequest &&
                    (j(this._resizeRequest), (this._resizeRequest = null)),
                  this._clearHandlers(),
                  this._loaded && this.fire("unload"));
                var s;
                for (s in this._layers) this._layers[s].remove();
                for (s in this._panes) bt(this._panes[s]);
                return (
                  (this._layers = []),
                  (this._panes = []),
                  delete this._mapPane,
                  delete this._renderer,
                  this
                );
              },
              createPane: function (s, r) {
                var h =
                    "leaflet-pane" +
                    (s ? " leaflet-" + s.replace("Pane", "") + "-pane" : ""),
                  f = at("div", h, r || this._mapPane);
                return (s && (this._panes[s] = f), f);
              },
              getCenter: function () {
                return (
                  this._checkIfLoaded(),
                  this._lastCenter && !this._moved()
                    ? this._lastCenter.clone()
                    : this.layerPointToLatLng(this._getCenterLayerPoint())
                );
              },
              getZoom: function () {
                return this._zoom;
              },
              getBounds: function () {
                var s = this.getPixelBounds(),
                  r = this.unproject(s.getBottomLeft()),
                  h = this.unproject(s.getTopRight());
                return new vt(r, h);
              },
              getMinZoom: function () {
                return this.options.minZoom === void 0
                  ? this._layersMinZoom || 0
                  : this.options.minZoom;
              },
              getMaxZoom: function () {
                return this.options.maxZoom === void 0
                  ? this._layersMaxZoom === void 0
                    ? 1 / 0
                    : this._layersMaxZoom
                  : this.options.maxZoom;
              },
              getBoundsZoom: function (s, r, h) {
                ((s = Q(s)), (h = V(h || [0, 0])));
                var f = this.getZoom() || 0,
                  g = this.getMinZoom(),
                  y = this.getMaxZoom(),
                  P = s.getNorthWest(),
                  S = s.getSouthEast(),
                  M = this.getSize().subtract(h),
                  O = mt(this.project(S, f), this.project(P, f)).getSize(),
                  N = Z.any3d ? this.options.zoomSnap : 1,
                  $ = M.x / O.x,
                  J = M.y / O.y,
                  Rt = r ? Math.max($, J) : Math.min($, J);
                return (
                  (f = this.getScaleZoom(Rt, f)),
                  N &&
                    ((f = Math.round(f / (N / 100)) * (N / 100)),
                    (f = r ? Math.ceil(f / N) * N : Math.floor(f / N) * N)),
                  Math.max(g, Math.min(y, f))
                );
              },
              getSize: function () {
                return (
                  (!this._size || this._sizeChanged) &&
                    ((this._size = new F(
                      this._container.clientWidth || 0,
                      this._container.clientHeight || 0,
                    )),
                    (this._sizeChanged = !1)),
                  this._size.clone()
                );
              },
              getPixelBounds: function (s, r) {
                var h = this._getTopLeftPoint(s, r);
                return new nt(h, h.add(this.getSize()));
              },
              getPixelOrigin: function () {
                return (this._checkIfLoaded(), this._pixelOrigin);
              },
              getPixelWorldBounds: function (s) {
                return this.options.crs.getProjectedBounds(
                  s === void 0 ? this.getZoom() : s,
                );
              },
              getPane: function (s) {
                return typeof s == "string" ? this._panes[s] : s;
              },
              getPanes: function () {
                return this._panes;
              },
              getContainer: function () {
                return this._container;
              },
              getZoomScale: function (s, r) {
                var h = this.options.crs;
                return (
                  (r = r === void 0 ? this._zoom : r),
                  h.scale(s) / h.scale(r)
                );
              },
              getScaleZoom: function (s, r) {
                var h = this.options.crs;
                r = r === void 0 ? this._zoom : r;
                var f = h.zoom(s * h.scale(r));
                return isNaN(f) ? 1 / 0 : f;
              },
              project: function (s, r) {
                return (
                  (r = r === void 0 ? this._zoom : r),
                  this.options.crs.latLngToPoint(G(s), r)
                );
              },
              unproject: function (s, r) {
                return (
                  (r = r === void 0 ? this._zoom : r),
                  this.options.crs.pointToLatLng(V(s), r)
                );
              },
              layerPointToLatLng: function (s) {
                var r = V(s).add(this.getPixelOrigin());
                return this.unproject(r);
              },
              latLngToLayerPoint: function (s) {
                var r = this.project(G(s))._round();
                return r._subtract(this.getPixelOrigin());
              },
              wrapLatLng: function (s) {
                return this.options.crs.wrapLatLng(G(s));
              },
              wrapLatLngBounds: function (s) {
                return this.options.crs.wrapLatLngBounds(Q(s));
              },
              distance: function (s, r) {
                return this.options.crs.distance(G(s), G(r));
              },
              containerPointToLayerPoint: function (s) {
                return V(s).subtract(this._getMapPanePos());
              },
              layerPointToContainerPoint: function (s) {
                return V(s).add(this._getMapPanePos());
              },
              containerPointToLatLng: function (s) {
                var r = this.containerPointToLayerPoint(V(s));
                return this.layerPointToLatLng(r);
              },
              latLngToContainerPoint: function (s) {
                return this.layerPointToContainerPoint(
                  this.latLngToLayerPoint(G(s)),
                );
              },
              mouseEventToContainerPoint: function (s) {
                return Or(s, this._container);
              },
              mouseEventToLayerPoint: function (s) {
                return this.containerPointToLayerPoint(
                  this.mouseEventToContainerPoint(s),
                );
              },
              mouseEventToLatLng: function (s) {
                return this.layerPointToLatLng(this.mouseEventToLayerPoint(s));
              },
              _initContainer: function (s) {
                var r = (this._container = Cr(s));
                if (r) {
                  if (r._leaflet_id)
                    throw new Error("Map container is already initialized.");
                } else throw new Error("Map container not found.");
                (K(r, "scroll", this._onScroll, this),
                  (this._containerId = u(r)));
              },
              _initLayout: function () {
                var s = this._container;
                ((this._fadeAnimated = this.options.fadeAnimation && Z.any3d),
                  X(
                    s,
                    "leaflet-container" +
                      (Z.touch ? " leaflet-touch" : "") +
                      (Z.retina ? " leaflet-retina" : "") +
                      (Z.ielt9 ? " leaflet-oldie" : "") +
                      (Z.safari ? " leaflet-safari" : "") +
                      (this._fadeAnimated ? " leaflet-fade-anim" : ""),
                  ));
                var r = yi(s, "position");
                (r !== "absolute" &&
                  r !== "relative" &&
                  r !== "fixed" &&
                  r !== "sticky" &&
                  (s.style.position = "relative"),
                  this._initPanes(),
                  this._initControlPos && this._initControlPos());
              },
              _initPanes: function () {
                var s = (this._panes = {});
                ((this._paneRenderers = {}),
                  (this._mapPane = this.createPane("mapPane", this._container)),
                  St(this._mapPane, new F(0, 0)),
                  this.createPane("tilePane"),
                  this.createPane("overlayPane"),
                  this.createPane("shadowPane"),
                  this.createPane("markerPane"),
                  this.createPane("tooltipPane"),
                  this.createPane("popupPane"),
                  this.options.markerZoomAnimation ||
                    (X(s.markerPane, "leaflet-zoom-hide"),
                    X(s.shadowPane, "leaflet-zoom-hide")));
              },
              _resetView: function (s, r, h) {
                St(this._mapPane, new F(0, 0));
                var f = !this._loaded;
                ((this._loaded = !0),
                  (r = this._limitZoom(r)),
                  this.fire("viewprereset"));
                var g = this._zoom !== r;
                (this._moveStart(g, h)._move(s, r)._moveEnd(g),
                  this.fire("viewreset"),
                  f && this.fire("load"));
              },
              _moveStart: function (s, r) {
                return (
                  s && this.fire("zoomstart"),
                  r || this.fire("movestart"),
                  this
                );
              },
              _move: function (s, r, h, f) {
                r === void 0 && (r = this._zoom);
                var g = this._zoom !== r;
                return (
                  (this._zoom = r),
                  (this._lastCenter = s),
                  (this._pixelOrigin = this._getNewPixelOrigin(s)),
                  f
                    ? h && h.pinch && this.fire("zoom", h)
                    : ((g || (h && h.pinch)) && this.fire("zoom", h),
                      this.fire("move", h)),
                  this
                );
              },
              _moveEnd: function (s) {
                return (s && this.fire("zoomend"), this.fire("moveend"));
              },
              _stop: function () {
                return (
                  j(this._flyToFrame),
                  this._panAnim && this._panAnim.stop(),
                  this
                );
              },
              _rawPanBy: function (s) {
                St(this._mapPane, this._getMapPanePos().subtract(s));
              },
              _getZoomSpan: function () {
                return this.getMaxZoom() - this.getMinZoom();
              },
              _panInsideMaxBounds: function () {
                this._enforcingBounds ||
                  this.panInsideBounds(this.options.maxBounds);
              },
              _checkIfLoaded: function () {
                if (!this._loaded)
                  throw new Error("Set map center and zoom first.");
              },
              _initEvents: function (s) {
                ((this._targets = {}),
                  (this._targets[u(this._container)] = this));
                var r = s ? dt : K;
                (r(
                  this._container,
                  "click dblclick mousedown mouseup mouseover mouseout mousemove contextmenu keypress keydown keyup",
                  this._handleDOMEvent,
                  this,
                ),
                  this.options.trackResize &&
                    r(window, "resize", this._onResize, this),
                  Z.any3d &&
                    this.options.transform3DLimit &&
                    (s ? this.off : this.on).call(
                      this,
                      "moveend",
                      this._onMoveEnd,
                    ));
              },
              _onResize: function () {
                (j(this._resizeRequest),
                  (this._resizeRequest = W(function () {
                    this.invalidateSize({ debounceMoveend: !0 });
                  }, this)));
              },
              _onScroll: function () {
                ((this._container.scrollTop = 0),
                  (this._container.scrollLeft = 0));
              },
              _onMoveEnd: function () {
                var s = this._getMapPanePos();
                Math.max(Math.abs(s.x), Math.abs(s.y)) >=
                  this.options.transform3DLimit &&
                  this._resetView(this.getCenter(), this.getZoom());
              },
              _findEventTargets: function (s, r) {
                for (
                  var h = [],
                    f,
                    g = r === "mouseout" || r === "mouseover",
                    y = s.target || s.srcElement,
                    P = !1;
                  y;
                ) {
                  if (
                    ((f = this._targets[u(y)]),
                    f &&
                      (r === "click" || r === "preclick") &&
                      this._draggableMoved(f))
                  ) {
                    P = !0;
                    break;
                  }
                  if (
                    (f &&
                      f.listens(r, !0) &&
                      ((g && !Rs(y, s)) || (h.push(f), g))) ||
                    y === this._container
                  )
                    break;
                  y = y.parentNode;
                }
                return (
                  !h.length && !P && !g && this.listens(r, !0) && (h = [this]),
                  h
                );
              },
              _isClickDisabled: function (s) {
                for (; s && s !== this._container; ) {
                  if (s._leaflet_disable_click) return !0;
                  s = s.parentNode;
                }
              },
              _handleDOMEvent: function (s) {
                var r = s.target || s.srcElement;
                if (
                  !(
                    !this._loaded ||
                    r._leaflet_disable_events ||
                    (s.type === "click" && this._isClickDisabled(r))
                  )
                ) {
                  var h = s.type;
                  (h === "mousedown" && Es(r), this._fireDOMEvent(s, h));
                }
              },
              _mouseEvents: [
                "click",
                "dblclick",
                "mouseover",
                "mouseout",
                "contextmenu",
              ],
              _fireDOMEvent: function (s, r, h) {
                if (s.type === "click") {
                  var f = o({}, s);
                  ((f.type = "preclick"), this._fireDOMEvent(f, f.type, h));
                }
                var g = this._findEventTargets(s, r);
                if (h) {
                  for (var y = [], P = 0; P < h.length; P++)
                    h[P].listens(r, !0) && y.push(h[P]);
                  g = y.concat(g);
                }
                if (g.length) {
                  r === "contextmenu" && At(s);
                  var S = g[0],
                    M = { originalEvent: s };
                  if (
                    s.type !== "keypress" &&
                    s.type !== "keydown" &&
                    s.type !== "keyup"
                  ) {
                    var O = S.getLatLng && (!S._radius || S._radius <= 10);
                    ((M.containerPoint = O
                      ? this.latLngToContainerPoint(S.getLatLng())
                      : this.mouseEventToContainerPoint(s)),
                      (M.layerPoint = this.containerPointToLayerPoint(
                        M.containerPoint,
                      )),
                      (M.latlng = O
                        ? S.getLatLng()
                        : this.layerPointToLatLng(M.layerPoint)));
                  }
                  for (P = 0; P < g.length; P++)
                    if (
                      (g[P].fire(r, M, !0),
                      M.originalEvent._stopped ||
                        (g[P].options.bubblingMouseEvents === !1 &&
                          A(this._mouseEvents, r) !== -1))
                    )
                      return;
                }
              },
              _draggableMoved: function (s) {
                return (
                  (s = s.dragging && s.dragging.enabled() ? s : this),
                  (s.dragging && s.dragging.moved()) ||
                    (this.boxZoom && this.boxZoom.moved())
                );
              },
              _clearHandlers: function () {
                for (var s = 0, r = this._handlers.length; s < r; s++)
                  this._handlers[s].disable();
              },
              whenReady: function (s, r) {
                return (
                  this._loaded
                    ? s.call(r || this, { target: this })
                    : this.on("load", s, r),
                  this
                );
              },
              _getMapPanePos: function () {
                return ze(this._mapPane) || new F(0, 0);
              },
              _moved: function () {
                var s = this._getMapPanePos();
                return s && !s.equals([0, 0]);
              },
              _getTopLeftPoint: function (s, r) {
                var h =
                  s && r !== void 0
                    ? this._getNewPixelOrigin(s, r)
                    : this.getPixelOrigin();
                return h.subtract(this._getMapPanePos());
              },
              _getNewPixelOrigin: function (s, r) {
                var h = this.getSize()._divideBy(2);
                return this.project(s, r)
                  ._subtract(h)
                  ._add(this._getMapPanePos())
                  ._round();
              },
              _latLngToNewLayerPoint: function (s, r, h) {
                var f = this._getNewPixelOrigin(h, r);
                return this.project(s, r)._subtract(f);
              },
              _latLngBoundsToNewLayerBounds: function (s, r, h) {
                var f = this._getNewPixelOrigin(h, r);
                return mt([
                  this.project(s.getSouthWest(), r)._subtract(f),
                  this.project(s.getNorthWest(), r)._subtract(f),
                  this.project(s.getSouthEast(), r)._subtract(f),
                  this.project(s.getNorthEast(), r)._subtract(f),
                ]);
              },
              _getCenterLayerPoint: function () {
                return this.containerPointToLayerPoint(
                  this.getSize()._divideBy(2),
                );
              },
              _getCenterOffset: function (s) {
                return this.latLngToLayerPoint(s).subtract(
                  this._getCenterLayerPoint(),
                );
              },
              _limitCenter: function (s, r, h) {
                if (!h) return s;
                var f = this.project(s, r),
                  g = this.getSize().divideBy(2),
                  y = new nt(f.subtract(g), f.add(g)),
                  P = this._getBoundsOffset(y, h, r);
                return Math.abs(P.x) <= 1 && Math.abs(P.y) <= 1
                  ? s
                  : this.unproject(f.add(P), r);
              },
              _limitOffset: function (s, r) {
                if (!r) return s;
                var h = this.getPixelBounds(),
                  f = new nt(h.min.add(s), h.max.add(s));
                return s.add(this._getBoundsOffset(f, r));
              },
              _getBoundsOffset: function (s, r, h) {
                var f = mt(
                    this.project(r.getNorthEast(), h),
                    this.project(r.getSouthWest(), h),
                  ),
                  g = f.min.subtract(s.min),
                  y = f.max.subtract(s.max),
                  P = this._rebound(g.x, -y.x),
                  S = this._rebound(g.y, -y.y);
                return new F(P, S);
              },
              _rebound: function (s, r) {
                return s + r > 0
                  ? Math.round(s - r) / 2
                  : Math.max(0, Math.ceil(s)) - Math.max(0, Math.floor(r));
              },
              _limitZoom: function (s) {
                var r = this.getMinZoom(),
                  h = this.getMaxZoom(),
                  f = Z.any3d ? this.options.zoomSnap : 1;
                return (
                  f && (s = Math.round(s / f) * f),
                  Math.max(r, Math.min(h, s))
                );
              },
              _onPanTransitionStep: function () {
                this.fire("move");
              },
              _onPanTransitionEnd: function () {
                (Pt(this._mapPane, "leaflet-pan-anim"), this.fire("moveend"));
              },
              _tryAnimatedPan: function (s, r) {
                var h = this._getCenterOffset(s)._trunc();
                return (r && r.animate) !== !0 && !this.getSize().contains(h)
                  ? !1
                  : (this.panBy(h, r), !0);
              },
              _createAnimProxy: function () {
                var s = (this._proxy = at(
                  "div",
                  "leaflet-proxy leaflet-zoom-animated",
                ));
                (this._panes.mapPane.appendChild(s),
                  this.on(
                    "zoomanim",
                    function (r) {
                      var h = Ps,
                        f = this._proxy.style[h];
                      (Re(
                        this._proxy,
                        this.project(r.center, r.zoom),
                        this.getZoomScale(r.zoom, 1),
                      ),
                        f === this._proxy.style[h] &&
                          this._animatingZoom &&
                          this._onZoomTransitionEnd());
                    },
                    this,
                  ),
                  this.on("load moveend", this._animMoveEnd, this),
                  this._on("unload", this._destroyAnimProxy, this));
              },
              _destroyAnimProxy: function () {
                (bt(this._proxy),
                  this.off("load moveend", this._animMoveEnd, this),
                  delete this._proxy);
              },
              _animMoveEnd: function () {
                var s = this.getCenter(),
                  r = this.getZoom();
                Re(this._proxy, this.project(s, r), this.getZoomScale(r, 1));
              },
              _catchTransitionEnd: function (s) {
                this._animatingZoom &&
                  s.propertyName.indexOf("transform") >= 0 &&
                  this._onZoomTransitionEnd();
              },
              _nothingToAnimate: function () {
                return !this._container.getElementsByClassName(
                  "leaflet-zoom-animated",
                ).length;
              },
              _tryAnimatedZoom: function (s, r, h) {
                if (this._animatingZoom) return !0;
                if (
                  ((h = h || {}),
                  !this._zoomAnimated ||
                    h.animate === !1 ||
                    this._nothingToAnimate() ||
                    Math.abs(r - this._zoom) >
                      this.options.zoomAnimationThreshold)
                )
                  return !1;
                var f = this.getZoomScale(r),
                  g = this._getCenterOffset(s)._divideBy(1 - 1 / f);
                return h.animate !== !0 && !this.getSize().contains(g)
                  ? !1
                  : (W(function () {
                      this._moveStart(!0, h.noMoveStart || !1)._animateZoom(
                        s,
                        r,
                        !0,
                      );
                    }, this),
                    !0);
              },
              _animateZoom: function (s, r, h, f) {
                this._mapPane &&
                  (h &&
                    ((this._animatingZoom = !0),
                    (this._animateToCenter = s),
                    (this._animateToZoom = r),
                    X(this._mapPane, "leaflet-zoom-anim")),
                  this.fire("zoomanim", { center: s, zoom: r, noUpdate: f }),
                  this._tempFireZoomEvent ||
                    (this._tempFireZoomEvent =
                      this._zoom !== this._animateToZoom),
                  this._move(
                    this._animateToCenter,
                    this._animateToZoom,
                    void 0,
                    !0,
                  ),
                  setTimeout(l(this._onZoomTransitionEnd, this), 250));
              },
              _onZoomTransitionEnd: function () {
                this._animatingZoom &&
                  (this._mapPane && Pt(this._mapPane, "leaflet-zoom-anim"),
                  (this._animatingZoom = !1),
                  this._move(
                    this._animateToCenter,
                    this._animateToZoom,
                    void 0,
                    !0,
                  ),
                  this._tempFireZoomEvent && this.fire("zoom"),
                  delete this._tempFireZoomEvent,
                  this.fire("move"),
                  this._moveEnd(!0));
              },
            });
          function fu(s, r) {
            return new ot(s, r);
          }
          var Gt = ut.extend({
              options: { position: "topright" },
              initialize: function (s) {
                b(this, s);
              },
              getPosition: function () {
                return this.options.position;
              },
              setPosition: function (s) {
                var r = this._map;
                return (
                  r && r.removeControl(this),
                  (this.options.position = s),
                  r && r.addControl(this),
                  this
                );
              },
              getContainer: function () {
                return this._container;
              },
              addTo: function (s) {
                (this.remove(), (this._map = s));
                var r = (this._container = this.onAdd(s)),
                  h = this.getPosition(),
                  f = s._controlCorners[h];
                return (
                  X(r, "leaflet-control"),
                  h.indexOf("bottom") !== -1
                    ? f.insertBefore(r, f.firstChild)
                    : f.appendChild(r),
                  this._map.on("unload", this.remove, this),
                  this
                );
              },
              remove: function () {
                return this._map
                  ? (bt(this._container),
                    this.onRemove && this.onRemove(this._map),
                    this._map.off("unload", this.remove, this),
                    (this._map = null),
                    this)
                  : this;
              },
              _refocusOnMap: function (s) {
                this._map &&
                  s &&
                  s.screenX > 0 &&
                  s.screenY > 0 &&
                  this._map.getContainer().focus();
              },
            }),
            Pi = function (s) {
              return new Gt(s);
            };
          ot.include({
            addControl: function (s) {
              return (s.addTo(this), this);
            },
            removeControl: function (s) {
              return (s.remove(), this);
            },
            _initControlPos: function () {
              var s = (this._controlCorners = {}),
                r = "leaflet-",
                h = (this._controlContainer = at(
                  "div",
                  r + "control-container",
                  this._container,
                ));
              function f(g, y) {
                var P = r + g + " " + r + y;
                s[g + y] = at("div", P, h);
              }
              (f("top", "left"),
                f("top", "right"),
                f("bottom", "left"),
                f("bottom", "right"));
            },
            _clearControlPos: function () {
              for (var s in this._controlCorners) bt(this._controlCorners[s]);
              (bt(this._controlContainer),
                delete this._controlCorners,
                delete this._controlContainer);
            },
          });
          var Dr = Gt.extend({
              options: {
                collapsed: !0,
                position: "topright",
                autoZIndex: !0,
                hideSingleBase: !1,
                sortLayers: !1,
                sortFunction: function (s, r, h, f) {
                  return h < f ? -1 : f < h ? 1 : 0;
                },
              },
              initialize: function (s, r, h) {
                (b(this, h),
                  (this._layerControlInputs = []),
                  (this._layers = []),
                  (this._lastZIndex = 0),
                  (this._handlingClick = !1),
                  (this._preventClick = !1));
                for (var f in s) this._addLayer(s[f], f);
                for (f in r) this._addLayer(r[f], f, !0);
              },
              onAdd: function (s) {
                (this._initLayout(),
                  this._update(),
                  (this._map = s),
                  s.on("zoomend", this._checkDisabledLayers, this));
                for (var r = 0; r < this._layers.length; r++)
                  this._layers[r].layer.on(
                    "add remove",
                    this._onLayerChange,
                    this,
                  );
                return this._container;
              },
              addTo: function (s) {
                return (
                  Gt.prototype.addTo.call(this, s),
                  this._expandIfNotCollapsed()
                );
              },
              onRemove: function () {
                this._map.off("zoomend", this._checkDisabledLayers, this);
                for (var s = 0; s < this._layers.length; s++)
                  this._layers[s].layer.off(
                    "add remove",
                    this._onLayerChange,
                    this,
                  );
              },
              addBaseLayer: function (s, r) {
                return (
                  this._addLayer(s, r),
                  this._map ? this._update() : this
                );
              },
              addOverlay: function (s, r) {
                return (
                  this._addLayer(s, r, !0),
                  this._map ? this._update() : this
                );
              },
              removeLayer: function (s) {
                s.off("add remove", this._onLayerChange, this);
                var r = this._getLayer(u(s));
                return (
                  r && this._layers.splice(this._layers.indexOf(r), 1),
                  this._map ? this._update() : this
                );
              },
              expand: function () {
                (X(this._container, "leaflet-control-layers-expanded"),
                  (this._section.style.height = null));
                var s =
                  this._map.getSize().y - (this._container.offsetTop + 50);
                return (
                  s < this._section.clientHeight
                    ? (X(this._section, "leaflet-control-layers-scrollbar"),
                      (this._section.style.height = s + "px"))
                    : Pt(this._section, "leaflet-control-layers-scrollbar"),
                  this._checkDisabledLayers(),
                  this
                );
              },
              collapse: function () {
                return (
                  Pt(this._container, "leaflet-control-layers-expanded"),
                  this
                );
              },
              _initLayout: function () {
                var s = "leaflet-control-layers",
                  r = (this._container = at("div", s)),
                  h = this.options.collapsed;
                (r.setAttribute("aria-haspopup", !0), wi(r), Ds(r));
                var f = (this._section = at("section", s + "-list"));
                h &&
                  (this._map.on("click", this.collapse, this),
                  K(
                    r,
                    {
                      mouseenter: this._expandSafely,
                      mouseleave: this.collapse,
                    },
                    this,
                  ));
                var g = (this._layersLink = at("a", s + "-toggle", r));
                ((g.href = "#"),
                  (g.title = "Layers"),
                  g.setAttribute("role", "button"),
                  K(
                    g,
                    {
                      keydown: function (y) {
                        y.keyCode === 13 && this._expandSafely();
                      },
                      click: function (y) {
                        (At(y), this._expandSafely());
                      },
                    },
                    this,
                  ),
                  h || this.expand(),
                  (this._baseLayersList = at("div", s + "-base", f)),
                  (this._separator = at("div", s + "-separator", f)),
                  (this._overlaysList = at("div", s + "-overlays", f)),
                  r.appendChild(f));
              },
              _getLayer: function (s) {
                for (var r = 0; r < this._layers.length; r++)
                  if (this._layers[r] && u(this._layers[r].layer) === s)
                    return this._layers[r];
              },
              _addLayer: function (s, r, h) {
                (this._map && s.on("add remove", this._onLayerChange, this),
                  this._layers.push({ layer: s, name: r, overlay: h }),
                  this.options.sortLayers &&
                    this._layers.sort(
                      l(function (f, g) {
                        return this.options.sortFunction(
                          f.layer,
                          g.layer,
                          f.name,
                          g.name,
                        );
                      }, this),
                    ),
                  this.options.autoZIndex &&
                    s.setZIndex &&
                    (this._lastZIndex++, s.setZIndex(this._lastZIndex)),
                  this._expandIfNotCollapsed());
              },
              _update: function () {
                if (!this._container) return this;
                (on(this._baseLayersList),
                  on(this._overlaysList),
                  (this._layerControlInputs = []));
                var s,
                  r,
                  h,
                  f,
                  g = 0;
                for (h = 0; h < this._layers.length; h++)
                  ((f = this._layers[h]),
                    this._addItem(f),
                    (r = r || f.overlay),
                    (s = s || !f.overlay),
                    (g += f.overlay ? 0 : 1));
                return (
                  this.options.hideSingleBase &&
                    ((s = s && g > 1),
                    (this._baseLayersList.style.display = s ? "" : "none")),
                  (this._separator.style.display = r && s ? "" : "none"),
                  this
                );
              },
              _onLayerChange: function (s) {
                this._handlingClick || this._update();
                var r = this._getLayer(u(s.target)),
                  h = r.overlay
                    ? s.type === "add"
                      ? "overlayadd"
                      : "overlayremove"
                    : s.type === "add"
                      ? "baselayerchange"
                      : null;
                h && this._map.fire(h, r);
              },
              _createRadioElement: function (s, r) {
                var h =
                    '<input type="radio" class="leaflet-control-layers-selector" name="' +
                    s +
                    '"' +
                    (r ? ' checked="checked"' : "") +
                    "/>",
                  f = document.createElement("div");
                return ((f.innerHTML = h), f.firstChild);
              },
              _addItem: function (s) {
                var r = document.createElement("label"),
                  h = this._map.hasLayer(s.layer),
                  f;
                (s.overlay
                  ? ((f = document.createElement("input")),
                    (f.type = "checkbox"),
                    (f.className = "leaflet-control-layers-selector"),
                    (f.defaultChecked = h))
                  : (f = this._createRadioElement(
                      "leaflet-base-layers_" + u(this),
                      h,
                    )),
                  this._layerControlInputs.push(f),
                  (f.layerId = u(s.layer)),
                  K(f, "click", this._onInputClick, this));
                var g = document.createElement("span");
                g.innerHTML = " " + s.name;
                var y = document.createElement("span");
                (r.appendChild(y), y.appendChild(f), y.appendChild(g));
                var P = s.overlay ? this._overlaysList : this._baseLayersList;
                return (P.appendChild(r), this._checkDisabledLayers(), r);
              },
              _onInputClick: function () {
                if (!this._preventClick) {
                  var s = this._layerControlInputs,
                    r,
                    h,
                    f = [],
                    g = [];
                  this._handlingClick = !0;
                  for (var y = s.length - 1; y >= 0; y--)
                    ((r = s[y]),
                      (h = this._getLayer(r.layerId).layer),
                      r.checked ? f.push(h) : r.checked || g.push(h));
                  for (y = 0; y < g.length; y++)
                    this._map.hasLayer(g[y]) && this._map.removeLayer(g[y]);
                  for (y = 0; y < f.length; y++)
                    this._map.hasLayer(f[y]) || this._map.addLayer(f[y]);
                  ((this._handlingClick = !1), this._refocusOnMap());
                }
              },
              _checkDisabledLayers: function () {
                for (
                  var s = this._layerControlInputs,
                    r,
                    h,
                    f = this._map.getZoom(),
                    g = s.length - 1;
                  g >= 0;
                  g--
                )
                  ((r = s[g]),
                    (h = this._getLayer(r.layerId).layer),
                    (r.disabled =
                      (h.options.minZoom !== void 0 && f < h.options.minZoom) ||
                      (h.options.maxZoom !== void 0 && f > h.options.maxZoom)));
              },
              _expandIfNotCollapsed: function () {
                return (
                  this._map && !this.options.collapsed && this.expand(),
                  this
                );
              },
              _expandSafely: function () {
                var s = this._section;
                ((this._preventClick = !0), K(s, "click", At), this.expand());
                var r = this;
                setTimeout(function () {
                  (dt(s, "click", At), (r._preventClick = !1));
                });
              },
            }),
            pu = function (s, r, h) {
              return new Dr(s, r, h);
            },
            zs = Gt.extend({
              options: {
                position: "topleft",
                zoomInText: '<span aria-hidden="true">+</span>',
                zoomInTitle: "Zoom in",
                zoomOutText: '<span aria-hidden="true">&#x2212;</span>',
                zoomOutTitle: "Zoom out",
              },
              onAdd: function (s) {
                var r = "leaflet-control-zoom",
                  h = at("div", r + " leaflet-bar"),
                  f = this.options;
                return (
                  (this._zoomInButton = this._createButton(
                    f.zoomInText,
                    f.zoomInTitle,
                    r + "-in",
                    h,
                    this._zoomIn,
                  )),
                  (this._zoomOutButton = this._createButton(
                    f.zoomOutText,
                    f.zoomOutTitle,
                    r + "-out",
                    h,
                    this._zoomOut,
                  )),
                  this._updateDisabled(),
                  s.on("zoomend zoomlevelschange", this._updateDisabled, this),
                  h
                );
              },
              onRemove: function (s) {
                s.off("zoomend zoomlevelschange", this._updateDisabled, this);
              },
              disable: function () {
                return ((this._disabled = !0), this._updateDisabled(), this);
              },
              enable: function () {
                return ((this._disabled = !1), this._updateDisabled(), this);
              },
              _zoomIn: function (s) {
                !this._disabled &&
                  this._map._zoom < this._map.getMaxZoom() &&
                  this._map.zoomIn(
                    this._map.options.zoomDelta * (s.shiftKey ? 3 : 1),
                  );
              },
              _zoomOut: function (s) {
                !this._disabled &&
                  this._map._zoom > this._map.getMinZoom() &&
                  this._map.zoomOut(
                    this._map.options.zoomDelta * (s.shiftKey ? 3 : 1),
                  );
              },
              _createButton: function (s, r, h, f, g) {
                var y = at("a", h, f);
                return (
                  (y.innerHTML = s),
                  (y.href = "#"),
                  (y.title = r),
                  y.setAttribute("role", "button"),
                  y.setAttribute("aria-label", r),
                  wi(y),
                  K(y, "click", Fe),
                  K(y, "click", g, this),
                  K(y, "click", this._refocusOnMap, this),
                  y
                );
              },
              _updateDisabled: function () {
                var s = this._map,
                  r = "leaflet-disabled";
                (Pt(this._zoomInButton, r),
                  Pt(this._zoomOutButton, r),
                  this._zoomInButton.setAttribute("aria-disabled", "false"),
                  this._zoomOutButton.setAttribute("aria-disabled", "false"),
                  (this._disabled || s._zoom === s.getMinZoom()) &&
                    (X(this._zoomOutButton, r),
                    this._zoomOutButton.setAttribute("aria-disabled", "true")),
                  (this._disabled || s._zoom === s.getMaxZoom()) &&
                    (X(this._zoomInButton, r),
                    this._zoomInButton.setAttribute("aria-disabled", "true")));
              },
            });
          (ot.mergeOptions({ zoomControl: !0 }),
            ot.addInitHook(function () {
              this.options.zoomControl &&
                ((this.zoomControl = new zs()),
                this.addControl(this.zoomControl));
            }));
          var gu = function (s) {
              return new zs(s);
            },
            Rr = Gt.extend({
              options: {
                position: "bottomleft",
                maxWidth: 100,
                metric: !0,
                imperial: !0,
              },
              onAdd: function (s) {
                var r = "leaflet-control-scale",
                  h = at("div", r),
                  f = this.options;
                return (
                  this._addScales(f, r + "-line", h),
                  s.on(
                    f.updateWhenIdle ? "moveend" : "move",
                    this._update,
                    this,
                  ),
                  s.whenReady(this._update, this),
                  h
                );
              },
              onRemove: function (s) {
                s.off(
                  this.options.updateWhenIdle ? "moveend" : "move",
                  this._update,
                  this,
                );
              },
              _addScales: function (s, r, h) {
                (s.metric && (this._mScale = at("div", r, h)),
                  s.imperial && (this._iScale = at("div", r, h)));
              },
              _update: function () {
                var s = this._map,
                  r = s.getSize().y / 2,
                  h = s.distance(
                    s.containerPointToLatLng([0, r]),
                    s.containerPointToLatLng([this.options.maxWidth, r]),
                  );
                this._updateScales(h);
              },
              _updateScales: function (s) {
                (this.options.metric && s && this._updateMetric(s),
                  this.options.imperial && s && this._updateImperial(s));
              },
              _updateMetric: function (s) {
                var r = this._getRoundNum(s),
                  h = r < 1e3 ? r + " m" : r / 1e3 + " km";
                this._updateScale(this._mScale, h, r / s);
              },
              _updateImperial: function (s) {
                var r = s * 3.2808399,
                  h,
                  f,
                  g;
                r > 5280
                  ? ((h = r / 5280),
                    (f = this._getRoundNum(h)),
                    this._updateScale(this._iScale, f + " mi", f / h))
                  : ((g = this._getRoundNum(r)),
                    this._updateScale(this._iScale, g + " ft", g / r));
              },
              _updateScale: function (s, r, h) {
                ((s.style.width = Math.round(this.options.maxWidth * h) + "px"),
                  (s.innerHTML = r));
              },
              _getRoundNum: function (s) {
                var r = Math.pow(10, (Math.floor(s) + "").length - 1),
                  h = s / r;
                return (
                  (h = h >= 10 ? 10 : h >= 5 ? 5 : h >= 3 ? 3 : h >= 2 ? 2 : 1),
                  r * h
                );
              },
            }),
            mu = function (s) {
              return new Rr(s);
            },
            _u =
              '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" class="leaflet-attribution-flag"><path fill="#4C7BE1" d="M0 0h12v4H0z"/><path fill="#FFD500" d="M0 4h12v3H0z"/><path fill="#E0BC00" d="M0 7h12v1H0z"/></svg>',
            Ns = Gt.extend({
              options: {
                position: "bottomright",
                prefix:
                  '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">' +
                  (Z.inlineSvg ? _u + " " : "") +
                  "Leaflet</a>",
              },
              initialize: function (s) {
                (b(this, s), (this._attributions = {}));
              },
              onAdd: function (s) {
                ((s.attributionControl = this),
                  (this._container = at("div", "leaflet-control-attribution")),
                  wi(this._container));
                for (var r in s._layers)
                  s._layers[r].getAttribution &&
                    this.addAttribution(s._layers[r].getAttribution());
                return (
                  this._update(),
                  s.on("layeradd", this._addAttribution, this),
                  this._container
                );
              },
              onRemove: function (s) {
                s.off("layeradd", this._addAttribution, this);
              },
              _addAttribution: function (s) {
                s.layer.getAttribution &&
                  (this.addAttribution(s.layer.getAttribution()),
                  s.layer.once(
                    "remove",
                    function () {
                      this.removeAttribution(s.layer.getAttribution());
                    },
                    this,
                  ));
              },
              setPrefix: function (s) {
                return ((this.options.prefix = s), this._update(), this);
              },
              addAttribution: function (s) {
                return s
                  ? (this._attributions[s] || (this._attributions[s] = 0),
                    this._attributions[s]++,
                    this._update(),
                    this)
                  : this;
              },
              removeAttribution: function (s) {
                return s
                  ? (this._attributions[s] &&
                      (this._attributions[s]--, this._update()),
                    this)
                  : this;
              },
              _update: function () {
                if (this._map) {
                  var s = [];
                  for (var r in this._attributions)
                    this._attributions[r] && s.push(r);
                  var h = [];
                  (this.options.prefix && h.push(this.options.prefix),
                    s.length && h.push(s.join(", ")),
                    (this._container.innerHTML = h.join(
                      ' <span aria-hidden="true">|</span> ',
                    )));
                }
              },
            });
          (ot.mergeOptions({ attributionControl: !0 }),
            ot.addInitHook(function () {
              this.options.attributionControl && new Ns().addTo(this);
            }));
          var yu = function (s) {
            return new Ns(s);
          };
          ((Gt.Layers = Dr),
            (Gt.Zoom = zs),
            (Gt.Scale = Rr),
            (Gt.Attribution = Ns),
            (Pi.layers = pu),
            (Pi.zoom = gu),
            (Pi.scale = mu),
            (Pi.attribution = yu));
          var ee = ut.extend({
            initialize: function (s) {
              this._map = s;
            },
            enable: function () {
              return this._enabled
                ? this
                : ((this._enabled = !0), this.addHooks(), this);
            },
            disable: function () {
              return this._enabled
                ? ((this._enabled = !1), this.removeHooks(), this)
                : this;
            },
            enabled: function () {
              return !!this._enabled;
            },
          });
          ee.addTo = function (s, r) {
            return (s.addHandler(r, this), this);
          };
          var vu = { Events: Y },
            zr = Z.touch ? "touchstart mousedown" : "mousedown",
            Pe = ct.extend({
              options: { clickTolerance: 3 },
              initialize: function (s, r, h, f) {
                (b(this, f),
                  (this._element = s),
                  (this._dragStartTarget = r || s),
                  (this._preventOutline = h));
              },
              enable: function () {
                this._enabled ||
                  (K(this._dragStartTarget, zr, this._onDown, this),
                  (this._enabled = !0));
              },
              disable: function () {
                this._enabled &&
                  (Pe._dragging === this && this.finishDrag(!0),
                  dt(this._dragStartTarget, zr, this._onDown, this),
                  (this._enabled = !1),
                  (this._moved = !1));
              },
              _onDown: function (s) {
                if (
                  this._enabled &&
                  ((this._moved = !1), !ks(this._element, "leaflet-zoom-anim"))
                ) {
                  if (s.touches && s.touches.length !== 1) {
                    Pe._dragging === this && this.finishDrag();
                    return;
                  }
                  if (
                    !(
                      Pe._dragging ||
                      s.shiftKey ||
                      (s.which !== 1 && s.button !== 1 && !s.touches)
                    ) &&
                    ((Pe._dragging = this),
                    this._preventOutline && Es(this._element),
                    Ls(),
                    vi(),
                    !this._moving)
                  ) {
                    this.fire("down");
                    var r = s.touches ? s.touches[0] : s,
                      h = Tr(this._element);
                    ((this._startPoint = new F(r.clientX, r.clientY)),
                      (this._startPos = ze(this._element)),
                      (this._parentScale = As(h)));
                    var f = s.type === "mousedown";
                    (K(
                      document,
                      f ? "mousemove" : "touchmove",
                      this._onMove,
                      this,
                    ),
                      K(
                        document,
                        f ? "mouseup" : "touchend touchcancel",
                        this._onUp,
                        this,
                      ));
                  }
                }
              },
              _onMove: function (s) {
                if (this._enabled) {
                  if (s.touches && s.touches.length > 1) {
                    this._moved = !0;
                    return;
                  }
                  var r =
                      s.touches && s.touches.length === 1 ? s.touches[0] : s,
                    h = new F(r.clientX, r.clientY)._subtract(this._startPoint);
                  (!h.x && !h.y) ||
                    Math.abs(h.x) + Math.abs(h.y) <
                      this.options.clickTolerance ||
                    ((h.x /= this._parentScale.x),
                    (h.y /= this._parentScale.y),
                    At(s),
                    this._moved ||
                      (this.fire("dragstart"),
                      (this._moved = !0),
                      X(document.body, "leaflet-dragging"),
                      (this._lastTarget = s.target || s.srcElement),
                      window.SVGElementInstance &&
                        this._lastTarget instanceof window.SVGElementInstance &&
                        (this._lastTarget =
                          this._lastTarget.correspondingUseElement),
                      X(this._lastTarget, "leaflet-drag-target")),
                    (this._newPos = this._startPos.add(h)),
                    (this._moving = !0),
                    (this._lastEvent = s),
                    this._updatePosition());
                }
              },
              _updatePosition: function () {
                var s = { originalEvent: this._lastEvent };
                (this.fire("predrag", s),
                  St(this._element, this._newPos),
                  this.fire("drag", s));
              },
              _onUp: function () {
                this._enabled && this.finishDrag();
              },
              finishDrag: function (s) {
                (Pt(document.body, "leaflet-dragging"),
                  this._lastTarget &&
                    (Pt(this._lastTarget, "leaflet-drag-target"),
                    (this._lastTarget = null)),
                  dt(document, "mousemove touchmove", this._onMove, this),
                  dt(
                    document,
                    "mouseup touchend touchcancel",
                    this._onUp,
                    this,
                  ),
                  Cs(),
                  bi());
                var r = this._moved && this._moving;
                ((this._moving = !1),
                  (Pe._dragging = !1),
                  r &&
                    this.fire("dragend", {
                      noInertia: s,
                      distance: this._newPos.distanceTo(this._startPos),
                    }));
              },
            });
          function Nr(s, r, h) {
            var f,
              g = [1, 4, 2, 8],
              y,
              P,
              S,
              M,
              O,
              N,
              $,
              J;
            for (y = 0, N = s.length; y < N; y++) s[y]._code = He(s[y], r);
            for (S = 0; S < 4; S++) {
              for (
                $ = g[S], f = [], y = 0, N = s.length, P = N - 1;
                y < N;
                P = y++
              )
                ((M = s[y]),
                  (O = s[P]),
                  M._code & $
                    ? O._code & $ ||
                      ((J = hn(O, M, $, r, h)), (J._code = He(J, r)), f.push(J))
                    : (O._code & $ &&
                        ((J = hn(O, M, $, r, h)),
                        (J._code = He(J, r)),
                        f.push(J)),
                      f.push(M)));
              s = f;
            }
            return s;
          }
          function Fr(s, r) {
            var h, f, g, y, P, S, M, O, N;
            if (!s || s.length === 0) throw new Error("latlngs not passed");
            jt(s) ||
              (console.warn(
                "latlngs are not flat! Only the first ring will be used",
              ),
              (s = s[0]));
            var $ = G([0, 0]),
              J = Q(s),
              Rt =
                J.getNorthWest().distanceTo(J.getSouthWest()) *
                J.getNorthEast().distanceTo(J.getNorthWest());
            Rt < 1700 && ($ = Fs(s));
            var Tt = s.length,
              $t = [];
            for (h = 0; h < Tt; h++) {
              var zt = G(s[h]);
              $t.push(r.project(G([zt.lat - $.lat, zt.lng - $.lng])));
            }
            for (S = M = O = 0, h = 0, f = Tt - 1; h < Tt; f = h++)
              ((g = $t[h]),
                (y = $t[f]),
                (P = g.y * y.x - y.y * g.x),
                (M += (g.x + y.x) * P),
                (O += (g.y + y.y) * P),
                (S += P * 3));
            S === 0 ? (N = $t[0]) : (N = [M / S, O / S]);
            var ai = r.unproject(V(N));
            return G([ai.lat + $.lat, ai.lng + $.lng]);
          }
          function Fs(s) {
            for (var r = 0, h = 0, f = 0, g = 0; g < s.length; g++) {
              var y = G(s[g]);
              ((r += y.lat), (h += y.lng), f++);
            }
            return G([r / f, h / f]);
          }
          var bu = {
            __proto__: null,
            clipPolygon: Nr,
            polygonCenter: Fr,
            centroid: Fs,
          };
          function Hr(s, r) {
            if (!r || !s.length) return s.slice();
            var h = r * r;
            return ((s = Pu(s, h)), (s = wu(s, h)), s);
          }
          function Wr(s, r, h) {
            return Math.sqrt(ki(s, r, h, !0));
          }
          function xu(s, r, h) {
            return ki(s, r, h);
          }
          function wu(s, r) {
            var h = s.length,
              f = typeof Uint8Array < "u" ? Uint8Array : Array,
              g = new f(h);
            ((g[0] = g[h - 1] = 1), Hs(s, g, r, 0, h - 1));
            var y,
              P = [];
            for (y = 0; y < h; y++) g[y] && P.push(s[y]);
            return P;
          }
          function Hs(s, r, h, f, g) {
            var y = 0,
              P,
              S,
              M;
            for (S = f + 1; S <= g - 1; S++)
              ((M = ki(s[S], s[f], s[g], !0)), M > y && ((P = S), (y = M)));
            y > h && ((r[P] = 1), Hs(s, r, h, f, P), Hs(s, r, h, P, g));
          }
          function Pu(s, r) {
            for (var h = [s[0]], f = 1, g = 0, y = s.length; f < y; f++)
              ku(s[f], s[g]) > r && (h.push(s[f]), (g = f));
            return (g < y - 1 && h.push(s[y - 1]), h);
          }
          var Vr;
          function Zr(s, r, h, f, g) {
            var y = f ? Vr : He(s, h),
              P = He(r, h),
              S,
              M,
              O;
            for (Vr = P; ; ) {
              if (!(y | P)) return [s, r];
              if (y & P) return !1;
              ((S = y || P),
                (M = hn(s, r, S, h, g)),
                (O = He(M, h)),
                S === y ? ((s = M), (y = O)) : ((r = M), (P = O)));
            }
          }
          function hn(s, r, h, f, g) {
            var y = r.x - s.x,
              P = r.y - s.y,
              S = f.min,
              M = f.max,
              O,
              N;
            return (
              h & 8
                ? ((O = s.x + (y * (M.y - s.y)) / P), (N = M.y))
                : h & 4
                  ? ((O = s.x + (y * (S.y - s.y)) / P), (N = S.y))
                  : h & 2
                    ? ((O = M.x), (N = s.y + (P * (M.x - s.x)) / y))
                    : h & 1 && ((O = S.x), (N = s.y + (P * (S.x - s.x)) / y)),
              new F(O, N, g)
            );
          }
          function He(s, r) {
            var h = 0;
            return (
              s.x < r.min.x ? (h |= 1) : s.x > r.max.x && (h |= 2),
              s.y < r.min.y ? (h |= 4) : s.y > r.max.y && (h |= 8),
              h
            );
          }
          function ku(s, r) {
            var h = r.x - s.x,
              f = r.y - s.y;
            return h * h + f * f;
          }
          function ki(s, r, h, f) {
            var g = r.x,
              y = r.y,
              P = h.x - g,
              S = h.y - y,
              M = P * P + S * S,
              O;
            return (
              M > 0 &&
                ((O = ((s.x - g) * P + (s.y - y) * S) / M),
                O > 1
                  ? ((g = h.x), (y = h.y))
                  : O > 0 && ((g += P * O), (y += S * O))),
              (P = s.x - g),
              (S = s.y - y),
              f ? P * P + S * S : new F(g, y)
            );
          }
          function jt(s) {
            return (
              !E(s[0]) || (typeof s[0][0] != "object" && typeof s[0][0] < "u")
            );
          }
          function jr(s) {
            return (
              console.warn(
                "Deprecated use of _flat, please use L.LineUtil.isFlat instead.",
              ),
              jt(s)
            );
          }
          function $r(s, r) {
            var h, f, g, y, P, S, M, O;
            if (!s || s.length === 0) throw new Error("latlngs not passed");
            jt(s) ||
              (console.warn(
                "latlngs are not flat! Only the first ring will be used",
              ),
              (s = s[0]));
            var N = G([0, 0]),
              $ = Q(s),
              J =
                $.getNorthWest().distanceTo($.getSouthWest()) *
                $.getNorthEast().distanceTo($.getNorthWest());
            J < 1700 && (N = Fs(s));
            var Rt = s.length,
              Tt = [];
            for (h = 0; h < Rt; h++) {
              var $t = G(s[h]);
              Tt.push(r.project(G([$t.lat - N.lat, $t.lng - N.lng])));
            }
            for (h = 0, f = 0; h < Rt - 1; h++)
              f += Tt[h].distanceTo(Tt[h + 1]) / 2;
            if (f === 0) O = Tt[0];
            else
              for (h = 0, y = 0; h < Rt - 1; h++)
                if (
                  ((P = Tt[h]),
                  (S = Tt[h + 1]),
                  (g = P.distanceTo(S)),
                  (y += g),
                  y > f)
                ) {
                  ((M = (y - f) / g),
                    (O = [S.x - M * (S.x - P.x), S.y - M * (S.y - P.y)]));
                  break;
                }
            var zt = r.unproject(V(O));
            return G([zt.lat + N.lat, zt.lng + N.lng]);
          }
          var Su = {
              __proto__: null,
              simplify: Hr,
              pointToSegmentDistance: Wr,
              closestPointOnSegment: xu,
              clipSegment: Zr,
              _getEdgeIntersection: hn,
              _getBitCode: He,
              _sqClosestPointOnSegment: ki,
              isFlat: jt,
              _flat: jr,
              polylineCenter: $r,
            },
            Ws = {
              project: function (s) {
                return new F(s.lng, s.lat);
              },
              unproject: function (s) {
                return new st(s.y, s.x);
              },
              bounds: new nt([-180, -90], [180, 90]),
            },
            Vs = {
              R: 6378137,
              R_MINOR: 6356752314245179e-9,
              bounds: new nt(
                [-2003750834279e-5, -1549657073972e-5],
                [2003750834279e-5, 1876465623138e-5],
              ),
              project: function (s) {
                var r = Math.PI / 180,
                  h = this.R,
                  f = s.lat * r,
                  g = this.R_MINOR / h,
                  y = Math.sqrt(1 - g * g),
                  P = y * Math.sin(f),
                  S =
                    Math.tan(Math.PI / 4 - f / 2) /
                    Math.pow((1 - P) / (1 + P), y / 2);
                return (
                  (f = -h * Math.log(Math.max(S, 1e-10))),
                  new F(s.lng * r * h, f)
                );
              },
              unproject: function (s) {
                for (
                  var r = 180 / Math.PI,
                    h = this.R,
                    f = this.R_MINOR / h,
                    g = Math.sqrt(1 - f * f),
                    y = Math.exp(-s.y / h),
                    P = Math.PI / 2 - 2 * Math.atan(y),
                    S = 0,
                    M = 0.1,
                    O;
                  S < 15 && Math.abs(M) > 1e-7;
                  S++
                )
                  ((O = g * Math.sin(P)),
                    (O = Math.pow((1 - O) / (1 + O), g / 2)),
                    (M = Math.PI / 2 - 2 * Math.atan(y * O) - P),
                    (P += M));
                return new st(P * r, (s.x * r) / h);
              },
            },
            Mu = {
              __proto__: null,
              LonLat: Ws,
              Mercator: Vs,
              SphericalMercator: ps,
            },
            Lu = o({}, we, {
              code: "EPSG:3395",
              projection: Vs,
              transformation: (function () {
                var s = 0.5 / (Math.PI * Vs.R);
                return gi(s, 0.5, -s, 0.5);
              })(),
            }),
            Ur = o({}, we, {
              code: "EPSG:4326",
              projection: Ws,
              transformation: gi(1 / 180, 1, -1 / 180, 0.5),
            }),
            Cu = o({}, ce, {
              projection: Ws,
              transformation: gi(1, 0, -1, 0),
              scale: function (s) {
                return Math.pow(2, s);
              },
              zoom: function (s) {
                return Math.log(s) / Math.LN2;
              },
              distance: function (s, r) {
                var h = r.lng - s.lng,
                  f = r.lat - s.lat;
                return Math.sqrt(h * h + f * f);
              },
              infinite: !0,
            });
          ((ce.Earth = we),
            (ce.EPSG3395 = Lu),
            (ce.EPSG3857 = ms),
            (ce.EPSG900913 = Bh),
            (ce.EPSG4326 = Ur),
            (ce.Simple = Cu));
          var Kt = ct.extend({
            options: {
              pane: "overlayPane",
              attribution: null,
              bubblingMouseEvents: !0,
            },
            addTo: function (s) {
              return (s.addLayer(this), this);
            },
            remove: function () {
              return this.removeFrom(this._map || this._mapToAdd);
            },
            removeFrom: function (s) {
              return (s && s.removeLayer(this), this);
            },
            getPane: function (s) {
              return this._map.getPane(
                s ? this.options[s] || s : this.options.pane,
              );
            },
            addInteractiveTarget: function (s) {
              return ((this._map._targets[u(s)] = this), this);
            },
            removeInteractiveTarget: function (s) {
              return (delete this._map._targets[u(s)], this);
            },
            getAttribution: function () {
              return this.options.attribution;
            },
            _layerAdd: function (s) {
              var r = s.target;
              if (r.hasLayer(this)) {
                if (
                  ((this._map = r),
                  (this._zoomAnimated = r._zoomAnimated),
                  this.getEvents)
                ) {
                  var h = this.getEvents();
                  (r.on(h, this),
                    this.once(
                      "remove",
                      function () {
                        r.off(h, this);
                      },
                      this,
                    ));
                }
                (this.onAdd(r),
                  this.fire("add"),
                  r.fire("layeradd", { layer: this }));
              }
            },
          });
          ot.include({
            addLayer: function (s) {
              if (!s._layerAdd)
                throw new Error("The provided object is not a Layer.");
              var r = u(s);
              return this._layers[r]
                ? this
                : ((this._layers[r] = s),
                  (s._mapToAdd = this),
                  s.beforeAdd && s.beforeAdd(this),
                  this.whenReady(s._layerAdd, s),
                  this);
            },
            removeLayer: function (s) {
              var r = u(s);
              return this._layers[r]
                ? (this._loaded && s.onRemove(this),
                  delete this._layers[r],
                  this._loaded &&
                    (this.fire("layerremove", { layer: s }), s.fire("remove")),
                  (s._map = s._mapToAdd = null),
                  this)
                : this;
            },
            hasLayer: function (s) {
              return u(s) in this._layers;
            },
            eachLayer: function (s, r) {
              for (var h in this._layers) s.call(r, this._layers[h]);
              return this;
            },
            _addLayers: function (s) {
              s = s ? (E(s) ? s : [s]) : [];
              for (var r = 0, h = s.length; r < h; r++) this.addLayer(s[r]);
            },
            _addZoomLimit: function (s) {
              (!isNaN(s.options.maxZoom) || !isNaN(s.options.minZoom)) &&
                ((this._zoomBoundLayers[u(s)] = s), this._updateZoomLevels());
            },
            _removeZoomLimit: function (s) {
              var r = u(s);
              this._zoomBoundLayers[r] &&
                (delete this._zoomBoundLayers[r], this._updateZoomLevels());
            },
            _updateZoomLevels: function () {
              var s = 1 / 0,
                r = -1 / 0,
                h = this._getZoomSpan();
              for (var f in this._zoomBoundLayers) {
                var g = this._zoomBoundLayers[f].options;
                ((s = g.minZoom === void 0 ? s : Math.min(s, g.minZoom)),
                  (r = g.maxZoom === void 0 ? r : Math.max(r, g.maxZoom)));
              }
              ((this._layersMaxZoom = r === -1 / 0 ? void 0 : r),
                (this._layersMinZoom = s === 1 / 0 ? void 0 : s),
                h !== this._getZoomSpan() && this.fire("zoomlevelschange"),
                this.options.maxZoom === void 0 &&
                  this._layersMaxZoom &&
                  this.getZoom() > this._layersMaxZoom &&
                  this.setZoom(this._layersMaxZoom),
                this.options.minZoom === void 0 &&
                  this._layersMinZoom &&
                  this.getZoom() < this._layersMinZoom &&
                  this.setZoom(this._layersMinZoom));
            },
          });
          var ii = Kt.extend({
              initialize: function (s, r) {
                (b(this, r), (this._layers = {}));
                var h, f;
                if (s)
                  for (h = 0, f = s.length; h < f; h++) this.addLayer(s[h]);
              },
              addLayer: function (s) {
                var r = this.getLayerId(s);
                return (
                  (this._layers[r] = s),
                  this._map && this._map.addLayer(s),
                  this
                );
              },
              removeLayer: function (s) {
                var r = s in this._layers ? s : this.getLayerId(s);
                return (
                  this._map &&
                    this._layers[r] &&
                    this._map.removeLayer(this._layers[r]),
                  delete this._layers[r],
                  this
                );
              },
              hasLayer: function (s) {
                var r = typeof s == "number" ? s : this.getLayerId(s);
                return r in this._layers;
              },
              clearLayers: function () {
                return this.eachLayer(this.removeLayer, this);
              },
              invoke: function (s) {
                var r = Array.prototype.slice.call(arguments, 1),
                  h,
                  f;
                for (h in this._layers)
                  ((f = this._layers[h]), f[s] && f[s].apply(f, r));
                return this;
              },
              onAdd: function (s) {
                this.eachLayer(s.addLayer, s);
              },
              onRemove: function (s) {
                this.eachLayer(s.removeLayer, s);
              },
              eachLayer: function (s, r) {
                for (var h in this._layers) s.call(r, this._layers[h]);
                return this;
              },
              getLayer: function (s) {
                return this._layers[s];
              },
              getLayers: function () {
                var s = [];
                return (this.eachLayer(s.push, s), s);
              },
              setZIndex: function (s) {
                return this.invoke("setZIndex", s);
              },
              getLayerId: function (s) {
                return u(s);
              },
            }),
            Tu = function (s, r) {
              return new ii(s, r);
            },
            he = ii.extend({
              addLayer: function (s) {
                return this.hasLayer(s)
                  ? this
                  : (s.addEventParent(this),
                    ii.prototype.addLayer.call(this, s),
                    this.fire("layeradd", { layer: s }));
              },
              removeLayer: function (s) {
                return this.hasLayer(s)
                  ? (s in this._layers && (s = this._layers[s]),
                    s.removeEventParent(this),
                    ii.prototype.removeLayer.call(this, s),
                    this.fire("layerremove", { layer: s }))
                  : this;
              },
              setStyle: function (s) {
                return this.invoke("setStyle", s);
              },
              bringToFront: function () {
                return this.invoke("bringToFront");
              },
              bringToBack: function () {
                return this.invoke("bringToBack");
              },
              getBounds: function () {
                var s = new vt();
                for (var r in this._layers) {
                  var h = this._layers[r];
                  s.extend(h.getBounds ? h.getBounds() : h.getLatLng());
                }
                return s;
              },
            }),
            Eu = function (s, r) {
              return new he(s, r);
            },
            ni = ut.extend({
              options: {
                popupAnchor: [0, 0],
                tooltipAnchor: [0, 0],
                crossOrigin: !1,
              },
              initialize: function (s) {
                b(this, s);
              },
              createIcon: function (s) {
                return this._createIcon("icon", s);
              },
              createShadow: function (s) {
                return this._createIcon("shadow", s);
              },
              _createIcon: function (s, r) {
                var h = this._getIconUrl(s);
                if (!h) {
                  if (s === "icon")
                    throw new Error(
                      "iconUrl not set in Icon options (see the docs).",
                    );
                  return null;
                }
                var f = this._createImg(h, r && r.tagName === "IMG" ? r : null);
                return (
                  this._setIconStyles(f, s),
                  (this.options.crossOrigin ||
                    this.options.crossOrigin === "") &&
                    (f.crossOrigin =
                      this.options.crossOrigin === !0
                        ? ""
                        : this.options.crossOrigin),
                  f
                );
              },
              _setIconStyles: function (s, r) {
                var h = this.options,
                  f = h[r + "Size"];
                typeof f == "number" && (f = [f, f]);
                var g = V(f),
                  y = V(
                    (r === "shadow" && h.shadowAnchor) ||
                      h.iconAnchor ||
                      (g && g.divideBy(2, !0)),
                  );
                ((s.className =
                  "leaflet-marker-" + r + " " + (h.className || "")),
                  y &&
                    ((s.style.marginLeft = -y.x + "px"),
                    (s.style.marginTop = -y.y + "px")),
                  g &&
                    ((s.style.width = g.x + "px"),
                    (s.style.height = g.y + "px")));
              },
              _createImg: function (s, r) {
                return (
                  (r = r || document.createElement("img")),
                  (r.src = s),
                  r
                );
              },
              _getIconUrl: function (s) {
                return (
                  (Z.retina && this.options[s + "RetinaUrl"]) ||
                  this.options[s + "Url"]
                );
              },
            });
          function Au(s) {
            return new ni(s);
          }
          var Si = ni.extend({
              options: {
                iconUrl: "marker-icon.png",
                iconRetinaUrl: "marker-icon-2x.png",
                shadowUrl: "marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                tooltipAnchor: [16, -28],
                shadowSize: [41, 41],
              },
              _getIconUrl: function (s) {
                return (
                  typeof Si.imagePath != "string" &&
                    (Si.imagePath = this._detectIconPath()),
                  (this.options.imagePath || Si.imagePath) +
                    ni.prototype._getIconUrl.call(this, s)
                );
              },
              _stripUrl: function (s) {
                var r = function (h, f, g) {
                  var y = f.exec(h);
                  return y && y[g];
                };
                return (
                  (s = r(s, /^url\((['"])?(.+)\1\)$/, 2)),
                  s && r(s, /^(.*)marker-icon\.png$/, 1)
                );
              },
              _detectIconPath: function () {
                var s = at("div", "leaflet-default-icon-path", document.body),
                  r = yi(s, "background-image") || yi(s, "backgroundImage");
                if ((document.body.removeChild(s), (r = this._stripUrl(r)), r))
                  return r;
                var h = document.querySelector('link[href$="leaflet.css"]');
                return h ? h.href.substring(0, h.href.length - 11 - 1) : "";
              },
            }),
            qr = ee.extend({
              initialize: function (s) {
                this._marker = s;
              },
              addHooks: function () {
                var s = this._marker._icon;
                (this._draggable || (this._draggable = new Pe(s, s, !0)),
                  this._draggable
                    .on(
                      {
                        dragstart: this._onDragStart,
                        predrag: this._onPreDrag,
                        drag: this._onDrag,
                        dragend: this._onDragEnd,
                      },
                      this,
                    )
                    .enable(),
                  X(s, "leaflet-marker-draggable"));
              },
              removeHooks: function () {
                (this._draggable
                  .off(
                    {
                      dragstart: this._onDragStart,
                      predrag: this._onPreDrag,
                      drag: this._onDrag,
                      dragend: this._onDragEnd,
                    },
                    this,
                  )
                  .disable(),
                  this._marker._icon &&
                    Pt(this._marker._icon, "leaflet-marker-draggable"));
              },
              moved: function () {
                return this._draggable && this._draggable._moved;
              },
              _adjustPan: function (s) {
                var r = this._marker,
                  h = r._map,
                  f = this._marker.options.autoPanSpeed,
                  g = this._marker.options.autoPanPadding,
                  y = ze(r._icon),
                  P = h.getPixelBounds(),
                  S = h.getPixelOrigin(),
                  M = mt(
                    P.min._subtract(S).add(g),
                    P.max._subtract(S).subtract(g),
                  );
                if (!M.contains(y)) {
                  var O = V(
                    (Math.max(M.max.x, y.x) - M.max.x) / (P.max.x - M.max.x) -
                      (Math.min(M.min.x, y.x) - M.min.x) / (P.min.x - M.min.x),
                    (Math.max(M.max.y, y.y) - M.max.y) / (P.max.y - M.max.y) -
                      (Math.min(M.min.y, y.y) - M.min.y) / (P.min.y - M.min.y),
                  ).multiplyBy(f);
                  (h.panBy(O, { animate: !1 }),
                    this._draggable._newPos._add(O),
                    this._draggable._startPos._add(O),
                    St(r._icon, this._draggable._newPos),
                    this._onDrag(s),
                    (this._panRequest = W(this._adjustPan.bind(this, s))));
                }
              },
              _onDragStart: function () {
                ((this._oldLatLng = this._marker.getLatLng()),
                  this._marker.closePopup && this._marker.closePopup(),
                  this._marker.fire("movestart").fire("dragstart"));
              },
              _onPreDrag: function (s) {
                this._marker.options.autoPan &&
                  (j(this._panRequest),
                  (this._panRequest = W(this._adjustPan.bind(this, s))));
              },
              _onDrag: function (s) {
                var r = this._marker,
                  h = r._shadow,
                  f = ze(r._icon),
                  g = r._map.layerPointToLatLng(f);
                (h && St(h, f),
                  (r._latlng = g),
                  (s.latlng = g),
                  (s.oldLatLng = this._oldLatLng),
                  r.fire("move", s).fire("drag", s));
              },
              _onDragEnd: function (s) {
                (j(this._panRequest),
                  delete this._oldLatLng,
                  this._marker.fire("moveend").fire("dragend", s));
              },
            }),
            un = Kt.extend({
              options: {
                icon: new Si(),
                interactive: !0,
                keyboard: !0,
                title: "",
                alt: "Marker",
                zIndexOffset: 0,
                opacity: 1,
                riseOnHover: !1,
                riseOffset: 250,
                pane: "markerPane",
                shadowPane: "shadowPane",
                bubblingMouseEvents: !1,
                autoPanOnFocus: !0,
                draggable: !1,
                autoPan: !1,
                autoPanPadding: [50, 50],
                autoPanSpeed: 10,
              },
              initialize: function (s, r) {
                (b(this, r), (this._latlng = G(s)));
              },
              onAdd: function (s) {
                ((this._zoomAnimated =
                  this._zoomAnimated && s.options.markerZoomAnimation),
                  this._zoomAnimated &&
                    s.on("zoomanim", this._animateZoom, this),
                  this._initIcon(),
                  this.update());
              },
              onRemove: function (s) {
                (this.dragging &&
                  this.dragging.enabled() &&
                  ((this.options.draggable = !0), this.dragging.removeHooks()),
                  delete this.dragging,
                  this._zoomAnimated &&
                    s.off("zoomanim", this._animateZoom, this),
                  this._removeIcon(),
                  this._removeShadow());
              },
              getEvents: function () {
                return { zoom: this.update, viewreset: this.update };
              },
              getLatLng: function () {
                return this._latlng;
              },
              setLatLng: function (s) {
                var r = this._latlng;
                return (
                  (this._latlng = G(s)),
                  this.update(),
                  this.fire("move", { oldLatLng: r, latlng: this._latlng })
                );
              },
              setZIndexOffset: function (s) {
                return ((this.options.zIndexOffset = s), this.update());
              },
              getIcon: function () {
                return this.options.icon;
              },
              setIcon: function (s) {
                return (
                  (this.options.icon = s),
                  this._map && (this._initIcon(), this.update()),
                  this._popup &&
                    this.bindPopup(this._popup, this._popup.options),
                  this
                );
              },
              getElement: function () {
                return this._icon;
              },
              update: function () {
                if (this._icon && this._map) {
                  var s = this._map.latLngToLayerPoint(this._latlng).round();
                  this._setPos(s);
                }
                return this;
              },
              _initIcon: function () {
                var s = this.options,
                  r =
                    "leaflet-zoom-" +
                    (this._zoomAnimated ? "animated" : "hide"),
                  h = s.icon.createIcon(this._icon),
                  f = !1;
                (h !== this._icon &&
                  (this._icon && this._removeIcon(),
                  (f = !0),
                  s.title && (h.title = s.title),
                  h.tagName === "IMG" && (h.alt = s.alt || "")),
                  X(h, r),
                  s.keyboard &&
                    ((h.tabIndex = "0"), h.setAttribute("role", "button")),
                  (this._icon = h),
                  s.riseOnHover &&
                    this.on({
                      mouseover: this._bringToFront,
                      mouseout: this._resetZIndex,
                    }),
                  this.options.autoPanOnFocus &&
                    K(h, "focus", this._panOnFocus, this));
                var g = s.icon.createShadow(this._shadow),
                  y = !1;
                (g !== this._shadow && (this._removeShadow(), (y = !0)),
                  g && (X(g, r), (g.alt = "")),
                  (this._shadow = g),
                  s.opacity < 1 && this._updateOpacity(),
                  f && this.getPane().appendChild(this._icon),
                  this._initInteraction(),
                  g &&
                    y &&
                    this.getPane(s.shadowPane).appendChild(this._shadow));
              },
              _removeIcon: function () {
                (this.options.riseOnHover &&
                  this.off({
                    mouseover: this._bringToFront,
                    mouseout: this._resetZIndex,
                  }),
                  this.options.autoPanOnFocus &&
                    dt(this._icon, "focus", this._panOnFocus, this),
                  bt(this._icon),
                  this.removeInteractiveTarget(this._icon),
                  (this._icon = null));
              },
              _removeShadow: function () {
                (this._shadow && bt(this._shadow), (this._shadow = null));
              },
              _setPos: function (s) {
                (this._icon && St(this._icon, s),
                  this._shadow && St(this._shadow, s),
                  (this._zIndex = s.y + this.options.zIndexOffset),
                  this._resetZIndex());
              },
              _updateZIndex: function (s) {
                this._icon && (this._icon.style.zIndex = this._zIndex + s);
              },
              _animateZoom: function (s) {
                var r = this._map
                  ._latLngToNewLayerPoint(this._latlng, s.zoom, s.center)
                  .round();
                this._setPos(r);
              },
              _initInteraction: function () {
                if (
                  this.options.interactive &&
                  (X(this._icon, "leaflet-interactive"),
                  this.addInteractiveTarget(this._icon),
                  qr)
                ) {
                  var s = this.options.draggable;
                  (this.dragging &&
                    ((s = this.dragging.enabled()), this.dragging.disable()),
                    (this.dragging = new qr(this)),
                    s && this.dragging.enable());
                }
              },
              setOpacity: function (s) {
                return (
                  (this.options.opacity = s),
                  this._map && this._updateOpacity(),
                  this
                );
              },
              _updateOpacity: function () {
                var s = this.options.opacity;
                (this._icon && Zt(this._icon, s),
                  this._shadow && Zt(this._shadow, s));
              },
              _bringToFront: function () {
                this._updateZIndex(this.options.riseOffset);
              },
              _resetZIndex: function () {
                this._updateZIndex(0);
              },
              _panOnFocus: function () {
                var s = this._map;
                if (s) {
                  var r = this.options.icon.options,
                    h = r.iconSize ? V(r.iconSize) : V(0, 0),
                    f = r.iconAnchor ? V(r.iconAnchor) : V(0, 0);
                  s.panInside(this._latlng, {
                    paddingTopLeft: f,
                    paddingBottomRight: h.subtract(f),
                  });
                }
              },
              _getPopupAnchor: function () {
                return this.options.icon.options.popupAnchor;
              },
              _getTooltipAnchor: function () {
                return this.options.icon.options.tooltipAnchor;
              },
            });
          function Ou(s, r) {
            return new un(s, r);
          }
          var ke = Kt.extend({
              options: {
                stroke: !0,
                color: "#3388ff",
                weight: 3,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
                dashArray: null,
                dashOffset: null,
                fill: !1,
                fillColor: null,
                fillOpacity: 0.2,
                fillRule: "evenodd",
                interactive: !0,
                bubblingMouseEvents: !0,
              },
              beforeAdd: function (s) {
                this._renderer = s.getRenderer(this);
              },
              onAdd: function () {
                (this._renderer._initPath(this),
                  this._reset(),
                  this._renderer._addPath(this));
              },
              onRemove: function () {
                this._renderer._removePath(this);
              },
              redraw: function () {
                return (this._map && this._renderer._updatePath(this), this);
              },
              setStyle: function (s) {
                return (
                  b(this, s),
                  this._renderer &&
                    (this._renderer._updateStyle(this),
                    this.options.stroke &&
                      s &&
                      Object.prototype.hasOwnProperty.call(s, "weight") &&
                      this._updateBounds()),
                  this
                );
              },
              bringToFront: function () {
                return (
                  this._renderer && this._renderer._bringToFront(this),
                  this
                );
              },
              bringToBack: function () {
                return (
                  this._renderer && this._renderer._bringToBack(this),
                  this
                );
              },
              getElement: function () {
                return this._path;
              },
              _reset: function () {
                (this._project(), this._update());
              },
              _clickTolerance: function () {
                return (
                  (this.options.stroke ? this.options.weight / 2 : 0) +
                  (this._renderer.options.tolerance || 0)
                );
              },
            }),
            dn = ke.extend({
              options: { fill: !0, radius: 10 },
              initialize: function (s, r) {
                (b(this, r),
                  (this._latlng = G(s)),
                  (this._radius = this.options.radius));
              },
              setLatLng: function (s) {
                var r = this._latlng;
                return (
                  (this._latlng = G(s)),
                  this.redraw(),
                  this.fire("move", { oldLatLng: r, latlng: this._latlng })
                );
              },
              getLatLng: function () {
                return this._latlng;
              },
              setRadius: function (s) {
                return (
                  (this.options.radius = this._radius = s),
                  this.redraw()
                );
              },
              getRadius: function () {
                return this._radius;
              },
              setStyle: function (s) {
                var r = (s && s.radius) || this._radius;
                return (
                  ke.prototype.setStyle.call(this, s),
                  this.setRadius(r),
                  this
                );
              },
              _project: function () {
                ((this._point = this._map.latLngToLayerPoint(this._latlng)),
                  this._updateBounds());
              },
              _updateBounds: function () {
                var s = this._radius,
                  r = this._radiusY || s,
                  h = this._clickTolerance(),
                  f = [s + h, r + h];
                this._pxBounds = new nt(
                  this._point.subtract(f),
                  this._point.add(f),
                );
              },
              _update: function () {
                this._map && this._updatePath();
              },
              _updatePath: function () {
                this._renderer._updateCircle(this);
              },
              _empty: function () {
                return (
                  this._radius &&
                  !this._renderer._bounds.intersects(this._pxBounds)
                );
              },
              _containsPoint: function (s) {
                return (
                  s.distanceTo(this._point) <=
                  this._radius + this._clickTolerance()
                );
              },
            });
          function Iu(s, r) {
            return new dn(s, r);
          }
          var Zs = dn.extend({
            initialize: function (s, r, h) {
              if (
                (typeof r == "number" && (r = o({}, h, { radius: r })),
                b(this, r),
                (this._latlng = G(s)),
                isNaN(this.options.radius))
              )
                throw new Error("Circle radius cannot be NaN");
              this._mRadius = this.options.radius;
            },
            setRadius: function (s) {
              return ((this._mRadius = s), this.redraw());
            },
            getRadius: function () {
              return this._mRadius;
            },
            getBounds: function () {
              var s = [this._radius, this._radiusY || this._radius];
              return new vt(
                this._map.layerPointToLatLng(this._point.subtract(s)),
                this._map.layerPointToLatLng(this._point.add(s)),
              );
            },
            setStyle: ke.prototype.setStyle,
            _project: function () {
              var s = this._latlng.lng,
                r = this._latlng.lat,
                h = this._map,
                f = h.options.crs;
              if (f.distance === we.distance) {
                var g = Math.PI / 180,
                  y = this._mRadius / we.R / g,
                  P = h.project([r + y, s]),
                  S = h.project([r - y, s]),
                  M = P.add(S).divideBy(2),
                  O = h.unproject(M).lat,
                  N =
                    Math.acos(
                      (Math.cos(y * g) - Math.sin(r * g) * Math.sin(O * g)) /
                        (Math.cos(r * g) * Math.cos(O * g)),
                    ) / g;
                ((isNaN(N) || N === 0) &&
                  (N = y / Math.cos((Math.PI / 180) * r)),
                  (this._point = M.subtract(h.getPixelOrigin())),
                  (this._radius = isNaN(N) ? 0 : M.x - h.project([O, s - N]).x),
                  (this._radiusY = M.y - P.y));
              } else {
                var $ = f.unproject(
                  f.project(this._latlng).subtract([this._mRadius, 0]),
                );
                ((this._point = h.latLngToLayerPoint(this._latlng)),
                  (this._radius = this._point.x - h.latLngToLayerPoint($).x));
              }
              this._updateBounds();
            },
          });
          function Bu(s, r, h) {
            return new Zs(s, r, h);
          }
          var ue = ke.extend({
            options: { smoothFactor: 1, noClip: !1 },
            initialize: function (s, r) {
              (b(this, r), this._setLatLngs(s));
            },
            getLatLngs: function () {
              return this._latlngs;
            },
            setLatLngs: function (s) {
              return (this._setLatLngs(s), this.redraw());
            },
            isEmpty: function () {
              return !this._latlngs.length;
            },
            closestLayerPoint: function (s) {
              for (
                var r = 1 / 0,
                  h = null,
                  f = ki,
                  g,
                  y,
                  P = 0,
                  S = this._parts.length;
                P < S;
                P++
              )
                for (var M = this._parts[P], O = 1, N = M.length; O < N; O++) {
                  ((g = M[O - 1]), (y = M[O]));
                  var $ = f(s, g, y, !0);
                  $ < r && ((r = $), (h = f(s, g, y)));
                }
              return (h && (h.distance = Math.sqrt(r)), h);
            },
            getCenter: function () {
              if (!this._map)
                throw new Error(
                  "Must add layer to map before using getCenter()",
                );
              return $r(this._defaultShape(), this._map.options.crs);
            },
            getBounds: function () {
              return this._bounds;
            },
            addLatLng: function (s, r) {
              return (
                (r = r || this._defaultShape()),
                (s = G(s)),
                r.push(s),
                this._bounds.extend(s),
                this.redraw()
              );
            },
            _setLatLngs: function (s) {
              ((this._bounds = new vt()),
                (this._latlngs = this._convertLatLngs(s)));
            },
            _defaultShape: function () {
              return jt(this._latlngs) ? this._latlngs : this._latlngs[0];
            },
            _convertLatLngs: function (s) {
              for (var r = [], h = jt(s), f = 0, g = s.length; f < g; f++)
                h
                  ? ((r[f] = G(s[f])), this._bounds.extend(r[f]))
                  : (r[f] = this._convertLatLngs(s[f]));
              return r;
            },
            _project: function () {
              var s = new nt();
              ((this._rings = []),
                this._projectLatlngs(this._latlngs, this._rings, s),
                this._bounds.isValid() &&
                  s.isValid() &&
                  ((this._rawPxBounds = s), this._updateBounds()));
            },
            _updateBounds: function () {
              var s = this._clickTolerance(),
                r = new F(s, s);
              this._rawPxBounds &&
                (this._pxBounds = new nt([
                  this._rawPxBounds.min.subtract(r),
                  this._rawPxBounds.max.add(r),
                ]));
            },
            _projectLatlngs: function (s, r, h) {
              var f = s[0] instanceof st,
                g = s.length,
                y,
                P;
              if (f) {
                for (P = [], y = 0; y < g; y++)
                  ((P[y] = this._map.latLngToLayerPoint(s[y])), h.extend(P[y]));
                r.push(P);
              } else for (y = 0; y < g; y++) this._projectLatlngs(s[y], r, h);
            },
            _clipPoints: function () {
              var s = this._renderer._bounds;
              if (
                ((this._parts = []),
                !(!this._pxBounds || !this._pxBounds.intersects(s)))
              ) {
                if (this.options.noClip) {
                  this._parts = this._rings;
                  return;
                }
                var r = this._parts,
                  h,
                  f,
                  g,
                  y,
                  P,
                  S,
                  M;
                for (h = 0, g = 0, y = this._rings.length; h < y; h++)
                  for (M = this._rings[h], f = 0, P = M.length; f < P - 1; f++)
                    ((S = Zr(M[f], M[f + 1], s, f, !0)),
                      S &&
                        ((r[g] = r[g] || []),
                        r[g].push(S[0]),
                        (S[1] !== M[f + 1] || f === P - 2) &&
                          (r[g].push(S[1]), g++)));
              }
            },
            _simplifyPoints: function () {
              for (
                var s = this._parts,
                  r = this.options.smoothFactor,
                  h = 0,
                  f = s.length;
                h < f;
                h++
              )
                s[h] = Hr(s[h], r);
            },
            _update: function () {
              this._map &&
                (this._clipPoints(),
                this._simplifyPoints(),
                this._updatePath());
            },
            _updatePath: function () {
              this._renderer._updatePoly(this);
            },
            _containsPoint: function (s, r) {
              var h,
                f,
                g,
                y,
                P,
                S,
                M = this._clickTolerance();
              if (!this._pxBounds || !this._pxBounds.contains(s)) return !1;
              for (h = 0, y = this._parts.length; h < y; h++)
                for (
                  S = this._parts[h], f = 0, P = S.length, g = P - 1;
                  f < P;
                  g = f++
                )
                  if (!(!r && f === 0) && Wr(s, S[g], S[f]) <= M) return !0;
              return !1;
            },
          });
          function Du(s, r) {
            return new ue(s, r);
          }
          ue._flat = jr;
          var si = ue.extend({
            options: { fill: !0 },
            isEmpty: function () {
              return !this._latlngs.length || !this._latlngs[0].length;
            },
            getCenter: function () {
              if (!this._map)
                throw new Error(
                  "Must add layer to map before using getCenter()",
                );
              return Fr(this._defaultShape(), this._map.options.crs);
            },
            _convertLatLngs: function (s) {
              var r = ue.prototype._convertLatLngs.call(this, s),
                h = r.length;
              return (
                h >= 2 &&
                  r[0] instanceof st &&
                  r[0].equals(r[h - 1]) &&
                  r.pop(),
                r
              );
            },
            _setLatLngs: function (s) {
              (ue.prototype._setLatLngs.call(this, s),
                jt(this._latlngs) && (this._latlngs = [this._latlngs]));
            },
            _defaultShape: function () {
              return jt(this._latlngs[0])
                ? this._latlngs[0]
                : this._latlngs[0][0];
            },
            _clipPoints: function () {
              var s = this._renderer._bounds,
                r = this.options.weight,
                h = new F(r, r);
              if (
                ((s = new nt(s.min.subtract(h), s.max.add(h))),
                (this._parts = []),
                !(!this._pxBounds || !this._pxBounds.intersects(s)))
              ) {
                if (this.options.noClip) {
                  this._parts = this._rings;
                  return;
                }
                for (var f = 0, g = this._rings.length, y; f < g; f++)
                  ((y = Nr(this._rings[f], s, !0)),
                    y.length && this._parts.push(y));
              }
            },
            _updatePath: function () {
              this._renderer._updatePoly(this, !0);
            },
            _containsPoint: function (s) {
              var r = !1,
                h,
                f,
                g,
                y,
                P,
                S,
                M,
                O;
              if (!this._pxBounds || !this._pxBounds.contains(s)) return !1;
              for (y = 0, M = this._parts.length; y < M; y++)
                for (
                  h = this._parts[y], P = 0, O = h.length, S = O - 1;
                  P < O;
                  S = P++
                )
                  ((f = h[P]),
                    (g = h[S]),
                    f.y > s.y != g.y > s.y &&
                      s.x < ((g.x - f.x) * (s.y - f.y)) / (g.y - f.y) + f.x &&
                      (r = !r));
              return r || ue.prototype._containsPoint.call(this, s, !0);
            },
          });
          function Ru(s, r) {
            return new si(s, r);
          }
          var de = he.extend({
            initialize: function (s, r) {
              (b(this, r), (this._layers = {}), s && this.addData(s));
            },
            addData: function (s) {
              var r = E(s) ? s : s.features,
                h,
                f,
                g;
              if (r) {
                for (h = 0, f = r.length; h < f; h++)
                  ((g = r[h]),
                    (g.geometries ||
                      g.geometry ||
                      g.features ||
                      g.coordinates) &&
                      this.addData(g));
                return this;
              }
              var y = this.options;
              if (y.filter && !y.filter(s)) return this;
              var P = fn(s, y);
              return P
                ? ((P.feature = mn(s)),
                  (P.defaultOptions = P.options),
                  this.resetStyle(P),
                  y.onEachFeature && y.onEachFeature(s, P),
                  this.addLayer(P))
                : this;
            },
            resetStyle: function (s) {
              return s === void 0
                ? this.eachLayer(this.resetStyle, this)
                : ((s.options = o({}, s.defaultOptions)),
                  this._setLayerStyle(s, this.options.style),
                  this);
            },
            setStyle: function (s) {
              return this.eachLayer(function (r) {
                this._setLayerStyle(r, s);
              }, this);
            },
            _setLayerStyle: function (s, r) {
              s.setStyle &&
                (typeof r == "function" && (r = r(s.feature)), s.setStyle(r));
            },
          });
          function fn(s, r) {
            var h = s.type === "Feature" ? s.geometry : s,
              f = h ? h.coordinates : null,
              g = [],
              y = r && r.pointToLayer,
              P = (r && r.coordsToLatLng) || js,
              S,
              M,
              O,
              N;
            if (!f && !h) return null;
            switch (h.type) {
              case "Point":
                return ((S = P(f)), Yr(y, s, S, r));
              case "MultiPoint":
                for (O = 0, N = f.length; O < N; O++)
                  ((S = P(f[O])), g.push(Yr(y, s, S, r)));
                return new he(g);
              case "LineString":
              case "MultiLineString":
                return (
                  (M = pn(f, h.type === "LineString" ? 0 : 1, P)),
                  new ue(M, r)
                );
              case "Polygon":
              case "MultiPolygon":
                return (
                  (M = pn(f, h.type === "Polygon" ? 1 : 2, P)),
                  new si(M, r)
                );
              case "GeometryCollection":
                for (O = 0, N = h.geometries.length; O < N; O++) {
                  var $ = fn(
                    {
                      geometry: h.geometries[O],
                      type: "Feature",
                      properties: s.properties,
                    },
                    r,
                  );
                  $ && g.push($);
                }
                return new he(g);
              case "FeatureCollection":
                for (O = 0, N = h.features.length; O < N; O++) {
                  var J = fn(h.features[O], r);
                  J && g.push(J);
                }
                return new he(g);
              default:
                throw new Error("Invalid GeoJSON object.");
            }
          }
          function Yr(s, r, h, f) {
            return s ? s(r, h) : new un(h, f && f.markersInheritOptions && f);
          }
          function js(s) {
            return new st(s[1], s[0], s[2]);
          }
          function pn(s, r, h) {
            for (var f = [], g = 0, y = s.length, P; g < y; g++)
              ((P = r ? pn(s[g], r - 1, h) : (h || js)(s[g])), f.push(P));
            return f;
          }
          function $s(s, r) {
            return (
              (s = G(s)),
              s.alt !== void 0
                ? [_(s.lng, r), _(s.lat, r), _(s.alt, r)]
                : [_(s.lng, r), _(s.lat, r)]
            );
          }
          function gn(s, r, h, f) {
            for (var g = [], y = 0, P = s.length; y < P; y++)
              g.push(r ? gn(s[y], jt(s[y]) ? 0 : r - 1, h, f) : $s(s[y], f));
            return (!r && h && g.length > 0 && g.push(g[0].slice()), g);
          }
          function oi(s, r) {
            return s.feature ? o({}, s.feature, { geometry: r }) : mn(r);
          }
          function mn(s) {
            return s.type === "Feature" || s.type === "FeatureCollection"
              ? s
              : { type: "Feature", properties: {}, geometry: s };
          }
          var Us = {
            toGeoJSON: function (s) {
              return oi(this, {
                type: "Point",
                coordinates: $s(this.getLatLng(), s),
              });
            },
          };
          (un.include(Us),
            Zs.include(Us),
            dn.include(Us),
            ue.include({
              toGeoJSON: function (s) {
                var r = !jt(this._latlngs),
                  h = gn(this._latlngs, r ? 1 : 0, !1, s);
                return oi(this, {
                  type: (r ? "Multi" : "") + "LineString",
                  coordinates: h,
                });
              },
            }),
            si.include({
              toGeoJSON: function (s) {
                var r = !jt(this._latlngs),
                  h = r && !jt(this._latlngs[0]),
                  f = gn(this._latlngs, h ? 2 : r ? 1 : 0, !0, s);
                return (
                  r || (f = [f]),
                  oi(this, {
                    type: (h ? "Multi" : "") + "Polygon",
                    coordinates: f,
                  })
                );
              },
            }),
            ii.include({
              toMultiPoint: function (s) {
                var r = [];
                return (
                  this.eachLayer(function (h) {
                    r.push(h.toGeoJSON(s).geometry.coordinates);
                  }),
                  oi(this, { type: "MultiPoint", coordinates: r })
                );
              },
              toGeoJSON: function (s) {
                var r =
                  this.feature &&
                  this.feature.geometry &&
                  this.feature.geometry.type;
                if (r === "MultiPoint") return this.toMultiPoint(s);
                var h = r === "GeometryCollection",
                  f = [];
                return (
                  this.eachLayer(function (g) {
                    if (g.toGeoJSON) {
                      var y = g.toGeoJSON(s);
                      if (h) f.push(y.geometry);
                      else {
                        var P = mn(y);
                        P.type === "FeatureCollection"
                          ? f.push.apply(f, P.features)
                          : f.push(P);
                      }
                    }
                  }),
                  h
                    ? oi(this, { geometries: f, type: "GeometryCollection" })
                    : { type: "FeatureCollection", features: f }
                );
              },
            }));
          function Gr(s, r) {
            return new de(s, r);
          }
          var zu = Gr,
            _n = Kt.extend({
              options: {
                opacity: 1,
                alt: "",
                interactive: !1,
                crossOrigin: !1,
                errorOverlayUrl: "",
                zIndex: 1,
                className: "",
              },
              initialize: function (s, r, h) {
                ((this._url = s), (this._bounds = Q(r)), b(this, h));
              },
              onAdd: function () {
                (this._image ||
                  (this._initImage(),
                  this.options.opacity < 1 && this._updateOpacity()),
                  this.options.interactive &&
                    (X(this._image, "leaflet-interactive"),
                    this.addInteractiveTarget(this._image)),
                  this.getPane().appendChild(this._image),
                  this._reset());
              },
              onRemove: function () {
                (bt(this._image),
                  this.options.interactive &&
                    this.removeInteractiveTarget(this._image));
              },
              setOpacity: function (s) {
                return (
                  (this.options.opacity = s),
                  this._image && this._updateOpacity(),
                  this
                );
              },
              setStyle: function (s) {
                return (s.opacity && this.setOpacity(s.opacity), this);
              },
              bringToFront: function () {
                return (this._map && ti(this._image), this);
              },
              bringToBack: function () {
                return (this._map && ei(this._image), this);
              },
              setUrl: function (s) {
                return (
                  (this._url = s),
                  this._image && (this._image.src = s),
                  this
                );
              },
              setBounds: function (s) {
                return (
                  (this._bounds = Q(s)),
                  this._map && this._reset(),
                  this
                );
              },
              getEvents: function () {
                var s = { zoom: this._reset, viewreset: this._reset };
                return (
                  this._zoomAnimated && (s.zoomanim = this._animateZoom),
                  s
                );
              },
              setZIndex: function (s) {
                return ((this.options.zIndex = s), this._updateZIndex(), this);
              },
              getBounds: function () {
                return this._bounds;
              },
              getElement: function () {
                return this._image;
              },
              _initImage: function () {
                var s = this._url.tagName === "IMG",
                  r = (this._image = s ? this._url : at("img"));
                if (
                  (X(r, "leaflet-image-layer"),
                  this._zoomAnimated && X(r, "leaflet-zoom-animated"),
                  this.options.className && X(r, this.options.className),
                  (r.onselectstart = m),
                  (r.onmousemove = m),
                  (r.onload = l(this.fire, this, "load")),
                  (r.onerror = l(this._overlayOnError, this, "error")),
                  (this.options.crossOrigin ||
                    this.options.crossOrigin === "") &&
                    (r.crossOrigin =
                      this.options.crossOrigin === !0
                        ? ""
                        : this.options.crossOrigin),
                  this.options.zIndex && this._updateZIndex(),
                  s)
                ) {
                  this._url = r.src;
                  return;
                }
                ((r.src = this._url), (r.alt = this.options.alt));
              },
              _animateZoom: function (s) {
                var r = this._map.getZoomScale(s.zoom),
                  h = this._map._latLngBoundsToNewLayerBounds(
                    this._bounds,
                    s.zoom,
                    s.center,
                  ).min;
                Re(this._image, h, r);
              },
              _reset: function () {
                var s = this._image,
                  r = new nt(
                    this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
                    this._map.latLngToLayerPoint(this._bounds.getSouthEast()),
                  ),
                  h = r.getSize();
                (St(s, r.min),
                  (s.style.width = h.x + "px"),
                  (s.style.height = h.y + "px"));
              },
              _updateOpacity: function () {
                Zt(this._image, this.options.opacity);
              },
              _updateZIndex: function () {
                this._image &&
                  this.options.zIndex !== void 0 &&
                  this.options.zIndex !== null &&
                  (this._image.style.zIndex = this.options.zIndex);
              },
              _overlayOnError: function () {
                this.fire("error");
                var s = this.options.errorOverlayUrl;
                s &&
                  this._url !== s &&
                  ((this._url = s), (this._image.src = s));
              },
              getCenter: function () {
                return this._bounds.getCenter();
              },
            }),
            Nu = function (s, r, h) {
              return new _n(s, r, h);
            },
            Kr = _n.extend({
              options: {
                autoplay: !0,
                loop: !0,
                keepAspectRatio: !0,
                muted: !1,
                playsInline: !0,
              },
              _initImage: function () {
                var s = this._url.tagName === "VIDEO",
                  r = (this._image = s ? this._url : at("video"));
                if (
                  (X(r, "leaflet-image-layer"),
                  this._zoomAnimated && X(r, "leaflet-zoom-animated"),
                  this.options.className && X(r, this.options.className),
                  (r.onselectstart = m),
                  (r.onmousemove = m),
                  (r.onloadeddata = l(this.fire, this, "load")),
                  s)
                ) {
                  for (
                    var h = r.getElementsByTagName("source"), f = [], g = 0;
                    g < h.length;
                    g++
                  )
                    f.push(h[g].src);
                  this._url = h.length > 0 ? f : [r.src];
                  return;
                }
                (E(this._url) || (this._url = [this._url]),
                  !this.options.keepAspectRatio &&
                    Object.prototype.hasOwnProperty.call(
                      r.style,
                      "objectFit",
                    ) &&
                    (r.style.objectFit = "fill"),
                  (r.autoplay = !!this.options.autoplay),
                  (r.loop = !!this.options.loop),
                  (r.muted = !!this.options.muted),
                  (r.playsInline = !!this.options.playsInline));
                for (var y = 0; y < this._url.length; y++) {
                  var P = at("source");
                  ((P.src = this._url[y]), r.appendChild(P));
                }
              },
            });
          function Fu(s, r, h) {
            return new Kr(s, r, h);
          }
          var Xr = _n.extend({
            _initImage: function () {
              var s = (this._image = this._url);
              (X(s, "leaflet-image-layer"),
                this._zoomAnimated && X(s, "leaflet-zoom-animated"),
                this.options.className && X(s, this.options.className),
                (s.onselectstart = m),
                (s.onmousemove = m));
            },
          });
          function Hu(s, r, h) {
            return new Xr(s, r, h);
          }
          var ie = Kt.extend({
            options: {
              interactive: !1,
              offset: [0, 0],
              className: "",
              pane: void 0,
              content: "",
            },
            initialize: function (s, r) {
              (s && (s instanceof st || E(s))
                ? ((this._latlng = G(s)), b(this, r))
                : (b(this, s), (this._source = r)),
                this.options.content && (this._content = this.options.content));
            },
            openOn: function (s) {
              return (
                (s = arguments.length ? s : this._source._map),
                s.hasLayer(this) || s.addLayer(this),
                this
              );
            },
            close: function () {
              return (this._map && this._map.removeLayer(this), this);
            },
            toggle: function (s) {
              return (
                this._map
                  ? this.close()
                  : (arguments.length ? (this._source = s) : (s = this._source),
                    this._prepareOpen(),
                    this.openOn(s._map)),
                this
              );
            },
            onAdd: function (s) {
              ((this._zoomAnimated = s._zoomAnimated),
                this._container || this._initLayout(),
                s._fadeAnimated && Zt(this._container, 0),
                clearTimeout(this._removeTimeout),
                this.getPane().appendChild(this._container),
                this.update(),
                s._fadeAnimated && Zt(this._container, 1),
                this.bringToFront(),
                this.options.interactive &&
                  (X(this._container, "leaflet-interactive"),
                  this.addInteractiveTarget(this._container)));
            },
            onRemove: function (s) {
              (s._fadeAnimated
                ? (Zt(this._container, 0),
                  (this._removeTimeout = setTimeout(
                    l(bt, void 0, this._container),
                    200,
                  )))
                : bt(this._container),
                this.options.interactive &&
                  (Pt(this._container, "leaflet-interactive"),
                  this.removeInteractiveTarget(this._container)));
            },
            getLatLng: function () {
              return this._latlng;
            },
            setLatLng: function (s) {
              return (
                (this._latlng = G(s)),
                this._map && (this._updatePosition(), this._adjustPan()),
                this
              );
            },
            getContent: function () {
              return this._content;
            },
            setContent: function (s) {
              return ((this._content = s), this.update(), this);
            },
            getElement: function () {
              return this._container;
            },
            update: function () {
              this._map &&
                ((this._container.style.visibility = "hidden"),
                this._updateContent(),
                this._updateLayout(),
                this._updatePosition(),
                (this._container.style.visibility = ""),
                this._adjustPan());
            },
            getEvents: function () {
              var s = {
                zoom: this._updatePosition,
                viewreset: this._updatePosition,
              };
              return (
                this._zoomAnimated && (s.zoomanim = this._animateZoom),
                s
              );
            },
            isOpen: function () {
              return !!this._map && this._map.hasLayer(this);
            },
            bringToFront: function () {
              return (this._map && ti(this._container), this);
            },
            bringToBack: function () {
              return (this._map && ei(this._container), this);
            },
            _prepareOpen: function (s) {
              var r = this._source;
              if (!r._map) return !1;
              if (r instanceof he) {
                r = null;
                var h = this._source._layers;
                for (var f in h)
                  if (h[f]._map) {
                    r = h[f];
                    break;
                  }
                if (!r) return !1;
                this._source = r;
              }
              if (!s)
                if (r.getCenter) s = r.getCenter();
                else if (r.getLatLng) s = r.getLatLng();
                else if (r.getBounds) s = r.getBounds().getCenter();
                else throw new Error("Unable to get source layer LatLng.");
              return (this.setLatLng(s), this._map && this.update(), !0);
            },
            _updateContent: function () {
              if (this._content) {
                var s = this._contentNode,
                  r =
                    typeof this._content == "function"
                      ? this._content(this._source || this)
                      : this._content;
                if (typeof r == "string") s.innerHTML = r;
                else {
                  for (; s.hasChildNodes(); ) s.removeChild(s.firstChild);
                  s.appendChild(r);
                }
                this.fire("contentupdate");
              }
            },
            _updatePosition: function () {
              if (this._map) {
                var s = this._map.latLngToLayerPoint(this._latlng),
                  r = V(this.options.offset),
                  h = this._getAnchor();
                this._zoomAnimated
                  ? St(this._container, s.add(h))
                  : (r = r.add(s).add(h));
                var f = (this._containerBottom = -r.y),
                  g = (this._containerLeft =
                    -Math.round(this._containerWidth / 2) + r.x);
                ((this._container.style.bottom = f + "px"),
                  (this._container.style.left = g + "px"));
              }
            },
            _getAnchor: function () {
              return [0, 0];
            },
          });
          (ot.include({
            _initOverlay: function (s, r, h, f) {
              var g = r;
              return (
                g instanceof s || (g = new s(f).setContent(r)),
                h && g.setLatLng(h),
                g
              );
            },
          }),
            Kt.include({
              _initOverlay: function (s, r, h, f) {
                var g = h;
                return (
                  g instanceof s
                    ? (b(g, f), (g._source = this))
                    : ((g = r && !f ? r : new s(f, this)), g.setContent(h)),
                  g
                );
              },
            }));
          var yn = ie.extend({
              options: {
                pane: "popupPane",
                offset: [0, 7],
                maxWidth: 300,
                minWidth: 50,
                maxHeight: null,
                autoPan: !0,
                autoPanPaddingTopLeft: null,
                autoPanPaddingBottomRight: null,
                autoPanPadding: [5, 5],
                keepInView: !1,
                closeButton: !0,
                autoClose: !0,
                closeOnEscapeKey: !0,
                className: "",
              },
              openOn: function (s) {
                return (
                  (s = arguments.length ? s : this._source._map),
                  !s.hasLayer(this) &&
                    s._popup &&
                    s._popup.options.autoClose &&
                    s.removeLayer(s._popup),
                  (s._popup = this),
                  ie.prototype.openOn.call(this, s)
                );
              },
              onAdd: function (s) {
                (ie.prototype.onAdd.call(this, s),
                  s.fire("popupopen", { popup: this }),
                  this._source &&
                    (this._source.fire("popupopen", { popup: this }, !0),
                    this._source instanceof ke ||
                      this._source.on("preclick", Ne)));
              },
              onRemove: function (s) {
                (ie.prototype.onRemove.call(this, s),
                  s.fire("popupclose", { popup: this }),
                  this._source &&
                    (this._source.fire("popupclose", { popup: this }, !0),
                    this._source instanceof ke ||
                      this._source.off("preclick", Ne)));
              },
              getEvents: function () {
                var s = ie.prototype.getEvents.call(this);
                return (
                  (this.options.closeOnClick !== void 0
                    ? this.options.closeOnClick
                    : this._map.options.closePopupOnClick) &&
                    (s.preclick = this.close),
                  this.options.keepInView && (s.moveend = this._adjustPan),
                  s
                );
              },
              _initLayout: function () {
                var s = "leaflet-popup",
                  r = (this._container = at(
                    "div",
                    s +
                      " " +
                      (this.options.className || "") +
                      " leaflet-zoom-animated",
                  )),
                  h = (this._wrapper = at("div", s + "-content-wrapper", r));
                if (
                  ((this._contentNode = at("div", s + "-content", h)),
                  wi(r),
                  Ds(this._contentNode),
                  K(r, "contextmenu", Ne),
                  (this._tipContainer = at("div", s + "-tip-container", r)),
                  (this._tip = at("div", s + "-tip", this._tipContainer)),
                  this.options.closeButton)
                ) {
                  var f = (this._closeButton = at("a", s + "-close-button", r));
                  (f.setAttribute("role", "button"),
                    f.setAttribute("aria-label", "Close popup"),
                    (f.href = "#close"),
                    (f.innerHTML = '<span aria-hidden="true">&#215;</span>'),
                    K(
                      f,
                      "click",
                      function (g) {
                        (At(g), this.close());
                      },
                      this,
                    ));
                }
              },
              _updateLayout: function () {
                var s = this._contentNode,
                  r = s.style;
                ((r.width = ""), (r.whiteSpace = "nowrap"));
                var h = s.offsetWidth;
                ((h = Math.min(h, this.options.maxWidth)),
                  (h = Math.max(h, this.options.minWidth)),
                  (r.width = h + 1 + "px"),
                  (r.whiteSpace = ""),
                  (r.height = ""));
                var f = s.offsetHeight,
                  g = this.options.maxHeight,
                  y = "leaflet-popup-scrolled";
                (g && f > g ? ((r.height = g + "px"), X(s, y)) : Pt(s, y),
                  (this._containerWidth = this._container.offsetWidth));
              },
              _animateZoom: function (s) {
                var r = this._map._latLngToNewLayerPoint(
                    this._latlng,
                    s.zoom,
                    s.center,
                  ),
                  h = this._getAnchor();
                St(this._container, r.add(h));
              },
              _adjustPan: function () {
                if (this.options.autoPan) {
                  if (
                    (this._map._panAnim && this._map._panAnim.stop(),
                    this._autopanning)
                  ) {
                    this._autopanning = !1;
                    return;
                  }
                  var s = this._map,
                    r = parseInt(yi(this._container, "marginBottom"), 10) || 0,
                    h = this._container.offsetHeight + r,
                    f = this._containerWidth,
                    g = new F(this._containerLeft, -h - this._containerBottom);
                  g._add(ze(this._container));
                  var y = s.layerPointToContainerPoint(g),
                    P = V(this.options.autoPanPadding),
                    S = V(this.options.autoPanPaddingTopLeft || P),
                    M = V(this.options.autoPanPaddingBottomRight || P),
                    O = s.getSize(),
                    N = 0,
                    $ = 0;
                  (y.x + f + M.x > O.x && (N = y.x + f - O.x + M.x),
                    y.x - N - S.x < 0 && (N = y.x - S.x),
                    y.y + h + M.y > O.y && ($ = y.y + h - O.y + M.y),
                    y.y - $ - S.y < 0 && ($ = y.y - S.y),
                    (N || $) &&
                      (this.options.keepInView && (this._autopanning = !0),
                      s.fire("autopanstart").panBy([N, $])));
                }
              },
              _getAnchor: function () {
                return V(
                  this._source && this._source._getPopupAnchor
                    ? this._source._getPopupAnchor()
                    : [0, 0],
                );
              },
            }),
            Wu = function (s, r) {
              return new yn(s, r);
            };
          (ot.mergeOptions({ closePopupOnClick: !0 }),
            ot.include({
              openPopup: function (s, r, h) {
                return (this._initOverlay(yn, s, r, h).openOn(this), this);
              },
              closePopup: function (s) {
                return (
                  (s = arguments.length ? s : this._popup),
                  s && s.close(),
                  this
                );
              },
            }),
            Kt.include({
              bindPopup: function (s, r) {
                return (
                  (this._popup = this._initOverlay(yn, this._popup, s, r)),
                  this._popupHandlersAdded ||
                    (this.on({
                      click: this._openPopup,
                      keypress: this._onKeyPress,
                      remove: this.closePopup,
                      move: this._movePopup,
                    }),
                    (this._popupHandlersAdded = !0)),
                  this
                );
              },
              unbindPopup: function () {
                return (
                  this._popup &&
                    (this.off({
                      click: this._openPopup,
                      keypress: this._onKeyPress,
                      remove: this.closePopup,
                      move: this._movePopup,
                    }),
                    (this._popupHandlersAdded = !1),
                    (this._popup = null)),
                  this
                );
              },
              openPopup: function (s) {
                return (
                  this._popup &&
                    (this instanceof he || (this._popup._source = this),
                    this._popup._prepareOpen(s || this._latlng) &&
                      this._popup.openOn(this._map)),
                  this
                );
              },
              closePopup: function () {
                return (this._popup && this._popup.close(), this);
              },
              togglePopup: function () {
                return (this._popup && this._popup.toggle(this), this);
              },
              isPopupOpen: function () {
                return this._popup ? this._popup.isOpen() : !1;
              },
              setPopupContent: function (s) {
                return (this._popup && this._popup.setContent(s), this);
              },
              getPopup: function () {
                return this._popup;
              },
              _openPopup: function (s) {
                if (!(!this._popup || !this._map)) {
                  Fe(s);
                  var r = s.layer || s.target;
                  if (this._popup._source === r && !(r instanceof ke)) {
                    this._map.hasLayer(this._popup)
                      ? this.closePopup()
                      : this.openPopup(s.latlng);
                    return;
                  }
                  ((this._popup._source = r), this.openPopup(s.latlng));
                }
              },
              _movePopup: function (s) {
                this._popup.setLatLng(s.latlng);
              },
              _onKeyPress: function (s) {
                s.originalEvent.keyCode === 13 && this._openPopup(s);
              },
            }));
          var vn = ie.extend({
              options: {
                pane: "tooltipPane",
                offset: [0, 0],
                direction: "auto",
                permanent: !1,
                sticky: !1,
                opacity: 0.9,
              },
              onAdd: function (s) {
                (ie.prototype.onAdd.call(this, s),
                  this.setOpacity(this.options.opacity),
                  s.fire("tooltipopen", { tooltip: this }),
                  this._source &&
                    (this.addEventParent(this._source),
                    this._source.fire("tooltipopen", { tooltip: this }, !0)));
              },
              onRemove: function (s) {
                (ie.prototype.onRemove.call(this, s),
                  s.fire("tooltipclose", { tooltip: this }),
                  this._source &&
                    (this.removeEventParent(this._source),
                    this._source.fire("tooltipclose", { tooltip: this }, !0)));
              },
              getEvents: function () {
                var s = ie.prototype.getEvents.call(this);
                return (this.options.permanent || (s.preclick = this.close), s);
              },
              _initLayout: function () {
                var s = "leaflet-tooltip",
                  r =
                    s +
                    " " +
                    (this.options.className || "") +
                    " leaflet-zoom-" +
                    (this._zoomAnimated ? "animated" : "hide");
                ((this._contentNode = this._container = at("div", r)),
                  this._container.setAttribute("role", "tooltip"),
                  this._container.setAttribute(
                    "id",
                    "leaflet-tooltip-" + u(this),
                  ));
              },
              _updateLayout: function () {},
              _adjustPan: function () {},
              _setPosition: function (s) {
                var r,
                  h,
                  f = this._map,
                  g = this._container,
                  y = f.latLngToContainerPoint(f.getCenter()),
                  P = f.layerPointToContainerPoint(s),
                  S = this.options.direction,
                  M = g.offsetWidth,
                  O = g.offsetHeight,
                  N = V(this.options.offset),
                  $ = this._getAnchor();
                (S === "top"
                  ? ((r = M / 2), (h = O))
                  : S === "bottom"
                    ? ((r = M / 2), (h = 0))
                    : S === "center"
                      ? ((r = M / 2), (h = O / 2))
                      : S === "right"
                        ? ((r = 0), (h = O / 2))
                        : S === "left"
                          ? ((r = M), (h = O / 2))
                          : P.x < y.x
                            ? ((S = "right"), (r = 0), (h = O / 2))
                            : ((S = "left"),
                              (r = M + (N.x + $.x) * 2),
                              (h = O / 2)),
                  (s = s
                    .subtract(V(r, h, !0))
                    .add(N)
                    .add($)),
                  Pt(g, "leaflet-tooltip-right"),
                  Pt(g, "leaflet-tooltip-left"),
                  Pt(g, "leaflet-tooltip-top"),
                  Pt(g, "leaflet-tooltip-bottom"),
                  X(g, "leaflet-tooltip-" + S),
                  St(g, s));
              },
              _updatePosition: function () {
                var s = this._map.latLngToLayerPoint(this._latlng);
                this._setPosition(s);
              },
              setOpacity: function (s) {
                ((this.options.opacity = s),
                  this._container && Zt(this._container, s));
              },
              _animateZoom: function (s) {
                var r = this._map._latLngToNewLayerPoint(
                  this._latlng,
                  s.zoom,
                  s.center,
                );
                this._setPosition(r);
              },
              _getAnchor: function () {
                return V(
                  this._source &&
                    this._source._getTooltipAnchor &&
                    !this.options.sticky
                    ? this._source._getTooltipAnchor()
                    : [0, 0],
                );
              },
            }),
            Vu = function (s, r) {
              return new vn(s, r);
            };
          (ot.include({
            openTooltip: function (s, r, h) {
              return (this._initOverlay(vn, s, r, h).openOn(this), this);
            },
            closeTooltip: function (s) {
              return (s.close(), this);
            },
          }),
            Kt.include({
              bindTooltip: function (s, r) {
                return (
                  this._tooltip && this.isTooltipOpen() && this.unbindTooltip(),
                  (this._tooltip = this._initOverlay(vn, this._tooltip, s, r)),
                  this._initTooltipInteractions(),
                  this._tooltip.options.permanent &&
                    this._map &&
                    this._map.hasLayer(this) &&
                    this.openTooltip(),
                  this
                );
              },
              unbindTooltip: function () {
                return (
                  this._tooltip &&
                    (this._initTooltipInteractions(!0),
                    this.closeTooltip(),
                    (this._tooltip = null)),
                  this
                );
              },
              _initTooltipInteractions: function (s) {
                if (!(!s && this._tooltipHandlersAdded)) {
                  var r = s ? "off" : "on",
                    h = { remove: this.closeTooltip, move: this._moveTooltip };
                  (this._tooltip.options.permanent
                    ? (h.add = this._openTooltip)
                    : ((h.mouseover = this._openTooltip),
                      (h.mouseout = this.closeTooltip),
                      (h.click = this._openTooltip),
                      this._map
                        ? this._addFocusListeners()
                        : (h.add = this._addFocusListeners)),
                    this._tooltip.options.sticky &&
                      (h.mousemove = this._moveTooltip),
                    this[r](h),
                    (this._tooltipHandlersAdded = !s));
                }
              },
              openTooltip: function (s) {
                return (
                  this._tooltip &&
                    (this instanceof he || (this._tooltip._source = this),
                    this._tooltip._prepareOpen(s) &&
                      (this._tooltip.openOn(this._map),
                      this.getElement
                        ? this._setAriaDescribedByOnLayer(this)
                        : this.eachLayer &&
                          this.eachLayer(
                            this._setAriaDescribedByOnLayer,
                            this,
                          ))),
                  this
                );
              },
              closeTooltip: function () {
                if (this._tooltip) return this._tooltip.close();
              },
              toggleTooltip: function () {
                return (this._tooltip && this._tooltip.toggle(this), this);
              },
              isTooltipOpen: function () {
                return this._tooltip.isOpen();
              },
              setTooltipContent: function (s) {
                return (this._tooltip && this._tooltip.setContent(s), this);
              },
              getTooltip: function () {
                return this._tooltip;
              },
              _addFocusListeners: function () {
                this.getElement
                  ? this._addFocusListenersOnLayer(this)
                  : this.eachLayer &&
                    this.eachLayer(this._addFocusListenersOnLayer, this);
              },
              _addFocusListenersOnLayer: function (s) {
                var r = typeof s.getElement == "function" && s.getElement();
                r &&
                  (K(
                    r,
                    "focus",
                    function () {
                      ((this._tooltip._source = s), this.openTooltip());
                    },
                    this,
                  ),
                  K(r, "blur", this.closeTooltip, this));
              },
              _setAriaDescribedByOnLayer: function (s) {
                var r = typeof s.getElement == "function" && s.getElement();
                r &&
                  r.setAttribute(
                    "aria-describedby",
                    this._tooltip._container.id,
                  );
              },
              _openTooltip: function (s) {
                if (!(!this._tooltip || !this._map)) {
                  if (
                    this._map.dragging &&
                    this._map.dragging.moving() &&
                    !this._openOnceFlag
                  ) {
                    this._openOnceFlag = !0;
                    var r = this;
                    this._map.once("moveend", function () {
                      ((r._openOnceFlag = !1), r._openTooltip(s));
                    });
                    return;
                  }
                  ((this._tooltip._source = s.layer || s.target),
                    this.openTooltip(
                      this._tooltip.options.sticky ? s.latlng : void 0,
                    ));
                }
              },
              _moveTooltip: function (s) {
                var r = s.latlng,
                  h,
                  f;
                (this._tooltip.options.sticky &&
                  s.originalEvent &&
                  ((h = this._map.mouseEventToContainerPoint(s.originalEvent)),
                  (f = this._map.containerPointToLayerPoint(h)),
                  (r = this._map.layerPointToLatLng(f))),
                  this._tooltip.setLatLng(r));
              },
            }));
          var Jr = ni.extend({
            options: {
              iconSize: [12, 12],
              html: !1,
              bgPos: null,
              className: "leaflet-div-icon",
            },
            createIcon: function (s) {
              var r =
                  s && s.tagName === "DIV" ? s : document.createElement("div"),
                h = this.options;
              if (
                (h.html instanceof Element
                  ? (on(r), r.appendChild(h.html))
                  : (r.innerHTML = h.html !== !1 ? h.html : ""),
                h.bgPos)
              ) {
                var f = V(h.bgPos);
                r.style.backgroundPosition = -f.x + "px " + -f.y + "px";
              }
              return (this._setIconStyles(r, "icon"), r);
            },
            createShadow: function () {
              return null;
            },
          });
          function Zu(s) {
            return new Jr(s);
          }
          ni.Default = Si;
          var Mi = Kt.extend({
            options: {
              tileSize: 256,
              opacity: 1,
              updateWhenIdle: Z.mobile,
              updateWhenZooming: !0,
              updateInterval: 200,
              zIndex: 1,
              bounds: null,
              minZoom: 0,
              maxZoom: void 0,
              maxNativeZoom: void 0,
              minNativeZoom: void 0,
              noWrap: !1,
              pane: "tilePane",
              className: "",
              keepBuffer: 2,
            },
            initialize: function (s) {
              b(this, s);
            },
            onAdd: function () {
              (this._initContainer(),
                (this._levels = {}),
                (this._tiles = {}),
                this._resetView());
            },
            beforeAdd: function (s) {
              s._addZoomLimit(this);
            },
            onRemove: function (s) {
              (this._removeAllTiles(),
                bt(this._container),
                s._removeZoomLimit(this),
                (this._container = null),
                (this._tileZoom = void 0));
            },
            bringToFront: function () {
              return (
                this._map &&
                  (ti(this._container), this._setAutoZIndex(Math.max)),
                this
              );
            },
            bringToBack: function () {
              return (
                this._map &&
                  (ei(this._container), this._setAutoZIndex(Math.min)),
                this
              );
            },
            getContainer: function () {
              return this._container;
            },
            setOpacity: function (s) {
              return ((this.options.opacity = s), this._updateOpacity(), this);
            },
            setZIndex: function (s) {
              return ((this.options.zIndex = s), this._updateZIndex(), this);
            },
            isLoading: function () {
              return this._loading;
            },
            redraw: function () {
              if (this._map) {
                this._removeAllTiles();
                var s = this._clampZoom(this._map.getZoom());
                (s !== this._tileZoom &&
                  ((this._tileZoom = s), this._updateLevels()),
                  this._update());
              }
              return this;
            },
            getEvents: function () {
              var s = {
                viewprereset: this._invalidateAll,
                viewreset: this._resetView,
                zoom: this._resetView,
                moveend: this._onMoveEnd,
              };
              return (
                this.options.updateWhenIdle ||
                  (this._onMove ||
                    (this._onMove = d(
                      this._onMoveEnd,
                      this.options.updateInterval,
                      this,
                    )),
                  (s.move = this._onMove)),
                this._zoomAnimated && (s.zoomanim = this._animateZoom),
                s
              );
            },
            createTile: function () {
              return document.createElement("div");
            },
            getTileSize: function () {
              var s = this.options.tileSize;
              return s instanceof F ? s : new F(s, s);
            },
            _updateZIndex: function () {
              this._container &&
                this.options.zIndex !== void 0 &&
                this.options.zIndex !== null &&
                (this._container.style.zIndex = this.options.zIndex);
            },
            _setAutoZIndex: function (s) {
              for (
                var r = this.getPane().children,
                  h = -s(-1 / 0, 1 / 0),
                  f = 0,
                  g = r.length,
                  y;
                f < g;
                f++
              )
                ((y = r[f].style.zIndex),
                  r[f] !== this._container && y && (h = s(h, +y)));
              isFinite(h) &&
                ((this.options.zIndex = h + s(-1, 1)), this._updateZIndex());
            },
            _updateOpacity: function () {
              if (this._map && !Z.ielt9) {
                Zt(this._container, this.options.opacity);
                var s = +new Date(),
                  r = !1,
                  h = !1;
                for (var f in this._tiles) {
                  var g = this._tiles[f];
                  if (!(!g.current || !g.loaded)) {
                    var y = Math.min(1, (s - g.loaded) / 200);
                    (Zt(g.el, y),
                      y < 1
                        ? (r = !0)
                        : (g.active ? (h = !0) : this._onOpaqueTile(g),
                          (g.active = !0)));
                  }
                }
                (h && !this._noPrune && this._pruneTiles(),
                  r &&
                    (j(this._fadeFrame),
                    (this._fadeFrame = W(this._updateOpacity, this))));
              }
            },
            _onOpaqueTile: m,
            _initContainer: function () {
              this._container ||
                ((this._container = at(
                  "div",
                  "leaflet-layer " + (this.options.className || ""),
                )),
                this._updateZIndex(),
                this.options.opacity < 1 && this._updateOpacity(),
                this.getPane().appendChild(this._container));
            },
            _updateLevels: function () {
              var s = this._tileZoom,
                r = this.options.maxZoom;
              if (s !== void 0) {
                for (var h in this._levels)
                  ((h = Number(h)),
                    this._levels[h].el.children.length || h === s
                      ? ((this._levels[h].el.style.zIndex =
                          r - Math.abs(s - h)),
                        this._onUpdateLevel(h))
                      : (bt(this._levels[h].el),
                        this._removeTilesAtZoom(h),
                        this._onRemoveLevel(h),
                        delete this._levels[h]));
                var f = this._levels[s],
                  g = this._map;
                return (
                  f ||
                    ((f = this._levels[s] = {}),
                    (f.el = at(
                      "div",
                      "leaflet-tile-container leaflet-zoom-animated",
                      this._container,
                    )),
                    (f.el.style.zIndex = r),
                    (f.origin = g
                      .project(g.unproject(g.getPixelOrigin()), s)
                      .round()),
                    (f.zoom = s),
                    this._setZoomTransform(f, g.getCenter(), g.getZoom()),
                    m(f.el.offsetWidth),
                    this._onCreateLevel(f)),
                  (this._level = f),
                  f
                );
              }
            },
            _onUpdateLevel: m,
            _onRemoveLevel: m,
            _onCreateLevel: m,
            _pruneTiles: function () {
              if (this._map) {
                var s,
                  r,
                  h = this._map.getZoom();
                if (h > this.options.maxZoom || h < this.options.minZoom) {
                  this._removeAllTiles();
                  return;
                }
                for (s in this._tiles)
                  ((r = this._tiles[s]), (r.retain = r.current));
                for (s in this._tiles)
                  if (((r = this._tiles[s]), r.current && !r.active)) {
                    var f = r.coords;
                    this._retainParent(f.x, f.y, f.z, f.z - 5) ||
                      this._retainChildren(f.x, f.y, f.z, f.z + 2);
                  }
                for (s in this._tiles)
                  this._tiles[s].retain || this._removeTile(s);
              }
            },
            _removeTilesAtZoom: function (s) {
              for (var r in this._tiles)
                this._tiles[r].coords.z === s && this._removeTile(r);
            },
            _removeAllTiles: function () {
              for (var s in this._tiles) this._removeTile(s);
            },
            _invalidateAll: function () {
              for (var s in this._levels)
                (bt(this._levels[s].el),
                  this._onRemoveLevel(Number(s)),
                  delete this._levels[s]);
              (this._removeAllTiles(), (this._tileZoom = void 0));
            },
            _retainParent: function (s, r, h, f) {
              var g = Math.floor(s / 2),
                y = Math.floor(r / 2),
                P = h - 1,
                S = new F(+g, +y);
              S.z = +P;
              var M = this._tileCoordsToKey(S),
                O = this._tiles[M];
              return O && O.active
                ? ((O.retain = !0), !0)
                : (O && O.loaded && (O.retain = !0),
                  P > f ? this._retainParent(g, y, P, f) : !1);
            },
            _retainChildren: function (s, r, h, f) {
              for (var g = 2 * s; g < 2 * s + 2; g++)
                for (var y = 2 * r; y < 2 * r + 2; y++) {
                  var P = new F(g, y);
                  P.z = h + 1;
                  var S = this._tileCoordsToKey(P),
                    M = this._tiles[S];
                  if (M && M.active) {
                    M.retain = !0;
                    continue;
                  } else M && M.loaded && (M.retain = !0);
                  h + 1 < f && this._retainChildren(g, y, h + 1, f);
                }
            },
            _resetView: function (s) {
              var r = s && (s.pinch || s.flyTo);
              this._setView(this._map.getCenter(), this._map.getZoom(), r, r);
            },
            _animateZoom: function (s) {
              this._setView(s.center, s.zoom, !0, s.noUpdate);
            },
            _clampZoom: function (s) {
              var r = this.options;
              return r.minNativeZoom !== void 0 && s < r.minNativeZoom
                ? r.minNativeZoom
                : r.maxNativeZoom !== void 0 && r.maxNativeZoom < s
                  ? r.maxNativeZoom
                  : s;
            },
            _setView: function (s, r, h, f) {
              var g = Math.round(r);
              (this.options.maxZoom !== void 0 && g > this.options.maxZoom) ||
              (this.options.minZoom !== void 0 && g < this.options.minZoom)
                ? (g = void 0)
                : (g = this._clampZoom(g));
              var y = this.options.updateWhenZooming && g !== this._tileZoom;
              ((!f || y) &&
                ((this._tileZoom = g),
                this._abortLoading && this._abortLoading(),
                this._updateLevels(),
                this._resetGrid(),
                g !== void 0 && this._update(s),
                h || this._pruneTiles(),
                (this._noPrune = !!h)),
                this._setZoomTransforms(s, r));
            },
            _setZoomTransforms: function (s, r) {
              for (var h in this._levels)
                this._setZoomTransform(this._levels[h], s, r);
            },
            _setZoomTransform: function (s, r, h) {
              var f = this._map.getZoomScale(h, s.zoom),
                g = s.origin
                  .multiplyBy(f)
                  .subtract(this._map._getNewPixelOrigin(r, h))
                  .round();
              Z.any3d ? Re(s.el, g, f) : St(s.el, g);
            },
            _resetGrid: function () {
              var s = this._map,
                r = s.options.crs,
                h = (this._tileSize = this.getTileSize()),
                f = this._tileZoom,
                g = this._map.getPixelWorldBounds(this._tileZoom);
              (g && (this._globalTileRange = this._pxBoundsToTileRange(g)),
                (this._wrapX = r.wrapLng &&
                  !this.options.noWrap && [
                    Math.floor(s.project([0, r.wrapLng[0]], f).x / h.x),
                    Math.ceil(s.project([0, r.wrapLng[1]], f).x / h.y),
                  ]),
                (this._wrapY = r.wrapLat &&
                  !this.options.noWrap && [
                    Math.floor(s.project([r.wrapLat[0], 0], f).y / h.x),
                    Math.ceil(s.project([r.wrapLat[1], 0], f).y / h.y),
                  ]));
            },
            _onMoveEnd: function () {
              !this._map || this._map._animatingZoom || this._update();
            },
            _getTiledPixelBounds: function (s) {
              var r = this._map,
                h = r._animatingZoom
                  ? Math.max(r._animateToZoom, r.getZoom())
                  : r.getZoom(),
                f = r.getZoomScale(h, this._tileZoom),
                g = r.project(s, this._tileZoom).floor(),
                y = r.getSize().divideBy(f * 2);
              return new nt(g.subtract(y), g.add(y));
            },
            _update: function (s) {
              var r = this._map;
              if (r) {
                var h = this._clampZoom(r.getZoom());
                if (
                  (s === void 0 && (s = r.getCenter()),
                  this._tileZoom !== void 0)
                ) {
                  var f = this._getTiledPixelBounds(s),
                    g = this._pxBoundsToTileRange(f),
                    y = g.getCenter(),
                    P = [],
                    S = this.options.keepBuffer,
                    M = new nt(
                      g.getBottomLeft().subtract([S, -S]),
                      g.getTopRight().add([S, -S]),
                    );
                  if (
                    !(
                      isFinite(g.min.x) &&
                      isFinite(g.min.y) &&
                      isFinite(g.max.x) &&
                      isFinite(g.max.y)
                    )
                  )
                    throw new Error(
                      "Attempted to load an infinite number of tiles",
                    );
                  for (var O in this._tiles) {
                    var N = this._tiles[O].coords;
                    (N.z !== this._tileZoom || !M.contains(new F(N.x, N.y))) &&
                      (this._tiles[O].current = !1);
                  }
                  if (Math.abs(h - this._tileZoom) > 1) {
                    this._setView(s, h);
                    return;
                  }
                  for (var $ = g.min.y; $ <= g.max.y; $++)
                    for (var J = g.min.x; J <= g.max.x; J++) {
                      var Rt = new F(J, $);
                      if (((Rt.z = this._tileZoom), !!this._isValidTile(Rt))) {
                        var Tt = this._tiles[this._tileCoordsToKey(Rt)];
                        Tt ? (Tt.current = !0) : P.push(Rt);
                      }
                    }
                  if (
                    (P.sort(function (zt, ai) {
                      return zt.distanceTo(y) - ai.distanceTo(y);
                    }),
                    P.length !== 0)
                  ) {
                    this._loading ||
                      ((this._loading = !0), this.fire("loading"));
                    var $t = document.createDocumentFragment();
                    for (J = 0; J < P.length; J++) this._addTile(P[J], $t);
                    this._level.el.appendChild($t);
                  }
                }
              }
            },
            _isValidTile: function (s) {
              var r = this._map.options.crs;
              if (!r.infinite) {
                var h = this._globalTileRange;
                if (
                  (!r.wrapLng && (s.x < h.min.x || s.x > h.max.x)) ||
                  (!r.wrapLat && (s.y < h.min.y || s.y > h.max.y))
                )
                  return !1;
              }
              if (!this.options.bounds) return !0;
              var f = this._tileCoordsToBounds(s);
              return Q(this.options.bounds).overlaps(f);
            },
            _keyToBounds: function (s) {
              return this._tileCoordsToBounds(this._keyToTileCoords(s));
            },
            _tileCoordsToNwSe: function (s) {
              var r = this._map,
                h = this.getTileSize(),
                f = s.scaleBy(h),
                g = f.add(h),
                y = r.unproject(f, s.z),
                P = r.unproject(g, s.z);
              return [y, P];
            },
            _tileCoordsToBounds: function (s) {
              var r = this._tileCoordsToNwSe(s),
                h = new vt(r[0], r[1]);
              return (
                this.options.noWrap || (h = this._map.wrapLatLngBounds(h)),
                h
              );
            },
            _tileCoordsToKey: function (s) {
              return s.x + ":" + s.y + ":" + s.z;
            },
            _keyToTileCoords: function (s) {
              var r = s.split(":"),
                h = new F(+r[0], +r[1]);
              return ((h.z = +r[2]), h);
            },
            _removeTile: function (s) {
              var r = this._tiles[s];
              r &&
                (bt(r.el),
                delete this._tiles[s],
                this.fire("tileunload", {
                  tile: r.el,
                  coords: this._keyToTileCoords(s),
                }));
            },
            _initTile: function (s) {
              X(s, "leaflet-tile");
              var r = this.getTileSize();
              ((s.style.width = r.x + "px"),
                (s.style.height = r.y + "px"),
                (s.onselectstart = m),
                (s.onmousemove = m),
                Z.ielt9 &&
                  this.options.opacity < 1 &&
                  Zt(s, this.options.opacity));
            },
            _addTile: function (s, r) {
              var h = this._getTilePos(s),
                f = this._tileCoordsToKey(s),
                g = this.createTile(
                  this._wrapCoords(s),
                  l(this._tileReady, this, s),
                );
              (this._initTile(g),
                this.createTile.length < 2 &&
                  W(l(this._tileReady, this, s, null, g)),
                St(g, h),
                (this._tiles[f] = { el: g, coords: s, current: !0 }),
                r.appendChild(g),
                this.fire("tileloadstart", { tile: g, coords: s }));
            },
            _tileReady: function (s, r, h) {
              r && this.fire("tileerror", { error: r, tile: h, coords: s });
              var f = this._tileCoordsToKey(s);
              ((h = this._tiles[f]),
                h &&
                  ((h.loaded = +new Date()),
                  this._map._fadeAnimated
                    ? (Zt(h.el, 0),
                      j(this._fadeFrame),
                      (this._fadeFrame = W(this._updateOpacity, this)))
                    : ((h.active = !0), this._pruneTiles()),
                  r ||
                    (X(h.el, "leaflet-tile-loaded"),
                    this.fire("tileload", { tile: h.el, coords: s })),
                  this._noTilesToLoad() &&
                    ((this._loading = !1),
                    this.fire("load"),
                    Z.ielt9 || !this._map._fadeAnimated
                      ? W(this._pruneTiles, this)
                      : setTimeout(l(this._pruneTiles, this), 250))));
            },
            _getTilePos: function (s) {
              return s.scaleBy(this.getTileSize()).subtract(this._level.origin);
            },
            _wrapCoords: function (s) {
              var r = new F(
                this._wrapX ? p(s.x, this._wrapX) : s.x,
                this._wrapY ? p(s.y, this._wrapY) : s.y,
              );
              return ((r.z = s.z), r);
            },
            _pxBoundsToTileRange: function (s) {
              var r = this.getTileSize();
              return new nt(
                s.min.unscaleBy(r).floor(),
                s.max.unscaleBy(r).ceil().subtract([1, 1]),
              );
            },
            _noTilesToLoad: function () {
              for (var s in this._tiles) if (!this._tiles[s].loaded) return !1;
              return !0;
            },
          });
          function ju(s) {
            return new Mi(s);
          }
          var ri = Mi.extend({
            options: {
              minZoom: 0,
              maxZoom: 18,
              subdomains: "abc",
              errorTileUrl: "",
              zoomOffset: 0,
              tms: !1,
              zoomReverse: !1,
              detectRetina: !1,
              crossOrigin: !1,
              referrerPolicy: !1,
            },
            initialize: function (s, r) {
              ((this._url = s),
                (r = b(this, r)),
                r.detectRetina && Z.retina && r.maxZoom > 0
                  ? ((r.tileSize = Math.floor(r.tileSize / 2)),
                    r.zoomReverse
                      ? (r.zoomOffset--,
                        (r.minZoom = Math.min(r.maxZoom, r.minZoom + 1)))
                      : (r.zoomOffset++,
                        (r.maxZoom = Math.max(r.minZoom, r.maxZoom - 1))),
                    (r.minZoom = Math.max(0, r.minZoom)))
                  : r.zoomReverse
                    ? (r.minZoom = Math.min(r.maxZoom, r.minZoom))
                    : (r.maxZoom = Math.max(r.minZoom, r.maxZoom)),
                typeof r.subdomains == "string" &&
                  (r.subdomains = r.subdomains.split("")),
                this.on("tileunload", this._onTileRemove));
            },
            setUrl: function (s, r) {
              return (
                this._url === s && r === void 0 && (r = !0),
                (this._url = s),
                r || this.redraw(),
                this
              );
            },
            createTile: function (s, r) {
              var h = document.createElement("img");
              return (
                K(h, "load", l(this._tileOnLoad, this, r, h)),
                K(h, "error", l(this._tileOnError, this, r, h)),
                (this.options.crossOrigin || this.options.crossOrigin === "") &&
                  (h.crossOrigin =
                    this.options.crossOrigin === !0
                      ? ""
                      : this.options.crossOrigin),
                typeof this.options.referrerPolicy == "string" &&
                  (h.referrerPolicy = this.options.referrerPolicy),
                (h.alt = ""),
                (h.src = this.getTileUrl(s)),
                h
              );
            },
            getTileUrl: function (s) {
              var r = {
                r: Z.retina ? "@2x" : "",
                s: this._getSubdomain(s),
                x: s.x,
                y: s.y,
                z: this._getZoomForUrl(),
              };
              if (this._map && !this._map.options.crs.infinite) {
                var h = this._globalTileRange.max.y - s.y;
                (this.options.tms && (r.y = h), (r["-y"] = h));
              }
              return C(this._url, o(r, this.options));
            },
            _tileOnLoad: function (s, r) {
              Z.ielt9 ? setTimeout(l(s, this, null, r), 0) : s(null, r);
            },
            _tileOnError: function (s, r, h) {
              var f = this.options.errorTileUrl;
              (f && r.getAttribute("src") !== f && (r.src = f), s(h, r));
            },
            _onTileRemove: function (s) {
              s.tile.onload = null;
            },
            _getZoomForUrl: function () {
              var s = this._tileZoom,
                r = this.options.maxZoom,
                h = this.options.zoomReverse,
                f = this.options.zoomOffset;
              return (h && (s = r - s), s + f);
            },
            _getSubdomain: function (s) {
              var r = Math.abs(s.x + s.y) % this.options.subdomains.length;
              return this.options.subdomains[r];
            },
            _abortLoading: function () {
              var s, r;
              for (s in this._tiles)
                if (
                  this._tiles[s].coords.z !== this._tileZoom &&
                  ((r = this._tiles[s].el),
                  (r.onload = m),
                  (r.onerror = m),
                  !r.complete)
                ) {
                  r.src = T;
                  var h = this._tiles[s].coords;
                  (bt(r),
                    delete this._tiles[s],
                    this.fire("tileabort", { tile: r, coords: h }));
                }
            },
            _removeTile: function (s) {
              var r = this._tiles[s];
              if (r)
                return (
                  r.el.setAttribute("src", T),
                  Mi.prototype._removeTile.call(this, s)
                );
            },
            _tileReady: function (s, r, h) {
              if (!(!this._map || (h && h.getAttribute("src") === T)))
                return Mi.prototype._tileReady.call(this, s, r, h);
            },
          });
          function Qr(s, r) {
            return new ri(s, r);
          }
          var ta = ri.extend({
            defaultWmsParams: {
              service: "WMS",
              request: "GetMap",
              layers: "",
              styles: "",
              format: "image/jpeg",
              transparent: !1,
              version: "1.1.1",
            },
            options: { crs: null, uppercase: !1 },
            initialize: function (s, r) {
              this._url = s;
              var h = o({}, this.defaultWmsParams);
              for (var f in r) f in this.options || (h[f] = r[f]);
              r = b(this, r);
              var g = r.detectRetina && Z.retina ? 2 : 1,
                y = this.getTileSize();
              ((h.width = y.x * g), (h.height = y.y * g), (this.wmsParams = h));
            },
            onAdd: function (s) {
              ((this._crs = this.options.crs || s.options.crs),
                (this._wmsVersion = parseFloat(this.wmsParams.version)));
              var r = this._wmsVersion >= 1.3 ? "crs" : "srs";
              ((this.wmsParams[r] = this._crs.code),
                ri.prototype.onAdd.call(this, s));
            },
            getTileUrl: function (s) {
              var r = this._tileCoordsToNwSe(s),
                h = this._crs,
                f = mt(h.project(r[0]), h.project(r[1])),
                g = f.min,
                y = f.max,
                P = (
                  this._wmsVersion >= 1.3 && this._crs === Ur
                    ? [g.y, g.x, y.y, y.x]
                    : [g.x, g.y, y.x, y.y]
                ).join(","),
                S = ri.prototype.getTileUrl.call(this, s);
              return (
                S +
                w(this.wmsParams, S, this.options.uppercase) +
                (this.options.uppercase ? "&BBOX=" : "&bbox=") +
                P
              );
            },
            setParams: function (s, r) {
              return (o(this.wmsParams, s), r || this.redraw(), this);
            },
          });
          function $u(s, r) {
            return new ta(s, r);
          }
          ((ri.WMS = ta), (Qr.wms = $u));
          var fe = Kt.extend({
              options: { padding: 0.1 },
              initialize: function (s) {
                (b(this, s), u(this), (this._layers = this._layers || {}));
              },
              onAdd: function () {
                (this._container ||
                  (this._initContainer(),
                  X(this._container, "leaflet-zoom-animated")),
                  this.getPane().appendChild(this._container),
                  this._update(),
                  this.on("update", this._updatePaths, this));
              },
              onRemove: function () {
                (this.off("update", this._updatePaths, this),
                  this._destroyContainer());
              },
              getEvents: function () {
                var s = {
                  viewreset: this._reset,
                  zoom: this._onZoom,
                  moveend: this._update,
                  zoomend: this._onZoomEnd,
                };
                return (
                  this._zoomAnimated && (s.zoomanim = this._onAnimZoom),
                  s
                );
              },
              _onAnimZoom: function (s) {
                this._updateTransform(s.center, s.zoom);
              },
              _onZoom: function () {
                this._updateTransform(
                  this._map.getCenter(),
                  this._map.getZoom(),
                );
              },
              _updateTransform: function (s, r) {
                var h = this._map.getZoomScale(r, this._zoom),
                  f = this._map
                    .getSize()
                    .multiplyBy(0.5 + this.options.padding),
                  g = this._map.project(this._center, r),
                  y = f
                    .multiplyBy(-h)
                    .add(g)
                    .subtract(this._map._getNewPixelOrigin(s, r));
                Z.any3d ? Re(this._container, y, h) : St(this._container, y);
              },
              _reset: function () {
                (this._update(),
                  this._updateTransform(this._center, this._zoom));
                for (var s in this._layers) this._layers[s]._reset();
              },
              _onZoomEnd: function () {
                for (var s in this._layers) this._layers[s]._project();
              },
              _updatePaths: function () {
                for (var s in this._layers) this._layers[s]._update();
              },
              _update: function () {
                var s = this.options.padding,
                  r = this._map.getSize(),
                  h = this._map
                    .containerPointToLayerPoint(r.multiplyBy(-s))
                    .round();
                ((this._bounds = new nt(
                  h,
                  h.add(r.multiplyBy(1 + s * 2)).round(),
                )),
                  (this._center = this._map.getCenter()),
                  (this._zoom = this._map.getZoom()));
              },
            }),
            ea = fe.extend({
              options: { tolerance: 0 },
              getEvents: function () {
                var s = fe.prototype.getEvents.call(this);
                return ((s.viewprereset = this._onViewPreReset), s);
              },
              _onViewPreReset: function () {
                this._postponeUpdatePaths = !0;
              },
              onAdd: function () {
                (fe.prototype.onAdd.call(this), this._draw());
              },
              _initContainer: function () {
                var s = (this._container = document.createElement("canvas"));
                (K(s, "mousemove", this._onMouseMove, this),
                  K(
                    s,
                    "click dblclick mousedown mouseup contextmenu",
                    this._onClick,
                    this,
                  ),
                  K(s, "mouseout", this._handleMouseOut, this),
                  (s._leaflet_disable_events = !0),
                  (this._ctx = s.getContext("2d")));
              },
              _destroyContainer: function () {
                (j(this._redrawRequest),
                  delete this._ctx,
                  bt(this._container),
                  dt(this._container),
                  delete this._container);
              },
              _updatePaths: function () {
                if (!this._postponeUpdatePaths) {
                  var s;
                  this._redrawBounds = null;
                  for (var r in this._layers)
                    ((s = this._layers[r]), s._update());
                  this._redraw();
                }
              },
              _update: function () {
                if (!(this._map._animatingZoom && this._bounds)) {
                  fe.prototype._update.call(this);
                  var s = this._bounds,
                    r = this._container,
                    h = s.getSize(),
                    f = Z.retina ? 2 : 1;
                  (St(r, s.min),
                    (r.width = f * h.x),
                    (r.height = f * h.y),
                    (r.style.width = h.x + "px"),
                    (r.style.height = h.y + "px"),
                    Z.retina && this._ctx.scale(2, 2),
                    this._ctx.translate(-s.min.x, -s.min.y),
                    this.fire("update"));
                }
              },
              _reset: function () {
                (fe.prototype._reset.call(this),
                  this._postponeUpdatePaths &&
                    ((this._postponeUpdatePaths = !1), this._updatePaths()));
              },
              _initPath: function (s) {
                (this._updateDashArray(s), (this._layers[u(s)] = s));
                var r = (s._order = {
                  layer: s,
                  prev: this._drawLast,
                  next: null,
                });
                (this._drawLast && (this._drawLast.next = r),
                  (this._drawLast = r),
                  (this._drawFirst = this._drawFirst || this._drawLast));
              },
              _addPath: function (s) {
                this._requestRedraw(s);
              },
              _removePath: function (s) {
                var r = s._order,
                  h = r.next,
                  f = r.prev;
                (h ? (h.prev = f) : (this._drawLast = f),
                  f ? (f.next = h) : (this._drawFirst = h),
                  delete s._order,
                  delete this._layers[u(s)],
                  this._requestRedraw(s));
              },
              _updatePath: function (s) {
                (this._extendRedrawBounds(s),
                  s._project(),
                  s._update(),
                  this._requestRedraw(s));
              },
              _updateStyle: function (s) {
                (this._updateDashArray(s), this._requestRedraw(s));
              },
              _updateDashArray: function (s) {
                if (typeof s.options.dashArray == "string") {
                  var r = s.options.dashArray.split(/[, ]+/),
                    h = [],
                    f,
                    g;
                  for (g = 0; g < r.length; g++) {
                    if (((f = Number(r[g])), isNaN(f))) return;
                    h.push(f);
                  }
                  s.options._dashArray = h;
                } else s.options._dashArray = s.options.dashArray;
              },
              _requestRedraw: function (s) {
                this._map &&
                  (this._extendRedrawBounds(s),
                  (this._redrawRequest =
                    this._redrawRequest || W(this._redraw, this)));
              },
              _extendRedrawBounds: function (s) {
                if (s._pxBounds) {
                  var r = (s.options.weight || 0) + 1;
                  ((this._redrawBounds = this._redrawBounds || new nt()),
                    this._redrawBounds.extend(s._pxBounds.min.subtract([r, r])),
                    this._redrawBounds.extend(s._pxBounds.max.add([r, r])));
                }
              },
              _redraw: function () {
                ((this._redrawRequest = null),
                  this._redrawBounds &&
                    (this._redrawBounds.min._floor(),
                    this._redrawBounds.max._ceil()),
                  this._clear(),
                  this._draw(),
                  (this._redrawBounds = null));
              },
              _clear: function () {
                var s = this._redrawBounds;
                if (s) {
                  var r = s.getSize();
                  this._ctx.clearRect(s.min.x, s.min.y, r.x, r.y);
                } else
                  (this._ctx.save(),
                    this._ctx.setTransform(1, 0, 0, 1, 0, 0),
                    this._ctx.clearRect(
                      0,
                      0,
                      this._container.width,
                      this._container.height,
                    ),
                    this._ctx.restore());
              },
              _draw: function () {
                var s,
                  r = this._redrawBounds;
                if ((this._ctx.save(), r)) {
                  var h = r.getSize();
                  (this._ctx.beginPath(),
                    this._ctx.rect(r.min.x, r.min.y, h.x, h.y),
                    this._ctx.clip());
                }
                this._drawing = !0;
                for (var f = this._drawFirst; f; f = f.next)
                  ((s = f.layer),
                    (!r || (s._pxBounds && s._pxBounds.intersects(r))) &&
                      s._updatePath());
                ((this._drawing = !1), this._ctx.restore());
              },
              _updatePoly: function (s, r) {
                if (this._drawing) {
                  var h,
                    f,
                    g,
                    y,
                    P = s._parts,
                    S = P.length,
                    M = this._ctx;
                  if (S) {
                    for (M.beginPath(), h = 0; h < S; h++) {
                      for (f = 0, g = P[h].length; f < g; f++)
                        ((y = P[h][f]), M[f ? "lineTo" : "moveTo"](y.x, y.y));
                      r && M.closePath();
                    }
                    this._fillStroke(M, s);
                  }
                }
              },
              _updateCircle: function (s) {
                if (!(!this._drawing || s._empty())) {
                  var r = s._point,
                    h = this._ctx,
                    f = Math.max(Math.round(s._radius), 1),
                    g = (Math.max(Math.round(s._radiusY), 1) || f) / f;
                  (g !== 1 && (h.save(), h.scale(1, g)),
                    h.beginPath(),
                    h.arc(r.x, r.y / g, f, 0, Math.PI * 2, !1),
                    g !== 1 && h.restore(),
                    this._fillStroke(h, s));
                }
              },
              _fillStroke: function (s, r) {
                var h = r.options;
                (h.fill &&
                  ((s.globalAlpha = h.fillOpacity),
                  (s.fillStyle = h.fillColor || h.color),
                  s.fill(h.fillRule || "evenodd")),
                  h.stroke &&
                    h.weight !== 0 &&
                    (s.setLineDash &&
                      s.setLineDash((r.options && r.options._dashArray) || []),
                    (s.globalAlpha = h.opacity),
                    (s.lineWidth = h.weight),
                    (s.strokeStyle = h.color),
                    (s.lineCap = h.lineCap),
                    (s.lineJoin = h.lineJoin),
                    s.stroke()));
              },
              _onClick: function (s) {
                for (
                  var r = this._map.mouseEventToLayerPoint(s),
                    h,
                    f,
                    g = this._drawFirst;
                  g;
                  g = g.next
                )
                  ((h = g.layer),
                    h.options.interactive &&
                      h._containsPoint(r) &&
                      (!(s.type === "click" || s.type === "preclick") ||
                        !this._map._draggableMoved(h)) &&
                      (f = h));
                this._fireEvent(f ? [f] : !1, s);
              },
              _onMouseMove: function (s) {
                if (
                  !(
                    !this._map ||
                    this._map.dragging.moving() ||
                    this._map._animatingZoom
                  )
                ) {
                  var r = this._map.mouseEventToLayerPoint(s);
                  this._handleMouseHover(s, r);
                }
              },
              _handleMouseOut: function (s) {
                var r = this._hoveredLayer;
                r &&
                  (Pt(this._container, "leaflet-interactive"),
                  this._fireEvent([r], s, "mouseout"),
                  (this._hoveredLayer = null),
                  (this._mouseHoverThrottled = !1));
              },
              _handleMouseHover: function (s, r) {
                if (!this._mouseHoverThrottled) {
                  for (var h, f, g = this._drawFirst; g; g = g.next)
                    ((h = g.layer),
                      h.options.interactive && h._containsPoint(r) && (f = h));
                  (f !== this._hoveredLayer &&
                    (this._handleMouseOut(s),
                    f &&
                      (X(this._container, "leaflet-interactive"),
                      this._fireEvent([f], s, "mouseover"),
                      (this._hoveredLayer = f))),
                    this._fireEvent(
                      this._hoveredLayer ? [this._hoveredLayer] : !1,
                      s,
                    ),
                    (this._mouseHoverThrottled = !0),
                    setTimeout(
                      l(function () {
                        this._mouseHoverThrottled = !1;
                      }, this),
                      32,
                    ));
                }
              },
              _fireEvent: function (s, r, h) {
                this._map._fireDOMEvent(r, h || r.type, s);
              },
              _bringToFront: function (s) {
                var r = s._order;
                if (r) {
                  var h = r.next,
                    f = r.prev;
                  if (h) h.prev = f;
                  else return;
                  (f ? (f.next = h) : h && (this._drawFirst = h),
                    (r.prev = this._drawLast),
                    (this._drawLast.next = r),
                    (r.next = null),
                    (this._drawLast = r),
                    this._requestRedraw(s));
                }
              },
              _bringToBack: function (s) {
                var r = s._order;
                if (r) {
                  var h = r.next,
                    f = r.prev;
                  if (f) f.next = h;
                  else return;
                  (h ? (h.prev = f) : f && (this._drawLast = f),
                    (r.prev = null),
                    (r.next = this._drawFirst),
                    (this._drawFirst.prev = r),
                    (this._drawFirst = r),
                    this._requestRedraw(s));
                }
              },
            });
          function ia(s) {
            return Z.canvas ? new ea(s) : null;
          }
          var Li = (function () {
              try {
                return (
                  document.namespaces.add(
                    "lvml",
                    "urn:schemas-microsoft-com:vml",
                  ),
                  function (s) {
                    return document.createElement(
                      "<lvml:" + s + ' class="lvml">',
                    );
                  }
                );
              } catch {}
              return function (s) {
                return document.createElement(
                  "<" +
                    s +
                    ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">',
                );
              };
            })(),
            Uu = {
              _initContainer: function () {
                this._container = at("div", "leaflet-vml-container");
              },
              _update: function () {
                this._map._animatingZoom ||
                  (fe.prototype._update.call(this), this.fire("update"));
              },
              _initPath: function (s) {
                var r = (s._container = Li("shape"));
                (X(r, "leaflet-vml-shape " + (this.options.className || "")),
                  (r.coordsize = "1 1"),
                  (s._path = Li("path")),
                  r.appendChild(s._path),
                  this._updateStyle(s),
                  (this._layers[u(s)] = s));
              },
              _addPath: function (s) {
                var r = s._container;
                (this._container.appendChild(r),
                  s.options.interactive && s.addInteractiveTarget(r));
              },
              _removePath: function (s) {
                var r = s._container;
                (bt(r),
                  s.removeInteractiveTarget(r),
                  delete this._layers[u(s)]);
              },
              _updateStyle: function (s) {
                var r = s._stroke,
                  h = s._fill,
                  f = s.options,
                  g = s._container;
                ((g.stroked = !!f.stroke),
                  (g.filled = !!f.fill),
                  f.stroke
                    ? (r || (r = s._stroke = Li("stroke")),
                      g.appendChild(r),
                      (r.weight = f.weight + "px"),
                      (r.color = f.color),
                      (r.opacity = f.opacity),
                      f.dashArray
                        ? (r.dashStyle = E(f.dashArray)
                            ? f.dashArray.join(" ")
                            : f.dashArray.replace(/( *, *)/g, " "))
                        : (r.dashStyle = ""),
                      (r.endcap = f.lineCap.replace("butt", "flat")),
                      (r.joinstyle = f.lineJoin))
                    : r && (g.removeChild(r), (s._stroke = null)),
                  f.fill
                    ? (h || (h = s._fill = Li("fill")),
                      g.appendChild(h),
                      (h.color = f.fillColor || f.color),
                      (h.opacity = f.fillOpacity))
                    : h && (g.removeChild(h), (s._fill = null)));
              },
              _updateCircle: function (s) {
                var r = s._point.round(),
                  h = Math.round(s._radius),
                  f = Math.round(s._radiusY || h);
                this._setPath(
                  s,
                  s._empty()
                    ? "M0 0"
                    : "AL " +
                        r.x +
                        "," +
                        r.y +
                        " " +
                        h +
                        "," +
                        f +
                        " 0," +
                        65535 * 360,
                );
              },
              _setPath: function (s, r) {
                s._path.v = r;
              },
              _bringToFront: function (s) {
                ti(s._container);
              },
              _bringToBack: function (s) {
                ei(s._container);
              },
            },
            bn = Z.vml ? Li : rr,
            Ci = fe.extend({
              _initContainer: function () {
                ((this._container = bn("svg")),
                  this._container.setAttribute("pointer-events", "none"),
                  (this._rootGroup = bn("g")),
                  this._container.appendChild(this._rootGroup));
              },
              _destroyContainer: function () {
                (bt(this._container),
                  dt(this._container),
                  delete this._container,
                  delete this._rootGroup,
                  delete this._svgSize);
              },
              _update: function () {
                if (!(this._map._animatingZoom && this._bounds)) {
                  fe.prototype._update.call(this);
                  var s = this._bounds,
                    r = s.getSize(),
                    h = this._container;
                  ((!this._svgSize || !this._svgSize.equals(r)) &&
                    ((this._svgSize = r),
                    h.setAttribute("width", r.x),
                    h.setAttribute("height", r.y)),
                    St(h, s.min),
                    h.setAttribute(
                      "viewBox",
                      [s.min.x, s.min.y, r.x, r.y].join(" "),
                    ),
                    this.fire("update"));
                }
              },
              _initPath: function (s) {
                var r = (s._path = bn("path"));
                (s.options.className && X(r, s.options.className),
                  s.options.interactive && X(r, "leaflet-interactive"),
                  this._updateStyle(s),
                  (this._layers[u(s)] = s));
              },
              _addPath: function (s) {
                (this._rootGroup || this._initContainer(),
                  this._rootGroup.appendChild(s._path),
                  s.addInteractiveTarget(s._path));
              },
              _removePath: function (s) {
                (bt(s._path),
                  s.removeInteractiveTarget(s._path),
                  delete this._layers[u(s)]);
              },
              _updatePath: function (s) {
                (s._project(), s._update());
              },
              _updateStyle: function (s) {
                var r = s._path,
                  h = s.options;
                r &&
                  (h.stroke
                    ? (r.setAttribute("stroke", h.color),
                      r.setAttribute("stroke-opacity", h.opacity),
                      r.setAttribute("stroke-width", h.weight),
                      r.setAttribute("stroke-linecap", h.lineCap),
                      r.setAttribute("stroke-linejoin", h.lineJoin),
                      h.dashArray
                        ? r.setAttribute("stroke-dasharray", h.dashArray)
                        : r.removeAttribute("stroke-dasharray"),
                      h.dashOffset
                        ? r.setAttribute("stroke-dashoffset", h.dashOffset)
                        : r.removeAttribute("stroke-dashoffset"))
                    : r.setAttribute("stroke", "none"),
                  h.fill
                    ? (r.setAttribute("fill", h.fillColor || h.color),
                      r.setAttribute("fill-opacity", h.fillOpacity),
                      r.setAttribute("fill-rule", h.fillRule || "evenodd"))
                    : r.setAttribute("fill", "none"));
              },
              _updatePoly: function (s, r) {
                this._setPath(s, ar(s._parts, r));
              },
              _updateCircle: function (s) {
                var r = s._point,
                  h = Math.max(Math.round(s._radius), 1),
                  f = Math.max(Math.round(s._radiusY), 1) || h,
                  g = "a" + h + "," + f + " 0 1,0 ",
                  y = s._empty()
                    ? "M0 0"
                    : "M" +
                      (r.x - h) +
                      "," +
                      r.y +
                      g +
                      h * 2 +
                      ",0 " +
                      g +
                      -h * 2 +
                      ",0 ";
                this._setPath(s, y);
              },
              _setPath: function (s, r) {
                s._path.setAttribute("d", r);
              },
              _bringToFront: function (s) {
                ti(s._path);
              },
              _bringToBack: function (s) {
                ei(s._path);
              },
            });
          Z.vml && Ci.include(Uu);
          function na(s) {
            return Z.svg || Z.vml ? new Ci(s) : null;
          }
          ot.include({
            getRenderer: function (s) {
              var r =
                s.options.renderer ||
                this._getPaneRenderer(s.options.pane) ||
                this.options.renderer ||
                this._renderer;
              return (
                r || (r = this._renderer = this._createRenderer()),
                this.hasLayer(r) || this.addLayer(r),
                r
              );
            },
            _getPaneRenderer: function (s) {
              if (s === "overlayPane" || s === void 0) return !1;
              var r = this._paneRenderers[s];
              return (
                r === void 0 &&
                  ((r = this._createRenderer({ pane: s })),
                  (this._paneRenderers[s] = r)),
                r
              );
            },
            _createRenderer: function (s) {
              return (this.options.preferCanvas && ia(s)) || na(s);
            },
          });
          var sa = si.extend({
            initialize: function (s, r) {
              si.prototype.initialize.call(this, this._boundsToLatLngs(s), r);
            },
            setBounds: function (s) {
              return this.setLatLngs(this._boundsToLatLngs(s));
            },
            _boundsToLatLngs: function (s) {
              return (
                (s = Q(s)),
                [
                  s.getSouthWest(),
                  s.getNorthWest(),
                  s.getNorthEast(),
                  s.getSouthEast(),
                ]
              );
            },
          });
          function qu(s, r) {
            return new sa(s, r);
          }
          ((Ci.create = bn),
            (Ci.pointsToPath = ar),
            (de.geometryToLayer = fn),
            (de.coordsToLatLng = js),
            (de.coordsToLatLngs = pn),
            (de.latLngToCoords = $s),
            (de.latLngsToCoords = gn),
            (de.getFeature = oi),
            (de.asFeature = mn),
            ot.mergeOptions({ boxZoom: !0 }));
          var oa = ee.extend({
            initialize: function (s) {
              ((this._map = s),
                (this._container = s._container),
                (this._pane = s._panes.overlayPane),
                (this._resetStateTimeout = 0),
                s.on("unload", this._destroy, this));
            },
            addHooks: function () {
              K(this._container, "mousedown", this._onMouseDown, this);
            },
            removeHooks: function () {
              dt(this._container, "mousedown", this._onMouseDown, this);
            },
            moved: function () {
              return this._moved;
            },
            _destroy: function () {
              (bt(this._pane), delete this._pane);
            },
            _resetState: function () {
              ((this._resetStateTimeout = 0), (this._moved = !1));
            },
            _clearDeferredResetState: function () {
              this._resetStateTimeout !== 0 &&
                (clearTimeout(this._resetStateTimeout),
                (this._resetStateTimeout = 0));
            },
            _onMouseDown: function (s) {
              if (!s.shiftKey || (s.which !== 1 && s.button !== 1)) return !1;
              (this._clearDeferredResetState(),
                this._resetState(),
                vi(),
                Ls(),
                (this._startPoint = this._map.mouseEventToContainerPoint(s)),
                K(
                  document,
                  {
                    contextmenu: Fe,
                    mousemove: this._onMouseMove,
                    mouseup: this._onMouseUp,
                    keydown: this._onKeyDown,
                  },
                  this,
                ));
            },
            _onMouseMove: function (s) {
              (this._moved ||
                ((this._moved = !0),
                (this._box = at("div", "leaflet-zoom-box", this._container)),
                X(this._container, "leaflet-crosshair"),
                this._map.fire("boxzoomstart")),
                (this._point = this._map.mouseEventToContainerPoint(s)));
              var r = new nt(this._point, this._startPoint),
                h = r.getSize();
              (St(this._box, r.min),
                (this._box.style.width = h.x + "px"),
                (this._box.style.height = h.y + "px"));
            },
            _finish: function () {
              (this._moved &&
                (bt(this._box), Pt(this._container, "leaflet-crosshair")),
                bi(),
                Cs(),
                dt(
                  document,
                  {
                    contextmenu: Fe,
                    mousemove: this._onMouseMove,
                    mouseup: this._onMouseUp,
                    keydown: this._onKeyDown,
                  },
                  this,
                ));
            },
            _onMouseUp: function (s) {
              if (
                !(s.which !== 1 && s.button !== 1) &&
                (this._finish(), !!this._moved)
              ) {
                (this._clearDeferredResetState(),
                  (this._resetStateTimeout = setTimeout(
                    l(this._resetState, this),
                    0,
                  )));
                var r = new vt(
                  this._map.containerPointToLatLng(this._startPoint),
                  this._map.containerPointToLatLng(this._point),
                );
                this._map.fitBounds(r).fire("boxzoomend", { boxZoomBounds: r });
              }
            },
            _onKeyDown: function (s) {
              s.keyCode === 27 &&
                (this._finish(),
                this._clearDeferredResetState(),
                this._resetState());
            },
          });
          (ot.addInitHook("addHandler", "boxZoom", oa),
            ot.mergeOptions({ doubleClickZoom: !0 }));
          var ra = ee.extend({
            addHooks: function () {
              this._map.on("dblclick", this._onDoubleClick, this);
            },
            removeHooks: function () {
              this._map.off("dblclick", this._onDoubleClick, this);
            },
            _onDoubleClick: function (s) {
              var r = this._map,
                h = r.getZoom(),
                f = r.options.zoomDelta,
                g = s.originalEvent.shiftKey ? h - f : h + f;
              r.options.doubleClickZoom === "center"
                ? r.setZoom(g)
                : r.setZoomAround(s.containerPoint, g);
            },
          });
          (ot.addInitHook("addHandler", "doubleClickZoom", ra),
            ot.mergeOptions({
              dragging: !0,
              inertia: !0,
              inertiaDeceleration: 3400,
              inertiaMaxSpeed: 1 / 0,
              easeLinearity: 0.2,
              worldCopyJump: !1,
              maxBoundsViscosity: 0,
            }));
          var aa = ee.extend({
            addHooks: function () {
              if (!this._draggable) {
                var s = this._map;
                ((this._draggable = new Pe(s._mapPane, s._container)),
                  this._draggable.on(
                    {
                      dragstart: this._onDragStart,
                      drag: this._onDrag,
                      dragend: this._onDragEnd,
                    },
                    this,
                  ),
                  this._draggable.on("predrag", this._onPreDragLimit, this),
                  s.options.worldCopyJump &&
                    (this._draggable.on("predrag", this._onPreDragWrap, this),
                    s.on("zoomend", this._onZoomEnd, this),
                    s.whenReady(this._onZoomEnd, this)));
              }
              (X(this._map._container, "leaflet-grab leaflet-touch-drag"),
                this._draggable.enable(),
                (this._positions = []),
                (this._times = []));
            },
            removeHooks: function () {
              (Pt(this._map._container, "leaflet-grab"),
                Pt(this._map._container, "leaflet-touch-drag"),
                this._draggable.disable());
            },
            moved: function () {
              return this._draggable && this._draggable._moved;
            },
            moving: function () {
              return this._draggable && this._draggable._moving;
            },
            _onDragStart: function () {
              var s = this._map;
              if (
                (s._stop(),
                this._map.options.maxBounds &&
                  this._map.options.maxBoundsViscosity)
              ) {
                var r = Q(this._map.options.maxBounds);
                ((this._offsetLimit = mt(
                  this._map
                    .latLngToContainerPoint(r.getNorthWest())
                    .multiplyBy(-1),
                  this._map
                    .latLngToContainerPoint(r.getSouthEast())
                    .multiplyBy(-1)
                    .add(this._map.getSize()),
                )),
                  (this._viscosity = Math.min(
                    1,
                    Math.max(0, this._map.options.maxBoundsViscosity),
                  )));
              } else this._offsetLimit = null;
              (s.fire("movestart").fire("dragstart"),
                s.options.inertia &&
                  ((this._positions = []), (this._times = [])));
            },
            _onDrag: function (s) {
              if (this._map.options.inertia) {
                var r = (this._lastTime = +new Date()),
                  h = (this._lastPos =
                    this._draggable._absPos || this._draggable._newPos);
                (this._positions.push(h),
                  this._times.push(r),
                  this._prunePositions(r));
              }
              this._map.fire("move", s).fire("drag", s);
            },
            _prunePositions: function (s) {
              for (; this._positions.length > 1 && s - this._times[0] > 50; )
                (this._positions.shift(), this._times.shift());
            },
            _onZoomEnd: function () {
              var s = this._map.getSize().divideBy(2),
                r = this._map.latLngToLayerPoint([0, 0]);
              ((this._initialWorldOffset = r.subtract(s).x),
                (this._worldWidth = this._map
                  .getPixelWorldBounds()
                  .getSize().x));
            },
            _viscousLimit: function (s, r) {
              return s - (s - r) * this._viscosity;
            },
            _onPreDragLimit: function () {
              if (!(!this._viscosity || !this._offsetLimit)) {
                var s = this._draggable._newPos.subtract(
                    this._draggable._startPos,
                  ),
                  r = this._offsetLimit;
                (s.x < r.min.x && (s.x = this._viscousLimit(s.x, r.min.x)),
                  s.y < r.min.y && (s.y = this._viscousLimit(s.y, r.min.y)),
                  s.x > r.max.x && (s.x = this._viscousLimit(s.x, r.max.x)),
                  s.y > r.max.y && (s.y = this._viscousLimit(s.y, r.max.y)),
                  (this._draggable._newPos = this._draggable._startPos.add(s)));
              }
            },
            _onPreDragWrap: function () {
              var s = this._worldWidth,
                r = Math.round(s / 2),
                h = this._initialWorldOffset,
                f = this._draggable._newPos.x,
                g = ((f - r + h) % s) + r - h,
                y = ((f + r + h) % s) - r - h,
                P = Math.abs(g + h) < Math.abs(y + h) ? g : y;
              ((this._draggable._absPos = this._draggable._newPos.clone()),
                (this._draggable._newPos.x = P));
            },
            _onDragEnd: function (s) {
              var r = this._map,
                h = r.options,
                f = !h.inertia || s.noInertia || this._times.length < 2;
              if ((r.fire("dragend", s), f)) r.fire("moveend");
              else {
                this._prunePositions(+new Date());
                var g = this._lastPos.subtract(this._positions[0]),
                  y = (this._lastTime - this._times[0]) / 1e3,
                  P = h.easeLinearity,
                  S = g.multiplyBy(P / y),
                  M = S.distanceTo([0, 0]),
                  O = Math.min(h.inertiaMaxSpeed, M),
                  N = S.multiplyBy(O / M),
                  $ = O / (h.inertiaDeceleration * P),
                  J = N.multiplyBy(-$ / 2).round();
                !J.x && !J.y
                  ? r.fire("moveend")
                  : ((J = r._limitOffset(J, r.options.maxBounds)),
                    W(function () {
                      r.panBy(J, {
                        duration: $,
                        easeLinearity: P,
                        noMoveStart: !0,
                        animate: !0,
                      });
                    }));
              }
            },
          });
          (ot.addInitHook("addHandler", "dragging", aa),
            ot.mergeOptions({ keyboard: !0, keyboardPanDelta: 80 }));
          var la = ee.extend({
            keyCodes: {
              left: [37],
              right: [39],
              down: [40],
              up: [38],
              zoomIn: [187, 107, 61, 171],
              zoomOut: [189, 109, 54, 173],
            },
            initialize: function (s) {
              ((this._map = s),
                this._setPanDelta(s.options.keyboardPanDelta),
                this._setZoomDelta(s.options.zoomDelta));
            },
            addHooks: function () {
              var s = this._map._container;
              (s.tabIndex <= 0 && (s.tabIndex = "0"),
                K(
                  s,
                  {
                    focus: this._onFocus,
                    blur: this._onBlur,
                    mousedown: this._onMouseDown,
                  },
                  this,
                ),
                this._map.on(
                  { focus: this._addHooks, blur: this._removeHooks },
                  this,
                ));
            },
            removeHooks: function () {
              (this._removeHooks(),
                dt(
                  this._map._container,
                  {
                    focus: this._onFocus,
                    blur: this._onBlur,
                    mousedown: this._onMouseDown,
                  },
                  this,
                ),
                this._map.off(
                  { focus: this._addHooks, blur: this._removeHooks },
                  this,
                ));
            },
            _onMouseDown: function () {
              if (!this._focused) {
                var s = document.body,
                  r = document.documentElement,
                  h = s.scrollTop || r.scrollTop,
                  f = s.scrollLeft || r.scrollLeft;
                (this._map._container.focus(), window.scrollTo(f, h));
              }
            },
            _onFocus: function () {
              ((this._focused = !0), this._map.fire("focus"));
            },
            _onBlur: function () {
              ((this._focused = !1), this._map.fire("blur"));
            },
            _setPanDelta: function (s) {
              var r = (this._panKeys = {}),
                h = this.keyCodes,
                f,
                g;
              for (f = 0, g = h.left.length; f < g; f++)
                r[h.left[f]] = [-1 * s, 0];
              for (f = 0, g = h.right.length; f < g; f++)
                r[h.right[f]] = [s, 0];
              for (f = 0, g = h.down.length; f < g; f++) r[h.down[f]] = [0, s];
              for (f = 0, g = h.up.length; f < g; f++) r[h.up[f]] = [0, -1 * s];
            },
            _setZoomDelta: function (s) {
              var r = (this._zoomKeys = {}),
                h = this.keyCodes,
                f,
                g;
              for (f = 0, g = h.zoomIn.length; f < g; f++) r[h.zoomIn[f]] = s;
              for (f = 0, g = h.zoomOut.length; f < g; f++)
                r[h.zoomOut[f]] = -s;
            },
            _addHooks: function () {
              K(document, "keydown", this._onKeyDown, this);
            },
            _removeHooks: function () {
              dt(document, "keydown", this._onKeyDown, this);
            },
            _onKeyDown: function (s) {
              if (!(s.altKey || s.ctrlKey || s.metaKey)) {
                var r = s.keyCode,
                  h = this._map,
                  f;
                if (r in this._panKeys) {
                  if (!h._panAnim || !h._panAnim._inProgress)
                    if (
                      ((f = this._panKeys[r]),
                      s.shiftKey && (f = V(f).multiplyBy(3)),
                      h.options.maxBounds &&
                        (f = h._limitOffset(V(f), h.options.maxBounds)),
                      h.options.worldCopyJump)
                    ) {
                      var g = h.wrapLatLng(
                        h.unproject(h.project(h.getCenter()).add(f)),
                      );
                      h.panTo(g);
                    } else h.panBy(f);
                } else if (r in this._zoomKeys)
                  h.setZoom(
                    h.getZoom() + (s.shiftKey ? 3 : 1) * this._zoomKeys[r],
                  );
                else if (
                  r === 27 &&
                  h._popup &&
                  h._popup.options.closeOnEscapeKey
                )
                  h.closePopup();
                else return;
                Fe(s);
              }
            },
          });
          (ot.addInitHook("addHandler", "keyboard", la),
            ot.mergeOptions({
              scrollWheelZoom: !0,
              wheelDebounceTime: 40,
              wheelPxPerZoomLevel: 60,
            }));
          var ca = ee.extend({
            addHooks: function () {
              (K(this._map._container, "wheel", this._onWheelScroll, this),
                (this._delta = 0));
            },
            removeHooks: function () {
              dt(this._map._container, "wheel", this._onWheelScroll, this);
            },
            _onWheelScroll: function (s) {
              var r = Ir(s),
                h = this._map.options.wheelDebounceTime;
              ((this._delta += r),
                (this._lastMousePos = this._map.mouseEventToContainerPoint(s)),
                this._startTime || (this._startTime = +new Date()));
              var f = Math.max(h - (+new Date() - this._startTime), 0);
              (clearTimeout(this._timer),
                (this._timer = setTimeout(l(this._performZoom, this), f)),
                Fe(s));
            },
            _performZoom: function () {
              var s = this._map,
                r = s.getZoom(),
                h = this._map.options.zoomSnap || 0;
              s._stop();
              var f = this._delta / (this._map.options.wheelPxPerZoomLevel * 4),
                g = (4 * Math.log(2 / (1 + Math.exp(-Math.abs(f))))) / Math.LN2,
                y = h ? Math.ceil(g / h) * h : g,
                P = s._limitZoom(r + (this._delta > 0 ? y : -y)) - r;
              ((this._delta = 0),
                (this._startTime = null),
                P &&
                  (s.options.scrollWheelZoom === "center"
                    ? s.setZoom(r + P)
                    : s.setZoomAround(this._lastMousePos, r + P)));
            },
          });
          ot.addInitHook("addHandler", "scrollWheelZoom", ca);
          var Yu = 600;
          ot.mergeOptions({
            tapHold: Z.touchNative && Z.safari && Z.mobile,
            tapTolerance: 15,
          });
          var ha = ee.extend({
            addHooks: function () {
              K(this._map._container, "touchstart", this._onDown, this);
            },
            removeHooks: function () {
              dt(this._map._container, "touchstart", this._onDown, this);
            },
            _onDown: function (s) {
              if ((clearTimeout(this._holdTimeout), s.touches.length === 1)) {
                var r = s.touches[0];
                ((this._startPos = this._newPos = new F(r.clientX, r.clientY)),
                  (this._holdTimeout = setTimeout(
                    l(function () {
                      (this._cancel(),
                        this._isTapValid() &&
                          (K(document, "touchend", At),
                          K(
                            document,
                            "touchend touchcancel",
                            this._cancelClickPrevent,
                          ),
                          this._simulateEvent("contextmenu", r)));
                    }, this),
                    Yu,
                  )),
                  K(
                    document,
                    "touchend touchcancel contextmenu",
                    this._cancel,
                    this,
                  ),
                  K(document, "touchmove", this._onMove, this));
              }
            },
            _cancelClickPrevent: function s() {
              (dt(document, "touchend", At),
                dt(document, "touchend touchcancel", s));
            },
            _cancel: function () {
              (clearTimeout(this._holdTimeout),
                dt(
                  document,
                  "touchend touchcancel contextmenu",
                  this._cancel,
                  this,
                ),
                dt(document, "touchmove", this._onMove, this));
            },
            _onMove: function (s) {
              var r = s.touches[0];
              this._newPos = new F(r.clientX, r.clientY);
            },
            _isTapValid: function () {
              return (
                this._newPos.distanceTo(this._startPos) <=
                this._map.options.tapTolerance
              );
            },
            _simulateEvent: function (s, r) {
              var h = new MouseEvent(s, {
                bubbles: !0,
                cancelable: !0,
                view: window,
                screenX: r.screenX,
                screenY: r.screenY,
                clientX: r.clientX,
                clientY: r.clientY,
              });
              ((h._simulated = !0), r.target.dispatchEvent(h));
            },
          });
          (ot.addInitHook("addHandler", "tapHold", ha),
            ot.mergeOptions({ touchZoom: Z.touch, bounceAtZoomLimits: !0 }));
          var ua = ee.extend({
            addHooks: function () {
              (X(this._map._container, "leaflet-touch-zoom"),
                K(
                  this._map._container,
                  "touchstart",
                  this._onTouchStart,
                  this,
                ));
            },
            removeHooks: function () {
              (Pt(this._map._container, "leaflet-touch-zoom"),
                dt(
                  this._map._container,
                  "touchstart",
                  this._onTouchStart,
                  this,
                ));
            },
            _onTouchStart: function (s) {
              var r = this._map;
              if (
                !(
                  !s.touches ||
                  s.touches.length !== 2 ||
                  r._animatingZoom ||
                  this._zooming
                )
              ) {
                var h = r.mouseEventToContainerPoint(s.touches[0]),
                  f = r.mouseEventToContainerPoint(s.touches[1]);
                ((this._centerPoint = r.getSize()._divideBy(2)),
                  (this._startLatLng = r.containerPointToLatLng(
                    this._centerPoint,
                  )),
                  r.options.touchZoom !== "center" &&
                    (this._pinchStartLatLng = r.containerPointToLatLng(
                      h.add(f)._divideBy(2),
                    )),
                  (this._startDist = h.distanceTo(f)),
                  (this._startZoom = r.getZoom()),
                  (this._moved = !1),
                  (this._zooming = !0),
                  r._stop(),
                  K(document, "touchmove", this._onTouchMove, this),
                  K(document, "touchend touchcancel", this._onTouchEnd, this),
                  At(s));
              }
            },
            _onTouchMove: function (s) {
              if (!(!s.touches || s.touches.length !== 2 || !this._zooming)) {
                var r = this._map,
                  h = r.mouseEventToContainerPoint(s.touches[0]),
                  f = r.mouseEventToContainerPoint(s.touches[1]),
                  g = h.distanceTo(f) / this._startDist;
                if (
                  ((this._zoom = r.getScaleZoom(g, this._startZoom)),
                  !r.options.bounceAtZoomLimits &&
                    ((this._zoom < r.getMinZoom() && g < 1) ||
                      (this._zoom > r.getMaxZoom() && g > 1)) &&
                    (this._zoom = r._limitZoom(this._zoom)),
                  r.options.touchZoom === "center")
                ) {
                  if (((this._center = this._startLatLng), g === 1)) return;
                } else {
                  var y = h._add(f)._divideBy(2)._subtract(this._centerPoint);
                  if (g === 1 && y.x === 0 && y.y === 0) return;
                  this._center = r.unproject(
                    r.project(this._pinchStartLatLng, this._zoom).subtract(y),
                    this._zoom,
                  );
                }
                (this._moved || (r._moveStart(!0, !1), (this._moved = !0)),
                  j(this._animRequest));
                var P = l(
                  r._move,
                  r,
                  this._center,
                  this._zoom,
                  { pinch: !0, round: !1 },
                  void 0,
                );
                ((this._animRequest = W(P, this, !0)), At(s));
              }
            },
            _onTouchEnd: function () {
              if (!this._moved || !this._zooming) {
                this._zooming = !1;
                return;
              }
              ((this._zooming = !1),
                j(this._animRequest),
                dt(document, "touchmove", this._onTouchMove, this),
                dt(document, "touchend touchcancel", this._onTouchEnd, this),
                this._map.options.zoomAnimation
                  ? this._map._animateZoom(
                      this._center,
                      this._map._limitZoom(this._zoom),
                      !0,
                      this._map.options.zoomSnap,
                    )
                  : this._map._resetView(
                      this._center,
                      this._map._limitZoom(this._zoom),
                    ));
            },
          });
          (ot.addInitHook("addHandler", "touchZoom", ua),
            (ot.BoxZoom = oa),
            (ot.DoubleClickZoom = ra),
            (ot.Drag = aa),
            (ot.Keyboard = la),
            (ot.ScrollWheelZoom = ca),
            (ot.TapHold = ha),
            (ot.TouchZoom = ua),
            (e.Bounds = nt),
            (e.Browser = Z),
            (e.CRS = ce),
            (e.Canvas = ea),
            (e.Circle = Zs),
            (e.CircleMarker = dn),
            (e.Class = ut),
            (e.Control = Gt),
            (e.DivIcon = Jr),
            (e.DivOverlay = ie),
            (e.DomEvent = du),
            (e.DomUtil = hu),
            (e.Draggable = Pe),
            (e.Evented = ct),
            (e.FeatureGroup = he),
            (e.GeoJSON = de),
            (e.GridLayer = Mi),
            (e.Handler = ee),
            (e.Icon = ni),
            (e.ImageOverlay = _n),
            (e.LatLng = st),
            (e.LatLngBounds = vt),
            (e.Layer = Kt),
            (e.LayerGroup = ii),
            (e.LineUtil = Su),
            (e.Map = ot),
            (e.Marker = un),
            (e.Mixin = vu),
            (e.Path = ke),
            (e.Point = F),
            (e.PolyUtil = bu),
            (e.Polygon = si),
            (e.Polyline = ue),
            (e.Popup = yn),
            (e.PosAnimation = Br),
            (e.Projection = Mu),
            (e.Rectangle = sa),
            (e.Renderer = fe),
            (e.SVG = Ci),
            (e.SVGOverlay = Xr),
            (e.TileLayer = ri),
            (e.Tooltip = vn),
            (e.Transformation = gs),
            (e.Util = xt),
            (e.VideoOverlay = Kr),
            (e.bind = l),
            (e.bounds = mt),
            (e.canvas = ia),
            (e.circle = Bu),
            (e.circleMarker = Iu),
            (e.control = Pi),
            (e.divIcon = Zu),
            (e.extend = o),
            (e.featureGroup = Eu),
            (e.geoJSON = Gr),
            (e.geoJson = zu),
            (e.gridLayer = ju),
            (e.icon = Au),
            (e.imageOverlay = Nu),
            (e.latLng = G),
            (e.latLngBounds = Q),
            (e.layerGroup = Tu),
            (e.map = fu),
            (e.marker = Ou),
            (e.point = V),
            (e.polygon = Ru),
            (e.polyline = Du),
            (e.popup = Wu),
            (e.rectangle = qu),
            (e.setOptions = b),
            (e.stamp = u),
            (e.svg = na),
            (e.svgOverlay = Hu),
            (e.tileLayer = Qr),
            (e.tooltip = Vu),
            (e.transformation = gi),
            (e.version = n),
            (e.videoOverlay = Fu));
          var Gu = window.L;
          ((e.noConflict = function () {
            return ((window.L = Gu), this);
          }),
            (window.L = e));
        });
      })(Hi, Hi.exports)),
    Hi.exports
  );
}
var Ry = Dy();
const oe = Iy(Ry),
  dh = JSON.parse(
    `[{"pais_codigo":"GB","pais":"United Kingdom","capital":"London","latitud":51.5074456,"longitud":-0.1277653},{"pais_codigo":"NZ","pais":"New Zealand","capital":"Wellington","latitud":-41.2887953,"longitud":174.7772114},{"pais_codigo":"GR","pais":"Greece","capital":"Athens","latitud":37.9755648,"longitud":23.7348324},{"pais_codigo":"SI","pais":"Slovenia","capital":"Ljubljana","latitud":46.0500268,"longitud":14.5069289},{"pais_codigo":"DK","pais":"Denmark","capital":"Kobenhavn","latitud":55.6867243,"longitud":12.5700724},{"pais_codigo":"IN","pais":"India","capital":"New Delhi","latitud":28.6138954,"longitud":77.2090057},{"pais_codigo":"AT","pais":"Austria","capital":"Vienna","latitud":48.2083537,"longitud":16.3725042},{"pais_codigo":"FR","pais":"France","capital":"Paris","latitud":48.8534951,"longitud":2.3483915},{"pais_codigo":"CH","pais":"Switzerland","capital":"Bern","latitud":46.9484742,"longitud":7.4521749},{"pais_codigo":"CA","pais":"Canada","capital":"Ottawa","latitud":45.4208777,"longitud":-75.6901106},{"pais_codigo":"IQ","pais":"Irak","capital":"Baghdad","latitud":33.3061701,"longitud":44.3872213},{"pais_codigo":"ES","pais":"Spain","capital":"Madrid","latitud":40.416782,"longitud":-3.703507},{"pais_codigo":"AU","pais":"Australia","capital":"Canberra","latitud":-35.2975906,"longitud":149.1012676},{"pais_codigo":"AF","pais":"Afganistan","capital":"Kabul","latitud":34.5269503,"longitud":69.1850584},{"pais_codigo":"CN","pais":"China","capital":"Pekin","latitud":39.9057136,"longitud":116.3912972},{"pais_codigo":"ZA","pais":"South Africa","capital":"Praetorship","latitud":-25.7459277,"longitud":28.1879101},{"pais_codigo":"TR","pais":"Turkey","capital":"Ankara","latitud":39.9207759,"longitud":32.8540497},{"pais_codigo":"SE","pais":"Sweden","capital":"Stockholm","latitud":59.3251172,"longitud":18.0710935},{"pais_codigo":"IR","pais":"Iran","capital":"Tehran","latitud":35.6892523,"longitud":51.3896004},{"pais_codigo":"UA","pais":"Ukraine","capital":"Київ","latitud":50.4500336,"longitud":30.5241361},{"pais_codigo":"BY","pais":"Belarus","capital":"Мінск","latitud":53.9024716,"longitud":27.5618225},{"pais_codigo":"CU","pais":"Cuba","capital":"Havana","latitud":23.135305,"longitud":-82.3589631},{"pais_codigo":"LV","pais":"Letonia","capital":"Rīga","latitud":56.9493977,"longitud":24.1051846},{"pais_codigo":"CD","pais":"Democratic Republic of the Congo","capital":"Kinshasa","latitud":-4.32171,"longitud":15.3122511},{"pais_codigo":"LT","pais":"Lituania","capital":"Vilnius","latitud":54.6870458,"longitud":25.2829111},{"pais_codigo":"KG","pais":"Kirguistan","capital":"Бишкек","latitud":42.8761424,"longitud":74.6036724},{"pais_codigo":"UZ","pais":"Uzbekistan","capital":"Toshkent","latitud":41.3123363,"longitud":69.2787079},{"pais_codigo":"TJ","pais":"Tayikistan","capital":"Душанбе","latitud":38.5767045,"longitud":68.785433},{"pais_codigo":"MN","pais":"Mongolia","capital":"Ulaanbaatar","latitud":47.9184676,"longitud":106.9177016},{"pais_codigo":"KZ","pais":"Kazajistan","capital":"Астана","latitud":51.1282205,"longitud":71.4306682},{"pais_codigo":"NE","pais":"Niger","capital":"Niamey","latitud":13.524834,"longitud":2.109823},{"pais_codigo":"AO","pais":"Angola","capital":"Luanda","latitud":-8.8272699,"longitud":13.2439512},{"pais_codigo":"ML","pais":"Mali","capital":"Bamako","latitud":12.649319,"longitud":-8.000337},{"pais_codigo":"TN","pais":"Tunisia","capital":"Tunisia","latitud":36.8002068,"longitud":10.1857757},{"pais_codigo":"LR","pais":"Liberia","capital":"Monrovia","latitud":6.3203562,"longitud":-10.8060492},{"pais_codigo":"CF","pais":"Republica Centroafricana","capital":"Bangui","latitud":4.3635118,"longitud":18.5835913},{"pais_codigo":"ZM","pais":"Zambia","capital":"Lusaka","latitud":-15.4163395,"longitud":28.2818414},{"pais_codigo":"BF","pais":"Burkina Faso","capital":"Ouagadougou","latitud":12.3681873,"longitud":-1.5270944},{"pais_codigo":"TD","pais":"Chad","capital":"N'Djaména","latitud":12.1191543,"longitud":15.0502758},{"pais_codigo":"SN","pais":"Senegal","capital":"Dakar","latitud":14.693425,"longitud":-17.447938},{"pais_codigo":"SL","pais":"Sierra Leona","capital":"Freetown","latitud":8.479004,"longitud":-13.26795},{"pais_codigo":"GN","pais":"Guinea","capital":"Conakry","latitud":9.5170602,"longitud":-13.6998434},{"pais_codigo":"GA","pais":"Gabon","capital":"Libreville","latitud":0.4086518,"longitud":9.4418849},{"pais_codigo":"ET","pais":"Ethiopia","capital":"Addis Ababa","latitud":9.0358287,"longitud":38.7524127},{"pais_codigo":"GH","pais":"Ghana","capital":"Accra","latitud":5.5571096,"longitud":-0.2012376},{"pais_codigo":"MZ","pais":"Mozambique","capital":"Maputo","latitud":-25.966213,"longitud":32.56745},{"pais_codigo":"DJ","pais":"Yibuti","capital":"Djibouti","latitud":11.5936903,"longitud":43.1472724},{"pais_codigo":"KE","pais":"Kenia","capital":"Nairobi","latitud":-1.2890006,"longitud":36.8172812},{"pais_codigo":"MG","pais":"Madagascar","capital":"Antananarivo","latitud":-18.9100122,"longitud":47.5255809},{"pais_codigo":"SD","pais":"Sudan","capital":"Khartoum","latitud":15.5635972,"longitud":32.5349123},{"pais_codigo":"CV","pais":"Cape Verde","capital":"Praia","latitud":14.9162811,"longitud":-23.5095095},{"pais_codigo":"IL","pais":"Israel","capital":"Jerusalen","latitud":31.7788472,"longitud":35.2257856},{"pais_codigo":"EE","pais":"Estonia","capital":"Tallinn","latitud":59.437242,"longitud":24.7572693},{"pais_codigo":"ID","pais":"Indonesia","capital":"Jakarta","latitud":-6.1754049,"longitud":106.827168},{"pais_codigo":"LS","pais":"Lesoto","capital":"Maseru","latitud":-29.310054,"longitud":27.478222},{"pais_codigo":"BW","pais":"Botswana","capital":"Gaborone","latitud":-24.6581357,"longitud":25.9088474},{"pais_codigo":"NG","pais":"Nigeria","capital":"Abuja","latitud":9.0643305,"longitud":7.4892974},{"pais_codigo":"KP","pais":"North Korea","capital":"Pyongyang","latitud":39.0167979,"longitud":125.7473609},{"pais_codigo":"NA","pais":"Namibia","capital":"Windhoek","latitud":-22.5776104,"longitud":17.0772739},{"pais_codigo":"SO","pais":"Somalia","capital":"Mogadishu","latitud":2.0349312,"longitud":45.3419183},{"pais_codigo":"BH","pais":"Bahrain","capital":"Manama","latitud":26.2235041,"longitud":50.5822436},{"pais_codigo":"CL","pais":"Chile","capital":"Santiago","latitud":-33.4376995,"longitud":-70.6510671},{"pais_codigo":"LU","pais":"Luxembourg","capital":"Luxembourg","latitud":49.6112768,"longitud":6.129799},{"pais_codigo":"JM","pais":"Jamaica","capital":"Kingston","latitud":17.9712148,"longitud":-76.7928128},{"pais_codigo":"EC","pais":"Ecuador","capital":"Quito","latitud":-0.2201641,"longitud":-78.5123274},{"pais_codigo":"AD","pais":"Andorra","capital":"Andorra la Vella","latitud":42.5069391,"longitud":1.5212467},{"pais_codigo":"RW","pais":"Ruanda","capital":"Kigali","latitud":-1.9534357,"longitud":30.1140089},{"pais_codigo":"RS","pais":"Serbia","capital":"Belgrade","latitud":44.8178131,"longitud":20.4568974},{"pais_codigo":"MX","pais":"Mexico","capital":"Mexico City","latitud":19.4326296,"longitud":-99.1331785},{"pais_codigo":"NP","pais":"Nepal","capital":"Kathmandu","latitud":27.708317,"longitud":85.3205817},{"pais_codigo":"IT","pais":"Italy","capital":"Rome","latitud":41.8933203,"longitud":12.4829321},{"pais_codigo":"VN","pais":"Vietnam","capital":"Hanoi","latitud":21.0283334,"longitud":105.854041},{"pais_codigo":"AR","pais":"Argentina","capital":"Buenos Aires","latitud":-34.6095579,"longitud":-58.3887904},{"pais_codigo":"HU","pais":"Hungary","capital":"Budapest","latitud":47.4978789,"longitud":19.0402383},{"pais_codigo":"TZ","pais":"Tanzania","capital":"Dodoma","latitud":-6.1791181,"longitud":35.7468174},{"pais_codigo":"RO","pais":"Rumania","capital":"Bucharest","latitud":44.4361414,"longitud":26.102684},{"pais_codigo":"SS","pais":"South Sudan","capital":"Juba","latitud":4.8459246,"longitud":31.5959173},{"pais_codigo":"VU","pais":"Vanuatu","capital":"Port Vila","latitud":-17.7414972,"longitud":168.3150163},{"pais_codigo":"BS","pais":"Bahamas","capital":"Nassau","latitud":25.0782266,"longitud":-77.3383438},{"pais_codigo":"LA","pais":"Laos","capital":"Vientian","latitud":17.9640988,"longitud":102.6133707},{"pais_codigo":"NO","pais":"Norway","capital":"Oslo","latitud":59.8937521,"longitud":10.6203118},{"pais_codigo":"ME","pais":"Montenegro","capital":"Podgorica","latitud":42.4415238,"longitud":19.2621081},{"pais_codigo":"MD","pais":"Moldavia","capital":"Chişinău","latitud":47.0245117,"longitud":28.8322923},{"pais_codigo":"AM","pais":"Armenia","capital":"Երևան","latitud":40.1777112,"longitud":44.5126233},{"pais_codigo":"US","pais":"United States","capital":"Washington","latitud":38.8950982,"longitud":-77.0363849},{"pais_codigo":"MK","pais":"North Macedonia","capital":"Скопје","latitud":41.9962164,"longitud":21.4318935},{"pais_codigo":"PH","pais":"Philippines","capital":"Manila","latitud":14.5904492,"longitud":120.9803621},{"pais_codigo":"OM","pais":"Oman","capital":"Mascate","latitud":23.6123628,"longitud":58.5938134},{"pais_codigo":"PG","pais":"Papua New Guinea","capital":"Port Moresby","latitud":-9.4743301,"longitud":147.1599504},{"pais_codigo":"DE","pais":"Germany","capital":"Berlin","latitud":52.5173885,"longitud":13.3951309},{"pais_codigo":"MU","pais":"Mauricio","capital":"Port Louis","latitud":-20.1624522,"longitud":57.5028044},{"pais_codigo":"SZ","pais":"Swaziland","capital":"Mbabane","latitud":-26.325745,"longitud":31.144663},{"pais_codigo":"GD","pais":"Grenada","capital":"St. George's","latitud":12.0535331,"longitud":-61.751805},{"pais_codigo":"VC","pais":"Saint Vincent and the Grenadines","capital":"Kingstown","latitud":13.1561864,"longitud":-61.2279621},{"pais_codigo":"BB","pais":"Barbados","capital":"Bridgetown","latitud":13.0977832,"longitud":-59.6184184},{"pais_codigo":"MR","pais":"Mauritius","capital":"Nuakchot","latitud":18.0792379,"longitud":-15.9780071},{"pais_codigo":"GM","pais":"Gambia","capital":"Banjul","latitud":13.45535,"longitud":-16.575646},{"pais_codigo":"PY","pais":"Paraguay","capital":"Asuncion","latitud":-25.2800459,"longitud":-57.6343814},{"pais_codigo":"GW","pais":"Guinea Bissau","capital":"Bissau","latitud":11.861324,"longitud":-15.583055},{"pais_codigo":"YE","pais":"Yemen","capital":"Fury","latitud":15.3538569,"longitud":44.2058841},{"pais_codigo":"AE","pais":"United Arab Emirates","capital":"Abu Dhabi","latitud":24.4538352,"longitud":54.3774014},{"pais_codigo":"TL","pais":"Timor-Leste","capital":"Dili","latitud":-8.5536809,"longitud":125.5784093},{"pais_codigo":"JP","pais":"Japan","capital":"Tokio","latitud":35.6768601,"longitud":139.7638947},{"pais_codigo":"PT","pais":"Portugal","capital":"Lisbon","latitud":38.7077507,"longitud":-9.1365919},{"pais_codigo":"CK","pais":"Islas Cook","capital":"Avarua","latitud":-21.2074736,"longitud":-159.7708145},{"pais_codigo":"NL","pais":"Netherlands","capital":"Amsterdam","latitud":52.3730796,"longitud":4.8924534},{"pais_codigo":"EG","pais":"Egypt","capital":"Cairo","latitud":30.0443879,"longitud":31.2357257},{"pais_codigo":"SM","pais":"Saint Marino","capital":"City of Saint Marino","latitud":43.9363996,"longitud":12.4466991},{"pais_codigo":"SR","pais":"Suriname","capital":"Paramaribo","latitud":5.8247628,"longitud":-55.1703941},{"pais_codigo":"BZ","pais":"Belize","capital":"Belmopan","latitud":17.250199,"longitud":-88.770018},{"pais_codigo":"ZW","pais":"Zimbawe","capital":"Harare","latitud":-17.831773,"longitud":31.045686},{"pais_codigo":"HT","pais":"Haiti","capital":"Port-au-Prince","latitud":18.547327,"longitud":-72.3395928},{"pais_codigo":"LB","pais":"Lebanon","capital":"Beirut","latitud":33.8959203,"longitud":35.47843},{"pais_codigo":"GY","pais":"Guyana","capital":"Georgetown","latitud":6.8032561,"longitud":-58.1455403},{"pais_codigo":"ST","pais":"São Tomé and Principe","capital":"São Tomé","latitud":0.3389242,"longitud":6.7313031},{"pais_codigo":"UY","pais":"Uruguay","capital":"Montevideo","latitud":-34.9058916,"longitud":-56.1913095},{"pais_codigo":"MA","pais":"Morocco","capital":"Rabat","latitud":34.0218454,"longitud":-6.8408929},{"pais_codigo":"DZ","pais":"Algeria","capital":"Algiers","latitud":36.7729333,"longitud":3.0588445},{"pais_codigo":"BI","pais":"Burundi","capital":"Gitega","latitud":-3.4284953,"longitud":29.9249718},{"pais_codigo":"BO","pais":"Bolivia","capital":"Sucre","latitud":-19.0477251,"longitud":-65.2594306},{"pais_codigo":"DO","pais":"Dominican Republic","capital":"Santo Domingo","latitud":18.4713858,"longitud":-69.8918436},{"pais_codigo":"SA","pais":"Saudi Arabia","capital":"Riyadh","latitud":24.638916,"longitud":46.7160104},{"pais_codigo":"MM","pais":"Myanmar","capital":"Naypyidaw","latitud":19.7753289,"longitud":96.1032552},{"pais_codigo":"PK","pais":"Pakistan","capital":"Islamabad","latitud":33.6938118,"longitud":73.0651511},{"pais_codigo":"CI","pais":"Ivory Coast","capital":"Yamoussoukro","latitud":6.8200066,"longitud":-5.2776034},{"pais_codigo":"CM","pais":"Cameroon","capital":"Yaoundé","latitud":3.8689867,"longitud":11.5213344},{"pais_codigo":"KM","pais":"Comoras","capital":"Moroni","latitud":-11.7040306,"longitud":43.251909},{"pais_codigo":"MH","pais":"Marshall Islands","capital":"Majuro","latitud":7.0909924,"longitud":171.3816354},{"pais_codigo":"WS","pais":"Samoa","capital":"Apia","latitud":-13.8345235,"longitud":-171.7630955},{"pais_codigo":"PL","pais":"Poland","capital":"Warsaw","latitud":52.2319581,"longitud":21.0067249},{"pais_codigo":"CG","pais":"Congo","capital":"Brazzaville","latitud":-4.2694407,"longitud":15.2712256},{"pais_codigo":"NU","pais":"Niue","capital":"Alofi","latitud":-19.0534159,"longitud":-169.919199},{"pais_codigo":"GT","pais":"Guatemala","capital":"Guatemala City","latitud":14.6416142,"longitud":-90.5132836},{"pais_codigo":"SK","pais":"Slovakia","capital":"Bratislava","latitud":48.1516988,"longitud":17.1093063},{"pais_codigo":"SG","pais":"Singapore","capital":"Singapore","latitud":1.2899175,"longitud":103.8519072},{"pais_codigo":"KW","pais":"Kuwait","capital":"Kuwait","latitud":29.3796532,"longitud":47.9734174},{"pais_codigo":"KH","pais":"Cambodia","capital":"Nom Pen","latitud":11.568271,"longitud":104.9224426},{"pais_codigo":"CO","pais":"Colombia","capital":"Bogotá","latitud":4.6533817,"longitud":-74.0836331},{"pais_codigo":"KI","pais":"Kiribati","capital":"South Tarawa","latitud":1.3490778,"longitud":173.0386512},{"pais_codigo":"FM","pais":"Micronesia","capital":"Palikir","latitud":6.920744,"longitud":158.1627143},{"pais_codigo":"UG","pais":"Uganda","capital":"Kampala","latitud":0.3177137,"longitud":32.5813539},{"pais_codigo":"SB","pais":"Solomon Islands","capital":"Honiara","latitud":-9.4310769,"longitud":159.9552552},{"pais_codigo":"VE","pais":"Venezuela","capital":"Caracas","latitud":10.5060934,"longitud":-66.9146008},{"pais_codigo":"GL","pais":"Greenland","capital":"Nuuk","latitud":64.1767049,"longitud":-51.7361444},{"pais_codigo":"TO","pais":"Tonga","capital":"Nukuʻalofa","latitud":-21.1343401,"longitud":-175.201808},{"pais_codigo":"SY","pais":"Syria","capital":"Damascus","latitud":33.5130695,"longitud":36.3095814},{"pais_codigo":"TW","pais":"Taiwan","capital":"Taipei","latitud":25.0375198,"longitud":121.5636796},{"pais_codigo":"PA","pais":"Panama","capital":"Panamá","latitud":8.9714493,"longitud":-79.5341802},{"pais_codigo":"FI","pais":"Finland","capital":"Helsinki","latitud":60.1666204,"longitud":24.9435408},{"pais_codigo":"BT","pais":"Bhutan","capital":"Thimphu","latitud":27.4713546,"longitud":89.6336729},{"pais_codigo":"MT","pais":"Malta","capital":"Valletta","latitud":35.8989979,"longitud":14.5136607},{"pais_codigo":"HR","pais":"Croatia","capital":"Zagreb","latitud":45.8130967,"longitud":15.9772795},{"pais_codigo":"CZ","pais":"Czechia","capital":"Prague","latitud":50.0874654,"longitud":14.4212535},{"pais_codigo":"GE","pais":"Georgia","capital":"Tbilisi","latitud":41.6934591,"longitud":44.8014495},{"pais_codigo":"TH","pais":"Thailand","capital":"Bangkok","latitud":13.7524938,"longitud":100.4935089},{"pais_codigo":"BE","pais":"Belgium","capital":"Brussels","latitud":50.8467372,"longitud":4.352493},{"pais_codigo":"JO","pais":"Jordania","capital":"Aman","latitud":31.9515694,"longitud":35.9239625},{"pais_codigo":"BJ","pais":"Benin","capital":"Porto-Novo","latitud":6.4990718,"longitud":2.6253361},{"pais_codigo":"QA","pais":"Qatar","capital":"Doha","latitud":25.2856329,"longitud":51.5264162},{"pais_codigo":"RU","pais":"Russia","capital":"Moscow","latitud":55.7505412,"longitud":37.6174782},{"pais_codigo":"BN","pais":"Brunei","capital":"Bandar Seri Begawan","latitud":4.8895453,"longitud":114.9417574},{"pais_codigo":"LY","pais":"Libya","capital":"Tripoli","latitud":32.896672,"longitud":13.1777923},{"pais_codigo":"BG","pais":"Bulgaria","capital":"Sofia","latitud":42.6977028,"longitud":23.3217359},{"pais_codigo":"MC","pais":"Monaco","capital":"Monaco","latitud":43.7310164,"longitud":7.4209592},{"pais_codigo":"AL","pais":"Albania","capital":"Tirane","latitud":41.3281482,"longitud":19.8184435},{"pais_codigo":"MY","pais":"Malaysia","capital":"Kuala Lumpur","latitud":3.1516964,"longitud":101.6942371},{"pais_codigo":"CY","pais":"Cyprus","capital":"Nicosia","latitud":35.1746503,"longitud":33.3638783},{"pais_codigo":"KR","pais":"South Korea","capital":"Seoul","latitud":37.5666791,"longitud":126.9782914},{"pais_codigo":"LI","pais":"Liechtenstein","capital":"Vaduz","latitud":47.1392862,"longitud":9.5227962},{"pais_codigo":"BA","pais":"Bosnia and Herzegovina","capital":"Sarajevo","latitud":43.8570713,"longitud":18.4126147},{"pais_codigo":"IS","pais":"Iceland","capital":"Reykjavík","latitud":64.145981,"longitud":-21.9422367},{"pais_codigo":"AZ","pais":"Azerbaijan","capital":"Baku","latitud":40.3755885,"longitud":49.8328009},{"pais_codigo":"TG","pais":"Togo","capital":"Lomé","latitud":6.130419,"longitud":1.215829},{"pais_codigo":"IM","pais":"Isle of Man","capital":"Douglas","latitud":54.149774,"longitud":-4.4779021},{"pais_codigo":"FJ","pais":"Fiji","capital":"Suva","latitud":-18.1415884,"longitud":178.4421662},{"pais_codigo":"TT","pais":"Trinidad and Tobago","capital":"Port of Spain","latitud":10.6572678,"longitud":-61.5180173},{"pais_codigo":"XK","pais":"Kosovo","capital":"Prishtinë","latitud":42.6638771,"longitud":21.1640849},{"pais_codigo":"GQ","pais":"Equatorial Guinea","capital":"Malabo","latitud":1.5994535,"longitud":10.8268276},{"pais_codigo":"TV","pais":"Tuvalu","capital":"Funafuti","latitud":-8.5199633,"longitud":179.1982548},{"pais_codigo":"MV","pais":"Maldives","capital":"Male","latitud":4.1779879,"longitud":73.5107387},{"pais_codigo":"BD","pais":"Bangladesh","capital":"Dhaka","latitud":23.7643863,"longitud":90.3890144},{"pais_codigo":"IE","pais":"Ireland","capital":"Dublin","latitud":53.3493795,"longitud":-6.2605593},{"pais_codigo":"PW","pais":"Palau","capital":"Ngerulmud","latitud":7.5006446,"longitud":134.6242864},{"pais_codigo":"PE","pais":"Peru","capital":"Lima","latitud":-12.0459808,"longitud":-77.0305912},{"pais_codigo":"LC","pais":"Saint Lucia","capital":"Castries","latitud":14.0095966,"longitud":-60.9902359},{"pais_codigo":"DM","pais":"Dominica","capital":"Roseau","latitud":15.2991923,"longitud":-61.3872868},{"pais_codigo":"ER","pais":"Eritrea","capital":"Asmara","latitud":15.3389667,"longitud":38.9326763},{"pais_codigo":"MW","pais":"Malawi","capital":"Lilongwe","latitud":-13.9875107,"longitud":33.768144},{"pais_codigo":"NI","pais":"Nicaragua","capital":"Managua","latitud":12.1547116,"longitud":-86.273725},{"pais_codigo":"SV","pais":"El Salvador","capital":"San Salvador","latitud":13.697629,"longitud":-89.191156},{"pais_codigo":"HN","pais":"Honduras","capital":"Tegucigalpa","latitud":14.1058135,"longitud":-87.2047053},{"pais_codigo":"CR","pais":"Costa Rica","capital":"San Jose","latitud":9.9327707,"longitud":-84.0796144},{"pais_codigo":"BR","pais":"Brazil","capital":"Brasilia","latitud":-15.721487,"longitud":-48.1021719}]`,
  ),
  fh = new Map();
for (const i of dh)
  i.pais_codigo && fh.set(i.pais_codigo.toUpperCase(), [i.latitud, i.longitud]);
const Ao = new Map();
for (const i of dh)
  (Ao.set(i.pais.toLowerCase(), [i.latitud, i.longitud]),
    Ao.set(i.capital.toLowerCase(), [i.latitud, i.longitud]));
function zy(i) {
  const t = i?.toUpperCase();
  return (
    (t &&
      ({
        US: [37.09, -95.71],
        DE: [51.16, 10.45],
        GB: [55.37, -3.43],
        BR: [-14.23, -51.92],
        CN: [35.86, 104.19],
        IN: [20.59, 78.96],
        KR: [35.9, 127.76],
        SA: [23.88, 45.07],
        FR: [46.22, 2.21],
        JP: [36.2, 138.25],
        AU: [-25.27, 133.77],
        CA: [56.13, -106.34],
        RU: [61.52, 105.31],
        MX: [23.63, -102.55],
        ZA: [-30.55, 22.93],
      }[t] ||
        fh.get(t))) ||
    null
  );
}
function Ny(i) {
  if (!i) return null;
  const t = i.toLowerCase();
  for (const [e, n] of Ao) if (t.includes(e)) return n;
  return null;
}
let qt = null,
  Ge = {};
const $l = [
  [40.71, -74],
  [37.77, -122.42],
  [41.88, -87.63],
  [43.65, -79.38],
  [19.43, -99.13],
  [-23.55, -46.63],
  [-34.61, -58.38],
  [-33.45, -70.66],
  [4.71, -74.07],
  [10.49, -66.88],
  [51.5, -0.13],
  [50.11, 8.68],
  [48.85, 2.35],
  [40.42, -3.7],
  [41.9, 12.5],
  [47.37, 8.54],
  [52.37, 4.9],
  [55.75, 37.62],
  [50.45, 30.52],
  [41, 28.98],
  [-26.2, 28.05],
  [6.45, 3.4],
  [30.04, 31.24],
  [-1.29, 36.82],
  [33.97, -6.85],
  [25.2, 55.27],
  [24.71, 46.68],
  [32.07, 34.78],
  [22.3, 114.17],
  [35.68, 139.69],
  [1.35, 103.82],
  [31.23, 121.47],
  [19.08, 72.88],
  [37.57, 126.98],
  [13.76, 100.5],
  [-6.21, 106.85],
  [25.03, 121.56],
  [-33.87, 151.21],
  [-37.81, 144.96],
  [-36.85, 174.76],
];
function ph(i) {
  let t = 0;
  const e = String(i);
  for (let n = 0; n < e.length; n++) t = ((t << 5) - t + e.charCodeAt(n)) | 0;
  return Math.abs(t);
}
const Fy = {
  US: [14, 32],
  RU: [12, 55],
  CA: [11, 35],
  CN: [13, 25],
  BR: [13, 18],
  AU: [11, 22],
  IN: [10, 14],
  AR: [14, 10],
  MX: [8, 13],
  KZ: [7, 22],
  DZ: [10, 11],
  SA: [9, 11],
  CD: [9, 9],
  GB: [4, 4],
  DE: [4, 5],
  FR: [5, 5],
  ES: [5, 6],
  IT: [5, 5],
  JP: [6, 8],
  TR: [4, 9],
  IR: [7, 9],
  IL: [1.2, 1.2],
  UA: [5, 9],
  KR: [2.5, 2.5],
  ZA: [6, 8],
  NG: [5, 6],
  EG: [5, 6],
  ID: [6, 22],
};
function fo(i, t, e = 4) {
  const n = ph(t),
    [o, a] = Array.isArray(e) ? e : [e, e],
    l = ((n & 65535) / 65535) * 2 - 1,
    c = (((n >> 16) & 65535) / 65535) * 2 - 1;
  return [i[0] + c * o, i[1] + l * a];
}
function Hy(i) {
  const t = ph(i) % $l.length;
  return $l[t];
}
function gh(i) {
  const t = zy(i.countryCode);
  if (t) {
    const n = Fy[i.countryCode] || 3.5;
    return fo(t, i.id, n);
  }
  const e = Ny(i.question);
  return e ? fo(e, i.id, 4) : fo(Hy(i.id), i.id, 3);
}
function mh(i) {
  return i === "bullish" ? "#22d37a" : i === "bearish" ? "#f04040" : "#f0a020";
}
function _h(i) {
  const t = i || 0;
  return t > 2e6 ? 18 : t > 1e6 ? 14 : t > 5e5 ? 11 : t > 2e5 ? 8 : 6;
}
function Wy(i, t, e, n) {
  window.__onSelectMarket = n;
  const o = document.getElementById(i);
  o &&
    ((qt = oe
      .map(o, {
        zoomControl: !1,
        attributionControl: !1,
        minZoom: 2,
        maxZoom: 6,
        worldCopyJump: !0,
      })
      .setView([25, 10], 2)),
    oe
      .tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: "&copy;OpenStreetMap &copy;CartoDB",
          subdomains: "abcd",
          maxZoom: 19,
        },
      )
      .addTo(qt),
    t.forEach((a) => {
      const l = e.find((A) => A.marketId === a.id) || { signal: "neutral" },
        c = mh(l.signal),
        u = gh(a),
        d = _h(a.volumeEur),
        p = oe
          .circleMarker(u, {
            radius: d,
            fillColor: c,
            color: c,
            weight: 1.5,
            opacity: 0.6,
            fillOpacity: 0.22,
          })
          .addTo(qt),
        m = oe
          .circleMarker(u, {
            radius: Math.max(3, d * 0.45),
            fillColor: c,
            color: "transparent",
            fillOpacity: 0.8,
            interactive: !1,
          })
          .addTo(qt),
        _ = document.createElement("span");
      ((_.className = "map-label-text"),
        (_.textContent = a.countryCode || "GL"));
      const v = oe
          .marker(u, {
            icon: oe.divIcon({
              className: "map-label",
              html: _.outerHTML,
              iconSize: [40, 14],
              iconAnchor: [20, -d - 4],
            }),
            interactive: !1,
          })
          .addTo(qt),
        x = document.createElement("div");
      x.className = "map-popup";
      const b = document.createElement("div");
      ((b.className = "map-popup-cat"),
        (b.textContent = `${a.category || "General"} · ${a.countryCode || "GL"}`));
      const w = document.createElement("div");
      ((w.className = "map-popup-q"), (w.textContent = a.question));
      const k = document.createElement("div");
      k.className = "map-popup-prices";
      const C = document.createElement("span");
      ((C.className = "text-green"),
        (C.textContent = `SÍ ${Math.round((a.yesPrice || 0) * 100)}¢`));
      const E = document.createElement("span");
      ((E.className = "text-red"),
        (E.textContent = `NO ${Math.round((a.noPrice || 0) * 100)}¢`),
        k.append(C, E),
        x.append(b, w, k),
        p.bindPopup(x, { closeButton: !1, offset: [0, -4] }),
        p.on("click", () => {
          n(a.id);
        }),
        (Ge[a.id] = { circle: p, inner: m, label: v, color: c }));
    }));
}
function Vy(i) {
  const t = Ge[i];
  if (!t) return;
  const e = t.circle.getRadius() + (Math.random() > 0.5 ? 0.5 : -0.5);
  t.circle.setRadius(Math.max(5, Math.min(22, e)));
}
function Ul(i) {
  Object.values(Ge).forEach((e) => {
    e.circle.setStyle({ weight: 1.5, opacity: 0.6 });
  });
  const t = Ge[i];
  t &&
    (t.circle.setStyle({ weight: 3, opacity: 1, color: "#4a9eff" }),
    t.circle.openPopup());
}
function Zy(i, t) {
  qt &&
    (Object.values(Ge).forEach((e) => {
      (qt.removeLayer(e.circle),
        qt.removeLayer(e.inner),
        qt.removeLayer(e.label));
    }),
    (Ge = {}),
    i.forEach((e) => {
      const n = t.find((k) => k.marketId === e.id) || { signal: "neutral" },
        o = mh(n.signal),
        a = gh(e),
        l = _h(e.volumeEur),
        c = oe
          .circleMarker(a, {
            radius: l,
            fillColor: o,
            color: o,
            weight: 1.5,
            opacity: 0.6,
            fillOpacity: 0.22,
          })
          .addTo(qt),
        u = oe
          .circleMarker(a, {
            radius: Math.max(3, l * 0.45),
            fillColor: o,
            color: "transparent",
            fillOpacity: 0.8,
            interactive: !1,
          })
          .addTo(qt),
        d = document.createElement("span");
      ((d.className = "map-label-text"),
        (d.textContent = e.countryCode || "GL"));
      const p = oe
          .marker(a, {
            icon: oe.divIcon({
              className: "map-label",
              html: d.outerHTML,
              iconSize: [40, 14],
              iconAnchor: [20, -l - 4],
            }),
            interactive: !1,
          })
          .addTo(qt),
        m = document.createElement("div");
      m.className = "map-popup";
      const _ = document.createElement("div");
      ((_.className = "map-popup-cat"),
        (_.textContent = `${e.category || "General"} · ${e.countryCode || "GL"}`));
      const v = document.createElement("div");
      ((v.className = "map-popup-q"), (v.textContent = e.question));
      const x = document.createElement("div");
      x.className = "map-popup-prices";
      const b = document.createElement("span");
      ((b.className = "text-green"),
        (b.textContent = `SÍ ${Math.round((e.yesPrice || 0) * 100)}¢`));
      const w = document.createElement("span");
      ((w.className = "text-red"),
        (w.textContent = `NO ${Math.round((e.noPrice || 0) * 100)}¢`),
        x.append(b, w),
        m.append(_, v, x),
        c.bindPopup(m, { closeButton: !1, offset: [0, -4] }),
        c.on("click", () => {
          window.__onSelectMarket && window.__onSelectMarket(e.id);
        }),
        (Ge[e.id] = { circle: c, inner: u, label: p, color: o }));
    }));
}
let Ji = null;
function jy(i) {
  Ji = i;
}
async function ql(i, t, e) {
  const n = parseFloat(e);
  if (!n || n <= 0) {
    alert("Introduce una cantidad válida");
    return;
  }
  const o = Ji.markets.find((c) => c.id === i);
  if (!o) return;
  const a = t === "YES" ? o.yesPrice : o.noPrice,
    l = { marketId: i, outcome: t, amountEur: n, entryPrice: a };
  try {
    const c = await of(l);
    (Ji.positions.push(c),
      document.dispatchEvent(new CustomEvent("positions:changed")));
  } catch (c) {
    (console.error("Error abriendo posicion:", c),
      alert("No se pudo abrir la posición. ¿Has iniciado sesión?"));
  }
}
async function $y(i) {
  try {
    (await rf(i),
      (Ji.positions = Ji.positions.filter((t) => t.id !== i)),
      document.dispatchEvent(new CustomEvent("positions:changed")));
  } catch (t) {
    (console.error("Error cerrando posicion:", t),
      alert("No se pudo cerrar la posición"));
  }
}
function Uy(i) {
  const t = new Set();
  for (const e of i) e.category && t.add(e.category);
  return { categories: ["Todas", ...Array.from(t).sort()] };
}
function yh(i, { category: t }) {
  return i.filter((e) => !(t && t !== "Todas" && e.category !== t));
}
let z = {
  view: "dashboard",
  activeMarketId: null,
  markets: [],
  signals: [],
  positions: [],
  watchlist: [],
  alerts: [],
  collapsedPanels: new Set(),
  sidebarCollapsed: !1,
  signalsOffset: 0,
  signalsHasMore: !0,
  signalsLoading: !1,
  filters: { category: "", trend: "" },
  priceHistory: new Map(),
};
function Qn(i) {
  return !i || i === 0
    ? "€0"
    : i >= 1e6
      ? "€" + (i / 1e6).toFixed(1) + "M"
      : i >= 1e3
        ? "€" + (i / 1e3).toFixed(1) + "K"
        : "€" + i.toFixed(0);
}
function Ae(i) {
  return Math.round((i || 0) * 100) + "¢";
}
function vh(i) {
  return i
    ? new Date(i).toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
}
function qy(i) {
  return i === "bullish" ? "green" : i === "bearish" ? "red" : "amber";
}
function nr(i) {
  return i === "bullish"
    ? "sig-bull"
    : i === "bearish"
      ? "sig-bear"
      : "sig-neut";
}
function bh(i) {
  return i === "bullish" ? "ALC" : i === "bearish" ? "BAJ" : "NEUT";
}
function Yy(i) {
  return i === "bullish" ? "alcista" : i === "bearish" ? "bajista" : "neutral";
}
function Gy(i) {
  return i === "bullish" ? "A" : i === "bearish" ? "B" : "N";
}
function xh(i) {
  return i === "YES" ? "SÍ" : i === "NO" ? "NO" : i;
}
function I(i, t, e) {
  const n = document.createElement(i);
  return (t && (n.className = t), e !== void 0 && (n.textContent = e), n);
}
function wh(i, t = !1) {
  return I("div", t ? "empty-state empty-state-sm" : "empty-state", i);
}
function Ph() {
  const i = Uy(z.markets),
    t = document.getElementById("filter-category");
  if (!t) return;
  const e = t.value;
  ((t.innerHTML =
    '<option value="">Todas las categorías</option>' +
    i.categories
      .slice(1)
      .map(
        (n) =>
          `<option value="${n}">${n.charAt(0).toUpperCase() + n.slice(1)}</option>`,
      )
      .join("")),
    (t.value = i.categories.includes(e) ? e : ""));
}
function Yl() {
  ((z.filters.category =
    document.getElementById("filter-category")?.value || ""),
    (z.filters.trend = document.getElementById("filter-trend")?.value || ""));
  let i = yh(z.markets, z.filters);
  (z.filters.trend && (i = Xy(i, z.filters.trend)), Mh(i), Zy(i, z.signals));
}
function Ky() {
  (Ph(),
    document.getElementById("filter-category")?.addEventListener("change", Yl),
    document.getElementById("filter-trend")?.addEventListener("change", Yl));
}
function kh(i, t) {
  z.priceHistory.has(i) || z.priceHistory.set(i, []);
  const e = z.priceHistory.get(i);
  (e.push({ price: t, timestamp: Date.now() }), e.length > 20 && e.shift());
}
function Sh(i) {
  const t = z.priceHistory.get(i);
  if (!t || t.length < 2) return { momentum: 0, volatility: 0, avgVolume: 0 };
  const e = t.map((c) => c.price),
    n = e[0],
    o = e[e.length - 1],
    a = n !== 0 ? ((o - n) / n) * 100 : 0;
  let l = 0;
  if (e.length >= 3) {
    const c = [];
    for (let u = 1; u < e.length; u++)
      e[u - 1] !== 0 && c.push(((e[u] - e[u - 1]) / e[u - 1]) * 100);
    if (c.length > 1) {
      const u = c.reduce((p, m) => p + m, 0) / c.length,
        d = c.reduce((p, m) => p + Math.pow(m - u, 2), 0) / c.length;
      l = Math.sqrt(d);
    }
  }
  return { momentum: a, volatility: l };
}
function Xy(i, t) {
  if (!t) return i;
  const e = i.map((n) => {
    const o = Sh(n.id),
      a = z.signals.find((l) => l.marketId === n.id);
    return {
      market: n,
      momentum: o.momentum,
      volatility: o.volatility,
      volume: n.volumeEur || 0,
      signal: a?.signal || "neutral",
      confidence: a?.confidence || 0.5,
    };
  });
  switch (t) {
    case "hot":
      return e
        .filter((n) => n.volume > 1e5 || Math.abs(n.momentum) > 1)
        .sort((n, o) => o.volume - n.volume)
        .map((n) => n.market);
    case "bullish-trend":
      return e
        .filter((n) => n.momentum > 0.5 || n.signal === "bullish")
        .sort((n, o) => o.momentum - n.momentum)
        .map((n) => n.market);
    case "bearish-trend":
      return e
        .filter((n) => n.momentum < -0.5 || n.signal === "bearish")
        .sort((n, o) => n.momentum - o.momentum)
        .map((n) => n.market);
    case "volatile":
      return e
        .filter((n) => n.volatility > 0.3)
        .sort((n, o) => o.volatility - n.volatility)
        .map((n) => n.market);
    case "high-volume":
      return e
        .filter((n) => n.volume > 5e5)
        .sort((n, o) => o.volume - n.volume)
        .map((n) => n.market);
    default:
      return i;
  }
}
function ts() {
  document.getElementById("auth-modal")?.classList.remove("hidden");
}
function es() {
  document.getElementById("auth-modal")?.classList.add("hidden");
  const i = document.getElementById("login-error"),
    t = document.getElementById("register-error");
  (i && (i.textContent = ""), t && (t.textContent = ""));
}
function Jy(i) {
  (document
    .querySelectorAll(".modal-tab")
    .forEach((n) => n.classList.toggle("active", n.dataset.tab === i)),
    document
      .querySelectorAll("#auth-modal .modal-form")
      .forEach((n) => n.classList.toggle("active", n.id === `form-${i}`)));
  const t = document.getElementById("login-error"),
    e = document.getElementById("register-error");
  (t && (t.textContent = ""), e && (e.textContent = ""));
}
function Gl() {
  const i = document.getElementById("telegram-modal");
  if (!i) return;
  const t = document.getElementById("form-telegram");
  t && t.classList.add("active");
  const e = JSON.parse(localStorage.getItem("telegramConfig") || "{}");
  ((document.getElementById("telegram-bot-token").value = e.botToken || ""),
    (document.getElementById("telegram-chat-id").value = e.chatId || ""),
    (document.getElementById("telegram-enabled").checked = e.enabled || !1));
  const n = document.getElementById("telegram-status");
  (n && ((n.textContent = ""), (n.className = "form-status")),
    i.classList.remove("hidden"));
}
function Oo() {
  document.getElementById("telegram-modal")?.classList.add("hidden");
  const i = document.getElementById("telegram-status");
  i && ((i.textContent = ""), (i.className = "form-status"));
}
function Qy(i) {
  i.preventDefault();
  const t = document.getElementById("telegram-bot-token").value.trim(),
    e = document.getElementById("telegram-chat-id").value.trim(),
    n = document.getElementById("telegram-enabled").checked,
    o = document.getElementById("telegram-status");
  if (n && (!t || !e)) {
    ((o.textContent = "Completa token y chat ID para activar alertas."),
      (o.className = "form-status error"));
    return;
  }
  (localStorage.setItem(
    "telegramConfig",
    JSON.stringify({ botToken: t, chatId: e, enabled: n }),
  ),
    (o.textContent = "Configuración guardada correctamente."),
    (o.className = "form-status success"),
    setTimeout(() => Oo(), 1200));
}
function tv() {
  const i = document.getElementById("telegram-bot-token").value.trim(),
    t = document.getElementById("telegram-chat-id").value.trim(),
    e = document.getElementById("telegram-status");
  if (!i || !t) {
    ((e.textContent = "Introduce token y chat ID antes de probar."),
      (e.className = "form-status error"));
    return;
  }
  ((e.textContent = "Enviando mensaje de prueba…"),
    (e.className = "form-status"),
    fetch(`https://api.telegram.org/bot${i}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: t,
        text: `🧪 PolySignal — Mensaje de prueba

Las alertas de Telegram están configuradas correctamente.`,
      }),
    })
      .then((n) => n.json())
      .then((n) => {
        n.ok
          ? ((e.textContent = "Mensaje de prueba enviado. Revisa Telegram."),
            (e.className = "form-status success"))
          : ((e.textContent = `Error de Telegram: ${n.description || "verifica token y chat ID"}`),
            (e.className = "form-status error"));
      })
      .catch(() => {
        ((e.textContent =
          "No se pudo conectar con Telegram. Revisa tu conexión."),
          (e.className = "form-status error"));
      }));
}
function Qi() {
  const i = document.getElementById("btn-auth"),
    t = document.getElementById("btn-auth-mobile"),
    e = dc();
  (i &&
    (e
      ? ((i.textContent = "Salir"),
        (i.onclick = () => {
          (ba(), Qi(), location.reload());
        }))
      : ((i.textContent = "Entrar"), (i.onclick = ts))),
    t &&
      (t.classList.toggle("logged-in", e),
      (t.title = e ? "Salir" : "Entrar"),
      (t.onclick = e
        ? () => {
            (ba(), Qi(), location.reload());
          }
        : ts)));
}
async function ev(i) {
  i.preventDefault();
  const t = document.getElementById("login-email").value.trim(),
    e = document.getElementById("login-password").value,
    n = document.getElementById("login-error");
  try {
    (await Xd(t, e), es(), Qi(), await sr());
  } catch {
    n.textContent = "Credenciales incorrectas. Inténtalo de nuevo.";
  }
}
async function iv(i) {
  i.preventDefault();
  const t = document.getElementById("register-email").value.trim(),
    e = document.getElementById("register-password").value,
    n = document.getElementById("register-password-confirm").value,
    o = document.getElementById("register-error");
  if (e !== n) {
    o.textContent = "Las contraseñas no coinciden.";
    return;
  }
  if (e.length < 8) {
    o.textContent = "La contraseña debe tener al menos 8 caracteres.";
    return;
  }
  try {
    (await Jd(t, e), es(), Qi(), await sr());
  } catch {
    o.textContent = "Error al registrar. El correo podría estar en uso.";
  }
}
async function nv() {
  if (!dc()) return !1;
  try {
    return (await Qd(), !0);
  } catch {
    return !1;
  }
}
function sv(i) {
  ((z.view = i),
    document
      .querySelectorAll(".view")
      .forEach((t) => t.classList.toggle("active", t.id === `view-${i}`)),
    document
      .querySelectorAll(".nav-item")
      .forEach((t) => t.classList.toggle("active", t.dataset.view === i)),
    i === "positions" && Eh(),
    i === "watchlist" && Ah(),
    i === "alerts" && Oh());
}
function ov() {
  ((z.sidebarCollapsed = !z.sidebarCollapsed),
    document
      .getElementById("app")
      .classList.toggle("collapsed", z.sidebarCollapsed));
}
function rv(i) {
  const t = document.getElementById(`panel-${i}`);
  if (!t) return;
  t.classList.toggle("collapsed")
    ? z.collapsedPanels.add(i)
    : z.collapsedPanels.delete(i);
}
function av(i) {
  const t = z.signals.find((v) => v.marketId === i.id) || null,
    e = t != null,
    n = qy(t?.signal || "neutral"),
    o = I("div", `market-card${z.activeMarketId === i.id ? " active" : ""}`);
  o.dataset.market = i.id;
  const a = I("div", "market-cat"),
    l = `${i.category || "General"} · ${i.countryCode || "GL"}`;
  if (((a.textContent = l), i.spread != null && i.spread > 0.05)) {
    const v = I("span", "spread-badge illiquid");
    ((v.textContent = `· ilíquido ${Math.round(i.spread * 100)}¢`),
      a.appendChild(v));
  } else if (i.spread != null && i.spread > 0.02) {
    const v = I("span", "spread-badge");
    ((v.textContent = `· spread ${Math.round(i.spread * 100)}¢`),
      a.appendChild(v));
  }
  const c = I("div", "market-q");
  c.textContent = i.question;
  const u = I("div", "market-footer"),
    d = I("div", "prob-bar-wrap"),
    p = I("div", "prob-bar-bg"),
    m = I("div", `prob-bar-fill bg-${n}`);
  (m.style.setProperty(
    "--prob-width",
    `${Math.round((i.yesPrice || 0) * 100)}%`,
  ),
    p.appendChild(m),
    d.appendChild(p));
  const _ = I("span", `prob-val text-${n}`);
  if (((_.textContent = Ae(i.yesPrice)), e)) {
    const v = I("span", `signal-badge ${nr(t.signal)}`);
    v.textContent = bh(t.signal);
    const x = Sh(i.id);
    if (Math.abs(x.momentum) > 2 || x.volatility > 1) {
      let b = "trend-volatile",
        w = "⚡";
      x.momentum > 3
        ? ((b = "trend-bull"), (w = "▲"))
        : x.momentum < -3
          ? ((b = "trend-bear"), (w = "▼"))
          : x.volatility > 1.5 && ((b = "trend-volatile"), (w = "⚡"));
      const k = I("span", `trend-badge ${b}`);
      ((k.textContent = w), u.append(d, _, v, k));
    } else u.append(d, _, v);
  } else {
    const v = I("span", "signal-badge sig-none");
    ((v.textContent =
      i.analyzable === !1 ? "FUERA DE ALCANCE" : "SIN ANÁLISIS"),
      (v.title =
        i.analyzable === !1
          ? "La IA no puede aportar edge en este tipo de mercado (deportes, predicciones de palabras, etc.)."
          : "Aún no se ha generado una señal para este mercado."),
      u.append(d, _, v));
  }
  if ((o.append(a, c, u), e && t.impliedProb != null && t.fairProb != null)) {
    const v = I("div", "edge-row"),
      x = t.edgePoints ?? 0,
      b = Math.abs(x),
      w = x > 0 ? "pos" : x < 0 ? "neg" : "zero",
      k = I("span", "edge-implied");
    k.textContent = `Mercado ${Math.round(t.impliedProb * 100)}%`;
    const C = I("span", "edge-sep", "·"),
      E = I("span", `edge-fair text-${n}`);
    E.textContent = `IA ${Math.round(t.fairProb * 100)}%`;
    const A = I("span", "edge-sep", "·"),
      T = I("span", `edge-value edge-${w}`),
      B = x > 0 ? "+" : x < 0 ? "−" : "";
    ((T.textContent = `Edge ${B}${b.toFixed(1)}pp`),
      v.append(k, C, E, A, T),
      o.append(v));
  }
  return (o.addEventListener("click", () => Th(o.dataset.market)), o);
}
function is() {
  const i = yh(z.markets, z.filters);
  Mh(i);
}
function Mh(i) {
  const t = document.getElementById("signals-list");
  if (t) {
    if ((t.replaceChildren(), i.length === 0)) {
      t.appendChild(wh("No hay mercados que coincidan con los filtros"));
      return;
    }
    i.forEach((e) => t.appendChild(av(e)));
  }
}
function Lh() {
  const i = document.getElementById("mini-positions");
  if (!i) return;
  if (z.positions.length === 0) {
    i.replaceChildren(wh("Aún sin posiciones", !0));
    return;
  }
  i.replaceChildren();
  let t = 0;
  z.positions.forEach((c) => {
    const u = z.markets.find((x) => x.id === c.marketId) ||
      c.market || { question: c.marketId };
    t += c.pnl || 0;
    const d = (c.pnl || 0) >= 0 ? "green" : "red",
      p = (c.pnl || 0) >= 0 ? "+" : "",
      m = I("div", "flex-between mb-6"),
      _ = I("span", "text-sm text-neutral font-mono");
    _.textContent = `${(u.question || c.marketId).substring(0, 32)}${(u.question || c.marketId).length > 32 ? "…" : ""} ${xh(c.outcome)}`;
    const v = I("span", `text-base font-semibold text-${d} font-mono`);
    ((v.textContent = `${p}€${(c.pnl || 0).toFixed(2)}`),
      m.append(_, v),
      i.appendChild(m));
  });
  const e = t >= 0 ? "green" : "red",
    n = t >= 0 ? "+" : "",
    o = I("div", "flex-between"),
    a = I("span", "text-sm text-neutral font-mono", "G&P Neto"),
    l = I("span", `text-lg font-bold text-${e} font-mono`);
  ((l.textContent = `${n}€${t.toFixed(2)}`),
    o.append(a, l),
    i.append(I("div", "divider"), o));
}
function Ch(i, t, e = "") {
  const n = `${e}detail-chart`,
    o = `${e}spark-yes`,
    a = `${e}spark-no`,
    l = ((i.yesPrice - 0.5) * 20).toFixed(1),
    c = (i.yesPrice || 0) > 0.5 ? "green" : "red",
    u = (i.yesPrice || 0) > 0.5 ? "+" : "",
    d = I("div", "detail-tag");
  d.textContent = `${i.countryCode || "GL"} · ${i.category || "General"} · Polymarket`;
  const p = I("div", "detail-q");
  p.textContent = i.question;
  const m = I("div", "detail-meta");
  m.textContent = `Vol: ${Qn(i.volumeEur || 0)} · Liq: ${Qn(i.liquidityEur || 0)} · Cierra: ${vh(i.closesAt)}`;
  const _ = I("div");
  _.append(d, p, m);
  const v = I("div", `metric-value text-${c}`);
  v.textContent = `${u}${l}%`;
  const x = I("div", "metric"),
    b = I("div", "metric-label");
  (b.append(
    I("span", "badge-full", "Cambio 24h"),
    I("span", "badge-abbr", "24h"),
  ),
    x.append(b, v));
  const w = I("div", "metric-value text-blue");
  w.textContent = `${Math.round(t.confidence * 100)}%`;
  const k = I("div", "metric");
  k.append(I("div", "metric-label", "Confianza"), w);
  const C = I("div", "outcome-mini-price yes");
  C.textContent = Ae(i.yesPrice);
  const E = I("div", "outcome-mini");
  E.append(I("div", "outcome-mini-label", "SÍ"), C);
  const A = I("div", "outcome-mini-price no");
  A.textContent = Ae(i.noPrice);
  const T = I("div", "outcome-mini");
  T.append(I("div", "outcome-mini-label", "NO"), A);
  const B = I("div", "detail-metrics");
  B.append(E, T, I("div", "metric-sep"), x, I("div", "metric-sep"), k);
  const D = I("div", "detail-header");
  D.append(_, B);
  const R = I("canvas");
  R.id = n;
  const H = I("div", "chart-container");
  H.append(I("div", "chart-label", "Historial de precios 7d"), R);
  const U = I("div", "outcomes-row"),
    W = I("span", `signal-badge ${nr(t.signal)}`),
    j = Math.round(t.confidence * 100);
  W.append(
    I("span", "badge-full", `${Yy(t.signal).toUpperCase()} · ${j}%`),
    I("span", "badge-abbr", `${Gy(t.signal)} · ${j}%`),
  );
  const xt = I("span", "model-badge");
  xt.textContent = t.modelVersion || "IA";
  const ut = I("div", "ai-title-group");
  ut.append(I("div", "ai-icon", "◈"), I("div", "ai-label", "Análisis IA"), xt);
  const rt = I("div", "flex-between mb-4");
  rt.append(ut, W);
  const Y = I("div", "ai-text");
  if (
    ((Y.textContent = t.summary || "Aún no hay análisis de IA disponible."),
    t.keyRisk)
  ) {
    const Q = document.createElement("strong");
    ((Q.textContent = "Riesgo clave:"), Y.append(" ", Q, " ", t.keyRisk));
  }
  const ct = I("div", "ai-box");
  (ct.append(rt, Y), U.append(ct, H));
  const F = I("input", "sim-input");
  ((F.type = "number"),
    (F.value = "100"),
    (F.min = "1"),
    (F.placeholder = "€"));
  const pt = I("button", "sim-btn-yes", "COMPRAR SÍ ↗"),
    V = I("button", "sim-btn-no", "COMPRAR NO"),
    nt = I("div", "kelly-note");
  nt.textContent = "Calculando sugerencia…";
  const mt = I("div", "sim-row");
  (mt.append(nt, I("span", "sim-label", "Simular posición →"), F, pt, V),
    pt.addEventListener("click", () => ql(i.id, "YES", F.value)),
    V.addEventListener("click", () => ql(i.id, "NO", F.value)));
  const vt = I("div");
  return (
    vt.append(D, U, mt),
    sf(i.id)
      .then((Q) => {
        Q &&
          (Q.illiquid &&
            ((pt.disabled = !0),
            (V.disabled = !0),
            (pt.title = `Mercado ilíquido (spread ${Math.round((i.spread ?? 0) * 100)}¢).`),
            (V.title = pt.title),
            nt.classList.add("kelly-warn")),
          Q.amountEur > 0 && (F.value = String(Q.amountEur)),
          (nt.textContent = Q.note || ""));
      })
      .catch(() => {
        nt.textContent = "";
      }),
    { content: vt, chartId: n, sparkYesId: o, sparkNoId: a }
  );
}
function ns() {
  const i = document.getElementById("detail-body");
  if (!i) return;
  const t = z.markets.find((c) => c.id === z.activeMarketId);
  if (!t) {
    i.replaceChildren();
    return;
  }
  const e = z.signals.find((c) => c.marketId === t.id) || {
      signal: "neutral",
      confidence: 0.5,
      summary: "Aún no hay análisis de IA disponible.",
      keyRisk: "",
    },
    { content: n, chartId: o, sparkYesId: a, sparkNoId: l } = Ch(t, e);
  (i.replaceChildren(n),
    fc(t.id)
      .then((c) => {
        Xn(o, t.yesPrice, c);
      })
      .catch(() => {
        Xn(o, t.yesPrice);
      }),
    Jn(a, t.yesPrice, "yes"),
    Jn(l, t.noPrice, "no"));
}
function Th(i) {
  if (window.matchMedia("(max-width: 640px)").matches) {
    if (
      (document
        .querySelectorAll(".market-card-detail")
        .forEach((p) => p.remove()),
      document
        .querySelectorAll("#signals-list .market-card.active")
        .forEach((p) => p.classList.remove("active")),
      z.activeMarketId === i)
    ) {
      z.activeMarketId = null;
      return;
    }
    ((z.activeMarketId = i), Ul(i));
    const e = document.querySelector(
      `#signals-list .market-card[data-market="${CSS.escape(i)}"]`,
    );
    if (!e) return;
    e.classList.add("active");
    const n = z.markets.find((p) => p.id === i);
    if (!n) return;
    const o = z.signals.find((p) => p.marketId === i) || {
        signal: "neutral",
        confidence: 0.5,
        summary: "Aún no hay análisis de IA disponible.",
        keyRisk: "",
      },
      {
        content: a,
        chartId: l,
        sparkYesId: c,
        sparkNoId: u,
      } = Ch(n, o, "inline-"),
      d = I("div", "market-card-detail");
    (d.appendChild(a),
      e.after(d),
      requestAnimationFrame(() => {
        (fc(n.id)
          .then((_) => {
            Xn(l, n.yesPrice, _);
          })
          .catch(() => {
            Xn(l, n.yesPrice);
          }),
          Jn(c, n.yesPrice, "yes"),
          Jn(u, n.noPrice, "no"));
        const p = document.querySelector(".main"),
          m = document.querySelector("#panel-signals .panel-header");
        if (p) {
          const _ = m ? m.offsetHeight : 0,
            v = p.getBoundingClientRect(),
            x = d.getBoundingClientRect().top - v.top + p.scrollTop - _;
          p.scrollTo({ top: x, behavior: "smooth" });
        }
      }));
  } else ((z.activeMarketId = i), is(), ns(), Ul(i));
}
function Eh() {
  const i = document.querySelector("#positions-table tbody"),
    t = document.getElementById("positions-empty");
  if (i) {
    if (z.positions.length === 0) {
      (i.replaceChildren(), t.classList.remove("hidden"));
      return;
    }
    (t.classList.add("hidden"),
      i.replaceChildren(),
      z.positions.forEach((e) => {
        const n = z.markets.find((k) => k.id === e.marketId) ||
            e.market || { question: e.marketId },
          o = (e.pnl || 0) >= 0 ? "td-green" : "td-red",
          a = (e.pnl || 0) >= 0 ? "+" : "",
          l = document.createElement("tr"),
          c = I("td");
        c.textContent = `${(n.question || e.marketId).substring(0, 40)}${(n.question || e.marketId).length > 40 ? "…" : ""}`;
        const u = I(
          "td",
          `td-mono ${e.outcome === "YES" ? "td-green" : "td-red"}`,
        );
        u.textContent = xh(e.outcome);
        const d = I("td", "td-mono");
        d.textContent = `€${e.amountEur.toFixed(0)}`;
        const p = I("td", "td-mono");
        p.textContent = Ae(e.entryPrice);
        const m = I("td", "td-mono");
        m.textContent = Ae(e.currentPrice);
        const _ = I("td", `td-mono ${o}`);
        _.textContent = `${a}€${(e.pnl || 0).toFixed(2)}`;
        const v = I("td", "td-mono td-blue");
        v.textContent = `${((e.kellyFraction || 0) * 100).toFixed(0)}%`;
        const x = I("td", "td-mono");
        x.textContent = vh(e.openedAt);
        const b = I("button", "btn-ghost", "Cerrar");
        b.addEventListener("click", () => lv(e.id));
        const w = I("td");
        (w.appendChild(b),
          l.append(c, u, d, p, m, _, v, x, w),
          i.appendChild(l));
      }));
  }
}
async function lv(i) {
  (await $y(i), await Ih(), Eh(), Lh());
}
function Ah() {
  const i = document.querySelector("#watchlist-table tbody"),
    t = document.getElementById("watchlist-empty");
  if (i) {
    if (z.watchlist.length === 0) {
      (i.replaceChildren(), t.classList.remove("hidden"));
      return;
    }
    (t.classList.add("hidden"),
      i.replaceChildren(),
      z.watchlist.forEach((e) => {
        const n = z.markets.find((w) => w.id === e.marketId) ||
            e.market || {
              question: e.marketId,
              category: "-",
              yesPrice: 0,
              noPrice: 0,
              volumeEur: 0,
            },
          o = z.signals.find((w) => w.marketId === e.marketId) || {
            signal: "neutral",
          },
          a = document.createElement("tr"),
          l = I("td");
        l.textContent = `${(n.question || e.marketId).substring(0, 40)}${(n.question || e.marketId).length > 40 ? "…" : ""}`;
        const c = I("td");
        c.textContent = n.category || "-";
        const u = I("td", "td-mono td-green");
        u.textContent = Ae(n.yesPrice);
        const d = I("td", "td-mono td-red");
        d.textContent = Ae(n.noPrice);
        const p = I("span", `signal-badge ${nr(o.signal)}`);
        p.textContent = bh(o.signal);
        const m = I("td");
        m.appendChild(p);
        const _ = I("td", "td-mono");
        _.textContent = Qn(n.volumeEur || 0);
        const v = I("td", "td-mono");
        v.textContent = e.alertThreshold ? Ae(e.alertThreshold) : "-";
        const x = I("button", "btn-ghost", "Eliminar");
        x.addEventListener("click", () => cv(e.marketId));
        const b = I("td");
        (b.appendChild(x), a.append(l, c, u, d, m, _, v, b), i.appendChild(a));
      }));
  }
}
async function cv(i) {
  try {
    await lf(i);
  } catch (t) {
    console.warn(t);
  }
  ((z.watchlist = z.watchlist.filter((t) => t.marketId !== i)), Ah());
}
function Oh() {
  const i = document.querySelector("#alerts-table tbody"),
    t = document.getElementById("alerts-empty");
  if (i) {
    if (z.alerts.length === 0) {
      (i.replaceChildren(), t.classList.remove("hidden"));
      return;
    }
    (t.classList.add("hidden"),
      i.replaceChildren(),
      z.alerts.forEach((e) => {
        const n = z.markets.find((p) => p.id === e.marketId) ||
            e.market || { question: e.marketId },
          o = document.createElement("tr"),
          a = I("td", "td-mono");
        a.textContent = new Date(e.sentAt).toLocaleString("es-ES");
        const l = I("td");
        l.textContent = `${(n.question || e.marketId).substring(0, 35)}${(n.question || e.marketId).length > 35 ? "…" : ""}`;
        const c = I("span", "signal-badge sig-neut");
        c.textContent = e.type;
        const u = I("td");
        u.appendChild(c);
        const d = I("td");
        ((d.textContent = e.message), o.append(a, l, u, d), i.appendChild(o));
      }));
  }
}
async function hv() {
  try {
    const i = await tf({ limit: 60, offset: 0 });
    ((z.markets = Array.isArray(i) ? i : []),
      (z.signalsOffset = z.markets.length),
      (z.signalsHasMore = z.markets.length === 60));
  } catch (i) {
    (console.error("Error cargando mercados:", i),
      (z.markets = []),
      (z.signalsOffset = 0),
      (z.signalsHasMore = !1));
  }
}
async function uv() {
  if (z.markets.length === 0) {
    z.signals = [];
    return;
  }
  try {
    const i = z.markets.map((e) => e.id),
      t = await ef(i);
    z.signals = t.map((e) => ({ ...e, marketId: e.marketId }));
  } catch (i) {
    (console.error("Error cargando señales:", i), (z.signals = []));
  }
}
async function Ih() {
  try {
    z.positions = await nf();
  } catch (i) {
    (console.error("Error cargando posiciones:", i), (z.positions = []));
  }
}
async function dv() {
  try {
    z.watchlist = await af();
  } catch (i) {
    (console.error("Error cargando watchlist:", i), (z.watchlist = []));
  }
}
async function fv() {
  try {
    z.alerts = await cf();
  } catch (i) {
    (console.error("Error cargando alertas:", i), (z.alerts = []));
  }
}
async function pv() {
  try {
    const i = await hf(),
      t = document.getElementById("stat-markets");
    t && (t.textContent = (i.marketsCount ?? 0).toLocaleString("es-ES"));
    const e = document.getElementById("stat-volume");
    e && (e.textContent = Qn(i.volume24h || 0));
    const n = document.getElementById("stat-signals");
    n && (n.textContent = i.signalsCount ?? 0);
    const o = document.getElementById("stat-alerts");
    o && (o.textContent = i.alertsToday ?? 0);
  } catch (i) {
    console.error("Error cargando stats:", i);
  }
}
async function sr() {
  (await hv(),
    await uv(),
    await Ih(),
    await dv(),
    await fv(),
    await pv(),
    z.markets.forEach((i) => {
      i.yesPrice != null && kh(i.id, i.yesPrice);
    }),
    Ph(),
    Wy("map-container", z.markets, z.signals, Th),
    jy(z),
    (z.activeMarketId = z.markets[0]?.id || null),
    is(),
    ns(),
    Lh());
}
async function gv() {
  (document.getElementById("sidebar-toggle")?.addEventListener("click", ov),
    document.querySelectorAll(".nav-item").forEach((e) => {
      e.addEventListener("click", () => sv(e.dataset.view));
    }),
    document.querySelectorAll(".panel-header[data-panel]").forEach((e) => {
      e.addEventListener("click", (n) => {
        n.target.closest("button, input, a") || rv(e.dataset.panel);
      });
    }),
    document.getElementById("btn-telegram")?.addEventListener("click", Gl),
    document
      .getElementById("btn-telegram-mobile")
      ?.addEventListener("click", Gl),
    document
      .getElementById("telegram-modal-close")
      ?.addEventListener("click", Oo),
    document
      .getElementById("telegram-modal")
      ?.addEventListener("click", (e) => {
        e.target.id === "telegram-modal" && Oo();
      }),
    document.getElementById("form-telegram")?.addEventListener("submit", Qy),
    document.getElementById("btn-test-telegram")?.addEventListener("click", tv),
    document.getElementById("btn-auth")?.addEventListener("click", ts),
    document.getElementById("modal-close")?.addEventListener("click", es),
    document.querySelectorAll(".modal-tab").forEach((e) => {
      e.addEventListener("click", () => Jy(e.dataset.tab));
    }),
    document.getElementById("form-login")?.addEventListener("submit", ev),
    document.getElementById("form-register")?.addEventListener("submit", iv),
    document.getElementById("auth-modal")?.addEventListener("click", (e) => {
      e.target.id === "auth-modal" && es();
    }),
    Qi(),
    (await nv()) ? (await sr(), Ky()) : ts());
  const t = Hn();
  (t.on("connect", () => console.log("Socket.io conectado")),
    t.on("market_update", (e) => {
      const n = z.markets.find((o) => o.id === e.marketId);
      n &&
        (typeof e.yesPrice == "number" &&
          (kh(n.id, e.yesPrice), (n.yesPrice = e.yesPrice)),
        typeof e.noPrice == "number" && (n.noPrice = e.noPrice),
        typeof e.volumeEur == "number" && (n.volumeEur = e.volumeEur),
        typeof e.liquidityEur == "number" && (n.liquidityEur = e.liquidityEur),
        z.activeMarketId === e.marketId && ns(),
        is(),
        Vy(e.marketId, e.yesPrice));
    }),
    t.on("ai_signal", (e) => {
      if (!e?.marketId || typeof e.signal != "string") return;
      const n = z.signals.findIndex((o) => o.marketId === e.marketId);
      (n >= 0 ? (z.signals[n] = e) : z.signals.push(e),
        is(),
        z.activeMarketId === e.marketId && ns());
    }),
    t.on("price_alert", (e) => {
      !e?.marketId ||
        !e.type ||
        (z.alerts.unshift(e), z.view === "alerts" && Oh());
    }));
}
gv().catch((i) => console.error("Failed to initialize app:", i));
