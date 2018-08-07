module.exports = function gruntConfig(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      src: ['Gruntfile.js', 'js/*.js', 'js/libs/*.js'],
    },
    zip: {
      'look-alike-<%= pkg.version %>.zip': ['css/**/*', 'ico/logo_*.png', 'js/**/*', 'fonts/**/*', '*.html', 'manifest.json'],
    },
  });

  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-zip');

  grunt.registerTask('default', ['eslint']);
  grunt.registerTask('prod', ['zip']);
};
