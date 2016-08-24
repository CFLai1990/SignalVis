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
            var t_width = self.$el.width(), t_height = self.$el.height();
            self.margin = {top: t_height * 0.2, right: t_width * 0.02, bottom: t_height * 0.04, left: t_width * 0.25};
            
			var aggCount = Datacenter.get("aggCount");
            var maxCount = d3.max(d3.max(aggCount));
            var legendElementWidth = t_width * 0.5;
            if(legendElementWidth * 8 > t_height * 0.8){
                legendElementWidth = t_height * 0.8 / 8;
            }
            self.margin.left = (t_width - legendElementWidth) / 2;
            self.margin.top = (t_height - 8 * legendElementWidth) / 2;
            
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
	            .attr("x", legendElementWidth + 8)
	            .attr("y", function(d, i) { return legendElementWidth * (8-i-0.5); });
	            
        },
        
    }, SVGBase));
});
