'use strict';

let co = require('co');
let config = require('config');
let express = require('express');
let slash = require('express-slash');
let morgan = require('morgan');
let rollbar = require('rollbar');
let app = express();

let pgp = require('pg-promise')();
let db = pgp(process.env.DB || config.db);

let Places = require('./modules/places')(db);
let Articles = require('./modules/articles')(db);

rollbar.init(process.env.ROLLBAR || config.rollbar);

app.set('port', process.env.PORT || config.port);
app.set('view engine', 'jade');
app.enable('strict routing');
app.use(slash());
app.use(express.static('public'));
app.use(morgan('dev'));

app.get('/', co.wrap(function*(req, res, next) {
    try {
        let places = yield Places.getPlaces();
        let articles = yield Articles.getArticles({ limit: 3 });

        res.render('index', {
            places: places.map(function(place) {
                return place.export();
            }),
            articles: articles.map(function(article) {
                places.forEach(function(place) {
                    if (place.id == article.place_id) {
                        article.place = place;
                    }
                });

                return article.export();
            })
        });
    } catch(error) {
        next(error);
    }
}));

app.get('/articles/:id/', co.wrap(function*(req, res, next) {
    try {
        let places = yield Places.getPlaces();
        let articles = yield Articles.getArticles({ without: [req.params.id], limit: 3 });
        let article = yield Articles.getArticleById({ id: req.params.id });

        res.render('article', {
            places: places.map(function(place) {
                return place.export();
            }),
            articles: articles.map(function(article) {
                places.forEach(function(place) {
                    if (place.id == article.place_id) {
                        article.place = place;
                    }
                });

                return article.export();
            }),
            article: (function(article) {
                places.forEach(function(place) {
                    if (place.id == article.place_id) {
                        article.place = place;
                    }
                });

                return article.export();
            })(article)
        });
    } catch(error) {
        next(error);
    }
}));

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

app.use(function(err, req, res, next) {
    console.error(err);
    rollbar.handleError(err);
    res.status(500).render('500');
});

app.listen(app.get('port'));