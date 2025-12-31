import FalconFrame from "@wxn0brp/falcon-frame";
import { existsSync, readFileSync } from "fs";
import JSON5 from "json5";

interface Config {
    server_map?: {
        get: Record<string, string>;
        dir: Record<string, string>;
        redirect: Record<string, string>;
    }
}

function _for(obj: Record<string, string>, fn: (key: string, value: string) => void) {
    if (!obj) return;
    for (const [key, value] of Object.entries(obj))
        fn(key, value);
}

const removeLeadingHyphens = (str: string) => str.replace(/^-+/, "");

function loadSuglite(app: FalconFrame, suglite: Config) {
    const map = suglite.server_map;

    if (map) {
        _for(map.get, (key, value) => app.get(key, (req, res) => res.sendFile(value)));
        _for(map.dir, (key, value) => app.static(removeLeadingHyphens(key), value, { errorIfDirNotFound: false }));
        _for(map.redirect, (key, value) => app.get(key, (req, res) => res.redirect(value)));
    }
}

function loadJSON5(path: string) {
    return JSON5.parse(readFileSync(path, "utf-8")) as Config;
}

const files = ["suglite.json5", "suglite.json"];

export function loadIfNeeded(app: FalconFrame) {
    for (const file of files) {
        if (existsSync(file)) {
            console.log(`Loading ${file}...`);
            loadSuglite(app, loadJSON5(file));
            return true;
        }
    }
    return false;
}