let tarInstall = require('..')
let tarUrl = require('tar-url')
let path = require('path')
let fs = require('fsx')

let dep = process.argv[2] || 'lodash'
let ver = process.argv[3]
;(async function() {
  let url = await tarUrl(dep, ver)
  let dest = __dirname + '/' + path.basename(url, '.tgz')
  if (fs.isDir(dest)) fs.removeDir(dest)
  console.log('Installing: ' + url)
  let started = Date.now()
  await tarInstall(url, __dirname)
  console.log('Installed in ' + (Date.now() - started) + ' ms')
})()

