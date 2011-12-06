
Path = require "path"
pj = Path.join

@stitch ()->
  srcDir      = "src"
  baseJsDir   = pj(srcDir, "js")
  baseCssDir  = pj(srcDir, "css")
  
  @bundle "core", ()->
    @javascript ()->
      @add pj(baseJsDir, "core.js")
    
    @stylesheet ()->
      @add pj(baseCssDir, "core.css")

  @bundle "sub-module", ()->
    @include "core"
    
    @js   pj(baseJsDir, "sub-module.js")
    @css  pj(baseCssDir, "sub-module.css")
