/**
 * Created by tangzhi.ye at 2015/11/24
 * model for default setting
 */
define([
    'require',
    'marionette',
    'backbone'
], function(require, Mn, Backbone) {
    'use strict';

    return window.Config = new (Backbone.Model.extend({
        defaults: {
            "currentData": "signal",
            "nameList": {
                "id": {name: "id", type: "int", norm: null},
                "freq":{name: "midfre", type: "float", norm: true},
                "baud":{name: "bandwidth", type: "float", norm: true},
                "scope":{name: "scope", type: "int", norm: true},
                "timeDate":{name: "firsttime", type: "time", norm: true},
                "snr":{name: "signalnoise", type: "int", norm: true},
                "carriernoise":{name: "carriernoise", type: "int", norm: true},
                "dbm":{name: "scopedbm", type: "int", norm: true},
                "timeDate": {name: null, type: "int", norm: false},
                "count":{name: null, type: "int", norm: true},
                "Lasttime":{name: null, type: null, norm: null},
                "Modulationmode":{name: "mode", type: "category", norm: true},
                "Modulationrate":{name: "rate", type: "category", norm: true},
                "CsTran":{name: "tran", type: "category", norm: true},
                "mark":{name: "mark", type: "category", norm: true},
                "SignalType":{name: "sigtype", type: "category", norm: true},
                "location":{name: "location", type: "category", norm: true},
                "demod":{name: "demod", type: "category", norm: true},
                // "demodrate":{name: "demodrate", type: "category", norm: true},
                // "inforate":{name: "inforate", type: "category", norm: true},
                "isDAOPU":{name: "daopu", type: "category", norm: true},
                "isTDMA":{name: "tdma", type: "category", norm: true},
                "codeType":{name: "codetype", type: "category", norm: true},
                "frameLen":{name: "frameLen", type: "category", norm: true},
                "isdiff":{name: "diff", type: "category", norm: true},
                "transport":{name: "transport", type: "category", norm: true},
                "poly":{name: "poly", type: "category", norm: true},
            },
            "data": {
                "950MHz": {
                    "dataTable": "SignalDB",
                    "localPath": "data/950MHz.csv",
                    "spectrum": null,
                },
                "signal": {
                    "dataTable": "SignalDB0",
                    "localPath": "data/signal.csv",
                    "spectrum": "Spectrum",
                },
                "signaldata1": {
                    "dataTable": "SignalDB1",
                    "localPath": "data/signaldata1.csv",
                    "spectrum": null,
                },
                "signaldata2": {
                    "dataTable": "SignalDB2",
                    "localPath": "data/signaldata2.csv",
                    "spectrum": null,
                },
            },
            "barchart": {
                "bins": 36,
                "list": null,
            },
            "chineseAttrNames": {
                "midfre": "中心频率",
                "firsttime": "时间",
                "bandwidth": "带宽",
                "scope": "能量",
                "scopedbm": "能量",
                "carriernoise": "载噪比",
                "signalnoise": "信噪比",
                "count": "数目",
                "mode": "调制模式",
                "rate": "调制速率",
                "tran": "CsTran",
                "mark": "mark",
                "sigtype": "信号类型",
                "tdma": "TDMA",
                "diff": "isDiff",
                "daopu": "倒谱",
                "codetype": "CodeType",
                "location": "地点",
                "demod": "解调模式",
                "demodrate": "解调速率",
                "inforate": "inforate",
                "transport": "传输协议",
                "poly": "poly",
                "frameLen": "帧长",
            },
            "attrs": {
                "bandwidth": {"attr": "baud", "scale": "power", type: "float", text: "bandwidthRangeText", hd: true},
                "scope": {"attr": "scope", "scale": "power", type: "int", text: "scopeRangeText", hd: true},
                "carriernoise": {"attr": "carriernoise", "scale": "power", type: "int", text: "carriernoiseRangeText", hd: true},
                "signalnoise": {"attr": "snr", "scale": "power", type: "int", text: "signalnoiseRangeText", hd: true},
                "midfre": {"attr": "freq", "scale": "linear", type: "float", text: "midfreRangeText", hd: true},
                "firsttime": {"attr": "timeDate", "scale": "time", type: "time", text: "firsttimeRangeText", hd: true},
                "count": {"attr": "count", "scale": "linear", type: "int", text: null, hd: true},
                "mode": {"attr": "Modulationmode", "scale": "power", type: "category", text: null, hd: true},
                "rate": {"attr": "Modulationrate", "scale": "power", type: "category", text: null, hd: true},
                "tran": {"attr": "CsTran", "scale": "power", type: "category", text: null, hd: true},
                "mark": {"attr": "mark", "scale": "power", type: "category", text: null, hd: true},
                "sigtype": {"attr": "SignalType", "scale": "power", type: "category", text: null, hd: true},
                "tdma": {"attr": "isTDMA", "scale": "power", type: "category", text: null, hd: true},
                "location": {"attr": "location", "scale": "power", type: "category", text: null, hd: true},
                "demod": {"attr": "demod", "scale": "power", type: "category", text: null, hd: true},
                "demodrate": {"attr": "demodrate", "scale": "power", type: "category", text: null, hd: true},
                "inforate": {"attr": "inforate", "scale": "power", type: "category", text: null, hd: true},
                "scopedbm": {"attr": "dbm","scale": "power", type: "int", text: "scopedbmRangeText", hd: true},
                "daopu": {"attr": "isDAOPU","scale": "power", type: "category", text: null, hd: true},
                "diff": {"attr": "isdiff","scale": "power", type: "category", text: null, hd: true},
                "codetype": {"attr": "codeType","scale": "power", type: "category", text: null, hd: true},
                "transport": {"attr": "transport","scale": "power", type: "category", text: null, hd: true},
                "poly": {"attr": "poly","scale": "power", type: "category", text: null, hd: true},
                "frameLen": {"attr": "frameLen","scale": "power", type: "category", text: null, hd: true},
            },
            "pixel": {
                "attrs": [
                    {"name": "firsttime", "attr": "timeDate", "scale": "time"},
                    {"name": "midfre", "attr": "freq", "scale": "linear"},
                ],
                "plansize": [240, 240],
                "size": null,
            },
            "projection": {
                "SampleRate": [1, 1, 0.9, 0.6, 0.1, 0.1, 0.05, 0.01, 0.01],
                "opacity": [0.9, 0.9, 0.6, 0.5, 0.5, 0.3, 0.3, 0.2, 0.2],
            },
            "dictionary": null,
        },

        initialize: function(){
            var self = this;
        },

        getData: function(v_i){
            var self = this;
            var t_data = self.get("currentData");
            if(v_i){
                return self.get("data")[t_data][v_i];
            }else{
                return self.get("data")[t_data];
            }
        },

        changeData: function(v_data){
            var self = this;
            var t_data = self.get("currentData");
            if(t_data != v_data){
                if(!self.get("data")[v_data]){
                    console.log("No such data!");
                    return;
                }
                self.set("currentData", v_data);
                self.trigger("Config:changeData");
            }
        },

        clearAll: function(){
            var self = this;
            self.set("dictionary", null);
            self.get("barchart").list = null;
        },
    }))();
});
