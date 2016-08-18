define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'datacenter',
    'config',
    'views/barchart.itemview',
    ], function(require, Mn, _, $, Backbone, Datacenter, Config, BarChart_ModelView) {
        'use strict';

        var Barchart_CollectionView = Mn.CollectionView.extend({
            tagName: 'div',

            attributes: {
                "id":"BarCharts",
                'style' : 'width: 100%; height:30%; margin: 1.75% 0% 1.75% 1%'
            },

            childView: BarChart_ModelView,

            childEvents: {
            },

            childViewOptions: {
                layout: null,
            },

            initialize: function (options) {
                var self = this;
            },
    });

return Barchart_CollectionView;
});
