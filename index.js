var fs = require('fs');
var config = require('config');
var async = require('async');
var validator = require('validator');
var marked = require('marked');
var express = require('express');
var slash = require('express-slash');
var morgan = require('morgan');
var rollbar = require('rollbar');
var app = express();

app.set('port', process.env.PORT || config.port);
app.set('view engine', 'jade');
app.enable('strict routing');
app.use(slash());
app.use(express.static('public'));
app.use(morgan('dev'));

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/places/:id/', function(req, res) {
    var files = {
        article: __dirname + '/data/plases/' + req.params.id + '/article.md',
        meta: __dirname + '/data/plases/' + req.params.id + '/meta.json'
    };

    async.map(files, function(file, callback) {
        fs.readFile(file, { encoding: 'utf8' }, function(err, data) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data);
            }
        });
    }, function(err, results) {
        if (err) {
            res.status(404).end();
        } else {
            res.render('place', {
                article: marked(results.article),
                meta: JSON.parse(results.meta)
            });
        }
    });
});

app.get('/places/:id/:file', function(req, res) {
    res.sendFile(req.params.file, {
        root: __dirname + '/data/plases/' + req.params.id + '/photos',
        dotfiles: 'deny'
    }, function(err) {
        if (err) {
            res.status(err.status).end();
        }
    });
});

app.use(rollbar.errorHandler('cb69db9d4c8341e4bf1a4b2d2cb8f9a3'));

app.listen(app.get('port'));