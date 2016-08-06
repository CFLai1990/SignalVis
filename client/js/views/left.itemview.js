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
            console.log(colorbrewer);
             var self = this;
             options = options || {};
             self.listenTo(Variables,"change:filterSignals", function(model, filterSignals){
                  // console.log(Variables.get("mode"));
                  if(Variables.get("mode") == "zoomin") {
                        self.transition_data(filterSignals);
                  }
          });
        },

        transition_data:function(filterSignals)
        {
          var self = this;
              if(filterSignals){
					        Variables.set("zoominFirsttimeFilterRange",null);
                  Variables.set("zoominMidfreFilterRange",null);
                  
                  self.xAxisScale.domain([self.x0,self.x1]);
                  self.yAxisScale.domain([self.y1,self.y0]);
                  self.d3el.selectAll('.row').remove();
                  self.d3el.selectAll('.grid').remove();
                  self.d3el.selectAll(".scatter").remove();
                  self.d3el.selectAll(".point").remove();
                  self.d3el.selectAll(".brush_scatter").remove();
                  self.d3el.select('.svg_line').remove();

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
            //        .on('click',function(d){drawlinechart(d);})


             self.mainRegin.transition().duration(500)
                    .select(".x.axis")
                    .call(self.xAxis);

             self.mainRegin.transition().duration(500)
                    .select(".y.axis")
                    .call(self.yAxis);
             // function drawlinechart(node){
             //      //某个时刻的频谱图
             //      d3.select('.svg_line').remove();

             //      self.margin_line = {top: 520, right: 20, bottom: 30, left: 55};
             //      self.Width_line = self.$el.width() - self.margin_line.left - self.margin_line.right;
             //      self.Height_line = self.$el.height() - self.margin_line.top - self.margin_line.bottom;

             //      var x_line = d3.scale.linear()
             //          .range([0, self.Width_line]);

             //      var y_line = d3.scale.linear()
             //          .range([self.Height_line, 0]);

             //      var xAxis_line = d3.svg.axis()
             //          .scale(x_line)
             //          .orient("bottom");

             //      var yAxis_line = d3.svg.axis()
             //          .scale(y_line)
             //          .orient("left");

             //      var line = d3.svg.line()
             //          .x(function(d) { return x_line(d.midfre); })
             //          .y(function(d) { return y_line(d.scope); });

             //      self.svg_line = self.d3el.append("g")
             //          .attr("transform", "translate(" + self.margin_line.left + "," + self.margin_line.top + ")")
             //          .attr("class","svg_line");

             //        x_line.domain(d3.extent(filterSignals, function(d) { return d.midfre; }));
             //        y_line.domain(d3.extent(filterSignals, function(d) { return d.scope; }));

             //        self.svg_line.append('g')
             //            .attr("transform", "translate(" + self.Width_line/2 + ",10)")      
             //          .append("text")
             //            .style("text-anchor", "middle")
             //            .text(new Date(node.firsttime).toTimeString().substr(0,8));          

             //        self.svg_line.append("g")
             //            .attr("class", "x axis")
             //            .attr("transform", "translate(0," + self.Height_line + ")")
             //            .call(xAxis_line)
             //          .append("text")
             //            .attr("dx", self.Width_line)
             //            .attr("dy", 30)
             //            .style("text-anchor", "end")
             //            .text("中心频率(MHz)");

             //        self.svg_line.append("g")
             //            .attr("class", "y axis")
             //            .call(yAxis_line)
             //          .append("text")
             //            .attr("transform", "rotate(-90)")
             //            .attr("y", -50)
             //            .attr("dy", ".7em")
             //            .style("text-anchor", "end")
             //            .text("能量(dBm)");

             //        var filterData = filterSignals.filter(function(d){
             //          if(d.firsttime == node.firsttime)
             //            return true;
             //          else
             //            return false;
             //        });

             //        filterData.sort(function(a,b){
             //            return b.midfre - a.midfre;
             //        })

             //        // self.svg_line.selectAll("circle")
             //        //     .data(filterData)
             //        //   .enter().append("circle")
             //        //     .attr("r", 2)
             //        //     .attr("fill",'#00AEEF')
             //        //     .attr("cx", function(d) { return x_line(d.midfre); })
             //        //     .attr("cy", function(d) { return y_line(d.scope); });

             //        self.svg_line.append("path")
             //            .datum(filterData)
             //            .attr("class", "line")
             //            .attr("d", line)
             //            .style("fill","none")
             //            .style("stroke","#00AEEF")
             //            .style("stroke-width",2);
             //    }

                function showTooltip(node,thisNode){
                   d3.select(thisNode).style("stroke","black");

                   var tooltip_scatter = self.mainRegin.append("g")
                      .attr("class", "tooltip_scatter");

                   tooltip_scatter.append("text")
                      .attr("font-size", '13px')
                      .attr("x", self.chartWidth/3)
                      .attr("y", -5)
                      .attr("fill","black")
                      .text("中心频率："+node.midfre.toFixed(3) + " 时间：" + (new Date(node.firsttime)).toTimeString().substr(0,8));

                   tooltip_scatter.append('line')
                      .attr('x1',self.xAxisScale(new Date(node.firsttime)))
                      .attr('x2',self.xAxisScale(new Date(node.firsttime)))
                      .attr('y1',self.yAxisScale(node.midfre))
                      .attr('y2',self.chartHeight)
                      .style('fill','none')
                      .style('stroke','grey')
                      .style("stroke-dasharray", ("3, 3"));

                   tooltip_scatter.append('line')
                      .attr('x1',self.xAxisScale(new Date(node.firsttime)))
                      .attr('x2',0)
                      .attr('y1',self.yAxisScale(node.midfre))
                      .attr('y2',self.yAxisScale(node.midfre))
                      .style('fill','none')
                      .style('stroke','grey')
                      .style("stroke-dasharray", ("3, 3"));
                }
 
                function hideTooltip(node,thisNode){
                  d3.selectAll(".tooltip_scatter").remove();
                  d3.select(thisNode).style("stroke","none");
                }

            }
        },

        onShow: function()
        {
            var self = this, t_w = self.$el.width(), t_h = self.$el.height();
            self.margin = {top: t_h * 0.05, right: t_w * 0.05, bottom: t_h * 0.3, left: t_w * 0.05};
            self.chartWidth = self.$el.width() - self.margin.left - self.margin.right;
            self.chartHeight = self.$el.height() - self.margin.top - self.margin.bottom;
            self.have_zoomin = 0;

            var detailSignals = Datacenter.get('signals');
            var aggCount = Datacenter.get("aggCount");
            var maxCount = d3.max(d3.max(aggCount));
            var minCount = d3.min(d3.min(aggCount));

            var minDate  = new Date(Datacenter.get("minTime"));
            var maxDate  = new Date(Datacenter.get("maxTime"));
            var minMidfre = Datacenter.get("minMidfre");
            var maxMidfre = Datacenter.get("maxMidfre");

            var h = self.chartHeight/aggCount.length,
                w = self.chartWidth/aggCount[0].length;
            var brush_height = self.chartHeight;

            self.xScale = d3.scale.linear()
                                .range([0, self.chartWidth])
                                .domain([0,aggCount[0].length]);

            self.yScale = d3.scale.linear()
                            .range([0,self.chartHeight])
                            .domain([aggCount.length,0]);

            self.xAxisScale = d3.time.scale()
                                    .domain([minDate,maxDate])
                                    .range([0, self.chartWidth]);

            self.yAxisScale = d3.scale.linear()
                                .range([0,self.chartHeight])
                                .domain([maxMidfre,minMidfre]);

            self.colorScale = d3.scale.quantize()
                            .domain([maxCount,1])
                            .range(colorbrewer.RdYlGn[8]);

            var brush1 = d3.svg.brush()
                         .x(self.xAxisScale)
                         .on("brush", brushmove);

            var brush2 = d3.svg.brush()
                         .y(self.yAxisScale)
                         .on("brush", brushmove);


            self.mainRegin = self.d3el.append("g")
                          .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
                          .attr("class","mainReginSvg");

            self.xAxis = d3.svg.axis().scale(self.xAxisScale).orient("bottom");
            self.yAxis = d3.svg.axis().scale(self.yAxisScale).orient("left");

            self.mainRegin.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + self.chartHeight + ")")
              .call(self.xAxis)
              .append("text")
              .attr("class", "xlabel")
              .attr("x", self.chartWidth)
              .attr("y", 30)
              .style("text-anchor", "end")
              .text("发现时间");

            self.mainRegin.append("g")
              .attr("class", "y axis")
              .call(self.yAxis)
                  .append("text")
                  .attr("class", "ylabel")
                  .attr("transform", "rotate(-90)")
                  .attr("y", -50)
                  .attr("dy", ".7em")
                  .style("text-anchor", "end")
                  .text("中心频率(MHz)");

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
                    d3.select(this)
                      .style("stroke","black");

             var grid_x_st = self.xAxisScale.invert(w*d.gridcol);
             var grid_x_ed = self.xAxisScale.invert(w+w*d.gridcol);
             var grid_y_st = self.yAxisScale.invert(self.chartHeight-(h*d.gridrow));
             var grid_y_ed = self.yAxisScale.invert(self.chartHeight-(h+h*d.gridrow));
             var grid_time_st = grid_x_st.toTimeString().substr(0,8);
             var grid_time_ed = grid_x_ed.toTimeString().substr(0,8);
             var grid_Mid_st = grid_y_st.toFixed(3);
             var grid_Mid_ed = grid_y_ed.toFixed(3);

             var tooltip = self.mainRegin.append("g");

               tooltip.append("text")
                  .attr("class", "tool")
                  .attr("width", 75)
                  .attr("height", 30)
                  .attr("x", 4)
                  .attr("y", -5)
                  .attr("fill","black")
                  .text("信号数: "+d.value);

            tooltip.append("text")
                  .attr("class", "tool")
                  .attr("width", 75)
                  .attr("height", 30)
                  .attr("x", 104)
                  .attr("y", -5)
                  .attr("fill","black")
                  .text("时间范围: ["+grid_time_st + "," + grid_time_ed + "]");

            tooltip.append("text")
                  .attr("class", "tool")
                  .attr("width", 75)
                  .attr("height", 30)
                  .attr("x", 304)
                  .attr("y", -5)
                  .attr("fill","black")
                  .text("中心频率范围: ["+grid_Mid_st + "," + grid_Mid_ed + "]");

                  })
            .on("mouseout", function() {
                d3.selectAll(".tool").remove();
                d3.select(this)
                    .style("stroke","none");
            });

