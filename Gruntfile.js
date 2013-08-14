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
          target: "ES3",
          comments: true,
          declaration: false
        }
      },
      test: {
        src: ['test/js/tests.ts'],
        dest: 'test/js/tests.js',
        options: {
          module: 'amd', //or commonjs
          target: "ES3",
          comments: true,
          declaration: false
        }
      }
    },

    mocha: {
      index: ['test/index.html']
    },

    tslint: {
      options: {
        configuration: grunt.file.readJSON(".tslintrc")
      },
      files: {
        src: ['src/main.ts', 'src/tests.ts']
      }
    },

    less: {
      base: {
        files: {
          "lyra.css": "less/lyra.less"
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-mocha');

  grunt.registerTask("default", ["tslint", "typescript", "less"]);
  grunt.registerTask("test", ["default", "mocha"]);

};
