'use strict';

module.exports = class Place {
    constructor(data) {
        this.id = data.id;
        this.created = data.created;
        this.name = data.name;
        this.address = data.address;
        this.position = data.position;
    }

    export() {
        return JSON.parse(JSON.stringify(this));
    }
};