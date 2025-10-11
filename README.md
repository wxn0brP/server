# Simple Static Server

A lightweight static file server for quick use.

## Installation

```bash
bin add -g github:wxn0brP/server
```

## Usage

```bash
server [PATH or PORT] [PORT or PATH]
```

* All arguments are optional and can be passed in any order.
  * If it’s a number → treated as the `PORT`.
  * Otherwise → treated as the `PATH`.

* Defaults:
  * `PATH` = current directory (`.`)
  * `PORT` = `8080`

### Examples

```bash
server                # Serves ./ on port 8080
server 3000           # Serves ./ on port 3000
server ./public       # Serves ./public on port 8080
server ./public 3000  # Serves ./public on port 3000
server 3000 ./public  # Serves ./public on port 3000
```


## Features

- Serves files from a specified or default directory.
- Automatically generates a file and directory listing if `index.html` is missing.
- Handles spaces and special characters in file or directory names.