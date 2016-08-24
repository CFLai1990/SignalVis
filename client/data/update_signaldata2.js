db.SignalDB2.find( { time : { $exists : true } } ).forEach( function (d) {
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
  	db.SignalDB2.save(d); 
});
db.SignalDB2.createIndex({
	"freq": 1, 
	"baud": 1, 
	"location": 1, 
	"demod": 1, 
	"demodrate": 1,
	"inforate": 1,
	"isDAOPU": 1,
	"isTDMA": 1,
	"codeType": 1,
	"frameLen": 1,
	"isdiff": 1,
	"transport": 1,
	"poly": 1,
});