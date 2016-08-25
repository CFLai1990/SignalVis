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
], function(require, Mn, _, $, Backbone,Datacenter,Config, Variables, SVGBase) {
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
             self.listenTo(self, "test:everything_done", self.specDiagram);
             self.listenTo(Variables,"change:filterSignals", function(model, filterSignals){
                  console.log(Variables.get("mode"));
                  if(Variables.get("mode") == "zoomin") {
                        self.transition_data(filterSignals);
                  }
          	 });
        },
        
        specDiagram: function(){
            var self = this;
            var specResult = Variables.get("specResult");
            var filterData = Variables.get("filterData");
            d3.selectAll('.line').remove();
            //console.log(filterData);
            var scope_scale = d3.scale.linear()
		      .range([-150,15])
		      .domain([0,3500]);
            
            specResult.forEach(function(d){
           	   d.scope = scope_scale(d.scope);
            });
            
            var line = d3.svg.line()
              .x(function(d) { return self.x_line(d.frequency); })
              .y(function(d) { return self.y_line(d.scope); });
            
            self.svg_line.append("path")
		      .datum(specResult)
		      .attr("class", "line")
		      .attr("clip-path", "url(#clip)")
		      .attr("d", line)
		      .style('fill','none')
		      .style('stroke','#00AEEF')
		      .style('stroke-width',.5)
		      .style("cursor","pointer")
		      .on("mouseover",function(d){
		      	var x0 = self.x_line.invert(d3.mouse(this)[0]),
		      		y0 = self.y_line.invert(d3.mouse(this)[1]);
		      	line_showTooltip(x0,y0);
		      })
		      .on("mouseout",function(){
		      	line_hideTooltip();
		      });
		      
//		    self.svg_line.selectAll("circle")
//		      .data(filterData)
//		      .enter()
//		      .append("circle")
//		      .attr("class", "signalPoint") 
//		      .attr("cx", function(d){return self.x_line(d.midfre);})
//		      .attr("cy", function(d){return self.y_line(d.scopedbm);})
//		      .attr("r",2.5)
//		      .style('fill','red')
//		      .style('stroke','red')
//		      .style('stroke-width',.5)
//		      .style("cursor","pointer");
//		      .on("mouseover",function(d){
//		      	var x0 = self.x_line.invert(d3.mouse(this)[0]),
//		      		y0 = self.y_line.invert(d3.mouse(this)[1]);
//		      	line_showTooltip(x0,y0);
//		      })
//		      .on("mouseout",function(){
//		      	line_hideTooltip();
//		      });
		      
        		function line_showTooltip(x,y){
               var tooltip_scatter = self.svg_line.append("g")
                  .attr("class", "tooltip_scatter");
			   
               tooltip_scatter.append("text")
                  .attr("font-size", '13px')
                  .attr("x", self.Width_line/3)
                  .attr("y", 10)
                  .attr("fill","black")
                  .text("中心频率："+ x.toFixed(3) + "MHz 功率：" + y.toFixed(3) + "dBm");

               tooltip_scatter.append('line')
                  .attr('x1',self.x_line(x))
                  .attr('x2',self.x_line(x))
                  .attr('y1',self.y_line(y))
                  .attr('y2',self.Height_line)
                  .style('fill','none')
                  .style('stroke','grey')
                  .style("stroke-dasharray", ("3, 3"));

               tooltip_scatter.append('line')
                  .attr('x1',self.x_line(x))
                  .attr('x2',0)
                  .attr('y1',self.y_line(y))
                  .attr('y2',self.y_line(y))
                  .style('fill','none')
                  .style('stroke','grey')
                  .style("stroke-dasharray", ("3, 3"));
            }

         	function line_hideTooltip(){
              d3.selectAll(".tooltip_scatter").remove();
            }
        },

        transition_data:function(filterSignals)
        {
          var self = this;
              if(filterSignals){
				  Variables.set("zoominFirsttimeFilterRange",null);
                  Variables.set("zoominMidfreFilterRange",null);

                  self.xAxisScale.domain([self.x0,self.x1]);
                  self.yAxisScale.domain([self.y1,self.y0]);
                  self.d3el.selectAll('.row').style("display", "none");
                  self.d3el.selectAll('.grid').style("display", "none");
                  self.d3el.selectAll(".scatter").remove();
                  self.d3el.selectAll(".point").remove();
                  self.d3el.selectAll(".brush_scatter").remove();
                  //self.d3el.select('.svg_line').remove();

             var minBandwidth = 50;
             var maxBandwidth = 4121;

             self.scattersizeScale = d3.scale.linear()
                            .domain([minBandwidth,maxBandwidth])
                            .range([1,5]);

             self.scatter = self.mainRegin.append("g").attr("class","scatter");

             self.scatter.selectAll(".point")
                    .data(filterSignals)
                  .enter().append("circle")
                    .attr("class", "point")
                    .attr("r", function(d) { return self.scattersizeScale(d.bandwidth);})
                    .attr("fill",'#00AEEF')
                    .attr("cx", function(d) { return self.xAxisScale(new Date(d.firsttime)); })
                    .attr("cy", function(d) { return self.yAxisScale(d.midfre); })
                    .style('cursor','pointer')
                    .on('mouseover',function(d){showTooltip(d,this);})
                    .on('mouseout',function(d){hideTooltip(d,this);});

             self.mainRegin.transition().duration(500)
                    .select(".x.axis")
                    .call(self.xAxis);

             self.mainRegin.transition().duration(500)
                    .select(".y.axis")
                    .call(self.yAxis);

             var brush_scatter = d3.svg.brush()
                 	.x(self.xAxisScale)
                	 	.y(self.yAxisScale)
                 	.on("brushend",brushend_scatter);

             self.mainRegin.append("g")
                     .attr("class", "brush_scatter")
                     .call(brush_scatter)
                     .selectAll('rect')
                     .attr("stroke","#fff")
                     .attr("fill-opacity",.125);

                function brushend_scatter() {
                      var extent_scatter = brush_scatter.extent();
                      var x0_sca = extent_scatter[0][0],
                          x1_sca = extent_scatter[1][0],
                          y0_sca = extent_scatter[0][1],
                          y1_sca = extent_scatter[1][1];

                      var brushxRange_sca = [];
                            brushxRange_sca.push(x0_sca.getTime());
                            brushxRange_sca.push(x1_sca.getTime());

                      var brushyRange_sca = [];
                            brushyRange_sca.push(y0_sca);
                            brushyRange_sca.push(y1_sca);

                      if(brush_scatter.empty()) {
                        Variables.set("zoominFirsttimeFilterRange",null);
                        Variables.set("zoominMidfreFilterRange",null);
                      }

                      else {
                        Variables.set("zoominFirsttimeFilterRange",brushxRange_sca);
                        Variables.set("zoominMidfreFilterRange",brushyRange_sca);
                      }
                }

            }
        },

        onShow: function()
        {
            var self = this;
            var t_width = self.$el.width(), t_height = self.$el.height();
            self.margin = {top: t_height * 0.05, right: t_width * 0.02, bottom: t_height * 0.04, left: t_width * 0.05};
            self.chartWidth = t_width - self.margin.left - self.margin.right;
            self.chartHeight = t_height * 0.57;
            self.have_zoomin = 0;
//useful variables
            var detailSignals = Datacenter.get('signals');
            var aggCount_old = Datacenter.get("aggCount");
            var aggCount = numeric.transpose(aggCount_old);
			//确定新数组有多少行
//			for(var i=0;i<aggCount_old[0].length;i++){
//			  aggCount[i] = [];
//			}
//			//实现数组转置
//			//遍历原数组
//			for(var i=0;i<aggCount_old.length;i++){
//			 for(var j=0;j<aggCount_old[i].length;j++){
//			  	aggCount[j][i] = aggCount_old[i][j];
//			 }
//			}
            var maxCount = d3.max(d3.max(aggCount));
            var minCount = d3.min(d3.min(aggCount));

            var minDate  = new Date(Datacenter.get("minTime"));
            var maxDate  = new Date(Datacenter.get("maxTime"));
            var minMidfre = Datacenter.get("minMidfre");
            var maxMidfre = Datacenter.get("maxMidfre");

            var h = self.chartHeight/aggCount.length,
                w = self.chartWidth/aggCount[0].length;
            var brush_height = self.chartHeight;
            
            var time_range = d3.extent(detailSignals, function(d) { return d.firsttime; });
            var start_time = time_range[0];
//useful variables END
//scales and brushes
            self.xScale = d3.scale.linear()
                                .range([0, self.chartWidth])
                                .domain([0,aggCount[0].length]);

            self.yScale = d3.scale.linear()
                            .range([0,self.chartHeight])
                            .domain([aggCount.length,0]);

            self.yAxisScale = d3.time.scale()
                            .domain([minDate,maxDate])
                            .range([self.chartHeight, 0]);

            self.xAxisScale = d3.scale.linear()
                                .range([0,self.chartWidth])
                                .domain([minMidfre,maxMidfre]);

            self.colorScale = d3.scale.quantize()
                            .domain([maxCount,1])
                            .range(colorbrewer.RdYlGn[8]);

            var brush1 = d3.svg.brush()
                         .x(self.xAxisScale)
                         .on("brush", brushmove)
                         .on('brushend',brushend);

            var brush2 = d3.svg.brush()
                         .y(self.yAxisScale)
                         .on("brush", brushmove)
                         .on('brushend',brushend);
//scales and brushes END

            self.mainRegin = self.d3el.append("g")
              .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
              .attr("class","mainReginSvg");

            self.xAxis = d3.svg.axis().scale(self.xAxisScale).orient("bottom");
            self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left").tickFormat(d3.time.format("%H:%M:%S"));;
//xAxis
            self.mainRegin.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + self.chartHeight + ")")
              .call(self.xAxis)
              .append("text")
              .attr("class", "xlabel")
              .attr("x", self.chartWidth)
              .attr("y", 30)
              .style("text-anchor", "end")
              .text("中心频率(MHz)");
