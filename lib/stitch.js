
(function (exports) {

var Path    = require('path'),
    FS      = require('fs'),
    moduleDir       = Path.dirname(module.filename),
    commandsDir     = Path.join(moduleDir, 'stitch/commands'),
    commandFiles    = FS.readdirSync(commandsDir),
    Stitch
;

exports.Stitch = Stitch = require('stitch/driver/stitch').Driver;
Stitch.context = require('stitch/model/config').Model;

// Read plug-in files    
// commandFiles.forEach(function (filename) {
//     require(Path.join(commandsDir, filename));
// });

}(exports || window));

