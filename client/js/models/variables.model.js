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
            "specResult":null,

            "dimensions": {},
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
        },

        getDimensions: function(v_dims){
            var self = this;
            for(var i in v_dims){
                var t_sign = false, t_i = v_dims[i];
                if(t_i == "midfre" || t_i == "firsttime"){
                    t_sign = true;
                }
                self.get("dimensions")[t_i] = t_sign;
            }
        },

        toggleDimensions: function(v_dims, v_trigger){
            var self = this, t_dims = self.get("dimensions");
            for(var i in v_dims){
                var t_state = t_dims[i];
                if(t_state != null){
                    t_dims[i] = v_dims[i];
                }
            }
            if(v_trigger){
                self.trigger("subspaceChange", self.dimensions);
            }
        },

    }))();
});