//yAxis
            self.mainRegin.append("g")
              .attr("class", "y axis")
              .call(self.yAxis)
              .append("text")
              .attr("class", "ylabel")
             // .attr("transform", "rotate(-90)")
              .attr("y", -10)
              .attr("dy", ".7em")
              .style("text-anchor", "start")
              .text("发现时间");
//heatmap
          var row = self.mainRegin.selectAll(".row")
             .data(aggCount)
             .enter().append("g")
             .attr("class", "row");

          var col = row.selectAll(".grid")
             .data(function (d,i) { return d.map(function(a,j) { return {value: a, gridrow: i, gridcol: j}; } ) })
           .enter().append("rect")
             .attr("class", "grid")
             .attr("x", function(d, i) { return self.xScale(i); })
             .attr("y", function(d, i) { return self.yScale(d.gridrow); })
             .attr("width", w)
             .attr("height", h)
             .style("fill", function(d) {
                    if(d.value == 0)
                      return "white";
                    else
                      return self.colorScale(d.value);
             })
             .on("mouseover", function(d) {
                 d3.select(this).style("stroke","black");

                 var grid_x_st = self.xAxisScale.invert(w*d.gridcol);
                 var grid_x_ed = self.xAxisScale.invert(w+w*d.gridcol);
                 var grid_y_st = self.yAxisScale.invert(self.chartHeight-(h*d.gridrow));
                 var grid_y_ed = self.yAxisScale.invert(self.chartHeight-(h+h*d.gridrow));
                
                 var grid_time_st = grid_x_st.toFixed(3);
                 var grid_time_ed = grid_x_ed.toFixed(3);
                 var grid_Mid_st = grid_y_st.toTimeString().substr(0,8);
                 var grid_Mid_ed = grid_y_ed.toTimeString().substr(0,8);

                 var tooltip = self.mainRegin.append("g");

                 tooltip.append("text")
                      .attr("class", "tool")
                      .attr("width", 75)
                      .attr("height", 30)
                      .attr("x", 134)
                      .attr("y", -10)
                      .attr("fill","black")
                      .text("信号数: "+d.value+" 中心频率范围: ["+grid_time_st + "," + grid_time_ed + "] 时间范围: ["+grid_Mid_st + "," + grid_Mid_ed + "]");

             })
             .on("mouseout", function() {
                  d3.selectAll(".tool").remove();
                  d3.select(this).style("stroke","none");
             });
