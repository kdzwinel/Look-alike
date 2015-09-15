module.exports = function (grunt) {
  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'js/*.js', 'js/libs/*.js'],
      options: {
        esnext: true,
        evil: true,
        camelcase: true,
        curly: true,
        eqeqeq: true,
        noempty: true,
        strict: true,
        loopfunc: true,
        globalstrict: true,
        browser: true,
        globals: {
          chrome: true,
          _: true,
          moment: true,
          resemble: true,
          Screenshooter: true,
          ShotStorage: true
        }
      }
    },
    zip: {
      'look-alike-<%= pkg.version %>.zip': ['css/**/*', 'ico/logo_*.png', 'js/**/*', 'fonts/**/*', '*.html', 'manifest.json']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-zip');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('prod', ['zip']);
};
