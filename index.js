var fs = require('fs')
var destroyKey = require('secure-destroy-key')
var sodium = require('sodium-native')
var assert = require('nanoassert')

module.exports = function (bytes, path, cb) {
  assert(typeof bytes === 'number', 'bytes must be number')
  assert(Number.isSafeInteger(bytes), 'bytes must be safe integer')
  assert(bytes >= 0, 'bytes must be at least 0')
  assert(typeof cb === 'function', 'cb must be function')

  var destroyed = false
  var key = sodium.sodium_malloc(bytes)

  fs.open(path, 'r', function (err, fd) {
    if (err) return cb(err)

    if (destroyed === true) return cb(null, key)
    fs.read(fd, key, 0, key.length, 0, function (err, bytesRead, buffer) {
      if (err) return cb(err)
      if (bytesRead !== bytes) return cb(new Error(`Did not read the expected number of bytes. Read ${bytesRead}, expected ${bytes}`))
      sodium.sodium_mprotect_readonly(key)

      // Destroy key again as we may have read bytes into it
      if (destroyed === true) destroy()

      fs.close(fd, function (err) {
        if (err) {
          destroy()
          return cb(err)
        }

        return cb(null, key)
      })
    })
  })

  return destroy

  function destroy () {
    destroyed = true
    destroyKey(key)
  }
}
