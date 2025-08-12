"use strict";
exports.id = 367;
exports.ids = [367];
exports.modules = {

/***/ 19367:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  p256: () => (/* binding */ p256_p256)
});

// UNUSED EXPORTS: encodeToCurve, hashToCurve, secp256r1

// EXTERNAL MODULE: external "node:crypto"
var external_node_crypto_ = __webpack_require__(77598);
var external_node_crypto_namespaceObject = /*#__PURE__*/__webpack_require__.t(external_node_crypto_, 2);
;// CONCATENATED MODULE: ./node_modules/@noble/hashes/esm/cryptoNode.js
/**
 * Internal webcrypto alias.
 * We prefer WebCrypto aka globalThis.crypto, which exists in node.js 16+.
 * Falls back to Node.js built-in crypto for Node.js <=v14.
 * See utils.ts for details.
 * @module
 */
// @ts-ignore

const cryptoNode_crypto = external_node_crypto_namespaceObject && typeof external_node_crypto_namespaceObject === 'object' && "webcrypto" in external_node_crypto_namespaceObject
    ? external_node_crypto_.webcrypto
    : external_node_crypto_namespaceObject && typeof external_node_crypto_namespaceObject === 'object' && "randomBytes" in external_node_crypto_namespaceObject
        ? external_node_crypto_namespaceObject
        : undefined;
//# sourceMappingURL=cryptoNode.js.map
;// CONCATENATED MODULE: ./node_modules/@noble/hashes/esm/utils.js
/**
 * Utilities for hex, bytes, CSPRNG.
 * @module
 */
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// We use WebCrypto aka globalThis.crypto, which exists in browsers and node.js 16+.
// node.js versions earlier than v19 don't declare it in global scope.
// For node.js, package.json#exports field mapping rewrites import
// from `crypto` to `cryptoNode`, which imports native module.
// Makes the utils un-importable in browsers without a bundler.
// Once node.js 18 is deprecated (2025-04-30), we can just drop the import.

/** Checks if something is Uint8Array. Be careful: nodejs Buffer will return true. */
function isBytes(a) {
    return a instanceof Uint8Array || (ArrayBuffer.isView(a) && a.constructor.name === 'Uint8Array');
}
/** Asserts something is positive integer. */
function anumber(n) {
    if (!Number.isSafeInteger(n) || n < 0)
        throw new Error('positive integer expected, got ' + n);
}
/** Asserts something is Uint8Array. */
function abytes(b, ...lengths) {
    if (!isBytes(b))
        throw new Error('Uint8Array expected');
    if (lengths.length > 0 && !lengths.includes(b.length))
        throw new Error('Uint8Array expected of length ' + lengths + ', got length=' + b.length);
}
/** Asserts something is hash */
function ahash(h) {
    if (typeof h !== 'function' || typeof h.create !== 'function')
        throw new Error('Hash should be wrapped by utils.createHasher');
    anumber(h.outputLen);
    anumber(h.blockLen);
}
/** Asserts a hash instance has not been destroyed / finished */
function aexists(instance, checkFinished = true) {
    if (instance.destroyed)
        throw new Error('Hash instance has been destroyed');
    if (checkFinished && instance.finished)
        throw new Error('Hash#digest() has already been called');
}
/** Asserts output is properly-sized byte array */
function aoutput(out, instance) {
    abytes(out);
    const min = instance.outputLen;
    if (out.length < min) {
        throw new Error('digestInto() expects output buffer of length at least ' + min);
    }
}
/** Cast u8 / u16 / u32 to u8. */
function u8(arr) {
    return new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
}
/** Cast u8 / u16 / u32 to u32. */
function u32(arr) {
    return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
/** Zeroize a byte array. Warning: JS provides no guarantees. */
function clean(...arrays) {
    for (let i = 0; i < arrays.length; i++) {
        arrays[i].fill(0);
    }
}
/** Create DataView of an array for easy byte-level manipulation. */
function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
/** The rotate right (circular right shift) operation for uint32 */
function rotr(word, shift) {
    return (word << (32 - shift)) | (word >>> shift);
}
/** The rotate left (circular left shift) operation for uint32 */
function rotl(word, shift) {
    return (word << shift) | ((word >>> (32 - shift)) >>> 0);
}
/** Is current platform little-endian? Most are. Big-Endian platform: IBM */
const isLE = /* @__PURE__ */ (/* unused pure expression or super */ null && ((() => new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44)()));
/** The byte swap operation for uint32 */
function byteSwap(word) {
    return (((word << 24) & 0xff000000) |
        ((word << 8) & 0xff0000) |
        ((word >>> 8) & 0xff00) |
        ((word >>> 24) & 0xff));
}
/** Conditionally byte swap if on a big-endian platform */
const swap8IfBE = (/* unused pure expression or super */ null && (isLE
    ? (n) => n
    : (n) => byteSwap(n)));
/** @deprecated */
const byteSwapIfBE = (/* unused pure expression or super */ null && (swap8IfBE));
/** In place byte swap for Uint32Array */
function byteSwap32(arr) {
    for (let i = 0; i < arr.length; i++) {
        arr[i] = byteSwap(arr[i]);
    }
    return arr;
}
const swap32IfBE = (/* unused pure expression or super */ null && (isLE
    ? (u) => u
    : byteSwap32));
// Built-in hex conversion https://caniuse.com/mdn-javascript_builtins_uint8array_fromhex
const hasHexBuiltin = /* @__PURE__ */ (() => 
// @ts-ignore
typeof Uint8Array.from([]).toHex === 'function' && typeof Uint8Array.fromHex === 'function')();
// Array where index 0xf0 (240) is mapped to string 'f0'
const hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));
/**
 * Convert byte array to hex string. Uses built-in function, when available.
 * @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
 */
function bytesToHex(bytes) {
    abytes(bytes);
    // @ts-ignore
    if (hasHexBuiltin)
        return bytes.toHex();
    // pre-caching improves the speed 6x
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
        hex += hexes[bytes[i]];
    }
    return hex;
}
// We use optimized technique to convert hex string to byte array
const asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function asciiToBase16(ch) {
    if (ch >= asciis._0 && ch <= asciis._9)
        return ch - asciis._0; // '2' => 50-48
    if (ch >= asciis.A && ch <= asciis.F)
        return ch - (asciis.A - 10); // 'B' => 66-(65-10)
    if (ch >= asciis.a && ch <= asciis.f)
        return ch - (asciis.a - 10); // 'b' => 98-(97-10)
    return;
}
/**
 * Convert hex string to byte array. Uses built-in function, when available.
 * @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
 */
function hexToBytes(hex) {
    if (typeof hex !== 'string')
        throw new Error('hex string expected, got ' + typeof hex);
    // @ts-ignore
    if (hasHexBuiltin)
        return Uint8Array.fromHex(hex);
    const hl = hex.length;
    const al = hl / 2;
    if (hl % 2)
        throw new Error('hex string expected, got unpadded hex of length ' + hl);
    const array = new Uint8Array(al);
    for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
        const n1 = asciiToBase16(hex.charCodeAt(hi));
        const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
        if (n1 === undefined || n2 === undefined) {
            const char = hex[hi] + hex[hi + 1];
            throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
        }
        array[ai] = n1 * 16 + n2; // multiply first octet, e.g. 'a3' => 10*16+3 => 160 + 3 => 163
    }
    return array;
}
/**
 * There is no setImmediate in browser and setTimeout is slow.
 * Call of async fn will return Promise, which will be fullfiled only on
 * next scheduler queue processing step and this is exactly what we need.
 */
const nextTick = async () => { };
/** Returns control to thread each 'tick' ms to avoid blocking. */
async function asyncLoop(iters, tick, cb) {
    let ts = Date.now();
    for (let i = 0; i < iters; i++) {
        cb(i);
        // Date.now() is not monotonic, so in case if clock goes backwards we return return control too
        const diff = Date.now() - ts;
        if (diff >= 0 && diff < tick)
            continue;
        await nextTick();
        ts += diff;
    }
}
/**
 * Converts string to bytes using UTF8 encoding.
 * @example utf8ToBytes('abc') // Uint8Array.from([97, 98, 99])
 */
function utf8ToBytes(str) {
    if (typeof str !== 'string')
        throw new Error('string expected');
    return new Uint8Array(new TextEncoder().encode(str)); // https://bugzil.la/1681809
}
/**
 * Converts bytes to string using UTF8 encoding.
 * @example bytesToUtf8(Uint8Array.from([97, 98, 99])) // 'abc'
 */
function bytesToUtf8(bytes) {
    return new TextDecoder().decode(bytes);
}
/**
 * Normalizes (non-hex) string or Uint8Array to Uint8Array.
 * Warning: when Uint8Array is passed, it would NOT get copied.
 * Keep in mind for future mutable operations.
 */
function toBytes(data) {
    if (typeof data === 'string')
        data = utf8ToBytes(data);
    abytes(data);
    return data;
}
/**
 * Helper for KDFs: consumes uint8array or string.
 * When string is passed, does utf8 decoding, using TextDecoder.
 */
function kdfInputToBytes(data) {
    if (typeof data === 'string')
        data = utf8ToBytes(data);
    abytes(data);
    return data;
}
/** Copies several Uint8Arrays into one. */
function concatBytes(...arrays) {
    let sum = 0;
    for (let i = 0; i < arrays.length; i++) {
        const a = arrays[i];
        abytes(a);
        sum += a.length;
    }
    const res = new Uint8Array(sum);
    for (let i = 0, pad = 0; i < arrays.length; i++) {
        const a = arrays[i];
        res.set(a, pad);
        pad += a.length;
    }
    return res;
}
function checkOpts(defaults, opts) {
    if (opts !== undefined && {}.toString.call(opts) !== '[object Object]')
        throw new Error('options should be object or undefined');
    const merged = Object.assign(defaults, opts);
    return merged;
}
/** For runtime check if class implements interface */
class Hash {
}
/** Wraps hash function, creating an interface on top of it */
function utils_createHasher(hashCons) {
    const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashCons();
    return hashC;
}
function createOptHasher(hashCons) {
    const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
    const tmp = hashCons({});
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (opts) => hashCons(opts);
    return hashC;
}
function createXOFer(hashCons) {
    const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
    const tmp = hashCons({});
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (opts) => hashCons(opts);
    return hashC;
}
const wrapConstructor = (/* unused pure expression or super */ null && (utils_createHasher));
const wrapConstructorWithOpts = (/* unused pure expression or super */ null && (createOptHasher));
const wrapXOFConstructorWithOpts = (/* unused pure expression or super */ null && (createXOFer));
/** Cryptographically secure PRNG. Uses internal OS-level `crypto.getRandomValues`. */
function utils_randomBytes(bytesLength = 32) {
    if (cryptoNode_crypto && typeof cryptoNode_crypto.getRandomValues === 'function') {
        return cryptoNode_crypto.getRandomValues(new Uint8Array(bytesLength));
    }
    // Legacy Node.js compatibility
    if (cryptoNode_crypto && typeof cryptoNode_crypto.randomBytes === 'function') {
        return Uint8Array.from(cryptoNode_crypto.randomBytes(bytesLength));
    }
    throw new Error('crypto.getRandomValues must be defined');
}
//# sourceMappingURL=utils.js.map
;// CONCATENATED MODULE: ./node_modules/@noble/hashes/esm/_md.js
/**
 * Internal Merkle-Damgard hash utils.
 * @module
 */

/** Polyfill for Safari 14. https://caniuse.com/mdn-javascript_builtins_dataview_setbiguint64 */
function setBigUint64(view, byteOffset, value, isLE) {
    if (typeof view.setBigUint64 === 'function')
        return view.setBigUint64(byteOffset, value, isLE);
    const _32n = BigInt(32);
    const _u32_max = BigInt(0xffffffff);
    const wh = Number((value >> _32n) & _u32_max);
    const wl = Number(value & _u32_max);
    const h = isLE ? 4 : 0;
    const l = isLE ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE);
    view.setUint32(byteOffset + l, wl, isLE);
}
/** Choice: a ? b : c */
function Chi(a, b, c) {
    return (a & b) ^ (~a & c);
}
/** Majority function, true if any two inputs is true. */
function Maj(a, b, c) {
    return (a & b) ^ (a & c) ^ (b & c);
}
/**
 * Merkle-Damgard hash construction base class.
 * Could be used to create MD5, RIPEMD, SHA1, SHA2.
 */
class HashMD extends Hash {
    constructor(blockLen, outputLen, padOffset, isLE) {
        super();
        this.finished = false;
        this.length = 0;
        this.pos = 0;
        this.destroyed = false;
        this.blockLen = blockLen;
        this.outputLen = outputLen;
        this.padOffset = padOffset;
        this.isLE = isLE;
        this.buffer = new Uint8Array(blockLen);
        this.view = createView(this.buffer);
    }
    update(data) {
        aexists(this);
        data = toBytes(data);
        abytes(data);
        const { view, buffer, blockLen } = this;
        const len = data.length;
        for (let pos = 0; pos < len;) {
            const take = Math.min(blockLen - this.pos, len - pos);
            // Fast path: we have at least one block in input, cast it to view and process
            if (take === blockLen) {
                const dataView = createView(data);
                for (; blockLen <= len - pos; pos += blockLen)
                    this.process(dataView, pos);
                continue;
            }
            buffer.set(data.subarray(pos, pos + take), this.pos);
            this.pos += take;
            pos += take;
            if (this.pos === blockLen) {
                this.process(view, 0);
                this.pos = 0;
            }
        }
        this.length += data.length;
        this.roundClean();
        return this;
    }
    digestInto(out) {
        aexists(this);
        aoutput(out, this);
        this.finished = true;
        // Padding
        // We can avoid allocation of buffer for padding completely if it
        // was previously not allocated here. But it won't change performance.
        const { buffer, view, blockLen, isLE } = this;
        let { pos } = this;
        // append the bit '1' to the message
        buffer[pos++] = 0b10000000;
        clean(this.buffer.subarray(pos));
        // we have less than padOffset left in buffer, so we cannot put length in
        // current block, need process it and pad again
        if (this.padOffset > blockLen - pos) {
            this.process(view, 0);
            pos = 0;
        }
        // Pad until full block byte with zeros
        for (let i = pos; i < blockLen; i++)
            buffer[i] = 0;
        // Note: sha512 requires length to be 128bit integer, but length in JS will overflow before that
        // You need to write around 2 exabytes (u64_max / 8 / (1024**6)) for this to happen.
        // So we just write lowest 64 bits of that value.
        setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
        this.process(view, 0);
        const oview = createView(out);
        const len = this.outputLen;
        // NOTE: we do division by 4 later, which should be fused in single op with modulo by JIT
        if (len % 4)
            throw new Error('_sha2: outputLen should be aligned to 32bit');
        const outLen = len / 4;
        const state = this.get();
        if (outLen > state.length)
            throw new Error('_sha2: outputLen bigger than state');
        for (let i = 0; i < outLen; i++)
            oview.setUint32(4 * i, state[i], isLE);
    }
    digest() {
        const { buffer, outputLen } = this;
        this.digestInto(buffer);
        const res = buffer.slice(0, outputLen);
        this.destroy();
        return res;
    }
    _cloneInto(to) {
        to || (to = new this.constructor());
        to.set(...this.get());
        const { blockLen, buffer, length, finished, destroyed, pos } = this;
        to.destroyed = destroyed;
        to.finished = finished;
        to.length = length;
        to.pos = pos;
        if (length % blockLen)
            to.buffer.set(buffer);
        return to;
    }
    clone() {
        return this._cloneInto();
    }
}
/**
 * Initial SHA-2 state: fractional parts of square roots of first 16 primes 2..53.
 * Check out `test/misc/sha2-gen-iv.js` for recomputation guide.
 */
/** Initial SHA256 state. Bits 0..32 of frac part of sqrt of primes 2..19 */
const SHA256_IV = /* @__PURE__ */ Uint32Array.from([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
]);
/** Initial SHA224 state. Bits 32..64 of frac part of sqrt of primes 23..53 */
const SHA224_IV = /* @__PURE__ */ Uint32Array.from([
    0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939, 0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4,
]);
/** Initial SHA384 state. Bits 0..64 of frac part of sqrt of primes 23..53 */
const SHA384_IV = /* @__PURE__ */ Uint32Array.from([
    0xcbbb9d5d, 0xc1059ed8, 0x629a292a, 0x367cd507, 0x9159015a, 0x3070dd17, 0x152fecd8, 0xf70e5939,
    0x67332667, 0xffc00b31, 0x8eb44a87, 0x68581511, 0xdb0c2e0d, 0x64f98fa7, 0x47b5481d, 0xbefa4fa4,
]);
/** Initial SHA512 state. Bits 0..64 of frac part of sqrt of primes 2..19 */
const SHA512_IV = /* @__PURE__ */ Uint32Array.from([
    0x6a09e667, 0xf3bcc908, 0xbb67ae85, 0x84caa73b, 0x3c6ef372, 0xfe94f82b, 0xa54ff53a, 0x5f1d36f1,
    0x510e527f, 0xade682d1, 0x9b05688c, 0x2b3e6c1f, 0x1f83d9ab, 0xfb41bd6b, 0x5be0cd19, 0x137e2179,
]);
//# sourceMappingURL=_md.js.map
;// CONCATENATED MODULE: ./node_modules/@noble/hashes/esm/_u64.js
/**
 * Internal helpers for u64. BigUint64Array is too slow as per 2025, so we implement it using Uint32Array.
 * @todo re-check https://issues.chromium.org/issues/42212588
 * @module
 */
