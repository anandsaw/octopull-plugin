var remapify = require('remapify');

module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-bumpx');
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		bump: {
			options: {},
			src: [ 'package.json', 'src/chrome/manifest.json' ]
		},
		copy: {
			chrome: {
				files: [
					{ expand: true, cwd: 'src/chrome/', src: ['manifest.json'], dest: 'tmp/chrome/', filter: 'isFile' },
					{ expand: true, cwd: 'src/', src: ['templates/**'], dest: 'tmp/chrome/', filter: 'isFile' },
					{ expand: true, cwd: 'src/chrome/', src: ['options.html', 'options.js'], dest: 'tmp/chrome/', filter: 'isFile' },
					{ expand: true, cwd: 'src/', src: ['**.css'], dest: 'tmp/chrome/', filter: 'isFile' }
				]
			}
		},
		browserify: {
			chrome: {
				options: {
					require: [ './src/chrome/templates.js:templates', './src/chrome/settings.js:settings' ]
				},
				files: {
					'tmp/chrome/octopull.js': ['./src/octopull.js']
				}
			},
			options: {
				watch: false,
				sourceMaps: true
			}
		},
		compress: {
			chrome: {
				options: {
					archive: 'dist/chrome-octopull.zip'
				},
				files: [
					{ expand: true, cwd: 'tmp/chrome/', src: ['**'] }
				]			}
		},
		clean: [ 'tmp/**' ],
		watch: {
			scripts: {
				files: [ 'src/**' ],
				tasks: [ 'build' ]
			}
		}
	});
	
	grunt.registerTask('build', ['clean', 'chrome']);
	
	grunt.registerTask('chrome', ['browserify:chrome', 'copy:chrome']);
	grunt.registerTask('default', 'Log some stuff.', function() {
		grunt.log.write('Logging some stuff...').ok();
	});
};