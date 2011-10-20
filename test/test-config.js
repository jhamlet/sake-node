
var Config = require('stitch/config').Config,
    cfg1
;

console.log(">>> Config structure")
console.dir(Config);
console.dir(Object.getPrototypeOf(Config));

cfg1 = Config.create("default");
console.log(">>> default Config");
console.dir(cfg1);
