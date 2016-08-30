load("../bower_components/numeric.min.js");
var collection = "SignalDB0";
db.getCollection(collection).find( { time : { $exists : true } } ).forEach( function (d) {
	if(d.timeDate){
		return;
	}
	if(d.time.indexOf("/")>=0){
		var t_p = d.time.split("/");
		if(t_p[1].length == 1){
			t_p[1] = "0" + t_p[1];
		}
		var t = new Date((d.time.replace(" ","T"))+"Z").getTime();
	  	d.timeDate = NumberLong(t);
	  	var t_id = d["﻿id"];
	  	if(t_id){
	  		d["id"] = t_id;
	  	}
	  	db.SignalDB0.save(d);
	}
	var t = new Date((d.time.replace(" ","T"))+"Z").getTime();
  	d.timeDate = NumberLong(t);
  	var t_id = d["﻿id"];
  	if(t_id){
  		d["id"] = t_id;
  	}
  	db.getCollection(collection).save(d);
});
print("Time updated!");
db.getCollection(collection).createIndex({
	"freq": 1, 
	"baud": 1, 
	"snr": 1, 
	"dbm": 1, 
	"timeDate": 1,
});
print("Index created!");
var t_attrs = {}, t_id = 0, t_dict = {};
db.getCollection(collection).find({id:1}).forEach(function(d){
	for(var i in d){
		if(i == "time" || i == "id" || i == "_id" || i.indexOf("norm")>=0){
			continue;
		}
		t_attrs[i] = [];
	}
	if(t_id == 0){
		t_id ++;
		for(var i in t_attrs){
			var t_category = false, t_arr;
			t_arr = db.getCollection(collection).aggregate([{$group:{_id:'$'+i, count: {$sum: 1}}}]).result;
			var t_length = t_arr.length, t_values = [], t_count = 0, t_sum = 0, tt_dict = {};
			for(var j in t_arr){
				if(isNaN(t_arr[j]['_id'])){
					t_category = true;
				}
				t_count += t_arr[j]['count'];
			}
			if(t_category){
				if(t_length > 30){
					continue;
				}
				var t_num = 0;
				for(var j in t_arr){
					t_values[j] = t_num;
					t_sum += t_num * t_arr[j]['count'];
					t_num ++;
				}
			}else{
				for(var j in t_arr){
					t_values[j] = t_arr[j]['_id'];
					t_sum += t_values[j] * t_arr[j]['count'];
				}
			}
			var t_mean = t_sum / t_count;
			for(var j in t_values){
				if(t_norm == 0){
					t_values[j] = 0;
				}else{
					t_values[j] = t_values[j] - t_mean;
				}
			}
			var t_norm = 0;
			for(var j in t_values){
				t_norm += t_values[j] * t_values[j] * t_arr[j]['count'];
			}
			t_norm = Math.sqrt(t_norm);
			for(var j in t_values){
				if(t_norm == 0){
					t_values[j] = 0;
				}else{
					t_values[j] = t_values[j] / t_norm;
				}
			}
			for(var j in t_arr){
				tt_dict[t_arr[j]['_id']] = t_values[j];
			}
			t_dict[i] = tt_dict;
			t_attrs[i] = t_values;
			// print(i, t_values);
		}
	}
});
db.getCollection(collection).find({}).forEach(function(d){
	for(var i in d){
		if(t_attrs[i] && t_attrs[i].length > 0){
			var t_v = d[i];
			d['norm'+i] = t_dict[i][t_v];
		}
	}
	db.getCollection(collection).save(d);
});
print("Normalization finished!");