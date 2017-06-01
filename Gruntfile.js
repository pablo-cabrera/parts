module.exports = function (grunt) {
    "use strict";

    var testFiles = [
        "lib/parts.js",
        "test/cases/parts.js"
    ];

    var validateFiles = ["Gruntfile.js"].concat(testFiles);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        meta: {
            banner:
                "/*! " +
                "<%= pkg.title || pkg.name %> v<%= pkg.version %> | " +
                "(c) <%= grunt.template.today(\"yyyy\") %> " +
                "<%= pkg.author.name %> | " +
                " Available via <%= pkg.license %> license " +
                "*/"
        },

        gabarito: {
            src: testFiles,

            options: {
                environments: ["node", "phantom"]
            }
        },

        uglify: {
            options: {
                banner: "<%= meta.banner %>\n"
            },

            dist: {
                src: "lib/parts.js",
                dest: "dist/parts.js"
            }
        },

        jshint: {
            options: {
                /* enforcing */
                strict: true,
                bitwise: false,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                noempty: true,
                plusplus: true,
                quotmark: "double",

                undef: true,

                /* relaxing */
                eqnull: true,
                sub: true,

                /* environment */
                node: true,
                browser: true,
                globals: { modl: true }
            },

            files: validateFiles
        },

        yuidoc: {
            compile: {
                name: "<%= pkg.name %>",
                description: "<%= pkg.description %>",
                version: "<%= pkg.version %>",
                url: "<%= pkg.homepage %>",
                options: {
                    paths: "lib/",
                    outdir: "docs/",
                    themedir: "node_modules/yuidoc-clear-theme"
                }
            }
        },

        jscs: {
            src: validateFiles,
            options: {
                config: ".jscsrc"
            }
        },

        clean: [
            "docs",
            "test-result",
            "dist"
        ]

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-yuidoc");
    // grunt.loadNpmTasks("grunt-gabarito");
    grunt.loadNpmTasks("grunt-jscs");

    grunt.registerTask("lint", ["jscs", "jshint"]);

    grunt.registerTask("default", ["lint"/*, "gabarito"*/]);
    grunt.registerTask("dist", ["uglify"]);
};
