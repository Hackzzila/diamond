const os = require('os');
const opn = require('opn');
const log = require('npmlog');
const path = require('path');
const fs = require('fs-extra');
const express = require('express');
const superagent = require('superagent');
const mustacheExpress = require('mustache-express');

const app = express();

app.engine('html', mustacheExpress());
app.set('view engine', 'mustache');
log.heading = 'dia';

app.get('/', (req, res) => {
  res.redirect('https://github.com/login/oauth/authorize?client_id=756bdbe9672e9c6bd2cc');
});

app.get('/authorize/github', (req, res) => {
  if (req.query.error) {
    return res.render(path.join(__dirname, '../views/error.html'), { error: req.query.error }, (_, html) => {
      res.send(html);
      process.exit(0);
    });
  }

  if (!req.query.code) {
    return res.render(path.join(__dirname, '../views/error.html'), { error: 'No code.' }, (_, html) => {
      res.send(html);
      process.exit(0);
    });
  }

  superagent.get(`https://diamondpkg-oauth.herokuapp.com/authenticate/${req.query.code}`)
    .then((r) => {
      if (r.body.error) {
        return res.render(path.join(__dirname, '../views/error.html'), { error: r.body.error }, (_, html) => {
          res.send(html);
          process.exit(0);
        });
      }

      if (!r.body.token) {
        return res.render(path.join(__dirname, '../views/error.html'), { error: 'Authorization Error.' }, (_, html) => {
          res.send(html);
          process.exit(0);
        });
      }

      fs.ensureFile(path.join(os.homedir(), '.diamond/auth.json'), (error) => {
        if (error) {
          return res.render(path.join(__dirname, '../views/error.html'), { error: error.message }, (_, html) => {
            res.send(html);
            process.exit(0);
          });
        }

        fs.readFile(path.join(os.homedir(), '.diamond/auth.json'), (err, contents) => {
          if (err) {
            return res.render(path.join(__dirname, '../views/error.html'), { error: err.message }, (_, html) => {
              res.send(html);
              process.exit(0);
            });
          }

          let auth;
          try {
            auth = JSON.parse(contents);
          } catch (_) {
            auth = {};
          }

          auth.github = r.body.token;

          fs.writeFile(path.join(os.homedir(), '.diamond/auth.json'), JSON.stringify(auth), (e) => {
            if (e) {
              return res.render(path.join(__dirname, '../views/error.html'), { error: err.message }, (_, html) => {
                res.send(html);
                process.exit(0);
              });
            }

            return res.render(path.join(__dirname, '../views/success.html'), (_, html) => {
              res.send(html);
              process.exit(0);
            });
          });

          return undefined;
        });

        return undefined;
      });

      return undefined;
    })
    .catch(() => {
      res.render(path.join(__dirname, '../views/error.html'), { error: 'Authorization Error.' }, (_, html) => {
        res.send(html);
        process.exit(0);
      });
    });

  return undefined;
});

app.listen(3031, () => {
  log.info('please open', 'http://localhost:3031');
  opn('http://localhost:3031');
});
