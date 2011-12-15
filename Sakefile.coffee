
Path = require "path"

directory "tmp/html"

description "Description for task one"
file "tmp/html/jquery.min.js", ["tmp/html"], (t)->
  t.startAsync();
  console.log(t.name);
  # write t.name, "hello jquery\n"
  sh "echo \"hello jquery\" > " + t.name, ()->
    t.clearAsync();

description "Description for task two"
task "two", ["tmp/html/jquery.min.js"], (t)->
  console.log t.name

description "Description for task three"
task "three", ["two"], (t)->
  console.log t.name

async "test-async1", (t)->
  sh "echo \"#{t.name}\"", (result)->
    console.log chomp(result)
    t.complete()
    
async "test-async2", ["test-async1"], (t)->
  sh "echo \"#{t.name}\"", (result)->
    console.log chomp(result)
    t.complete()

CLEAN.include "tmp"

stitch ()->
  @bundle "core", ()-> 
    log "Hello World"

    @js ()->
      @insert "This would be some javascript for core."
      @exec   "ls -al"
      # @fetch  "http://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"

    @stylesheet ()->
       @insert "some styles for core"
   
  @bundle "sub-module", ()->
     @include "core"
     
     @insert "js", "Some javascript for sub-module to add to core"
     
     @stylesheet ()->
       @insert "some styles for sub-module"
