
(function () {
    
    var FS            = require("fs"),
        EM            = require("events").EventEmitter,
        StringScanner = require("./string-scanner"),
        Directive     = require("./directive"),
        Parser
    ;
    
    module.exports = Parser = StringScanner.derive({
        
        init: function (args) {
            
            if (args && args.directives) {
                this.defineDirectives(args.directives);
            }
            
            if (args && args.handlers) {
                this.registerHandlers(args.handlers);
            }
        },
        
        parse: function (source, handlers) {
            var match;
            
            this.source = source.toString();
            this.reset();
            
            if (handlers) {
                this.registerHandlers(handlers);
            }
            
            this.scanUnion = new RegExp(
                Object.keys(this._directives).map(function (key) {
                    return this._directives[key].startToken;
                }, this).join("|")
            );
            
            // console.log(this.scanUnion);
            while (match = this.scanUntil(this.scanUnion)) {
                console.log(">> " + this.getMatch());
                this.pos -= this.getMatch().length;
                this.scan(/include\(([^\)]+)\)/);
                console.log(">> " + this.getCapture(0));
                // this.unscan();
                // console.log(this.getPreMatch());
                // console.log(">> " + this.getMatch());
            }
        },
        
        registerHandlers: function (handlers) {
            var key;

            for (key in handlers) {
                this.on(key, handlers[key]);
            }
        },
        
        defineDirectives: function (directives) {
            var dir, args;
            
            if (!this._directives) {
                this._directives = {};
            }
            
            for (dir in directives) {
                args = directives[dir];
                this._directives[dir] = {
                    name: args[0],
                    startToken: dir,
                    parser: args[1]
                };
            }
        }
        
    });
    
    Parser.include(EM);
    
}());

/*
new stitch.Parser({
    directives: {
        include: [/@include/, function (parser) {...}],
        depend: [/@depend/, function (parser) {..}]
    }
}).parse("file/to/parse.js", {
    include: function (e) {
        
    },
    
    depend: function (e) {
        
    }
});
*/