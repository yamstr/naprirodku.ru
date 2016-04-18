'use strict';

let Place = require('./place');

module.exports = function(db) {
    return {
        getPlaces: function(params) {
            if (typeof(params) != 'object') {
                params = {};
            }

            let sql = `
            SELECT
                places.*,
                places.position[0] AS lat,
                places.position[1] AS lng
            FROM public.places
            ORDER BY places.id`;

            if (params.limit) {
                sql += `
                LIMIT ${params.limit}`;
            }

            return db.query(sql).then(function(records) {
                return records.map(function(record) {
                    record.position = {
                        lat: record.lat,
                        lng: record.lng
                    };

                    return new Place(record);
                });
            });
        }
    };
};