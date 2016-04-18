'use strict';

let moment = require('moment');
let marked = require('marked');

module.exports = class Article {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.place_id = data.place_id;
        this.created = data.created;
        this.title = data.title;
        this.lead = data.lead;
        this.body = data.body;
    }

    export() {
        let article = JSON.parse(JSON.stringify(this));

        article.created = moment(article.created).format('DD.MM.YYYY');
        article.body = marked(article.body);

        return article;
    }
};