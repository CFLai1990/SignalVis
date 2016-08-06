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
                bandwidth: "#bandwidth-view",
                scope:"#scope-view",
                carriernoise:"#carriernoise-view",
                scatterplot:"#scatterplot-view",
                detailSignal:"#detailSignal",

            },
            events :{
                // "click #x_dropdown li a": "changeX",
                // "click #y_dropdown li a": "changeY",
                "click #dimensionBtns .button":"taggleDimension",
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


            // changeX: function(evt) {
            //     var scatterplotModel = Datacenter.get("scatterplot");
            //     var targetName = evt.target.getAttribute("data-value");
            //     var preModelName = scatterplotModel.get('xModel').get("attrName");
            //     if(preModelName != targetName) {
            //         var targetModel;
            //         if(targetName == "bandwidth") {
            //             targetModel = Datacenter.get("bandwidthBarChart");
            //             $(this.$el).find("#scatterplotXSelect").html("Bandwidth" + ' <span class="caret"></span>');

            //         }
            //         else if (targetName == "scope") {
            //             targetModel = Datacenter.get("scopeBarChart");
            //             $(this.$el).find("#scatterplotXSelect").html("Scope" + ' <span class="caret"></span>');

            //         }
            //         else if(targetName == "carriernoise") {
            //             targetModel = Datacenter.get('carriernoiseBarChart');
            //             $(this.$el).find("#scatterplotXSelect").html("Carriernoise" + ' <span class="caret"></span>');

            //         }
            //         scatterplotModel.set("xModel", targetModel);
            //     }
            // },
            // changeY: function(evt) {
            //     var scatterplotModel = Datacenter.get("scatterplot");
            //     var targetName = evt.target.getAttribute("data-value");
            //     var preModelName = scatterplotModel.get('yModel').get("attrName");
            //     if(preModelName != targetName) {
            //         var targetModel;
            //         if(targetName == "bandwidth") {
            //             targetModel = Datacenter.get("bandwidthBarChart");
            //             $(this.$el).find("#scatterplotYSelect").html("Bandwidth" + ' <span class="caret"></span>');

            //         }
            //         else if (targetName == "scope") {
            //             targetModel = Datacenter.get("scopeBarChart");
            //             $(this.$el).find("#scatterplotYSelect").html("Scope" + ' <span class="caret"></span>');

            //         }
            //         else if(targetName == "carriernoise") {
            //             targetModel = Datacenter.get('carriernoiseBarChart')
            //             $(this.$el).find("#scatterplotYSelect").html("Carriernoise" + ' <span class="caret"></span>');

            //         }
            //         scatterplotModel.set("yModel", targetModel);
            //     }
            // },
            onShow: function(){
                var self = this;
                self.initHDBtns();

                self.showChildView('bandwidth', new BarChartLayoutView({
                    model:Datacenter.get("bandwidthBarChart"),
                    id:"bandwidthBarChart",
                    theTitle:"带宽分布"
                }));
                self.showChildView('scope', new BarChartLayoutView({
                    model:Datacenter.get("scopeBarChart"),
                    id:"scopeBarChart",
                    theTitle:"能量分布"
                }));
                self.showChildView('carriernoise', new BarChartLayoutView({
                    model:Datacenter.get("carriernoiseBarChart"),
                    id:"carriernoiseBarChart",
                    theTitle:"载噪比分布"

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
                var highdimension = Datacenter.get("highdimension");
                if(highdimension.get("bandwidthActive"))
                    this.$el.find("#hdBandwidth").addClass("active");
                if(highdimension.get("midFrequencyActive"))
                    this.$el.find("#hdMidFrequency").addClass("active");
                if(highdimension.get("firsttimeActive"))
                    this.$el.find("#hdFirsttime").addClass("active");
                if(highdimension.get("scopeActive"))
                    this.$el.find("#hdScope").addClass("active");
                if(highdimension.get("carriernoiseActive"))
                    this.$el.find("#hdCarriernoise").addClass("active");
            },
            taggleDimension: function(evt) {
                var attr = evt.target.getAttribute("data-value");
                var highdimension = Datacenter.get("highdimension");
                var dimCount = highdimension.getNumActiveDims();
                var modelAttrName = attr+ "Active";
                console.log(modelAttrName);
                if(highdimension.get(modelAttrName)) {
                    if(dimCount <= 2) {
                        alert("The Number of selected dimensions should be >= 2");
                    }
                    else {
                        $(evt.target).removeClass("active");
                        highdimension.set(modelAttrName,false);

                    }
                }
                else {
                    $(evt.target).addClass("active");
                    highdimension.set(modelAttrName,true);
                }
            },
    });
});
