/**
 * Created by tangzhi.ye at 2015/11/24
 * model for interaction
 */
define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone'
], function(require, Mn, _, $, Backbone) {
    'use strict';

    return window.Variables = new (Backbone.Model.extend({
        defaults: {
            "loading": true,//whether show the loading page
            "finishInit" : false, // whether init process finished
            //
            "mode":"zoomout", // zoomout or zoomin
            "filterRanges": {},
            "bandwidthFilterRange":null, // null is not filter
            "scopeFilterRange":null,
            "carriernoiseFilterRange":null,
            "firsttimeFilterRange":null, //
            "midfreFilterRange":null,

            "zoominFirsttimeFilterRange":null,
            "zoominMidfreFilterRange":null,
            "detailSignals":null, //secondary zoom in signal
            'filterSignals':null, //

            //filter result
            "bandwithFilterArr":null, // null is not filter
            "timeFilterArr":null, //
            "midfreFilterArr":null,
            "scopeFilterArr":null,
            "carriernoiseFilterArr":null,

        },

        initialize: function(){
            var self = this;
        },

        setFilterRange: function(v_attr, v_value, v_silent){
            var self = this;
            self.get("filterRanges")[v_attr] = v_value;
            if(!v_silent){
                self.trigger("changeFilterRange");
            }
        },

        triggerFilter: function(){
            var self = this;
            self.trigger("changeFilterRange");
        }

    }))();
});
