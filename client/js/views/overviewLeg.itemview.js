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
            var self = this;
            self.margin = {top: 0, right: 20, bottom: 15, left: 15},

            self.chartWidth = self.$el.width() - self.margin.left - self.margin.right;
            self.chartHeight = self.$el.height() - self.margin.top - self.margin.bottom;
            
			var aggCount = Datacenter.get("aggCount");
            var maxCount = d3.max(d3.max(aggCount));
            var legendElementWidth = 20;
            
			self.colorScale = d3.scale.quantile()
               .domain([maxCount,1])
               .range(colorbrewer.RdYlGn[8]);
                            
            self.mainRegin = self.d3el.append("g")
               .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
               .attr("class","mainReginSvg");
				
            var legend = self.mainRegin.selectAll(".legend")
                .data([1].concat(self.colorScale.quantiles()), function(d) { return d; });

            legend.enter().append("g")
                .attr("class", "legend");

            legend.append("rect")
	            .attr("x", 0)
	            .attr("y", function(d, i) { return legendElementWidth * i; })
	            .attr("width", legendElementWidth)
	            .attr("height", legendElementWidth)
	            .style("fill", function(d, i) { return colorbrewer.RdYlGn[8][i]; });
	            
	        legend.append("text")
	            .attr("class", "lengendText")
	            .text(function(d) { return Math.round(d); })
	            .style('alignment-baseline','central')
	            .attr("x", legendElementWidth+2)
	            .attr("y", function(d, i) { return legendElementWidth * (8-i); });
	            
        },
        
    }, SVGBase));
});