//时间定位线
            self.symbol = d3.svg.symbol().type('triangle-up')
                .size(100);

            self.timeFocus = self.mainRegin.append("g")
                .attr("class", "timeFocus")
                .style("display", "none");

            self.timeFocus.append("line")
                .attr("y1", 0)
                .attr('y2', self.chartHeight)
                .attr('x1', 0)
                .attr('x2', 0)
                .style('fill','none')
                .style('stroke','#fb9235')
                .style("stroke-dasharray", ("6, 6"))
                .style("stroke-width", 2.5);

            self.timeFocus.append("text")
                .attr("dy", ".35em")
                .attr('text-anchor','middle')
                .style('fill','#fb9235');

            self.mainRegin.append("rect")
                .attr("class", "overlay")
                .attr("transform", "translate(0," + self.chartHeight + ")")
                .attr("width", self.chartWidth)
                .attr("height", 8)
                .style('fill','none')
                .style('pointer-events','all')
                .style('cursor','pointer')
                .on("mouseover", function() { self.timeFocus.style("display", null); })
              //  .on("mouseout", function() { self.timeFocus.style("display", "none"); })
                .on("mousemove", mousemove)
                .on('mousedown',drawlinechart);

            var trangle = self.timeFocus.append('path')
                .attr("transform", "translate(0," + (self.chartHeight+3) + ")")
                .attr('d',self.symbol)
                .attr('fill','#fb9235');
                

           function drawlinechart(){
                var x0 = (self.xAxisScale.invert(d3.mouse(this)[0])).toTimeString().substr(0,5);
                //某个时刻的频谱图
                d3.select('.svg_line').remove();
                var t_w = self.$el.width(), t_h = self.$el.height();
                self.margin_line = {top: t_h * 0.73, right: t_w * 0.05, bottom: t_h * 0.08, left: t_w * 0.05};
                self.Width_line = self.$el.width() - self.margin_line.left - self.margin_line.right;
                self.Height_line = self.$el.height() - self.margin_line.top - self.margin_line.bottom;

                var x_line = d3.scale.linear()
                    .range([0, self.Width_line]);

                var y_line = d3.scale.linear()
                    .range([self.Height_line, 0]);

                var xAxis_line = d3.svg.axis()
                    .scale(x_line)
                    .orient("bottom");

                var yAxis_line = d3.svg.axis()
                    .scale(y_line)
                    .orient("left");

                var line = d3.svg.line()
                    .x(function(d) { return x_line(d.midfre); })
                    .y(function(d) { return y_line(d.scope); });

                self.svg_line = self.d3el.append("g")
                    .attr("transform", "translate(" + self.margin_line.left + "," + self.margin_line.top + ")")
                    .attr("class","svg_line");

                  x_line.domain(d3.extent(detailSignals, function(d) { return d.midfre; }));
                  y_line.domain(d3.extent(detailSignals, function(d) { return d.scope; }));

                  self.svg_line.append('g')
                      .attr("transform", "translate(" + self.Width_line/2 + ",10)")      
                    .append("text")
                      .style("text-anchor", "middle")
                      .text(x0);          

                  self.svg_line.append("g")
                      .attr("class", "x axis")
                      .attr("transform", "translate(0," + self.Height_line + ")")
                      .call(xAxis_line)
                    .append("text")
                      .attr("dx", self.Width_line)
                      .attr("dy", 30)
                      .style("text-anchor", "end")
                      .text("中心频率(MHz)");

                  self.svg_line.append("g")
                      .attr("class", "y axis")
                      .call(yAxis_line)
                    .append("text")
                      .attr("transform", "rotate(-90)")
                      .attr("y", -50)
                      .attr("dy", ".7em")
                      .style("text-anchor", "end")
                      .text("能量(dBm)");

                  var filterData = detailSignals.filter(function(d){
                      var timeStamp = new Date(d.firsttime).toTimeString().substr(0,5);
                      if(timeStamp == x0)
                        return true;
                      else
                        return false;
                  });
                  console.log(filterData)
                  filterData.sort(function(a,b){
                      return b.midfre - a.midfre;
                  })
                  self.svg_line.append("path")
                      .datum(filterData)
                      .attr("class", "line")
                      .attr("d", line)
                      .style("fill","none")
                      .style("stroke","#00AEEF")
                      .style("stroke-width",1);
              }

            function mousemove() {
              var x0 = self.xAxisScale.invert(d3.mouse(this)[0]);
              self.timeFocus.attr("transform", "translate(" + d3.mouse(this)[0] + "," + 0 + ")");
              self.timeFocus.select("text").text(x0.toTimeString().substr(0,5));
            }
