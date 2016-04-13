'use strict';

let config = require('config');
let marked = require('marked');
let moment = require('moment');
let express = require('express');
let slash = require('express-slash');
let morgan = require('morgan');
let rollbar = require('rollbar');
let app = express();

let pgp = require('pg-promise')();
let db = pgp(process.env.DB || config.db);

app.set('port', process.env.PORT || config.port);
app.set('view engine', 'jade');
app.enable('strict routing');
app.use(slash());
app.use(express.static('public'));
app.use(morgan('dev'));

app.get('/', function(req, res, next) {
    db.task(function*(t) {
        let places = yield t.any('SELECT *, position[0] AS lat, position[1] AS lng FROM places ORDER BY id');
        let articles = yield t.any('SELECT * FROM articles ORDER BY created DESC LIMIT 3');

        return { places, articles };
    }).then(function(data) {
        data.places.map(function(place) {
            place.position = {
                lat: place.lat,
                lng: place.lng
            };

            return place;
        });

        data.articles.map(function(article) {
            article.created = moment(article.created).format('DD.MM.YYYY');

            data.places.forEach(function(place) {
                if (place.id == article.place_id) {
                    article.place = place;
                }
            });

            return article;
        });

        res.render('index', data);
    }).catch(function(error) {
        next();
    });
});

app.get('/articles/:id/', function(req, res, next) {
    db.task(function*(t) {
        let places = yield t.any('SELECT *, position[0] AS lat, position[1] AS lng FROM places ORDER BY id');
        let articles = yield t.any('SELECT * FROM articles WHERE id != $1 ORDER BY created DESC LIMIT 3', req.params.id);
        let article = yield t.one('SELECT * FROM articles WHERE id = $1', req.params.id);

        return { places, articles, article };
    }).then(function(data) {
        data.places.map(function(place) {
            place.position = {
                lat: place.lat,
                lng: place.lng
            };

            return place;
        });

        data.articles.map(function(article) {
            article.created = moment(article.created).format('DD.MM.YYYY');

            data.places.forEach(function(place) {
                if (place.id == article.place_id) {
                    article.place = place;
                }
            });

            return article;
        });

        data.article.body = marked(data.article.body);
        data.places.forEach(function(place) {
            if (place.id == data.article.place_id) {
                data.article.place = place;
            }
        });

        res.render('article', data);
    }).catch(function(error) {
        next();
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

app.use(rollbar.errorHandler(process.env.ROLLBAR || config.rollbar));

app.listen(app.get('port'));