const U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
const _32n = /* @__PURE__ */ BigInt(32);
function fromBig(n, le = false) {
    if (le)
        return { h: Number(n & U32_MASK64), l: Number((n >> _32n) & U32_MASK64) };
    return { h: Number((n >> _32n) & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
    const len = lst.length;
    let Ah = new Uint32Array(len);
    let Al = new Uint32Array(len);
    for (let i = 0; i < len; i++) {
        const { h, l } = fromBig(lst[i], le);
        [Ah[i], Al[i]] = [h, l];
    }
    return [Ah, Al];
}
const toBig = (h, l) => (BigInt(h >>> 0) << _32n) | BigInt(l >>> 0);
// for Shift in [0, 32)
const shrSH = (h, _l, s) => h >>> s;
const shrSL = (h, l, s) => (h << (32 - s)) | (l >>> s);
// Right rotate for Shift in [1, 32)
const rotrSH = (h, l, s) => (h >>> s) | (l << (32 - s));
const rotrSL = (h, l, s) => (h << (32 - s)) | (l >>> s);
// Right rotate for Shift in (32, 64), NOTE: 32 is special case.
const rotrBH = (h, l, s) => (h << (64 - s)) | (l >>> (s - 32));
const rotrBL = (h, l, s) => (h >>> (s - 32)) | (l << (64 - s));
// Right rotate for shift===32 (just swaps l&h)
const rotr32H = (_h, l) => l;
const rotr32L = (h, _l) => h;
// Left rotate for Shift in [1, 32)
const rotlSH = (h, l, s) => (h << s) | (l >>> (32 - s));
const rotlSL = (h, l, s) => (l << s) | (h >>> (32 - s));
// Left rotate for Shift in (32, 64), NOTE: 32 is special case.
const rotlBH = (h, l, s) => (l << (s - 32)) | (h >>> (64 - s));
const rotlBL = (h, l, s) => (h << (s - 32)) | (l >>> (64 - s));
// JS uses 32-bit signed integers for bitwise operations which means we cannot
// simple take carry out of low bit sum by shift, we need to use division.
function add(Ah, Al, Bh, Bl) {
    const l = (Al >>> 0) + (Bl >>> 0);
    return { h: (Ah + Bh + ((l / 2 ** 32) | 0)) | 0, l: l | 0 };
}
// Addition with more than 2 elements
const add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
const add3H = (low, Ah, Bh, Ch) => (Ah + Bh + Ch + ((low / 2 ** 32) | 0)) | 0;
const add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
const add4H = (low, Ah, Bh, Ch, Dh) => (Ah + Bh + Ch + Dh + ((low / 2 ** 32) | 0)) | 0;
const add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
const add5H = (low, Ah, Bh, Ch, Dh, Eh) => (Ah + Bh + Ch + Dh + Eh + ((low / 2 ** 32) | 0)) | 0;
// prettier-ignore

// prettier-ignore
const u64 = {
    fromBig, split, toBig,
    shrSH, shrSL,
    rotrSH, rotrSL, rotrBH, rotrBL,
    rotr32H, rotr32L,
    rotlSH, rotlSL, rotlBH, rotlBL,
    add, add3L, add3H, add4L, add4H, add5H, add5L,
};
/* harmony default export */ const _u64 = ((/* unused pure expression or super */ null && (u64)));
//# sourceMappingURL=_u64.js.map
;// CONCATENATED MODULE: ./node_modules/@noble/hashes/esm/sha2.js
/**
 * SHA2 hash function. A.k.a. sha256, sha384, sha512, sha512_224, sha512_256.
 * SHA256 is the fastest hash implementable in JS, even faster than Blake3.
 * Check out [RFC 4634](https://datatracker.ietf.org/doc/html/rfc4634) and
 * [FIPS 180-4](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf).
 * @module
 */



/**
 * Round constants:
 * First 32 bits of fractional parts of the cube roots of the first 64 primes 2..311)
 */
// prettier-ignore
const SHA256_K = /* @__PURE__ */ Uint32Array.from([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);
/** Reusable temporary buffer. "W" comes straight from spec. */
const SHA256_W = /* @__PURE__ */ new Uint32Array(64);
class SHA256 extends HashMD {
    constructor(outputLen = 32) {
        super(64, outputLen, 8, false);
        // We cannot use array here since array allows indexing by variable
        // which means optimizer/compiler cannot use registers.
        this.A = SHA256_IV[0] | 0;
        this.B = SHA256_IV[1] | 0;
        this.C = SHA256_IV[2] | 0;
        this.D = SHA256_IV[3] | 0;
        this.E = SHA256_IV[4] | 0;
        this.F = SHA256_IV[5] | 0;
        this.G = SHA256_IV[6] | 0;
        this.H = SHA256_IV[7] | 0;
    }
    get() {
        const { A, B, C, D, E, F, G, H } = this;
        return [A, B, C, D, E, F, G, H];
    }
    // prettier-ignore
    set(A, B, C, D, E, F, G, H) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D | 0;
        this.E = E | 0;
        this.F = F | 0;
        this.G = G | 0;
        this.H = H | 0;
    }
    process(view, offset) {
        // Extend the first 16 words into the remaining 48 words w[16..63] of the message schedule array
        for (let i = 0; i < 16; i++, offset += 4)
            SHA256_W[i] = view.getUint32(offset, false);
        for (let i = 16; i < 64; i++) {
            const W15 = SHA256_W[i - 15];
            const W2 = SHA256_W[i - 2];
            const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ (W15 >>> 3);
            const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ (W2 >>> 10);
            SHA256_W[i] = (s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16]) | 0;
        }
        // Compression function main loop, 64 rounds
        let { A, B, C, D, E, F, G, H } = this;
        for (let i = 0; i < 64; i++) {
            const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
            const T1 = (H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i]) | 0;
            const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
            const T2 = (sigma0 + Maj(A, B, C)) | 0;
            H = G;
            G = F;
            F = E;
            E = (D + T1) | 0;
            D = C;
            C = B;
            B = A;
            A = (T1 + T2) | 0;
        }
        // Add the compressed chunk to the current hash value
        A = (A + this.A) | 0;
        B = (B + this.B) | 0;
        C = (C + this.C) | 0;
        D = (D + this.D) | 0;
        E = (E + this.E) | 0;
        F = (F + this.F) | 0;
        G = (G + this.G) | 0;
        H = (H + this.H) | 0;
        this.set(A, B, C, D, E, F, G, H);
    }
    roundClean() {
        clean(SHA256_W);
    }
    destroy() {
        this.set(0, 0, 0, 0, 0, 0, 0, 0);
        clean(this.buffer);
    }
}
class SHA224 extends SHA256 {
    constructor() {
        super(28);
        this.A = SHA224_IV[0] | 0;
        this.B = SHA224_IV[1] | 0;
        this.C = SHA224_IV[2] | 0;
        this.D = SHA224_IV[3] | 0;
        this.E = SHA224_IV[4] | 0;
        this.F = SHA224_IV[5] | 0;
        this.G = SHA224_IV[6] | 0;
        this.H = SHA224_IV[7] | 0;
    }
}
// SHA2-512 is slower than sha256 in js because u64 operations are slow.
// Round contants
// First 32 bits of the fractional parts of the cube roots of the first 80 primes 2..409
// prettier-ignore
const K512 = /* @__PURE__ */ (() => split([
    '0x428a2f98d728ae22', '0x7137449123ef65cd', '0xb5c0fbcfec4d3b2f', '0xe9b5dba58189dbbc',
    '0x3956c25bf348b538', '0x59f111f1b605d019', '0x923f82a4af194f9b', '0xab1c5ed5da6d8118',
    '0xd807aa98a3030242', '0x12835b0145706fbe', '0x243185be4ee4b28c', '0x550c7dc3d5ffb4e2',
    '0x72be5d74f27b896f', '0x80deb1fe3b1696b1', '0x9bdc06a725c71235', '0xc19bf174cf692694',
    '0xe49b69c19ef14ad2', '0xefbe4786384f25e3', '0x0fc19dc68b8cd5b5', '0x240ca1cc77ac9c65',
    '0x2de92c6f592b0275', '0x4a7484aa6ea6e483', '0x5cb0a9dcbd41fbd4', '0x76f988da831153b5',
    '0x983e5152ee66dfab', '0xa831c66d2db43210', '0xb00327c898fb213f', '0xbf597fc7beef0ee4',
    '0xc6e00bf33da88fc2', '0xd5a79147930aa725', '0x06ca6351e003826f', '0x142929670a0e6e70',
    '0x27b70a8546d22ffc', '0x2e1b21385c26c926', '0x4d2c6dfc5ac42aed', '0x53380d139d95b3df',
    '0x650a73548baf63de', '0x766a0abb3c77b2a8', '0x81c2c92e47edaee6', '0x92722c851482353b',
    '0xa2bfe8a14cf10364', '0xa81a664bbc423001', '0xc24b8b70d0f89791', '0xc76c51a30654be30',
    '0xd192e819d6ef5218', '0xd69906245565a910', '0xf40e35855771202a', '0x106aa07032bbd1b8',
    '0x19a4c116b8d2d0c8', '0x1e376c085141ab53', '0x2748774cdf8eeb99', '0x34b0bcb5e19b48a8',
    '0x391c0cb3c5c95a63', '0x4ed8aa4ae3418acb', '0x5b9cca4f7763e373', '0x682e6ff3d6b2b8a3',
    '0x748f82ee5defb2fc', '0x78a5636f43172f60', '0x84c87814a1f0ab72', '0x8cc702081a6439ec',
    '0x90befffa23631e28', '0xa4506cebde82bde9', '0xbef9a3f7b2c67915', '0xc67178f2e372532b',
    '0xca273eceea26619c', '0xd186b8c721c0c207', '0xeada7dd6cde0eb1e', '0xf57d4f7fee6ed178',
    '0x06f067aa72176fba', '0x0a637dc5a2c898a6', '0x113f9804bef90dae', '0x1b710b35131c471b',
    '0x28db77f523047d84', '0x32caab7b40c72493', '0x3c9ebe0a15c9bebc', '0x431d67c49c100d4c',
    '0x4cc5d4becb3e42b6', '0x597f299cfc657e2a', '0x5fcb6fab3ad6faec', '0x6c44198c4a475817'
].map(n => BigInt(n))))();
const SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
const SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
// Reusable temporary buffers
const SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
const SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
class SHA512 extends HashMD {
    constructor(outputLen = 64) {
        super(128, outputLen, 16, false);
        // We cannot use array here since array allows indexing by variable
        // which means optimizer/compiler cannot use registers.
        // h -- high 32 bits, l -- low 32 bits
        this.Ah = SHA512_IV[0] | 0;
        this.Al = SHA512_IV[1] | 0;
        this.Bh = SHA512_IV[2] | 0;
        this.Bl = SHA512_IV[3] | 0;
        this.Ch = SHA512_IV[4] | 0;
        this.Cl = SHA512_IV[5] | 0;
        this.Dh = SHA512_IV[6] | 0;
        this.Dl = SHA512_IV[7] | 0;
        this.Eh = SHA512_IV[8] | 0;
        this.El = SHA512_IV[9] | 0;
        this.Fh = SHA512_IV[10] | 0;
        this.Fl = SHA512_IV[11] | 0;
        this.Gh = SHA512_IV[12] | 0;
        this.Gl = SHA512_IV[13] | 0;
        this.Hh = SHA512_IV[14] | 0;
        this.Hl = SHA512_IV[15] | 0;
    }
    // prettier-ignore
    get() {
        const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
    }
    // prettier-ignore
    set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
        this.Ah = Ah | 0;
        this.Al = Al | 0;
        this.Bh = Bh | 0;
        this.Bl = Bl | 0;
        this.Ch = Ch | 0;
        this.Cl = Cl | 0;
        this.Dh = Dh | 0;
        this.Dl = Dl | 0;
        this.Eh = Eh | 0;
        this.El = El | 0;
        this.Fh = Fh | 0;
        this.Fl = Fl | 0;
        this.Gh = Gh | 0;
        this.Gl = Gl | 0;
        this.Hh = Hh | 0;
        this.Hl = Hl | 0;
    }
    process(view, offset) {
        // Extend the first 16 words into the remaining 64 words w[16..79] of the message schedule array
        for (let i = 0; i < 16; i++, offset += 4) {
            SHA512_W_H[i] = view.getUint32(offset);
            SHA512_W_L[i] = view.getUint32((offset += 4));
        }
        for (let i = 16; i < 80; i++) {
            // s0 := (w[i-15] rightrotate 1) xor (w[i-15] rightrotate 8) xor (w[i-15] rightshift 7)
            const W15h = SHA512_W_H[i - 15] | 0;
            const W15l = SHA512_W_L[i - 15] | 0;
            const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
            const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
            // s1 := (w[i-2] rightrotate 19) xor (w[i-2] rightrotate 61) xor (w[i-2] rightshift 6)
            const W2h = SHA512_W_H[i - 2] | 0;
            const W2l = SHA512_W_L[i - 2] | 0;
            const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
            const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
            // SHA256_W[i] = s0 + s1 + SHA256_W[i - 7] + SHA256_W[i - 16];
            const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
            const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
            SHA512_W_H[i] = SUMh | 0;
            SHA512_W_L[i] = SUMl | 0;
        }
        let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        // Compression function main loop, 80 rounds
        for (let i = 0; i < 80; i++) {
            // S1 := (e rightrotate 14) xor (e rightrotate 18) xor (e rightrotate 41)
            const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
            const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
            //const T1 = (H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i]) | 0;
            const CHIh = (Eh & Fh) ^ (~Eh & Gh);
            const CHIl = (El & Fl) ^ (~El & Gl);
            // T1 = H + sigma1 + Chi(E, F, G) + SHA512_K[i] + SHA512_W[i]
            // prettier-ignore
            const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
            const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
            const T1l = T1ll | 0;
            // S0 := (a rightrotate 28) xor (a rightrotate 34) xor (a rightrotate 39)
            const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
            const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
            const MAJh = (Ah & Bh) ^ (Ah & Ch) ^ (Bh & Ch);
            const MAJl = (Al & Bl) ^ (Al & Cl) ^ (Bl & Cl);
            Hh = Gh | 0;
            Hl = Gl | 0;
            Gh = Fh | 0;
            Gl = Fl | 0;
            Fh = Eh | 0;
            Fl = El | 0;
            ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
            Dh = Ch | 0;
            Dl = Cl | 0;
            Ch = Bh | 0;
            Cl = Bl | 0;
            Bh = Ah | 0;
            Bl = Al | 0;
            const All = add3L(T1l, sigma0l, MAJl);
            Ah = add3H(All, T1h, sigma0h, MAJh);
            Al = All | 0;
        }
        // Add the compressed chunk to the current hash value
        ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
        ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
        ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
        ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
        ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
        ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
        ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
        ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
        this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
    }
    roundClean() {
        clean(SHA512_W_H, SHA512_W_L);
    }
    destroy() {
        clean(this.buffer);
        this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
}
class SHA384 extends SHA512 {
    constructor() {
        super(48);
        this.Ah = SHA384_IV[0] | 0;
        this.Al = SHA384_IV[1] | 0;
        this.Bh = SHA384_IV[2] | 0;
        this.Bl = SHA384_IV[3] | 0;
        this.Ch = SHA384_IV[4] | 0;
        this.Cl = SHA384_IV[5] | 0;
        this.Dh = SHA384_IV[6] | 0;
        this.Dl = SHA384_IV[7] | 0;
        this.Eh = SHA384_IV[8] | 0;
        this.El = SHA384_IV[9] | 0;
        this.Fh = SHA384_IV[10] | 0;
        this.Fl = SHA384_IV[11] | 0;
        this.Gh = SHA384_IV[12] | 0;
        this.Gl = SHA384_IV[13] | 0;
        this.Hh = SHA384_IV[14] | 0;
        this.Hl = SHA384_IV[15] | 0;
    }
}
/**
 * Truncated SHA512/256 and SHA512/224.
 * SHA512_IV is XORed with 0xa5a5a5a5a5a5a5a5, then used as "intermediary" IV of SHA512/t.
 * Then t hashes string to produce result IV.
 * See `test/misc/sha2-gen-iv.js`.
 */
/** SHA512/224 IV */
const T224_IV = /* @__PURE__ */ Uint32Array.from([
    0x8c3d37c8, 0x19544da2, 0x73e19966, 0x89dcd4d6, 0x1dfab7ae, 0x32ff9c82, 0x679dd514, 0x582f9fcf,
    0x0f6d2b69, 0x7bd44da8, 0x77e36f73, 0x04c48942, 0x3f9d85a8, 0x6a1d36c8, 0x1112e6ad, 0x91d692a1,
]);
/** SHA512/256 IV */
const T256_IV = /* @__PURE__ */ Uint32Array.from([
    0x22312194, 0xfc2bf72c, 0x9f555fa3, 0xc84c64c2, 0x2393b86b, 0x6f53b151, 0x96387719, 0x5940eabd,
    0x96283ee2, 0xa88effe3, 0xbe5e1e25, 0x53863992, 0x2b0199fc, 0x2c85b8aa, 0x0eb72ddc, 0x81c52ca2,
]);
class SHA512_224 extends SHA512 {
    constructor() {
        super(28);
        this.Ah = T224_IV[0] | 0;
        this.Al = T224_IV[1] | 0;
        this.Bh = T224_IV[2] | 0;
        this.Bl = T224_IV[3] | 0;
        this.Ch = T224_IV[4] | 0;
        this.Cl = T224_IV[5] | 0;
        this.Dh = T224_IV[6] | 0;
        this.Dl = T224_IV[7] | 0;
        this.Eh = T224_IV[8] | 0;
        this.El = T224_IV[9] | 0;
        this.Fh = T224_IV[10] | 0;
        this.Fl = T224_IV[11] | 0;
        this.Gh = T224_IV[12] | 0;
        this.Gl = T224_IV[13] | 0;
        this.Hh = T224_IV[14] | 0;
        this.Hl = T224_IV[15] | 0;
    }
}
class SHA512_256 extends SHA512 {
    constructor() {
        super(32);
        this.Ah = T256_IV[0] | 0;
        this.Al = T256_IV[1] | 0;
        this.Bh = T256_IV[2] | 0;
        this.Bl = T256_IV[3] | 0;
        this.Ch = T256_IV[4] | 0;
        this.Cl = T256_IV[5] | 0;
        this.Dh = T256_IV[6] | 0;
        this.Dl = T256_IV[7] | 0;
        this.Eh = T256_IV[8] | 0;
        this.El = T256_IV[9] | 0;
        this.Fh = T256_IV[10] | 0;
        this.Fl = T256_IV[11] | 0;
        this.Gh = T256_IV[12] | 0;
        this.Gl = T256_IV[13] | 0;
        this.Hh = T256_IV[14] | 0;
        this.Hl = T256_IV[15] | 0;
    }
}
/**
 * SHA2-256 hash function from RFC 4634.
 *
 * It is the fastest JS hash, even faster than Blake3.
 * To break sha256 using birthday attack, attackers need to try 2^128 hashes.
 * BTC network is doing 2^70 hashes/sec (2^95 hashes/year) as per 2025.
 */
const sha2_sha256 = /* @__PURE__ */ utils_createHasher(() => new SHA256());
/** SHA2-224 hash function from RFC 4634 */
const sha224 = /* @__PURE__ */ (/* unused pure expression or super */ null && (createHasher(() => new SHA224())));
/** SHA2-512 hash function from RFC 4634. */
const sha2_sha512 = /* @__PURE__ */ utils_createHasher(() => new SHA512());
/** SHA2-384 hash function from RFC 4634. */
const sha2_sha384 = /* @__PURE__ */ utils_createHasher(() => new SHA384());
/**
 * SHA2-512/256 "truncated" hash function, with improved resistance to length extension attacks.
 * See the paper on [truncated SHA512](https://eprint.iacr.org/2010/548.pdf).
 */
const sha512_256 = /* @__PURE__ */ (/* unused pure expression or super */ null && (createHasher(() => new SHA512_256())));
/**
 * SHA2-512/224 "truncated" hash function, with improved resistance to length extension attacks.
 * See the paper on [truncated SHA512](https://eprint.iacr.org/2010/548.pdf).
 */
const sha512_224 = /* @__PURE__ */ (/* unused pure expression or super */ null && (createHasher(() => new SHA512_224())));
//# sourceMappingURL=sha2.js.map
;// CONCATENATED MODULE: ./node_modules/@noble/hashes/esm/hmac.js
/**
 * HMAC: RFC2104 message authentication code.
 * @module
 */

class HMAC extends Hash {
    constructor(hash, _key) {
        super();
        this.finished = false;
        this.destroyed = false;
        ahash(hash);
        const key = toBytes(_key);
        this.iHash = hash.create();
        if (typeof this.iHash.update !== 'function')
            throw new Error('Expected instance of class which extends utils.Hash');
        this.blockLen = this.iHash.blockLen;
        this.outputLen = this.iHash.outputLen;
        const blockLen = this.blockLen;
        const pad = new Uint8Array(blockLen);
        // blockLen can be bigger than outputLen
        pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
        for (let i = 0; i < pad.length; i++)
            pad[i] ^= 0x36;
        this.iHash.update(pad);
        // By doing update (processing of first block) of outer hash here we can re-use it between multiple calls via clone
        this.oHash = hash.create();
        // Undo internal XOR && apply outer XOR
        for (let i = 0; i < pad.length; i++)
            pad[i] ^= 0x36 ^ 0x5c;
        this.oHash.update(pad);
        clean(pad);
    }
    update(buf) {
        aexists(this);
        this.iHash.update(buf);
        return this;
    }
    digestInto(out) {
        aexists(this);
        abytes(out, this.outputLen);
        this.finished = true;
        this.iHash.digestInto(out);
        this.oHash.update(out);
        this.oHash.digestInto(out);
        this.destroy();
    }
    digest() {
        const out = new Uint8Array(this.oHash.outputLen);
        this.digestInto(out);
        return out;
    }
    _cloneInto(to) {
        // Create new instance without calling constructor since key already in state and we don't know it.
        to || (to = Object.create(Object.getPrototypeOf(this), {}));
        const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
        to = to;
        to.finished = finished;
        to.destroyed = destroyed;
        to.blockLen = blockLen;
        to.outputLen = outputLen;
        to.oHash = oHash._cloneInto(to.oHash);
        to.iHash = iHash._cloneInto(to.iHash);
        return to;
    }
    clone() {
        return this._cloneInto();
    }
    destroy() {
        this.destroyed = true;
        this.oHash.destroy();
        this.iHash.destroy();
    }
}
/**
 * HMAC: RFC2104 message authentication code.
 * @param hash - function that would be used e.g. sha256
 * @param key - message key
 * @param message - message data
 * @example
 * import { hmac } from '@noble/hashes/hmac';
 * import { sha256 } from '@noble/hashes/sha2';
 * const mac1 = hmac(sha256, 'key', 'message');
 */
