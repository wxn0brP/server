var arg = process.argv.slice(2);

const czerwony = "\x1b[31m";
const clear = "\x1b[0m";
const zielony = "\x1b[32m";
const cyjan = "\x1b[36m";

if(arg.length < 1){
    console.log(czerwony+"Podaj argument: port"+clear);
    process.exit(1);
}

const express = require('express');
const path = process.cwd();
var app = express();

app.use("/lib", express.static("D:/projekty/wwli/wwli/js"));
app.use("/lib", express.static("D:/projekty/wwli/wwli/css"));
app.use("/", express.static(path));

const path_len = path.length + 7;
app.listen(arg[0], function(){
    console.log("/"+pod("", path_len+2, "-")+"\\");
    console.log("| "+zielony+pod("http://localhost:"+arg[0], path_len)+clear+" |");
    console.log("| "+cyjan+pod("path: "+path, path_len)+clear+" |");
    console.log("\\"+pod("", path_len+2, "-")+"/");
})

function pod(str, p, char=" "){
    const length = p - str.length;
    for(let i=0; i<length; i++){
        str += char;
    }
    return str;
}