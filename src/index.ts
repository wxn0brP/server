#!/usr/bin/env bun

import { execSync } from "child_process";
import { existsSync, statSync } from "fs";
import { access, constants, readdir, stat } from "fs/promises";
import { isAbsolute, join, resolve } from "path";
import { loadIfNeeded } from "./suglite";
import { escapeHtml, isIconPath, pad } from "./utils";
import {
	app,
	baseStyle,
	clear,
	cyan,
	green,
	iconPath,
	notFoundArray,
	red,
} from "./vars";

const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
	console.log(
		`
Usage: ${process.argv[1]} <path> <port>
path: Path to serve, relative to current directory
port: Port to listen on, defaults to 8080
`.trim(),
	);
	process.exit(0);
}

app.setOrigin([
	"*",
]);

app.use((req, res, next) => {
	const { method, url, path } = req;
	// SHUT UP IF THE FUCKING BROWSER SPAMS THE FAVICON REQUESTS
	if (method === "GET" && isIconPath(path)) return next();
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
				const base = req.path.endsWith("/") ? req.path : req.path + "/";
				const href = escapeHtml(base + encodedName);
				const flag = file.isDirectory() ? "[DIR]" : "[FILE]";
				return `
			<li>
				<a href="${href}">
					<span class="${file.isDirectory() ? "dir" : "file"}">${flag}</span>
					${escapeHtml(file.name)}
				</a>
			</li>`;
			});

			res.setHeader("Content-Type", "text/html");
			res.end(`<!DOCTYPE html>
<html>
	<head>
		<title>Index of ${escapeHtml(req.path)}</title>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		${baseStyle}
		<style>
			ul{
				padding: 0;
				border: 1px solid var(--border);
				border-radius: 8px;
				overflow: hidden;
				background: var(--bg-elev);
			}
			li{
				border-bottom: 1px solid var(--border);
				padding: 0.5rem 1rem;
			}
			li:last-child{ border-bottom: none; }
			li:hover{ background: #1b1d22; }
			.dir{ color: var(--accent); }
			.file{ color: var(--muted); }
		</style>
	</head>
	<body>
		<main>
			<h3>Index of ${escapeHtml(req.path)}</h3>
			<span>Files and directories count: ${fileList.length}</span>
			<ul>
				<li><a href="../">[RETURN] ..</a></li>
				${fileList.join("")}
				<li><a href="../">[RETURN] ..</a></li>
			</ul>
		</main>
	</body>
</html>
`);
			return;
		}
	} catch {}
	return next();
});

app.static("/", basePath);

// if icon
app.use((req, res, next) => {
	if (req.method !== "GET" && req.method !== "HEAD") return next();
	if (!isIconPath(req.path)) return next();
	if (iconPath) return res.sendFile(iconPath);
	res.setHeader("Cache-Control", "public, max-age=86400");
	res.status(204).end();
});

app.use((req, res) => {
	res.status(404).setHeader("Content-Type", "text/html");

	if (process.platform !== "win32") {
		const files = execSync(
			`find ${basePath} -name ${notFoundArray.join(" -o -name ")}`,
		)
			.toString()
			.split("\n")
			.filter(Boolean);

		if (files.length > 0) {
			res.sendFile(join(basePath, files[0]));
			return;
		}
	}

	return `<!DOCTYPE html>
<html>
	<head>
		<title>404 Not found</title>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		${baseStyle}
	</head>
	<body>
		<main style="text-align: center;">
			<h1>404 Not found</h1>
			<p>The requested page could not be found.</p>
			<p><a href="/">[RETURN] Home</a></p>
		</main>
	</body>
</html>`;
});

app.listen(+port, () => {
	const link = "http://localhost:" + port;
	const maxLength = Math.max(link.length, basePath.length + 7);

	console.log("/" + pad("", maxLength + 2, "-") + "\\");
	console.log("| " + green + pad(link, maxLength) + clear + " |");
	console.log("| " + cyan + pad("Path: " + basePath, maxLength) + clear + " |");
	console.log("\\" + pad("", maxLength + 2, "-") + "/");
});