//heatmap END
//时间定位线
            self.symbol = d3.svg.symbol().type('triangle-up')
               	    .size(40);
                
		        self.timeFocus = self.mainRegin.append("g")
		            .attr("class", "timeFocus")
		            .style("display", "none");

		        self.timeFocus.append("line")
		            .attr("y1", 0)
		            .attr('y2', 0)
		            .attr('x1', 0)
		            .attr('x2', self.chartWidth)
		            .style('fill','none')
		            .style('stroke','#fb9235')
		            .style("stroke-dasharray", ("6, 6"))
                		.style("stroke-width", 2);

		        self.timeFocus.append("text")
		        		.attr("dy", "-.3em")
		      		.attr("transform", "translate(" + self.chartWidth + ",0)")
		            .attr('text-anchor','end')
		            .style('fill','#fb9235')
		            .style('font-size','12px');

		        self.mainRegin.append("rect")
	                .attr("class", "overlay")
	              //  .attr("transform", "translate(0," + self.chartHeight + ")")
	                .attr("width", 8)
	                .attr("height", self.chartHeight)
	                .style('fill','none')
	                .style('pointer-events','all')
	                .style('cursor','pointer')
	                .on("mouseover", function() { self.timeFocus.style("display", null); })
	          //      .on("mouseout", function() { self.timeFocus.style("display", "none"); })
	                .on("mousemove", mousemove)
	                .on('mousedown',drawlinechart);

		        var trangle = self.timeFocus.append('path')
		          	.attr("dx", "-.7em")
		       		.attr("transform", "rotate(90)")
		            .attr('d',self.symbol)
		            .attr('fill','#fb9235');
