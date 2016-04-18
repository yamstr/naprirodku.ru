'use strict';

let moment = require('moment');

module.exports = class Place {
    constructor(data) {
        this.id = data.id;
        this.created = data.created;
        this.name = data.name;
        this.address = data.address;
        this.position = data.position;
    }

    export() {
        let place = JSON.parse(JSON.stringify(this));

        place.created = moment(place.created).format('DD.MM.YYYY');

        return place;
    }
};