const hmac_hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
hmac_hmac.create = (hash, key) => new HMAC(hash, key);
//# sourceMappingURL=hmac.js.map
;// CONCATENATED MODULE: ./node_modules/@noble/curves/esm/utils.js
/**
 * Hex, bytes and number utilities.
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */


const _0n = /* @__PURE__ */ BigInt(0);
const _1n = /* @__PURE__ */ BigInt(1);
function abool(title, value) {
    if (typeof value !== 'boolean')
        throw new Error(title + ' boolean expected, got ' + value);
}
// tmp name until v2
function _abool2(value, title = '') {
    if (typeof value !== 'boolean') {
        const prefix = title && `"${title}"`;
        throw new Error(prefix + 'expected boolean, got type=' + typeof value);
    }
    return value;
}
// tmp name until v2
/** Asserts something is Uint8Array. */
function _abytes2(value, length, title = '') {
    const bytes = isBytes(value);
    const len = value?.length;
    const needsLen = length !== undefined;
    if (!bytes || (needsLen && len !== length)) {
        const prefix = title && `"${title}" `;
        const ofLen = needsLen ? ` of length ${length}` : '';
        const got = bytes ? `length=${len}` : `type=${typeof value}`;
        throw new Error(prefix + 'expected Uint8Array' + ofLen + ', got ' + got);
    }
    return value;
}
// Used in weierstrass, der
function numberToHexUnpadded(num) {
    const hex = num.toString(16);
    return hex.length & 1 ? '0' + hex : hex;
}
function hexToNumber(hex) {
    if (typeof hex !== 'string')
        throw new Error('hex string expected, got ' + typeof hex);
    return hex === '' ? _0n : BigInt('0x' + hex); // Big Endian
}
// BE: Big Endian, LE: Little Endian
function utils_bytesToNumberBE(bytes) {
    return hexToNumber(bytesToHex(bytes));
}
function utils_bytesToNumberLE(bytes) {
    abytes(bytes);
    return hexToNumber(bytesToHex(Uint8Array.from(bytes).reverse()));
}
function numberToBytesBE(n, len) {
    return hexToBytes(n.toString(16).padStart(len * 2, '0'));
}
function numberToBytesLE(n, len) {
    return numberToBytesBE(n, len).reverse();
}
// Unpadded, rarely used
function numberToVarBytesBE(n) {
    return hexToBytes_(numberToHexUnpadded(n));
}
/**
 * Takes hex string or Uint8Array, converts to Uint8Array.
 * Validates output length.
 * Will throw error for other types.
 * @param title descriptive title for an error e.g. 'secret key'
 * @param hex hex string or Uint8Array
 * @param expectedLength optional, will compare to result array's length
 * @returns
 */
function utils_ensureBytes(title, hex, expectedLength) {
    let res;
    if (typeof hex === 'string') {
        try {
            res = hexToBytes(hex);
        }
        catch (e) {
            throw new Error(title + ' must be hex string or Uint8Array, cause: ' + e);
        }
    }
    else if (isBytes(hex)) {
        // Uint8Array.from() instead of hash.slice() because node.js Buffer
        // is instance of Uint8Array, and its slice() creates **mutable** copy
        res = Uint8Array.from(hex);
    }
    else {
        throw new Error(title + ' must be hex string or Uint8Array');
    }
    const len = res.length;
    if (typeof expectedLength === 'number' && len !== expectedLength)
        throw new Error(title + ' of length ' + expectedLength + ' expected, got ' + len);
    return res;
}
// Compares 2 u8a-s in kinda constant time
function equalBytes(a, b) {
    if (a.length !== b.length)
        return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++)
        diff |= a[i] ^ b[i];
    return diff === 0;
}
/**
 * Copies Uint8Array. We can't use u8a.slice(), because u8a can be Buffer,
 * and Buffer#slice creates mutable copy. Never use Buffers!
 */
function copyBytes(bytes) {
    return Uint8Array.from(bytes);
}
/**
 * Decodes 7-bit ASCII string to Uint8Array, throws on non-ascii symbols
 * Should be safe to use for things expected to be ASCII.
 * Returns exact same result as utf8ToBytes for ASCII or throws.
 */
function asciiToBytes(ascii) {
    return Uint8Array.from(ascii, (c, i) => {
        const charCode = c.charCodeAt(0);
        if (c.length !== 1 || charCode > 127) {
            throw new Error(`string contains non-ASCII character "${ascii[i]}" with code ${charCode} at position ${i}`);
        }
        return charCode;
    });
}
/**
 * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
 */
// export const utf8ToBytes: typeof utf8ToBytes_ = utf8ToBytes_;
/**
 * Converts bytes to string using UTF8 encoding.
 * @example bytesToUtf8(Uint8Array.from([97, 98, 99])) // 'abc'
 */
// export const bytesToUtf8: typeof bytesToUtf8_ = bytesToUtf8_;
// Is positive bigint
const isPosBig = (n) => typeof n === 'bigint' && _0n <= n;
function utils_inRange(n, min, max) {
    return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
/**
 * Asserts min <= n < max. NOTE: It's < max and not <= max.
 * @example
 * aInRange('x', x, 1n, 256n); // would assume x is in (1n..255n)
 */
function aInRange(title, n, min, max) {
    // Why min <= n < max and not a (min < n < max) OR b (min <= n <= max)?
    // consider P=256n, min=0n, max=P
    // - a for min=0 would require -1:          `inRange('x', x, -1n, P)`
    // - b would commonly require subtraction:  `inRange('x', x, 0n, P - 1n)`
    // - our way is the cleanest:               `inRange('x', x, 0n, P)
    if (!utils_inRange(n, min, max))
        throw new Error('expected valid ' + title + ': ' + min + ' <= n < ' + max + ', got ' + n);
}
// Bit operations
/**
 * Calculates amount of bits in a bigint.
 * Same as `n.toString(2).length`
 * TODO: merge with nLength in modular
 */
function bitLen(n) {
    let len;
    for (len = 0; n > _0n; n >>= _1n, len += 1)
        ;
    return len;
}
/**
 * Gets single bit at position.
 * NOTE: first bit position is 0 (same as arrays)
 * Same as `!!+Array.from(n.toString(2)).reverse()[pos]`
 */
function bitGet(n, pos) {
    return (n >> BigInt(pos)) & _1n;
}
/**
 * Sets single bit at position.
 */
function bitSet(n, pos, value) {
    return n | ((value ? _1n : _0n) << BigInt(pos));
}
/**
 * Calculate mask for N bits. Not using ** operator with bigints because of old engines.
 * Same as BigInt(`0b${Array(i).fill('1').join('')}`)
 */
const utils_bitMask = (n) => (_1n << BigInt(n)) - _1n;
/**
 * Minimal HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
 * @returns function that will call DRBG until 2nd arg returns something meaningful
 * @example
 *   const drbg = createHmacDRBG<Key>(32, 32, hmac);
 *   drbg(seed, bytesToKey); // bytesToKey must return Key or undefined
 */
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
    if (typeof hashLen !== 'number' || hashLen < 2)
        throw new Error('hashLen must be a number');
    if (typeof qByteLen !== 'number' || qByteLen < 2)
        throw new Error('qByteLen must be a number');
    if (typeof hmacFn !== 'function')
        throw new Error('hmacFn must be a function');
    // Step B, Step C: set hashLen to 8*ceil(hlen/8)
    const u8n = (len) => new Uint8Array(len); // creates Uint8Array
    const u8of = (byte) => Uint8Array.of(byte); // another shortcut
    let v = u8n(hashLen); // Minimal non-full-spec HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
    let k = u8n(hashLen); // Steps B and C of RFC6979 3.2: set hashLen, in our case always same
    let i = 0; // Iterations counter, will throw when over 1000
    const reset = () => {
        v.fill(1);
        k.fill(0);
        i = 0;
    };
    const h = (...b) => hmacFn(k, v, ...b); // hmac(k)(v, ...values)
    const reseed = (seed = u8n(0)) => {
        // HMAC-DRBG reseed() function. Steps D-G
        k = h(u8of(0x00), seed); // k = hmac(k || v || 0x00 || seed)
        v = h(); // v = hmac(k || v)
        if (seed.length === 0)
            return;
        k = h(u8of(0x01), seed); // k = hmac(k || v || 0x01 || seed)
        v = h(); // v = hmac(k || v)
    };
    const gen = () => {
        // HMAC-DRBG generate() function
        if (i++ >= 1000)
            throw new Error('drbg: tried 1000 values');
        let len = 0;
        const out = [];
        while (len < qByteLen) {
            v = h();
            const sl = v.slice();
            out.push(sl);
            len += v.length;
        }
        return concatBytes(...out);
    };
    const genUntil = (seed, pred) => {
        reset();
        reseed(seed); // Steps D-G
        let res = undefined; // Step H: grind until k is in [1..n-1]
        while (!(res = pred(gen())))
            reseed();
        reset();
        return res;
    };
    return genUntil;
}
// Validating curves and fields
const validatorFns = {
    bigint: (val) => typeof val === 'bigint',
    function: (val) => typeof val === 'function',
    boolean: (val) => typeof val === 'boolean',
    string: (val) => typeof val === 'string',
    stringOrUint8Array: (val) => typeof val === 'string' || isBytes(val),
    isSafeInteger: (val) => Number.isSafeInteger(val),
    array: (val) => Array.isArray(val),
    field: (val, object) => object.Fp.isValid(val),
    hash: (val) => typeof val === 'function' && Number.isSafeInteger(val.outputLen),
};
// type Record<K extends string | number | symbol, T> = { [P in K]: T; }
function utils_validateObject(object, validators, optValidators = {}) {
    const checkField = (fieldName, type, isOptional) => {
        const checkVal = validatorFns[type];
        if (typeof checkVal !== 'function')
            throw new Error('invalid validator function');
        const val = object[fieldName];
        if (isOptional && val === undefined)
            return;
        if (!checkVal(val, object)) {
            throw new Error('param ' + String(fieldName) + ' is invalid. Expected ' + type + ', got ' + val);
        }
    };
    for (const [fieldName, type] of Object.entries(validators))
        checkField(fieldName, type, false);
    for (const [fieldName, type] of Object.entries(optValidators))
        checkField(fieldName, type, true);
    return object;
}
// validate type tests
// const o: { a: number; b: number; c: number } = { a: 1, b: 5, c: 6 };
// const z0 = validateObject(o, { a: 'isSafeInteger' }, { c: 'bigint' }); // Ok!
// // Should fail type-check
// const z1 = validateObject(o, { a: 'tmp' }, { c: 'zz' });
// const z2 = validateObject(o, { a: 'isSafeInteger' }, { c: 'zz' });
// const z3 = validateObject(o, { test: 'boolean', z: 'bug' });
// const z4 = validateObject(o, { a: 'boolean', z: 'bug' });
function isHash(val) {
    return typeof val === 'function' && Number.isSafeInteger(val.outputLen);
}
function _validateObject(object, fields, optFields = {}) {
    if (!object || typeof object !== 'object')
        throw new Error('expected valid options object');
    function checkField(fieldName, expectedType, isOpt) {
        const val = object[fieldName];
        if (isOpt && val === undefined)
            return;
        const current = typeof val;
        if (current !== expectedType || val === null)
            throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
    }
    Object.entries(fields).forEach(([k, v]) => checkField(k, v, false));
    Object.entries(optFields).forEach(([k, v]) => checkField(k, v, true));
}
/**
 * throws not implemented error
 */
const notImplemented = () => {
    throw new Error('not implemented');
};
/**
 * Memoizes (caches) computation result.
 * Uses WeakMap: the value is going auto-cleaned by GC after last reference is removed.
 */
function memoized(fn) {
    const map = new WeakMap();
    return (arg, ...args) => {
        const val = map.get(arg);
        if (val !== undefined)
            return val;
        const computed = fn(arg, ...args);
        map.set(arg, computed);
        return computed;
    };
}
//# sourceMappingURL=utils.js.map
;// CONCATENATED MODULE: ./node_modules/@noble/curves/esm/abstract/modular.js
/**
 * Utils for modular division and fields.
 * Field over 11 is a finite (Galois) field is integer number operations `mod 11`.
 * There is no division: it is replaced by modular multiplicative inverse.
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */

// prettier-ignore
const modular_0n = BigInt(0), modular_1n = BigInt(1), _2n = /* @__PURE__ */ BigInt(2), _3n = /* @__PURE__ */ BigInt(3);
// prettier-ignore
const _4n = /* @__PURE__ */ BigInt(4), _5n = /* @__PURE__ */ BigInt(5), _7n = /* @__PURE__ */ BigInt(7);
// prettier-ignore
const _8n = /* @__PURE__ */ BigInt(8), _9n = /* @__PURE__ */ BigInt(9), _16n = /* @__PURE__ */ BigInt(16);
// Calculates a modulo b
function mod(a, b) {
    const result = a % b;
    return result >= modular_0n ? result : b + result;
}
/**
 * Efficiently raise num to power and do modular division.
 * Unsafe in some contexts: uses ladder, so can expose bigint bits.
 * @example
 * pow(2n, 6n, 11n) // 64n % 11n == 9n
 */
function pow(num, power, modulo) {
    return FpPow(Field(modulo), num, power);
}
/** Does `x^(2^power)` mod p. `pow2(30, 4)` == `30^(2^4)` */
function pow2(x, power, modulo) {
    let res = x;
    while (power-- > modular_0n) {
        res *= res;
        res %= modulo;
    }
    return res;
}
/**
 * Inverses number over modulo.
 * Implemented using [Euclidean GCD](https://brilliant.org/wiki/extended-euclidean-algorithm/).
 */
function invert(number, modulo) {
    if (number === modular_0n)
        throw new Error('invert: expected non-zero number');
    if (modulo <= modular_0n)
        throw new Error('invert: expected positive modulus, got ' + modulo);
    // Fermat's little theorem "CT-like" version inv(n) = n^(m-2) mod m is 30x slower.
    let a = mod(number, modulo);
    let b = modulo;
    // prettier-ignore
    let x = modular_0n, y = modular_1n, u = modular_1n, v = modular_0n;
    while (a !== modular_0n) {
        // JIT applies optimization if those two lines follow each other
        const q = b / a;
        const r = b % a;
        const m = x - u * q;
        const n = y - v * q;
        // prettier-ignore
        b = a, a = r, x = u, y = v, u = m, v = n;
    }
    const gcd = b;
    if (gcd !== modular_1n)
        throw new Error('invert: does not exist');
    return mod(x, modulo);
}
function assertIsSquare(Fp, root, n) {
    if (!Fp.eql(Fp.sqr(root), n))
        throw new Error('Cannot find square root');
}
// Not all roots are possible! Example which will throw:
// const NUM =
// n = 72057594037927816n;
// Fp = Field(BigInt('0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaab'));
function sqrt3mod4(Fp, n) {
    const p1div4 = (Fp.ORDER + modular_1n) / _4n;
    const root = Fp.pow(n, p1div4);
    assertIsSquare(Fp, root, n);
    return root;
}
function sqrt5mod8(Fp, n) {
    const p5div8 = (Fp.ORDER - _5n) / _8n;
    const n2 = Fp.mul(n, _2n);
    const v = Fp.pow(n2, p5div8);
    const nv = Fp.mul(n, v);
    const i = Fp.mul(Fp.mul(nv, _2n), v);
    const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
    assertIsSquare(Fp, root, n);
    return root;
}
// Based on RFC9380, Kong algorithm
// prettier-ignore
function sqrt9mod16(P) {
    const Fp_ = Field(P);
    const tn = tonelliShanks(P);
    const c1 = tn(Fp_, Fp_.neg(Fp_.ONE)); //  1. c1 = sqrt(-1) in F, i.e., (c1^2) == -1 in F
    const c2 = tn(Fp_, c1); //  2. c2 = sqrt(c1) in F, i.e., (c2^2) == c1 in F
    const c3 = tn(Fp_, Fp_.neg(c1)); //  3. c3 = sqrt(-c1) in F, i.e., (c3^2) == -c1 in F
    const c4 = (P + _7n) / _16n; //  4. c4 = (q + 7) / 16        # Integer arithmetic
    return (Fp, n) => {
        let tv1 = Fp.pow(n, c4); //  1. tv1 = x^c4
        let tv2 = Fp.mul(tv1, c1); //  2. tv2 = c1 * tv1
        const tv3 = Fp.mul(tv1, c2); //  3. tv3 = c2 * tv1
        const tv4 = Fp.mul(tv1, c3); //  4. tv4 = c3 * tv1
        const e1 = Fp.eql(Fp.sqr(tv2), n); //  5.  e1 = (tv2^2) == x
        const e2 = Fp.eql(Fp.sqr(tv3), n); //  6.  e2 = (tv3^2) == x
        tv1 = Fp.cmov(tv1, tv2, e1); //  7. tv1 = CMOV(tv1, tv2, e1)  # Select tv2 if (tv2^2) == x
        tv2 = Fp.cmov(tv4, tv3, e2); //  8. tv2 = CMOV(tv4, tv3, e2)  # Select tv3 if (tv3^2) == x
        const e3 = Fp.eql(Fp.sqr(tv2), n); //  9.  e3 = (tv2^2) == x
        const root = Fp.cmov(tv1, tv2, e3); // 10.  z = CMOV(tv1, tv2, e3)   # Select sqrt from tv1 & tv2
        assertIsSquare(Fp, root, n);
        return root;
    };
}
/**
 * Tonelli-Shanks square root search algorithm.
 * 1. https://eprint.iacr.org/2012/685.pdf (page 12)
 * 2. Square Roots from 1; 24, 51, 10 to Dan Shanks
 * @param P field order
 * @returns function that takes field Fp (created from P) and number n
 */
function tonelliShanks(P) {
    // Initialization (precomputation).
    // Caching initialization could boost perf by 7%.
    if (P < _3n)
        throw new Error('sqrt is not defined for small field');
    // Factor P - 1 = Q * 2^S, where Q is odd
    let Q = P - modular_1n;
    let S = 0;
    while (Q % _2n === modular_0n) {
        Q /= _2n;
        S++;
    }
    // Find the first quadratic non-residue Z >= 2
    let Z = _2n;
    const _Fp = Field(P);
    while (FpLegendre(_Fp, Z) === 1) {
        // Basic primality test for P. After x iterations, chance of
        // not finding quadratic non-residue is 2^x, so 2^1000.
        if (Z++ > 1000)
            throw new Error('Cannot find square root: probably non-prime P');
    }
    // Fast-path; usually done before Z, but we do "primality test".
    if (S === 1)
        return sqrt3mod4;
    // Slow-path
    // TODO: test on Fp2 and others
    let cc = _Fp.pow(Z, Q); // c = z^Q
    const Q1div2 = (Q + modular_1n) / _2n;
    return function tonelliSlow(Fp, n) {
        if (Fp.is0(n))
            return n;
        // Check if n is a quadratic residue using Legendre symbol
        if (FpLegendre(Fp, n) !== 1)
            throw new Error('Cannot find square root');
        // Initialize variables for the main loop
        let M = S;
        let c = Fp.mul(Fp.ONE, cc); // c = z^Q, move cc from field _Fp into field Fp
        let t = Fp.pow(n, Q); // t = n^Q, first guess at the fudge factor
        let R = Fp.pow(n, Q1div2); // R = n^((Q+1)/2), first guess at the square root
        // Main loop
        // while t != 1
        while (!Fp.eql(t, Fp.ONE)) {
            if (Fp.is0(t))
                return Fp.ZERO; // if t=0 return R=0
            let i = 1;
            // Find the smallest i >= 1 such that t^(2^i) ≡ 1 (mod P)
            let t_tmp = Fp.sqr(t); // t^(2^1)
            while (!Fp.eql(t_tmp, Fp.ONE)) {
                i++;
                t_tmp = Fp.sqr(t_tmp); // t^(2^2)...
                if (i === M)
                    throw new Error('Cannot find square root');
            }
            // Calculate the exponent for b: 2^(M - i - 1)
            const exponent = modular_1n << BigInt(M - i - 1); // bigint is important
            const b = Fp.pow(c, exponent); // b = 2^(M - i - 1)
            // Update variables
            M = i;
            c = Fp.sqr(b); // c = b^2
            t = Fp.mul(t, c); // t = (t * b^2)
            R = Fp.mul(R, b); // R = R*b
        }
        return R;
    };
}
/**
 * Square root for a finite field. Will try optimized versions first:
 *
 * 1. P ≡ 3 (mod 4)
 * 2. P ≡ 5 (mod 8)
 * 3. P ≡ 9 (mod 16)
 * 4. Tonelli-Shanks algorithm
 *
 * Different algorithms can give different roots, it is up to user to decide which one they want.
 * For example there is FpSqrtOdd/FpSqrtEven to choice root based on oddness (used for hash-to-curve).
 */