//时间定位线 END
//频谱图
                self.margin_line = {top: t_height * 0.68, right: t_width * 0.02, bottom: t_height * 0.05, left: t_width * 0.05};
                self.Width_line = self.$el.width() - self.margin_line.left - self.margin_line.right;
                self.Height_line = t_height * 0.27;

                self.x_line = d3.scale.linear()
                    .range([0, self.Width_line]);

                self.y_line = d3.scale.linear()
                    .range([self.Height_line, 0]);

                var xAxis_line = d3.svg.axis()
                    .scale(self.x_line)
                    .orient("bottom");

                var yAxis_line = d3.svg.axis()
                    .scale(self.y_line)
                    .orient("left");               

                self.svg_line = self.d3el.append("g")
                    .attr("transform", "translate(" + self.margin_line.left + "," + self.margin_line.top + ")")
                    .attr("class","svg_line");
                    
			//	console.log(d3.extent(detailSignals, function(d) { return d.midfre; }));
                self.x_line.domain(d3.extent(detailSignals, function(d) { return d.midfre; }));
                self.y_line.domain([-150,15]);
     
                 self.svg_line.append("g")
                      .attr("class", "x axis")
                      .attr("transform", "translate(0," + self.Height_line + ")")
                      .call(xAxis_line)
                    .append("text")
                      .attr("dx", self.Width_line)
                      .attr("dy", 27)
                      .style("text-anchor", "end")
                      .text("中心频率(MHz)");

                  self.svg_line.append("g")
                      .attr("class", "y axis")
                      .call(yAxis_line)
                    .append("text")
            //          .attr("transform", "rotate(-90)")
                      .attr("y", -10)
                      .attr("dy", ".7em")
                      .style("text-anchor", "start")
                      .text("功率(dBm)");
                      
                  self.svg_line.append("defs").append("clipPath")
				    	  .attr("id", "clip")
				    .append("rect")
				      .attr("width", self.Width_line)
				      .attr("height", self.Height_line);


            function drawlinechart(){
                var y_time = (self.yAxisScale.invert(d3.mouse(this)[1])).toTimeString().substr(0,8);
                var current_time = self.yAxisScale.invert(d3.mouse(this)[1]).getTime();
                //frame number
                var frame_num = parseInt((parseInt((current_time - start_time)/1000))/(231/3008));
                                
				d3.select('.line_title').remove();

                self.svg_line.append('g')
                  .attr("transform", "translate(" + self.Width_line/4 + ",10)")
                  .append("text")
                  .style("text-anchor", "middle")
                  .attr("class","line_title")
                  .text("时间：" + y_time);
                  
                var filterData = detailSignals.filter(function(d){
                  var timeStamp = new Date(d.firsttime).toTimeString().substr(0,8);
                  if(timeStamp == y_time)
                    return true;
                  else
                    return false;
                });
                  
                Datacenter.querySpectrum(frame_num, function(v_d){
	                Variables.set("specResult", v_d);
	                Variables.set("filterData",filterData);
	                self.trigger("test:everything_done");
	            })
            }

            function mousemove() {
              var y_time = self.yAxisScale.invert(d3.mouse(this)[1]);
              self.timeFocus.attr("transform", "translate(" + 0 + "," + d3.mouse(this)[1] + ")");
              self.timeFocus.select("text").text(y_time.toTimeString().substr(0,8));
            }
//频谱图 END
//brush
		        self.mainRegin.append("g")
		           .attr("class", "brush1")
		           .call(brush1)
		           .attr("transform", "translate(0," + brush_height + ")")
		           .selectAll('rect')
		           .attr("stroke","#fff")
		           .attr("fill-opacity",.125)
		           .attr('height', 15);

		        self.mainRegin.append("g")
		           .attr("class", "brush2")
		           .call(brush2)
		           .selectAll('rect')
		           .attr("transform", "translate(-23,0)")
		           .attr("stroke","#fff")
		           .attr("fill-opacity",.125)
		           .attr('width', 15);