//时间定位线 end

  self.mainRegin.append("g")
     .attr("class", "brush1")
     .call(brush1)
     .attr("transform", "translate(0," + (brush_height+8) + ")")
     .selectAll('rect')
     .attr("stroke","#fff")
     .attr("fill-opacity",.125)
     .attr('height', 15);

  self.mainRegin.append("g")
     .attr("class", "brush2")
     .call(brush2)
     .selectAll('rect')
     .attr("transform", "translate(-15,0)")
     .attr("stroke","#fff")
     .attr("fill-opacity",.125)
     .attr('width', 15);

var z_in = self.mainRegin.append("g")
        .attr("transform", "translate("+ self.chartWidth/1.1 + ",-18)")
        .on("click", zoomin);

    z_in.append("rect")
        .attr("class", "zoomIn")
        .attr("width", 25)
        .attr("height", 15)
        .attr("stroke","steelblue")
        .attr('stroke-width',1.5)
        .attr("fill","#E6E6FA")
        .attr("cursor","pointer");

    z_in.append("text")
        .attr("class", "zoomInText")
        .attr('font-size','20px')
        .attr('dx',5)
        .attr('dy',14)
        .attr("fill","steelblue")
        .text("+")
        .attr("cursor","pointer");

var z_out = self.mainRegin.append("g")
        .attr("transform", "translate("+ self.chartWidth/1.06 + ",-18)")
        .on("click", zoomout);

    z_out.append("rect")
        .attr("class", "zoomIn")
        .attr("width", 25)
        .attr("height", 15)
        .attr("stroke","steelblue")
        .attr('stroke-width',1.5)
        .attr("fill","#E6E6FA")
        .attr("cursor","pointer");

    z_out.append("text")
        .attr("class", "zoomInText")
        .attr('font-size','20px')
        .attr('dx',8)
        .attr('dy',14)
        .attr("fill","steelblue")
        .text("-")
        .attr("cursor","pointer");

