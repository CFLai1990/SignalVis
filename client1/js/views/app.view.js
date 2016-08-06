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


    });
});
