/* eslint-env node, jest */

'use strict';

const fs = require('fs');
const childProcess = require('child_process');
const diamond = require('..');

const libraries = [
  {
    name: 'Sierra',
    folder: 'sierra',
    package: 'sierra',
    install: 'sierra@2.0.0',
  },
  {
    name: 'Sierra (npm)',
    folder: 'sierra-npm',
    package: 'sierra-library',
    install: 'npm:sierra-library@2.0.0',
  },
  {
    name: 'Sierra (GitHub)',
    folder: 'sierra-github',
    package: 'sierra',
    install: 'github:sierra-library/sierra#3c670118d7e0223f697f55c71623334e243e278d',
  },
];

for (const library of libraries) {
  for (const mode of [0, 1, 2]) {
    if (library.folder === 'sierra-github' && mode !== 0) continue;

    describe(`${library.name} (${['Cache Disabled', 'Cache Enabled', 'Offline'][mode]})`, () => {
      test('install', () => {
        const otherArgs = [];
        if (mode === 0) otherArgs.push('--no-cache');
        else if (mode === 2) otherArgs.push('--offline');

        const result = childProcess.spawnSync('diamond', ['i', '--no-save', library.install].concat(otherArgs));
        if (result.status !== 0) {
          throw new Error(`STDOUT:\n${result.stdout}\n\n-----\n\nSTDERR:\n${result.stderr}`);
        }
      });

      test('css', () => {
        expect(fs.readFileSync(`test/${library.folder}/test.css`, 'utf8')).toBe(fs.readFileSync('diamond/autoload.css', 'utf8'));
      });

      for (const minify of [false, true]) {
        describe(minify ? 'Minified' : 'Not Minified', () => {
          describe('CLI', () => {
            for (const lang of ['sass', 'less', 'styl']) {
              test(lang, () => {
                const result = childProcess.spawnSync('diamond', ['c', `test/${library.folder}/test.${lang}`].concat(minify ? ['-m'] : []));
                if (result.status !== 0) {
                  throw new Error(`STDOUT:\n${result.stdout}\n\n-----\n\nSTDERR:\n${result.stderr}`);
                } else {
                  expect(result.stdout.toString()).toBe(fs.readFileSync(`test/${library.folder}/test.${lang}${minify ? '.min' : ''}.css`, 'utf8'));
                }
              });
            }
          });

          describe('Node.JS API', () => {
            for (const lang of ['sass', 'less', 'styl']) {
              describe(lang, () => {
                test('compile()', () => {
                  expect.assertions(1);
                  return diamond.compile(`test/${library.folder}/test.${lang}`, { minify })
                    .then((css) => {
                      expect(css).toBe(fs.readFileSync(`test/${library.folder}/test.${lang}${minify ? '.min' : ''}.css`, 'utf8'));
                    });
                });

                test(`compile.${lang}()`, () => {
                  expect.assertions(1);
                  const data = fs.readFileSync(`test/${library.folder}/test.${lang}`, 'utf8');
                  return diamond.compile[lang](data, { filename: `test/${library.folder}/test.${lang}`, minify })
                    .then((css) => {
                      expect(css).toBe(fs.readFileSync(`test/${library.folder}/test.${lang}${minify ? '.min' : ''}.css`, 'utf8'));
                    });
                });
              });
            }
          });
        });
      }

      describe('uninstall', () => {
        test('uninstall', () => {
          const result = childProcess.spawnSync('diamond', ['u', library.package]);
          if (result.status !== 0) {
            throw new Error(`STDOUT:\n${result.stdout}\n\n-----\n\nSTDERR:\n${result.stderr}`);
          } else {
            expect(fs.existsSync(`diamond/packages/${library.package}`)).toBe(false);
            expect(fs.readFileSync('diamond/autoload.css', 'utf8')).toBe('');
          }
        });
      });
    });
  }
}
