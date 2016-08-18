define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'datacenter',
    'config',
    'text!templates/barchart.tpl',
    "views/barchart.collectionview"
], function(require, Mn, _, $, Backbone, Datacenter, Config,Tpl,barchartCollectionView) {
    'use strict';
    return Mn.LayoutView.extend({
        tagName:"div",
        className: "barchartview",
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
            _.extend(self, options);
        },

         onShow: function()
        {
            var self = this;
            self.showChildView('svg', new barchartCollectionView({collection: Datacenter.get("barchartCollection")}));
            // for(var i in self.models){
            //     var t_model = self.models[i], t_name = Config.get("chineseAttrNames")[i];
            //      self.showChildView('svg', new barchartCollectionView({
            //             model: t_model,
            //             theTitle: t_name,
            //     }));
            // }
        }
    });
});
