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

        initialize: function(options)
        {
            var self = this;
            options = options || {};
            self.listenTo(Variables,"change:detailSignals", function(model, detailSignals){
                console.log(detailSignals);
                if(detailSignals) {
                    var zoominFirsttimeFilterRange = Variables.get("zoominFirsttimeFilterRange");
                    var zoominMidfreFilterRange = Variables.get("zoominMidfreFilterRange");
                    self.model.set("signals",detailSignals);
                    self.model.set("minTime",zoominFirsttimeFilterRange[0]);
                    self.model.set("maxTime",zoominFirsttimeFilterRange[1]);
                    self.model.set("minMidfre",zoominMidfreFilterRange[0]);
                    self.model.set("maxMidfre",zoominMidfreFilterRange[1]);
                }
                self.renderSignals();
            });
        },

        onShow: function()
        {
            var self = this;
        },

        renderSignals: function(){
            var self = this;
            var signals = self.model.get('signals');
            if(signals) {
                self.margin = {top: 15, right: 20, bottom: 15, left: 30},

                self.chartWidth = self.$el.width() - self.margin.left - self.margin.right;
                self.chartHeight = self.$el.height() - self.margin.top - self.margin.bottom;
                // console.log(self.$el.width());
    //Title
                // var title = "midFre: " + self.model.get("minMidfre") + " ~ " +  self.model.get("maxMidfre");
                // // console.log(title);
                // self.d3el.append("text")
                //             .attr("x", self.$el.width() / 2 )
                //             .attr("y", self.margin.top)
                //             .style("text-anchor", "middle")
                //             .text(title);
    //Scale
    //             self.binWidth = Math.floor(self.chartWidth / self.model.get("numOfBins"));
                var timelength = self.model.get('maxTime') - self.model.get('minTime');
                self.xAxisScale = d3.time.scale()
                                            .domain([new Date(self.model.get('minTime')),new Date(self.model.get('maxTime'))])
                                            .range([0, self.chartWidth]);

                self.xScale = d3.scale.linear()
                                            .domain([self.model.get('minTime'),self.model.get('maxTime')])
                                            .range([0, self.chartWidth]);


                self.yAxisScale = d3.scale.linear()
                                        .domain([self.model.get('minMidfre'),self.model.get('maxMidfre')])
                                        .range([self.chartHeight ,0]);

                self.yScale = d3.scale.linear()
                    .domain([self.model.get('minMidfre'),self.model.get('maxMidfre')])
                    .range([0,self.chartHeight]);

    //glyph scale
                var t_ranges = self.model.get("ranges");
                self.bandwidthScale = d3.scale.linear()
                                                        .domain(t_ranges["bandwidth"])
                                                        .range([2,40]);
                self.scopeScale = d3.scale.linear()
                                                        .domain(t_ranges["scope"])
                                                        .range([2,40]);

                self.carriernoiseScale = d3.scale.linear()
                                                            .domain(t_ranges["carriernoise"])
                                                            .range([0,0.75]);

    //main region
                self.d3el.selectAll(".mainRegin").remove();
                self.mainRegin = self.d3el.append("g")
                                                    .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
                                                    .attr("class","mainRegin");

    // //Axis
                self.xAxis = d3.svg.axis().scale(self.xAxisScale).orient("bottom").ticks(5);

                self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left").ticks(5);

                self.d3el.selectAll(".y.axis").remove();
                self.d3el.selectAll(".x.axis").remove();

                self.mainRegin.append("g")
                  .attr("class", "y axis")
                  .call(self.yAxis);

                self.mainRegin.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + self.chartHeight + ")")
                  .call(self.xAxis);

    // signals
                self.d3el.selectAll('.signals').remove();
                // console.log(signals)
                if(signals) {

                    var nodeGroup = self.mainRegin.append("g").attr("class","signals");

                    var nodeEnter = nodeGroup.selectAll(".signal").data(signals).enter()
                                    .append("g").attr("class","signal");

                     // nodeEnter.append("circle")
                     //                    .attr("cx", function(d) {
                     //                        return self.xScale(d.firsttime);
                     //                    })
                     //                    .attr("cy", function(d){return self.yAxisScale(d.midfre);})
                     //                    .attr("r", function(){
                     //                        return "2px";
                     //                    });

//carriernoise
                        nodeEnter.append('rect')
                            .attr("x",function(d){
                                var percentage = self.carriernoiseScale(d.carriernoise);
                                var centralX = self.xScale(d.firsttime);
                                var halfWidth =  self.scopeScale(d.scope);
                                return centralX  -  halfWidth * percentage;
                            })
                            .attr("y", function(d) {
                                var percentage = self.carriernoiseScale(d.carriernoise);
                                var centralY = self.yAxisScale(d.midfre);
                                var halfHeight =  self.bandwidthScale(d.bandwidth);
                                // return centralY  -  halfHeight * percentage;
                                return centralY - 1.5;
                            })
                            .attr("width", function(d) {
                                var percentage = self.carriernoiseScale(d.carriernoise);
                                var halfWidth =  self.scopeScale(d.scope);
                                return 2 * halfWidth * percentage;
                            })
                            .attr("height", function(d) {
                                var percentage = self.carriernoiseScale(d.carriernoise);
                                var halfHeight =  self.bandwidthScale(d.bandwidth);
                                // return 2 * halfHeight * percentage;
                                return 3;
                            })
                            .attr("class","carriernoiseBar");

    //scope
                     nodeEnter.append("line")
                                    .attr("x1", function(d) {
                                        return self.xScale(d.firsttime) - self.scopeScale(d.scope);
                                    })
                                    .attr("y1", function(d){return self.yAxisScale(d.midfre);})
                                    .attr("x2", function(d) {
                                        return self.xScale(d.firsttime) + self.scopeScale(d.scope);

                                    })
                                    .attr("y2", function(d){return self.yAxisScale(d.midfre);})
                                    .attr("class","scopeLine")
    //bandwidth
                        nodeEnter.append("line")
                                    .attr("x1", function(d) {
                                        return self.xScale(d.firsttime);
                                    })
                                    .attr("y1", function(d){return self.yAxisScale(d.midfre) -  self.bandwidthScale(d.bandwidth);})
                                    .attr("x2", function(d) {
                                        return self.xScale(d.firsttime);

                                    })
                                    .attr("y2", function(d){return self.yAxisScale(d.midfre) + self.bandwidthScale(d.bandwidth);})
                                    .attr("class","bandwidthLine")
    // bezierLine
                        var bezierLine = d3.svg.line()
                            .x(function(d) { return d[0]; })
                            .y(function(d) { return d[1]; })
                            .interpolate("basis");
                        var bezierLoop = d3.svg.line()
                            .x(function(d) { return d[0]; })
                            .y(function(d) { return d[1]; })
                            .interpolate("basis-closed");

                       var path1 =  nodeEnter.append('path')
                            .attr("d", function(d) {
                                var tmp = [
                                [self.xScale(d.firsttime), self.yAxisScale(d.midfre) -  self.bandwidthScale(d.bandwidth)],
                                [self.xScale(d.firsttime) - self.scopeScale(d.scope)/4,self.yAxisScale(d.midfre) -  self.bandwidthScale(d.bandwidth)/8],
                                [self.xScale(d.firsttime) - self.scopeScale(d.scope),self.yAxisScale(d.midfre)]
                                ];
                                // console.log(tmp);
                                return bezierLine(tmp);
                            })
                            .attr("stroke", "black")
                            .attr("stroke-width", 1)
                            .attr("fill","none");

                        console.log();
                        var path2 =  nodeEnter.append('path')
                            .attr("d", function(d) {
                                var tmp = [
                                [self.xScale(d.firsttime), self.yAxisScale(d.midfre) +  self.bandwidthScale(d.bandwidth)],
                                [self.xScale(d.firsttime) + self.scopeScale(d.scope)/4,self.yAxisScale(d.midfre) +  self.bandwidthScale(d.bandwidth)/8],
                                [self.xScale(d.firsttime) + self.scopeScale(d.scope),self.yAxisScale(d.midfre)]
                                ];
                                // console.log(tmp);
                                return bezierLine(tmp);
                            })
                            .attr("stroke", "black")
                            .attr("stroke-width", 1)
                            .attr("fill","none");
    //carriernoise
                //     var closePath = d3.svg.line()
                //         .x(function(d) { return d[0]; })
                //         .y(function(d) { return d[1]; })
                //         .interpolate("linear");

                    // nodeEnter.append('path')
                    //         .attr("d", function(d) {
                    //             var percentage = self.carriernoiseScale(d.carriernoise);
                    //             //
                    //             // console.log(percentage);
                    //             var tmp = [
                    //             [self.xScale(d.firsttime), self.yAxisScale(d.midfre) -  self.bandwidthScale(d.bandwidth)],
                    //             [self.xScale(d.firsttime) - self.scopeScale(d.scope)/4,self.yAxisScale(d.midfre) -  self.bandwidthScale(d.bandwidth)/8],
                    //             [self.xScale(d.firsttime) - self.scopeScale(d.scope),self.yAxisScale(d.midfre)],
                    //             [self.xScale(d.firsttime) - self.scopeScale(d.scope)/2,self.yAxisScale(d.midfre)],
                    //             [self.xScale(d.firsttime), self.yAxisScale(d.midfre)],
                    //             [self.xScale(d.firsttime), self.yAxisScale(d.midfre) -  self.bandwidthScale(d.bandwidth)/2],
                    //             [self.xScale(d.firsttime), self.yAxisScale(d.midfre) -  self.bandwidthScale(d.bandwidth)]
                    //             ];
                    //             // console.log(tmp);
                    //             return bezierLoop(tmp);
                    //         })
                    //         .attr('class','carriernoiseFilled');

                    // nodeEnter.append('path')
                    //         .attr("d", function(d) {
                    //             var percentage = self.carriernoiseScale(d.carriernoise);
                    //             //
                    //             // console.log(percentage);
                    //             var tmp = [
                    //                 [self.xScale(d.firsttime), self.yAxisScale(d.midfre) +  self.bandwidthScale(d.bandwidth)],
                    //                 [self.xScale(d.firsttime) + self.scopeScale(d.scope)/4,self.yAxisScale(d.midfre) +  self.bandwidthScale(d.bandwidth)/8],
                    //                 [self.xScale(d.firsttime) + self.scopeScale(d.scope),self.yAxisScale(d.midfre)],
                    //                 [self.xScale(d.firsttime) + self.scopeScale(d.scope)/2,self.yAxisScale(d.midfre)],
                    //                 [self.xScale(d.firsttime), self.yAxisScale(d.midfre)],
                    //                 [self.xScale(d.firsttime), self.yAxisScale(d.midfre) +  self.bandwidthScale(d.bandwidth)/2],
                    //                 [self.xScale(d.firsttime), self.yAxisScale(d.midfre) +  self.bandwidthScale(d.bandwidth)]

                    //             ];
                    //             // console.log(tmp);
                    //             return bezierLoop(tmp);
                    //         })
                    //         .attr('class','carriernoiseFilled');
                }
            }
        },

    }, SVGBase));
});
