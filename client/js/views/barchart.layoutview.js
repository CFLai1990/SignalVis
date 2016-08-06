define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'datacenter',
    'config',
    'text!templates/barchart.tpl',
    "views/barchart.itemview"
], function(require, Mn, _, $, Backbone, Datacenter, Config,Tpl,SVGItemView) {
    'use strict';
    return Mn.LayoutView.extend({
        // el:"#testRegion",
        tagName:"div",
        className: "barchartview",
        // id:"testRegion",
        // tagName: 'div',
        // el:"#testRegion",
        template: _.template(Tpl),

        attributes:{
            'style' : 'width: 100%; height:100%;'
        },

        regions: {
                svg:".barchartSVG",

        },


        initialize: function (options) {
            var self = this;
            options = options || {};
            if(options.theTitle){
                this.theTitle = options.theTitle;
                // console.log(this.theTitle);
            }
            // self.svg = $(this.$el).find(".detailSignalsSVG");
            // $(this.$el).draggable().on('click', '.closeBtn', function () {
            //     self.onClickCloseBtn();
            // });
        },

         onShow: function()
        {
            var self = this;
             this.showChildView('svg', new SVGItemView({
                    model:self.model,
                    theTitle: self.theTitle
            }));
        }
    });
});
