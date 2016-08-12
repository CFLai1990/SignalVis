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
        template: false,

        attributes:{
            'style' : 'width: 100%; height:100%;'
        },
        events:{
            "click .barTitle": "onClickBarTitle"
        },

        initialize: function(options)
        {
            var self = this;
            options = options || {};
            if(options.theTitle){
                this.theTitle = options.theTitle;
                console.log(this.theTitle);
            }
            self.listenTo(self.model,"change:filterBins", function(model, filterBins){
                self.d3el.selectAll(".filterBin").remove();

                if(filterBins){
                    var binsEnter = self.binGroup.selectAll(".filterBin").data(filterBins).enter()
                                                    .append("g").attr("class","filterBin");

                    binsEnter.append("rect")
                        .attr("width", self.binWidth)
                        .attr("x", function(d,i) {
                            return self.xScale(i);
                        })
                        .attr("y", function(d){return self.chartHeight - self.yScale(d);})
                        .attr("height", function(d) { return self.yScale(d); });
                    self.switchMode();
                }
                else {

                }
            });
            // self.listenTo(self.model,"change:mode", function(model, mode) {
            //     self.switchMode();
            // });

        },

        switchMode: function() {
            var self = this;
            var filterBins = this.model.get("filterBins");
            var t_yRange = self.model.get("yRange");
            if(this.model.get("mode") == "zoomin" && filterBins){
                    self.d3el.select(".barTitle")
                        .text(self.theTitle + " (局部)");

                    var ymax = _.max(filterBins);
                    if(self.model.get("scale") == 'linear') {
                        self.yAxisScale.domain([0,ymax]);

                        self.yScale.domain([0,ymax]);
                        if(ymax > 10000){
                            self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left").ticks(3)
                                .tickFormat(function(d) { return Math.round(d / 1e3) + "K"; });
                        }
                        else {
                            self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left").ticks(3)
                                .tickFormat(function(d) { return Math.round(d)});
                        }
                    }
                    else if(self.model.get("scale") == 'power') {
                        var superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹",
                        formatPower = function(d) { return (d + "").split("").map(function(c) { return superscript[c]; }).join(""); };
                        self.yAxisScale.domain([1,ymax]);

                        self.yScale.domain([1,ymax]);

                        var tickValues = [];
                        for(var j=0;Math.pow(10,j)<=t_yRange[1];j++) {
                            tickValues.push(Math.pow(10,j));
                        }
                        self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left")
                                                .tickValues(tickValues)
                                                 .tickFormat(function (d) {
                                                        var result = Math.log10(d);
                                                         return "10" + formatPower(result);

                                                });

                    }
                    else {
                        console.log("error in barchart scale value")
                    }


                self.mainRegin .transition().duration(500)
                     .select(".y.axis")
                     .call(self.yAxis);

                self.d3el.selectAll(".totalBin").classed("hidden",true).transition().duration(500);

                self.mainRegin .transition().duration(500)
                     .selectAll(".filterBin rect")
                     .attr("y", function(d){return self.chartHeight - self.yScale(d);})
                     .attr("height", function(d) { return self.yScale(d); });

            }
            else if(this.model.get("mode") == "zoomout"){
                self.d3el.select(".barTitle")
                     .text(self.theTitle + " (全局)");
                if(self.model.get("scale") == 'linear') {
                    self.yAxisScale.domain(t_yRange);

                    self.yScale.domain(t_yRange);

                    self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left").ticks(3)
                        .tickFormat(function(d) { return Math.round(d / 1e3) + "K"; });;
                }
                else if(self.model.get("scale") == 'power') {
                    var superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹",
                    formatPower = function(d) { return (d + "").split("").map(function(c) { return superscript[c]; }).join(""); };
                    self.yAxisScale.domain([100,t_yRange[1]]);

                    self.yScale.domain([1,t_yRange[1]]);

                    var tickValues = [];
                    for(var j=2;Math.pow(10,j)<=t_yRange[1];j++) {
                        tickValues.push(Math.pow(10,j));
                    }
                    self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left")
                                            .tickValues(tickValues)
                                             .tickFormat(function (d) {
                                                    var result = Math.log10(d);
                                                     return "10" + formatPower(result);

                                            });

                }
                else {
                    console.log("error in barchart scale value")
                }


                self.mainRegin .transition().duration(500)
                     .select(".y.axis")
                     .call(self.yAxis);

                self.d3el.selectAll(".totalBin").classed("hidden",false).transition().duration(500);

                self.mainRegin .transition().duration(500)
                     .selectAll(".filterBin rect")
                     .attr("y", function(d){return self.chartHeight - self.yScale(d);})
                     .attr("height", function(d) { return self.yScale(d); });
            }

        },

        onShow: function()
        {
            var self = this;
            self.margin = {top: 20, right: 20, bottom: 15, left: 30},

            self.chartWidth = self.$el.width() - self.margin.left - self.margin.right;
            self.chartHeight = self.$el.height() - self.margin.top - self.margin.bottom;
            var t_range = {x: self.model.get("xRange"), y: self.model.get("yRange")};
//Title
            self.d3el.append("text")
                        .attr("x", self.$el.width() / 2 )
                        .attr("y", self.margin.top*0.75)
                        .style("text-anchor", "middle")
                        .attr("class","barTitle")
                        .text(self.theTitle + " (全局)");
//Scale
            self.binWidth = Math.floor(self.chartWidth / self.model.get("numOfBins"));
            self.xAxisScale = d3.scale.linear()
                                        .domain(t_range.x)
                                        .range([0, self.chartWidth]);

            self.xScale = d3.scale.linear()
                                .domain([0,self.model.get("numOfBins") -1])
                                .range([0, self.chartWidth - self.binWidth]);
            if(self.model.get("scale") == 'linear') {

                self.yAxisScale = d3.scale.linear()
                                        .domain(t_range.y)
                                        .range([self.chartHeight ,0]);

                self.yScale = d3.scale.linear()
                    .domain(t_range.y)
                    .range([0,self.chartHeight]);


                self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left").ticks(3)
                    .tickFormat(function(d) { return Math.round(d / 1e3) + "K"; });;
            }
            else if(self.model.get("scale") == 'power') {
                var ymax = self.model.get("yRange")[1];
                var superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹",
                formatPower = function(d) { return (d + "").split("").map(function(c) { return superscript[c]; }).join(""); };
                self.yAxisScale = d3.scale.log().base(10).clamp(true)
                                        .domain([100,ymax])
                                        .range([self.chartHeight ,0]);

                self.yScale = d3.scale.log().base(10).clamp(true)
                    .domain([100,ymax])
                    .range([0,self.chartHeight]);


                var tickValues = [];
                for(var j=2;Math.pow(10,j)<=ymax;j++) {
                    tickValues.push(Math.pow(10,j));
                }
                self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left")
                                        .tickValues(tickValues)
                                         .tickFormat(function (d) {
                                                var result = Math.log10(d);
                                                 return "10" + formatPower(result);

                                        });

            }
            else {
                console.log("error in barchart scale value")
            }

            self.mainRegin = self.d3el.append("g").attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

//Axis
            self.xAxis = d3.svg.axis().scale(self.xAxisScale).orient("bottom").ticks(10);




            self.mainRegin.append("g")
              .attr("class", "y axis")
              .call(self.yAxis);

            self.mainRegin.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + self.chartHeight + ")")
              .call(self.xAxis);

