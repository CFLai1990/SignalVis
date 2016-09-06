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
             self.listenTo(Variables, "clearAll", self.clearAll);
             self.listenTo(self, "test:everything_done", self.specDiagram);
             self.listenTo(Variables,"change:filterSignals", function(model, filterSignals){
                  console.log(Variables.get("mode"));
                  if(Variables.get("mode") == "zoomin") {
                        self.transition_data(filterSignals);
                  }
          	 });
             self.listenTo(Variables, "updatePixelMap", self.updatePixelMap);
             self.listenTo(Variables, "clearFilter", self.updatePixelMap);
             self.setTimer();
        },

        specDiagram: function(){
            var self = this;
            var specResult = Variables.get("specResult");
            var filterData = Variables.get("filterData");

            d3.selectAll('.line').remove();
            d3.selectAll('.signalPoint').remove();
            d3.selectAll('.timeFocus_line').remove();
            d3.selectAll(".overlay_line").remove();
            //console.log(filterData);
            var t_bcs = Datacenter.get("barcharts");
            var t_scope = t_bcs["scope"], t_scopedbm = t_bcs["scopedbm"];
            if(!t_scope && !t_scopedbm){
              return;
            }
            var scope_scale = d3.scale.linear()
    		      .range(t_scope?(t_scope.get("xRange")):(t_scopedbm.get("xRange")))
    		      .domain([426,2245]);

            var bandwidth_scale = d3.scale.linear()
              .range([5,20])
              .domain(d3.extent(filterData, function(d) { return d.bandwidth; }));

            var noise_scale = d3.scale.linear()
              .range([5,20])
              .domain(d3.extent(filterData, function(d) { return d.signalnoise; }));

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
    		      .style('stroke-width',.5)
    		      .style("cursor","pointer")
    		      // .on("mouseover",function(d){
    		      // 	  var x0 = self.x_line.invert(d3.mouse(this)[0]),
    		      // 		y0 = self.y_line.invert(d3.mouse(this)[1]);
    		      // 	  // line_showTooltip(x0,y0);
    		      // })
    		      // .on("mouseout",function(){
    		      // 	  line_hideTooltip();
    		      // });

    		    self.svg_line.selectAll(".signalPoint")
    		      .data(filterData)
    		      .enter()
    		      .append("circle")
    		      .attr("class", "signalPoint")
    		      .attr("cx", function(d){
                var t_text = "功率：" + d.scope.toFixed(3) + " dbm " + "中心频率："+ d.midfre.toFixed(3) + "MHz ";
                $(this)
                .attr("data-placement","top")
                .tooltip({
                    container: '#left',
                    viewpoint: '#left',
                    placement: 'top',
                    title: t_text,
                });
                return self.x_line(d.midfre);
              })
    		      .attr("cy", function(d){return self.y_line(d.scope);})
    		      .attr("r",2.5)
    		      .style('stroke-width',.5)
    		      .style("cursor","pointer");

            // self.svg_line.selectAll(".signalPoint2")
            //   .data(filterData)
            //   .enter()
            //   .append("path")
            //   .attr("class", "signalPoint2")
            //   .attr("d", function(d, i){
            //     if(i == 0){
            //       console.log(self.x_line.domain(), d);
            //     }
            //     var x_pos = self.x_line(d.midfre);
            //     var y_pos = self.y_line(d.scope);
            //     var width_r = bandwidth_scale(d.bandwidth)/2;
            //     var height_r = noise_scale(d.signalnoise)/2;

            //     return "M "+ (x_pos-width_r) +" " + y_pos + " " + x_pos + " " + (y_pos+height_r) + " " + (x_pos+width_r) +" " + y_pos + " " + x_pos + " " + (y_pos-height_r) + " Z";
            //   })
            //   .style("stroke-width", .2)
            //   .style("stroke", "white")
            //   .style("fill", "#1d91c0")
            //   .style('fill-opacity',.5)
            //   .style("cursor","pointer")
    		      // .on("mouseover",function(d){
    		      // 	var x0 = self.x_line(d.midfre),
    		      // 		y0 = self.y_line(d.scope),
            //       a0 = d.bandwidth,
            //       b0 = d.signalnoise;
    		      // 	line_showTooltip(x0,y0,a0,b0);
    		      // })
    		      // .on("mouseout",function(){
    		      // 	line_hideTooltip();
    		      // });

//时间定位线
            self.timeFocus_line = self.svg_line.append("g")
                .attr("class", "timeFocus_line")
                .style("display", "none");

            self.timeFocus_line.append("line")
                //.attr("y1", 0)
                .attr('y2', self.Height_line)
                .attr('x1', 0)
                .attr('x2', 0)
                .style('fill','none')
                .style('stroke','#fb9235')
                .style("stroke-dasharray", ("6, 6"))
                .style("stroke-width", 1);

            self.timeFocus_line.append("text")
                .attr("dy", "-.3em")
  //            .attr("transform", "translate(" + self.chartWidth + ",0)")
                .attr('text-anchor','middle')
                .style('fill','#fb9235')
                .style('font-size','12px');

            self.svg_line.append("rect")
                .attr("class", "overlay_line")
                .attr("transform", "translate(0," + self.Height_line + ")")
                .attr("width", self.chartWidth)
                .attr("height", 8)
                .style('fill','none')
                .style('pointer-events','all')
                .style('cursor','pointer')
                .on("mouseover", function() { self.timeFocus_line.style("display", null); })
          //      .on("mouseout", function() { self.timeFocus.style("display", "none"); })
                .on("mousemove", mousemove);

            var trangle = self.timeFocus_line.append('path')
                .attr("transform", "translate(0," + self.Height_line + ")")
                .attr('d',self.symbol)
                .attr('fill','#fb9235');

            function mousemove() {
                if(!self.checkTimer()){
                  return;
                }
                var x_fre = self.x_line.invert(d3.mouse(this)[0]);
                var y_scope = self.y_line.invert(d3.mouse(this)[1]);
                self.timeFocus_line.attr("transform", "translate(" + d3.mouse(this)[0] + "," + 0 + ")")
                                   .attr("y1", self.y_line(d3.mouse(this)[1]));
                self.timeFocus_line.select("text").text("中心频率："+x_fre.toFixed(3)+"MHz 功率："+y_scope.toFixed(3)+"dBm");
            }
//时间定位线 END

        		function line_showTooltip(x,y){
               var tooltip_scatter = self.svg_line.append("g")
                  .attr("class", "tooltip_scatter");

               tooltip_scatter.append("text")
                  .attr("font-size", '13px')
                  .attr("x", self.Width_line/3)
                  .attr("y", 10)
                  .attr("fill","#fff")
                  .text("中心频率："+ x.toFixed(3) + "MHz 功率：" + y.toFixed(3));// + "dBm 带宽："+a.toFixed(3)+"dB 信噪比："+b.toFixed(3)+"dB");
            }

         	function line_hideTooltip(){
              d3.selectAll(".tooltip_scatter").remove();
            }
        },

        updatePixelMap: function (v_map){
          var self = this;
          var t_transform = self.transform, t_map, t_color = self.colorScale;
          if(v_map){
            self.brush_pixelmap = v_map;
            t_map = v_map;
          }else{
            t_map = self.pixelmap;
          }
          self.d3el.selectAll('.grid')
          .style("fill", function(d) {
             var t_i = d.gridrow, t_j = d.gridcol, t_d = t_map[t_i][t_j];
                 if(t_d == 0)
                   return "#020919";
                 else
                   return t_color(t_transform(t_d));
          });
        },

        transition_data:function(filterSignals)
        {
          var self = this;
              if(filterSignals){
				          Variables.set("zoominFirsttimeFilterRange",null);
                  Variables.set("zoominMidfreFilterRange",null);

                  self.xAxisScale.domain([self.x0,self.x1]);
                  self.yAxisScale.domain([self.y0,self.y1]);
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
                            .range([1,2.5]);

             self.scatter = self.mainRegin.append("g").attr("class","scatter");

             self.scatter.selectAll(".point")
                    .data(filterSignals)
                  .enter().append("circle")
                    .attr("class", "point")
                    .attr("r", function(d) { return self.scattersizeScale(d.bandwidth);})
                    .attr("fill",'#00AEEF')
                    .attr("cx", function(d) {
                      var t_text = JSON.stringify(d);
                      $(this)
                      .attr("title", t_text)
                      .attr("data-placement","top")
                      .tooltip({
                          container: '#left',
                      });
                      return self.xAxisScale(d.midfre); })
                    .attr("cy", function(d) { return self.yAxisScale(d.firsttime); })
                    .style('cursor','pointer');
                    // .on('mouseover',function(d){showTooltip(d,this);})
                    // .on('mouseout',function(d){hideTooltip(d,this);});

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
                            brushxRange_sca.push(x0_sca);
                            brushxRange_sca.push(x1_sca);

                      var brushyRange_sca = [];
                            brushyRange_sca.push(y0_sca.getTime());
                            brushyRange_sca.push(y1_sca.getTime());

                      if(brush_scatter.empty()) {
                        Variables.set("zoominFirsttimeFilterRange",null);
                        Variables.set("zoominMidfreFilterRange",null);
                      }

                      else {
                        Variables.set("zoominFirsttimeFilterRange",brushyRange_sca);
                        Variables.set("zoominMidfreFilterRange",brushxRange_sca);
                      }
                }

            }
        },

        max: function(v_arr){
            var t_max = -Infinity;
            for(var i in v_arr){
                for(var j in v_arr[i]){
                    if(v_arr[i][j] > t_max){
                        t_max = v_arr[i][j];
                    }
                }
            }
            return t_max;
        },

        min: function(v_arr){
            var t_min = Infinity;
            for(var i in v_arr){
                for(var j in v_arr[i]){
                    if(v_arr[i][j] < t_min){
                        t_min = v_arr[i][j];
                    }
                }
            }
            return t_min;
        },

        setTimer: function(){
          var self = this;
          clearInterval(self["timer"]);
          self["motion"] = false;
          self["timer"] = setInterval(function(){
            self["motion"] = true;
          }, 300);
        },

        checkTimer: function(){
          if(!this["motion"]){
            return false;
          }
          this["motion"] = false;
          return true;
        },

        clearAll: function () {
          this.setTimer();
        },

        onShow: function()
        {
            var self = this;
            var t_width = self.$el.width(), t_height = self.$el.height();
            self.margin = {top: t_height * 0.05, right: t_width * 0.02, bottom: t_height * 0.04, left: 70};
            self.chartWidth = t_width - self.margin.left - self.margin.right;
            self.chartHeight = t_height * 0.55;
            self.have_zoomin = 0;
//useful variables
            var aggCount_old = Datacenter.get("aggCount");
            var aggCount = numeric.transpose(aggCount_old);
            self.pixelmap = aggCount;

            var maxCount = self.max(aggCount);
            var minCount = self.min(aggCount);
            var t_self = function(d){return d;}
            var t_transform = (maxCount - minCount)>100?Math.log:t_self;
            self.transform = t_transform;

            var minMidfre = Datacenter.get("minMidfre");
            var maxMidfre = Datacenter.get("maxMidfre");

            var h = self.chartHeight/aggCount.length,
                w = self.chartWidth/aggCount[0].length;
            var brush_height = self.chartHeight;
            var time_range = Datacenter.get("timeRange");
            var start_time = time_range[0];
            var t_days = (time_range[1] - time_range[0] ) / (24*1000*3600);
//useful variables END
//scales and brushes
            self.xScale = d3.scale.linear()
                                .range([0, self.chartWidth])
                                .domain([0,aggCount[0].length]);

            self.yScale = d3.scale.linear()
                            .range([0,self.chartHeight])
                            .domain([aggCount.length,0]);

            self.yAxisScale = d3.time.scale()
                            .domain(time_range)
                            .range([self.chartHeight, 0]);

            self.xAxisScale = d3.scale.linear()
                                .range([0,self.chartWidth])
                                .domain([minMidfre,maxMidfre]);

            self.colorScale = d3.scale.quantize()
                            .domain([t_transform(maxCount),0])
                            .range(colorbrewer.YlGnBu[9]);

            var brush1 = d3.svg.brush()
                         .x(self.xAxisScale)
                         // .on("brush", brushmove)
                         .on('brushend',brushend);

            var brush2 = d3.svg.brush()
                         .y(self.yAxisScale)
                         // .on("brush", brushmove)
                         .on('brushend',brushend);
//scales and brushes END

            self.mainRegin = self.d3el.append("g")
              .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
              .attr("class","mainReginSvg");
              var t_format;
              if(t_days >= 7 ){
                t_format = "%b %d";
              }else{
                if(t_days >= 1){
                  t_format = "%b %d %I:%M";
                }else{
                  t_format = "%H:%M:%S";
                }
              }

            self.xAxis = d3.svg.axis().scale(self.xAxisScale).orient("bottom");
            self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left").tickFormat(d3.time.format(t_format));
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
              .style("fill","#fff")
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
              .style("fill","#fff")
              .text("发现时间");

            self.mainRegin.append("defs").append("clipPath")
              .attr("id", "clip_heatmap")
              .append("rect")
              .attr("width", self.chartWidth)
              .attr("height", self.chartHeight);
//heatmap
          var row = self.mainRegin.selectAll(".row")
             .data(aggCount)
             .enter().append("g")
             .attr("class", "row");

          var col = row.selectAll(".grid")
             .data(function (d,i) { return d.map(function(a,j) { return {value: a, gridrow: i, gridcol: j}; } ) })
           .enter().append("rect")
             .attr("class", "grid")
             .attr("clip-path", "url(#clip_heatmap)")
             .attr("x", function(d, i) { return self.xScale(i); })
             .attr("y", function(d, i) { return self.yScale(d.gridrow)-h; })
             .attr("width", w)
             .attr("height", h)
             .style("fill", function(d) {
                    if(d.value == 0)
                      return "#020919";
                    else
                      return self.colorScale(t_transform(d.value));
             })
             .on("mouseover", function(d) {
                  if(!self.checkTimer()){
                    return;
                  }
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
                      .attr("fill","#fff")
                      .text("信号数: "+d.value+" 中心频率范围: ["+grid_time_st + "," + grid_time_ed + "] 时间范围: ["+grid_Mid_st + "," + grid_Mid_ed + "]");

             })
             .on("mouseout", function() {
                  d3.selectAll(".tool").remove();
                  d3.select(this).style("stroke","none");
             });
//heatmap END
//时间定位线
            self.symbol = d3.svg.symbol().type('triangle-up')
               	    .size(80);

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
		          	.attr("dx", "-1.7em")
		       		.attr("transform", "rotate(90)")
		            .attr('d',self.symbol)
		            .attr('fill','#fb9235');
//时间定位线 END
//频谱图
                self.margin_line = {top: t_height * 0.68, right: t_width * 0.02, bottom: t_height * 0.05, left: 70};
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
                var t_bcs = Datacenter.get("barcharts");
                var t_scope = t_bcs["scope"]?t_bcs["scope"]:t_bcs["scopedbm"];
                self.x_line.domain(Datacenter.get("midfreRange"));
                if(t_scope){
                  self.y_line.domain(t_scope.get("xRange"));
                }
                 self.svg_line.append("g")
                      .attr("class", "x axis")
                      .attr("transform", "translate(0," + self.Height_line + ")")
                      .call(xAxis_line)
                    .append("text")
                      .attr("dx", self.Width_line)
                      .attr("dy", 27)
                      .style("text-anchor", "end")
                      .style("fill","#fff")
                      .text("中心频率(MHz)");

                  self.svg_line.append("g")
                      .attr("class", "y axis")
                      .call(yAxis_line)
                    .append("text")
            //          .attr("transform", "rotate(-90)")
                      .attr("y", -10)
                      .attr("dy", ".7em")
                      .style("text-anchor", "start")
                      .style("fill","#fff")
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
                  .style("fill","#fff")
                  .attr("class","line_title")
                  .text("时间：" + y_time);

                // var filterData = detailSignals.filter(function(d){
                //   var timeStamp = new Date(d.firsttime).toTimeString().substr(0,8);
                //   if(timeStamp == y_time)
                //     return true;
                //   else
                //     return false;
                // });
                var t_scope = null, t_list = Config.get("barchart").list;
                if(t_list.indexOf("scope")>=0){
                  t_scope = Config.get("attrs")["scope"].attr;
                }
                if(t_list.indexOf("scopedbm")>=0){
                  t_scope = Config.get("attrs")["scopedbm"].attr;
                }

                var t_binTime = Datacenter.get("timeRange");
                t_binTime = (t_binTime[1] - t_binTime[0])/(Config.get("pixel").plansize[1]);
                var tt_time = new Date(self.yAxisScale.invert(d3.mouse(this)[1])).getTime();
                if(t_scope){
                  Datacenter.querySpectrum({
                      frame_num: frame_num,
                      time: [Math.round(tt_time - t_binTime * 0.6), Math.round(tt_time + t_binTime * 0.6)],
                      scope: t_scope,
                    },function(v_d){
  	                Variables.set("specResult", v_d);
  	                // Variables.set("filterData",filterData);
  	                self.trigger("test:everything_done");
  	            });
              }
            }

            function mousemove() {
              if(!self.checkTimer()){
                return;
              }
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
				    .html('<span class="zoombtn btn btn-default btn-xs"><i class="fa fa-plus"></i></span>')
				    .on('click',zoomin);

    			self.mainRegin.append('svg:foreignObject')
					.attr("transform", "translate("+ (self.chartWidth-20) + ",-20)")
				    .attr("width", 50)
				    .attr("height", 50)
				    .append("xhtml:body")
				    .html('<span class="zoombtn btn btn-default btn-xs"><i class="fa fa-minus"></i></span>')
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
                  brushmove();
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
                            brushxRange.push(self.x0);
                            brushxRange.push(self.x1);

                      var brushyRange = [];
                            brushyRange.push(self.y0.getTime());
                            brushyRange.push(self.y1.getTime());

                      if(brush1.empty()) {
                        Variables.setFilterRange("freq", null, true);
                      }

                      else {
                        Variables.setFilterRange("freq", brushxRange, true);
                      }

                      if(brush2.empty()) {
                        Variables.setFilterRange("timeDate", null, true);
                      }

                      else {
                        Variables.setFilterRange("timeDate", brushyRange, true);
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

                    self.xAxisScale.domain([minMidfre,maxMidfre]);
                    self.yAxisScale.domain(time_range);

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



