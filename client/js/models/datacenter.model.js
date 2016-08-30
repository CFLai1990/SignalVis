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
        defaults: {
                "signals": null,
                "aggCount": null,
                "minTime":null,
                "maxTime":null,
                "minMidfre":null,
                "maxMidfre":null,
                "signalNum":null,

                //select detail signals
                "detailSignals":null,
                //bar chart model
                "barcharts": null,
                "barchartCollection": null,
                //scatterplot
                "scatterplot":null,
                "highdimension":null,
                "onlyProjection": false,
            },

        initialize: function(){
            var self = this;
            self.set("barchartCollection", new barchartCollection());
            self.listenTo(Config, "Config:changeData", self.changeData);
            self.listenTo(Variables, "subspaceChange", self.changeSubspace);
            self.listenTo(Variables,"change:bandwidthFilterRange", self.queryFunc);
            self.listenTo(Variables,"change:scopeFilterRange", self.queryFunc);
            self.listenTo(Variables,"change:carriernoiseFilterRange", self.queryFunc);
            self.listenTo(Variables, "changeFilterRange", self.queryFunc);
            self.listenTo(Variables,"change:zoominFirsttimeFilterRange", function(model,zoominFirsttimeFilterRange){
                    self.updateDetailSignals();
            });
            self.listenTo(Variables,"change:zoominMidfreFilterRange", function(model,zoominMidfreFilterRange){
                    self.updateDetailSignals();
            });
        },

        queryFunc: function(){
                var self = this, t_df = $.Deferred();
                self.updateFilterArrWithoutInx(t_df);
        },

        changeData: function(){
            var self = this;
            Variables.clearAll();
            Variables.trigger("clearAll");
            Config.clearAll();
            self.clearAll();
            self.start();
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
            var self = this, t_list = Config.get("barchart").list, t_attrs = Config.get("nameList");
            if(!t_list){
                Config.get("barchart").list = [];
            }
            self.queryFromDB("query", {
                    condition: {"id": 1},
                    return: {'_id':0},
                }, function(v_d){
                    for(var i in v_d[0]){
                        if((v_d[0]['norm'+i]!=undefined) && i!="timeDate" && i!="freq" && i.indexOf("id")<0){
                            if(!t_attrs[i]){
                                console.log(i);
                            }
                            var t_name = t_attrs[i].name;
                            if(t_name){
                                Config.get("barchart").list.push(t_name);
                            }
                        }
                    }
            }, def);
            // d3.csv(Config.getData("localPath"), function(data) {
            //     var t_list = Config.get("nameList"), t_keys = _.keys(data[0]);
            //     var t_signals = [], t_data = [], t_names = [], t_cate = {}, t_dicts = {};
            //     for(var i =0;i<data.length;i++) {
            //         var signal = data[i];
            //         var tmp = {}, t_dt = [];
            //         for(var j in signal){
            //             var t_attr = t_list[j];
            //             if(!t_attr || !t_attr.name) continue;
            //             var t_d = signal[j], t_name = t_attr.name;
            //             switch(t_attr.type){
            //                 case "float":
            //                     t_d = parseFloat(t_d);
            //                 break;
            //                 case "int":
            //                     t_d = parseInt(t_d);
            //                 break;
            //                 case "time":
            //                     t_d = new Date(t_d).getTime();
            //                 break;
            //                 case "category":
            //                     if(!t_cate[t_name]){
            //                         t_cate[t_name] = 1;
            //                         t_dicts[t_name] = d3.map();
            //                     }
            //                     var tt_dict = t_dicts[t_name],
            //                     t_num = t_cate[t_name];
            //                     if(t_d == "" || t_d == undefined){
            //                         t_d = "NaN";
            //                     }
            //                     if(!tt_dict.has(t_d)){
            //                         tt_dict.set(t_d, {num: t_num, count: 0});
            //                         t_cate[t_name]++;
            //                     }
            //                     var t_dc = tt_dict.get(t_d);
            //                     t_d = t_dc.num;
            //                     t_dc.count++;
            //                 break;
            //             }
            //             tmp[t_attr.name] = t_d;
            //             if(t_attr.norm){
            //                 t_dt.push(t_d);
            //             }
            //         }
            //         t_data.push(t_dt);
            //         t_signals.push(tmp);
            //     }
            //     Config.set("dictionary", t_dicts);
            //     t_data = MDS.normalizeData(t_data);
            //     for(var i = 0; i < t_data.length; i++){
            //         var t_j = 0, tt_data = t_data[i];
            //         var signal = data[i];
            //         for(var j in signal){
            //             var t_attr = t_list[j];
            //             if(!t_attr || !t_attr.name) continue;
            //             if(t_attr.norm){
            //                 t_signals[i]["norm" + t_attr.name] = tt_data[t_j];
            //                 t_j++;
            //             }
            //         }
            //     }
            //     self.set("signals", t_signals);
            //     def.resolve();
            // });
        },

        readPreCompute: function(def) {
            var self = this;
            var t_sort = function(v_arr, v_key){ return _.sortBy(v_arr, function(tt_d){return tt_d[v_key];});};
            var t_tds = [], t_attrs = Config.get("attrs"), t_pxl = Config.get("pixel");
            // for(var i in t_keys){
            //     var t_i = t_keys[i];
            //     if(t_i.indexOf("norm") >=0 || t_i == "id" || t_i == "midfre" || t_i == "firsttime" || t_i == "Lasttime"){
            //         continue;
            //     }
            //     var  t_a = t_attrs[t_i];
            //     if(!t_a){
            //         continue;
            //     }
            //     // var tt_tds = $.Deferred();
            //     // t_tds.push(tt_tds.promise());
            //     self.setBarChart(t_i, t_a.attr, t_a.type, t_a.scale, null);//tt_tds);
            // }
            var tt_tds = $.Deferred();
            t_tds.push(tt_tds.promise());
            self.getBarcharts({}, tt_tds, true);
            var t_attrs = t_pxl.attrs, tt_tds = $.Deferred();
            t_tds.push(tt_tds.promise());
            self.setPixelMap(t_attrs[0].name, t_attrs[0].attr,
                t_attrs[1].name, t_attrs[1].attr, t_pxl.plansize, tt_tds);
            $.whenWithProgress(t_tds, function(){})
            .then(function(){def.resolve();});
        },

        setBarChart: function(v_name, v_attr, v_type, v_scale, v_td){
            var self = this, t_list = Config.get("barchart").list;
            if(!t_list){
                Config.get("barchart").list = [];
            }
            Config.get("barchart").list.push(v_name);
            // if(v_type == "category"){
            //     var t_dict = Config.get("dictionary")[v_name].entries(), t_keys = [], t_bins = [];
            //     for(var i in t_dict){
            //         var tt_dict = t_dict[i];
            //         t_keys[i] = tt_dict.key;
            //         t_bins[i] = tt_dict.value.count;
            //     }
            //     if(t_keys.length == 1){
            //         t_keys.push("");
            //         t_bins.push(0);
            //     }
            //     var t_barchart = new BarchartModel({
            //         "attrName": v_name,
            //         "numOfBins": t_bins.length,
            //         "totalBins": t_bins,
            //         "xRange": t_keys,
            //         "yRange": [_.min(t_bins), _.max(t_bins)],
            //         "filterRangeName": v_attr,
            //         "scale": v_scale,
            //         "category": true,
            //     });
            //     self.get("barcharts")[v_name] = t_barchart;
            //     self.get("barchartCollection").add(t_barchart);
            //     Variables.get("filterRanges")[v_attr] = null;
            //     v_td.resolve();
            // }else{
            //     var t_condition = [{
            //     '$group':{'_id':"$" + v_attr, 'indexs':{'$push':'$_id'}}
            //     }];
            //     t_condition[0]['$group'][v_attr] = {'$first':"$" + v_attr};
            //     self.queryFromDB("barchart", t_condition,
            //         function(v_d){
            //             var t_barchart = new BarchartModel({
            //                 "attrName": v_name,
            //                 "numOfBins": v_d.binNumber,
            //                 "totalBins": v_d.binCount,
            //                 "xRange": v_d.xRange,
            //                 "yRange": v_d.yRange,
            //                 "filterRangeName": v_attr,
            //                 "scale": v_scale,
            //                 "category": false,
            //             });
            //             self.get("barcharts")[v_name] = t_barchart;
            //             self.get("barchartCollection").add(t_barchart);
            //             Variables.get("filterRanges")[v_attr] = null;
            //         }, v_td, {
            //             key: v_attr,
            //             bins: Config.get("barchart").bins,
            //     });
            // }
        },

        setPixelMap: function(v_name, v_attr, v_subname, v_subattr, v_size, v_td){
            var self = this, t_condition = [{
                '$group':{'_id':"$" + v_attr, 'indexs':{'$push':'$' + v_subattr}}
            }];
            t_condition[0]['$group'][v_attr] = {'$first':"$" + v_attr};
            self.queryFromDB("pixelmap", t_condition,
                function(v_d){
                    self.set("aggCount", v_d.aggCount);
                    var t_tr = v_d.range, t_fr = v_d.subRange, t_shift = 8 * 3600 * 1000;
                    if(v_name == 'firsttime'){
                        t_tr[0] -= t_shift;
                        t_tr[1] -= t_shift;
                    }else{
                        t_fr[0] -= t_shift;
                        t_fr[1] -= t_shift;
                    }
                    self.set("timeRange", t_tr);
                    self.set("minTime",t_tr[0]);
                    self.set("maxTime",t_tr[1]);
                    self.set("midfreRange", t_fr);
                    self.set("minMidfre",t_fr[0]);
                    self.set("maxMidfre",t_fr[1]);
                    Config.set("size", v_d.size);
                    Variables.get("filterRanges")["timeDate"] = null;
                    Variables.get("filterRanges")["baud"] = null;
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
                "filters":self.get("filterSignals")
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
            var t_scope = self.get("barcharts")["scope"], t_dbmscope = self.get("barcharts")["scopedbm"];
            if(t_scope){
                scopeRange = t_scope.get("xRange");
            }
            if(t_dbmscope){
                scopeRange = t_dbmscope.get("xRange");
            }
            var t_carrier = self.get("barcharts")["carriernoise"];
            if(t_carrier){
                carriernoiseRange = t_carrier.get("xRange");
            }
            if(bandwidthRange.length == 0 || scopeRange.length == 0 || carriernoiseRange.length == 0){
                this.set("detailSignals", null);
            }else{
                var detailSignals = new DetailSignal.Model({
                    "bandwidth":bandwidthRange,
                    "scope":scopeRange,
                    "carriernoise":carriernoiseRange,
                });
                this.set("detailSignals",detailSignals);
            }
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
            t_attrs = Config.get("nameList"), t_null = true;
            console.time(1);
            var filters = [], t_keys = d3.set(_.keys(filterRanges));
            for(var i in t_attrs){
                if(!t_keys.has(i)){
                    continue;
                }
                var t_range = filterRanges[i];
                if(t_range){
                    t_null = false;
                    var filter = {
                        name: i,
                        range: filterRanges[i].slice(0),
                    };
                    if(i == "timeDate"){
                        var t_shift = 8 * 3600 * 1000;
                        filter.range[0] += t_shift;
                        filter.range[1] += t_shift;
                    }
                    filters.push(filter);
                }
            }
            if(t_null) {
                Variables.set("filterSignals", null);
                Variables.trigger("clearFilter");
                self.trigger("updateFilterCount", self.get("signalNum"));
            }
            else {
                var filterSignals = [];
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
                self.getBarcharts(t_condition, v_df);
                console.timeEnd(1);
            }
        },

        updateDetailSignals: function() {
            var self = this, t_detail = self.get("detailSignals");
            if(!t_detail){
                return;
            }
            console.time(2);
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
                var t_namelist = {
                    "scope": "scope",
                    "scopedbm": "scope",
                    "bandwidth": "bandwidth",
                    "carriernoise": "carriernoise",
                    "signalnoise": "carriernoise",
                }
                var t_result = _.map(detailSignals, function(v_d){
                    var t_d = {};
                    for(var i in v_d){
                        t_d[t_namelist[i]] = v_d[i];
                    }
                    return t_d;
                })
                Variables.set("detailSignals",t_result);
            }
            else {
                Variables.set("detailSignals",null);
            }
            console.timeEnd(2);
        },

        querySpectrum: function(v_opts, v_callback){
            var v_frame = v_opts.frame_num, v_time = v_opts.time, v_scope = v_opts.scope;
            var self = this, v_df = $.Deferred(), v_return = {};
            var t_collection = Config.getData("spectrum");
            console.time(3);
            if(t_collection){
                v_return[v_scope] = 1;
                self.queryFromDB("query", {
                    condition: {"timeDate": {
                            '$gte': v_time[0] + 8 * 3600 * 1000,
                            '$lte': v_time[1] + 8 * 3600 * 1000,
                        }
                    },
                    return: _.extend(v_return, {'_id': 0, 'freq': 1}),
                }, function(v_d){
                    var t_result = [], t_namelist = {freq: "midfre"};
                    t_namelist[v_scope] = "scope";
                    for(var i in v_d){
                        var t_r = {}, vv_d = v_d[i];
                        for(var j in vv_d){
                            t_r[t_namelist[j]] = vv_d[j];
                        }
                        t_result.push(t_r);
                    }
                    Variables.set("filterData", t_result);
                }, v_df);
                $.when(v_df).done(function(){
                    var v_df1 = $.Deferred();
                    self.queryFromDB("query", {
                            condition: {"frameNum": v_frame},
                            return: {'scope': 1, 'frequency': 1, '_id': 0},
                        }, function(v_d){
                            console.timeEnd(3);
                            v_callback(v_d);
                            //handle spectrum data
                    }, v_df1, {
                        collection: t_collection,
                    });
                });       
            }
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
                    console.info("Query Sucess!", v_command, v_condition, v_extra);
                    if(v_callback) v_callback(v_data);
                    if(v_deferred) v_deferred.resolve();
                },
                error: function(err){
                    console.log("Query Error!", err, v_condition);
                },
            });
        },

        getBarcharts: function(v_condition, v_df, v_init){
            var self = this, filterSignals = [], t_list = Config.get("nameList");
            var t_onlyPr = self.get("onlyProjection");
            var t_return, t_dims;
            if(t_onlyPr){
                t_return = {'_id': 0};
            }else{
                t_return = self.getBCAttributes();
            }
            t_dims = self.getDimensions();
            var t_condition = {
                    condition: v_condition,
                    return: t_return.attrs,
                    dimensions: t_dims,
                    onlyProjection: t_onlyPr,
                    ratio: Config.get("projection")["SampleRate"],
                };
            self.queryFromDB("queryBC", t_condition, function(v_data){
                if(!v_init){
                    var t_data = v_data.data;
                    var t_names = {};
                    for(var i in t_data[0]){
                        var t_l = t_list[i];
                        if(i == "timeDate"){
                            t_names[i] = "firsttime";
                        }
                        if(t_l){
                            t_names[i] = t_l.name;
                        }
                    }
                    for(var i in t_data){
                        var t_d = {};
                        for(var j in t_data[i]){
                            var t_name = t_names[j], tt_d = t_data[i][j];
                            if(t_name == "firsttime"){
                                tt_d -= 8 * 3600 * 1000;
                            }
                            t_d[t_name] = tt_d;
                        }
                        filterSignals.push(t_d);
                    }
                }
                if(v_data.count > 0){
                    self.updateBarcharts(v_data.barcharts, v_data.range);
                    self.updateProjection(v_data.projection);
                }else{
                    Variables.trigger("clearFilter");
                }
                if(!v_init){
                    Variables.set("filterSignals",filterSignals);
                    self.trigger("updateFilterCount", v_data.count);
                }else{
                    Datacenter.set("signalNum",v_data.count);
                }
            }, v_df, t_return.parameters);
            if(t_onlyPr){
                self.set("onlyProjection", false);
            }
        },

        getBCAttributes: function(){
            var self = this, t_list = Config.get("barchart").list,
            t_bc = self.get("barcharts"), t_attrs = Config.get("attrs");
            var t_r = {}, t_return = {'id': 1, '_id': 0}, t_pm = {};
            for(var i in t_list){
                var t_name = t_list[i];
                var t_cate = (t_attrs[t_name].type == "category"), t_attr = t_attrs[t_name].attr;
                if(!t_cate){
                    var t_bins = Config.get("barchart").bins;
                    t_pm[t_attr] = {range: t_bc?t_bc[t_name].get("xRange"):null, count: t_bins};
                }
                t_return[t_attr] = 1;
            }
            t_r.attrs = t_return;
            t_r.parameters = t_pm;
            return t_r;
        },

        getDimensions: function(){
            var t_dims = Variables.getDimensions(), t_attrs = Config.get("attrs");
            var t_result = [];
            for(var i in t_dims){
                t_result.push("norm" + t_attrs[t_dims[i]].attr);
            }
            return t_result;
        },

        updateBarcharts: function(v_bc, v_range){
            var self = this, t_nl = Config.get("nameList"), t_attrs = Config.get("attrs"),
                t_bcs = self.get("barcharts");
            if(!t_bcs){
                t_bcs = {};
                for(var i in v_bc){
                    var t_name = t_nl[i].name;
                    t_bcs[t_name] = new BarchartModel(
                        {
                            name: t_name,
                            bins: v_bc[i],
                            attr: i,
                            scale: t_attrs[t_name].scale,
                            category: t_nl[i].type == "category",
                            range: v_range[i],
                        });
                    self.get("barchartCollection").add(t_bcs[t_name]);
                    Variables.get("filterRanges")[i] = null;
                }
                self.set("barcharts", t_bcs);
            }else{
                for(var i in v_bc){
                    var t_name = t_nl[i].name, t_bc = t_bcs[t_name];
                    if(!t_bc){
                        console.log("no " + t_name);
                    }else{
                        t_bc.update(v_bc[i]);
                    }
                }
            }
        },

        updateProjection: function(v_layout){
            Variables.trigger("updateProjection", v_layout);
        },

        changeSubspace: function(){
            var self = this;
            self.set("onlyProjection", true);
            self.queryFunc();
        },

        clearAll: function(){
            var self = this;
            self.set({
                "signals": null,
                "aggCount": null,
                "minTime":null,
                "maxTime":null,
                "minMidfre":null,
                "maxMidfre":null,
                "detailSignals":null,
                "barcharts": null,
                "scatterplot":null,
                "highdimension":null,
                "signalNum":null,
                "onlyProjection": false,
            });
            self.get("barchartCollection").reset();
        },
    }))();
 });