function brushmove() {
  d3.select(".brusharea1").remove();
  d3.select(".brusharea2").remove();
  d3.select(".brusharea3").remove();
  d3.select(".brusharea4").remove();
  d3.select(".brusharea5").remove();
  d3.select(".brusharea6").remove();

  var extent1 = brush1.extent();
  var extent2 = brush2.extent();
  var brush1_st = self.xAxisScale(extent1[0]),
      brush1_ed = self.xAxisScale(extent1[1]),
      brush2_st = self.yAxisScale(extent2[0]),
      brush2_ed = self.yAxisScale(extent2[1]);

  var brush_w = brush1_ed - brush1_st,
      brush_h = brush2_st - brush2_ed;

  var brush_area = self.mainRegin.append("g");

    brush_area.append("rect")
        .attr("class", "brusharea1")
        .attr("width", self.chartWidth)
        .attr("height", brush2_ed)
        .attr("x", 0)
        .attr("y", 0)
        .attr("stroke","white")
        .attr("fill","white")
        .attr("fill-opacity",.75);

    brush_area.append("rect")
        .attr("class", "brusharea4")
        .attr("width", brush1_st)
        .attr("height", self.chartHeight-brush2_ed)
        .attr("x", 0)
        .attr("y", brush2_ed)
        .attr("stroke","white")
        .attr("fill","white")
        .attr("fill-opacity",.75);

    brush_area.append("rect")
        .attr("class", "brusharea5")
        .attr("width", self.chartWidth-brush1_st)
        .attr("height", self.chartHeight-brush2_ed)
        .attr("x", brush1_ed)
        .attr("y", brush2_ed)
        .attr("stroke","white")
        .attr("fill","white")
        .attr("fill-opacity",.75);

    brush_area.append("rect")
        .attr("class", "brusharea6")
        .attr("width", self.chartWidth)
        .attr("height", self.chartHeight-brush2_st)
        .attr("x", 0)
        .attr("y", brush2_st)
        .attr("stroke","white")
        .attr("fill","white")
        .attr("fill-opacity",.75);

    brush_area.append("rect")
        .attr("class", "brusharea2")
        .attr("width", brush1_ed)
        .attr("height", brush_h)
        .attr("x", 0)
        .attr("y", brush2_ed)
        .attr("stroke","IndianRed")
        .attr("fill","none");
//可以添加事件的area
    brush_area.append("rect")
        .attr("class", "brusharea3")
        .attr("width", brush_w)
        .attr("height", self.chartHeight-brush2_ed)
        .attr("x", brush1_st)
        .attr("y", brush2_ed)
        .attr("stroke","IndianRed")
        .attr("fill","white")
        .attr("fill-opacity",0);

}

