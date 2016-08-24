define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'datacenter',
    'config',
    'variables',
    'views/svg-base.addon',
], function(require, Mn, _, $, Backbone,Datacenter,Config, Variables,SVGBase) {
    'use strict';
    return Mn.ItemView.extend(_.extend({
        tagName: 'svg',
        template:false,

        attributes:{
            'style' : 'width: 100%; height:100%;'
        },

        initialize: function(options)
        {
            var self = this;
            options = options || {};
            self.listenTo(self.model,"change:redraw", function(model, yName){
                self.onShow();
            });

        },

        onShow: function()
        {
            console.log("high dimension plot draw");
            var self = this;
            self.margin = {top: 5, right: 20, bottom: 15, left: 30},
            self.chartWidth = self.$el.width() - self.margin.left - self.margin.right;
            self.chartHeight = self.$el.height() - self.margin.top - self.margin.bottom;
            self.xAxisScale = d3.scale.linear()
                                        .domain([self.model.get('xmin'),self.model.get('xmax')])
                                        .range([0, self.chartWidth]);
            self.yAxisScale = d3.scale.linear()
                                        .domain([self.model.get('ymin'),self.model.get('ymax')])
                                        .range([self.chartHeight ,0]);
            self.d3el.select(".mainReginSvg").remove();
            self.mainRegin = self.d3el.append("g").attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
                                                .attr("class","mainReginSvg");
            self.d3el.selectAll('.nodes').remove();
            var filterSignals = Variables.get("filterSignals");
            var reductionSignals = self.model.get('reductionSignals');
            var t_ratio = Config.get("projection")["SampleRate"],
                t_opcs = Config.get("projection")["opacity"],
                t_samples;
            if(filterSignals && filterSignals.length > 5 && reductionSignals) {
                var t_size = Math.round(Math.log10(reductionSignals.length)), t_opc;
                t_opc = t_opcs[t_size];
                t_samples = _.sample(reductionSignals, Math.round(reductionSignals.length * t_ratio[t_size]));

                var nodeGroup = self.mainRegin.append("g").attr("class","nodes");

                var nodeEnter = nodeGroup.selectAll(".node").data(t_samples).enter()
                                .append("g").attr("class","node");

                 nodeEnter.append("circle")
                                    .attr("width", self.binWidth)
                                    .attr("cx", function(d) {
                                        return self.xAxisScale(d[0]);
                                    })
                                    .attr("cy", function(d){return self.yAxisScale(d[1]);})
                                    .attr("r", function(){
                                        return "2px";
                                    })
                                    .attr("opacity", t_opc);
            }
        }

    }, SVGBase));
});
