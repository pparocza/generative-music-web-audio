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

// EFFECT

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
		this.startArray = [];
	},

	thru: function(){

		this.filterFade.connect(this.output);

	},

	stereoDelay: function(delayL, delayR, fb){

		this.delayL = delayL;
		this.delayR = delayR;
		this.fb = fb;

		this.dly = new MyStereoDelay(this.delayL, this.delayR, this.fb, 1);

		this.filterFade.connect(this.dly);
		this.dly.connect(this.output);

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

// INSTRUMENT

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

	bPS: function(rate, tArray, gainVal){

		this.rate = rate;
		this.tArray = tArray;
		this.gainVal = gainVal;

		this.output.gain.value = gainVal;

		// BREAKPOINT ENVELOPE ARRAY

			this.sL = this.tArray.length*2;

			this.tS = new Sequence();
			this.tS.loop(this.sL, this.tArray);
			this.tS.palindrome();
			this.tS.bipolar();
			this.tS.join([0]);

			this.dS = new Sequence();
			this.dS = this.dS.duplicates(this.tS.sequence.length, 1/this.tS.sequence.length,);

			this.eArray = this.tS.lace(this.dS);

		// BREAKPOINT EXPONENT ARRAY

			this.expArray1 = new Sequence();
			this.expArray1.randomInts(this.eArray.length/2, 14, 54);
			this.expArray2 = new Sequence();
			this.expArray2.randomFloats(this.eArray.length/2, 0.1, 0.991);

			this.expArray = this.expArray1.lace(this.expArray2.sequence);

		// BREAKPOINT

			this.bP = new BreakPoint(this.eArray, this.expArray);
			this.bP.loop = true;
			this.bP.playbackRate = this.rate;

		// SHAPER

			this.s = new MyWaveShaper();
			this.s.makeFm(107, 20, 1);
			this.sG = new MyGain(0.1);

		// FILTERS

			this.f1 = new MyBiquad("highshelf", 3000, 1);
			this.f1.biquad.gain.value = -8;
			this.f2 = new MyBiquad("lowpass", 3000, 1);
			this.f3 = new MyBiquad("highpass", 5, 1);

		// SHAPER

			this.w = new MyWaveShaper();
			this.w.makeSigmoid(5);
			this.wD = new MyStereoDelay(randomFloat(0.001, 0.01), randomFloat(0.001, 0.01), 0.1, 1);
			this.wD.output.gain.value = 0.2;

		// CONNECTIONS
			/*
			this.bP.connect(this.sG);

			this.sG.connect(this.s);
			this.s.connect(this.f1);
			this.f1.connect(this.f2);
			this.f2.connect(this.f3);

			this.f2.connect(this.w);
			this.w.connect(this.wD);
			this.wD.connect(this.f3);

			this.f3.connect(this.output);
			*/

			this.bP.connect(this.output);

		// STARTS

			this.startArray = [this.bP];

	},

	lTone: function(fund){

		this.fund = fund;

		this.d2O = new LFO(0, 1, this.fund);
		this.d2O.buffer.makeUnipolarSine();
		this.d2OF = new MyBiquad("lowpass", 20000, 1);
		this.d2OF.output.gain.value = 0.5;
		this.d2OW = new Effect();
		this.d2OW.fmShaper(this.fund, this.fund*2, 0.0006);
		this.d2OW.on();

		this.p = new MyPanner2(randomFloat(-0.25, 0.25));
		this.p.output.gain.value = 1;

		this.t = new Effect();
		this.t.thru();

		this.dR = new Effect();
		this.dR.randomShortDelay();
		this.dR.output.gain.value = 0.3;
		this.dR.on();

		this.dE = new Effect();
		this.dE.randomEcho();
		this.dE.output.gain.value = 0.3;
		this.dE.on();

		this.d2O.connect(this.d2OF);
		this.d2OF.connect(this.d2OW);
		this.d2OW.connect(this.p);
		this.p.connect(this.t);

		this.t.connect(this.output);

		this.t.connect(this.dR);
		this.dR.connect(this.output);

		this.dR.connect(this.dE);
		this.dE.connect(this.output);

		this.d2O.start();

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

		for(var i=0; i<this.startArray.length; i++){
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
