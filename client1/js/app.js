define([
    'require',
    'marionette',
    'backbone',
    'underscore',
    'jquery',
    'bootstrap',
    "nprogress",
    "controls/router",
    "controls/controller"
], function (require, Mn, Backbone, _, $, Bootstrap,NProgress, Router, Controller) {
    'use strict';

    var RootView = Mn.LayoutView.extend({
        el: 'body',
        regions: {
            'app': '#signal-app'
        }
    });

    var App = Mn.Application.extend({

        onBeforeStart: function () { // 一些设置工作

            var self = this;
            NProgress.configure({
                showSpinner: true
            });

            window.NProgress = NProgress;
        },


        onStart: function() {

            this.appRoot = new RootView();
            window.router = this.router = new Router({
                controller: new Controller({appRoot: this.appRoot})
            });

            if (Backbone.history) {
                Backbone.history.start({
                    root: '/',
                    pushState: true
                });
            }
        }

    });
    return App;
});
