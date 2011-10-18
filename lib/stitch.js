
(function (exports) {

var util = require('stitch/util'),
    Config = require('stitch/config').Class,
    stitch = {
        /**
         * 
         * @method configure
         * @param name {string} optional, name of configuration, defaults to 'default'
         * @param fn {function} optional, closure
         */
        configure: function (name, fn) {
            var arglen = arguments.length,
                defaultName = 'default',
                cfg;

            if (!arglen) {
                return Config.has(defaultName) ?
                    Config.get(defaultName) :
                    new Config(defaultName)
                ;
            }
            else if (arglen === 1) {
                switch (typeof name) {
                    case 'string':
                        return Config.has(name) ?
                            Config.get(name) :
                            new Config(name)
                        ;
                    case 'function':
                        return (Config.has(defaultName) ?
                            Config.get(defaultName) :
                            new Config(defaultName)
                        ).enhance(name);
                }
            } else {
                return (
                    Config.has(name) ?
                        Config.get(name) :
                        new Config(name)
                    ).enhance(fn)
                ;
            }
        },
        
        config: util.alias("configure"),
    
        mimeTypes: {
            'text/javascript':  'js',
            'text/stylesheet':  'css',
            'text/html':        'html',
            'text/plain':       'text',
            'application/json': 'json'
        },
        
        util: util
    }
;

// export
util.merge(exports, stitch);
    
}(exports || window));

