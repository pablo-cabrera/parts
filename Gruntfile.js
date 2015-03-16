module.exports = function (grunt) {
    "use strict";

    var validateFiles = [
        "Gruntfile.js",
        "task/ytestrunner.js",
        "lib/parts.js",
        "test/parts-test.js"
    ];

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        meta: {
            banner: "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " +
                "<%= grunt.template.today(\"yyyy-mm-dd\") %>\n" +
                "<%= pkg.homepage ? \"* \" + pkg.homepage + \"\n\": \"\" %>" +
                "* Copyright (c) <%= grunt.template.today(\"yyyy\") %> " +
                "<%= pkg.author.name %>;" +
                " Licensed <%= _.pluck(pkg.licenses, \"type\").join(\", \") %> */"
        },

        test: {
            files: ["test/parts-test.js"]
        },

        uglify: {
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
                    outdir: "docs/"
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
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-jscs");

    // Local tasks
    grunt.loadTasks("task");

    // Defaults
    grunt.registerTask("default", ["jshint", "jscs", "test"]);
    grunt.registerTask("build", ["jshint", "jscs", "test", "uglify", "yuidoc"]);
};
