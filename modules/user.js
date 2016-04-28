'use strict';

module.exports = class User {
    constructor(data) {
        this.id = data.id;
        this.created = data.created;
        this.email = data.email;
        this.password = data.password;
        this.firstname = data.firstname;
        this.lastname = data.lastname;
        this.about = data.about;
    }

    export() {
        return JSON.parse(JSON.stringify(this));
    }
};