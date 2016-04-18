'use strict';

let Article = require('./article');

module.exports = function(db) {
    return {
        getArticles: function(params) {
            if (typeof(params) != 'object') {
                params = {};
            }

            let sql = `
            SELECT articles.*
            FROM public.articles
            WHERE TRUE`;

            if (params.without) {
                sql += `
                AND articles.id NOT IN (${params.without.join(', ')})`;
            }

            sql += `
            ORDER BY articles.created DESC`;

            if (params.limit) {
                sql += `
                LIMIT ${params.limit}`;
            }

            return db.query(sql).then(function(records) {
                return records.map(function(record) {
                    return new Article(record);
                });
            });
        },
        getArticleById: function(params) {
            if (typeof(params) != 'object') {
                params = {};
            }

            let sql = `
            SELECT articles.*
            FROM public.articles
            WHERE articles.id = ${params.id}`;

            return db.one(sql).then(function(record) {
                return new Article(record);
            });
        }
    };
};