
(function (exports) {
    
    var util    = require('stitch/util'),
        Model   = require('stitch/model').Model,
        BaseModel
    ;
    
    exports.Model = BaseModel = Model.derive({
        
        init: function (name) {
            this.name = name;
        },
        
    }).extend({
        /**
         * Most stitch models look things up by name, so we alias the get
         * method to look up either by id, if a number, else assume the id
         * argument is a string and is meant to be the name property of the
         * record they are looking for, otherwise create a new record with
         * that id/name.
         */
        get: function (id) {
            var u = util,
                rec
            ;

            if (u.isNumber(id)) {
                return Model.get.call(this, id);
            }

            rec = this.find({name: id});
            
            if (!rec) {
                rec = new this(id);
            }
            
            return rec;
        }
    });
    
}(exports));