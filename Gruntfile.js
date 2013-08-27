/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        src: [
          'src/area.ts',
          'src/axis.ts',
          'src/context.ts',
          'src/contextModel.ts',
          'src/contextNode.ts',
          'src/contextView.ts',
          'src/dataSet.ts',
          'src/element.ts',
          'src/interaction.ts',
          'src/label.ts',
          'src/listenableDictionary.ts',
          'src/main.ts',
          'src/mark.ts',
          'src/scale.ts',
          'test/js/tests.ts',
        ]
      }
    },

    less: {
      base: {
        files: {
          "lyra.css": "less/lyra.less"
        }
      }
    },

    open: {
      example: {
        path: 'index.html',
        app: 'Google Chrome'
      }
    }
  });

  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-open');

  grunt.registerTask("default", ["typescript", "less", "tslint"]);
  grunt.registerTask("test", ["default", "mocha"]);
  grunt.registerTask("example", ["default", "open:example"]);
};
