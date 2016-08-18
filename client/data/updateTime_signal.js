db.SignalDB0.find( { time : { $exists : true } } ).forEach( function (d) {
	var t = new Date((d.time.replace(" ","T"))+"Z").getTime();
  	d.timeDate = NumberLong(t);
  	db.SignalDB0.save(d);
});