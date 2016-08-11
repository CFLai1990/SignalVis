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
            "dataTable": "SignalDB",
            "signalCsvPath": "data/950M-formated.csv",
            "signalOriginCsvPath": "data/950MHz.csv",
            "preComputeJsonPath":"data/preCompute.json",
            "nameList": {
                "id": {name: "id", type: "int", norm: null},
                "Midfrequency(MHz)":{name: "midfre", type: "float", norm: "normMidfrequency"},
                "Bandwidth(dB)":{name: "bandwidth", type: "float", norm: "normBandwidth"},
                "Scope(dBm)":{name: "scope", type: "int", norm: "normScope"},
                "Firsttime":{name: "firsttime", type: "time", norm: "normFirsttime"},
                "Carriernoise(dB)":{name: "carriernoise", type: "int", norm: "normCarriernoise"},
                "Count":{name: null, type: null, norm: null},
                "Lasttime":{name: null, type: null, norm: null},
                "Modulationmode":{name: null, type: null, norm: null},
                "Modulationrate":{name: null, type: null, norm: null},
                "CsTran":{name: null, type: null, norm: null},
                "mark":{name: null, type: null, norm: null},
                "SignalType":{name: null, type: null, norm: null},
            },

        },
    }))();
});
