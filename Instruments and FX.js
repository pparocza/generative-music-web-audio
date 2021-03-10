function InstrumentConstructorTemplate(){

	this.output = audioCtx.createGain();

}

InstrumentConstructorTemplate.prototype = {

	output: this.output,

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

}

//--------------------------------------------------------------

function Instrument(){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();
	this.startArray = [];

}

Instrument.prototype = {

	input: this.input,
	output: this.output,
	startArray: this.startArray,

	instrumentMethod: function(){
		this.startArray = [];
	},

	start: function(){
		for(var i=0; i<this.startArray.length; i++){
			this.startArray[i].start();
		}
	},

	stop: function(){
		for(var i=0; i<this.startArray.length; i++){
			this.startArray[i].stop();
		}
	},

	startAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.startArray.length; i++){
			this.startArray[i].startAtTime(this.time);
		}

	},

	stopAtTime: function(time){

		this.time = time;

		for(var i=0; i<startArray.length; i++){
			this.startArray[i].stopAtTime(this.time);
		}

	},

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

}

//--------------------------------------------------------------

function Effect(){

	this.input = audioCtx.createGain();
	this.filterFade = new FilterFade(0);
	this.output = audioCtx.createGain();
	this.startArray = [];

	this.input.connect(this.filterFade.input);

}

Effect.prototype = {

	input: this.input,
	output: this.output,
	filterFade: this.filterFade,
	startArray: this.startArray,

	effectMethod: function(){

		this.filterFade.connect(this.output);
		this.startArray = [];

	},

	thru: function(){

		this.filterFade.connect(this.output);

	},

	convolver: function(nChannels, length){

		this.nChannels = nChannels;
		this.length = length;

		this.c = new MyConvolver(this.nChannels, this.length, audioCtx.sampleRate);

		this.filterFade.connect(this.c);
		this.c.connect(this.output);

	},

	noiseAM: function(min, max, rate, lpFreq){

		this.min = min;
		this.max = max;
		this.rate = rate;
		this.lpFreq = lpFreq;

		this.l = new LFO(this.min, this.max, this.rate);
		this.l.buffer.makeUnipolarNoise();
		this.lp = new MyBiquad("lowpass", this.lpFreq, 1);
		this.g = new MyGain(0);

		this.filterFade.connect(this.g); this.l.connect(this.g.gain.gain);
		this.g.connect(this.output);

		this.startArray = [this.l];

	},

	fmShaper: function(cFreq, mFreq, mGain){

		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mGain = mGain;

		this.w = new MyWaveShaper();
		this.w.makeFm(this.cFreq, this.mFreq, 1);
		this.wG = new MyGain(this.mGain);

		this.filterFade.connect(this.wG);
		this.wG.connect(this.w);
		this.w.connect(this.output);

	},

	amShaper: function(cFreq, mFreq, mGain){

		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mGain = mGain;

		this.w = new MyWaveShaper();
		this.w.makeAm(this.cFreq, this.mFreq, 1);
		this.wG = new MyGain(this.mGain);

		this.filterFade.connect(this.wG);
		this.wG.connect(this.w);
		this.w.connect(this.output);

	},

	randomShortDelay: function(){

		this.dly = new MyStereoDelay(randomFloat(0.01, 0.035), randomFloat(0.01, 0.035), randomFloat(0, 0.1), 1);

		this.filterFade.connect(this.dly);
		this.dly.connect(this.output);

	},

	randomEcho: function(){

		this.dly = new MyStereoDelay(randomFloat(0.35, 0.6), randomFloat(0.35, 0.6), randomFloat(0, 0.2), 1);

		this.filterFade.connect(this.dly);
		this.dly.connect(this.output);

	},

	randomSampleDelay: function(){

		this.s = 1/audioCtx.sampleRate;

		this.dly = new MyStereoDelay(randomInt(this.s, this.s*100), randomInt(this.s, this.s*100), randomFloat(0.3, 0.4), 1);

		this.filterFade.connect(this.dly);
		this.dly.connect(this.output);

	},

	stereoDelay: function(delayL, delayR, fb){

		this.delayL = delayL;
		this.delayR = delayR;
		this.fb = fb;

		this.dly = new MyStereoDelay(this.delayL, this.delayR, this.fb, 1);

		this.filterFade.connect(this.dly);
		this.dly.connect(this.output);

	},

	filter: function(type, freq, Q){

		this.type = type;
		this.freq = freq;
		this.Q = Q;

		this.f = new MyBiquad(this.type, this.freq, this.Q);
		this.filterFade.connect(this.f);

		this.f.connect(this.output);

	},

	switch: function(switchVal){

		this.switchVal = switchVal;

		this.filterFade.start(this.switchVal, 30);

	},

	switchAtTime: function(switchVal, time){

		this.switchVal = switchVal;
		this.time = time;

		this.filterFade.startAtTime(this.switchVal, 20, this.time);


	},

	switchSequence: function(valueSequence, timeSequence){

		this.valueSequence = valueSequence;
		this.timeSequence = timeSequence;
		this.v;
		this.j=0;

		for(var i=0; i<timeSequence.length; i++){
			this.v = this.valueSequence[this.j%this.valueSequence.length];
			this.filterFade.startAtTime(this.v, 20, this.timeSequence[i]);
			this.j++;
		}

	},

	on: function(){

		this.filterFade.start(1, 30);

	},

	off: function(){

		this.filterFade.start(0, 20);

	},

	onAtTime: function(time){

		this.time = time;

		this.filterFade.startAtTime(1, 20, this.time);

	},

	offAtTime: function(time){

		this.time = time;

		this.filterFade.startAtTime(0, 20, this.time);

	},

	start: function(){

		for(var i=0; i<this.startArray.length; i++){
			this.startArray[i].start();
		}

	},

	stop: function(){

		for(var i=0; i<this.startArray.length; i++){
			this.startArray[i].stop();
		}

	},

	startAtTime: function(time){

		this.time = time;

			for(var i=0; i<startArray.length; i++){
				this.startArray[i].startAtTime(this.time);
			}

	},

	stopAtTime: function(time){

		this.time = time;

			for(var i=0; i<startArray.length; i++){
				this.startArray[i].stopAtTime(this.time);
			}

	},

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

}

//--------------------------------------------------------------
