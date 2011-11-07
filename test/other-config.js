
console.log(env["HELLO_WORLD"]);
console.log(typeof env["HELLO_WORLD"]);

console.log("Options:");
console.log(options.minify);

configure(function () {
    console.log("other config");
    this.sourcePaths.push("other-source-path");
});
