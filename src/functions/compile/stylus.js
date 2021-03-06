/* global cli:false */

'use strict';

const stylus = require('stylus');
const log = require('npmlog');
const fs = require('fs-extra');
const path = require('path');
const async = require('async');
const plugin = require('../../importers');

global.compileCommand = true;

module.exports = file => new Promise((resolve, reject) => {
  let packages;
  try {
    packages = JSON.parse(fs.readFileSync('./diamond/.internal/packages.lock'));
  } catch (err) {
    packages = [];
  }

  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync('./diamond.json'));
  } catch (err) {
    packageJson = {};
    if (cli) log.info('no diamond.json found');
  }

  const plugins = [plugin.stylus];

  if (packageJson && packageJson.unify) {
    plugins.push(require(path.join(process.cwd(), packageJson.unify)).stylus);
  }

  const postProcessors = packages.filter(o => !!o.postProcessor).map(o => require(path.join(process.cwd(), 'diamond/packages', o.path, o.postProcessor)))
  .concat(
    packageJson.postProcessor ?
      [require(path.join(process.cwd(), packageJson.postProcessor))] :
      []
  );

  const style = stylus(fs.readFileSync(file).toString())
    .set('filename', file);

  for (const plug of plugins) {
    style.use(plug);
  }

  style.render((error, css) => {
    if (error) {
      if (cli) {
        log.disableProgress();
        log.resume();
        log.error('styl', error.message);
        log.error('styl', error.stack);
        log.error('not ok');
        process.exit(1);
      } else return reject(error);
    }

    async.eachLimit(postProcessors, 1, (postProcessor, done) => {
      let res;
      try {
        res = postProcessor(css);
      } catch (err) {
        if (cli && typeof err === 'string') {
          log.disableProgress();
          log.resume();
          log.error('post install', err);
          log.error('not ok');
          process.exit(1);
        } else if (cli) {
          log.disableProgress();
          log.resume();
          log.error('post install', err.message);
          log.error('not ok');
          process.exit(1);
        } else return reject(err);
      }

      Promise.resolve(res).then((newCss) => {
        css = newCss;
        done();
      }).catch((err) => {
        if (cli && typeof err === 'string') {
          log.disableProgress();
          log.resume();
          log.error('post install', err);
          log.error('not ok');
          process.exit(1);
        } else if (cli) {
          log.disableProgress();
          log.resume();
          log.error('post install', err.message);
          log.error('not ok');
          process.exit(1);
        } else return reject(err);

        return undefined;
      });

      return undefined;
    }, () => {
      resolve(css);
    });

    return undefined;
  });
});
