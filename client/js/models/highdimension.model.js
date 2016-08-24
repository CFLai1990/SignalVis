/**
 * Created by tangzhi.ye at 2015/12/16
 * model for high dimension view
 */
define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    "datacenter",
    "variables",
    "mds",
    "numeric"
], function(require, Mn, _, $, Backbone,Datacenter,Variables,Mds,Numeric) {
    'use strict';

    return Backbone.Model.extend({
        defaults: {
            // for plots
            "xmin":null,
            "xmax":null,
            "ymin":null,
            "ymax":null,

            //for dimension reduction
            "transformMatrix":null,


            "filterSignals":null,
            "filterSignalsArr":null, //arr only contains active dims
            "reductionSignals":null, // 2D arr
            "redraw":false,
            //
        },
        initialize: function(options){
            var self = this, t_d = options.dimensions;
            Variables.getDimensions(options.dimensions);
            self.listenTo(Variables, "subspaceChange", self.redraw);
            self.listenTo(Variables,"change:filterSignals", function(model, filterSignals){
                self.set("filterSignals",filterSignals);
                if(filterSignals && this.get("filterSignals").length > 5){
                    self.updateFilterSignalsArr();
                    self.dimRecution();
                    self.updateRange();
                }
                self.set("redraw",!self.get("redraw"));
            });
            self.listenTo(Variables, "clearAll", self.clearAll);
        },

        redraw: function(){
            var self = this;
            var t_data = self.updateFilterSignalsArr();
            var t_layout = self.dimRecution(t_data);
            self.updateRange();
            self.set("redraw",!self.get("redraw"));
        },

        updateFilterSignalsArr: function() {
            var self = this, v_dims = Variables.get("dimensions");
            var filterSignals = self.get("filterSignals"), t_arr = [];
            if(filterSignals) {
                console.time("updateFilterSignalsArr");
                for(var i in v_dims){
                    if(v_dims[i]){
                        console.log(i);
                        var tt_arr = _.map(filterSignals, "norm" + i);
                        t_arr.push(tt_arr);
                    }
                }
                console.timeEnd("updateFilterSignalsArr");
                self.set("filterSignalsArr", numeric.transpose(t_arr));
            }
            else{
                self.set("filterSignalsArr",null);
            }
        },

        dimRecution: function() {
            var self = this;
            var filterSignalsArr = self.get("filterSignalsArr");

            if(filterSignalsArr) {
                // console.log("~~~~~" + filterSignalsArr.length );
                console.time("calcTransMatrix");
                var transformMatrix = MDS.getCoordinates(filterSignalsArr);
                console.timeEnd("calcTransMatrix");
                // console.log(transformMatrix);
                console.time("calcReduction");
                // console.log(numeric);
                var reductionSignals =  numeric.dot(filterSignalsArr,transformMatrix);
                self.set("reductionSignals",reductionSignals);
                console.timeEnd("calcReduction");
                // console.log(reductionSignals);
            }
            else{
                self.set("reductionSignals",null);
            }
        },
        updateRange: function() {
            var self = this;
            var reductionSignals = self.get("reductionSignals");
            if(reductionSignals) {
                var xmax = _.max(reductionSignals, function(signal){ return signal[0]; })[0];
                var xmin = _.min(reductionSignals, function(signal){ return signal[0]; })[0];
                var ymax = _.max(reductionSignals, function(signal){ return signal[1]; })[1];
                var ymin = _.min(reductionSignals, function(signal){ return signal[1]; })[1];
                self.set("xmax",xmax);
                self.set("xmin",xmin);
                self.set("ymax",ymax);
                self.set('ymin',ymin);
                // console.log(self);
            }
            else {
                self.set("xmax",null);
                self.set("xmin",null);
                self.set("ymax",null);
                self.set('ymin',null);
            }

        },
        getNumActiveDims:function() {
            var count = 0;
            var t_dims = Variables.get("dimensions");
            for(var i in t_dims){
                if(t_dims[i])
                    count++;
            }
            return count;
        },

        clearAll: function(){
            var self = this;
            self.set({
                "xmin":null,
                "xmax":null,
                "ymin":null,
                "ymax":null,
                "transformMatrix":null,
                "filterSignals":null,
                "filterSignalsArr":null,
                "reductionSignals":null,
                "redraw":false,
            })
        },

    });
});
