
Path = require "path"

directory "tmp/html"

description "Description for task one"
file "tmp/html/jquery.min.js", ["tmp/html"], (x)->
  console.log(t.name);

description "Description for task two"
task "two", "tmp/html/jquery.min.js", (t)->
  console.log t.name
  sh "touch tmp/html/jquery.min.js"

description "Description for task three"
task "three", "two", (t)->
  console.log t.name

task "default", (t)->
  console.log t.name

stitch ()->
  @bundle "core", ()-> 
    log "Hello World"

    @js ()->
      @insert "This would be some javascript for core."
      @exec   "ls -al"
      @fetch  "http://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"

    @stylesheet ()->
       @insert "some styles for core"
   
  @bundle "sub-module", ()->
     @include "core"
     
     @insert "js", "Some javascript for sub-module"
     
     @stylesheet ()->
       @insert "some styles for sub-module"
