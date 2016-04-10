var config = require('config');
var async = require('async');
var validator = require('validator');
var marked = require('marked');
var express = require('express');
var slash = require('express-slash');
var morgan = require('morgan');
var rollbar = require('rollbar');
var app = express();

var bluebird = require('bluebird');
var pgp = require('pg-promise')({
    promiseLib: bluebird
});
var db = pgp(process.env.DB || config.db);

app.set('port', process.env.PORT || config.port);
app.set('view engine', 'jade');
app.enable('strict routing');
app.use(slash());
app.use(express.static('public'));
app.use(morgan('dev'));

app.get('/', function(req, res, next) {
    res.render('index');
});

app.get('/articles/:id/', function(req, res, next) {
    async.waterfall([
        function(callback) {
            db.one('SELECT * FROM articles WHERE id = ${id}', {
                id: req.params.id
            })
            .then(function(article) {
                article.body = marked(article.body);

                callback(null, article);
            })
            .catch(function(error) {
                callback(error);
            })
        },
        function(article, callback) {
            db.one('SELECT *, position[0] AS lat, position[1] AS lng FROM places WHERE id = ${id}', {
                id: article.place_id
            })
            .then(function(place) {
                place.position = {
                    lat: place.lat,
                    lng: place.lng,
                };

                callback(null, article, place);
            })
            .catch(function(error) {
                callback(error);
            })
        }
    ], function(error, article, place) {
        if (error) {
            next();
        } else {
            res.render('article', {
                article: article,
                place: place
            });
        }
    });
});

app.get('/articles/:id/photos/:file', function(req, res, next) {
    res.sendFile(req.params.file, {
        root: __dirname + '/data/articles/' + req.params.id + '/photos',
        dotfiles: 'deny'
    }, function(err) {
        if (err) {
            res.status(err.status).end();
        }
    });
});

app.use(function(req, res, next) {
    res.status(404).render('404');
});

app.use(rollbar.errorHandler('cb69db9d4c8341e4bf1a4b2d2cb8f9a3'));

app.listen(app.get('port'));