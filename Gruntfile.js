var exec = require("child_process").exec;

module.exports = function (grunt) {
    "use strict";
    require("load-grunt-tasks")(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        watch: {
            options: {
                livereload: true
            },
            html: {
                files: [
                    "src/**/*.html"
                ],
                tasks: [
                    "htmlmin:dist"
                ]
            },
            less: {
                options: {
                    livereload: false
                },
                files: "src/less/*.less",
                tasks: [
                    "less:dist",
                    "autoprefixer:dist",
                    "cssmin:dist"
                ]
            },
            scripts: {
                files: [
                    "src/js/*.js"
                ],
                tasks: [
                    "newer:jshint:all",
                    "concat:js",
                    "uglify:dist"
                ]
            }
        },
        less: {
            dist: {
                options: {
                    paths: [
                        "src/less/"
                    ],
                    sourceMap: true
                },
                src: [
                    "src/less/**/*.less"
                ],
                dest: "src/dist/before.prefix.styles.css"
            }
        },
        jshint: {
            all: { 
                src: [
                    "src/js/**/*.js"
                ]
            }
        },
        concat: {
            options: {
                stripBanners: true,
                separator: ";\n"
            },
            js: {
                src: [
                    "src/js/main.js"
                ],
                dest: "src/dist/built.js"
            }
        },
        uglify: {
            options: {
                preserveComments: false,
                report: "gzip"
            },
            dist: {
                src: "src/dist/built.js",
                dest: "public/js/main.min.js"
            }
        },
        cssmin: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    "public/css/styles.min.css": "src/dist/styles.css"
                }
            }
        },
        // If prefixes arent being applied correctly possibly run `npm update caniuse-db`
        autoprefixer: {
            options: {
                browsers: ["last 2 versions", "ie 10", "ie 11"]
            },
            dist: {
                src: "src/dist/before.prefix.styles.css",
                dest: "src/dist/styles.css"
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: "src/img/",
                    src: ["**/*.{png,jpg,jpeg,gif}"],
                    dest: "public/img/"
                }]
            }
        },
        // Bigger projects src folder should have an html file
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeCommentsFromCDATA: true,
                    collapseBooleanAttributes: true,
                    removeRedundantAttributes: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    caseSensitive: true
                },
                expand: true,
                cwd: "src",
                src: [
                    "**/*.html"
                ],
                dest: "public/"
            }
        },
        validation: {
            dist: {
                expand: true,
                src: [
                    "src/**/*.html"
                ]
            }
        },
        notify: {
            dist: {
                options: {
                    title: "Build Complete",
                    message: "Success!"
                }
            }
        },

        copy: {
            dist: {
                files: [
                    { 
                        expand: true,
                        cwd: "src",
                        src: [
                            "favicon.ico",
                            "CNAME"
                        ], 
                        dest: "public/",
                        filter: "isFile" 
                    },
                    { 
                        expand: true, 
                        cwd: "src", 
                        src: [
                            "fonts/**"
                        ],
                        dest: "public/"
                    }
                ]
            }
        },
        // BE CAREFUL WHAT PATHS YOU DECLARE AS IT UNLINKS FILES
        clean: [
            "src/dist"
        ]
    });

    grunt.registerTask("build", [
        "jshint",
        "less",
        "autoprefixer",
        "cssmin",
        "concat",
        "uglify",
        "newer:copy",
        "newer:imagemin",
        "htmlmin",
        "clean",
        "notify"
    ]);

    grunt.registerTask("deploy", [
        "build",
        "gh-pages"
    ]);
    grunt.registerTask("validate", [
        "validation"
    ]);
    grunt.registerTask("default", [
        "build",
        "watch"
    ]);
    grunt.registerTask("set_remote", function () {
        var url = grunt.option("url");
        if (!url) {
            throw Error("Need to pass url to set new remote url with command line flag --url");
        } else {
            exec("git remote set-url origin " + url);
        }
    });
};
