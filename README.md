# tar-install

```js
const install = require('tar-install')

// Any .tgz url works
const url = 'https://registry.npmjs.org/lodash/-/lodash-4.17.5.tgz'

// Pass which directory to install into
await install(url, '/path/to/parent')
```

Per the example above, `lodash` would be installed at `/path/to/parent/lodash-4.17.5`.
The `install` promise resolves with the destination path.

The root directory is created if it doesn't exist, and it defaults to the working directory.

You can use https://github.com/aleclarson/tar-url to obtain the url.

Run `node test <name> <version>` to try it out. The package is installed in the `test`
directory. Both `name` and `version` are optional. The default is latest version of
`lodash`.
