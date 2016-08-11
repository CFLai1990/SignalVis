db.SignalDB.find( { Firsttime : { $exists : true } } ).forEach( function (d) {
	var t = new Date((d.Firsttime.replace(" ","T"))+"Z").getTime();
  	d.FirsttimeDate = NumberLong(t);
  	db.SignalDB.save(d); 
});