//Bins
            self.binGroup = self.mainRegin.append("g").attr("class","bins");
            var binsEnter = self.binGroup.selectAll(".totalBin").data(self.model.get("totalBins")).enter()
                                            .append("g").attr("class","totalBin");

             binsEnter.append("rect")
                            .attr("width", self.binWidth)
                            .attr("x", function(d,i) {
                                return self.xScale(i);
                            })
                            .attr("y", function(d){return self.chartHeight - self.yScale(d);})
                            .attr("height", function(d) { return self.yScale(d); });
//Brush
            self.brush = d3.svg.brush()
                                    .x(self.xAxisScale)
                                    .on("brushstart", function(){

                                    })
                                    .on("brush", function() {

                                    })
                                    .on("brushend", function(){
                                        var filterRangeName = self.model.get("filterRangeName");
                                        if(self.brush.empty()) {
                                            Variables.set(filterRangeName,null);
                                        }
                                        else {
                                            var extent = self.brush.extent();
                                            var brushRange = []
                                            brushRange.push(extent[0]);
                                            brushRange.push(extent[1]);
                                            console.log(filterRangeName, brushRange);
                                            Variables.set(filterRangeName,brushRange);
                                        }
                                    });


            self.mainRegin.append("g")
                          .attr("class", "x brush")
                          .call(self.brush)
                          .selectAll("rect")
                          .attr("y", -2)
                          .attr("height", self.chartHeight+2);
        },

        onClickBarTitle:function() {
            if(this.model.get("mode") == "zoomout") {
                if(Variables.get("filterSignals"))
                    this.model.set("mode","zoomin")
            }
            else {
                this.model.set("mode","zoomout")

            }
        }

    }, SVGBase));
});
