/**
 * Created by tangzhi.ye at 2015/11/24
 * model for interaction
 */
define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    "datacenter",
    "variables"
], function(require, Mn, _, $, Backbone,Datacenter,Variables) {
    'use strict';

    return Backbone.Model.extend({
        defaults: {
            "xModel":null,
            "yModel":null,

            // for plots
            "xmin":null,
            "xmax":null,
            "xName":null,
            "ymin":null,
            "ymax":null,
            "yName":null,

            "filterSignals":null,
            "redraw":false,
            //
        },
        initialize: function(options){

            var self = this;
            // console.log(options);
            self.set("xModel",options.xModel);
            self.set("yModel",options.yModel);
            self.set("filterSignals",options.filterSignals);
            self.listenTo(self,"change:xModel", function(model, xModel){
                self.updateX();
                self.set("redraw",!self.get("redraw"));
            });
            self.listenTo(self,"change:yModel", function(model, yModel){
                self.updateY();
                self.set("redraw",!self.get("redraw"));

            });
            // self.listenTo(Variables,"change:bandwidthFilterRange", function(model, bandwidthFilterRange){
            //     self.updateX();
            //     self.updateY();
            //     self.set("redraw",!self.get("redraw"));

            // });
            // self.listenTo(Variables,"change:scopeFilterRange", function(model, scopeFilterRange){
            //     self.updateX();
            //     self.updateY();
            //     self.set("redraw",!self.get("redraw"));
            // });
            // self.listenTo(Variables,"change:carriernoiseFilterRange", function(model, carriernoiseFilterRange){
            //     self.updateX();
            //     self.updateY();
            // });
            self.listenTo(Variables, "changeFilterRange",  function(model, carriernoiseFilterRange){
                self.updateX();
                self.updateY();
            });
            self.listenTo(Variables,"change:filterSignals", function(model, filterSignals){
                // console.log(12121212);
                self.set("filterSignals",filterSignals);
                self.set("redraw",!self.get("redraw"));

            });

            self.listenTo(self,"change:filterSignals", function(model, filterSignals){
                self.set("redraw",!self.get("redraw"));
            });

            //             self.listenTo(self,"change:filterSignals", function(model, filterSignals){
            //     self.set("redraw",!self.get("redraw"));
            // });
            // console.log(self);

            self.updateX(options.xModel);
            self.updateY(options.yModel);
            self.listenTo(Variables, "clearAll", self.clearAll);
        },

        updateX:function() {
            var self = this;
            var xMode = self.get('xModel');
            var self = this;
            var filterRangeName = xMode.get('filterRangeName');
            var filterRange = Variables.get("filterRanges")[filterRangeName];
            // console.log()
            if(!filterRange) {
                self.set("xmin",xMode.get('xmin'));
                self.set("xmax",xMode.get('xmax'));
            }
            else {
                self.set("xmin",filterRange[0]);
                self.set("xmax",filterRange[1]);
            }
            self.set("xName",xMode.get('attrName'));
        },

        updateY:function() {
            var self = this;

            var yModel = self.get('yModel');
            var self = this;
            var filterRangeName = yModel.get('filterRangeName');
            var filterRange = Variables.get("filterRanges")[filterRangeName];
            if(!filterRange) {
                self.set("ymin",yModel.get('xmin'));
                self.set("ymax",yModel.get('xmax'));
            }
            else {
                self.set("ymin",filterRange[0]);
                self.set("ymax",filterRange[1]);
            }

            self.set("yName",yModel.get('attrName'));
        },

        clearAll: function(){
            var self = this;
            self.set({
                "xModel":null,
                "yModel":null,
                "xmin":null,
                "xmax":null,
                "xName":null,
                "ymin":null,
                "ymax":null,
                "yName":null,
                "filterSignals":null,
                "redraw":false,
            })
        },
    });
});