//brush END
//zoom btn
			self.mainRegin.append('svg:foreignObject')
					.attr("transform", "translate("+ (self.chartWidth-40) + ",-20)")
				    .attr("width", 50)
				    .attr("height", 50)
				    .append("xhtml:body")
				    .html('<span class="btn btn-default btn-xs"><i class="fa fa-plus"></i></span>')
				    .on('click',zoomin);

    			self.mainRegin.append('svg:foreignObject')
					.attr("transform", "translate("+ (self.chartWidth-20) + ",-20)")
				    .attr("width", 50)
				    .attr("height", 50)
				    .append("xhtml:body")
				    .html('<span class="btn btn-default btn-xs"><i class="fa fa-minus"></i></span>')
				    .on('click',zoomout);
//zoom btn END
//change opacity when brushing
                function brushmove() {

                  var extent1 = brush1.extent();
                  var extent2 = brush2.extent();
                  var brush1_st = self.xAxisScale(extent1[0]),
                      brush1_ed = self.xAxisScale(extent1[1]),
                      brush2_st = self.yAxisScale(extent2[0]),
                      brush2_ed = self.yAxisScale(extent2[1]);

                  d3.selectAll('.grid').style('opacity', function(d){
                      if(brush2.empty()) {
                        if(self.xScale(d.gridcol) >= brush1_st && self.xScale(d.gridcol) <= brush1_ed)
                            return 1;
                        else
                            return .1;
                      }
                      if(brush1.empty()) {
                        if(self.yScale(d.gridrow) >= brush2_ed && self.yScale(d.gridrow) <= brush2_st)
                            return 1;
                        else
                            return .1;
                      }
                      else {
                        if(self.xScale(d.gridcol) >= brush1_st && self.xScale(d.gridcol) <= brush1_ed && self.yScale(d.gridrow) >= brush2_ed && self.yScale(d.gridrow) <= brush2_st)
                            return 1;
                        else
                            return .1;
                      }
                  });
                }

                function brushend() {
                  if (brush1.empty() && brush2.empty()) d3.selectAll(".grid").style("opacity", 1);
                }
//change opacity when brushing END
//zoom function
                function zoomin() {
                    if(self.have_zoomin == 0) {
                      var extent1 = brush1.extent();
                          self.x0 = extent1[0],
                          self.x1 = extent1[1];

                      var extent2 = brush2.extent();
                          self.y0 = extent2[0],
                          self.y1 = extent2[1];

                      var brushxRange = [];
                            brushxRange.push(self.x0.getTime());
                            brushxRange.push(self.x1.getTime());

                      var brushyRange = [];
                            brushyRange.push(self.y0);
                            brushyRange.push(self.y1);

                      if(brush1.empty()) {
                        Variables.setFilterRange("timeDate", null, true);
                      }

                      else {
                        Variables.setFilterRange("timeDate", brushxRange, true);
                      }

                      if(brush2.empty()) {
                        Variables.setFilterRange("freq", null, true);
                      }

                      else {
                        Variables.setFilterRange("freq", brushyRange, true);
                      }

                      if(!brush1.empty() && !brush2.empty()) {
                          Variables.set("mode","zoomin");
                          Variables.triggerFilter();
                      }

                      d3.select(".brush1").style("display", "none");
                      d3.select(".brush2").style("display", "none");
                    }

                    self.have_zoomin = 1;
                }

                function zoomout(){
                    Variables.setFilterRange("freq", null, true);
                    Variables.setFilterRange("timeDate", null, true);
                    Variables.set("zoominFirsttimeFilterRange",null);
                    Variables.set("zoominMidfreFilterRange",null);
                    Variables.set("mode","zoomout");
                    Variables.triggerFilter();
                    self.have_zoomin = 0;
                    brush1.extent([0,0]);
                    brush2.extent([0,0]);
                    d3.selectAll(".grid").style("opacity", 1);

                    self.d3el.selectAll(".scatter").remove();
                    self.d3el.selectAll(".point").remove();
                    self.d3el.selectAll('.brush_scatter').remove();
                    self.d3el.selectAll('.row').style("display", null);
                  	self.d3el.selectAll('.grid').style("display", null);
                  	d3.select(".brush1").style("display", null);
                    d3.select(".brush1 .extent").attr("width", 0);
                    d3.select(".brush2").style("display", null);
                    d3.select(".brush2 .extent").attr("height", 0);

                    self.xAxisScale.domain([minDate,maxDate]);
                    self.yAxisScale.domain([maxMidfre,minMidfre]);

                    reset_xaxis();
                    reset_yaxis();

                }

                function reset_xaxis() {
                  self.mainRegin.transition().duration(500)
                       .select(".x.axis")
                       .call(self.xAxis);
                }

                function reset_yaxis() {
                      self.mainRegin.transition().duration(500)
                           .select(".y.axis")
                           .call(self.yAxis);
                    }

              }

    }, SVGBase));
});



