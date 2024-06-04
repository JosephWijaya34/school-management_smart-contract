var express = require('express');
var app     = express();
var ejs     = require('ejs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var path = require('path');
// import { fileURLToPath } from 'url'
var fileURLToPath = require('url');
// var tools = require('./tools.mjs');

// const file = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(file);

// const RC = await tools.constructSmartContract();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/static',express.static('src'));
app.use(cookieParser());
app.listen(8080); // 8080 is a port on which node server runs

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, '../../views/pages'));
app.use('/css', express.static(__dirname+'/src/frontend/css'));

app.get('/', function(req, res) {
    res.render("index", { name: "prince", hobbies: ['making coffee', 'talking'] });
});