/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

//    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
//      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
//      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
//      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
//      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    // Task configuration.
    concat: {
      options: {
//        banner: '<%= banner %>',
        stripBanners: true
      },
      all: {
        files: {
          'dist/client-dist.js': [
            'node_modules/socket.io-client/socket.io.js',
            'client/jquery-2.1.1.js',
            'client/socketclient.js',
            'client/console.js',
            'client.js'
          ]
        }
      }
    },
    jasmine: {
      test: {
        src: ['server/*.js', 'client/*.js', 'common/*.js'],
        options: {
          specs: 'test/*.spec.js'
          /*
          ,
          helpers: 'test/testutil.js'
          */
        }
      }
    },
//    uglify: {
//      options: {
//        banner: '<%= banner %>'
//      },
//      dist: {
//        src: '<%= concat.dist.dest %>',
//        dest: 'dist/<%= pkg.name %>.min.js'
//      }
//    },

/*
    jshint: {
      options: {
        curly: false,
        devel: true,
        eqeqeq: false,
        immed: true,
        latedef: 'nofunc',
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        newcap: false,
        browser: true,
        globals: {
          jQuery: true
        }
      },
*/
//      all: ['lib/**/*.js']



//      gruntfile: {
//        src: 'Gruntfile.js'
//      },
//      lib_test: {
//        src: ['lib/**/*.js', 'test/**/*.js']
//      }
//  },
    watch: {
      src: {
        files: ['server/*.js', 'client/*.js', 'common/*.js', 'client.js'],
        tasks: ['default', 'test']
      },
      /*
      game: {
        files: ['index.js', 'lib/*.js'],
        tasks: ['default', 'test']
      },
      */
      test: {
        files: 'test/*.js',
        tasks: ['test']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // Default task.
  grunt.registerTask('default', [/*'jshint', 'qunit', */'concat:all' /*, 'uglify'*/]);
  // Test task.
  grunt.registerTask('test', ['jasmine']);

};
