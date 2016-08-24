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
            self.theTitle = Config.get("chineseAttrNames")[self.model.get("attrName")];
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
                        self.yAxisScale.domain([1,ymax]);

                        self.yScale.domain([1,ymax]);
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
                                                        switch(result){
                                                            case 0:
                                                                return 1;
                                                            break;
                                                            case 1:
                                                                return 10;
                                                            break;
                                                            default:
                                                                return "10" + formatPower(result);
                                                            break;
                                                        }
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
                        .tickFormat(function(d) {return Math.round(d / 1e3) + "K";});;
                }
                else if(self.model.get("scale") == 'power') {
                    var superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹",
                    formatPower = function(d) { return (d + "").split("").map(function(c) { return superscript[c]; }).join(""); };
                    self.yAxisScale.domain([1,t_yRange[1]]);

                    self.yScale.domain([1,t_yRange[1]]);

                    var tickValues = [];
                    for(var j=0;Math.pow(10,j)<=t_yRange[1];j++) {
                        tickValues.push(Math.pow(10,j));
                    }
                    self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left")
                                            .tickValues(tickValues)
                                             .tickFormat(function (d) {
                                                    var result = Math.log10(d);
                                                    switch(result){
                                                        case 0:
                                                            return 1;
                                                        break;
                                                        case 1:
                                                            return 10;
                                                        break;
                                                        default:
                                                            return "10" + formatPower(result);
                                                        break;
                                                    }
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
            var t_cate = self.model.get("category");
//Title
            self.d3el.append("text")
                        .attr("x", self.$el.width() / 2 )
                        .attr("y", self.margin.top*0.75)
                        .style("text-anchor", "middle")
                        .attr("class","barTitle")
                        .text(self.theTitle + " (全局)");
//Scale
            self.binWidth = Math.floor(self.chartWidth / self.model.get("numOfBins"));
            var tt_scale, td_scale;
            if(t_cate){
                var t_w = self.chartWidth, t_bw = t_w / t_range.x.length,
                tt_range = t_range.x.slice(0, t_range.x.length),
                t_wrange = [];
                for(var i = 0; i < tt_range.length; i++){
                    t_wrange.push(t_bw / 2 + i * t_bw);
                }
                var t_xScale = d3.scale.ordinal()
                .domain(t_range.x)
                .range(t_wrange);
                var  t_w = self.chartWidth, t_ws = [];
                tt_range.push("_null_");
                for(var i = 0; i < tt_range.length; i++){
                    t_ws.push(t_w / (tt_range.length - 1) * i);
                }
                td_scale = self.xAxisScale = d3.scale.ordinal()
                .domain(tt_range)
                .range(t_ws);
                tt_scale = d3.scale.linear()
                .domain([0, tt_range.length-1])
                .range([0, self.chartWidth]);
            }else{
                self.xAxisScale = d3.scale.linear()
                .domain(t_range.x)
                .range([0, self.chartWidth]);
            }
            self.xScale = d3.scale.linear()
            .domain([0,self.model.get("numOfBins") -1])
            .range([0, self.chartWidth - self.binWidth]);
            var t_scale = self.model.get("scale");
            switch(t_scale){
                case "linear":
                    self.yAxisScale = d3.scale.linear()
                                            .domain(t_range.y)
                                            .range([self.chartHeight ,0]);
                    self.yScale = d3.scale.linear()
                        .domain(t_range.y)
                        .range([0,self.chartHeight]);
                    self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left").ticks(3)
                        .tickFormat(function(d) {return Math.round(d / 1e3) + "K"; });;
                break;
                case "power":
                    var ymax = self.model.get("yRange")[1];
                    var superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹",
                    formatPower = function(d) { return (d + "").split("").map(function(c) { return superscript[c]; }).join(""); };
                    self.yAxisScale = d3.scale.log().base(10).clamp(true)
                                            .domain([1,ymax])
                                            .range([self.chartHeight ,0]);

                    self.yScale = d3.scale.log().base(10).clamp(true)
                        .domain([1,ymax])
                        .range([0,self.chartHeight]);


                    var tickValues = [];
                    for(var j=0;Math.pow(10,j)<=ymax;j++) {
                        tickValues.push(Math.pow(10,j));
                    }
                    self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left")
                                            .tickValues(tickValues)
                                             .tickFormat(function (d) {
                                                    var result = Math.log10(d);
                                                    switch(result){
                                                        case 0:
                                                            return 1;
                                                        break;
                                                        case 1:
                                                            return 10;
                                                        break;
                                                        default:
                                                            return "10" + formatPower(result);
                                                        break;
                                                    }
                                            });
                break;
                default:
                    console.log("error in barchart scale value")
                break;
            }

            self.mainRegin = self.d3el.append("g").attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

//Axis
            if(t_cate){
                self.xAxis = d3.svg.axis().scale(t_xScale).orient("bottom").ticks(t_range.x.length);
            }else{
                self.xAxis = d3.svg.axis().scale(self.xAxisScale).orient("bottom").ticks(10);
            }

            self.mainRegin.append("g")
              .attr("class", "y axis")
              .call(self.yAxis);

            var t_xg = self.mainRegin.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + self.chartHeight + ")");
              t_xg
              .call(self.xAxis);
            if(t_cate){
                t_xg.append("line")
                .attr("x0", 0)
                .attr("x1", self.chartWidth)
                .attr("y0", 0)
                .attr("y1", 0);
            }

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
                                            Variables.setFilterRange(filterRangeName, null);
                                        }
                                        else {
                                            var extent = self.brush.extent();
                                            var brushRange = []
                                            if(t_cate){
                                                var t_r = td_scale.range(), t_d = td_scale.domain();
                                                var t_inds = _.map(extent.map(tt_scale.invert),Math.round), tt_r = [t_d[t_inds[0]], t_d[t_inds[1]]];
                                                var t_exent = tt_r.map(td_scale);
                                                self.brush.extent(t_exent);
                                                self.brushg.call(self.brush);
                                                if(tt_r[0] == tt_r[1]){
                                                    brushRange = null;
                                                }else{
                                                    tt_r = [];
                                                    for(var i = t_inds[0]; i < t_inds[1]; i++){
                                                        tt_r.push(t_d[i]);
                                                    }
                                                    var t_null = false;
                                                    brushRange = [];
                                                    for(var i in tt_r){
                                                        switch(tt_r[i]){
                                                            case "":
                                                                continue;
                                                            break;
                                                            case "NaN":
                                                                brushRange.push("");
                                                                t_null = true;
                                                            break;
                                                            default:
                                                                brushRange.push(tt_r[i]);
                                                            break;
                                                        }
                                                    }
                                                    var tt_br = brushRange.map(isNaN);
                                                    if(!d3.set(tt_br).has(true) && !t_null){
                                                        brushRange = tt_br;
                                                    }
                                                    if(brushRange.length == 0){
                                                        brushRange = null;
                                                    }
                                                }
                                            }else{
                                                brushRange.push(extent[0]);
                                                brushRange.push(extent[1]);
                                            }
                                            console.log(filterRangeName, brushRange);
                                            Variables.setFilterRange(filterRangeName, brushRange);
                                        }
                                    });


            self.brushg = self.mainRegin.append("g")
                          .attr("class", "x brush");
            self.brushg.call(self.brush)
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
