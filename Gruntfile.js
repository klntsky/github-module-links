module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.initConfig({
        concat: {
            dist: {
                src: ['header.js', 'index.js'],
                dest: 'build/github-module-links.user.js',
            },
        },
    });

    grunt.registerTask('default', ['concat:dist']);
};
