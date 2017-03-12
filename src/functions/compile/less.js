'use strict';

const less = require('less');
const log = require('npmlog');
const fs = require('fs-extra');
const lockfile = require('proper-lockfile');
const plugin = require('less-plugin-diamond');

module.exports = filename => new Promise((resolve) => {
  lockfile.unlockSync('./diamond/.internal/packages.lock');

  less.render(fs.readFileSync(filename).toString(), { filename, plugins: [plugin] })
  .then((result) => {
    resolve(result.css.toString());
  }).catch((error) => {
    log.disableProgress();
    log.resume();
    log.error('less', error.message);
    log.error('not ok');
    process.exit(1);
  });
});
