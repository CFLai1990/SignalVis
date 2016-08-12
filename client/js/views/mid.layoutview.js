define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'datacenter',
    'config',
    'text!templates/mid.tpl',
    "views/overviewLeg.itemview"
], function(require, Mn, _, $, Backbone,Datacenter,Config,Tpl,OverviewLeg) {
    'use strict';

    return Mn.LayoutView.extend({
            template: _.template(Tpl),

            attributes:{
                'style' : 'width: 100%; height:100%;'
            },

            regions: {
                stat:"#stat-view",
                colorBtns: "#colorBtns-view",
                colorLeg:"#colorLeg-view",
                sizeBtns:"#sizeBtns-view",
                sizeLeg:"#sizeLeg-view"
            },
              events: {
                'click #colorBtns' : 'onClickColorBtns',
                'click #sizeBtns' : 'onClickSizeBtns',
                "mouseover .button": "onMouOverBtn",
                "mouseout .button": "onMouOutBtn",

            },
            initialize: function() {
                var self = this;
                self.listenTo(Variables,"change:filterSignals", function(model, filterSignals){
                        self.onChangeFilterSignals(filterSignals);
                });
                self.listenTo(Variables,"change:bandwidthFilterRange", function(model,bandwidthFilterRange){
                        self.updateBandwithRangeText();
                });
                self.listenTo(Variables,"change:scopeFilterRange", function(model,scopeFilterRange){
                        self.updateScopeRangeText();
                });
                self.listenTo(Variables,"change:carriernoiseFilterRange", function(model,carriernoiseFilterRange){
                        self.updateCarriernoiseRangeText();
                });
                self.listenTo(Variables,"change:firsttimeFilterRange", function(model,carriernoiseFilterRange){
                        self.updateTimeRangeText();
                });
                self.listenTo(Variables,"change:midfreFilterRange", function(model,midfreFilterRange){
                        self.updateMidfreRangeText();
                });


            },
            onClickColorBtns: function(evt) {
                var values = evt.target.getAttribute("data-value")
                console.log(values);
                // console.log(event.target);
                $(this.$el).find("#colorBtns").find(".button").removeClass("active");
                $(evt.target).addClass("active");
                if(values == "bandwidth") {

                }
                else if(values == "scope") {
                }
                else if (values == "carriernoise") {

                }
                else { //unselect
                    console.log('error');
                }
            },
            onClickSizeBtns: function(evt) {
                 var values = evt.target.getAttribute("data-value")
                console.log(values);
                // console.log(event.target);
                $(this.$el).find("#sizeBtns").find(".button").removeClass("active");
                $(evt.target).addClass("active");
                if(values == "bandwidth") {

                }
                else if(values == "scope") {

                }
                else if (values == "carriernoise") {

                }
                else { //unselect
                    console.log('error');
                }
            },
            onShow:function() {
                    this.$el.find("#signalNum").text(Datacenter.get("signals").length);
                    this.updateBandwithRangeText();
                    this.updateScopeRangeText();
                    this.updateCarriernoiseRangeText();
                    this.updateTimeRangeText();
                    this.updateMidfreRangeText();
                    this.showChildView("sizeLeg", new OverviewLeg());
            },
            updateTimeRangeText:function() {
                var filterRange = Variables.get("firsttimeFilterRange");
                if(filterRange) {
                    var rangeText = new Date(filterRange[0]).toTimeString().substring(0,8) +
                        " ~ " + new Date(filterRange[1]).toTimeString().substring(0,8);
                     this.$el.find("#firsttimeRangeText").text(rangeText);
                }
                else {
                    var t_range = Datacenter.get("timeRange");
                    var rangeText = new Date(t_range[0]).toTimeString().substring(0,8) +
                        " ~ " + new Date(t_range[1]).toTimeString().substring(0,8);
                    this.$el.find("#firsttimeRangeText").text(rangeText);

                }
            },
            updateMidfreRangeText:function() {
                var filterRange = Variables.get("midfreFilterRange");
                if(filterRange) {
                    var rangeText = filterRange[0].toFixed(3) +
                        " ~ " + filterRange[1].toFixed(3);
                     this.$el.find("#midfreRangeText").text(rangeText);
                }
                else {
                    var t_range = Datacenter.get("midfreRange");
                    var rangeText = t_range[0].toFixed(3) +
                        " ~ " + t_range[1].toFixed(3);
                    this.$el.find("#midfreRangeText").text(rangeText);

                }
            },
            updateBandwithRangeText:function() {
                var filterRange = Variables.get("bandwidthFilterRange");
                if(filterRange) {
                    var rangeText = filterRange[0].toFixed(3) +
                        " ~ " + filterRange[1].toFixed(3);
                     this.$el.find("#bandwidthRangeText").text(rangeText);
                }
                else {
                    var t_range = Datacenter.get("barcharts")["bandwidth"].get("xRange");
                    var rangeText = t_range[0].toFixed(3) +
                        " ~ " + t_range[1].toFixed(3);
                    this.$el.find("#bandwidthRangeText").text(rangeText);

                }
            },
            updateScopeRangeText:function() {
                var filterRange = Variables.get("scopeFilterRange");
                if(filterRange) {
                    var rangeText = parseInt(filterRange[0]) +
                        " ~ " + parseInt(filterRange[1]);
                     this.$el.find("#scopeRangeText").text(rangeText);
                }
                else {
                    var t_range = Datacenter.get("barcharts")["scope"].get("xRange");
                    var rangeText = parseInt(t_range[0]) +
                        " ~ " + parseInt(t_range[1]);
                    this.$el.find("#scopeRangeText").text(rangeText);

                }
            },

            updateCarriernoiseRangeText:function() {
                var filterRange = Variables.get("carriernoiseFilterRange");
                if(filterRange) {
                    var rangeText = parseInt(filterRange[0]) +
                        " ~ " + parseInt(filterRange[1]);
                     this.$el.find("#carriernoiseRangeText").text(rangeText);
                }
                else {
                    var t_range = Datacenter.get("barcharts")["carriernoise"].get("xRange");
                    var rangeText = parseInt(t_range[0]) +
                        " ~ " + parseInt(t_range[1]);
                    this.$el.find("#carriernoiseRangeText").text(rangeText);

                }
            },

            onChangeFilterSignals:function(filterSignals) {
                if(!filterSignals)
                    this.$el.find("#signalNum").text(Datacenter.get("signals").length);
                else
                    this.$el.find("#signalNum").text(filterSignals.length);


            },
            onMouOverBtn:function(evt) {
                // console.log(evt);
                $(evt.target).addClass("hover");

            },

            onMouOutBtn: function(evt) {
                // console.log(evt);
                $(evt.target).removeClass("hover");

            }
    });
});
