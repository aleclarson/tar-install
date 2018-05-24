const {exec} = require('child_process')
const quest = require('quest')
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

    root = path.resolve(root)
    let name = path.basename(url, ext)
    let dest = path.join(root, name)
    if (await fs.isDir(dest)) {
      return resolve({
        path: dest,
      })
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
    .pipe(unpack(dest))
    .on('error', onError)

    // Install any dependencies.
    .on('finish', () => {
      installDeps(dest).then(resolve, reject)
    })

    function onError(err) {
      this.end()
      reject(err)
    }
  })
}

module.exports = tarInstall

function installDeps(cwd) {
  return new Promise((resolve, reject) => {
    const cmd = 'npm install --production --silent --no-shrinkwrap'
    exec(cmd, {cwd}, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve({
          path: cwd,
          stdout,
          stderr,
        })
      }
    })
  })
}

function unpack(dest) {
  let n = 0
  let dirs = Object.create(null)
  let limit = 50
  let stream = tar.extract()
  return stream.on('entry', async (head, body, next) => {
    let name = path.relative('package', head.name)
    let dir = path.dirname(name)
    if (dir && dirs[dir] == null) {
      await fs.mkdir(path.join(dest, dir))
      dirs[dir] = true
    }
    let file = body.pipe(fs.writer(path.join(dest, name)))
    if (++n == limit) {
      stream.next = next
      file.on('finish', () => {
        if (--n < limit) stream.next()
      })
    } else next()
  })
}
