/**
 * Created by aji on 15/7/13.
 */
define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'datacenter',
    'config',
    "variables",
    'text!templates/app.tpl',
    "views/right.layoutview",
    "views/left.itemview",
    "views/mid.layoutview",
], function(require, Mn, _, $, Backbone,Datacenter,Config,Variables,Tpl
    ,RightLayoutView,LeftItemView,MidLayoutView) {
    'use strict';

    return Mn.LayoutView.extend({

        tagName: 'div',

        template: _.template(Tpl),

        attributes:{
            'style' : 'width: 100%; height:100%;'
        },
        regions:{
            'left': '#left',
            'mid':'#mid',
            'right':"#right",
        },

        initialize: function (options) {
            // window.NProgress.start();

            var self = this;
            options = options || {};
            $(document).ready(function(){
                Datacenter.start();
            });
            self.listenTo(Variables, 'change:finishInit', function(model, finishInit){
                if(finishInit) {
                    self.loaded();
                    Variables.set("loading",false);
                }
            });
            self.listenTo(Variables, 'change:loading', function(model, loading){
                if(loading)  {
                    $("#loading").removeClass("hidden");
                }
                else {
                    $("#loading").addClass("hidden");
                }
            });
            var t_df = $.Deferred();
            self.addLoaders(t_df);
            $.when(t_df).done(self.bindInteractions());
        },

        loaded: function() {
            $( "#draggable" ).draggable();

            console.log('loaded');
            // window.NProgress.done();
            var self = this;
            self.showChildView('right', new RightLayoutView());
            self.showChildView('left', new LeftItemView());
            self.showChildView('mid', new MidLayoutView());

        },

        onShow: function(){

        },

        addLoaders: function (v_df){
            var t_data = Config.get("data");
            for(var i in t_data){
                d3.select("#loader_ul")
                .append("li")
                .attr("id", i)
                .attr("class", "dataLoader")
                .append("a")
                .text(" " + i);
            }
            v_df.resolve();
        },

        bindInteractions: function(){
            var self = this;
            $(".dataLoader").on("click", function(){
                var t_id = $(this).attr("id");
                Config.changeData(t_id);
                $(".dataLoader").removeClass("active");
                $(this).addClass("active");
            });
            var t_d = Config.get("currentData");
            $(".dataLoader#"+t_d).addClass("active");
        },

    });
});
