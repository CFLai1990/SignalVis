/**
 * Created by tangzhi.ye at 2015/11/30
 * router for app
 */
define([
    'backbone.routefilter',
    'marionette',
], function(Routefilter, Mn) {
    'use strict';

    var router = Mn.AppRouter.extend({
        appRoutes: {

            // default route
            "*default": "showApp"

        },

        before: function (route, params) {
            window.NProgress.start();
        },

        after: function (route, params) {
            window.NProgress.done();
        }
    });

    return router;
});

