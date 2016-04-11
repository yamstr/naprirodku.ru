'use strict';

let config = require('config');
let marked = require('marked');
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
    res.render('index');
});

app.get('/articles/:id/', function(req, res, next) {
    db.task(function*(t) {
        let article = yield t.one('SELECT * FROM articles WHERE id = $1', req.params.id);
        let place = yield t.one('SELECT *, position[0] AS lat, position[1] AS lng FROM places WHERE id = $1', article.place_id);

        return { article, place };
    }).then(function(data) {
        data.article.body = marked(data.article.body);
        data.place.position = {
            lat: data.place.lat,
            lng: data.place.lng
        };

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
