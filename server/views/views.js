var _ = require("underscore"), numeric = require("numeric");

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
        var t_binRange = (t_max - t_min)/t_bins;
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

function pixelmap(v_callback, v_parameters){
    var t_sort = function(v_arr, v_key){
        return _.sortBy(v_arr, function(tt_d){return tt_d[v_key];});
    };
    return function(v_data){
        var t_key = v_parameters.key, t_size = v_parameters.size;
        var t_keySize = v_data.length;
        var t_data = t_sort(v_data, t_key), t_subData = _.map(t_data, "indexs");
        var t_min = t_data[0][t_key], t_max = t_data[t_data.length - 1][t_key];
        var t_subMax = _.max(_.max(t_subData, function(t){return _.max(t);}));
        var t_subMin = _.min(_.min(t_subData, function(t){return _.min(t);}));
        if(t_keySize < t_size[0]){
            t_size[0] = t_keySize;
        }
        var t_binR = (t_max - t_min) / t_size[0], t_subBinR = (t_subMax - t_subMin) / t_size[1];
        var t_aggCount = [];
        for(var i = 0; i < t_size[0]; i++){
            var tt_bin = [];
            for(var j = 0; j < t_size[1]; j++){
                tt_bin[j] = 0;
            }
            t_aggCount.push(tt_bin);
        }
        for(var i = 0; i < t_data.length; i++){
            var tt_i = parseInt((t_data[i][t_key] - t_min) / t_binR);
            if(tt_i >= t_size[0]){
                tt_i = t_size[0] - 1;
            }
            var tt_sub = t_subData[i];
            for(var j = 0; j < tt_sub.length; j++){
                var tt_j = parseInt((tt_sub[j] - t_subMin) / t_subBinR);
                if(tt_j >= t_size[1]){
                    tt_j = t_size[1] - 1;
                }
                t_aggCount[tt_i][tt_j]++
            }
        }
        t_aggCount = numeric.transpose(t_aggCount);
        var t_result = {
            "attr": v_parameters.attr,
            "subattr": v_parameters.subattr,
            "size": [t_size[1], t_size[0]],
            "aggCount": t_aggCount,
            "range": [t_min, t_max],
            "subRange": [t_subMin, t_subMax],
        };
        v_callback(t_result);
    };
}

module.exports = {
	initialize: initialize,
	barchart: barchart,
    pixelmap: pixelmap,
};