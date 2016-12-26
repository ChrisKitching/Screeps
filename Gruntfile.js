module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-screeps');

  grunt.initConfig({
    screeps: {
      options: {
        email: 'chriskitching@linux.com',
        password: 'Incilno0',
        branch: 'default',
        ptr: false
      },
      dist: {
        src: ['dist/*.js']
      }
    }
  });
};
