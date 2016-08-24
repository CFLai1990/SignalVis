db.SignalDB0.find( { time : { $exists : true } } ).forEach( function (d) {
	if(d.time.indexOf("/")>=0){
		var t_p = d.time.split("/");
		if(t_p[1].length == 1){
			t_p[1] = "0" + t_p[1];
		}
		var t_t = t_p[2].split(" ");
		if(t_t[0].length == 1){
			t_t[0] = "0" + t_t[0];
		}
		if(t_t[1].length <= 4){
			t_t[1] = "0" + t_t[1];
		}
		t_p[2] = t_t.join(" ");
		d.time = t_p.join("-");
	}
	var t = new Date((d.time.replace(" ","T"))+"Z").getTime();
  	d.timeDate = NumberLong(t);
  	var t_id = d["﻿id"];
  	if(t_id){
  		d["id"] = t_id;
  	}
  	db.SignalDB0.save(d);
});
db.SignalDB0.createIndex({
	"freq": 1, 
	"baud": 1, 
	"snr": 1, 
	"dbm": 1, 
	"timeDate": 1,
});