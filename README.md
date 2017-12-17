# `secure-read-key`

[![Build Status](https://travis-ci.org/emilbayes/secure-read-key.svg?branch=master)](https://travis-ci.org/emilbayes/secure-read-key)

> Read a key safely into a secure, read-only Buffer

A piece in the puzzle towards [`secure-key-management`](https://github.com/emilbayes/secure-key-management)

## Usage

```js
var readKey = require('secure-read-key')

var destroy = readKey(32, 'keypair.secret', function (err, key) {
  if (err) throw err

  // key is read-only, any writes to `key` will kill our program

  // Once we're done with the key, let's destroy it
  destroy()

  // Any further access to `key` will kill our program
})
```

**:warning: Warnings:**

* The key is read-only. Any writes to it will crash your program with no mercy
* Once the key is destroyed, any access to it (whether read or write) will
  crash your program with no mercy

## API

### `var destroy = readKey(bytes, path, cb(err, secureKeyBuf))`

`bytes` must be a safe integer at least 0, `path` must be a valid 1st argument
to [`fs.open`](https://nodejs.org/api/fs.html#fs_fs_open_path_flags_mode_callback)
and `cb` must be given.

Causes of error can be:

* The file cannot be opened in read mode (maybe the file doesn't exist or is a dir)
* The file cannot be read
* The number of bytes read did not match the expected number of bytes

Note that the `secureKeyBuf` looks like a normal `Buffer`, but has some extra
properties. It will be wiped clean in case of a core dump, it will always stay
in volatile memory (no swap), it will crash the process if anyone tries to
write to it and it will also be overwritten when garbage collected. Also be wary
about using any of the default Buffer operations on this secure Buffer.
[Further documentation on memory protection in `sodium-native`](https://github.com/sodium-friends/sodium-native#memory-protection)

To explicitly release the key and it's content, call the returned `destroy`
method, which will safely wipe the key from memory and mark it for no access,
to prevent any accidental misuse.

## Install

```sh
npm install secure-read-key
```

## License

[ISC](LICENSE)
