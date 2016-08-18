define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    "models/barchart.model",
], function(require, Mn, _, $, Backbone, BarchartModel) {
    'use strict';

    var Barchart_Collection = Backbone.Collection.extend({
        model: BarchartModel,

        initialize: function(){
        },

    });
    return Barchart_Collection;
});
