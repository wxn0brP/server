const arg = process.argv.slice(2);

const red = "\x1b[31m";
const clear = "\x1b[0m";
const green = "\x1b[32m";
const cyan = "\x1b[36m";

if(arg.length < 1){
    console.log(red+"please input port"+clear);
    process.exit(1);
}

const express = require('express');
const path = process.cwd() + "/" + (arg[1] || "");
const app = express();

app.use("/", express.static(path));

app.listen(arg[0], () => {
    const link = "http://localhost:" + arg[0];
    let path_len = path.length + 7;
    if(path_len < link.length) path_len = link.length;

    console.log("/" + pod("", path_len + 2, "-") + "\\");
    console.log("| " + green + pod(link, path_len) + clear + " |");
    console.log("| " + cyan + pod("path: " + path, path_len) + clear + " |");
    console.log("\\" + pod("", path_len + 2, "-") + "/");
})

function pod(str, p, char=" "){
    const length = p - str.length;
    for(let i=0; i<length; i++){
        str += char;
    }
    return str;
}