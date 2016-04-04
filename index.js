var fs = require('fs');
var config = require('config');
var async = require('async');
var validator = require('validator');
var marked = require('marked');
var express = require('express');
var slash = require('express-slash');
var morgan = require('morgan');
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
    var path = __dirname + '/data/plases/' + req.params.id + '/index.md';

    async.series([
        function(callback) {
            if (validator.isInt(req.params.id)) {
                callback(null, true);
            } else {
                callback(true, false);
            }
        },
        function(callback) {
            fs.exists(path, function(exists) {
                if (exists) {
                    callback(null, true);
                } else {
                    callback(true, false);
                }
            });
        },
        function(callback) {
            fs.readFile(path, { encoding: 'utf8' }, function(err, data) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, data);
                }
            });
        }
    ], function(err, results) {
        if (err) {
            res.status(404).end();
        } else {
            res.render('place', {
                article: marked(results.pop())
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

app.listen(app.get('port'));