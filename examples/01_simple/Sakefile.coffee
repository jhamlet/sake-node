
Path = require "path"
pj = Path.join

@stitch ()->
  srcDir      = "src"
  baseJsDir   = pj(srcDir, "js")
  baseCssDir  = pj(srcDir, "css")
  
  @aliasType "text/stylesheet", "scss"

  @bundle "core", ()->
    @javascript ()->
      @add pj(baseJsDir, "core.js")
    
    @stylesheet ()->
      @add pj(baseCssDir, "core.css")

  @bundle "sub-module", ()->
    @include "core"
    
    @js   pj(baseJsDir, "sub-module.js")
    @js   pj(baseJsDir, "sub-module-2.js")
    @css  pj(baseCssDir, "sub-module.css")
    @css  pj(baseCssDir, "sub-module-2.css")