//zoom function
function zoomin() {

if(self.have_zoomin == 0)
{
  d3.select(".brusharea1").remove();
  d3.select(".brusharea2").remove();
  d3.select(".brusharea3").remove();
  d3.select(".brusharea4").remove();
  d3.select(".brusharea5").remove();
  d3.select(".brusharea6").remove();

  var extent1 = brush1.extent();
      self.x0 = extent1[0],
      self.x1 = extent1[1];

  var extent2 = brush2.extent();
      self.y0 = extent2[0],
      self.y1 = extent2[1];

  var brushxRange = [];
        brushxRange.push(self.x0.getTime());
        brushxRange.push(self.x1.getTime());

  self.brushyRange = [];
        self.brushyRange.push(self.y0);
        self.brushyRange.push(self.y1);

  if(brush1.empty()) {
    Variables.set("firsttimeFilterRange",null);
  }
  else {
    Variables.set("firsttimeFilterRange",brushxRange);
  }

  if(brush2.empty()) {
    Variables.set("midfreFilterRange",null);
  }
  else {
    Variables.set("midfreFilterRange",self.brushyRange);
  }

  if(!brush1.empty() && !brush2.empty()) {
      Variables.set("mode","zoomin");
  }

  d3.select(".brush1").remove();
  d3.select(".brush2").remove();
}
else
{}
self.have_zoomin = 1;
}

