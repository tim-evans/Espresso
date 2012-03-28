abort "Please use Ruby 1.9 to build Espresso" if RUBY_VERSION !~ /^1\.9/

require "bundler/setup"
require "erb"
require "rake-pipeline"

def pipeline
  Rake::Pipeline::Project.new("Assetfile")
end

desc "Build espresso.js"
task :dist do
  puts "Building Espresso..."
  pipeline.invoke
  puts "Done!"
end

desc "Clean build artifacts from previous builds"
task :clean do
  puts "Cleaning build..."
  pipeline.clean
  puts "Done!"
end
