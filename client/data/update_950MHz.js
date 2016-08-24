db.SignalDB.find( { time : { $exists : true } } ).forEach( function (d) {
	var t = new Date((d.time.replace(" ","T"))+"Z").getTime();
  	d.timeDate = NumberLong(t);
  	db.SignalDB.save(d);
});
db.SignalDB.createIndex({
	"freq": 1, 
	"baud": 1, 
	"scope": 1, 
	"carriernoise": 1, 
	"timeDate": 1,
	"Modulationmode": 1,
	"Modulationrate": 1,
	"CsTran": 1,
	"mask": 1,
	"SignalType": 1,
});