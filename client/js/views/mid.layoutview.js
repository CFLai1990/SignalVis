define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'datacenter',
    'config',
    'perfectScrollbar',
    'text!templates/mid.tpl',
    "views/overviewLeg.itemview"
], function(require, Mn, _, $, Backbone,Datacenter,Config,Scrollbar,Tpl,OverviewLeg) {
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
                self.listenTo(Variables, "updateFilter",  function(model){
                        self.updateMidTexts();
                });
                self.listenTo(Variables, "clearFilter", function(){
                    self.updateMidTexts();
                });
                self.listenTo(Datacenter, "updateFilterCount", function(v_count){
                        self.updateCountText(v_count);
                })
            },
            onClickColorBtns: function(evt) {
                var values = evt.target.getAttribute("data-value");
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
                 var values = evt.target.getAttribute("data-value");
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
                    this.$el.find("#signalNum").text(Datacenter.get("signalNum"));
                    this.updateMidTexts();
                    $("#stat-view").perfectScrollbar({wheelSpeed: 0.1});
                    this.showChildView("sizeLeg", new OverviewLeg());
            },

            updateCountText: function(v_count){
                this.$el.find("#signalNum").text(v_count);
            },

            updateMidTexts: function(){
                var t_attrs = Config.get("attrs"), t_range, self = this;
                for(var i in t_attrs){
                    var t_atobj = t_attrs[i];
                    if(t_atobj.text){
                        t_range = Variables.get("filterRanges")[t_atobj.attr];
                        // if(!t_range){
                            switch(i){
                                case "firsttime":
                                    t_range = Datacenter.get("timeRange");
                                break;
                                case "midfre":
                                    t_range = Datacenter.get("midfreRange");
                                break;
                                default:
                                    t_range = Datacenter.get("barcharts")[i];
                                    if(t_range){
                                        if(t_range.get("filterRange")){
                                            t_range = t_range.get("filterRange");
                                        }else{
                                            t_range = t_range.get("xRange");
                                        }
                                    }
                                break;
                            }
                        // }
                        if(!t_range){
                            // console.log("No attribute: " + i);
                            this.$el.find("."+t_atobj.text).css("display", "none");
                        }else{
                            var rangeText;
                            switch(t_atobj.type){
                                case "int":
                                    rangeText = parseInt(t_range[0]) +
                                    " ~ " + parseInt(t_range[1]);
                                break;
                                case "float":
                                    rangeText = t_range[0].toFixed(3) +
                                    " ~ " + t_range[1].toFixed(3);
                                break;
                                case "time":
                                    var t_start = new Date(t_range[0]), t_end = new Date(t_range[1]);
                                    t_start = t_start.toDateString().substring(4,10) + " " +
                                        t_start.toTimeString().substring(0,8);
                                    t_end = t_end.toDateString().substring(4,10) + " " +
                                        t_end.toTimeString().substring(0,8);
                                    rangeText = t_start + " ~ " + t_end;
                                    // rangeText = new Date(t_range[0]).toTimeString().substring(0,8) +
                                    // " ~ " + new Date(t_range[1]).toTimeString().substring(0,8);
                                break;
                            }
                            this.$el.find("#"+t_atobj.text).text(rangeText);
                        }
                    }else{
                    }
                }
            },

            updateTimeRangeText:function() {
                var filterRange = Variables.get("filterRanges")["time"];
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
                var filterRange = Variables.get("filterRanges")["midfre"];
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
                var filterRange = Variables.get("filterRanges")["baud"];
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
                var filterRange = Variables.get("filterRanges")["scope"];
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
                var filterRange = Variables.get("filterRanges")["carriernoise"];
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
