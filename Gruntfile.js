'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        clean: {
            files: ['dist/**/*.js']
        },
        //合并文件
        concat: {
            foo: {
                files: [{
                    src: ['src/header.js', 'src/utils.js','src/dataType.js','src/mydatabase.js','src/footer.js'],
                    dest: 'dist/mydatabase.js'
                }],
            }
        },
        //压缩文件
        uglify: {
            options: {
                banner: '<%= banner %>'
            },

            build: {
                src: '<%= concat.foo.files[0].dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },

        // jshint: {
        //     gruntfile: {
        //         options: {
        //             jshintrc: '.jshintrc'
        //         },
        //         src: 'Gruntfile.js'
        //     },
        //     src: {
        //         options: {
        //             jshintrc: 'src/.jshintrc'
        //         },
        //         src: ['dist/mydatabase.js']
        //     },
        // },

        // watch: {
        //     gruntfile: {
        //         files: '<%= jshint.gruntfile.src %>',
        //         tasks: ['jshint:gruntfile']
        //     },
        //     src: {
        //         files: '<%= jshint.src.src %>',
        //         tasks: ['jshint:src', 'qunit']
        //     }
        // },
        // qunit: {
        //     files: ['test/*.html']
        // }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-contrib-qunit');
   // grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task.
    // grunt.registerTask('default', ['jshint', 'qunit', 'clean', 'concat', 'uglify']);
    grunt.registerTask('default', [  'clean','concat', 'uglify' ]);

};