function FpSqrt(P) {
    // P ≡ 3 (mod 4) => √n = n^((P+1)/4)
    if (P % _4n === _3n)
        return sqrt3mod4;
    // P ≡ 5 (mod 8) => Atkin algorithm, page 10 of https://eprint.iacr.org/2012/685.pdf
    if (P % _8n === _5n)
        return sqrt5mod8;
    // P ≡ 9 (mod 16) => Kong algorithm, page 11 of https://eprint.iacr.org/2012/685.pdf (algorithm 4)
    if (P % _16n === _9n)
        return sqrt9mod16(P);
    // Tonelli-Shanks algorithm
    return tonelliShanks(P);
}
// Little-endian check for first LE bit (last BE bit);
const isNegativeLE = (num, modulo) => (mod(num, modulo) & modular_1n) === modular_1n;
// prettier-ignore
const FIELD_FIELDS = [
    'create', 'isValid', 'is0', 'neg', 'inv', 'sqrt', 'sqr',
    'eql', 'add', 'sub', 'mul', 'pow', 'div',
    'addN', 'subN', 'mulN', 'sqrN'
];
function modular_validateField(field) {
    const initial = {
        ORDER: 'bigint',
        MASK: 'bigint',
        BYTES: 'number',
        BITS: 'number',
    };
    const opts = FIELD_FIELDS.reduce((map, val) => {
        map[val] = 'function';
        return map;
    }, initial);
    _validateObject(field, opts);
    // const max = 16384;
    // if (field.BYTES < 1 || field.BYTES > max) throw new Error('invalid field');
    // if (field.BITS < 1 || field.BITS > 8 * max) throw new Error('invalid field');
    return field;
}
// Generic field functions
/**
 * Same as `pow` but for Fp: non-constant-time.
 * Unsafe in some contexts: uses ladder, so can expose bigint bits.
 */
function FpPow(Fp, num, power) {
    if (power < modular_0n)
        throw new Error('invalid exponent, negatives unsupported');
    if (power === modular_0n)
        return Fp.ONE;
    if (power === modular_1n)
        return num;
    let p = Fp.ONE;
    let d = num;
    while (power > modular_0n) {
        if (power & modular_1n)
            p = Fp.mul(p, d);
        d = Fp.sqr(d);
        power >>= modular_1n;
    }
    return p;
}
/**
 * Efficiently invert an array of Field elements.
 * Exception-free. Will return `undefined` for 0 elements.
 * @param passZero map 0 to 0 (instead of undefined)
 */
function modular_FpInvertBatch(Fp, nums, passZero = false) {
    const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : undefined);
    // Walk from first to last, multiply them by each other MOD p
    const multipliedAcc = nums.reduce((acc, num, i) => {
        if (Fp.is0(num))
            return acc;
        inverted[i] = acc;
        return Fp.mul(acc, num);
    }, Fp.ONE);
    // Invert last element
    const invertedAcc = Fp.inv(multipliedAcc);
    // Walk from last to first, multiply them by inverted each other MOD p
    nums.reduceRight((acc, num, i) => {
        if (Fp.is0(num))
            return acc;
        inverted[i] = Fp.mul(acc, inverted[i]);
        return Fp.mul(acc, num);
    }, invertedAcc);
    return inverted;
}
// TODO: remove
function FpDiv(Fp, lhs, rhs) {
    return Fp.mul(lhs, typeof rhs === 'bigint' ? invert(rhs, Fp.ORDER) : Fp.inv(rhs));
}
/**
 * Legendre symbol.
 * Legendre constant is used to calculate Legendre symbol (a | p)
 * which denotes the value of a^((p-1)/2) (mod p).
 *
 * * (a | p) ≡ 1    if a is a square (mod p), quadratic residue
 * * (a | p) ≡ -1   if a is not a square (mod p), quadratic non residue
 * * (a | p) ≡ 0    if a ≡ 0 (mod p)
 */
function FpLegendre(Fp, n) {
    // We can use 3rd argument as optional cache of this value
    // but seems unneeded for now. The operation is very fast.
    const p1mod2 = (Fp.ORDER - modular_1n) / _2n;
    const powered = Fp.pow(n, p1mod2);
    const yes = Fp.eql(powered, Fp.ONE);
    const zero = Fp.eql(powered, Fp.ZERO);
    const no = Fp.eql(powered, Fp.neg(Fp.ONE));
    if (!yes && !zero && !no)
        throw new Error('invalid Legendre symbol result');
    return yes ? 1 : zero ? 0 : -1;
}
// This function returns True whenever the value x is a square in the field F.
function FpIsSquare(Fp, n) {
    const l = FpLegendre(Fp, n);
    return l === 1;
}
// CURVE.n lengths
function modular_nLength(n, nBitLength) {
    // Bit size, byte size of CURVE.n
    if (nBitLength !== undefined)
        anumber(nBitLength);
    const _nBitLength = nBitLength !== undefined ? nBitLength : n.toString(2).length;
    const nByteLength = Math.ceil(_nBitLength / 8);
    return { nBitLength: _nBitLength, nByteLength };
}
/**
 * Creates a finite field. Major performance optimizations:
 * * 1. Denormalized operations like mulN instead of mul.
 * * 2. Identical object shape: never add or remove keys.
 * * 3. `Object.freeze`.
 * Fragile: always run a benchmark on a change.
 * Security note: operations don't check 'isValid' for all elements for performance reasons,
 * it is caller responsibility to check this.
 * This is low-level code, please make sure you know what you're doing.
 *
 * Note about field properties:
 * * CHARACTERISTIC p = prime number, number of elements in main subgroup.
 * * ORDER q = similar to cofactor in curves, may be composite `q = p^m`.
 *
 * @param ORDER field order, probably prime, or could be composite
 * @param bitLen how many bits the field consumes
 * @param isLE (default: false) if encoding / decoding should be in little-endian
 * @param redef optional faster redefinitions of sqrt and other methods
 */
function Field(ORDER, bitLenOrOpts, // TODO: use opts only in v2?
isLE = false, opts = {}) {
    if (ORDER <= modular_0n)
        throw new Error('invalid field: expected ORDER > 0, got ' + ORDER);
    let _nbitLength = undefined;
    let _sqrt = undefined;
    let modFromBytes = false;
    let allowedLengths = undefined;
    if (typeof bitLenOrOpts === 'object' && bitLenOrOpts != null) {
        if (opts.sqrt || isLE)
            throw new Error('cannot specify opts in two arguments');
        const _opts = bitLenOrOpts;
        if (_opts.BITS)
            _nbitLength = _opts.BITS;
        if (_opts.sqrt)
            _sqrt = _opts.sqrt;
        if (typeof _opts.isLE === 'boolean')
            isLE = _opts.isLE;
        if (typeof _opts.modFromBytes === 'boolean')
            modFromBytes = _opts.modFromBytes;
        allowedLengths = _opts.allowedLengths;
    }
    else {
        if (typeof bitLenOrOpts === 'number')
            _nbitLength = bitLenOrOpts;
        if (opts.sqrt)
            _sqrt = opts.sqrt;
    }
    const { nBitLength: BITS, nByteLength: BYTES } = modular_nLength(ORDER, _nbitLength);
    if (BYTES > 2048)
        throw new Error('invalid field: expected ORDER of <= 2048 bytes');
    let sqrtP; // cached sqrtP
    const f = Object.freeze({
        ORDER,
        isLE,
        BITS,
        BYTES,
        MASK: utils_bitMask(BITS),
        ZERO: modular_0n,
        ONE: modular_1n,
        allowedLengths: allowedLengths,
        create: (num) => mod(num, ORDER),
        isValid: (num) => {
            if (typeof num !== 'bigint')
                throw new Error('invalid field element: expected bigint, got ' + typeof num);
            return modular_0n <= num && num < ORDER; // 0 is valid element, but it's not invertible
        },
        is0: (num) => num === modular_0n,
        // is valid and invertible
        isValidNot0: (num) => !f.is0(num) && f.isValid(num),
        isOdd: (num) => (num & modular_1n) === modular_1n,
        neg: (num) => mod(-num, ORDER),
        eql: (lhs, rhs) => lhs === rhs,
        sqr: (num) => mod(num * num, ORDER),
        add: (lhs, rhs) => mod(lhs + rhs, ORDER),
        sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
        mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
        pow: (num, power) => FpPow(f, num, power),
        div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
        // Same as above, but doesn't normalize
        sqrN: (num) => num * num,
        addN: (lhs, rhs) => lhs + rhs,
        subN: (lhs, rhs) => lhs - rhs,
        mulN: (lhs, rhs) => lhs * rhs,
        inv: (num) => invert(num, ORDER),
        sqrt: _sqrt ||
            ((n) => {
                if (!sqrtP)
                    sqrtP = FpSqrt(ORDER);
                return sqrtP(f, n);
            }),
        toBytes: (num) => (isLE ? numberToBytesLE(num, BYTES) : numberToBytesBE(num, BYTES)),
        fromBytes: (bytes, skipValidation = true) => {
            if (allowedLengths) {
                if (!allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
                    throw new Error('Field.fromBytes: expected ' + allowedLengths + ' bytes, got ' + bytes.length);
                }
                const padded = new Uint8Array(BYTES);
                // isLE add 0 to right, !isLE to the left.
                padded.set(bytes, isLE ? 0 : padded.length - bytes.length);
                bytes = padded;
            }
            if (bytes.length !== BYTES)
                throw new Error('Field.fromBytes: expected ' + BYTES + ' bytes, got ' + bytes.length);
            let scalar = isLE ? utils_bytesToNumberLE(bytes) : utils_bytesToNumberBE(bytes);
            if (modFromBytes)
                scalar = mod(scalar, ORDER);
            if (!skipValidation)
                if (!f.isValid(scalar))
                    throw new Error('invalid field element: outside of range 0..ORDER');
            // NOTE: we don't validate scalar here, please use isValid. This done such way because some
            // protocol may allow non-reduced scalar that reduced later or changed some other way.
            return scalar;
        },
        // TODO: we don't need it here, move out to separate fn
        invertBatch: (lst) => modular_FpInvertBatch(f, lst),
        // We can't move this out because Fp6, Fp12 implement it
        // and it's unclear what to return in there.
        cmov: (a, b, c) => (c ? b : a),
    });
    return Object.freeze(f);
}
// Generic random scalar, we can do same for other fields if via Fp2.mul(Fp2.ONE, Fp2.random)?
// This allows unsafe methods like ignore bias or zero. These unsafe, but often used in different protocols (if deterministic RNG).
// which mean we cannot force this via opts.
// Not sure what to do with randomBytes, we can accept it inside opts if wanted.
// Probably need to export getMinHashLength somewhere?
// random(bytes?: Uint8Array, unsafeAllowZero = false, unsafeAllowBias = false) {
//   const LEN = !unsafeAllowBias ? getMinHashLength(ORDER) : BYTES;
//   if (bytes === undefined) bytes = randomBytes(LEN); // _opts.randomBytes?
//   const num = isLE ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
//   // `mod(x, 11)` can sometimes produce 0. `mod(x, 10) + 1` is the same, but no 0
//   const reduced = unsafeAllowZero ? mod(num, ORDER) : mod(num, ORDER - _1n) + _1n;
//   return reduced;
// },
function FpSqrtOdd(Fp, elm) {
    if (!Fp.isOdd)
        throw new Error("Field doesn't have isOdd");
    const root = Fp.sqrt(elm);
    return Fp.isOdd(root) ? root : Fp.neg(root);
}
function FpSqrtEven(Fp, elm) {
    if (!Fp.isOdd)
        throw new Error("Field doesn't have isOdd");
    const root = Fp.sqrt(elm);
    return Fp.isOdd(root) ? Fp.neg(root) : root;
}
/**
 * "Constant-time" private key generation utility.
 * Same as mapKeyToField, but accepts less bytes (40 instead of 48 for 32-byte field).
 * Which makes it slightly more biased, less secure.
 * @deprecated use `mapKeyToField` instead
 */
function hashToPrivateScalar(hash, groupOrder, isLE = false) {
    hash = ensureBytes('privateHash', hash);
    const hashLen = hash.length;
    const minLen = modular_nLength(groupOrder).nByteLength + 8;
    if (minLen < 24 || hashLen < minLen || hashLen > 1024)
        throw new Error('hashToPrivateScalar: expected ' + minLen + '-1024 bytes of input, got ' + hashLen);
    const num = isLE ? bytesToNumberLE(hash) : bytesToNumberBE(hash);
    return mod(num, groupOrder - modular_1n) + modular_1n;
}
/**
 * Returns total number of bytes consumed by the field element.
 * For example, 32 bytes for usual 256-bit weierstrass curve.
 * @param fieldOrder number of field elements, usually CURVE.n
 * @returns byte length of field
 */
function getFieldBytesLength(fieldOrder) {
    if (typeof fieldOrder !== 'bigint')
        throw new Error('field order must be bigint');
    const bitLength = fieldOrder.toString(2).length;
    return Math.ceil(bitLength / 8);
}
/**
 * Returns minimal amount of bytes that can be safely reduced
 * by field order.
 * Should be 2^-128 for 128-bit curve such as P256.
 * @param fieldOrder number of field elements, usually CURVE.n
 * @returns byte length of target hash
 */
function getMinHashLength(fieldOrder) {
    const length = getFieldBytesLength(fieldOrder);
    return length + Math.ceil(length / 2);
}
/**
 * "Constant-time" private key generation utility.
 * Can take (n + n/2) or more bytes of uniform input e.g. from CSPRNG or KDF
 * and convert them into private scalar, with the modulo bias being negligible.
 * Needs at least 48 bytes of input for 32-byte private key.
 * https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/
 * FIPS 186-5, A.2 https://csrc.nist.gov/publications/detail/fips/186/5/final
 * RFC 9380, https://www.rfc-editor.org/rfc/rfc9380#section-5
 * @param hash hash output from SHA3 or a similar function
 * @param groupOrder size of subgroup - (e.g. secp256k1.CURVE.n)
 * @param isLE interpret hash bytes as LE num
 * @returns valid private scalar
 */
function mapHashToField(key, fieldOrder, isLE = false) {
    const len = key.length;
    const fieldLen = getFieldBytesLength(fieldOrder);
    const minLen = getMinHashLength(fieldOrder);
    // No small numbers: need to understand bias story. No huge numbers: easier to detect JS timings.
    if (len < 16 || len < minLen || len > 1024)
        throw new Error('expected ' + minLen + '-1024 bytes of input, got ' + len);
    const num = isLE ? utils_bytesToNumberLE(key) : utils_bytesToNumberBE(key);
    // `mod(x, 11)` can sometimes produce 0. `mod(x, 10) + 1` is the same, but no 0
    const reduced = mod(num, fieldOrder - modular_1n) + modular_1n;
    return isLE ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}
//# sourceMappingURL=modular.js.map
;// CONCATENATED MODULE: ./node_modules/@noble/curves/esm/abstract/curve.js
/**
 * Methods for elliptic curve multiplication by scalars.
 * Contains wNAF, pippenger.
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */


const curve_0n = BigInt(0);
const curve_1n = BigInt(1);
function negateCt(condition, item) {
    const neg = item.negate();
    return condition ? neg : item;
}
/**
 * Takes a bunch of Projective Points but executes only one
 * inversion on all of them. Inversion is very slow operation,
 * so this improves performance massively.
 * Optimization: converts a list of projective points to a list of identical points with Z=1.
 */
function normalizeZ(c, points) {
    const invertedZs = modular_FpInvertBatch(c.Fp, points.map((p) => p.Z));
    return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
}
function validateW(W, bits) {
    if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
        throw new Error('invalid window size, expected [1..' + bits + '], got W=' + W);
}
function calcWOpts(W, scalarBits) {
    validateW(W, scalarBits);
    const windows = Math.ceil(scalarBits / W) + 1; // W=8 33. Not 32, because we skip zero
    const windowSize = 2 ** (W - 1); // W=8 128. Not 256, because we skip zero
    const maxNumber = 2 ** W; // W=8 256
    const mask = utils_bitMask(W); // W=8 255 == mask 0b11111111
    const shiftBy = BigInt(W); // W=8 8
    return { windows, windowSize, mask, maxNumber, shiftBy };
}
function calcOffsets(n, window, wOpts) {
    const { windowSize, mask, maxNumber, shiftBy } = wOpts;
    let wbits = Number(n & mask); // extract W bits.
    let nextN = n >> shiftBy; // shift number by W bits.
    // What actually happens here:
    // const highestBit = Number(mask ^ (mask >> 1n));
    // let wbits2 = wbits - 1; // skip zero
    // if (wbits2 & highestBit) { wbits2 ^= Number(mask); // (~);
    // split if bits > max: +224 => 256-32
    if (wbits > windowSize) {
        // we skip zero, which means instead of `>= size-1`, we do `> size`
        wbits -= maxNumber; // -32, can be maxNumber - wbits, but then we need to set isNeg here.
        nextN += curve_1n; // +256 (carry)
    }
    const offsetStart = window * windowSize;
    const offset = offsetStart + Math.abs(wbits) - 1; // -1 because we skip zero
    const isZero = wbits === 0; // is current window slice a 0?
    const isNeg = wbits < 0; // is current window slice negative?
    const isNegF = window % 2 !== 0; // fake random statement for noise
    const offsetF = offsetStart; // fake offset for noise
    return { nextN, offset, isZero, isNeg, isNegF, offsetF };
}
function validateMSMPoints(points, c) {
    if (!Array.isArray(points))
        throw new Error('array expected');
    points.forEach((p, i) => {
        if (!(p instanceof c))
            throw new Error('invalid point at index ' + i);
    });
}
function validateMSMScalars(scalars, field) {
    if (!Array.isArray(scalars))
        throw new Error('array of scalars expected');
    scalars.forEach((s, i) => {
        if (!field.isValid(s))
            throw new Error('invalid scalar at index ' + i);
    });
}
// Since points in different groups cannot be equal (different object constructor),
// we can have single place to store precomputes.
// Allows to make points frozen / immutable.
const pointPrecomputes = new WeakMap();
const pointWindowSizes = new WeakMap();
function getW(P) {
    // To disable precomputes:
    // return 1;
    return pointWindowSizes.get(P) || 1;
}
function assert0(n) {
    if (n !== curve_0n)
        throw new Error('invalid wNAF');
}
/**
 * Elliptic curve multiplication of Point by scalar. Fragile.
 * Table generation takes **30MB of ram and 10ms on high-end CPU**,
 * but may take much longer on slow devices. Actual generation will happen on
 * first call of `multiply()`. By default, `BASE` point is precomputed.
 *
 * Scalars should always be less than curve order: this should be checked inside of a curve itself.
 * Creates precomputation tables for fast multiplication:
 * - private scalar is split by fixed size windows of W bits
 * - every window point is collected from window's table & added to accumulator
 * - since windows are different, same point inside tables won't be accessed more than once per calc
 * - each multiplication is 'Math.ceil(CURVE_ORDER / 𝑊) + 1' point additions (fixed for any scalar)
 * - +1 window is neccessary for wNAF
 * - wNAF reduces table size: 2x less memory + 2x faster generation, but 10% slower multiplication
 *
 * @todo Research returning 2d JS array of windows, instead of a single window.
 * This would allow windows to be in different memory locations
 */
