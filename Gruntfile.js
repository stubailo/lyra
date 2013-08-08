module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    typescript: {
      base: {
        src: ['src/main.ts'],
        dest: 'lyra.js',
        options: {
          module: 'amd', //or commonjs
          target: "ES5",
          comments: true,
          declaration: true
        }
      }
    },

  });

  grunt.loadNpmTasks('grunt-typescript');

  grunt.registerTask("default", ["typescript"]);

};
