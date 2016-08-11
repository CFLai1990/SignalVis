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
// //Title
            // self.d3el.selectAll(".scatterplotTitle").remove();
            // self.d3el.append("text")
            //             .attr("x", self.$el.width() / 2 )
            //             .attr("y", self.margin.top)
            //             .attr("class","scatterplotTitle")
            //             .style("text-anchor", "middle")
            //             .text(self.model.get("xName") + " VS "+ self.model.get("yName"));
// //Scale
//             self.binWidth = Math.floor(self.chartWidth / self.model.get("numOfBins"));
            self.xAxisScale = d3.scale.linear()
                                        .domain([self.model.get('xmin'),self.model.get('xmax')])
                                        .range([0, self.chartWidth]);

            // self.xScale = d3.scale.linear()
            //                     .domain([0,self.model.get("numOfBins") -1])
            //                     .range([0, self.chartWidth - self.binWidth]);
            // console.log(self.model.get('ymin'));
            self.yAxisScale = d3.scale.linear()
                                        .domain([self.model.get('ymin'),self.model.get('ymax')])
                                        .range([self.chartHeight ,0]);

            // self.yScale = d3.scale.linear()
            //                 .domain([self.model.get('ymin'),self.model.get('ymax')])
            //                 .range([0,self.chartHeight]);
            self.d3el.select(".mainReginSvg").remove();
            self.mainRegin = self.d3el.append("g").attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
                                                .attr("class","mainReginSvg");

// // //Axis
            // self.xAxis = d3.svg.axis().scale(self.xAxisScale).orient("bottom").ticks(10);

            // self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left").ticks(10);

            // self.d3el.selectAll(".y axis").remove();
            // self.d3el.selectAll(".x axis").remove();

            // self.mainRegin.append("g")
            //   .attr("class", "y axis")
            //   .call(self.yAxis);

            // self.mainRegin.append("g")
            //   .attr("class", "x axis")
            //   .attr("transform", "translate(0," + self.chartHeight + ")")
            //   .call(self.xAxis);

// // nodes
            self.d3el.selectAll('.nodes').remove();
            var filterSignals = Variables.get("filterSignals");
            var reductionSignals = self.model.get('reductionSignals');
            // console.log(reductionSignals)
            var t_ratio = 0.1, t_samples;
            if(filterSignals && filterSignals.length > 5 && reductionSignals) {
                t_samples = _.sample(reductionSignals, Math.round(reductionSignals.length * t_ratio));

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
                                    });
            }
        }

    }, SVGBase));
});