class wNAF {
    // Parametrized with a given Point class (not individual point)
    constructor(Point, bits) {
        this.BASE = Point.BASE;
        this.ZERO = Point.ZERO;
        this.Fn = Point.Fn;
        this.bits = bits;
    }
    // non-const time multiplication ladder
    _unsafeLadder(elm, n, p = this.ZERO) {
        let d = elm;
        while (n > curve_0n) {
            if (n & curve_1n)
                p = p.add(d);
            d = d.double();
            n >>= curve_1n;
        }
        return p;
    }
    /**
     * Creates a wNAF precomputation window. Used for caching.
     * Default window size is set by `utils.precompute()` and is equal to 8.
     * Number of precomputed points depends on the curve size:
     * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
     * - 𝑊 is the window size
     * - 𝑛 is the bitlength of the curve order.
     * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
     * @param point Point instance
     * @param W window size
     * @returns precomputed point tables flattened to a single array
     */
    precomputeWindow(point, W) {
        const { windows, windowSize } = calcWOpts(W, this.bits);
        const points = [];
        let p = point;
        let base = p;
        for (let window = 0; window < windows; window++) {
            base = p;
            points.push(base);
            // i=1, bc we skip 0
            for (let i = 1; i < windowSize; i++) {
                base = base.add(p);
                points.push(base);
            }
            p = base.double();
        }
        return points;
    }
    /**
     * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
     * More compact implementation:
     * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
     * @returns real and fake (for const-time) points
     */
    wNAF(W, precomputes, n) {
        // Scalar should be smaller than field order
        if (!this.Fn.isValid(n))
            throw new Error('invalid scalar');
        // Accumulators
        let p = this.ZERO;
        let f = this.BASE;
        // This code was first written with assumption that 'f' and 'p' will never be infinity point:
        // since each addition is multiplied by 2 ** W, it cannot cancel each other. However,
        // there is negate now: it is possible that negated element from low value
        // would be the same as high element, which will create carry into next window.
        // It's not obvious how this can fail, but still worth investigating later.
        const wo = calcWOpts(W, this.bits);
        for (let window = 0; window < wo.windows; window++) {
            // (n === _0n) is handled and not early-exited. isEven and offsetF are used for noise
            const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window, wo);
            n = nextN;
            if (isZero) {
                // bits are 0: add garbage to fake point
                // Important part for const-time getPublicKey: add random "noise" point to f.
                f = f.add(negateCt(isNegF, precomputes[offsetF]));
            }
            else {
                // bits are 1: add to result point
                p = p.add(negateCt(isNeg, precomputes[offset]));
            }
        }
        assert0(n);
        // Return both real and fake points: JIT won't eliminate f.
        // At this point there is a way to F be infinity-point even if p is not,
        // which makes it less const-time: around 1 bigint multiply.
        return { p, f };
    }
    /**
     * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
     * @param acc accumulator point to add result of multiplication
     * @returns point
     */
    wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
        const wo = calcWOpts(W, this.bits);
        for (let window = 0; window < wo.windows; window++) {
            if (n === curve_0n)
                break; // Early-exit, skip 0 value
            const { nextN, offset, isZero, isNeg } = calcOffsets(n, window, wo);
            n = nextN;
            if (isZero) {
                // Window bits are 0: skip processing.
                // Move to next window.
                continue;
            }
            else {
                const item = precomputes[offset];
                acc = acc.add(isNeg ? item.negate() : item); // Re-using acc allows to save adds in MSM
            }
        }
        assert0(n);
        return acc;
    }
    getPrecomputes(W, point, transform) {
        // Calculate precomputes on a first run, reuse them after
        let comp = pointPrecomputes.get(point);
        if (!comp) {
            comp = this.precomputeWindow(point, W);
            if (W !== 1) {
                // Doing transform outside of if brings 15% perf hit
                if (typeof transform === 'function')
                    comp = transform(comp);
                pointPrecomputes.set(point, comp);
            }
        }
        return comp;
    }
    cached(point, scalar, transform) {
        const W = getW(point);
        return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
    }
    unsafe(point, scalar, transform, prev) {
        const W = getW(point);
        if (W === 1)
            return this._unsafeLadder(point, scalar, prev); // For W=1 ladder is ~x2 faster
        return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
    }
    // We calculate precomputes for elliptic curve point multiplication
    // using windowed method. This specifies window size and
    // stores precomputed values. Usually only base point would be precomputed.
    createCache(P, W) {
        validateW(W, this.bits);
        pointWindowSizes.set(P, W);
        pointPrecomputes.delete(P);
    }
    hasCache(elm) {
        return getW(elm) !== 1;
    }
}
/**
 * Endomorphism-specific multiplication for Koblitz curves.
 * Cost: 128 dbl, 0-256 adds.
 */
function mulEndoUnsafe(Point, point, k1, k2) {
    let acc = point;
    let p1 = Point.ZERO;
    let p2 = Point.ZERO;
    while (k1 > curve_0n || k2 > curve_0n) {
        if (k1 & curve_1n)
            p1 = p1.add(acc);
        if (k2 & curve_1n)
            p2 = p2.add(acc);
        acc = acc.double();
        k1 >>= curve_1n;
        k2 >>= curve_1n;
    }
    return { p1, p2 };
}
/**
 * Pippenger algorithm for multi-scalar multiplication (MSM, Pa + Qb + Rc + ...).
 * 30x faster vs naive addition on L=4096, 10x faster than precomputes.
 * For N=254bit, L=1, it does: 1024 ADD + 254 DBL. For L=5: 1536 ADD + 254 DBL.
 * Algorithmically constant-time (for same L), even when 1 point + scalar, or when scalar = 0.
 * @param c Curve Point constructor
 * @param fieldN field over CURVE.N - important that it's not over CURVE.P
 * @param points array of L curve points
 * @param scalars array of L scalars (aka secret keys / bigints)
 */
function pippenger(c, fieldN, points, scalars) {
    // If we split scalars by some window (let's say 8 bits), every chunk will only
    // take 256 buckets even if there are 4096 scalars, also re-uses double.
    // TODO:
    // - https://eprint.iacr.org/2024/750.pdf
    // - https://tches.iacr.org/index.php/TCHES/article/view/10287
    // 0 is accepted in scalars
    validateMSMPoints(points, c);
    validateMSMScalars(scalars, fieldN);
    const plength = points.length;
    const slength = scalars.length;
    if (plength !== slength)
        throw new Error('arrays of points and scalars must have equal length');
    // if (plength === 0) throw new Error('array must be of length >= 2');
    const zero = c.ZERO;
    const wbits = bitLen(BigInt(plength));
    let windowSize = 1; // bits
    if (wbits > 12)
        windowSize = wbits - 3;
    else if (wbits > 4)
        windowSize = wbits - 2;
    else if (wbits > 0)
        windowSize = 2;
    const MASK = utils_bitMask(windowSize);
    const buckets = new Array(Number(MASK) + 1).fill(zero); // +1 for zero array
    const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
    let sum = zero;
    for (let i = lastBits; i >= 0; i -= windowSize) {
        buckets.fill(zero);
        for (let j = 0; j < slength; j++) {
            const scalar = scalars[j];
            const wbits = Number((scalar >> BigInt(i)) & MASK);
            buckets[wbits] = buckets[wbits].add(points[j]);
        }
        let resI = zero; // not using this will do small speed-up, but will lose ct
        // Skip first bucket, because it is zero
        for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
            sumI = sumI.add(buckets[j]);
            resI = resI.add(sumI);
        }
        sum = sum.add(resI);
        if (i !== 0)
            for (let j = 0; j < windowSize; j++)
                sum = sum.double();
    }
    return sum;
}
/**
 * Precomputed multi-scalar multiplication (MSM, Pa + Qb + Rc + ...).
 * @param c Curve Point constructor
 * @param fieldN field over CURVE.N - important that it's not over CURVE.P
 * @param points array of L curve points
 * @returns function which multiplies points with scaars
 */
function precomputeMSMUnsafe(c, fieldN, points, windowSize) {
    /**
     * Performance Analysis of Window-based Precomputation
     *
     * Base Case (256-bit scalar, 8-bit window):
     * - Standard precomputation requires:
     *   - 31 additions per scalar × 256 scalars = 7,936 ops
     *   - Plus 255 summary additions = 8,191 total ops
     *   Note: Summary additions can be optimized via accumulator
     *
     * Chunked Precomputation Analysis:
     * - Using 32 chunks requires:
     *   - 255 additions per chunk
     *   - 256 doublings
     *   - Total: (255 × 32) + 256 = 8,416 ops
     *
     * Memory Usage Comparison:
     * Window Size | Standard Points | Chunked Points
     * ------------|-----------------|---------------
     *     4-bit   |     520         |      15
     *     8-bit   |    4,224        |     255
     *    10-bit   |   13,824        |   1,023
     *    16-bit   |  557,056        |  65,535
     *
     * Key Advantages:
     * 1. Enables larger window sizes due to reduced memory overhead
     * 2. More efficient for smaller scalar counts:
     *    - 16 chunks: (16 × 255) + 256 = 4,336 ops
     *    - ~2x faster than standard 8,191 ops
     *
     * Limitations:
     * - Not suitable for plain precomputes (requires 256 constant doublings)
     * - Performance degrades with larger scalar counts:
     *   - Optimal for ~256 scalars
     *   - Less efficient for 4096+ scalars (Pippenger preferred)
     */
    validateW(windowSize, fieldN.BITS);
    validateMSMPoints(points, c);
    const zero = c.ZERO;
    const tableSize = 2 ** windowSize - 1; // table size (without zero)
    const chunks = Math.ceil(fieldN.BITS / windowSize); // chunks of item
    const MASK = bitMask(windowSize);
    const tables = points.map((p) => {
        const res = [];
        for (let i = 0, acc = p; i < tableSize; i++) {
            res.push(acc);
            acc = acc.add(p);
        }
        return res;
    });
    return (scalars) => {
        validateMSMScalars(scalars, fieldN);
        if (scalars.length > points.length)
            throw new Error('array of scalars must be smaller than array of points');
        let res = zero;
        for (let i = 0; i < chunks; i++) {
            // No need to double if accumulator is still zero.
            if (res !== zero)
                for (let j = 0; j < windowSize; j++)
                    res = res.double();
            const shiftBy = BigInt(chunks * windowSize - (i + 1) * windowSize);
            for (let j = 0; j < scalars.length; j++) {
                const n = scalars[j];
                const curr = Number((n >> shiftBy) & MASK);
                if (!curr)
                    continue; // skip zero scalars chunks
                res = res.add(tables[j][curr - 1]);
            }
        }
        return res;
    };
}
// TODO: remove
/** @deprecated */
function validateBasic(curve) {
    validateField(curve.Fp);
    validateObject(curve, {
        n: 'bigint',
        h: 'bigint',
        Gx: 'field',
        Gy: 'field',
    }, {
        nBitLength: 'isSafeInteger',
        nByteLength: 'isSafeInteger',
    });
    // Set defaults
    return Object.freeze({
        ...nLength(curve.n, curve.nBitLength),
        ...curve,
        ...{ p: curve.Fp.ORDER },
    });
}
function createField(order, field, isLE) {
    if (field) {
        if (field.ORDER !== order)
            throw new Error('Field.ORDER must match order: Fp == p, Fn == n');
        modular_validateField(field);
        return field;
    }
    else {
        return Field(order, { isLE });
    }
}
/** Validates CURVE opts and creates fields */
function _createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
    if (FpFnLE === undefined)
        FpFnLE = type === 'edwards';
    if (!CURVE || typeof CURVE !== 'object')
        throw new Error(`expected valid ${type} CURVE object`);
    for (const p of ['p', 'n', 'h']) {
        const val = CURVE[p];
        if (!(typeof val === 'bigint' && val > curve_0n))
            throw new Error(`CURVE.${p} must be positive bigint`);
    }
    const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
    const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
    const _b = type === 'weierstrass' ? 'b' : 'd';
    const params = ['Gx', 'Gy', 'a', _b];
    for (const p of params) {
        // @ts-ignore
        if (!Fp.isValid(CURVE[p]))
            throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
    }
    CURVE = Object.freeze(Object.assign({}, CURVE));
    return { CURVE, Fp, Fn };
}
//# sourceMappingURL=curve.js.map
;// CONCATENATED MODULE: ./node_modules/@noble/curves/esm/abstract/weierstrass.js
/**
 * Short Weierstrass curve methods. The formula is: y² = x³ + ax + b.
 *
 * ### Design rationale for types
 *
 * * Interaction between classes from different curves should fail:
 *   `k256.Point.BASE.add(p256.Point.BASE)`
 * * For this purpose we want to use `instanceof` operator, which is fast and works during runtime
 * * Different calls of `curve()` would return different classes -
 *   `curve(params) !== curve(params)`: if somebody decided to monkey-patch their curve,
 *   it won't affect others
 *
 * TypeScript can't infer types for classes created inside a function. Classes is one instance
 * of nominative types in TypeScript and interfaces only check for shape, so it's hard to create
 * unique type for every function call.
 *
 * We can use generic types via some param, like curve opts, but that would:
 *     1. Enable interaction between `curve(params)` and `curve(params)` (curves of same params)
 *     which is hard to debug.
 *     2. Params can be generic and we can't enforce them to be constant value:
 *     if somebody creates curve from non-constant params,
 *     it would be allowed to interact with other curves with non-constant params
 *
 * @todo https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#unique-symbol
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */





// We construct basis in such way that den is always positive and equals n, but num sign depends on basis (not on secret value)
const divNearest = (num, den) => (num + (num >= 0 ? den : -den) / weierstrass_2n) / den;
/**
 * Splits scalar for GLV endomorphism.
 */
function _splitEndoScalar(k, basis, n) {
    // Split scalar into two such that part is ~half bits: `abs(part) < sqrt(N)`
    // Since part can be negative, we need to do this on point.
    // TODO: verifyScalar function which consumes lambda
    const [[a1, b1], [a2, b2]] = basis;
    const c1 = divNearest(b2 * k, n);
    const c2 = divNearest(-b1 * k, n);
    // |k1|/|k2| is < sqrt(N), but can be negative.
    // If we do `k1 mod N`, we'll get big scalar (`> sqrt(N)`): so, we do cheaper negation instead.
    let k1 = k - c1 * a1 - c2 * a2;
    let k2 = -c1 * b1 - c2 * b2;
    const k1neg = k1 < weierstrass_0n;
    const k2neg = k2 < weierstrass_0n;
    if (k1neg)
        k1 = -k1;
    if (k2neg)
        k2 = -k2;
    // Double check that resulting scalar less than half bits of N: otherwise wNAF will fail.
    // This should only happen on wrong basises. Also, math inside is too complex and I don't trust it.
    const MAX_NUM = utils_bitMask(Math.ceil(bitLen(n) / 2)) + weierstrass_1n; // Half bits of N
    if (k1 < weierstrass_0n || k1 >= MAX_NUM || k2 < weierstrass_0n || k2 >= MAX_NUM) {
        throw new Error('splitScalar (endomorphism): failed, k=' + k);
    }
    return { k1neg, k1, k2neg, k2 };
}
function validateSigFormat(format) {
    if (!['compact', 'recovered', 'der'].includes(format))
        throw new Error('Signature format must be "compact", "recovered", or "der"');
    return format;
}
function validateSigOpts(opts, def) {
    const optsn = {};
    for (let optName of Object.keys(def)) {
        // @ts-ignore
        optsn[optName] = opts[optName] === undefined ? def[optName] : opts[optName];
    }
    _abool2(optsn.lowS, 'lowS');
    _abool2(optsn.prehash, 'prehash');
    if (optsn.format !== undefined)
        validateSigFormat(optsn.format);
    return optsn;
}
class DERErr extends Error {
    constructor(m = '') {
        super(m);
    }
}
/**
 * ASN.1 DER encoding utilities. ASN is very complex & fragile. Format:
 *
 *     [0x30 (SEQUENCE), bytelength, 0x02 (INTEGER), intLength, R, 0x02 (INTEGER), intLength, S]
 *
 * Docs: https://letsencrypt.org/docs/a-warm-welcome-to-asn1-and-der/, https://luca.ntop.org/Teaching/Appunti/asn1.html
 */
const DER = {
    // asn.1 DER encoding utils
    Err: DERErr,
    // Basic building block is TLV (Tag-Length-Value)
    _tlv: {
        encode: (tag, data) => {
            const { Err: E } = DER;
            if (tag < 0 || tag > 256)
                throw new E('tlv.encode: wrong tag');
            if (data.length & 1)
                throw new E('tlv.encode: unpadded data');
            const dataLen = data.length / 2;
            const len = numberToHexUnpadded(dataLen);
            if ((len.length / 2) & 128)
                throw new E('tlv.encode: long form length too big');
            // length of length with long form flag
            const lenLen = dataLen > 127 ? numberToHexUnpadded((len.length / 2) | 128) : '';
            const t = numberToHexUnpadded(tag);
            return t + lenLen + len + data;
        },
        // v - value, l - left bytes (unparsed)
        decode(tag, data) {
            const { Err: E } = DER;
            let pos = 0;
            if (tag < 0 || tag > 256)
                throw new E('tlv.encode: wrong tag');
            if (data.length < 2 || data[pos++] !== tag)
                throw new E('tlv.decode: wrong tlv');
            const first = data[pos++];
            const isLong = !!(first & 128); // First bit of first length byte is flag for short/long form
            let length = 0;
            if (!isLong)
                length = first;
            else {
                // Long form: [longFlag(1bit), lengthLength(7bit), length (BE)]
                const lenLen = first & 127;
                if (!lenLen)
                    throw new E('tlv.decode(long): indefinite length not supported');
                if (lenLen > 4)
                    throw new E('tlv.decode(long): byte length is too big'); // this will overflow u32 in js
                const lengthBytes = data.subarray(pos, pos + lenLen);
                if (lengthBytes.length !== lenLen)
                    throw new E('tlv.decode: length bytes not complete');
                if (lengthBytes[0] === 0)
                    throw new E('tlv.decode(long): zero leftmost byte');
                for (const b of lengthBytes)
                    length = (length << 8) | b;
                pos += lenLen;
                if (length < 128)
                    throw new E('tlv.decode(long): not minimal encoding');
            }
            const v = data.subarray(pos, pos + length);
            if (v.length !== length)
                throw new E('tlv.decode: wrong value length');
            return { v, l: data.subarray(pos + length) };
        },
    },
    // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
    // since we always use positive integers here. It must always be empty:
    // - add zero byte if exists
    // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
    _int: {
        encode(num) {
            const { Err: E } = DER;
            if (num < weierstrass_0n)
                throw new E('integer: negative integers are not allowed');
            let hex = numberToHexUnpadded(num);
            // Pad with zero byte if negative flag is present
            if (Number.parseInt(hex[0], 16) & 0b1000)
                hex = '00' + hex;
            if (hex.length & 1)
                throw new E('unexpected DER parsing assertion: unpadded hex');
            return hex;
        },
        decode(data) {
            const { Err: E } = DER;
            if (data[0] & 128)
                throw new E('invalid signature integer: negative');
            if (data[0] === 0x00 && !(data[1] & 128))
                throw new E('invalid signature integer: unnecessary leading zero');
            return utils_bytesToNumberBE(data);
        },
    },
    toSig(hex) {
        // parse DER signature
        const { Err: E, _int: int, _tlv: tlv } = DER;
        const data = utils_ensureBytes('signature', hex);
        const { v: seqBytes, l: seqLeftBytes } = tlv.decode(0x30, data);
        if (seqLeftBytes.length)
            throw new E('invalid signature: left bytes after parsing');
        const { v: rBytes, l: rLeftBytes } = tlv.decode(0x02, seqBytes);
        const { v: sBytes, l: sLeftBytes } = tlv.decode(0x02, rLeftBytes);
        if (sLeftBytes.length)
            throw new E('invalid signature: left bytes after parsing');
        return { r: int.decode(rBytes), s: int.decode(sBytes) };
    },
    hexFromSig(sig) {
        const { _tlv: tlv, _int: int } = DER;
        const rs = tlv.encode(0x02, int.encode(sig.r));
        const ss = tlv.encode(0x02, int.encode(sig.s));
        const seq = rs + ss;
        return tlv.encode(0x30, seq);
    },
};
// Be friendly to bad ECMAScript parsers by not using bigint literals
// prettier-ignore
const weierstrass_0n = BigInt(0), weierstrass_1n = BigInt(1), weierstrass_2n = BigInt(2), weierstrass_3n = BigInt(3), weierstrass_4n = BigInt(4);
function _normFnElement(Fn, key) {
    const { BYTES: expected } = Fn;
    let num;
    if (typeof key === 'bigint') {
        num = key;
    }
    else {
        let bytes = utils_ensureBytes('private key', key);
        try {
            num = Fn.fromBytes(bytes);
        }
        catch (error) {
            throw new Error(`invalid private key: expected ui8a of size ${expected}, got ${typeof key}`);
        }
    }
    if (!Fn.isValidNot0(num))
        throw new Error('invalid private key: out of range [1..N-1]');
    return num;
}
/**
 * Creates weierstrass Point constructor, based on specified curve options.
 *
 * @example
```js
const opts = {
  p: BigInt('0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff'),
  n: BigInt('0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551'),
  h: BigInt(1),
  a: BigInt('0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc'),
  b: BigInt('0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b'),
  Gx: BigInt('0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296'),
  Gy: BigInt('0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5'),
};
const p256_Point = weierstrass(opts);
```
 */
