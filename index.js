var config = require('config');
var morgan = require('morgan');
var express = require('express');
var app = express();

app.set('view engine', 'jade');
app.use(express.static('public'));
app.use(morgan('dev'));

app.get('/', function(req, res) {
    res.render('index');
});

app.listen(process.env.PORT);
