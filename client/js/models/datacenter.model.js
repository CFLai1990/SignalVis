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
    "models/detailSignal.model",
    "collections/barchart.collection",

 ], function(require, Mn, Backbone,Config,Variables,Signal, BarchartModel,ScatterPlotModel,HighDimension,DetailSignal,barchartCollection){
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
                "barchartCollection": null,
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
            self.listenTo(Variables, "changeFilterRange", queryFunc);
            // self.listenTo(Variables,"change:mode", queryFunc);
            // self.listenTo(Variables,"change:firsttimeFilterRange", queryFunc);
            // self.listenTo(Variables,"change:midfreFilterRange", queryFunc);
            self.listenTo(Variables,"change:zoominFirsttimeFilterRange", function(model,zoominFirsttimeFilterRange){
                    self.updateDetailSignals();
            });
            self.listenTo(Variables,"change:zoominMidfreFilterRange", function(model,zoominMidfreFilterRange){
                    self.updateDetailSignals();
            });
            self.set("barchartCollection", new barchartCollection());
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
                // self.setScatterPlot();
                self.setHighDimension();
                self.setDetailSignals();
                // self.addDetailSignal(181,263);
                Variables.set("finishInit",true);
            });

        },

        readSignal: function(def) {
            var self = this;
            d3.csv(Config.getData("localPath"), function(data) {
                var t_list = Config.get("nameList"), t_keys = _.keys(data[0]);
                var t_signals = [], t_data = [], t_names = [], t_cate = {}, t_dicts = {};
                for(var i =0;i<data.length;i++) {
                    var signal = data[i];
                    var tmp = {}, t_dt = [];
                    for(var j in signal){
                        var t_attr = t_list[j];
                        if(!t_attr || !t_attr.name) continue;
                        var t_d = signal[j], t_name = t_attr.name;
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
                            case "category":
                                if(!t_cate[t_name]){
                                    t_cate[t_name] = 1;
                                    t_dicts[t_name] = d3.map();
                                }
                                var tt_dict = t_dicts[t_name],
                                t_num = t_cate[t_name];
                                if(t_d == "" || t_d == undefined){
                                    t_d = "NaN";
                                }
                                if(!tt_dict.has(t_d)){
                                    tt_dict.set(t_d, {num: t_num, count: 0});
                                    t_cate[t_name]++;
                                }
                                var t_dc = tt_dict.get(t_d);
                                t_d = t_dc.num;
                                t_dc.count++;
                            break;
                        }
                        tmp[t_attr.name] = t_d;
                        if(t_attr.norm){
                            t_dt.push(t_d);
                        }
                    }
                    t_data.push(t_dt);
                    t_signals.push(tmp);
                }
                Config.set("dictionary", t_dicts);
                t_data = MDS.normalizeData(t_data);
                for(var i = 0; i < t_data.length; i++){
                    var t_j = 0, tt_data = t_data[i];
                    var signal = data[i];
                    for(var j in signal){
                        var t_attr = t_list[j];
                        if(!t_attr || !t_attr.name) continue;
                        if(t_attr.norm){
                            t_signals[i]["norm" + t_attr.name] = tt_data[t_j];
                            t_j++;
                        }
                    }
                }
                self.set("signals", t_signals);
                def.resolve();
            });
        },

        readPreCompute: function(def) {
            var self = this, t_signals = self.get("signals"), t_keys = _.keys(t_signals[0]).reverse();
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
            for(var i in t_keys){
                var t_i = t_keys[i];
                if(t_i.indexOf("norm") >=0 || t_i == "id" || t_i == "midfre" || t_i == "firsttime" || t_i == "Lasttime"){
                    continue;
                }
                var  t_a = t_attrs[t_i];
                if(!t_a){
                    continue;
                }
                var tt_tds = $.Deferred();
                t_tds.push(tt_tds.promise());
                self.setBarChart(t_i, t_a.attr, t_a.type, t_a.scale, tt_tds);
            }
            var t_attrs = t_pxl.attrs, tt_tds = $.Deferred();
            t_tds.push(tt_tds.promise());
            self.setPixelMap(t_attrs[0].name, t_attrs[0].attr,
                t_attrs[1].name, t_attrs[1].attr, t_pxl.size, tt_tds);
            $.whenWithProgress(t_tds, function(){})
            .then(function(){def.resolve();});
        },

        setBarChart: function(v_name, v_attr, v_type, v_scale, v_td){
            var self = this;
            if(v_type == "category"){
                var t_dict = Config.get("dictionary")[v_name].entries(), t_keys = [], t_bins = [];
                for(var i in t_dict){
                    var tt_dict = t_dict[i];
                    t_keys[i] = tt_dict.key;
                    t_bins[i] = tt_dict.value.count;
                }
                if(t_keys.length == 1){
                    t_keys.push("");
                    t_bins.push(0);
                }
                var t_barchart = new BarchartModel({
                    "attrName": v_name,
                    "numOfBins": t_bins.length,
                    "totalBins": t_bins,
                    "xRange": t_keys,
                    "yRange": [_.min(t_bins), _.max(t_bins)],
                    "filterRangeName": v_attr,
                    "scale": v_scale,
                    "dictionary": Config.get("dictionary")[v_name],
                    "category": true,
                });
                self.get("barcharts")[v_name] = t_barchart;
                self.get("barchartCollection").add(t_barchart);
                Variables.get("filterRanges")[v_attr] = null;
                v_td.resolve();
            }else{
                var t_condition = [{
                '$group':{'_id':"$" + v_attr, 'indexs':{'$push':'$_id'}}
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
                            "filterRangeName": v_attr,
                            "scale": v_scale,
                            "category": false,
                        });
                        self.get("barcharts")[v_name] = t_barchart;
                        self.get("barchartCollection").add(t_barchart);
                        Variables.get("filterRanges")[v_attr] = null;
                    }, v_td, {
                        key: v_attr,
                        bins: Config.get("barchart").bins,
                });
            }            
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

        setScatterPlot:function() {
            var self =this;
            var scatterplotModel = new ScatterPlotModel({
                "xModel": self.get("barcharts")["bandwidth"],
                "yModel": self.get("barcharts")["carriernoise"],
                "filterSignals": self.get("filterSignals")
            });
            self.set("scatterplot",scatterplotModel);
        },

        setHighDimension:function() {
            var self = this, t_keys = _.keys(self.get("barcharts"));
            t_keys.push("midfre");
            t_keys.push("firsttime");
            var highDimension = new HighDimension({
                dimensions: t_keys
            });
            self.set("highdimension",highDimension);

        },

        setDetailSignals:function() {
            var self =this;
            var bandwidthRange = [];
            var scopeRange = [];
            var carriernoiseRange = [];
            var t_bandwidth = self.get("barcharts")["bandwidth"];
            bandwidthRange = t_bandwidth?t_bandwidth.get("xRange"):null;
            var t_scope = self.get("barcharts")["scope"];
            scopeRange = t_scope?t_scope.get("xRange"):null;
            var t_carrier = self.get("barcharts")["carriernoise"];
            carriernoiseRange = t_carrier?t_carrier.get("xRange"):null;

            var detailSignals = new DetailSignal.Model({
                "bandwidth":bandwidthRange,
                "scope":scopeRange,
                "carriernoise":carriernoiseRange,
            });
            this.set("detailSignals",detailSignals);
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

        updateFilterArrWithoutInx: function(v_df) {
            var self = this;
            var filterRanges = Variables.get("filterRanges"),
            t_attrs = Config.get("nameList");
            console.time(1);

            var filters = [];
            for(var i in filterRanges){
                var t_range = filterRanges[i];
                if(t_range){
                    var filter = {
                        name: i,
                        range: filterRanges[i],
                    };
                    if(i == "timeDate"){
                        var t_shift = 8 * 3600 * 1000;
                        filter.range[0] += t_shift;
                        filter.range[1] += t_shift;
                    }
                    filters.push(filter);
                }
            }
            if(filters.length == 0) {
                Variables.set("filterSignals", null);
            }
            else {
                var filterSignals = [];
                var signals = this.get("signals");
                var t_condition = {};
                for(var i in filters){
                    var t_range = filters[i].range,
                    t_name = filters[i].name;
                    if(t_attrs[t_name] && t_attrs[t_name].type == "category"){
                        t_condition[t_name] = {
                            '$in': t_range,
                        }
                    }else{
                        t_condition[t_name] = {
                            '$gte': t_range[0],
                            '$lte': t_range[1],
                        }
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

        querySpectrum: function(v_frame){
            var self = this, v_df = $.Deferred();
            var t_collection = Config.getData("spectrum");
            console.time(3);
            self.queryFromDB("query", {
                condition: {"frameNum": v_frame},
                return: {'scope': 1, 'frequency': 1, '_id': 0},
                }, function(v_d){
                console.timeEnd(3);
                //handle spectrum data
            }, v_df, {
                collection: t_collection,
            });
        },

        queryFromDB: function(v_command, v_condition, v_callback, v_deferred, v_extra, v_update){
            var t_table = Config.getData("dataTable");
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
                    console.log("Query Error!", err, v_condition);
                },
            });
        },

    }))();
 });
