/**
 * Created by tangzhi.ye at 2015/12/10
 * model and collection for signal data
 */
define([
    'require',
    'marionette',
    'backbone'
], function(require, Mn, Backbone) {
    'use strict';
    var signal = {};
    signal.Model =  Backbone.Model.extend({
        defaults: {
            "Midfrequency":-1, // float MHz
            "Bandwidth":-1, //dB
            "Scope":-1, //dBm
            "Carriernoise":-1, //dB
            "Firsttime":-1, //int ms
        },
    });
    signal.Collection = Backbone.Collection.extend({
        model: signal.Model
    });
    return signal;
});
