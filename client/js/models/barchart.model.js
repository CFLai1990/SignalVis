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
            "numOfBins":40,
            "xmin":null,
            "xmax":null,
            "ymin":null,
            "ymax":null,
            "totalBins":null, //[]
            "filterBins":null,
            "mode":"zoomout", //"zoomout" or "zoomin"
//

            //
        },
        initialize: function(options){

            var self = this;
            // console.log(options);
            self.set("attrName",options.attrName);
            self.set("dataDictArr",options.dataDictArr);
            self.set("filterRange",options.filterRange);
            self.set("filterDataArr",options.filterDataArr);
            self.set("scale",options.scale);
            self.calcTotalBins();
            self.listenTo(Variables,"change:filterSignals", function(model, filterSignals){
                self.calcFilterBins(filterSignals);
            });
        },
        calcZoominBins: function() {
            var self = this;
            var attrName = self.get("attrName");
            var dataDictArr = self.get("dataDictArr");
            var numOfBins = self.get("numOfBins");

            var xmin = dataDictArr[0][attrName]
            var xmax = dataDictArr[dataDictArr.length - 1][attrName]
            var binRange = (xmax - xmin)/numOfBins
            var filterBins = [];
            for(var i =0;i<numOfBins;i++) {
                filterBins.push(0);
            }
            if(filterSignals) {
                for(var i=0;i<filterSignals.length;i++) {
                    var binIndex = parseInt((filterSignals[i][attrName] - xmin)/binRange);
                    if(binIndex >=numOfBins)
                        binIndex = numOfBins - 1;
                    filterBins[binIndex]  = filterBins[binIndex] + 1;
                }
            }
            else {
                filterBins = null;
            }
            // console.log(filterBins);
            self.set("filterBins",filterBins);
        },

        calcTotalBins: function() {
            var self = this;
            var attrName = self.get("attrName");
            var dataDictArr = self.get("dataDictArr");
            var numOfBins = self.get("numOfBins");
            // var ymax = _.max(dataDictArr, function(o){return o.indexs.length;}).indexs.length;
            // var ymin = _.min(dataDictArr, function(o){return o.indexs.length;}).indexs.length;
            var xmin = dataDictArr[0][attrName]
            var xmax = dataDictArr[dataDictArr.length - 1][attrName]
            var binRange = (xmax - xmin)/numOfBins
            var totalBins = [];
            for(var i =0;i<numOfBins;i++) {
                totalBins.push(0);
            }
            for(var i=0;i<dataDictArr.length;i++) {
                var binIndex = parseInt((dataDictArr[i][attrName] - xmin)/binRange);
                if(binIndex >=numOfBins)
                    binIndex = numOfBins - 1;
                totalBins[binIndex]  = totalBins[binIndex] + dataDictArr[i].indexs.length;
            }

            var ymax = _.max(totalBins);
            var ymin = 0;
            self.set("ymax",ymax);
            self.set("ymin",ymin);
            self.set("xmax",xmax);
            self.set('xmin',xmin);
            self.set('totalBins',totalBins);
        },

        calcFilterBins:function(filterSignals) {
            // console.log(filterSignals);
            var self = this;
            var attrName = self.get("attrName");
            var dataDictArr = self.get("dataDictArr");
            var numOfBins = self.get("numOfBins");

            var xmin = dataDictArr[0][attrName]
            var xmax = dataDictArr[dataDictArr.length - 1][attrName]
            var binRange = (xmax - xmin)/numOfBins
            var filterBins = [];
            for(var i =0;i<numOfBins;i++) {
                filterBins.push(0);
            }
            if(filterSignals) {
                for(var i=0;i<filterSignals.length;i++) {
                    var binIndex = parseInt((filterSignals[i][attrName] - xmin)/binRange);
                    if(binIndex >=numOfBins)
                        binIndex = numOfBins - 1;
                    filterBins[binIndex]  = filterBins[binIndex] + 1;
                }
            }
            else {
                filterBins = null;
            }
            // console.log(filterBins);
            self.set("filterBins",filterBins);
            // console.log(filterBins);

        }


    });
});
