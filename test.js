var readKey = require('.')
var test = require('tape')
var exec = require('child_process').exec

test('read 16 bytes', function (assert) {
  readKey(16, './package.json', function (err, key) {
    assert.error(err)
    assert.ok(key.length === 16)
    assert.end()
  })
})

test('reads only files', function (assert) {
  readKey(16, '.', function (err, key) {
    assert.ok(err)
    assert.end()
  })
})

test('input args', function (assert) {
  assert.throws(_ => readKey())
  assert.throws(_ => readKey(-1))
  assert.throws(_ => readKey(''))
  assert.throws(_ => readKey(0, './package.json'))
  assert.throws(_ => readKey(0, './package.json', 2))
  assert.end()
})

test('destroy', function (assert) {
  var destroy = readKey(16, '.', function (err, key) {
    assert.ok(key)
    assert.ok(Buffer.isBuffer(key), 'should still be Buffer')
    assert.end()
  })

  destroy()
})

test('read-only', function (assert) {
  readKey(1, './package.json', function (err, key) {
    assert.error(err)
    assert.ok(key, 'should be able to read single byte')

    exec(`node -e 'require(".")(1, "./package.json", function (err, key) { key[0] = 0 })'`, function (err, stdout, stderr) {
      assert.ok(err, 'should be killed by os')
      assert.end()
    })
  })
})

test('use after destroy', function (assert) {
  readKey(1, './package.json', function (err, key) {
    assert.error(err)
    assert.ok(key, 'should be able to read single byte')

    exec(`node -e 'var destroy = require(".")(1, "./package.json", function (err, key) {
      console.log(key[0])
      destroy()
      key[0]
    })'`, function (err, stdout, stderr) {
      assert.equal(stdout, '123\n')
      assert.ok(err, 'should be killed by os')
      assert.end()
    })
  })
})
