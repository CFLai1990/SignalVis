/**
 * Created by tangzhi.ye at 2015/12/10
 * model and collection for signal data
 */
define([
    'require',
    'marionette',
    'backbone',
    "models/signal"
], function(require, Mn, Backbone,Signal) {
    'use strict';
    var detailSignals = {};
    detailSignals.Model =  Backbone.Model.extend({
        defaults: {
            "signals": null, // collection of signals
            "minTime":-1, //
            "maxTime":-1, //
            "minMidfre":-1, //
            "maxMidfre":-1, //
            "bandwidthRange":null,
            "scopeRange":null,
            "carriernoiseRange":null,
        },
        initialize:function(options) {
            // this.set("signals",options.signals);
            // this.set("minTime",options.minTime);
            // this.set("maxTime",options.maxTime);
            // this.set("minMidfre",options.minMidfre);
            // this.set("maxMidfre",options.maxMidfre);
            this.set("bandwidthRange",options.bandwidthRange);
            this.set("scopeRange",options.scopeRange);
            this.set("carriernoiseRange",options.carriernoiseRange);
        }
    });
    detailSignals.Collection = Backbone.Collection.extend({
        model: detailSignals.Model,
        initialize: function(models, options) {
            var self = this;
            _.extend(this, _.pick(options, 'bandwidthRange', 'scopeRange',"carriernoiseRange"));
            // this.bandwidthRange = options.bandwidthRange；
            // self.scopeRange = options.scopeRange;
            // self.carriernoiseRange = options.carriernoiseRange;
        }
    });
    return detailSignals;
});