function weierstrassN(params, extraOpts = {}) {
    const validated = _createCurveFields('weierstrass', params, extraOpts);
    const { Fp, Fn } = validated;
    let CURVE = validated.CURVE;
    const { h: cofactor, n: CURVE_ORDER } = CURVE;
    _validateObject(extraOpts, {}, {
        allowInfinityPoint: 'boolean',
        clearCofactor: 'function',
        isTorsionFree: 'function',
        fromBytes: 'function',
        toBytes: 'function',
        endo: 'object',
        wrapPrivateKey: 'boolean',
    });
    const { endo } = extraOpts;
    if (endo) {
        // validateObject(endo, { beta: 'bigint', splitScalar: 'function' });
        if (!Fp.is0(CURVE.a) || typeof endo.beta !== 'bigint' || !Array.isArray(endo.basises)) {
            throw new Error('invalid endo: expected "beta": bigint and "basises": array');
        }
    }
    const lengths = getWLengths(Fp, Fn);
    function assertCompressionIsSupported() {
        if (!Fp.isOdd)
            throw new Error('compression is not supported: Field does not have .isOdd()');
    }
    // Implements IEEE P1363 point encoding
    function pointToBytes(_c, point, isCompressed) {
        const { x, y } = point.toAffine();
        const bx = Fp.toBytes(x);
        _abool2(isCompressed, 'isCompressed');
        if (isCompressed) {
            assertCompressionIsSupported();
            const hasEvenY = !Fp.isOdd(y);
            return concatBytes(pprefix(hasEvenY), bx);
        }
        else {
            return concatBytes(Uint8Array.of(0x04), bx, Fp.toBytes(y));
        }
    }
    function pointFromBytes(bytes) {
        _abytes2(bytes, undefined, 'Point');
        const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths; // e.g. for 32-byte: 33, 65
        const length = bytes.length;
        const head = bytes[0];
        const tail = bytes.subarray(1);
        // No actual validation is done here: use .assertValidity()
        if (length === comp && (head === 0x02 || head === 0x03)) {
            const x = Fp.fromBytes(tail);
            if (!Fp.isValid(x))
                throw new Error('bad point: is not on curve, wrong x');
            const y2 = weierstrassEquation(x); // y² = x³ + ax + b
            let y;
            try {
                y = Fp.sqrt(y2); // y = y² ^ (p+1)/4
            }
            catch (sqrtError) {
                const err = sqrtError instanceof Error ? ': ' + sqrtError.message : '';
                throw new Error('bad point: is not on curve, sqrt error' + err);
            }
            assertCompressionIsSupported();
            const isYOdd = Fp.isOdd(y); // (y & _1n) === _1n;
            const isHeadOdd = (head & 1) === 1; // ECDSA-specific
            if (isHeadOdd !== isYOdd)
                y = Fp.neg(y);
            return { x, y };
        }
        else if (length === uncomp && head === 0x04) {
            // TODO: more checks
            const L = Fp.BYTES;
            const x = Fp.fromBytes(tail.subarray(0, L));
            const y = Fp.fromBytes(tail.subarray(L, L * 2));
            if (!isValidXY(x, y))
                throw new Error('bad point: is not on curve');
            return { x, y };
        }
        else {
            throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
        }
    }
    const encodePoint = extraOpts.toBytes || pointToBytes;
    const decodePoint = extraOpts.fromBytes || pointFromBytes;
    function weierstrassEquation(x) {
        const x2 = Fp.sqr(x); // x * x
        const x3 = Fp.mul(x2, x); // x² * x
        return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b); // x³ + a * x + b
    }
    // TODO: move top-level
    /** Checks whether equation holds for given x, y: y² == x³ + ax + b */
    function isValidXY(x, y) {
        const left = Fp.sqr(y); // y²
        const right = weierstrassEquation(x); // x³ + ax + b
        return Fp.eql(left, right);
    }
    // Validate whether the passed curve params are valid.
    // Test 1: equation y² = x³ + ax + b should work for generator point.
    if (!isValidXY(CURVE.Gx, CURVE.Gy))
        throw new Error('bad curve params: generator point');
    // Test 2: discriminant Δ part should be non-zero: 4a³ + 27b² != 0.
    // Guarantees curve is genus-1, smooth (non-singular).
    const _4a3 = Fp.mul(Fp.pow(CURVE.a, weierstrass_3n), weierstrass_4n);
    const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
    if (Fp.is0(Fp.add(_4a3, _27b2)))
        throw new Error('bad curve params: a or b');
    /** Asserts coordinate is valid: 0 <= n < Fp.ORDER. */
    function acoord(title, n, banZero = false) {
        if (!Fp.isValid(n) || (banZero && Fp.is0(n)))
            throw new Error(`bad point coordinate ${title}`);
        return n;
    }
    function aprjpoint(other) {
        if (!(other instanceof Point))
            throw new Error('ProjectivePoint expected');
    }
    function splitEndoScalarN(k) {
        if (!endo || !endo.basises)
            throw new Error('no endo');
        return _splitEndoScalar(k, endo.basises, Fn.ORDER);
    }
    // Memoized toAffine / validity check. They are heavy. Points are immutable.
    // Converts Projective point to affine (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    // (X, Y, Z) ∋ (x=X/Z, y=Y/Z)
    const toAffineMemo = memoized((p, iz) => {
        const { X, Y, Z } = p;
        // Fast-path for normalized points
        if (Fp.eql(Z, Fp.ONE))
            return { x: X, y: Y };
        const is0 = p.is0();
        // If invZ was 0, we return zero point. However we still want to execute
        // all operations, so we replace invZ with a random number, 1.
        if (iz == null)
            iz = is0 ? Fp.ONE : Fp.inv(Z);
        const x = Fp.mul(X, iz);
        const y = Fp.mul(Y, iz);
        const zz = Fp.mul(Z, iz);
        if (is0)
            return { x: Fp.ZERO, y: Fp.ZERO };
        if (!Fp.eql(zz, Fp.ONE))
            throw new Error('invZ was invalid');
        return { x, y };
    });
    // NOTE: on exception this will crash 'cached' and no value will be set.
    // Otherwise true will be return
    const assertValidMemo = memoized((p) => {
        if (p.is0()) {
            // (0, 1, 0) aka ZERO is invalid in most contexts.
            // In BLS, ZERO can be serialized, so we allow it.
            // (0, 0, 0) is invalid representation of ZERO.
            if (extraOpts.allowInfinityPoint && !Fp.is0(p.Y))
                return;
            throw new Error('bad point: ZERO');
        }
        // Some 3rd-party test vectors require different wording between here & `fromCompressedHex`
        const { x, y } = p.toAffine();
        if (!Fp.isValid(x) || !Fp.isValid(y))
            throw new Error('bad point: x or y not field elements');
        if (!isValidXY(x, y))
            throw new Error('bad point: equation left != right');
        if (!p.isTorsionFree())
            throw new Error('bad point: not in prime-order subgroup');
        return true;
    });
    function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
        k2p = new Point(Fp.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
        k1p = negateCt(k1neg, k1p);
        k2p = negateCt(k2neg, k2p);
        return k1p.add(k2p);
    }
    /**
     * Projective Point works in 3d / projective (homogeneous) coordinates:(X, Y, Z) ∋ (x=X/Z, y=Y/Z).
     * Default Point works in 2d / affine coordinates: (x, y).
     * We're doing calculations in projective, because its operations don't require costly inversion.
     */
    class Point {
        /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
        constructor(X, Y, Z) {
            this.X = acoord('x', X);
            this.Y = acoord('y', Y, true);
            this.Z = acoord('z', Z);
            Object.freeze(this);
        }
        static CURVE() {
            return CURVE;
        }
        /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
        static fromAffine(p) {
            const { x, y } = p || {};
            if (!p || !Fp.isValid(x) || !Fp.isValid(y))
                throw new Error('invalid affine point');
            if (p instanceof Point)
                throw new Error('projective point not allowed');
            // (0, 0) would've produced (0, 0, 1) - instead, we need (0, 1, 0)
            if (Fp.is0(x) && Fp.is0(y))
                return Point.ZERO;
            return new Point(x, y, Fp.ONE);
        }
        static fromBytes(bytes) {
            const P = Point.fromAffine(decodePoint(_abytes2(bytes, undefined, 'point')));
            P.assertValidity();
            return P;
        }
        static fromHex(hex) {
            return Point.fromBytes(utils_ensureBytes('pointHex', hex));
        }
        get x() {
            return this.toAffine().x;
        }
        get y() {
            return this.toAffine().y;
        }
        /**
         *
         * @param windowSize
         * @param isLazy true will defer table computation until the first multiplication
         * @returns
         */
        precompute(windowSize = 8, isLazy = true) {
            wnaf.createCache(this, windowSize);
            if (!isLazy)
                this.multiply(weierstrass_3n); // random number
            return this;
        }
        // TODO: return `this`
        /** A point on curve is valid if it conforms to equation. */
        assertValidity() {
            assertValidMemo(this);
        }
        hasEvenY() {
            const { y } = this.toAffine();
            if (!Fp.isOdd)
                throw new Error("Field doesn't support isOdd");
            return !Fp.isOdd(y);
        }
        /** Compare one point to another. */
        equals(other) {
            aprjpoint(other);
            const { X: X1, Y: Y1, Z: Z1 } = this;
            const { X: X2, Y: Y2, Z: Z2 } = other;
            const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
            const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
            return U1 && U2;
        }
        /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
        negate() {
            return new Point(this.X, Fp.neg(this.Y), this.Z);
        }
        // Renes-Costello-Batina exception-free doubling formula.
        // There is 30% faster Jacobian formula, but it is not complete.
        // https://eprint.iacr.org/2015/1060, algorithm 3
        // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
        double() {
            const { a, b } = CURVE;
            const b3 = Fp.mul(b, weierstrass_3n);
            const { X: X1, Y: Y1, Z: Z1 } = this;
            let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO; // prettier-ignore
            let t0 = Fp.mul(X1, X1); // step 1
            let t1 = Fp.mul(Y1, Y1);
            let t2 = Fp.mul(Z1, Z1);
            let t3 = Fp.mul(X1, Y1);
            t3 = Fp.add(t3, t3); // step 5
            Z3 = Fp.mul(X1, Z1);
            Z3 = Fp.add(Z3, Z3);
            X3 = Fp.mul(a, Z3);
            Y3 = Fp.mul(b3, t2);
            Y3 = Fp.add(X3, Y3); // step 10
            X3 = Fp.sub(t1, Y3);
            Y3 = Fp.add(t1, Y3);
            Y3 = Fp.mul(X3, Y3);
            X3 = Fp.mul(t3, X3);
            Z3 = Fp.mul(b3, Z3); // step 15
            t2 = Fp.mul(a, t2);
            t3 = Fp.sub(t0, t2);
            t3 = Fp.mul(a, t3);
            t3 = Fp.add(t3, Z3);
            Z3 = Fp.add(t0, t0); // step 20
            t0 = Fp.add(Z3, t0);
            t0 = Fp.add(t0, t2);
            t0 = Fp.mul(t0, t3);
            Y3 = Fp.add(Y3, t0);
            t2 = Fp.mul(Y1, Z1); // step 25
            t2 = Fp.add(t2, t2);
            t0 = Fp.mul(t2, t3);
            X3 = Fp.sub(X3, t0);
            Z3 = Fp.mul(t2, t1);
            Z3 = Fp.add(Z3, Z3); // step 30
            Z3 = Fp.add(Z3, Z3);
            return new Point(X3, Y3, Z3);
        }
        // Renes-Costello-Batina exception-free addition formula.
        // There is 30% faster Jacobian formula, but it is not complete.
        // https://eprint.iacr.org/2015/1060, algorithm 1
        // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
        add(other) {
            aprjpoint(other);
            const { X: X1, Y: Y1, Z: Z1 } = this;
            const { X: X2, Y: Y2, Z: Z2 } = other;
            let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO; // prettier-ignore
            const a = CURVE.a;
            const b3 = Fp.mul(CURVE.b, weierstrass_3n);
            let t0 = Fp.mul(X1, X2); // step 1
            let t1 = Fp.mul(Y1, Y2);
            let t2 = Fp.mul(Z1, Z2);
            let t3 = Fp.add(X1, Y1);
            let t4 = Fp.add(X2, Y2); // step 5
            t3 = Fp.mul(t3, t4);
            t4 = Fp.add(t0, t1);
            t3 = Fp.sub(t3, t4);
            t4 = Fp.add(X1, Z1);
            let t5 = Fp.add(X2, Z2); // step 10
            t4 = Fp.mul(t4, t5);
            t5 = Fp.add(t0, t2);
            t4 = Fp.sub(t4, t5);
            t5 = Fp.add(Y1, Z1);
            X3 = Fp.add(Y2, Z2); // step 15
            t5 = Fp.mul(t5, X3);
            X3 = Fp.add(t1, t2);
            t5 = Fp.sub(t5, X3);
            Z3 = Fp.mul(a, t4);
            X3 = Fp.mul(b3, t2); // step 20
            Z3 = Fp.add(X3, Z3);
            X3 = Fp.sub(t1, Z3);
            Z3 = Fp.add(t1, Z3);
            Y3 = Fp.mul(X3, Z3);
            t1 = Fp.add(t0, t0); // step 25
            t1 = Fp.add(t1, t0);
            t2 = Fp.mul(a, t2);
            t4 = Fp.mul(b3, t4);
            t1 = Fp.add(t1, t2);
            t2 = Fp.sub(t0, t2); // step 30
            t2 = Fp.mul(a, t2);
            t4 = Fp.add(t4, t2);
            t0 = Fp.mul(t1, t4);
            Y3 = Fp.add(Y3, t0);
            t0 = Fp.mul(t5, t4); // step 35
            X3 = Fp.mul(t3, X3);
            X3 = Fp.sub(X3, t0);
            t0 = Fp.mul(t3, t1);
            Z3 = Fp.mul(t5, Z3);
            Z3 = Fp.add(Z3, t0); // step 40
            return new Point(X3, Y3, Z3);
        }
        subtract(other) {
            return this.add(other.negate());
        }
        is0() {
            return this.equals(Point.ZERO);
        }
        /**
         * Constant time multiplication.
         * Uses wNAF method. Windowed method may be 10% faster,
         * but takes 2x longer to generate and consumes 2x memory.
         * Uses precomputes when available.
         * Uses endomorphism for Koblitz curves.
         * @param scalar by which the point would be multiplied
         * @returns New point
         */
        multiply(scalar) {
            const { endo } = extraOpts;
            if (!Fn.isValidNot0(scalar))
                throw new Error('invalid scalar: out of range'); // 0 is invalid
            let point, fake; // Fake point is used to const-time mult
            const mul = (n) => wnaf.cached(this, n, (p) => normalizeZ(Point, p));
            /** See docs for {@link EndomorphismOpts} */
            if (endo) {
                const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
                const { p: k1p, f: k1f } = mul(k1);
                const { p: k2p, f: k2f } = mul(k2);
                fake = k1f.add(k2f);
                point = finishEndo(endo.beta, k1p, k2p, k1neg, k2neg);
            }
            else {
                const { p, f } = mul(scalar);
                point = p;
                fake = f;
            }
            // Normalize `z` for both points, but return only real one
            return normalizeZ(Point, [point, fake])[0];
        }
        /**
         * Non-constant-time multiplication. Uses double-and-add algorithm.
         * It's faster, but should only be used when you don't care about
         * an exposed secret key e.g. sig verification, which works over *public* keys.
         */
        multiplyUnsafe(sc) {
            const { endo } = extraOpts;
            const p = this;
            if (!Fn.isValid(sc))
                throw new Error('invalid scalar: out of range'); // 0 is valid
            if (sc === weierstrass_0n || p.is0())
                return Point.ZERO;
            if (sc === weierstrass_1n)
                return p; // fast-path
            if (wnaf.hasCache(this))
                return this.multiply(sc);
            if (endo) {
                const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
                const { p1, p2 } = mulEndoUnsafe(Point, p, k1, k2); // 30% faster vs wnaf.unsafe
                return finishEndo(endo.beta, p1, p2, k1neg, k2neg);
            }
            else {
                return wnaf.unsafe(p, sc);
            }
        }
        multiplyAndAddUnsafe(Q, a, b) {
            const sum = this.multiplyUnsafe(a).add(Q.multiplyUnsafe(b));
            return sum.is0() ? undefined : sum;
        }
        /**
         * Converts Projective point to affine (x, y) coordinates.
         * @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
         */
        toAffine(invertedZ) {
            return toAffineMemo(this, invertedZ);
        }
        /**
         * Checks whether Point is free of torsion elements (is in prime subgroup).
         * Always torsion-free for cofactor=1 curves.
         */
        isTorsionFree() {
            const { isTorsionFree } = extraOpts;
            if (cofactor === weierstrass_1n)
                return true;
            if (isTorsionFree)
                return isTorsionFree(Point, this);
            return wnaf.unsafe(this, CURVE_ORDER).is0();
        }
        clearCofactor() {
            const { clearCofactor } = extraOpts;
            if (cofactor === weierstrass_1n)
                return this; // Fast-path
            if (clearCofactor)
                return clearCofactor(Point, this);
            return this.multiplyUnsafe(cofactor);
        }
        isSmallOrder() {
            // can we use this.clearCofactor()?
            return this.multiplyUnsafe(cofactor).is0();
        }
        toBytes(isCompressed = true) {
            _abool2(isCompressed, 'isCompressed');
            this.assertValidity();
            return encodePoint(Point, this, isCompressed);
        }
        toHex(isCompressed = true) {
            return bytesToHex(this.toBytes(isCompressed));
        }
        toString() {
            return `<Point ${this.is0() ? 'ZERO' : this.toHex()}>`;
        }
        // TODO: remove
        get px() {
            return this.X;
        }
        get py() {
            return this.X;
        }
        get pz() {
            return this.Z;
        }
        toRawBytes(isCompressed = true) {
            return this.toBytes(isCompressed);
        }
        _setWindowSize(windowSize) {
            this.precompute(windowSize);
        }
        static normalizeZ(points) {
            return normalizeZ(Point, points);
        }
        static msm(points, scalars) {
            return pippenger(Point, Fn, points, scalars);
        }
        static fromPrivateKey(privateKey) {
            return Point.BASE.multiply(_normFnElement(Fn, privateKey));
        }
    }
    // base / generator point
    Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
    // zero / infinity / identity point
    Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO); // 0, 1, 0
    // math field
    Point.Fp = Fp;
    // scalar field
    Point.Fn = Fn;
    const bits = Fn.BITS;
    const wnaf = new wNAF(Point, extraOpts.endo ? Math.ceil(bits / 2) : bits);
    Point.BASE.precompute(8); // Enable precomputes. Slows down first publicKey computation by 20ms.
    return Point;
}
// Points start with byte 0x02 when y is even; otherwise 0x03
function pprefix(hasEvenY) {
    return Uint8Array.of(hasEvenY ? 0x02 : 0x03);
}
/**
 * Implementation of the Shallue and van de Woestijne method for any weierstrass curve.
 * TODO: check if there is a way to merge this with uvRatio in Edwards; move to modular.
 * b = True and y = sqrt(u / v) if (u / v) is square in F, and
 * b = False and y = sqrt(Z * (u / v)) otherwise.
 * @param Fp
 * @param Z
 * @returns
 */
