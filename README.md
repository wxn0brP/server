# Simple Static Server

A lightweight static file server for quick use.

## Installation

```bash
yarn global add github:wxn0brP/server#dist
```

## Usage

```bash
server [PATH] [PORT]
```

- `[PATH]` (optional): Directory to serve files from. Defaults to the current directory.
- `[PORT]` (optional): Port number for the server. Defaults to `8080`.

Example:
```bash
server ./public 3000
```

## Features

- Serves files from a specified or default directory.
- Automatically generates a file and directory listing if `index.html` is missing.
- Handles spaces and special characters in file or directory names.