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
    String.prototype.visualLength = function(d)
    {
        var ruler = $("#ruler");
        ruler.css("font-size",d+'px').text(this);
        return [ruler[0].offsetWidth, ruler[0].offsetHeight];
    };
    return Mn.ItemView.extend(_.extend({
        tagName: 'svg',
        template: false,

        attributes:{
            'style' : 'width: 50%; height:50%;'
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
                        .attr("y", function(d){
                            return self.chartHeight - self.yScale((d==0)?0.1:d);})
                        .attr("height", function(d) {
                            if(self.yScale((d==0)?0.1:d)<0){
                                console.log(d, self.yScale.domain());
                            }
                            return self.yScale((d==0)?0.1:d); });
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
                        // if(ymax > 10000){
                        //     self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left").ticks(3)
                        //         .tickFormat(function(d) { return Math.round(d / 1e3) + "K"; });
                        // }
                        // else {
                        //     self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left").ticks(3)
                        //         .tickFormat(function(d) { return Math.round(d)});
                        // }
                        self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left").ticks(3)
                            .tickFormat(function(d) {return Math.round(d / 1e3) + "K";});
                    }
                    else if(self.model.get("scale") == 'power') {
                        var superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹",
                        formatPower = function(d) { return (d + "").split("").map(function(c) { return superscript[c]; }).join(""); };
                        self.yAxisScale.domain([0.1,ymax]);

                        self.yScale.domain([0.1,ymax]);

                        var tickValues = [];
                        for(var j=-1;Math.pow(10,j)<=t_yRange[1];j++) {
                            tickValues.push(Math.pow(10,j));
                        }
                        self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left")
                                                .tickValues(tickValues)
                                                 .tickFormat(function (d) {
                                                        var result = Math.log10(d);
                                                        switch(result){
                                                            case -1:
                                                                return 0;
                                                            break;
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
                     .attr("y", function(d){return self.chartHeight - self.yScale((d==0)?0.1:d);})
                     .attr("height", function(d) { return self.yScale((d==0)?0.1:d); });

            }
            else if(this.model.get("mode") == "zoomout"){
                self.d3el.select(".barTitle")
                     .text(self.theTitle);
                if(self.model.get("scale") == 'linear') {
                    self.yAxisScale.domain([0, t_yRange[1]]);

                    self.yScale.domain([0,t_yRange[1]]);

                    self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left").ticks(3)
                        .tickFormat(function(d) {return Math.round(d / 1e3) + "K";});
                }
                else if(self.model.get("scale") == 'power') {
                    var superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹",
                    formatPower = function(d) { return (d + "").split("").map(function(c) { return superscript[c]; }).join(""); };
                    self.yAxisScale.domain([0.1,t_yRange[1]]);

                    self.yScale.domain([0.1,t_yRange[1]]);

                    var tickValues = [];
                    for(var j=-1;Math.pow(10,j)<=t_yRange[1];j++) {
                        tickValues.push(Math.pow(10,j));
                    }
                    self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left")
                                            .tickValues(tickValues)
                                             .tickFormat(function (d) {
                                                    var result = Math.log10(d);
                                                    switch(result){
                                                        case -1:
                                                            return 0;
                                                        break;
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
                     .attr("y", function(d){return self.chartHeight - self.yScale((d==0)?0.1:d);})
                     .attr("height", function(d) { return self.yScale((d==0)?0.1:d); });
            }

        },

        onShow: function()
        {
            var self = this;
            self.margin = {top: 20, right: 20, bottom: 40, left: 30},

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
                        .text(self.theTitle);
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
                                            .domain([0, t_range.y[1]])
                                            .range([self.chartHeight ,0]);
                    self.yScale = d3.scale.linear()
                        .domain([0, t_range.y[1]])
                        .range([0,self.chartHeight]);
                    self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left").ticks(3)
                        .tickFormat(function(d) {return Math.round(d / 1e3) + "K"; });;
                break;
                case "power":
                    var ymax = self.model.get("yRange")[1];
                    var superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹",
                    formatPower = function(d) { return (d + "").split("").map(function(c) { return superscript[c]; }).join(""); };
                    self.yAxisScale = d3.scale.log().base(10).clamp(true)
                                            .domain([0.1,ymax])
                                            .range([self.chartHeight ,0]);

                    self.yScale = d3.scale.log().base(10).clamp(true)
                        .domain([0.1,ymax])
                        .range([0,self.chartHeight]);


                    var tickValues = [];
                    for(var j=-1;Math.pow(10,j)<=ymax;j++) {
                        tickValues.push(Math.pow(10,j));
                    }
                    self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left")
                                            .tickValues(tickValues)
                                             .tickFormat(function (d) {
                                                    var result = Math.log10(d);
                                                    switch(result){
                                                        case -1:
                                                            return 0;
                                                        break;
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

              var t_angle = 26, ang = function(vd){return vd/180*Math.PI};
              var t_allBins = self.model.get("totalBins");
            var t_xg = self.mainRegin.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + self.chartHeight + ")");
              t_xg
              .call(self.xAxis)
              .selectAll("text")
              .attr("transform", function(d,i){
                    var t_text = $(this).text(), t_size, t_savText = t_text.slice(0);
                    if(t_text.length > 7){
                        t_text = t_text.slice(0,5)+"...";
                    }
                    $(this).text(t_text);
                    if(t_cate){
                            t_savText = t_savText + ": " + t_allBins[i];
                    }
                    $(this)
                    .attr("title", t_savText)
                    .attr("data-placement","top")
                    .tooltip({
                        container: '.barchartSVG',
                    });
                    t_size = t_text.visualLength(12);
                    return "rotate("+t_angle+")translate("+
                    [t_size[0]/2*Math.cos(ang(t_angle)),t_size[0]/2*Math.sin(ang(t_angle))]+")";
                })
              .on("mouseover",function(d,i){
                if(t_cate){
                    self.$el.find(".totalBin:eq("+i+")").addClass("active");
                }
              })
              .on("mouseout", function(d,i){
                if(t_cate){
                    self.$el.find(".totalBin:eq("+i+")").removeClass("active");
                }
              });
            if(t_cate){
                t_xg.append("line")
                .attr("x0", 0)
                .attr("x1", self.chartWidth)
                .attr("y0", 0)
                .attr("y1", 0);
            }

//Bins
            self.binGroup = self.mainRegin.append("g").attr("class","bins");
            var binsEnter = self.binGroup.selectAll(".totalBin").data(t_allBins).enter()
                                            .append("g").attr("class","totalBin");
            var t_bins = self.model.get("totalBins").length, t_xrange = (t_range.x[1] - t_range[0]) / t_bins;

             binsEnter.append("rect")
                            .attr("width", self.binWidth)
                            .attr("x", function(d,i) {
                                $(this)
                                .attr("title", d)
                                .attr("data-placement","top")
                                .tooltip({
                                    container: '.barchartSVG',
                                });
                                return self.xScale(i);
                            })
                            .attr("y", function(d){return self.chartHeight - self.yScale((d==0)?0.1:d);})
                            .attr("height", function(d) { return self.yScale((d==0)?0.1:d); });
//Brush
            self.brush = d3.svg.brush()
                                    .x(self.xAxisScale)
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
                                                    var t_start = tt_r[0], t_end = tt_r[1], t_sign = false;
                                                    tt_r = [];
                                                    for(var i in t_d){
                                                        var tt_dict = t_d[i];
                                                        if(tt_dict == t_start){
                                                            t_sign = true;
                                                        }
                                                        if(tt_dict == t_end){
                                                            t_sign = false;
                                                        }
                                                        if(t_sign){
                                                            tt_r.push(tt_dict);
                                                        }
                                                    }
                                                    brushRange = [];
                                                    for(var i in tt_r){
                                                        switch(tt_r[i]){
                                                            case "":
                                                                continue;
                                                            break;
                                                            case "NaN":
                                                                brushRange.push("");
                                                            break;
                                                            default:
                                                                if(isNaN(tt_r[i])){
                                                                    brushRange.push(tt_r[i]);
                                                                }else{
                                                                    brushRange.push(parseInt(tt_r[i]));
                                                                }
                                                            break;
                                                        }
                                                    }
                                                    if(brushRange.length == 0){
                                                        brushRange = null;
                                                    }
                                                }
                                            }else{
                                                brushRange.push(extent[0]);
                                                brushRange.push(extent[1]);
                                            }
                                            console.log("Filter: ", filterRangeName, brushRange);
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
            // if(this.model.get("mode") == "zoomout") {
            //     if(Variables.get("filterSignals"))
            //         this.model.set("mode","zoomin")
            // }
            // else {
            //     this.model.set("mode","zoomout")
            // }
        }

    }, SVGBase));
});
