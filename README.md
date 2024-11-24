# Simple Static Server

A lightweight static file server for quick use.

## Usage

Run a static server in the current directory on a specific port:

```bash
node index.js
```

Then open `http://localhost:8080` in your browser.

### Syntax

```bash
node index.js [PATH] [PORT]
```

- `[PATH]` (optional): Directory to serve files from. Defaults to the current directory.
- `[PORT]` (optional): Port number for the server. Defaults to `8080`.

Example:
```bash
node index.js ./public 3000
```

### Adding to PATH (Optional)

To make the server accessible as a global command:

1. Make the `server` script executable:
   ```bash
   chmod +x server
   ```
2. Edit the `server` script and set `$install_path` to the directory containing `index.js`.
3. Copy the `server` script to a directory in your `$PATH`, such as `/usr/local/bin`:
   ```bash
   cp server /usr/local/bin
   ```

Now you can run:
```bash
server /path/to/directory 8080
```

## Features

- Serves files from a specified or default directory.
- Automatically generates a file and directory listing if `index.html` is missing.
- Handles spaces and special characters in file or directory names.