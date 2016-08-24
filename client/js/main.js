require.config({
    shim: {
         'bootstrap': ['jquery'],
         'backbone': {
            deps: ['jquery','underscore']
        },
        "jqueryUI": {
            export:"$",
            deps: ['jquery'],
        },
        'tooltip': ['jquery', 'bootstrap'],
     },
    paths: {
        // libs loader
        'text': '../bower_components/text/text',
        'jquery': ['../bower_components/jquery/dist/jquery.min'],
        'jqueryUI':['../bower_components/jquery-ui/jquery-ui'],
        'underscore': ['../bower_components/underscore/underscore-min'],
        'bootstrap': ['../bower_components/bootstrap/dist/js/bootstrap.min'],
        "bootstrapSwitch":['../bower_components/bootstrap-switch/dist/js/bootstrap-switch.min'],
        'backbone': ['../bower_components/backbone/backbone-min'],
        'marionette': ['../bower_components/backbone.marionette/lib/backbone.marionette.min'],
        'backbone.relational': ['../bower_components/backbone-relational/backbone-relational'],
        'backbone.routefilter': '../bower_components/backbone.routefilter/dist/backbone.routefilter.min',
        'd3': ['../bower_components/d3/d3'],
        'nprogress': ['../bower_components/nprogress/nprogress'],
        'highstock': ['../bower_components/highstock/js/highstock.src'],
        "contextMenu":['../bower_components/contextMenu/contextMenu.min'],
        "numeric":["../bower_components/numeric.min"],
        "mds":["../bower_components/mds"],
        "colorbrewer":["../bower_components/colorbrewer"],
        // templates path
        'templates': '../templates',
        'tooltip': '../bower_components/tooltip',

        'datacenter': 'models/datacenter.model',
        'config': 'models/config.model',
        'variables': 'models/variables.model'
    }
});

// require(['app'], function (App) {
//     'use strict';
//     var app = new App();
//     app.start();
// });

require(['jquery', 'underscore', 'd3',"numeric","jqueryUI","colorbrewer"], function ($, _, d3,Numeric) {
    'use strict';
    // console.log(colorbrewer);
    require(['backbone', 'bootstrap','highstock'], function (Backbone, Bootstrap,Highstock) {
        require(['app'], function (App) { // require.js shim不能与cdn同用,因此3层require,非amd module需要如此
            var app = new App();
            app.start();
        });
    });
});
