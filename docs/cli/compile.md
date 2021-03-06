## Synopsis
```
diamond compile <input>
diamond compile --output <output> <input>

alias: diamond c
common options: [-o|--output] [--output-style] [-w|--watch]
```

## Description
This command compiles a file with full diamond support (importers, functions, etc.).

## Commands
### **`diamond compile <input>`** 

  Compile the input file and print the resulting CSS to `stdout`.

  #### Example:
  ```
diamond compile in.sass
  ```


### **`diamond compile --output <output> <input>`**

  Compile the input file and put the resulting CSS in the output file.

  #### Example:
  ```
diamond compile --output out.css in.sass
  ```



## Args
### **`-o | --output`**

  The file to save the output CSS to.


### **`-w | --watch`**

  Watches and compiles the file on any changes. Must be used with `--output` arg.


### **`--output-style`** <span class="tag is-warning">Sass only</span>

  The output style for the file, can be one of: `nested, expanded, compact, compressed`.