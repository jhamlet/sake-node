
(function () {
    
    var env = {},
        key
    ;

    for (key in process.env) {
        env[key] = process.env[key];
    }
    
    module.exports = env;
    
}());