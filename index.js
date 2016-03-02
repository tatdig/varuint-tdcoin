'use strict'
function checkUInt53 (n) {
  // Number.MAX_SAFE_INTEGER
  if (n < 0 || n > 9007199254740991 || n % 1 !== 0) throw new RangeError('value out of range')
}

function encode (n, buffer, offset) {
  checkUInt53(n)
  if (!buffer) buffer = new Buffer(encodingLength(n))
  if (!Buffer.isBuffer(buffer)) throw new TypeError('buffer must be a Buffer instance')
  if (!offset) offset = 0
  if (n < 0xfd) {
    buffer.writeUInt8(n, offset)
    encode.bytes = 1
  } else if (n < 0xffff) {
    buffer.writeUInt8(0xfd, offset)
    buffer.writeUInt16LE(n, offset + 1)
    encode.bytes = 3
  } else if (n < 0xffffffff) {
    buffer.writeUInt8(0xfe, offset)
    buffer.writeUInt32LE(n, offset + 1)
    encode.bytes = 5
  } else {
    buffer.writeUInt8(0xff, offset)
    buffer.writeUInt32LE(n >>> 0, offset + 1)
    buffer.writeUInt32LE((n / 0x100000000) | 0, offset + 5)
    encode.bytes = 9
  }
  return buffer
}

function decode (buffer, offset) {
  if (!Buffer.isBuffer(buffer)) throw new TypeError('buffer must be a Buffer instance')
  if (!offset) offset = 0
  var first = buffer.readUInt8(offset)
  if (first < 0xfd) {
    decode.bytes = 1
    return first
  } else if (first === 0xfd) {
    decode.bytes = 3
    return buffer.readUInt16LE(offset + 1)
  } else if (first === 0xfe) {
    decode.bytes = 5
    return buffer.readUInt32LE(offset + 1)
  } else {
    decode.bytes = 9
    var lo = buffer.readUInt32LE(offset + 1)
    var hi = buffer.readUInt32LE(offset + 5)
    var n = hi * 0x0100000000 + lo
    checkUInt53(n)
    return n
  }
}

function encodingLength (n) {
  checkUInt53(n)
  return (
    n < 0xfd ? 1
  : n < 0xffff ? 3
  : n < 0xffffffff ? 5
  : 9
  )
}

module.exports = { encode: encode, decode: decode, encodingLength: encodingLength }
