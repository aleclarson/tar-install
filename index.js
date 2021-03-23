const quest = require('@aleclarson/quest')
const path = require('path')
const zlib = require('zlib')
const tar = require('tar-stream')
const fs = require('saxon')

function tarInstall(url, root) {
  return new Promise(async (resolve, reject) => {
    let ext = path.extname(url)
    if (ext != '.tgz') {
      throw Error('Expected a .tgz url')
    }

    root = path.resolve(root || '')
    let name = path.basename(url, ext)
    let dest = path.join(root, name)
    if (await fs.isDir(dest)) {
      return resolve(dest)
    }

    // Ensure the root exists.
    await fs.mkdir(root)

    // Fetch the tarball
    quest.stream(url)
    .on('error', onError)

    // Decompress it
    .pipe(zlib.createGunzip())
    .on('error', onError)

    // Unpack its contents
    .pipe(unpack(dest, resolve))
    .on('error', onError)

    function onError(err) {
      this.end()
      reject(err)
    }
  })
}

module.exports = tarInstall

function unpack(dest, resolve) {
  let n = 0, limit = 50
  let dirs = Object.create(null)
  let stream = tar.extract()
  let finished = false
  return stream.on('entry', async (head, body, next) => {
    let name = path.relative('package', head.name)

    let dir = path.dirname(name)
    if (dirs[dir] == null) {
      dirs[dir] = true
      await fs.mkdir(path.join(dest, dir))
    }

    // Begin copying the file.
    let file = body.pipe(fs.writer(path.join(dest, name)))

    // Begin the next file immediately, unless we've hit the limit.
    if (++n < limit) next()

    // Begin the next file afterwards if the limit has been hit.
    file.on('finish', () => {
      if (limit == n--) {
        next()
      } else if (n == 0 && finished) {
        resolve(dest)
      }
    })
  }).on('finish', () => {
    finished = true
    if (n == 0) {
      resolve(dest)
    }
  })
}
