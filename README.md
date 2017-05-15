<div align="center">
  <br />
  <p>
    <a href="https://diamond.js.org/" target="_blank">
      <img src="https://diamond.js.org/assets/img/DiamondLogo.svg" width="546" alt="diamond" />
    </a>
  </p>
  <br />
  <p>Logo by <a href="https://github.com/Programmix">@Programmix</a></p>
  <p>
    <a href="https://travis-ci.org/diamondpkg/diamond"><img src="https://travis-ci.org/diamondpkg/diamond.svg?branch=master" alt="Build status" /></a>
    <a href="https://david-dm.org/diamondpkg/diamond" title="dependencies status"><img src="https://david-dm.org/diamondpkg/diamond/status.svg"/></a>
    <img src="https://img.shields.io/node/v/diamondpkg.svg" alt="Node Version" />
    <img src="https://img.shields.io/badge/npm-%3E%3D3.0.0-brightgreen.svg" alt="npm Version" />
  </p>
  <p>
    <a href="https://nodei.co/npm/diamondpkg/"><img src="https://nodei.co/npm/diamondpkg.png?compact=true"></a>
  </p>
</div>

## Supported Environments
diamond supports node 4, 5, 6, and 7 **with npm 3 or 4** (Note: node 4 comes with npm **2**)

## What data we collect
Let's be upfront, we collect data. You will soon be able to limit the data we collect.
All data is anonymous. This data
is **not** shared with anyone outside of the diamond team.

- OS type
- OS name
- OS version
- Node architecture
- Node version
- npm version
- diamond version
- Errors

## Introduction
diamond is a package manager for Sass and Less. diamond allows you to mix and match (most of the time) Sass and
Less packages. You can also ship custom functions to be run after compiling, or even Less plugins and Sass importers
and functions.

## Badge
[![diamond](https://diamond.js.org/badge.svg)](https://diamond.js.org)
Feel free to include this badge in your project.

### Markdown
```markdown
[![diamond](https://diamond.js.org/badge.svg)](https://diamond.js.org)
```

### Image URLs
```
https://diamond.js.org/badge.svg
https://diamond.js.org/badge.png
```

## Installation
Using npm:
```bash
npm i -g diamondpkg
```

Or install the latest version from GitHub:
```bash
npm i -g diamondpkg/diamond
```

## Quick Start
Lets say you want to use Bootstrap in your next project.

### Installing
You can find Bootstrap under the package name `bootstrap`
You install with the `install` command
```bash
diamond install bootstrap
```

This generates a `diamond` folder with all of the packages.
<p class="danger">Do not edit any files in this folder.</p>

### Importing
diamond uses a custom import format when importing packages.

Examples:
* `@import "~bootstrap";` will import the main file from Bootstrap, or throw an error if the package does not have a main file.
* `@import "~bootstrap/file.scss"` will import `file.scss` from the package Bootstrap.

We want to import Bootstrap's main file, so we will use `~bootstrap`
```scss
@import "~bootstrap";

#foo {
  color: white;
}
```

#### CSS
To use with vanilla CSS or another preprocessor, simply link the `diamond/autoload.css` file in your HTML. Compiling is not required with CSS.

### Compiling
#### Sass
Once we have written our sass, we are ready for compiling.

If you try
```bash
node-sass myfile.scss
```
it will give you errors about not being able to find the file `~bootstrap`.
This is because you aren't using diamond's custom importer.

It is recommended to use the compile command to compile your Sass instead of node-sass.
While this is not required, some packages like `concise.css` use functionality only found
in the compile command. You will be warned if you are missing out on features not using
the compile command.

```bash
diamond compile -o output.css input.scss
```

To compile with node-sass, use the `--importer` flag
```bash
node-sass --importer diamond input.scss > output.css
```
where `diamond` is the generated `diamond` folder on install.

#### Less
To compile with Less, either use the compile command, or lessc. (They both have the same features)

##### Compile Command
```bash
diamond compile -o output.css input.less
```

##### lessc
```bash
lessc --diamond input.less output.css
```
This uses `less-plugin-diamond` as a plugin, which is installed when you install diamond.