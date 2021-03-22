let tarInstall = require('..')
let tarUrl = require('tar-url')
let path = require('path')
let fs = require('saxon/sync')

let dep = process.argv[2] || 'lodash'
let ver = process.argv[3]
;(async function() {
  let url = await tarUrl(dep, ver)
  let dest = __dirname + '/' + path.basename(url, '.tgz')
  fs.remove(dest, true)
  console.log('Installing: ' + url)
  let started = Date.now()
  await tarInstall(url, __dirname)
  console.log('Installed in ' + (Date.now() - started) + ' ms')
})()

