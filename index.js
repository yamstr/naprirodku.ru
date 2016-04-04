var config = require('config');
var morgan = require('morgan');
var fs = require('fs');
var marked = require('marked');
var express = require('express');
var app = express();

app.set('port', process.env.PORT || config.port);
app.set('view engine', 'jade');
app.use(express.static('public'));
app.use(morgan('dev'));

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/places/:id', function(req, res) {
    fs.readFile(__dirname + '/data/plases/' + req.params.id + '/article.md', { encoding: 'utf8' }, function(err, data) {
        if (err) throw err;

        res.render('place', {
            article: marked(data)
        });
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