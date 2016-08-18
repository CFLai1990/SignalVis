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
            "currentData": "950MHz",
            "nameList": {
                "id": {name: "id", type: "int", norm: null},
                "freq":{name: "midfre", type: "float", norm: "normMidfrequency"},
                "baud":{name: "bandwidth", type: "float", norm: "normBandwidth"},
                "scope":{name: "scope", type: "int", norm: "normScope"},
                "time":{name: "firsttime", type: "time", norm: "normFirsttime"},
                "snr":{name: "signalnoise", type: "int", norm: "normSnr"},
                "carriernoise":{name: "carriernoise", type: "int", norm: "normCarriernoise"},
                "count":{name: null, type: null, norm: null},
                "Lasttime":{name: null, type: null, norm: null},
                "Modulationmode":{name: null, type: null, norm: null},
                "Modulationrate":{name: null, type: null, norm: null},
                "CsTran":{name: null, type: null, norm: null},
                "mark":{name: null, type: null, norm: null},
                "SignalType":{name: null, type: null, norm: null},
            },
            "data": {
                "950MHz": {
                    "dataTable": "SignalDB",
                    "localPath": "data/950MHz.csv",
                },
                "signal": {
                    "dataTable": "SignalDB0",
                    "localPath": "data/signal.csv",
                },
                "signaldata1": {
                    "dataTable": "SignalDB1",
                    "localPath": "data/signaldata1.csv",
                },
                "signaldata2": {
                    "dataTable": "SignalDB2",
                    "localPath": "data/signaldata2.csv",
                },
            },
            "barchart": {
                "bins": 40,
            },
            "chineseAttrNames": {
                "bandwidth": "带宽",
                "scope": "能量",
                "carriernoise": "载噪比",
                "signalnoise": "信噪比",
            },
            "attrs": {
                "bandwidth": {"attr": "baud", "scale": "power"},
                "scope": {"attr": "scope", "scale": "linear"},
                "carriernoise": {"attr": "carriernoise", "scale": "linear"},
                "signalnoise": {"attr": "snr", "scale": "linear"},
            },
            "pixel": {
                "attrs": [
                    {"name": "midfre", "attr": "freq", "scale": "linear"},
                    {"name": "firsttime", "attr": "timeDate", "scale": "time"},
                ],
                "size": [120, 240],
            },
            "projection": {
                "SampleRate": 0.3,
            }
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
    }))();
});
