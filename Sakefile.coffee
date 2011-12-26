
Path = require "path"

directory "tmp/html"
directory "tmp/js"

jqueryPath = "tmp/html/jquery.min.js"
file jqueryPath, ["tmp/html"], (t)->
  t.startAsync();
  console.log(t.name);
  url = "http://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"
  sh "curl -s '#{url}' > #{t.name}", ()->
    t.clearAsync()
  # sh "echo \"hello jquery\" > " + t.name, ()->
  #   t.clearAsync();

description "Build the jquery version."
task "jquery", [jqueryPath]

description "Description for task two"
task "two", [jqueryPath], (t)->
  console.log t.name

description "Description for task three"
task "three", ["two"], (t)->
  console.log t.name

async "test-async1", (t)->
  sh "echo \"#{t.name}\"", (result)->
    console.log result.replace(/\n+$/, "")
    t.complete()
    
async "test-async2", ["test-async1"], (t)->
  sh "echo \"#{t.name}\"", (result)->
    console.log result.replace(/\n+$/, "")
    t.complete()

jsFL = new FileList "lib/**/*.js"

file "tmp/js/combined.js", ["tmp/js", jsFL], (t)->
  write t.name, cat(jsFL.items)

desc "Sample task that uses a FileList to build a file"
task "test-filelist", ["tmp/js/combined.js"]

CLEAN.include "tmp/html/jquery.min.js", "tmp/js/combined.js"
CLOBBER.include "tmp"

task "default", ["test-filelist", "three"]

stitch ()->
  @bundle "core", ()->
    @description = "The core package."

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
