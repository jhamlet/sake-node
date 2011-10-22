
(function (exports) {
    
    /**
     * Call an object's overriden method with supplied arguments.
     * 
     * NOTE: this function depends on ECMAScript 5 features of JavaScript (WebKit,
     * Gecko, no IE), you have to invoke it with the correct 'this' context.
     * 
     * It will climb the prototype chain to find the method with the same name
     * as the one that was called, and call it in the correct scope (the current
     * 'this' object where '_super' is called).
     * 
     * This works for getters and setters, as well as getting overridden plain
     * propterties further up the prototype chain.  i.e: if you have objA with a
     * plain property of 'foo' as a number, and objB, with its prototype linked
     * to objA, has a getter, or function, named 'foo', calling '_super' will
     * return the number.
     * 
     * Useage:
     * 
     * You can include in any of your prototypes for classes, or objects created
     * with Ojbect.create:
     * 
     *      someclass.prototype._super = exports._super;
     * 
     *      someclass.prototype.foo = function (arg) {
     *          return this._super(arg);
     *      },
     * 
     * Or, you can call it directly from within any object hierarchy:
     * 
     *      var objA = Object.create({});
     *      objA.foo = function foo (arg) { ...  }
     * 
     *      var objB = Object.create(objA);
     *      objB.foo = function foo (arg) {
     *          return exports._super.call(this, arg);
     *      }
     * 
     * Ultimately, directly calling the next object in the chain would be more
     * performant (i.e: inside objB.foo: objA.foo.call(this, arg)).
     */
     
    /**
     * @method _super
     * @param arg1..argN {mixed} all arguments are passed to the function
     *      found to be the 'super' one.
     * @returns {mixed} whatever the 'super' function would have returned.
     */
    exports._super = function _super () {
        var // The number of arguments given,
            // helps in determining if a getter or a setter
            arglen = arguments.length,
            // The function that called _super
            caller,
            // The current prototype scope
            scope,
            // name of the _super property
            name,
            // useful in looping over our properties
            props, i, len, prop,
            // the super function and its reutrn value
            ownFn, fn, ret
        ;

        // Figure out our current scope in the chain
        scope = this.__superScope__ || this;

        /**
         * Figure out the method that called _super
         * 
         * See if we are currently in the execution stack, the function has
         * been named, or if we've been down this route before and applied our
         * own label to the function (since we can not modify the 'name'
         * property of a function)
         * 
         * if not, we have to loop over our 'this' object's top-level
         * properties and find the one that matches our caller function
         * 
         * You prevent this lookup process by 'naming' your functions, i.e:
         *      some.prototype = {
         *            propname: function propname (...) {...},
         *      }
         */
        name = this.__superProperty__ || 
                (caller = arguments.callee.caller).name ||
                caller.__name__
        ;

        if (!name) {
            props = Object.getOwnPropertyNames(scope);
            len = props.length;
            for (i = 0; i < len; i++) {
                prop = Object.getOwnPropertyDescriptor(scope, props[i]);
                if ((   ((ownFn = prop.get) && !arglen) ||
                        ((ownFn = prop.set) && arglen) ||
                        typeof (ownFn = prop.value) === "function") &&
                    ownFn === caller
                ) {
                    // Set a variable on the originating function so it is
                    // faster to get the property name next time _super is
                    // called
                    name = ownFn.__name__ = props[i];
                    break;
                }
            }
        }

        // Is this our first time?
        if (!this.__superProperty__) {
            this.__superProperty__ = name;
        }

        // We're done with this scope, clear out our temporary variable
        delete scope.__superScope__;

        // Ooopsss... You said call _super, but you really didn't mean to
        if (!(scope = Object.getPrototypeOf(scope))) {
            throw new Error("No super '" + name + "' property found.");
        }

        // Set our new position in the scope chain
        scope.__superScope__ = scope;

        // Advance to the next object in the chain
        if ((prop = Object.getOwnPropertyDescriptor(scope, name))) {
            switch (typeof prop.value) {
                case "function":
                    fn = prop.value;
                    break;
                case "undefined": // Getter/Setter
                    fn = prop[arglen ? 'set' : 'get'];
                    break;
                default: // plain property
                    ret = prop.value;
            }

            // execute the function in the context of original caller, or this,
            // and hang on to the results for a moment.
            if (fn) {
                ret = fn.apply(this, arguments);
            }

            // clean up
            delete scope.__superScope__;
            delete this.__superProperty__;

            return ret;
        }

        // keep looking...
        return this._super();
    };
    
}(exports));