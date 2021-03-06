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

        max: function(v_arr){
            var t_max = 0;
            for(var i in v_arr){
                for(var j in v_arr[i]){
                    if(v_arr[i][j] > t_max){
                        t_max = v_arr[i][j];
                    }
                }
            }
            return t_max;
        },

        onShow: function()
        {
            var self = this;
            var t_width = self.$el.width(), t_height = self.$el.height();
            self.margin = {top: t_height * 0.2, right: t_width * 0.02, bottom: t_height * 0.04, left: t_width * 0.25};

			var aggCount = Datacenter.get("aggCount");
            var maxCount = self.max(aggCount);
            var legendElementWidth = t_width * 0.5;
            if(legendElementWidth * 9 > t_height * 0.8){
                legendElementWidth = t_height * 0.8 / 9;
            }
            self.margin.left = (t_width - legendElementWidth) / 2;
            self.margin.top = (t_height - 9 * legendElementWidth) / 2;

			self.colorScale = d3.scale.quantile()
               .domain([maxCount,0])
               .range(colorbrewer.YlGnBu[9]);

            self.mainRegin = self.d3el.append("g")
               .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
               .attr("class","mainReginSvg");

            var legend = self.mainRegin.selectAll(".legend")
                .data([0].concat(self.colorScale.quantiles()), function(d) { return d; });

            legend.enter().append("g")
                .attr("class", "legend");

            legend.append("rect")
	            .attr("x", 0)
	            .attr("y", function(d, i) { return legendElementWidth * i; })
	            .attr("width", legendElementWidth)
	            .attr("height", legendElementWidth)
	            .style("fill", function(d, i) { return colorbrewer.YlGnBu[9][i]; });

	        legend.append("text")
	            .attr("class", "lengendText")
	            .text(function(d) { return Math.ceil(d); })
	            .style('alignment-baseline','central')
	            .style("fill","#fff")
	            .attr("x", legendElementWidth + 9)
	            .attr("y", function(d, i) { return legendElementWidth * (9-i-0.5); });

        },

    }, SVGBase));
});
