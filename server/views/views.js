var _ = require("underscore");

function initialize(v_db, v_logger){
	logger = v_logger;
	return this;
}

function barchart(v_callback, v_parameters){
	var t_sort = function(v_arr, v_key){
		return _.sortBy(v_arr, function(tt_d){return tt_d[v_key];});
	};
	return function(v_data){
		var t_key = v_parameters.key, t_bins = v_parameters.bins;
		var t_data = t_sort(v_data, t_key);
		var t_min = t_data[0][t_key], t_max = t_data[t_data.length - 1][t_key];
        var t_binRange = (t_max - t_min)/t_bins
        var t_binCount = [];
        for(var i = 0; i < t_bins; i++){
        	t_binCount.push(0);
        }
        for(var i = 0; i < t_data.length; i++){
        	var tt_ind = parseInt((t_data[i][t_key] - t_min)/t_binRange);
            if(tt_ind >= t_bins){
            	tt_ind = t_bins - 1;
            }
            t_binCount[tt_ind] = t_binCount[tt_ind] + t_data[i].indexs.length;
        }
        var t_result = {
        	"attr": t_key,
        	"binNumber": t_bins,
        	"binCount": t_binCount,
        	"xRange": [t_min, t_max],
        	"yRange": [0, _.max(t_binCount)],
        };
        v_callback(t_result);
	};
}

module.exports = {
	initialize: initialize,
	barchart: barchart,
};