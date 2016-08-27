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
            console.log("scatter plot draw");
            var self = this;
            self.d3el.select(".mainReginSvg").remove();
            self.d3el.selectAll(".y axis").remove();
            self.d3el.selectAll(".x axis").remove();
            self.d3el.selectAll('.nodes').remove();
            self.margin = {top: 5, right: 20, bottom: 15, left: 30};
            self.chartWidth = self.$el.width() - self.margin.left - self.margin.right;
            self.chartHeight = self.$el.height() - self.margin.top - self.margin.bottom;
            self.mainRegin = self.d3el.append("g").attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
            .attr("class","mainReginSvg");
            var filterSignals = self.model.get('filterSignals');
            if(!filterSignals){
                return;
            }else{
            self.xAxisScale = d3.scale.linear()
                                        .domain([self.model.get('xmin'),self.model.get('xmax')])
                                        .range([0, self.chartWidth]);
            self.yAxisScale = d3.scale.linear()
                                        .domain([self.model.get('ymin'),self.model.get('ymax')])
                                        .range([self.chartHeight ,0]);
            self.yScale = d3.scale.linear()
                            .domain([self.model.get('ymin'),self.model.get('ymax')])
                            .range([0,self.chartHeight]);
            self.xAxis = d3.svg.axis().scale(self.xAxisScale).orient("bottom").ticks(10);

            self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left").ticks(10);

            self.mainRegin.append("g")
              .attr("class", "y axis")
              .call(self.yAxis);

            self.mainRegin.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + self.chartHeight + ")")
              .call(self.xAxis);
                self.nodeGroups = [];

            //split arr for progressive render
                var subArr,chunk = 1000, t_length = filterSignals.length, t_opc;
                switch(Math.floor(Math.log10(t_length))){
                    case 0:
                    case 1:
                        t_opc = 0.9;
                    break;
                    case 2:
                        t_opc = 0.6;
                    break;
                    case 3:
                        t_opc = 0.3;
                    break;
                    default:
                        t_opc = 0.2;
                    break;
                }
                for (var i=0; i<filterSignals.length; i+=chunk) {
                    var nodeGroup = self.mainRegin.append("g").attr("class","nodes");
                    // self.nodeGroups.push();
                    // var groupIndex = parseInt( i / chunk);
                    // var nodeGroup = self.nodeGroups[groupIndex]；
                    subArr = filterSignals.slice(i,i+chunk);
                    var xAttrName = self.model.get('xModel').get("attrName");
                    var yAttrName = self.model.get('yModel').get("attrName");
                    var nodeEnter = nodeGroup.selectAll(".node").data(subArr).enter()
                                    .append("g").attr("class","node");

                     nodeEnter.append("circle")
                                        .attr("width", self.binWidth)
                                        .attr("cx", function(d) {
                                            return self.xAxisScale(d[xAttrName]);
                                        })
                                        .attr("cy", function(d){return self.yScale(d[yAttrName]);})
                                        .attr("r", function(){
                                            return "2px";
                                        })
                                        .attr("opacity", t_opc);
                }
            }
        }
    }, SVGBase));
});
