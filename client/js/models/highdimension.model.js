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
            //active dimension
            "bandwidthActive": false,
            "midfrequencyActive": false,
            "firsttimeActive": false,
            "scopeActive": false,
            "carriernoiseActive": false,

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

            var self = this;
            self.set("bandwidthActive",options.bandwidthActive);
            self.set("midfrequencyActive",options.midfrequencyActive);
            self.set("firsttimeActive",options.firsttimeActive);
            self.set("scopeActive",options.scopeActive);
            self.set("carriernoiseActive",options.carriernoiseActive);

            // self.listenTo(Variables,"change:filterSignals", function(model, filterSignals){

            //     self.set("filterSignals",filterSignals);
            //     // console.log(filterSignals);
            //     if(filterSignals && this.get("filterSignals").length > 5){
            //         self.updateFilterSignalsArr();
            //         self.dimRecution();
            //         self.updateRange();
            //     }
            //     self.set("redraw",!self.get("redraw"));

            // });

            self.listenTo(self,"change:bandwidthActive", function(model, bandwidthActive){
                if(this.get("filterSignals") && this.get("filterSignals").length > 5) {
                    self.updateFilterSignalsArr();
                    self.dimRecution();
                    self.updateRange();
                    self.set("redraw",!self.get("redraw"));
                }
                // self.set("redraw",!self.get("redraw"));

            });
            self.listenTo(self,"change:firsttimeActive", function(model, firsttimeActive){
                if(this.get("filterSignals")&& this.get("filterSignals").length > 5) {
                    self.updateFilterSignalsArr();
                    self.dimRecution();
                    self.updateRange();
                    self.set("redraw",!self.get("redraw"));
                }
            });
            self.listenTo(self,"change:midfrequencyActive", function(model, midFrequencyActive){
                if(this.get("filterSignals")&& this.get("filterSignals").length > 5) {

                    self.updateFilterSignalsArr();
                    self.dimRecution();
                    self.updateRange();
                    self.set("redraw",!self.get("redraw"));
                }
            });
            self.listenTo(self,"change:scopeActive", function(model, scopeActive){
                if(this.get("filterSignals")&& this.get("filterSignals").length > 5) {
                    self.updateFilterSignalsArr();
                    self.dimRecution();
                    self.updateRange();
                    self.set("redraw",!self.get("redraw"));
                }
            });
            self.listenTo(self,"change:carriernoiseActive", function(model, carriernoiseActive){
                if(this.get("filterSignals")&& this.get("filterSignals").length > 5) {

                    self.updateFilterSignalsArr();
                    self.dimRecution();
                    self.updateRange();
                    self.set("redraw",!self.get("redraw"));
                }
            });

        },
        updateFilterSignalsArr: function() {
            var self = this;
            var filterSignals = self.get("filterSignals");
            if(filterSignals) {
                console.time("updateFilterSignalsArr");
                var filterSignalsArr = [];
                for(var i=0;i<filterSignals.length;i++) {
                    var signalArr = [];
                    var signal = filterSignals[i];
                    if (this.get("bandwidthActive"))
                        signalArr.push(signal.normBandwidth);
                    if (this.get("midfrequencyActive"))
                        signalArr.push(signal.normMidfrequency);
                    if(this.get("firsttimeActive"))
                        signalArr.push(signal.normFirsttime);
                    if(this.get("scopeActive"))
                        signalArr.push(signal.normScope);
                    if(this.get("carriernoiseActive"))
                        signalArr.push(signal.normCarriernoise);

                    filterSignalsArr.push(signalArr);
                }
                console.timeEnd("updateFilterSignalsArr");
                self.set("filterSignalsArr",filterSignalsArr);
                // console.log(filterSignalsArr);
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
            if (this.get("bandwidthActive"))
                count++;
            if (this.get("midfrequencyActive"))
                count++;
            if(this.get("firsttimeActive"))
                count++;
            if(this.get("scopeActive"))
                count++;
            if(this.get("carriernoiseActive"))
                count++;
            return count;
        },



    });
});
