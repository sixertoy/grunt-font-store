/**
 *
 *
 * grunt-font-base64
 * https://github.com/malas/grunt-font-base64
 *
 * Copyright (c) 2015 sixertoy
 * Licensed under the MIT license.
 *
 * Building the files object dynamically
 * @see http://gruntjs.com/configuring-tasks#building-the-files-object-dynamically
 *
 */
/*jslint indent: 4, nomen:true */
/*globals module, require */
(function () {
    'use strict';

    // variables
    var GOOGLE_API_HOST = 'fonts.googleapis.com',
        VALID_PROTOCOL = ['http:', 'https:'],
        VALID_FORMAT = ['woff', 'woff2'],
        // requires
        FS = require('fs'),
        URL = require('url'),
        Path = require('path'),
        Lodash = require('lodash'),
        fontOptim = require('fontoptim'),

        /**
         *
         * Methodes utilitaires
         *
         */
        utils = {
            isValidPath: function (value) {
                if (arguments.length < 1 || Lodash.isEmpty(value) || !Lodash.isString(value)) {
                    throw new Error('options.dest needs 1 argument');
                }
                return Path.normalize(value);
            },
            isValidFormat: function (value) {
                if (arguments.length < 1 || Lodash.isEmpty(value) || !Lodash.isString(value)) {
                    throw new Error('options.format needs 1 argument');
                }
                return (VALID_FORMAT.indexOf(value.toLocaleLowerCase()) !== -1);
            },
            isValidURL: function (value) {
                var parsed;
                if (arguments.length < 1 || Lodash.isEmpty(value) || !Lodash.isString(value)) {
                    throw new Error('options.files needs 1 argument');
                }
                parsed = URL.parse(value, true, true);
                return (parsed.slashes &&
                    parsed.hostname === GOOGLE_API_HOST &&
                    parsed.pathname.indexOf('css') !== -1 &&
                    parsed.query.hasOwnProperty('family') &&
                    VALID_PROTOCOL.indexOf(parsed.protocol) !== -1 &&
                    (Lodash.isString(parsed.query.family) && !Lodash.isEmpty(parsed.query.family))
                );
            },
            toAbsolute: function (value, base) {
                base = Path.normalize(base);
                value = Path.normalize(value);
                //
                if (!Path.isAbsolute(value)) {
                    value = Path.join(base, value);
                }
                return value;
            }
        };
    /**
     *
     * Exports
     *
     */
    module.exports = function (grunt) {

        // render = null;
        grunt.registerMultiTask('font_base64', 'Generates CSS files with WOFF(2) fonts embedded as Base64', function () {

            var isValidFormat, isValidPath, name,
                promises = [],
                embedded = '',
                done = this.async(),
                cwd = process.cwd(),
                options = this.options({
                    format: 'woff', // woff2
                    dest: Path.join(cwd, 'fonts.css'),
                    debug: (grunt.option('debug') === 1)
                });

            isValidPath = utils.isValidPath(options.dest);
            isValidFormat = utils.isValidFormat(options.format);

            if (!isValidPath) {
                grunt.log.error('options.dest is not valid');

            } else if (!isValidFormat) {
                grunt.log.error('options.format is not valid');

            } else {
                // check if is file
                // dossier de sortie du css
                options.dest = utils.toAbsolute(options.dest, cwd);
                // supp du dossier de sortie if exists
                if (FS.existsSync(options.dest)) {
                    FS.unlinkSync(options.dest);
                }
                // filtre sur les URL de la config
                // matching:
                // - contains fonts.googleapis.com
                // - contains /css
                // - contains ?family
                // ...
                this.data.fonts.filter(function (url) {
                    return utils.isValidURL(url);
                }).map(function (url) {
                    promises.push(url);
                });

                // iterates trough valid url
                promises.forEach(function (url, index) {
                    console.log(url);
                });
                /*
                var formatsCss = fontoptim(fonts, options);

                // Save CSS
                for (var format in formatsCss) {
                    var filename = this.data.dest + '.' + format + '.css';
                    grunt.file.write(filename, formatsCss[format]);
                    grunt.log.writeln('File ' + filename.cyan + ' created.');
                }
                */
                /*
                promises.forEach(function (url, index) {
                    try {
                        FontStore(url, {
                            format: options.format
                        }, function (err, fileName, json) {

                            console.log(index);
                            console.log(err);

                            if (err) {
                                // grunt.log.error('An error occurred:', err.message);

                            } else {
                                grunt.log.debug('Conversion successful! ' + fileName);
                                embedded += json.value;
                                console.log(embedded);

                            }
                            if ((index + 1) === promises.length) {
                                // @create utils.concatfile method
                                done();
                            }
                        });
                    } catch (e) {
                        console.log(e);
                    }
                    */
                });
            }
        });
    };
    module.exports.utils = utils;

}());