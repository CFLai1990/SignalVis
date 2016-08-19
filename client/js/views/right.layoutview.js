define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'datacenter',
    'config',
    "variables",
    'text!templates/right.tpl',
    "views/barchart.layoutview",
    "views/scatterplot.itemview",
    "views/highdimension.itemview",
    "views/detailSignal.itemview"
], function(require, Mn, _, $, Backbone,Datacenter,Config,Variables,Tpl,BarChartLayoutView
    ,ScatterplotItemView,HighDimensionItemView,DetailSignalItemView) {
    'use strict';

    return Mn.LayoutView.extend({
            template: _.template(Tpl),

            attributes:{
                'style' : 'width: 100%; height:100%;'
            },
            regions: {
                attributesView: "#attribute-view",
                scatterplot:"#scatterplot-view",
                detailSignal:"#detailSignal",
            },
            events :{
                // "click #x_dropdown li a": "changeX",
                // "click #y_dropdown li a": "changeY",
                "click #dimensionBtns .button":"toggleDimension",
                "mouseover .button": "onMouOverBtn",
                "mouseout .button": "onMouOutBtn",
            },
            initialize: function() {
                var self = this;
                self.listenTo(Variables,"change:detailSignals", function(model,detailSignals){
                        self.updateHD_detailSignalViews();
                });
            },
            updateHD_detailSignalViews: function() {
                if(Variables.get("detailSignals")) {
                    $(this.$el).find("#scatterplot-container").css("display","none");
                    $(this.$el).find("#detailSignal").css("display","block");
                }
                else {
                    $(this.$el).find("#scatterplot-container").css("display","block");
                    $(this.$el).find("#detailSignal").css("display","none");
                }
            },

            onShow: function(){
                var self = this;
                self.initHDBtns();
                var t_bts = Datacenter.get("barcharts");
                self.showChildView('attributesView', new BarChartLayoutView({
                    id: "attributes",
                }));
                self.showChildView('scatterplot', new HighDimensionItemView({
                    model:Datacenter.get("highdimension"),
                    id:"highdimension",

                }));
                this.updateHD_detailSignalViews();
                self.showChildView("detailSignal", new DetailSignalItemView({
                    model:Datacenter.get("detailSignals")
                }));
            },

            onMouOverBtn:function(evt) {
                // console.log(evt);
                $(evt.target).addClass("hover");
            },

            onMouOutBtn: function(evt) {
                // console.log(evt);
                $(evt.target).removeClass("hover");
            },

            initHDBtns:function(){
                var self = this, t_dims = Variables.get("dimensions");
                $("#dimensionBtns .button").addClass("hdhidden");
                for(var i in t_dims){
                    self.$el.find("#hd"+i).removeClass("hdhidden");
                    if(t_dims[i]){
                        self.$el.find("#hd"+i).addClass("active");
                    }else{
                        self.$el.find("#hd"+i).removeClass("active");
                    }
                }
                // var highdimension = Datacenter.get("highdimension");
                // if(highdimension.get("bandwidthActive"))
                //     this.$el.find("#hdBandwidth").addClass("active");
                // if(highdimension.get("midFrequencyActive"))
                //     this.$el.find("#hdMidFrequency").addClass("active");
                // if(highdimension.get("firsttimeActive"))
                //     this.$el.find("#hdFirsttime").addClass("active");
                // if(highdimension.get("scopeActive"))
                //     this.$el.find("#hdScope").addClass("active");
                // if(highdimension.get("carriernoiseActive"))
                //     this.$el.find("#hdCarriernoise").addClass("active");
            },

            toggleDimension: function(evt) {
                var attr = evt.target.getAttribute("data-value");
                var highdimension = Datacenter.get("highdimension");
                var dimCount = highdimension.getNumActiveDims();
                if(Variables.get("dimensions")[attr]) {
                    if(dimCount <= 2) {
                        alert("The Number of selected dimensions should be >= 2");
                    }
                    else {
                        var t_attr = {};
                        t_attr[attr] = false;
                        $(evt.target).removeClass("active");
                        Variables.toggleDimensions(t_attr, true);
                    }
                }
                else {
                    var t_attr = {};
                    t_attr[attr] = true;
                    $(evt.target).addClass("active");
                    Variables.toggleDimensions(t_attr, true);
                }
            },
    });
});