function zoomout(){
    Variables.set("midfreFilterRange",null);
    Variables.set("firsttimeFilterRange",null);
    Variables.set("zoominFirsttimeFilterRange",null);
    Variables.set("zoominMidfreFilterRange",null);
    Variables.set("mode","zoomout");
    self.have_zoomin = 0;

    self.d3el.selectAll(".scatter").remove();
    self.d3el.selectAll(".point").remove();
    self.d3el.selectAll('.brush_scatter').remove();
    d3.select('.svg_line').remove();

    self.xAxisScale.domain([minDate,maxDate]);
    self.yAxisScale.domain([maxMidfre,minMidfre]);

    reset_xaxis();
    reset_yaxis();

     var row = self.mainRegin.selectAll(".row")
             .data(aggCount)
           .enter().append("g")
             .attr("class", "row");

            var col = row.selectAll(".grid")
             .data(function (d,i) { return d.map(function(a,j) { return {value: a, gridrow: i,gridcol: j}; } ) })
           .enter().append("rect")
             .attr("class", "grid")
             .attr("x", function(d, i) { return self.xScale(i); })
             .attr("y", function(d, i) { return self.yScale(d.gridrow); })
             .attr("width", w)
             .attr("height", h)
               .style("fill", function(d) {
                    if(d.value==0)
                      return "white";
                    else
                      return self.colorScale(d.value);
               })
             .on("mouseover", function(d) {
                    d3.select(this)
                      .style("stroke","black");


             var grid_x_st = self.xAxisScale.invert(w*d.gridcol);
             var grid_x_ed = self.xAxisScale.invert(w+w*d.gridcol);
             var grid_y_st = self.yAxisScale.invert(self.chartHeight-(h*d.gridrow));
             var grid_y_ed = self.yAxisScale.invert(self.chartHeight-(h+h*d.gridrow));
             var grid_time_st = grid_x_st.toTimeString().substr(0,8);
             var grid_time_ed = grid_x_ed.toTimeString().substr(0,8);
             var grid_Mid_st = grid_y_st.toFixed(3);
             var grid_Mid_ed = grid_y_ed.toFixed(3);

             var tooltip = self.mainRegin.append("g");

              tooltip.append("text")
                  .attr("class", "tool")
                  .attr("width", 75)
                  .attr("height", 30)
                  .attr("x", 4)
                  .attr("y", -5)
                  .attr("fill","black")
                  .text("信号数: "+d.value);


            tooltip.append("text")
                  .attr("class", "tool")
                  .attr("width", 75)
                  .attr("height", 30)
                  .attr("x", 104)
                  .attr("y", -5)
                  .attr("fill","black")
                  .text("时间范围: ["+grid_time_st + "," + grid_time_ed + "]");

            tooltip.append("text")
                  .attr("class", "tool")
                  .attr("width", 75)
                  .attr("height", 30)
                  .attr("x", 304)
                  .attr("y", -5)
                  .attr("fill","black")
                  .text("中心频率范围: ["+grid_Mid_st + "," + grid_Mid_ed + "]");

                  })
            .on("mouseout", function() {
                d3.selectAll(".tool").remove();
                d3.select(this)
                    .style("stroke","none");
            });

//append brush
  self.mainRegin.append("g")
     .attr("class", "brush1")
     .call(brush1)
     .attr("transform", "translate(0," + brush_height + ")")
     .selectAll('rect')
     .attr("stroke","#fff")
     .attr("fill-opacity",.125)
     .attr('height', 15)
     .on("brushmove",brushmove);

  self.mainRegin.append("g")
     .attr("class", "brush2")
     .call(brush2)
     .selectAll('rect')
     .attr("transform", "translate(-29,0)")
     .attr("stroke","#fff")
     .attr("fill-opacity",.125)
     .attr('width', 25)
     .on("brushmove",brushmove);
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

