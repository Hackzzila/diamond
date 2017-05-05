'use strict';

const fs = require('fs-extra');
const log = require('npmlog');
const path = require('path');
const async = require('async');
const program = require('commander');
const lockfile = require('proper-lockfile');
const archy = require('archy');
const version = require('../../package.json').version;
const install = require('../functions/install');
const parsePackageString = require('../functions/parsePackageString');
const parsePackageObject = require('../functions/parsePackageObject');

program
  .version(version)
  .option('--beta-namespacing', 'Enable namespacing beta')
  .option('--no-save', 'Don\'t save packages in your package.json')
  .option('--no-cache', 'Don\'t pull packages from the package cache')
  .parse(process.argv);

const pkgs = program.args;

log.heading = 'dia';

let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync('./package.json'));
} catch (err) {
  packageJson = {};
  log.info('no package.json found');
}

packageJson = Object.assign({ diamond: { dependencies: {} } }, packageJson);
if (!packageJson.diamond.dependencies) packageJson.diamond.dependencies = {};

log.enableProgress();

const packages = [];
for (const pkg of pkgs) {
  const source = parsePackageString(pkg);
  if (source) {
    packages.push({
      name: source.name,
      version: source.version,
      path: null,
      for: null,
      source,
    });
  } else {
    log.error('invalid package', pkg);
    log.error('not ok');
    process.exit(1);
  }
}

if (!packages.length) {
  for (const source of parsePackageObject(packageJson.diamond.dependencies)) {
    packages.push({
      name: source.name,
      version: source.version,
      path: null,
      for: null,
      source,
    });
  }
}

if (!packages.length) {
  log.info('no packages to install');
  process.exit(0);
}

fs.ensureDirSync('./diamond/packages');
fs.ensureFileSync('./diamond/.internal/packages.lock');

if (!fs.existsSync('./diamond/index.js')) fs.copySync(path.join(__dirname, '../importers/sass.js'), './diamond/index.js');

const release = lockfile.lockSync('./diamond/.internal/packages.lock');

let label;
if (packageJson.name && packageJson.version) {
  label = `${packageJson.name}@${packageJson.version} ${process.cwd()}`;
} else if (packageJson.name) {
  label = `${packageJson.name} ${process.cwd()}`;
} else {
  label = process.cwd();
}

const tree = {
  label,
  nodes: [],
};

async.each(packages, (pkg, done) => {
  log.pause();
  log.gauge.enable();
  install(pkg, program).then((data) => {
    tree.nodes.push(data[0]);

    pkg = data[1];
    if (program.save) {
      if (pkg.source.type === 'npm') {
        packageJson.diamond.dependencies[pkg.name] = `^${pkg.version}`;
      } else {
        packageJson.diamond.dependencies[pkg.name] = `${pkg.source.type}:${pkg.source.owner}/${pkg.source.repo}${pkg.source.ref ? `#${pkg.source.ref}` : ''}`;
      }
    }

    done();
  });
}, () => {
  let autoload = '';
  const installed = JSON.parse(fs.readFileSync('./diamond/.internal/packages.lock'));
  for (const installedPkg of installed) {
    if (!installedPkg.for && fs.existsSync(path.join(process.cwd(), 'diamond/packages', installedPkg.path, 'diamond/dist/main.css'))) {
      autoload += `${fs.readFileSync(path.join(process.cwd(), 'diamond/packages', installedPkg.path, 'diamond/dist/main.css'))}\n\n`;
    } else if (!installedPkg.for && installedPkg.main.endsWith('.css')) {
      autoload += `${fs.readFileSync(path.join(process.cwd(), 'diamond/packages', installedPkg.path, installedPkg.main))}\n\n`;
    }
  }

  fs.writeFileSync('./diamond/autoload.css', autoload.trim());

  release();
  if (program.save) fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

  process.stderr.write(`${archy(tree)}\n`);
  log.resume();
  process.exit(0);
});
