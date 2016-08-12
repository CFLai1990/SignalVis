/**
 * Created by tangzhi.ye at 2015/11/24
 * model for whole data mamagement
 */

 define([
    'require',
    'marionette',
    'backbone',
    'config',
    'variables',
    "models/signal",
    "models/barchart.model",
    "models/scatterplot.model",
    "models/highdimension.model",
    "models/detailSignal.model"

 ], function(require, Mn, Backbone,Config,Variables,Signal, BarchartModel,ScatterPlotModel,HighDimension,DetailSignal){
    'use strict';

    $.whenWithProgress = function(arrayOfPromises, progressCallback) {
       var cntr = 0;
       for (var i = 0; i < arrayOfPromises.length; i++) {
           arrayOfPromises[i].done(function() {
               progressCallback();
           });
       }
       return jQuery.when.apply(jQuery, arrayOfPromises);
    }

    return window.Datacenter = new (Backbone.Model.extend({
        defaults: function(){
            return {
                "signals": null,
                "aggCount": null,
                "minTime":null,
                "maxTime":null,
                "minMidfre":null,
                "maxMidfre":null,
                //
                "bandwidthDictArr":null,
                "scopeDictArr":null,
                "carriernoiseDictArr":null,
                'firsttimeDictArr':null,
                "midfreDictArr":null,
                //select detail signals
                "detailSignals":null,
                //bar chart model
                "bandwidthBarChart":null,
                "scopeBarChart":null,
                "carriernoiseBarChart":null,
                "barcharts": {},
                //scatterplot
                "scatterplot":null,
                "highdimension":null,

                //filter result
                "bandwithFilterArr":null,
                "scopeFilterArr":null,
                "carriernoiseFilterArr":null,
                "firsttimeFilterArr":null,
                "firsttimeFilterArr":null,
            };
        },

        initialize: function(){
            var self = this;
            var queryFunc = function(){
                    var t_df = $.Deferred();
                    self.updateFilterArrWithoutInx(t_df);
                    $.when(t_df).done(function(){
                        self.updateDetailSignals();
                    });
            };
            self.listenTo(Variables,"change:bandwidthFilterRange", queryFunc);
            self.listenTo(Variables,"change:scopeFilterRange", queryFunc);
            self.listenTo(Variables,"change:carriernoiseFilterRange", queryFunc);
            self.listenTo(Variables,"change:mode", queryFunc);
            // self.listenTo(Variables,"change:firsttimeFilterRange", queryFunc);
            // self.listenTo(Variables,"change:midfreFilterRange", queryFunc);
            // self.listenTo(Variables,"change:zoominFirsttimeFilterRange", function(model,zoominFirsttimeFilterRange){
            //         self.updateDetailSignals();
            // });
            // self.listenTo(Variables,"change:zoominMidfreFilterRange", function(model,zoominMidfreFilterRange){
            //         self.updateDetailSignals();
            // });
        },

        start: function(options){
            var self = this;
            options = options || {};

            var readSignalDef = $.Deferred();
            var readPreComputeDef = $.Deferred();
            this.readSignal(readSignalDef);
            $.when(readSignalDef).done(function(){
                self.readPreCompute(readPreComputeDef);
            });

            $.when(readPreComputeDef).done(function(){
                console.log('finish reading data');
                // self.setBarCharts();
                self.setScatterPlot();
                self.setHighDimension();
                self.setDetailSignals();
                // self.addDetailSignal(181,263);
                Variables.set("finishInit",true);
            });

        },

        readSignal: function(def) {
            var self = this;
            // d3.csv(Config.get("signalCsvPath"), function(data) {
            //     self.set("signals",[]);
            //     for(var i =0;i<data.length;i++) {
            //         var signal = data[i];
            //         var tmp = {}
            //         tmp.bandwidth = parseFloat(signal.Bandwidth);
            //         tmp.scope = parseInt(signal.Scope);
            //         tmp.midfre = parseFloat(signal.Midfrequency);
            //         tmp.firsttime = parseInt(signal.Firsttime);
            //         tmp.carriernoise = parseInt(signal.Carriernoise);
            //         tmp.scope = parseInt(signal.Scope);

            //         tmp.normBandwidth = parseFloat(signal.NormBandwidth);
            //         tmp.normMidfrequency = parseFloat(signal.NormMidfrequency);
            //         tmp.normScope = parseFloat(signal.NormScope);
            //         tmp.normCarriernoise = parseFloat(signal.NormCarriernoise);
            //         tmp.normFirsttime = parseFloat(signal.NormFirsttime);

            //         self.get("signals").push(tmp);
            //     }
            //     console.log(self.get("signals"));
            //     def.resolve();
            // });
            d3.csv(Config.get("signalOriginCsvPath"), function(data) {
                var t_list = Config.get("nameList");
                var t_signals = [], t_data = [];
                for(var i =0;i<data.length;i++) {
                    var signal = data[i];
                    var tmp = {}, t_dt = [];
                    for(var j in t_list){
                        var t_attr = t_list[j];
                        if(t_attr.name){
                            var t_d = signal[j];
                            switch(t_attr.type){
                                case "float":
                                    t_d = parseFloat(t_d);
                                break;
                                case "int":
                                    t_d = parseInt(t_d);
                                break;
                                case "time":
                                    t_d = new Date(t_d).getTime();
                                break;
                            }
                            tmp[t_attr.name] = t_d;
                            t_dt.push(t_d);
                        }
                    }
                    t_data.push(t_dt);
                    t_signals.push(tmp);
                }
                t_data = MDS.normalizeData(t_data);
                for(var i = 0; i < t_data.length; i++){
                    var t_j = 0, tt_data = t_data[i];
                    for(var j in t_list){
                        var t_attr = t_list[j];
                        if(t_attr.norm){
                            t_signals[i][t_attr.norm] = tt_data[t_j];
                            t_j++;
                        }
                    }
                }
                self.set("signals", t_signals);
                def.resolve();
            });
        },

        readPreCompute: function(def) {
            var self = this, t_signals = self.get("signals");
            var t_sort = function(v_arr, v_key){ return _.sortBy(v_arr, function(tt_d){return tt_d[v_key];});};
            var t_time = d3.extent(_.map(t_signals, "firsttime")),
            t_freq = d3.extent(_.map(t_signals, "midfre"));
            self.set("timeRange", t_time);
            self.set("minTime",t_time[0]);
            self.set("maxTime",t_time[1]);
            self.set("midfreRange", t_freq);
            self.set("minMidfre",t_freq[0]);
            self.set("maxMidfre",t_freq[1]);
            var t_tds = [], t_attrs = Config.get("attrs"), t_pxl = Config.get("pixel");
            for(var i in t_attrs){
                var t_a = t_attrs[i], tt_tds = $.Deferred();
                t_tds.push(tt_tds.promise());
                self.setBarChart(i, t_a.attr, t_a.scale, tt_tds);
            }
            var t_attrs = t_pxl.attrs, tt_tds = $.Deferred();
            t_tds.push(tt_tds.promise());
            self.setPixelMap(t_attrs[0].name, t_attrs[0].attr, 
                t_attrs[1].name, t_attrs[1].attr, t_pxl.size, tt_tds);
            // var td_ext = $.Deferred();
            // d3.json(Config.get("preComputeJsonPath"), function(data) {
            //     self.set("aggCount",data.aggCount);
            //     td_ext.resolve();
            // });
            $.whenWithProgress(t_tds, function(){})
            .then(function(){def.resolve();});

        },

        setBarChart: function(v_name, v_attr, v_scale, v_td){
            var self = this, t_condition = [{
                '$group':{'_id':"$" + v_attr, 'indexs':{'$push':'$id'}}
            }];
            t_condition[0]['$group'][v_attr] = {'$first':"$" + v_attr};
            self.queryFromDB("barchart", t_condition, 
                function(v_d){
                    var t_barchart = new BarchartModel({
                        "attrName": v_name,
                        "numOfBins": v_d.binNumber,
                        "totalBins": v_d.binCount,
                        "xRange": v_d.xRange,
                        "yRange": v_d.yRange,
                        "filterRangeName": v_name + "FilterRange",
                        "scale": v_scale,
                    });
                    self.get("barcharts")[v_name] = t_barchart;
                }, v_td, {
                    key: v_attr,
                    bins: Config.get("barchart").bins,
                });
        },

        setPixelMap: function(v_name, v_attr, v_subname, v_subattr, v_size, v_td){
            var self = this, t_condition = [{
                '$group':{'_id':"$" + v_attr, 'indexs':{'$push':'$' + v_subattr}}
            }];
            t_condition[0]['$group'][v_attr] = {'$first':"$" + v_attr};
            self.queryFromDB("pixelmap", t_condition, 
                function(v_d){
                    self.set("aggCount", v_d.aggCount);
                }, v_td, {
                    key: v_attr,
                    attr: v_name,
                    subattr: v_subname,
                    size: v_size,
                });
        },

        setBarCharts: function() {
            var self = this;
            var bandwidthBarChart = new BarchartModel({
                "attrName":"_id",
                "dataDictArr":self.get("bandwidthDictArr"), //[{"attr": ,"indexs":[]}] //all data
                "filterRangeName":"bandwidthFilterRange", //name of Variables
                // "filterDataArr":Variables.get("filterSignals"),
                "scale":"power",
            });
            self.set("bandwidthBarChart",bandwidthBarChart);

            var scopeBarChart = new BarchartModel({
                "attrName":"_id",
                "dataDictArr":self.get("scopeDictArr"), //[{"attr": ,"indexs":[]}] //all data
                "filterRangeName":"scopeFilterRange", //[] reference to Config
                // "filterDataArr":Variables.get("filterSignals"),
                "scale":"linear",

            });
            self.set("scopeBarChart",scopeBarChart);

            var carriernoiseBarChart = new BarchartModel({
                "attrName":"_id",
                "dataDictArr":self.get("carriernoiseDictArr"), //[{"attr": ,"indexs":[]}] //all data
                "filterRangeName":"carriernoiseFilterRange", //[] reference to Config
                // "filterDataArr":Variables.get("filterSignals"),
                "scale":"linear",

            });
            self.set("carriernoiseBarChart",carriernoiseBarChart);
        },

        setScatterPlot:function() {
            var self =this;
            var scatterplotModel = new ScatterPlotModel({
                "xModel": self.get("barcharts")["bandwidth"],
                "yModel":self.get("barcharts")["scope"],
                "filterSignals": self.get("filterSignals")
            });
            self.set("scatterplot",scatterplotModel);
        },

        setHighDimension:function() {
            var self = this;
            var highDimension = new HighDimension({
                "midfrequencyActive": false,
                "firsttimeActive": false,
                "bandwidthActive": true,
                "scopeActive": true,
                "carriernoiseActive": true,
            })
            self.set("highdimension",highDimension);

        },
        setDetailSignals:function() {
            var self =this;
            var bandwidthRange = [];
            var scopeRange = [];
            var carriernoiseRange = [];
            var t_bandwidth = self.get("barcharts")["bandwidth"];
            bandwidthRange = t_bandwidth.get("xRange");
            var t_scope = self.get("barcharts")["scope"];
            scopeRange = t_scope.get("xRange");
            var t_carrier = self.get("barcharts")["carriernoise"];
            carriernoiseRange = t_carrier.get("xRange");

            var detailSignals = new DetailSignal.Model({
                "bandwidthRange":bandwidthRange,
                "scopeRange":scopeRange,
                "carriernoiseRange":carriernoiseRange,
            });
            this.set("detailSignals",detailSignals);
            console.log(detailSignals);
        },

        addDetailSignal:function(midfreInx,timeInx) {
            var self = this;
            var minTime = self.get("minTime") + timeInx * 60 * 1000;
            var maxTime = minTime + 60 *1000;
            var minMidfre = self.get("minMidfre") + midfreInx * 0.1;
            var maxMidfre = minMidfre + 0.1;
            var detailSignals = [];
            var signals = self.get('signals');
            for(var i=0;i<signals.length;i++) {
                var signal = signals[i];
                if(signal.firsttime >= minTime && signal.firsttime < maxTime
                    && signal.midfre >=  minMidfre && signal.midfre < maxMidfre) {
                    detailSignals.push(signal);
                }
            }
            var detailSignal = new DetailSignal.Model({
                "minTime":minTime,
                "maxTime":maxTime,
                "minMidfre":minMidfre,
                "maxMidfre":maxMidfre,
                "signals":detailSignals
            });
            self.get("detailSignals").push(detailSignal);
            console.log(self.get("detailSignals"));


        },

        updateFilterArr: function() {
            var self = this;
            var bandwithFilterArr =  self.get("bandwithFilterArr");
            var scopeFilterArr  =   self.get("scopeFilterArr");
            var carriernoiseFilterArr =  self.get("carriernoiseFilterArr");
            var firsttimeFilterArr =  self.get("firsttimeFilterArr");
            var midfreFilterArr  = self.get("midfreFilterArr");
            var resultInx = null;
            var result = null;
            var tmpArr = [];

            if(scopeFilterArr)
                tmpArr.push(scopeFilterArr);
            if(carriernoiseFilterArr)
                tmpArr.push(carriernoiseFilterArr);
            if(firsttimeFilterArr)
                tmpArr.push(firsttimeFilterArr);
            if(midfreFilterArr)
                tmpArr.push(midfreFilterArr);
            if(bandwithFilterArr)
                tmpArr.push(bandwithFilterArr);
            if(tmpArr.length == 0)
                resultInx = null;
            else {
                tmpArr = _.sortBy(tmpArr, function(o) { return o.length; })
                console.log(tmpArr);

                resultInx = tmpArr[0];
                for(var i=1;i<tmpArr.length;i++) {
                    resultInx = _.intersection(resultInx,tmpArr[i]);
                }
            }
            if(resultInx) {
                result = [];
                console.log("cross filter result: " + resultInx.length);
                for(var i=0;i<resultInx.length;i++) {
                    var index = resultInx[i];
                    var a = self.get('signals')[index];
                    result.push(a);
                }
            }
            else {
                result = null;
                console.log('not filter result');
            }

            Variables.set('filterSignals',result);


        },

        updateFilterArrWithoutInx: function(v_df) {
            var self = this;
            var bandwidthFilterRange = Variables.get("bandwidthFilterRange");
            var scopeFilterRange = Variables.get("scopeFilterRange");
            var carriernoiseFilterRange = Variables.get("carriernoiseFilterRange");
            var firsttimeFilterRange = Variables.get("firsttimeFilterRange");
            var midfreFilterRange = Variables.get("midfreFilterRange");
            console.time(1);

            var filters = [];
            if(bandwidthFilterRange) {
                var filter = {}
                filter['range'] = bandwidthFilterRange;
                filter['name'] = 'Bandwidth(dB)';//'bandwidth';
                filters.push(filter);
            }
            if(scopeFilterRange) {
                var filter = {}
                filter['range'] = scopeFilterRange;
                filter['name'] = 'Scope(dBm)';//'scope';
                filters.push(filter);
            }
            if(carriernoiseFilterRange) {
                var filter = {}
                filter['range'] = carriernoiseFilterRange;
                filter['name'] = 'Carriernoise(dB)';//'carriernoise';
                filters.push(filter);
            }
            if(firsttimeFilterRange) {
                var filter = {}, t_timeFilter = [];
                var t_timeShift = 8*3600*1000;
                t_timeFilter[0] = firsttimeFilterRange[0] + t_timeShift;
                t_timeFilter[1] = firsttimeFilterRange[1] + t_timeShift;
                filter['range'] = t_timeFilter;
                filter['name'] = 'FirsttimeDate';//'firsttime';
                filters.push(filter);
            }
            if(midfreFilterRange) {
                var filter = {}
                filter['range'] = midfreFilterRange;
                filter['name'] = 'Midfrequency(MHz)';//'midfre';
                filters.push(filter);
            }
            console.log(filters)
            if(filters.length == 0) {
                Variables.set("filterSignals", null);
            }
            else {
                var filterSignals = [];
                var signals = this.get("signals");
                var t_condition = {};
                for(var i in filters){
                    var t_range = filters[i].range;
                    t_condition[filters[i].name] = {
                        '$gte': t_range[0],
                        '$lte': t_range[1],
                    }
                }
                t_condition = {
                    condition: t_condition,
                    return: {'id': 1, '_id': 0},
                }
                self.queryFromDB("query", t_condition, function(v_data){
                    var t_result = d3.set(_.map(v_data, "id"));
                    filterSignals = _.filter(signals, function(t_s){
                        return t_result.has(t_s["id"]);
                    });
                    console.timeEnd(1);
                    Variables.set("filterSignals",filterSignals);
                }, v_df);
            }
        },

        updateDetailSignals: function() {
            var self = this;
            console.time(2)
            var filterSignals = Variables.get("filterSignals");
            var zoominFirsttimeFilterRange = Variables.get("zoominFirsttimeFilterRange");
            var zoominMidfreFilterRange = Variables.get("zoominMidfreFilterRange");
            if(filterSignals && zoominFirsttimeFilterRange && zoominMidfreFilterRange) {
                var detailSignals = [];
                for(var i = 0;i< filterSignals.length;i++) {
                    var signal = filterSignals[i];
                    if(signal.firsttime >= zoominFirsttimeFilterRange[0] && signal.firsttime < zoominFirsttimeFilterRange[1]
                        && signal.midfre >= zoominMidfreFilterRange[0] && signal.midfre < zoominMidfreFilterRange[1]) {
                        detailSignals.push(signal);
                    }
                }
                Variables.set("detailSignals",detailSignals);
            }
            else {
                Variables.set("detailSignals",null);
            }
            console.timeEnd(2);
        },

        queryFromDB: function(v_command, v_condition, v_callback, v_deferred, v_extra, v_update){
            var t_table = Config.get("dataTable");
            $.ajax({
                url: "/query?"+JSON.stringify({
                    table: t_table,
                    condition: v_condition,
                    command: v_command,
                    extra: v_extra,
                    update: v_update,
                }),
                success: function(v_data){
                    console.info("Query Sucess!", v_command, v_condition);
                    if(v_callback) v_callback(v_data);
                    if(v_deferred) v_deferred.resolve();
                },
                error: function(err){
                    console.log("Query Error!", err);
                },
            });
        },

    }))();
 });
