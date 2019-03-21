'use strict';
module.exports = function(grunt) {

    //Mostra o tempo que foi gasto para executar estas tarefas
    require('time-grunt')(grunt);

    // Carrega todas as terefas Grunt que estão listadas no arquivo package.json automaticamente
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        
        pkg: grunt.file.readJSON('package.json'),
        
        browserify: {
            build: {
                src: [
                    'client/assets/**/*.js',
                    'client/gameProperties.js',
                    'client/game.js' 
                ],
                dest: 'client/bundle.js'
            }
        },

        // criar o server
        connect: {
            server: {
                options: {
                    hostname: "*",
                    port: 9001,
                    base: 'client/',
                    livereload: true
                }
            }
        },

        watch: {
            options: {
                livereload: true
            },
            includes: {
                files: ['*.html', 'client/**/*.html', 'client/*.html'],
                files: ['*.js', 'client/**/*.js', 'client/*.js'],
            }
        },

        //  Abre o navegador com o server recém criado
        open: {
            all: {
                // Define a url com a porta configurada acima
                path: 'http://localhost:<%= connect.server.options.port%>/index.html'
            }
        }

    });

    // # grunt serve
    grunt.registerTask(
        'serve',
        [
            'browserify',
            'connect',
            'open',
            'watch'
        ]
    );

};