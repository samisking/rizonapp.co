'use strict';

module.exports = function(grunt) {
    var banner_string = '/*! <%= pkg.name %> - <%= pkg.url %> - v<%= pkg.version %> - Built on <%= grunt.template.today("yyyy-mm-dd, h:MM:ss TT") %> */';

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Set up some variables
        app: {
            sass_src:   '_sass',
            js_src:     '_js',

            assets:     'assets',
            css_dest:   'assets/css',
            js_dest:    'assets/js'
        },


        // Compile Sass
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: [{
                    expand: true,
                    cwd: '<%= app.sass_src %>',
                    src: ['*.scss'],
                    dest: '<%= app.css_dest %>',
                    ext: '.css'
                }]
            }
        },


        // Auto pre-fixer
        autoprefixer: {
            options: {
                map: true
            },
            dist: {
                expand: true,
                flatten: true,
                src: '<%= app.css_dest %>/*.css',
                dest: '<%= app.css_dest %>'
            }
        },


        // Pack media queries to save bytes
        css_mqpacker: {
            dist: {
                options: {
                    map: true,
                    sort: true
                },
                expand: true,
                cwd: '<%= app.css_dest %>/',
                src: '*.css',
                dest: '<%= app.css_dest %>/'
            }
        },


        // CSS compression
        cssmin: {
            options: { banner: banner_string },
            minify: {
                expand: true,
                cwd: '<%= app.css_dest %>/',
                src: ['*.css', '!*.min.css'],
                dest: '<%= app.css_dest %>/',
                ext: '.min.css'
            }
        },


        // Concat JS
        concat: {
            generated: {
                src: [ '<%= app.js_src %>/plugins.js', '<%= app.js_src %>/app.js' ],
                dest: '<%= app.js_dest %>/<%= pkg.name %>.js'
            }
        },


        // JS compression
        uglify: {
            options: { banner: banner_string },
            generated: {
                files: {
                    '<%= app.js_dest %>/<%= pkg.name %>.min.js': ['<%= app.js_dest %>/<%= pkg.name %>.js']
                }
            }
        },


        // Set up watch task
        watch: {
            css: {
                files: ['<%= app.sass_src %>/**/*.scss'],
                tasks: [ 'sass', 'css_mqpacker', 'autoprefixer', 'cssmin' ]
            },
            scripts: {
                files: ['<%= app.js_src %>/**/*.js'],
                tasks: [ 'concat', 'uglify' ]
            }
        }
    });

    // Builds with default config
    grunt.registerTask('default', [
        'sass',         // compile sass
        'css_mqpacker', // pack all media queries
        'autoprefixer', // prefix everything
        'cssmin',       // minify css
        'concat',       // concat js
        'uglify'        // minify js
    ]);
}
