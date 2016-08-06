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
            // "click .barTitle": "onClickBarTitle"
        },

        initialize: function(options)
        {
            var self = this;
            options = options || {};
            self.listenTo(Variables,"change:mode", function(model, mode){
                    self.d3el.classed("hide", mode == "zoomin");
            });

        },


        onShow: function()
        {
            console.log("12333434");
            var self = this;
            self.margin = {top: 10, right: 20, bottom: 15, left: 30},

            self.chartWidth = self.$el.width() - self.margin.left - self.margin.right;
            self.chartHeight = self.$el.height() - self.margin.top - self.margin.bottom;

            self.mainRegin = self.d3el.append("g")
                          .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
                          .attr("class","mainReginSvg");

            var legend_height1 = 40,
                legend_height2 = 60,
                legend_height3 = 80,
                legend_height4 = 100,
                legend_height5 = 120,
                legend_height6 = 140,
                legend_height7 = 160,
                legend_height8 = 180,
                legend_height9 = 200;

            var legend = self.mainRegin.append("g");

                legend.append("rect")
                    .attr("class", "legend")
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("x", -15)
                    .attr("y", self.chartHeight - legend_height1)
                    .attr("stroke","none")
                    .attr("fill","#1a9850");

                 legend.append("rect")
                    .attr("class", "legend")
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("x", -15)
                    .attr("y", self.chartHeight - legend_height2)
                    .attr("stroke","none")
                    .attr("fill","#66bd63");

                legend.append("rect")
                    .attr("class", "legend")
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("x", -15)
                    .attr("y", self.chartHeight - legend_height3)
                    .attr("stroke","none")
                    .attr("fill","#a6d96a");

                 legend.append("rect")
                    .attr("class", "legend")
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("x", -15)
                    .attr("y", self.chartHeight - legend_height4)
                    .attr("stroke","none")
                    .attr("fill","#d9ef8b");

                 legend.append("rect")
                    .attr("class", "legend")
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("x", -15)
                    .attr("y", self.chartHeight - legend_height5)
                    .attr("stroke","none")
                    .attr("fill","#fee08b");

                 legend.append("rect")
                    .attr("class", "legend")
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("x", -15)
                    .attr("y", self.chartHeight - legend_height6)
                    .attr("stroke","none")
                    .attr("fill","#fdae61");

                legend.append("rect")
                    .attr("class", "legend")
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("x", -15)
                    .attr("y", self.chartHeight - legend_height7)
                    .attr("stroke","none")
                    .attr("fill","#f46d43");

                 legend.append("rect")
                    .attr("class", "legend")
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("x", -15)
                    .attr("y", self.chartHeight - legend_height8)
                    .attr("stroke","none")
                    .attr("fill","#d73027");

legend.append("text")
        .attr("class", "legendText")
        .attr("width", 50)
        .attr("height", 40)
        .attr("x", 10)
        .attr("y", self.chartHeight - 15)
        .attr("fill","black")
        .text("1");

legend.append("text")
        .attr("class", "legendText")
        .attr("width", 50)
        .attr("height", 40)
        .attr("x", 10)
        .attr("y", self.chartHeight - 35)
        .attr("fill","black")
        .text("16");

legend.append("text")
        .attr("class", "legendText")
        .attr("width", 50)
        .attr("height", 40)
        .attr("x", 10)
        .attr("y", self.chartHeight - 55)
        .attr("fill","black")
        .text("31");

legend.append("text")
        .attr("class", "legendText")
        .attr("width", 50)
        .attr("height", 40)
        .attr("x", 10)
        .attr("y", self.chartHeight - 75)
        .attr("fill","black")
        .text("46");

legend.append("text")
        .attr("class", "legendText")
        .attr("width", 50)
        .attr("height", 40)
        .attr("x", 10)
        .attr("y", self.chartHeight - 95)
        .attr("fill","black")
        .text("60");

legend.append("text")
        .attr("class", "legendText")
        .attr("width", 50)
        .attr("height", 40)
        .attr("x", 10)
        .attr("y", self.chartHeight - 115)
        .attr("fill","black")
        .text("75");

legend.append("text")
        .attr("class", "legendText")
        .attr("width", 50)
        .attr("height", 40)
        .attr("x", 10)
        .attr("y", self.chartHeight - 135)
        .attr("fill","black")
        .text("90");

legend.append("text")
        .attr("class", "legendText")
        .attr("width", 50)
        .attr("height", 40)
        .attr("x", 10)
        .attr("y", self.chartHeight - 155)
        .attr("fill","black")
        .text("105");

legend.append("text")
        .attr("class", "legendText")
        .attr("width", 50)
        .attr("height", 40)
        .attr("x", 10)
        .attr("y", self.chartHeight - 175)
        .attr("fill","black")
        .text("119");

legend.append("text")
        .attr("class", "legendText")
        .attr("width", 50)
        .attr("height", 40)
        .attr("x", -20)
        .attr("y", self.chartHeight - 200)
        .attr("fill","black")
        .text("信号数量");

        },


    }, SVGBase));
});
