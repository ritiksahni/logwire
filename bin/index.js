#! /usr/bin/env node
const { program } = require("commander");
const express = require("express");
const fs = require("fs");

const app = express();

let latestData = "";
let filename = "";

function watchFile(file) {
    // Check if file exists
    if (!fs.existsSync(file)) {
        latestData = "File does not exist";
        return;
    }

    // Initial file read.
    fs.readFile(file, "utf8", (err, data) => {
        if (err) {
            latestData = "Error reading the file";
        } else {
            latestData = data;
        }
    });

    // Updates the latestData variable when the file changes.
    fs.watch(file, (event) => {
        if (event == "change") {
            fs.readFile(file, "utf8", (err, data) => {
                if (err) {
                    latestData = err;
                } else {
                    latestData = data;
                }
            });
        }
    });
}

function startServer(port) {
    if (!port) {
        port = 3000;
    }

    app.listen(port, () => {
        console.log(`Server listening on http://localhost:${port}/`);
    }).on("error", (err) => {
        if (err.code === "EACCES") {
            console.error(`Port ${port} requires root privileges`);
        } else if (err.code === "EADDRINUSE") {
            console.error(`Port ${port} is already in use`);
        } else {
            console.error(err);
        }
    });
}

app.get("/", (req, res) => {
    const html = `
    <html>
        <head>
            <title>logwire</title>
            <style>
                body {
                    border: 0;
                    margin: 0;
                    padding: 0;
                }
                #container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow-x: hidden;
                }
                #box {
                    border: 1px solid #e1e4e8;
                    border-radius: 6px;
                    padding: 16px;
                    width: 80%; /* Increase the width */
                    max-height: 500px; /* Add this line to limit the height */
                    text-align: left;
                    font-size: 14px;
                    line-height: 1.5;
                    color: #24292e;
                    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;
                    overflow-y: scroll; /* Add this line to make the box scrollable */
                }
                a {
                    color: inherit;
                    text-decoration: none;
                }
                #logo {
                    padding: 16px;
                    justify-content: center;
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 16px;
                    color: #24292e;
                    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;
                }
                #filename {
                    padding: 16px;
                    justify-content: center;
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 16px;
                    color: #24292e;
                    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;
                }
                #footer {
                    position: absolute;
                    bottom: 0;
                    width: 100vw;
                    height: 50px;
                    line-height: 50px;
                    background-color: #f5f5f5;
                    text-align: center;
                    font-size: 14px;
                    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;
                }
            </style>
        </head>
        <body>
            <div id="logo"><a href="https://github.com/ritiksahni/logwire">logwire</a></div>
            <div id="filename">File: ${filename}</div>
            <div id="container">
                <div id="box">
                    <div>${latestData}</div>
                </div>
            </div>
            <div id="footer">
                Created by <a href="https://github.com/ritiksahni">Ritik Sahni</a>
            </div>
        </body>
    </html>
    `;
    res.send(html);
});

program
    .command("watch")
    .description("Watch file on web dashboard")
    .argument("<filename>", "File to watch")
    .argument("<port>", "Port to run server on")
    .action((file, port) => {
        if (isNaN(port)) {
            console.error("Invalid port number");
            return;
        }
        filename = file;
        watchFile(file);
        startServer(port);
    });

// To run the program on port 3000 with file "README.md", use the following CLI command:
// node index.js watch README.md 3000
// Syntax: program.command("test").description("Test command").action(testfunc);
program.parse();
