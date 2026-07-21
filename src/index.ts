#!/usr/bin/env bun

import FalconFrame from "@wxn0brp/falcon-frame";
import { execSync } from "child_process";
import { existsSync, statSync } from "fs";
import { access, constants, readdir, stat } from "fs/promises";
import { isAbsolute, join, resolve } from "path";
import { loadIfNeeded } from "./suglite";

const args = process.argv.slice(2);
if (args.length === 1) {
	const arg = args[0];
	if (arg === "-h" || arg === "--help") {
		console.log(
			`
Usage: ${process.argv[1]} <path> <port>
path: Path to serve, relative to current directory
port: Port to listen on, defaults to 8080
        `.trim(),
		);
		process.exit(0);
	}
}

const red = "\x1b[31m";
const clear = "\x1b[0m";
const green = "\x1b[32m";
const cyan = "\x1b[36m";

const app = new FalconFrame();
app.setOrigin([
	"*",
]);

const isIcon = (url: string) => url.includes("icon") || url.endsWith(".ico");

app.use((req, res, next) => {
	const { method, url } = req;
	// SHUT UP IF THE FUCKING BROWSER SPAMS THE FAVICON REQUESTS
	if (method === "GET" && isIcon(url)) return next();
	console.log(method, url, Object.keys(req.body).length ? req.body : "");
	next();
});

let inputPath = "";
let port = 8080;

args.forEach(arg => {
	if (!Number.isNaN(+arg)) port = parseInt(arg, 10);
	else inputPath = arg;
});

const basePath = isAbsolute(inputPath)
	? inputPath
	: resolve(process.cwd(), inputPath);

if (!existsSync(basePath)) {
	console.log(red + "Invalid path: " + basePath + clear);
	process.exit(1);
}

if (loadIfNeeded(app)) {
	// suglite loaded
} else if (existsSync("public") && statSync("public").isDirectory())
	app.static("public");

app.use(async (req, res, next) => {
	const requestedPath = join(basePath, req.path);

	try {
		const stats = await stat(requestedPath);

		if (!stats.isDirectory()) return next();

		const indexFile = join(requestedPath, "index.html");

		try {
			await access(indexFile, constants.F_OK);
		} catch {
			// Index file not found, return directory listing
			const files = await readdir(requestedPath, {
				withFileTypes: true,
			});

			const fileList = files.map(file => {
				const encodedName = encodeURIComponent(file.name);
				const href = join(req.path, encodedName);
				const flag = file.isDirectory() ? "[DIR]" : "[FILE]";
				return `
                    <li>
                        <a href="${href}">
                            ${flag} ${file.name}
                        </a>
                    </li>`;
			});

			res.setHeader("Content-Type", "text/html");
			res.end(`
                <html>
                    <head>
                        <title>Index of ${req.path}</title>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        ${baseStyle}
                        <style>
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
	} catch {}
	return next();
});

app.static("/", basePath);

const iconPath = process.env.SERVER_FAVICON;
if (iconPath) app.get("/favicon.ico", (req, res) => res.sendFile(iconPath));

const baseStyle = `<style>
    body{ background-color: #111; color: white; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    a{ text-decoration: none; color: white; }
    a:hover{ text-decoration: underline; }
</style>`;

const notFoundArray = [
	"404.html",
	"not-found.html",
	"not_found.html",
];

app.use((req, res) => {
	res.status(404).setHeader("Content-Type", "text/html");

	if (process.platform !== "win32") {
		const files = execSync("find . -name " + notFoundArray.join(" -o -name "))
			.toString()
			.split("\n")
			.filter(Boolean);

		if (files.length > 0) {
			res.sendFile(join(basePath, files[0]));
			return;
		}
	}

	return `${baseStyle}404 Not found<br><a href="/">[RETURN] Home</a>`;
});

app.listen(+port, () => {
	const link = "http://localhost:" + port;
	const maxLength = Math.max(link.length, basePath.length + 7);

	console.log("/" + pad("", maxLength + 2, "-") + "\\");
	console.log("| " + green + pad(link, maxLength) + clear + " |");
	console.log("| " + cyan + pad("Path: " + basePath, maxLength) + clear + " |");
	console.log("\\" + pad("", maxLength + 2, "-") + "/");
});

function pad(str: string, length: number, char = " ") {
	while (str.length < length) str += char;
	return str;
}
