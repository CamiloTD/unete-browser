(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.index = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    class Connector {

        constructor(url) {
            this.host = url;
            this.map = {};
        }

        async init() {
            let map = await this.post('/');
            this.map = this.unmap(map);
        }

        async post(method, data = []) {
            const response = await (await fetch(`${this.host}${method}`, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: new Headers({ 'content-type': 'application/x-www-form-urlencoded' })
            })).json();

            if (response.status === "err") throw response.result;

            return response.result;
        }

        unmap(array) {
            let map = {};

            array.forEach(url => {
                let keys = url.split('/');
                let ref = map;

                for (let i = 0, l = keys.length - 1; i < l; i++) {
                    let key = keys[i];
                    if (!key) continue;

                    ref = map[key];

                    if (!ref) ref = map[key] = {};
                }

                let key = keys[keys.length - 1];

                ref[key] = (...data) => this.post(url, data);
            });

            return map;
        }

    }

    exports.default = async url => {
        let connector = new Connector(url);

        await connector.init();

        return connector.map;
    };
});
