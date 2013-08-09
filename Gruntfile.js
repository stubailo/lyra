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
      },
      test: {
        src: ['test/js/tests.ts'],
        dest: 'test/js/tests.js',
        options: {
          module: 'amd', //or commonjs
          target: "ES5",
          comments: true,
          declaration: false
        }
      }
    },

    mocha: {
      index: ['test/index.html']
    },

  });

  grunt.loadNpmTasks('grunt-typescript');

  grunt.loadNpmTasks('grunt-mocha');

  grunt.registerTask("default", ["typescript"]);
  grunt.registerTask("test", ["typescript", "mocha"]);

};