function SWUFpSqrtRatio(Fp, Z) {
    // Generic implementation
    const q = Fp.ORDER;
    let l = weierstrass_0n;
    for (let o = q - weierstrass_1n; o % weierstrass_2n === weierstrass_0n; o /= weierstrass_2n)
        l += weierstrass_1n;
    const c1 = l; // 1. c1, the largest integer such that 2^c1 divides q - 1.
    // We need 2n ** c1 and 2n ** (c1-1). We can't use **; but we can use <<.
    // 2n ** c1 == 2n << (c1-1)
    const _2n_pow_c1_1 = weierstrass_2n << (c1 - weierstrass_1n - weierstrass_1n);
    const _2n_pow_c1 = _2n_pow_c1_1 * weierstrass_2n;
    const c2 = (q - weierstrass_1n) / _2n_pow_c1; // 2. c2 = (q - 1) / (2^c1)  # Integer arithmetic
    const c3 = (c2 - weierstrass_1n) / weierstrass_2n; // 3. c3 = (c2 - 1) / 2            # Integer arithmetic
    const c4 = _2n_pow_c1 - weierstrass_1n; // 4. c4 = 2^c1 - 1                # Integer arithmetic
    const c5 = _2n_pow_c1_1; // 5. c5 = 2^(c1 - 1)                  # Integer arithmetic
    const c6 = Fp.pow(Z, c2); // 6. c6 = Z^c2
    const c7 = Fp.pow(Z, (c2 + weierstrass_1n) / weierstrass_2n); // 7. c7 = Z^((c2 + 1) / 2)
    let sqrtRatio = (u, v) => {
        let tv1 = c6; // 1. tv1 = c6
        let tv2 = Fp.pow(v, c4); // 2. tv2 = v^c4
        let tv3 = Fp.sqr(tv2); // 3. tv3 = tv2^2
        tv3 = Fp.mul(tv3, v); // 4. tv3 = tv3 * v
        let tv5 = Fp.mul(u, tv3); // 5. tv5 = u * tv3
        tv5 = Fp.pow(tv5, c3); // 6. tv5 = tv5^c3
        tv5 = Fp.mul(tv5, tv2); // 7. tv5 = tv5 * tv2
        tv2 = Fp.mul(tv5, v); // 8. tv2 = tv5 * v
        tv3 = Fp.mul(tv5, u); // 9. tv3 = tv5 * u
        let tv4 = Fp.mul(tv3, tv2); // 10. tv4 = tv3 * tv2
        tv5 = Fp.pow(tv4, c5); // 11. tv5 = tv4^c5
        let isQR = Fp.eql(tv5, Fp.ONE); // 12. isQR = tv5 == 1
        tv2 = Fp.mul(tv3, c7); // 13. tv2 = tv3 * c7
        tv5 = Fp.mul(tv4, tv1); // 14. tv5 = tv4 * tv1
        tv3 = Fp.cmov(tv2, tv3, isQR); // 15. tv3 = CMOV(tv2, tv3, isQR)
        tv4 = Fp.cmov(tv5, tv4, isQR); // 16. tv4 = CMOV(tv5, tv4, isQR)
        // 17. for i in (c1, c1 - 1, ..., 2):
        for (let i = c1; i > weierstrass_1n; i--) {
            let tv5 = i - weierstrass_2n; // 18.    tv5 = i - 2
            tv5 = weierstrass_2n << (tv5 - weierstrass_1n); // 19.    tv5 = 2^tv5
            let tvv5 = Fp.pow(tv4, tv5); // 20.    tv5 = tv4^tv5
            const e1 = Fp.eql(tvv5, Fp.ONE); // 21.    e1 = tv5 == 1
            tv2 = Fp.mul(tv3, tv1); // 22.    tv2 = tv3 * tv1
            tv1 = Fp.mul(tv1, tv1); // 23.    tv1 = tv1 * tv1
            tvv5 = Fp.mul(tv4, tv1); // 24.    tv5 = tv4 * tv1
            tv3 = Fp.cmov(tv2, tv3, e1); // 25.    tv3 = CMOV(tv2, tv3, e1)
            tv4 = Fp.cmov(tvv5, tv4, e1); // 26.    tv4 = CMOV(tv5, tv4, e1)
        }
        return { isValid: isQR, value: tv3 };
    };
    if (Fp.ORDER % weierstrass_4n === weierstrass_3n) {
        // sqrt_ratio_3mod4(u, v)
        const c1 = (Fp.ORDER - weierstrass_3n) / weierstrass_4n; // 1. c1 = (q - 3) / 4     # Integer arithmetic
        const c2 = Fp.sqrt(Fp.neg(Z)); // 2. c2 = sqrt(-Z)
        sqrtRatio = (u, v) => {
            let tv1 = Fp.sqr(v); // 1. tv1 = v^2
            const tv2 = Fp.mul(u, v); // 2. tv2 = u * v
            tv1 = Fp.mul(tv1, tv2); // 3. tv1 = tv1 * tv2
            let y1 = Fp.pow(tv1, c1); // 4. y1 = tv1^c1
            y1 = Fp.mul(y1, tv2); // 5. y1 = y1 * tv2
            const y2 = Fp.mul(y1, c2); // 6. y2 = y1 * c2
            const tv3 = Fp.mul(Fp.sqr(y1), v); // 7. tv3 = y1^2; 8. tv3 = tv3 * v
            const isQR = Fp.eql(tv3, u); // 9. isQR = tv3 == u
            let y = Fp.cmov(y2, y1, isQR); // 10. y = CMOV(y2, y1, isQR)
            return { isValid: isQR, value: y }; // 11. return (isQR, y) isQR ? y : y*c2
        };
    }
    // No curves uses that
    // if (Fp.ORDER % _8n === _5n) // sqrt_ratio_5mod8
    return sqrtRatio;
}
/**
 * Simplified Shallue-van de Woestijne-Ulas Method
 * https://www.rfc-editor.org/rfc/rfc9380#section-6.6.2
 */
function weierstrass_mapToCurveSimpleSWU(Fp, opts) {
    validateField(Fp);
    const { A, B, Z } = opts;
    if (!Fp.isValid(A) || !Fp.isValid(B) || !Fp.isValid(Z))
        throw new Error('mapToCurveSimpleSWU: invalid opts');
    const sqrtRatio = SWUFpSqrtRatio(Fp, Z);
    if (!Fp.isOdd)
        throw new Error('Field does not have .isOdd()');
    // Input: u, an element of F.
    // Output: (x, y), a point on E.
    return (u) => {
        // prettier-ignore
        let tv1, tv2, tv3, tv4, tv5, tv6, x, y;
        tv1 = Fp.sqr(u); // 1.  tv1 = u^2
        tv1 = Fp.mul(tv1, Z); // 2.  tv1 = Z * tv1
        tv2 = Fp.sqr(tv1); // 3.  tv2 = tv1^2
        tv2 = Fp.add(tv2, tv1); // 4.  tv2 = tv2 + tv1
        tv3 = Fp.add(tv2, Fp.ONE); // 5.  tv3 = tv2 + 1
        tv3 = Fp.mul(tv3, B); // 6.  tv3 = B * tv3
        tv4 = Fp.cmov(Z, Fp.neg(tv2), !Fp.eql(tv2, Fp.ZERO)); // 7.  tv4 = CMOV(Z, -tv2, tv2 != 0)
        tv4 = Fp.mul(tv4, A); // 8.  tv4 = A * tv4
        tv2 = Fp.sqr(tv3); // 9.  tv2 = tv3^2
        tv6 = Fp.sqr(tv4); // 10. tv6 = tv4^2
        tv5 = Fp.mul(tv6, A); // 11. tv5 = A * tv6
        tv2 = Fp.add(tv2, tv5); // 12. tv2 = tv2 + tv5
        tv2 = Fp.mul(tv2, tv3); // 13. tv2 = tv2 * tv3
        tv6 = Fp.mul(tv6, tv4); // 14. tv6 = tv6 * tv4
        tv5 = Fp.mul(tv6, B); // 15. tv5 = B * tv6
        tv2 = Fp.add(tv2, tv5); // 16. tv2 = tv2 + tv5
        x = Fp.mul(tv1, tv3); // 17.   x = tv1 * tv3
        const { isValid, value } = sqrtRatio(tv2, tv6); // 18. (is_gx1_square, y1) = sqrt_ratio(tv2, tv6)
        y = Fp.mul(tv1, u); // 19.   y = tv1 * u  -> Z * u^3 * y1
        y = Fp.mul(y, value); // 20.   y = y * y1
        x = Fp.cmov(x, tv3, isValid); // 21.   x = CMOV(x, tv3, is_gx1_square)
        y = Fp.cmov(y, value, isValid); // 22.   y = CMOV(y, y1, is_gx1_square)
        const e1 = Fp.isOdd(u) === Fp.isOdd(y); // 23.  e1 = sgn0(u) == sgn0(y)
        y = Fp.cmov(Fp.neg(y), y, e1); // 24.   y = CMOV(-y, y, e1)
        const tv4_inv = FpInvertBatch(Fp, [tv4], true)[0];
        x = Fp.mul(x, tv4_inv); // 25.   x = x / tv4
        return { x, y };
    };
}
function getWLengths(Fp, Fn) {
    return {
        secretKey: Fn.BYTES,
        publicKey: 1 + Fp.BYTES,
        publicKeyUncompressed: 1 + 2 * Fp.BYTES,
        publicKeyHasPrefix: true,
        signature: 2 * Fn.BYTES,
    };
}
/**
 * Sometimes users only need getPublicKey, getSharedSecret, and secret key handling.
 * This helper ensures no signature functionality is present. Less code, smaller bundle size.
 */
