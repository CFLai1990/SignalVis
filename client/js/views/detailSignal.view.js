define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'datacenter',
    'config',
    'text!templates/detailSignal.tpl',
    "views/detailSignal.itemview"
], function(require, Mn, _, $, Backbone, Datacenter, Config,Tpl,SVGItemView) {
    'use strict';
    var detailSignal = new Object();
    detailSignal.Layoutview = Mn.LayoutView.extend({
        // el:"#testRegion",
        tagName:"div",
        className: "ui-widget-content detailSignalview",
        // id:"testRegion",
        // tagName: 'div',
        // el:"#testRegion",
        template: _.template(Tpl),

        // attributes:{
        //     'style' : 'width: 100%; height:100%;'
        // },

        regions: {
                svg:".detailSignalsSVG",

        },


        initialize: function (options) {
            var self = this;
            self.svg = $(this.$el).find(".detailSignalsSVG");
            $(this.$el).draggable().on('click', '.closeBtn', function () {
                self.onClickCloseBtn();
            });
        },

        onClickCloseBtn:function() {
            Datacenter.get("detailSignals").remove(this.model);
        },
         onShow: function()
        {
            var self = this;
             this.showChildView('svg', new SVGItemView({
                    model:self.model
            }));
        }
    });

    detailSignal.CollectionView = Mn.CollectionView.extend({
        childView: detailSignal.Layoutview });

    return detailSignal;
});
