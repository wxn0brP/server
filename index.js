const args = process.argv.slice(2);
if(args.length == 1){
    const arg = args[0];
    if(arg == "-h" || arg == "--help"){
        console.log(`
Usage: ${process.argv[1]} <path> <port>
path: Path to serve, relative to current directory
port: Port to listen on, defaults to 8080
        `.trim());
        process.exit(0);
    }
}

const red = "\x1b[31m";
const clear = "\x1b[0m";
const green = "\x1b[32m";
const cyan = "\x1b[36m";

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const inputPath = args[0] || "";
const basePath = path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
const port = args[1] || 8080;

if(!fs.existsSync(basePath)){
    console.log(red + "Invalid path: " + basePath + clear);
    process.exit(1);
}

app.use(async (req, res, next) => {
    const requestedPath = path.join(basePath, req.path);

    try{
        const stats = await fs.promises.stat(requestedPath);

        if(!stats.isDirectory())
            return next();

        const indexFile = path.join(requestedPath, "index.html");

        try{
            await fs.promises.access(indexFile, fs.constants.F_OK);
        }catch{
            // Index file not found, return directory listing
            const files = await fs.promises.readdir(requestedPath, { withFileTypes: true });

            const fileList = files.map(file => {
                const encodedName = encodeURIComponent(file.name);
                const href = path.join(req.path, encodedName);
                const flag = file.isDirectory() ? "[DIR]" : "[FILE]";
                return `
                    <li>
                        <a href="${href}">
                            ${flag} ${file.name}
                        </a>
                    </li>`;
            });

            res.send(`
                <html>
                    <head>
                        <title>Index of ${req.path}</title>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body{
                                font-family: Arial, sans-serif;
                                background-color: #222;
                                color: white;
                            }
                            ul{ list-style: none; padding: 0; }
                            li{ margin: 5px 0; }
                            a{ text-decoration: none; color: white; }
                            a:hover{ text-decoration: underline; }
                        </style>
                    </head>
                    <body>
                        <h1>Index of ${req.path}</h1>
                        Files and directories count: ${fileList.length}
                        <ul>
                            <li><a href="../">[RETURN] ..</a></li>
                            ${fileList.join("")}
                            <li><a href="../">[RETURN] ..</a></li>
                        </ul>
                    </body>
                </html>
            `);
            return;
        }
    }catch{}
    return next();
});

app.use(express.static(basePath));

app.use((req, res) => {
    res.status(404).send("<style>body{ background-color: #222; color: white; }</style>404 Not found");
});

app.listen(port, () => {
    const link = "http://localhost:" + port;
    const maxLength = Math.max(link.length, basePath.length + 7);

    console.log("/" + pad("", maxLength + 2, "-") + "\\");
    console.log("| " + green + pad(link, maxLength) + clear + " |");
    console.log("| " + cyan + pad("Path: " + basePath, maxLength) + clear + " |");
    console.log("\\" + pad("", maxLength + 2, "-") + "/");
});

function pad(str, length, char=" "){
    while(str.length < length)
        str += char;
    
    return str;
}
