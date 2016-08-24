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
    "datacenter"
], function(require, Mn, _, $, Backbone,Datacenter) {
    'use strict';

    return Backbone.Model.extend({
        defaults: {
            "attrName":null,
            "dataDictArr":null, //[{"attr": ,"indexs":[]}] //all data
            "filterRangeName": null, //[] reference to Config
            "filterDataArrName": null,
            // for plots
            "scale":"linear", // scale method
            "numOfBins": Config.get("barchart").bins,
            "xRange": null,
            "yRange": null,
            "totalBins":null, //[]
            "filterBins":null,
            "mode":"zoomout", //"zoomout" or "zoomin"
            "dictionary": null,
            "category": false,
        },

        initialize: function(options){
            var self = this;
            self.settleCategories();
            self.set(options);
            self.listenTo(Variables,"change:filterSignals", function(model, filterSignals){
                self.calcFilterBins(filterSignals);
            });
            self.listenTo(Datacenter, "clearAll", self.clearAll);
        },

        settleCategories: function(){
            var self = this;
            if(self.get("category")){
                var t_range = self.get("xRange"), t_ind = t_range.indexOf("NaN");
                var t_bins = self.get("totalBins");
                if(t_ind >=0){
                    t_range.splice(t_ind,1);
                    t_range.splice(0,0,"NaN");
                    var t_bin = t_bins.splice(t_ind,1);
                    t_bins.splice(0,0,t_bin[0]);
                }
            }
            self.set("xRange", t_range);
            self.set("totalBins", t_bins);
            var t_dict = self.get("dictionary");
            for(var i in t_range){
                t_dict.get(t_range[i]).order = i;
            }
        },

        calcFilterBins:function(filterSignals) {
            var self = this;
            var attrName = self.get("attrName");
            // var dataDictArr = self.get("dataDictArr");
            var numOfBins = self.get("numOfBins");
            var t_xRange = self.get("xRange");
            var xmin = t_xRange[0];
            var xmax = t_xRange[1];
            var binRange = (xmax - xmin)/numOfBins
            var filterBins = [];
            for(var i =0;i<numOfBins;i++) {
                filterBins.push(0);
            }
            if(filterSignals) {
                if(self.get("category")){
                    var t_dict = self.get("dictionary").entries(), 
                    t_name = self.get("attrName");
                    _.filter(filterSignals, function(t_d){
                        var tt_d = t_d[t_name];
                        for(var i in t_dict){
                            var tt_dict = t_dict[i].value;
                            if(tt_d == tt_dict.num){
                                filterBins[tt_dict.order] ++;
                                break;
                            }
                        }
                    });
                }else{
                    for(var i=0;i<filterSignals.length;i++) {
                        var binIndex = parseInt((filterSignals[i][attrName] - xmin)/binRange);
                        if(binIndex >=numOfBins)
                            binIndex = numOfBins - 1;
                        filterBins[binIndex]  = filterBins[binIndex] + 1;
                    }
                }
            }
            else {
                filterBins = null;
            }
            self.set("filterBins",filterBins);
        },

        clearAll: function(){
            var self = this;
            self.destroy();
        },
    });
});
