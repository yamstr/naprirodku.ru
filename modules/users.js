'use strict';

let User = require('./user');

module.exports = function(db) {
    return {
        getUsers: function(params) {
            if (typeof(params) != 'object') {
                params = {};
            }

            let sql = `
            SELECT users.*
            FROM public.users
            ORDER BY users.id`;

            if (params.limit) {
                sql += `
                LIMIT ${params.limit}`;
            }

            return db.query(sql).then(function(records) {
                return records.map(function(record) {
                    return new User(record);
                });
            });
        }
    };
};