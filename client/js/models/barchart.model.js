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
            self.init(options);
            self.settleCategories();
            // self.set(options);
            self.listenTo(Variables,"clearFilter", self.clearFilter);
            self.listenTo(Variables, "clearAll", self.clearAll);
        },

        init: function(v_opt){
            var self = this, t_obj;
            if(v_opt.category){
                var v_bins = v_opt.bins, t_bins = _.values(v_bins);
                var t_range = _.keys(v_bins), t_ind = t_range.indexOf("");
                if(t_ind>=0){
                    t_range[t_ind] = "NaN";
                }
                if(t_range.length == 1){
                    t_range.push("");
                    t_bins.push(0);
                }
                t_obj = {
                    "attrName": v_opt.name,
                    "totalBins": t_bins,
                    "numOfBins": t_bins.length,
                    "xRange": t_range,
                    "yRange": [_.min(t_bins), _.max(t_bins)],
                    "filterRangeName": v_opt.attr,
                    "scale": v_opt.scale,
                    "category": true,
                }
            }else{
                var v_bins = v_opt.bins, t_bins = [], t_num = Config.get("barchart").bins;
                for(var i = 0; i < t_num; i++){
                    t_bins.push(0);
                }
                for(var i in v_bins){
                    t_bins[parseInt(i)] = v_bins[i];
                }
                t_obj = {
                    "attrName": v_opt.name,
                    "totalBins": t_bins,
                    "numOfBins": t_bins.length,
                    "xRange": v_opt.range,
                    "yRange": [_.min(t_bins), _.max(t_bins)],
                    "filterRangeName": v_opt.attr,
                    "scale": v_opt.scale,
                    "category": false,
                }
            }
            self.set(t_obj);
        },

        update: function(v_bins){
            var self = this, t_bins = [];
            for(var i = 0; i < self.get("numOfBins") - 1; i++){
                t_bins.push(0);
            }
            if(self.get("category")){
                var t_dict = self.get("dictionary");
                for(var i in v_bins){
                    var t_c = v_bins[i], t_i = i;
                    if(t_i == ""){
                        t_i = "NaN";
                    }
                    t_bins[t_dict.get(t_i).order] = t_c;
                }
            }else{
                for(var i in v_bins){
                    t_bins[parseInt(i)] = v_bins[i];
                }
            }
            self.set("filterBins", t_bins);
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
                self.set("xRange", t_range);
                self.set("totalBins", t_bins);
                var t_dict = d3.map();
                for(var i in t_range){
                    if(t_range[i] == ""){
                        continue;
                    }
                    t_dict.set(t_range[i], {order: i});
                }
                self.set("dictionary", t_dict);
            }
        },

        clearFilter:function() {
            var self = this;
            self.set("filterBins", null);
        },

        clearAll: function(){
            var self = this;
            self.destroy();
        },
    });
});
