'use strict'
var test = require('tape').test
var BitcoinVarInt = require('../')

test('encode', function (t) {
  t.test('0xfc', function (t) {
    t.same(BitcoinVarInt.encode(0xfc).toString('hex'), 'fc')
    t.same(BitcoinVarInt.encode.bytes, 1)
    t.end()
  })

  t.test('0xfd', function (t) {
    t.same(BitcoinVarInt.encode(0xfd).toString('hex'), 'fdfd00')
    t.same(BitcoinVarInt.encode.bytes, 3)
    t.end()
  })

  t.test('0xffff', function (t) {
    t.same(BitcoinVarInt.encode(0xffff).toString('hex'), 'feffff0000')
    t.same(BitcoinVarInt.encode.bytes, 5)
    t.end()
  })

  t.test('0xffffffff', function (t) {
    t.same(BitcoinVarInt.encode(0xffffffff).toString('hex'), 'ffffffffff00000000')
    t.same(BitcoinVarInt.encode.bytes, 9)
    t.end()
  })

  t.test('-1', function (t) {
    t.throws(function () {
      BitcoinVarInt.encode(-1)
    }, new RangeError('value out of range'))
    t.end()
  })

  t.test('write to buffer with offset', function (t) {
    var buffer = new Buffer([0x00, 0x00])
    t.same(BitcoinVarInt.encode(0xfc, buffer, 1).toString('hex'), '00fc')
    t.same(BitcoinVarInt.encode.bytes, 1)
    t.end()
  })

  t.test('should be a buffer', function (t) {
    t.throws(function () {
      BitcoinVarInt.encode(0, [])
    }, new TypeError('buffer must be a Buffer instance'))
    t.end()
  })

  t.end()
})

test('decode', function (t) {
  t.test('0xfc', function (t) {
    t.same(BitcoinVarInt.decode(new Buffer('fc', 'hex')), 0xfc)
    t.same(BitcoinVarInt.decode.bytes, 1)
    t.end()
  })

  t.test('0xfdf00f', function (t) {
    t.same(BitcoinVarInt.decode(new Buffer('fdf00f', 'hex')), 0x0ff0)
    t.same(BitcoinVarInt.decode.bytes, 3)
    t.end()
  })

  t.test('0xfef00fecba', function (t) {
    t.same(BitcoinVarInt.decode(new Buffer('fef00fecba', 'hex')), 0xbaec0ff0)
    t.same(BitcoinVarInt.decode.bytes, 5)
    t.end()
  })

  t.test('0xff000000ff00000000', function (t) {
    t.same(BitcoinVarInt.decode(new Buffer('ff000000ff00000000', 'hex')), 0xff000000)
    t.same(BitcoinVarInt.decode.bytes, 9)
    t.end()
  })

  t.test('0xffffffffff00002000 throws Error', function (t) {
    t.throws(function () {
      BitcoinVarInt.decode(new Buffer('ffffffffff00002000', 'hex'))
    }, new RangeError('value out of range'))
    t.end()
  })

  t.test('read from buffer with offset', function (t) {
    var buffer = new Buffer([0x00, 0xfc])
    t.same(BitcoinVarInt.decode(buffer, 1), 0xfc)
    t.same(BitcoinVarInt.encode.bytes, 1)
    t.end()
  })

  t.test('should be a buffer', function (t) {
    t.throws(function () {
      BitcoinVarInt.decode([])
    }, new TypeError('buffer must be a Buffer instance'))
    t.end()
  })

  t.end()
})

test('encodingLength', function (t) {
  t.test('-1', function (t) {
    t.throws(function () {
      BitcoinVarInt.encodingLength(-1)
    }, new RangeError('value out of range'))
    t.end()
  })

  t.test('2**53', function (t) {
    t.throws(function () {
      BitcoinVarInt.encodingLength(9007199254740992)
    }, new RangeError('value out of range'))
    t.end()
  })

  t.test('0.1', function (t) {
    t.throws(function () {
      BitcoinVarInt.encodingLength(0.1)
    }, new RangeError('value out of range'))
    t.end()
  })

  t.test('0', function (t) {
    t.same(BitcoinVarInt.encodingLength(0), 1)
    t.end()
  })

  t.test('0xfc', function (t) {
    t.same(BitcoinVarInt.encodingLength(0xfc), 1)
    t.end()
  })

  t.test('0xfd', function (t) {
    t.same(BitcoinVarInt.encodingLength(0xfd), 3)
    t.end()
  })

  t.test('0xffff', function (t) {
    t.same(BitcoinVarInt.encodingLength(0xffff), 5)
    t.end()
  })

  t.test('0xffffffff', function (t) {
    t.same(BitcoinVarInt.encodingLength(0xffffffff), 9)
    t.end()
  })

  t.end()
})
