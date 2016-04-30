'use strict';

let co = require('co');
let config = require('config');
let express = require('express');
let slash = require('express-slash');
let compression = require('compression');
let morgan = require('morgan');
let rollbar = require('rollbar');
let app = express();

let pgp = require('pg-promise')();
let db = pgp(process.env.DB || config.db);

let Users = require('./modules/users')(db);
let Places = require('./modules/places')(db);
let Articles = require('./modules/articles')(db);

rollbar.init(process.env.ROLLBAR || config.rollbar);

app.set('port', process.env.PORT || config.port);
app.set('view engine', 'jade');
app.enable('strict routing');
app.use(slash());
app.use(compression());
app.use(express.static('build'));
app.use(morgan('dev'));

app.get('/', co.wrap(function*(req, res, next) {
    try {
        let places = yield Places.getPlaces();
        let articles = yield Articles.getArticles({ limit: 3 });

        res.render('index', {
            section: 'index',
            places: places.map(function(place) {
                return place.export();
            }),
            places_json: (function(places) {
                places = places.map(function(place) {
                    return place.export();
                });

                return JSON.stringify(places);
            })(places),
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

app.get('/articles/', co.wrap(function*(req, res, next) {
    try {
        let places = yield Places.getPlaces();
        let articles = yield Articles.getArticles();

        res.render('articles', {
            section: 'articles',
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
        let users = yield Users.getUsers();
        let places = yield Places.getPlaces();
        let articles = yield Articles.getArticles({ without: [req.params.id], limit: 3 });
        let article = yield Articles.getArticleById({ id: req.params.id });

        res.render('article', {
            section: 'articles',
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
                users.forEach(function(user) {
                    if (user.id == article.user_id) {
                        article.user = user;
                    }
                });

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

app.get('/users/:id/avatar.jpg', function(req, res, next) {
    res.sendFile(req.params.id + '.jpg', {
        root: __dirname + '/build/images/users',
        dotfiles: 'deny'
    }, function(err) {
        if (err) {
            res.status(err.status).end();
        }
    });
});

app.get('/articles/:id/photos/:file', function(req, res, next) {
    res.sendFile(req.params.file, {
        root: __dirname + '/build/images/articles/' + req.params.id + '/photos',
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