function ecdh(Point, ecdhOpts = {}) {
    const { Fn } = Point;
    const randomBytes_ = ecdhOpts.randomBytes || utils_randomBytes;
    const lengths = Object.assign(getWLengths(Point.Fp, Fn), { seed: getMinHashLength(Fn.ORDER) });
    function isValidSecretKey(secretKey) {
        try {
            return !!_normFnElement(Fn, secretKey);
        }
        catch (error) {
            return false;
        }
    }
    function isValidPublicKey(publicKey, isCompressed) {
        const { publicKey: comp, publicKeyUncompressed } = lengths;
        try {
            const l = publicKey.length;
            if (isCompressed === true && l !== comp)
                return false;
            if (isCompressed === false && l !== publicKeyUncompressed)
                return false;
            return !!Point.fromBytes(publicKey);
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Produces cryptographically secure secret key from random of size
     * (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
     */
    function randomSecretKey(seed = randomBytes_(lengths.seed)) {
        return mapHashToField(_abytes2(seed, lengths.seed, 'seed'), Fn.ORDER);
    }
    /**
     * Computes public key for a secret key. Checks for validity of the secret key.
     * @param isCompressed whether to return compact (default), or full key
     * @returns Public key, full when isCompressed=false; short when isCompressed=true
     */
    function getPublicKey(secretKey, isCompressed = true) {
        return Point.BASE.multiply(_normFnElement(Fn, secretKey)).toBytes(isCompressed);
    }
    function keygen(seed) {
        const secretKey = randomSecretKey(seed);
        return { secretKey, publicKey: getPublicKey(secretKey) };
    }
    /**
     * Quick and dirty check for item being public key. Does not validate hex, or being on-curve.
     */
    function isProbPub(item) {
        if (typeof item === 'bigint')
            return false;
        if (item instanceof Point)
            return true;
        const { secretKey, publicKey, publicKeyUncompressed } = lengths;
        if (Fn.allowedLengths || secretKey === publicKey)
            return undefined;
        const l = utils_ensureBytes('key', item).length;
        return l === publicKey || l === publicKeyUncompressed;
    }
    /**
     * ECDH (Elliptic Curve Diffie Hellman).
     * Computes shared public key from secret key A and public key B.
     * Checks: 1) secret key validity 2) shared key is on-curve.
     * Does NOT hash the result.
     * @param isCompressed whether to return compact (default), or full key
     * @returns shared public key
     */
    function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
        if (isProbPub(secretKeyA) === true)
            throw new Error('first arg must be private key');
        if (isProbPub(publicKeyB) === false)
            throw new Error('second arg must be public key');
        const s = _normFnElement(Fn, secretKeyA);
        const b = Point.fromHex(publicKeyB); // checks for being on-curve
        return b.multiply(s).toBytes(isCompressed);
    }
    const utils = {
        isValidSecretKey,
        isValidPublicKey,
        randomSecretKey,
        // TODO: remove
        isValidPrivateKey: isValidSecretKey,
        randomPrivateKey: randomSecretKey,
        normPrivateKeyToScalar: (key) => _normFnElement(Fn, key),
        precompute(windowSize = 8, point = Point.BASE) {
            return point.precompute(windowSize, false);
        },
    };
    return Object.freeze({ getPublicKey, getSharedSecret, keygen, Point, utils, lengths });
}
/**
 * Creates ECDSA signing interface for given elliptic curve `Point` and `hash` function.
 * We need `hash` for 2 features:
 * 1. Message prehash-ing. NOT used if `sign` / `verify` are called with `prehash: false`
 * 2. k generation in `sign`, using HMAC-drbg(hash)
 *
 * ECDSAOpts are only rarely needed.
 *
 * @example
 * ```js
 * const p256_Point = weierstrass(...);
 * const p256_sha256 = ecdsa(p256_Point, sha256);
 * const p256_sha224 = ecdsa(p256_Point, sha224);
 * const p256_sha224_r = ecdsa(p256_Point, sha224, { randomBytes: (length) => { ... } });
 * ```
 */
function ecdsa(Point, hash, ecdsaOpts = {}) {
    ahash(hash);
    _validateObject(ecdsaOpts, {}, {
        hmac: 'function',
        lowS: 'boolean',
        randomBytes: 'function',
        bits2int: 'function',
        bits2int_modN: 'function',
    });
    const randomBytes = ecdsaOpts.randomBytes || utils_randomBytes;
    const hmac = ecdsaOpts.hmac ||
        ((key, ...msgs) => hmac_hmac(hash, key, concatBytes(...msgs)));
    const { Fp, Fn } = Point;
    const { ORDER: CURVE_ORDER, BITS: fnBits } = Fn;
    const { keygen, getPublicKey, getSharedSecret, utils, lengths } = ecdh(Point, ecdsaOpts);
    const defaultSigOpts = {
        prehash: false,
        lowS: typeof ecdsaOpts.lowS === 'boolean' ? ecdsaOpts.lowS : false,
        format: undefined, //'compact' as ECDSASigFormat,
        extraEntropy: false,
    };
    const defaultSigOpts_format = 'compact';
    function isBiggerThanHalfOrder(number) {
        const HALF = CURVE_ORDER >> weierstrass_1n;
        return number > HALF;
    }
    function validateRS(title, num) {
        if (!Fn.isValidNot0(num))
            throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
        return num;
    }
    function validateSigLength(bytes, format) {
        validateSigFormat(format);
        const size = lengths.signature;
        const sizer = format === 'compact' ? size : format === 'recovered' ? size + 1 : undefined;
        return _abytes2(bytes, sizer, `${format} signature`);
    }
    /**
     * ECDSA signature with its (r, s) properties. Supports compact, recovered & DER representations.
     */
    class Signature {
        constructor(r, s, recovery) {
            this.r = validateRS('r', r); // r in [1..N-1];
            this.s = validateRS('s', s); // s in [1..N-1];
            if (recovery != null)
                this.recovery = recovery;
            Object.freeze(this);
        }
        static fromBytes(bytes, format = defaultSigOpts_format) {
            validateSigLength(bytes, format);
            let recid;
            if (format === 'der') {
                const { r, s } = DER.toSig(_abytes2(bytes));
                return new Signature(r, s);
            }
            if (format === 'recovered') {
                recid = bytes[0];
                format = 'compact';
                bytes = bytes.subarray(1);
            }
            const L = Fn.BYTES;
            const r = bytes.subarray(0, L);
            const s = bytes.subarray(L, L * 2);
            return new Signature(Fn.fromBytes(r), Fn.fromBytes(s), recid);
        }
        static fromHex(hex, format) {
            return this.fromBytes(hexToBytes(hex), format);
        }
        addRecoveryBit(recovery) {
            return new Signature(this.r, this.s, recovery);
        }
        recoverPublicKey(messageHash) {
            const FIELD_ORDER = Fp.ORDER;
            const { r, s, recovery: rec } = this;
            if (rec == null || ![0, 1, 2, 3].includes(rec))
                throw new Error('recovery id invalid');
            // ECDSA recovery is hard for cofactor > 1 curves.
            // In sign, `r = q.x mod n`, and here we recover q.x from r.
            // While recovering q.x >= n, we need to add r+n for cofactor=1 curves.
            // However, for cofactor>1, r+n may not get q.x:
            // r+n*i would need to be done instead where i is unknown.
            // To easily get i, we either need to:
            // a. increase amount of valid recid values (4, 5...); OR
            // b. prohibit non-prime-order signatures (recid > 1).
            const hasCofactor = CURVE_ORDER * weierstrass_2n < FIELD_ORDER;
            if (hasCofactor && rec > 1)
                throw new Error('recovery id is ambiguous for h>1 curve');
            const radj = rec === 2 || rec === 3 ? r + CURVE_ORDER : r;
            if (!Fp.isValid(radj))
                throw new Error('recovery id 2 or 3 invalid');
            const x = Fp.toBytes(radj);
            const R = Point.fromBytes(concatBytes(pprefix((rec & 1) === 0), x));
            const ir = Fn.inv(radj); // r^-1
            const h = bits2int_modN(utils_ensureBytes('msgHash', messageHash)); // Truncate hash
            const u1 = Fn.create(-h * ir); // -hr^-1
            const u2 = Fn.create(s * ir); // sr^-1
            // (sr^-1)R-(hr^-1)G = -(hr^-1)G + (sr^-1). unsafe is fine: there is no private data.
            const Q = Point.BASE.multiplyUnsafe(u1).add(R.multiplyUnsafe(u2));
            if (Q.is0())
                throw new Error('point at infinify');
            Q.assertValidity();
            return Q;
        }
        // Signatures should be low-s, to prevent malleability.
        hasHighS() {
            return isBiggerThanHalfOrder(this.s);
        }
        toBytes(format = defaultSigOpts_format) {
            validateSigFormat(format);
            if (format === 'der')
                return hexToBytes(DER.hexFromSig(this));
            const r = Fn.toBytes(this.r);
            const s = Fn.toBytes(this.s);
            if (format === 'recovered') {
                if (this.recovery == null)
                    throw new Error('recovery bit must be present');
                return concatBytes(Uint8Array.of(this.recovery), r, s);
            }
            return concatBytes(r, s);
        }
        toHex(format) {
            return bytesToHex(this.toBytes(format));
        }
        // TODO: remove
        assertValidity() { }
        static fromCompact(hex) {
            return Signature.fromBytes(utils_ensureBytes('sig', hex), 'compact');
        }
        static fromDER(hex) {
            return Signature.fromBytes(utils_ensureBytes('sig', hex), 'der');
        }
        normalizeS() {
            return this.hasHighS() ? new Signature(this.r, Fn.neg(this.s), this.recovery) : this;
        }
        toDERRawBytes() {
            return this.toBytes('der');
        }
        toDERHex() {
            return bytesToHex(this.toBytes('der'));
        }
        toCompactRawBytes() {
            return this.toBytes('compact');
        }
        toCompactHex() {
            return bytesToHex(this.toBytes('compact'));
        }
    }
    // RFC6979: ensure ECDSA msg is X bytes and < N. RFC suggests optional truncating via bits2octets.
    // FIPS 186-4 4.6 suggests the leftmost min(nBitLen, outLen) bits, which matches bits2int.
    // bits2int can produce res>N, we can do mod(res, N) since the bitLen is the same.
    // int2octets can't be used; pads small msgs with 0: unacceptatble for trunc as per RFC vectors
    const bits2int = ecdsaOpts.bits2int ||
        function bits2int_def(bytes) {
            // Our custom check "just in case", for protection against DoS
            if (bytes.length > 8192)
                throw new Error('input is too large');
            // For curves with nBitLength % 8 !== 0: bits2octets(bits2octets(m)) !== bits2octets(m)
            // for some cases, since bytes.length * 8 is not actual bitLength.
            const num = utils_bytesToNumberBE(bytes); // check for == u8 done here
            const delta = bytes.length * 8 - fnBits; // truncate to nBitLength leftmost bits
            return delta > 0 ? num >> BigInt(delta) : num;
        };
    const bits2int_modN = ecdsaOpts.bits2int_modN ||
        function bits2int_modN_def(bytes) {
            return Fn.create(bits2int(bytes)); // can't use bytesToNumberBE here
        };
    // Pads output with zero as per spec
    const ORDER_MASK = utils_bitMask(fnBits);
    /** Converts to bytes. Checks if num in `[0..ORDER_MASK-1]` e.g.: `[0..2^256-1]`. */
    function int2octets(num) {
        // IMPORTANT: the check ensures working for case `Fn.BYTES != Fn.BITS * 8`
        aInRange('num < 2^' + fnBits, num, weierstrass_0n, ORDER_MASK);
        return Fn.toBytes(num);
    }
    function validateMsgAndHash(message, prehash) {
        _abytes2(message, undefined, 'message');
        return prehash ? _abytes2(hash(message), undefined, 'prehashed message') : message;
    }
    /**
     * Steps A, D of RFC6979 3.2.
     * Creates RFC6979 seed; converts msg/privKey to numbers.
     * Used only in sign, not in verify.
     *
     * Warning: we cannot assume here that message has same amount of bytes as curve order,
     * this will be invalid at least for P521. Also it can be bigger for P224 + SHA256.
     */
    function prepSig(message, privateKey, opts) {
        if (['recovered', 'canonical'].some((k) => k in opts))
            throw new Error('sign() legacy options not supported');
        const { lowS, prehash, extraEntropy } = validateSigOpts(opts, defaultSigOpts);
        message = validateMsgAndHash(message, prehash); // RFC6979 3.2 A: h1 = H(m)
        // We can't later call bits2octets, since nested bits2int is broken for curves
        // with fnBits % 8 !== 0. Because of that, we unwrap it here as int2octets call.
        // const bits2octets = (bits) => int2octets(bits2int_modN(bits))
        const h1int = bits2int_modN(message);
        const d = _normFnElement(Fn, privateKey); // validate secret key, convert to bigint
        const seedArgs = [int2octets(d), int2octets(h1int)];
        // extraEntropy. RFC6979 3.6: additional k' (optional).
        if (extraEntropy != null && extraEntropy !== false) {
            // K = HMAC_K(V || 0x00 || int2octets(x) || bits2octets(h1) || k')
            // gen random bytes OR pass as-is
            const e = extraEntropy === true ? randomBytes(lengths.secretKey) : extraEntropy;
            seedArgs.push(utils_ensureBytes('extraEntropy', e)); // check for being bytes
        }
        const seed = concatBytes(...seedArgs); // Step D of RFC6979 3.2
        const m = h1int; // NOTE: no need to call bits2int second time here, it is inside truncateHash!
        // Converts signature params into point w r/s, checks result for validity.
        // To transform k => Signature:
        // q = k⋅G
        // r = q.x mod n
        // s = k^-1(m + rd) mod n
        // Can use scalar blinding b^-1(bm + bdr) where b ∈ [1,q−1] according to
        // https://tches.iacr.org/index.php/TCHES/article/view/7337/6509. We've decided against it:
        // a) dependency on CSPRNG b) 15% slowdown c) doesn't really help since bigints are not CT
        function k2sig(kBytes) {
            // RFC 6979 Section 3.2, step 3: k = bits2int(T)
            // Important: all mod() calls here must be done over N
            const k = bits2int(kBytes); // mod n, not mod p
            if (!Fn.isValidNot0(k))
                return; // Valid scalars (including k) must be in 1..N-1
            const ik = Fn.inv(k); // k^-1 mod n
            const q = Point.BASE.multiply(k).toAffine(); // q = k⋅G
            const r = Fn.create(q.x); // r = q.x mod n
            if (r === weierstrass_0n)
                return;
            const s = Fn.create(ik * Fn.create(m + r * d)); // Not using blinding here, see comment above
            if (s === weierstrass_0n)
                return;
            let recovery = (q.x === r ? 0 : 2) | Number(q.y & weierstrass_1n); // recovery bit (2 or 3, when q.x > n)
            let normS = s;
            if (lowS && isBiggerThanHalfOrder(s)) {
                normS = Fn.neg(s); // if lowS was passed, ensure s is always
                recovery ^= 1; // // in the bottom half of N
            }
            return new Signature(r, normS, recovery); // use normS, not s
        }
        return { seed, k2sig };
    }
    /**
     * Signs message hash with a secret key.
     *
     * ```
     * sign(m, d) where
     *   k = rfc6979_hmac_drbg(m, d)
     *   (x, y) = G × k
     *   r = x mod n
     *   s = (m + dr) / k mod n
     * ```
     */
    function sign(message, secretKey, opts = {}) {
        message = utils_ensureBytes('message', message);
        const { seed, k2sig } = prepSig(message, secretKey, opts); // Steps A, D of RFC6979 3.2.
        const drbg = createHmacDrbg(hash.outputLen, Fn.BYTES, hmac);
        const sig = drbg(seed, k2sig); // Steps B, C, D, E, F, G
        return sig;
    }
    function tryParsingSig(sg) {
        // Try to deduce format
        let sig = undefined;
        const isHex = typeof sg === 'string' || isBytes(sg);
        const isObj = !isHex &&
            sg !== null &&
            typeof sg === 'object' &&
            typeof sg.r === 'bigint' &&
            typeof sg.s === 'bigint';
        if (!isHex && !isObj)
            throw new Error('invalid signature, expected Uint8Array, hex string or Signature instance');
        if (isObj) {
            sig = new Signature(sg.r, sg.s);
        }
        else if (isHex) {
            try {
                sig = Signature.fromBytes(utils_ensureBytes('sig', sg), 'der');
            }
            catch (derError) {
                if (!(derError instanceof DER.Err))
                    throw derError;
            }
            if (!sig) {
                try {
                    sig = Signature.fromBytes(utils_ensureBytes('sig', sg), 'compact');
                }
                catch (error) {
                    return false;
                }
            }
        }
        if (!sig)
            return false;
        return sig;
    }
    /**
     * Verifies a signature against message and public key.
     * Rejects lowS signatures by default: see {@link ECDSAVerifyOpts}.
     * Implements section 4.1.4 from https://www.secg.org/sec1-v2.pdf:
     *
     * ```
     * verify(r, s, h, P) where
     *   u1 = hs^-1 mod n
     *   u2 = rs^-1 mod n
     *   R = u1⋅G + u2⋅P
     *   mod(R.x, n) == r
     * ```
     */
    function verify(signature, message, publicKey, opts = {}) {
        const { lowS, prehash, format } = validateSigOpts(opts, defaultSigOpts);
        publicKey = utils_ensureBytes('publicKey', publicKey);
        message = validateMsgAndHash(utils_ensureBytes('message', message), prehash);
        if ('strict' in opts)
            throw new Error('options.strict was renamed to lowS');
        const sig = format === undefined
            ? tryParsingSig(signature)
            : Signature.fromBytes(utils_ensureBytes('sig', signature), format);
        if (sig === false)
            return false;
        try {
            const P = Point.fromBytes(publicKey);
            if (lowS && sig.hasHighS())
                return false;
            const { r, s } = sig;
            const h = bits2int_modN(message); // mod n, not mod p
            const is = Fn.inv(s); // s^-1 mod n
            const u1 = Fn.create(h * is); // u1 = hs^-1 mod n
            const u2 = Fn.create(r * is); // u2 = rs^-1 mod n
            const R = Point.BASE.multiplyUnsafe(u1).add(P.multiplyUnsafe(u2)); // u1⋅G + u2⋅P
            if (R.is0())
                return false;
            const v = Fn.create(R.x); // v = r.x mod n
            return v === r;
        }
        catch (e) {
            return false;
        }
    }
    function recoverPublicKey(signature, message, opts = {}) {
        const { prehash } = validateSigOpts(opts, defaultSigOpts);
        message = validateMsgAndHash(message, prehash);
        return Signature.fromBytes(signature, 'recovered').recoverPublicKey(message).toBytes();
    }
    return Object.freeze({
        keygen,
        getPublicKey,
        getSharedSecret,
        utils,
        lengths,
        Point,
        sign,
        verify,
        recoverPublicKey,
        Signature,
        hash,
    });
}
/** @deprecated use `weierstrass` in newer releases */
function weierstrassPoints(c) {
    const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c);
    const Point = weierstrassN(CURVE, curveOpts);
    return _weierstrass_new_output_to_legacy(c, Point);
}
function _weierstrass_legacy_opts_to_new(c) {
    const CURVE = {
        a: c.a,
        b: c.b,
        p: c.Fp.ORDER,
        n: c.n,
        h: c.h,
        Gx: c.Gx,
        Gy: c.Gy,
    };
    const Fp = c.Fp;
    let allowedLengths = c.allowedPrivateKeyLengths
        ? Array.from(new Set(c.allowedPrivateKeyLengths.map((l) => Math.ceil(l / 2))))
        : undefined;
    const Fn = Field(CURVE.n, {
        BITS: c.nBitLength,
        allowedLengths: allowedLengths,
        modFromBytes: c.wrapPrivateKey,
    });
    const curveOpts = {
        Fp,
        Fn,
        allowInfinityPoint: c.allowInfinityPoint,
        endo: c.endo,
        isTorsionFree: c.isTorsionFree,
        clearCofactor: c.clearCofactor,
        fromBytes: c.fromBytes,
        toBytes: c.toBytes,
    };
    return { CURVE, curveOpts };
}
function _ecdsa_legacy_opts_to_new(c) {
    const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c);
    const ecdsaOpts = {
        hmac: c.hmac,
        randomBytes: c.randomBytes,
        lowS: c.lowS,
        bits2int: c.bits2int,
        bits2int_modN: c.bits2int_modN,
    };
    return { CURVE, curveOpts, hash: c.hash, ecdsaOpts };
}
function _legacyHelperEquat(Fp, a, b) {
    /**
     * y² = x³ + ax + b: Short weierstrass curve formula. Takes x, returns y².
     * @returns y²
     */
    function weierstrassEquation(x) {
        const x2 = Fp.sqr(x); // x * x
        const x3 = Fp.mul(x2, x); // x² * x
        return Fp.add(Fp.add(x3, Fp.mul(x, a)), b); // x³ + a * x + b
    }
    return weierstrassEquation;
}
function _weierstrass_new_output_to_legacy(c, Point) {
    const { Fp, Fn } = Point;
    function isWithinCurveOrder(num) {
        return inRange(num, weierstrass_1n, Fn.ORDER);
    }
    const weierstrassEquation = _legacyHelperEquat(Fp, c.a, c.b);
    return Object.assign({}, {
        CURVE: c,
        Point: Point,
        ProjectivePoint: Point,
        normPrivateKeyToScalar: (key) => _normFnElement(Fn, key),
        weierstrassEquation,
        isWithinCurveOrder,
    });
}
function _ecdsa_new_output_to_legacy(c, _ecdsa) {
    const Point = _ecdsa.Point;
    return Object.assign({}, _ecdsa, {
        ProjectivePoint: Point,
        CURVE: Object.assign({}, c, modular_nLength(Point.Fn.ORDER, Point.Fn.BITS)),
    });
}
// _ecdsa_legacy
function weierstrass(c) {
    const { CURVE, curveOpts, hash, ecdsaOpts } = _ecdsa_legacy_opts_to_new(c);
    const Point = weierstrassN(CURVE, curveOpts);
    const signs = ecdsa(Point, hash, ecdsaOpts);
    return _ecdsa_new_output_to_legacy(c, signs);
}
//# sourceMappingURL=weierstrass.js.map
;// CONCATENATED MODULE: ./node_modules/@noble/curves/esm/_shortw_utils.js
/**
 * Utilities for short weierstrass curves, combined with noble-hashes.
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */

/** connects noble-curves to noble-hashes */
function getHash(hash) {
    return { hash };
}
/** @deprecated use new `weierstrass()` and `ecdsa()` methods */
function createCurve(curveDef, defHash) {
    const create = (hash) => weierstrass({ ...curveDef, hash: hash });
    return { ...create(defHash), create };
}
//# sourceMappingURL=_shortw_utils.js.map
;// CONCATENATED MODULE: ./node_modules/@noble/curves/esm/nist.js
/**
 * Internal module for NIST P256, P384, P521 curves.
 * Do not use for now.
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */





// p = 2n**224n * (2n**32n-1n) + 2n**192n + 2n**96n - 1n
// a = Fp256.create(BigInt('-3'));
const p256_CURVE = {
    p: BigInt('0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff'),
    n: BigInt('0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551'),
    h: BigInt(1),
    a: BigInt('0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc'),
    b: BigInt('0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b'),
    Gx: BigInt('0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296'),
    Gy: BigInt('0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5'),
};
// p = 2n**384n - 2n**128n - 2n**96n + 2n**32n - 1n
const p384_CURVE = {
    p: BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000ffffffff'),
    n: BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973'),
    h: BigInt(1),
    a: BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000fffffffc'),
    b: BigInt('0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef'),
    Gx: BigInt('0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7'),
    Gy: BigInt('0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f'),
};
// p = 2n**521n - 1n
const p521_CURVE = {
    p: BigInt('0x1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
    n: BigInt('0x01fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa51868783bf2f966b7fcc0148f709a5d03bb5c9b8899c47aebb6fb71e91386409'),
    h: BigInt(1),
    a: BigInt('0x1fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc'),
    b: BigInt('0x0051953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00'),
    Gx: BigInt('0x00c6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66'),
    Gy: BigInt('0x011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650'),
};
const Fp256 = Field(p256_CURVE.p);
const Fp384 = Field(p384_CURVE.p);
const Fp521 = Field(p521_CURVE.p);
function createSWU(Point, opts) {
    const map = mapToCurveSimpleSWU(Point.Fp, opts);
    return (scalars) => map(scalars[0]);
}
/** NIST P256 (aka secp256r1, prime256v1) curve, ECDSA and ECDH methods. */
const p256 = createCurve({ ...p256_CURVE, Fp: Fp256, lowS: false }, sha2_sha256);
/** Hashing / encoding to p256 points / field. RFC 9380 methods. */
const nist_p256_hasher = /* @__PURE__ */ (/* unused pure expression or super */ null && ((() => {
    return createHasher(p256.Point, createSWU(p256.Point, {
        A: p256_CURVE.a,
        B: p256_CURVE.b,
        Z: p256.Point.Fp.create(BigInt('-10')),
    }), {
        DST: 'P256_XMD:SHA-256_SSWU_RO_',
        encodeDST: 'P256_XMD:SHA-256_SSWU_NU_',
        p: p256_CURVE.p,
        m: 1,
        k: 128,
        expand: 'xmd',
        hash: sha256,
    });
})()));
// export const p256_oprf: OPRF = createORPF({
//   name: 'P256-SHA256',
//   Point: p256.Point,
//   hash: sha256,
//   hashToGroup: p256_hasher.hashToCurve,
//   hashToScalar: p256_hasher.hashToScalar,
// });
/** NIST P384 (aka secp384r1) curve, ECDSA and ECDH methods. */
const p384 = createCurve({ ...p384_CURVE, Fp: Fp384, lowS: false }, sha2_sha384);
/** Hashing / encoding to p384 points / field. RFC 9380 methods. */
const p384_hasher = /* @__PURE__ */ (/* unused pure expression or super */ null && ((() => {
    return createHasher(p384.Point, createSWU(p384.Point, {
        A: p384_CURVE.a,
        B: p384_CURVE.b,
        Z: p384.Point.Fp.create(BigInt('-12')),
    }), {
        DST: 'P384_XMD:SHA-384_SSWU_RO_',
        encodeDST: 'P384_XMD:SHA-384_SSWU_NU_',
        p: p384_CURVE.p,
        m: 1,
        k: 192,
        expand: 'xmd',
        hash: sha384,
    });
})()));
// export const p384_oprf: OPRF = createORPF({
//   name: 'P384-SHA384',
//   Point: p384.Point,
//   hash: sha384,
//   hashToGroup: p384_hasher.hashToCurve,
//   hashToScalar: p384_hasher.hashToScalar,
// });
// const Fn521 = Field(p521_CURVE.n, { allowedScalarLengths: [65, 66] });
/** NIST P521 (aka secp521r1) curve, ECDSA and ECDH methods. */
const p521 = createCurve({ ...p521_CURVE, Fp: Fp521, lowS: false, allowedPrivateKeyLengths: [130, 131, 132] }, sha2_sha512);
/** @deprecated use `p256` for consistency with `p256_hasher` */
const secp256r1 = (/* unused pure expression or super */ null && (p256));
/** @deprecated use `p384` for consistency with `p384_hasher` */
const secp384r1 = (/* unused pure expression or super */ null && (p384));
/** @deprecated use `p521` for consistency with `p521_hasher` */
const secp521r1 = (/* unused pure expression or super */ null && (p521));
/** Hashing / encoding to p521 points / field. RFC 9380 methods. */
const p521_hasher = /* @__PURE__ */ (/* unused pure expression or super */ null && ((() => {
    return createHasher(p521.Point, createSWU(p521.Point, {
        A: p521_CURVE.a,
        B: p521_CURVE.b,
        Z: p521.Point.Fp.create(BigInt('-4')),
    }), {
        DST: 'P521_XMD:SHA-512_SSWU_RO_',
        encodeDST: 'P521_XMD:SHA-512_SSWU_NU_',
        p: p521_CURVE.p,
        m: 1,
        k: 256,
        expand: 'xmd',
        hash: sha512,
    });
})()));
// export const p521_oprf: OPRF = createORPF({
//   name: 'P521-SHA512',
//   Point: p521.Point,
//   hash: sha512,
//   hashToGroup: p521_hasher.hashToCurve,
//   hashToScalar: p521_hasher.hashToScalar, // produces L=98 just like in RFC
// });
//# sourceMappingURL=nist.js.map
;// CONCATENATED MODULE: ./node_modules/@noble/curves/esm/p256.js
/**
 * NIST secp256r1 aka p256.
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */


/** @deprecated use `import { p256 } from '@noble/curves/nist.js';` */
const p256_p256 = p256;
/** @deprecated use `import { p256 } from '@noble/curves/nist.js';` */
const p256_secp256r1 = (/* unused pure expression or super */ null && (p256n));
/** @deprecated use `import { p256_hasher } from '@noble/curves/nist.js';` */
const hashToCurve = /* @__PURE__ */ (/* unused pure expression or super */ null && ((() => p256_hasher.hashToCurve)()));
/** @deprecated use `import { p256_hasher } from '@noble/curves/nist.js';` */
const encodeToCurve = /* @__PURE__ */ (/* unused pure expression or super */ null && ((() => p256_hasher.encodeToCurve)()));
//# sourceMappingURL=p256.js.map

/***/ })

};
;