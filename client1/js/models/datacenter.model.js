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
            self.listenTo(Variables,"change:bandwithFilterRange", queryFunc);
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
                self.setBarCharts();
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
                console.log(self.get("signals"));
                // var t_modify = function(v_collection, v_d){
                //     v_d.Firsttime = new Date(v_d.Firsttime);
                //     v_collection.save(v_d);
                // };
                // self.queryFromDB('modify', {'Firsttime':{'$exists':true}}, function(){
                // }, def, t_modify);
                def.resolve();
            });
        },

        readPreCompute: function(def) {
            var self = this, t_signals = self.get("signals");
            d3.json(Config.get("preComputeJsonPath"), function(data) {
                // console.log(data);
                self.set("aggCount",data.aggCount);
                // for(var i=0;i<data.aggCount.length;i++){
                //     if(data.aggCount[i][0] > 0)
                //         console.log(i);
                // }
                // console.log(data.aggCount);
                // console.log(data.maxTime - data.minTime);
                // self.set("minTime",data.minTime);
                // self.set("maxTime",data.maxTime);
                // self.set("minMidfre",data.minMidfre);
                // self.set("maxMidfre",data.maxMidfre);
                // self.set("scopeDictArr",data.scopeDictArr);
                // self.set("bandwidthDictArr",data.bandwidthDictArr);
                // self.set("carriernoiseDictArr",data.carriernoiseDictArr);
                // self.set('firsttimeDictArr',data.firsttimeDictArr);
                // self.set('midfreDictArr',data.midfreDictArr);
                var t_sort = function(v_arr, v_key){ return _.sortBy(v_arr, function(tt_d){return tt_d[v_key];});};
                var t_time = d3.extent(_.map(t_signals, "firsttime")),
                t_freq = d3.extent(_.map(t_signals, "midfre"));
                self.set("minTime",t_time[0]);
                self.set("maxTime",t_time[1]);
                self.set("minMidfre",t_freq[0]);
                self.set("maxMidfre",t_freq[1]);
                var td1 = $.Deferred(), td2 = $.Deferred(), td3 = $.Deferred(),
                td4 = $.Deferred(), td5 = $.Deferred();
                self.queryFromDB("aggregate", [{'$group':{'_id':'$Scope(dBm)', 'scope':{'$first':'$Scope(dBm)'}, 'indexs':{'$push':'$id'}}}],
                    function(v_d){
                        self.set("scopeDictArr", t_sort(v_d, "scope"));
                    }, td1);
                self.queryFromDB("aggregate", [{'$group':{'_id':'$Bandwidth(dB)', 'bandwidth':{'$first':'$Bandwidth(dB)'}, 'indexs':{'$push':'$id'}}}],
                    function(v_d){
                        self.set("bandwidthDictArr", t_sort(v_d, "bandwidth"));
                    }, td2);
                self.queryFromDB("aggregate", [{'$group':{'_id':'$Carriernoise(dB)', 'carriernoise':{'$first':'$Carriernoise(dB)'}, 'indexs':{'$push':'$id'}}}],
                    function(v_d){
                        self.set("carriernoiseDictArr", t_sort(v_d, "carriernoise"));
                    }, td3);
                self.queryFromDB("aggregate", [{'$group':{'_id':'$Firsttime', 'firsttime':{'$first':'$Firsttime'}, 'indexs':{'$push':'$id'}}}],
                    function(v_d){
                        self.set("firsttimeDictArr", t_sort(v_d, "firsttime"));
                    }, td4);
                self.queryFromDB("aggregate", [{'$group':{'_id':'$Midfrequency(MHz)', 'midfre':{'$first':'$Midfrequency(MHz)'}, 'indexs':{'$push':'$id'}}}],
                    function(v_d){
                        self.set("midfreDictArr", t_sort(v_d, "midfre"));
                    }, td5);

                $.when(td1, td2, td3, td4, td5)
                .done(function(){def.resolve();});
                // def.resolve();
            });
                // self.set("scopeDictArr",data.scopeDictArr);
                // self.set("bandwidthDictArr",data.bandwidthDictArr);
                // self.set("carriernoiseDictArr",data.carriernoiseDictArr);
                // self.set('firsttimeDictArr',data.firsttimeDictArr);
                // self.set('midfreDictArr',data.midfreDictArr);

        },

        setBarCharts: function() {
            var self = this;
            var bandwidthBarChart = new BarchartModel({
                "attrName":"bandwidth",
                "dataDictArr":self.get("bandwidthDictArr"), //[{"attr": ,"indexs":[]}] //all data
                "filterRangeName":"bandwithFilterRange", //name of Variables
                "filterDataArr":Variables.get("filterSignals"),
                "scale":"power",
            });
            self.set("bandwidthBarChart",bandwidthBarChart);

            var scopeBarChart = new BarchartModel({
                "attrName":"scope",
                "dataDictArr":self.get("scopeDictArr"), //[{"attr": ,"indexs":[]}] //all data
                "filterRangeName":"scopeFilterRange", //[] reference to Config
                "filterDataArr":Variables.get("filterSignals"),
                "scale":"linear",

            });
            self.set("scopeBarChart",scopeBarChart);

            var carriernoiseBarChart = new BarchartModel({
                "attrName":"carriernoise",
                "dataDictArr":self.get("carriernoiseDictArr"), //[{"attr": ,"indexs":[]}] //all data
                "filterRangeName":"carriernoiseFilterRange", //[] reference to Config
                "filterDataArr":Variables.get("filterSignals"),
                "scale":"linear",

            });
            self.set("carriernoiseBarChart",carriernoiseBarChart);

        },

        setScatterPlot:function() {
            var self =this;
            var scatterplotModel = new ScatterPlotModel({
                "xModel": self.get("bandwidthBarChart"),
                "yModel":self.get("scopeBarChart"),
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
            var bandwidthDictArr = self.get("bandwidthDictArr");
            bandwidthRange.push(bandwidthDictArr[0].bandwidth);
            bandwidthRange.push(bandwidthDictArr[bandwidthDictArr.length - 1].bandwidth);
            var scopeDictArr = self.get("scopeDictArr");
            scopeRange.push(scopeDictArr[0].scope);
            scopeRange.push(scopeDictArr[scopeDictArr.length - 1].scope);
            var carriernoiseDictArr = self.get("carriernoiseDictArr");
            carriernoiseRange.push(carriernoiseDictArr[0].carriernoise);
            carriernoiseRange.push(carriernoiseDictArr[carriernoiseDictArr.length - 1].carriernoise);

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

        filterBandwith:function(bandwithFilterRange) {
            var self = this;
            var dictArr = self.get("bandwidthDictArr");
            var result = []
            for(var i=0;i<dictArr.length;i++) {
                if(dictArr[i].bandwidth >= bandwithFilterRange[0] && dictArr[i].bandwidth <= bandwithFilterRange[1]){
                    result.push.apply(result,dictArr[i].indexs);
                }
            }
            console.log(result.length);

            return result;
        },

        filterScope:function(scopeFilterRange) {
            var self = this;
            var dictArr = self.get("scopeDictArr");
            var result = []
            for(var i=0;i<dictArr.length;i++) {
                if(dictArr[i].scope >= scopeFilterRange[0] && dictArr[i].scope <= scopeFilterRange[1]){
                    result.push.apply(result,dictArr[i].indexs);
                }
            }
            console.log(result.length);
            return result;
        },

        filterCarriernoise:function(carriernoiseFilterRange) {
            var self = this;
            var dictArr = self.get("carriernoiseDictArr");
            var result = []
            for(var i=0;i<dictArr.length;i++) {
                if(dictArr[i].carriernoise >= carriernoiseFilterRange[0] && dictArr[i].carriernoise <= carriernoiseFilterRange[1]){
                    result.push.apply(result,dictArr[i].indexs);
                }
            }
            console.log(result.length);
            return result;
        },

        filterFirsttime:function(firsttimeFilterRange) {
            var self = this;
            var dictArr = self.get("firsttimeDictArr");
            var result = []
            for(var i=0;i<dictArr.length;i++) {
                if(dictArr[i].firsttime >= firsttimeFilterRange[0] && dictArr[i].firsttime <= firsttimeFilterRange[1]){
                    result.push.apply(result,dictArr[i].indexs);
                }
            }
            console.log(result.length);
            return result;
        },
        filterMidfre: function(midfreFilterRange) {
            var self = this;
            var dictArr = self.get("midfreDictArr");
            var result = []
            for(var i=0;i<dictArr.length;i++) {
                if(dictArr[i].midfre >= midfreFilterRange[0] && dictArr[i].midfre <= midfreFilterRange[1]){
                    result.push.apply(result,dictArr[i].indexs);
                }
            }
            console.log(result.length);
            return result;
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
            var bandwithFilterRange = Variables.get("bandwithFilterRange");
            var scopeFilterRange = Variables.get("scopeFilterRange");
            var carriernoiseFilterRange = Variables.get("carriernoiseFilterRange");
            var firsttimeFilterRange = Variables.get("firsttimeFilterRange");
            var midfreFilterRange = Variables.get("midfreFilterRange");
            console.time(1);

            var filters = [];
            if(bandwithFilterRange) {
                var filter = {}
                filter['range'] = bandwithFilterRange;
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
                    // console.log(filterSignals);
                }, v_df);
                // for(var i=0;i<signals.length;i++) {
                //     var signal = signals[i];
                //     var isIn = true;
                //     for(var j=0;j<filters.length;j++) {
                //         var filter = filters[j];
                //         var attrName = filter["name"];
                //         var range = filter["range"];
                //         if(signal[attrName] < range[0] || signal[attrName] > range[1]) {
                //             isIn = false;
                //             break;
                //         }
                //     }
                //     if(isIn) {
                //         filterSignals.push(signal);
                //     }
                // }
                // Variables.set("filterSignals",filterSignals);
                // console.timeEnd(1);
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
                console.log(detailSignals);
                Variables.set("detailSignals",detailSignals);
                //local VS db
                // var t_df = $.Deferred(), filters = [], t_condition = {};
                // if(zoominFirsttimeFilterRange) {
                //     var filter = {}
                //     filter['range'] = zoominFirsttimeFilterRange;
                //     filter['name'] = 'FirsttimeDate';//'firsttime';
                //     filters.push(filter);
                // }
                // if(zoominMidfreFilterRange) {
                //     var filter = {}
                //     filter['range'] = zoominMidfreFilterRange;
                //     filter['name'] = 'Midfrequency(MHz)';//'midfre';
                //     filters.push(filter);
                // }
                // for(var i in filters){
                //     var t_range = filters[i].range;
                //     t_condition[filters[i].name] = {
                //         '$gte': t_range[0],
                //         '$lte': t_range[1],
                //     }
                // }
                // t_condition = {
                //     condition: t_condition,
                //     return: {'id': 1},
                // }
                // self.queryFromDB("query", t_condition, function(v_data){
                //         var t_result = d3.set(_.map(v_data, "id"));
                //         var t_signals = _.filter(filterSignals, function(t_s){
                //             return t_result.has(t_s["id"]);
                //         });
                //         Variables.set("detailSignals",t_signals);
                //         console.timeEnd(2);
                //     }, t_df);
            }
            else {
                Variables.set("detailSignals",null);
            }
            console.timeEnd(2);
        },

        queryFromDB: function(v_command, v_condition, v_callback, v_deferred, v_update){
            var t_table = Config.get("dataTable");
            $.ajax({
                url: "/query?"+JSON.stringify({
                    table: t_table,
                    condition: v_condition,
                    command: v_command,
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
