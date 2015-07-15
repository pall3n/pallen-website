'use strict';

/**
 * Livereload and connect variables
 */
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
  port: LIVERELOAD_PORT
});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};


/**
 * Grunt module
 */
module.exports = function(grunt) {

	/**
		* Dynamically load npm tasks
	*/
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


	grunt.initConfig({

		/**
			* Read text from package.json and assign to pkg var
		*/
		pkg: grunt.file.readJSON('package.json'),


		/**
			* Set project info
		*/
		project: {
			src: 'src',
			dist: 'dist',
			
			sassDir: '<%= project.src %>/css',
			sassFile: 'styles.scss',
			sass: '<%= project.sassDir %>/<%= project.sassFile %>',
			
			cssDir: '<%= project.dist %>/assets/css',
			cssFile: 'styles.css',
			css: '<%= project.cssDir %>/<%= project.cssFile %>',

			jsSrcDir: '<%= project.src %>/js',
			jsDistDir: '<%= project.dist %>/assets/js',
			jsFile: 'scripts.js',
			jsSrc: '<%= project.jsSrcDir %>/<%= project.jsFile %>',
			jsDist: '<%= project.jsDistDir %>/<%= project.jsFile %>',

			imgDir: '<%= project.src %>/img'
		},


		/**
			* Project banner
			* Dynamically appended to CSS/JS files
			* Inherits text from package.json
		*/
		tag: {
			banner: '/*!\n' +
				' * <%= pkg.name %>\n' +
				' * <%= pkg.title %>\n' +
				' * <%= pkg.url %>\n' +
				' * @author <%= pkg.author %>\n' +
				' * @version <%= pkg.version %>\n' +
				' * Copyright <%= pkg.copyright %>. <%= pkg.license %> licensed.\n' +
				' */\n'
		},


		/**
			* Connect port/livereload
			* https://github.com/gruntjs/grunt-contrib-connect
			* Starts a local webserver and injects
			* livereload snippet
		*/
		connect: {
			options: {
				port: 9000,
				hostname: '*'
			},
			livereload: {
				options: {
					middleware: function (connect) {
						return [lrSnippet, mountFolder(connect, 'dist')];
					}
				}
			}
		},


		/**
			* Clean files and folders
			* https://github.com/gruntjs/grunt-contrib-clean
			* Remove generated files for clean deploy
		*/
		clean: {
			dist: [
				'<%= project.dist %>'
			]
		},


		/**
			* Concatenate JavaScript files
			* https://github.com/gruntjs/grunt-contrib-concat
			* Imports all .js files and appends project banner
		*/
		concat: {
			dev: {
				files: {
					'<%= project.jsDistDir %>/scripts.min.js': '<%= project.jsSrc %>'
				}
			},
			options: {
				stripBanners: true,
				nonull: true,
				banner: '<%= tag.banner %>'
			}
		},


		/**
			* Uglify (minify) JavaScript files
			* https://github.com/gruntjs/grunt-contrib-uglify
			* Compresses and minifies all JavaScript files into one
		*/
		uglify: {
			options: {
				banner: '<%= tag.banner %>'
			},
			dist: {
				files: {
					'<%= project.jsDist %>/scripts.min.js': '<%= project.jsSrc %>'
				}
			}
		},


		/**
			* Compile Sass/SCSS files
			* https://github.com/gruntjs/grunt-contrib-sass
			* Compiles all Sass/SCSS files and appends project banner
		*/
		sass: {
			dist: {
				options: {
					style: 'expanded',
					sourcemap: true
				},
				files: {
					'<%= project.css %>': '<%= project.sass %>'
				}
			}
		},


		/**
			* Autoprefixer
			* Adds vendor prefixes if need automatcily
			* https://github.com/nDmitry/grunt-autoprefixer
		*/
		autoprefixer: {
			options: {
				browsers: [
					'last 2 version',
					'safari 6',
					'ie 9',
					'opera 12.1',
					'ios 6',
					'android 4'
				]
			},
			dev: {
				files: {
					'<%= project.cssDir %>/styles.min.css': ['<%= project.css %>']
				}
			},
			dist: {
				files: {
					'<%= project.cssDir %>/styles.prefixed.css': ['<%= project.css %>']
				}
			}
		},


		/**
			* CSSMin
			* CSS minification
			* https://github.com/gruntjs/grunt-contrib-cssmin
		*/
		cssmin: {
			dist: {
				options: {
					banner: '<%= tag.banner %>'
				},
				files: {
					'<%= project.cssDir %>/styles.min.css': ['<%= project.css %>']
				}
			}
		},


		/**
			* Opens the web server in the browser
			* https://github.com/jsoverson/grunt-open
		*/
		open: {
			server: {
				path: 'http://localhost:<%= connect.options.port %>',
				app: 'Google Chrome'
			}
		},


		/**
			* Generates a KSS living styleguide
			* https://github.com/t32k/grunt-kss
		*/
		kss: {
			dist: {
				options: {
					includeType: 'css',
					includePath: '<%= project.css %>',
					template: 'styleguide/template'
				},
				files: {
					'styleguide': ['<%= project.sassDir %>/']
				},
			}
		},


		/**
			* Runs tasks against changed watched files
			* https://github.com/gruntjs/grunt-contrib-watch
			* Watching development files and run concat/compile tasks
			* Livereload the browser once complete
		*/
		watch: {
			concat: {
				files: '<%= project.jsSrcDir %>/**/*.js',
				tasks: ['concat:dev']
			},
			sass: {
				files: '<%= project.sassDir %>/**/*.scss',
				tasks: ['sass:dist', 'cssmin:dist', 'autoprefixer:dist']
			},
			livereload: {
				options: {
					livereload: LIVERELOAD_PORT
				},
				files: [
					'<%= project.dist %>/**/*.html',
					'<%= project.cssDir %>/**/*.css',
					'<%= project.jsDistDir %>/js/**/*.js',
					'<%= project.src %>/**/*.{png,jpg,jpeg,gif,webp,svg}'
				]
			}
		}

	});

	/**
		* Default task
		* Run `grunt` on the command line
	*/
	grunt.registerTask('default', [
		'sass:dist',
		'autoprefixer:dist',
		'cssmin:dist',
		'concat:dev',
		'connect:livereload',
		'kss:dist',
		'watch'
	]);


	/**
		* Default task
		* Run `grunt` on the command line
	*/
	grunt.registerTask('openup', [
		'sass:dist',
		'autoprefixer:dist',
		'cssmin:dist',
		'concat:dev',
		'connect:livereload',
		'open',
		'kss:dist',
		'watch'
	]);


	/**
		* Build task
		* Run `grunt build` on the command line
		* Then compress all JS/CSS files
	*/
	grunt.registerTask('build', [
		'sass:dist',
		'autoprefixer:dist',
		'cssmin:dist',
		'clean:dist',
		'kss:dist',
		'uglify'
	]);
};