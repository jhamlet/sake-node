require 'rake/clean'
require 'JSON'

CLEAN.include('package.json')
CLOBBER.include()

file 'package.json' => [:clean] do |t|
  open(t.name, "w") do |file|
    file.puts JSON.pretty_generate({
      name: "stitch",
      # author: (File.read("AUTHOR")).chomp!
      description: "",
      version: (File.read("VERSION")).chomp!,
      repository: {
        type: "git",
        url: "git@github.com:jhamlet/stitch-node.git"
      },
      bugs: "http://github.com/jhamlet/stitch-node/issues",
      preferGlobal: true,
      main: "lib/stitch",
      bin: {
        stitch: "lib/stitch.js"
      },
      modules: {
        "stitch/util" => "lib/stitch/util.js"
      }
    })
  end
end

task :test do |t|
  src = ARGV[1]
  ENV['NODE_PATH'] = "#{File.realdirpath('./lib')}:/usr/local/lib/node_modules"
  if src then
    sh "expresso -g #{src}"
  else
    sh "expresso -g test/*"
  end
end