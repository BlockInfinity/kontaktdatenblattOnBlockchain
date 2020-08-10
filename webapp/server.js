'use strict';

const fs = require('fs')
const path = require('path')
const express = require('express')
const app = express();
const serverPort = 8080;
const bodyParser = require("body-parser")

app.use(bodyParser.json())

app.use(express.static("dist"))

app.listen(serverPort, () => console.log(`Web app listening on port ${serverPort}!`))