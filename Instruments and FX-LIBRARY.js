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

// BUFFERS

//--------------------------------------------------------------

function BufferConstant(value){

	this.value = value;
	this.output = audioCtx.createGain();

	this.bufferSource = audioCtx.createBufferSource();

	this.buffer = audioCtx.createBuffer(1, audioCtx.sampleRate*1, audioCtx.sampleRate);

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = this.value;
			}
		}
}

BufferConstant.prototype = {

	output: this.output,
	buffer: this.buffer,

	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.loop = "true";
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	stop: function(){
		this.bufferSource.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.loop = "true";
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

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

function BufferNoise(){

	this.playbackRate = 1;

	this.output = audioCtx.createGain();

	this.buffer = audioCtx.createBuffer(1, audioCtx.sampleRate*1, audioCtx.sampleRate);

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.random() * 2 - 1;
			}
		}

}

BufferNoise.prototype = {

	output: this.output,
	buffer: this.buffer,
	playbackRate: this.playbackRate,

	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.loop = "true";
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	stop: function(){
		this.bufferSource.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.loop = "true";
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

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

// CV NODES

//--------------------------------------------------------------

function Envelope(envArray){

	this.output = audioCtx.createGain();

	this.envArray = envArray;

	this.length = 0;

	this.targetArray = [];
	this.durationArray = [];
	this.segmentArray = [];
	this.ti = 0;
	this.di = 0;

	for(this.i=0; this.i<envArray.length; this.i++){
		if(this.i%2==0){
			this.targetArray[this.ti] = this.envArray[this.i];
			this.ti++;
		}
		else if(this.i%2==1){
			this.length+=this.envArray[this.i];
			this.durationArray[this.di] = audioCtx.sampleRate*this.envArray[this.i];
			if(this.i==1){
				this.segmentArray[this.di] = this.durationArray[this.di];
			}
			else if(this.i!=1){
				this.segmentArray[this.di] = this.durationArray[this.di]+this.segmentArray[this.di-1];
			}
			this.di++;
		}
	}

	this.length = audioCtx.sampleRate*this.length;

	this.buffer = audioCtx.createBuffer(1, this.length, audioCtx.sampleRate);
	this.m = 0;
	this.b = 0;
	this.x = 0;
	this.idxOffset = 0;
	this.idx = 0;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){

			this.nowBuffering = this.buffer.getChannelData(this.channel);

			for(this.i=0; this.i<this.segmentArray.length; this.i++){

					if(this.i==0){
						for(this.j=0; this.j<this.durationArray[0]; this.j++){
							this.nowBuffering[this.j] = (this.j/this.segmentArray[this.i])*this.targetArray[this.i];
						}

					}

					else if(this.i!=0){
						this.idxOffset = this.segmentArray[this.i-1];

						for(this.j=0; this.j<this.durationArray[this.i]; this.j++){
							this.idx = this.idxOffset+this.j;
							this.m = this.targetArray[this.i]-this.targetArray[this.i-1];
							this.x = this.j/this.durationArray[this.i];
							this.b = this.targetArray[this.i-1];

							this.nowBuffering[this.idx] = (this.m*this.x)+this.b;

				}
			}
		}
	}
}

Envelope.prototype = {

	output: this.output,
	buffer: this.buffer,
	loop: this.loop,

	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	stop: function(){
		this.bufferSource.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

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

function Envelope2(startValue, envArray){

	this.output = audioCtx.createGain();

	this.startValue = startValue;
	this.envArray = envArray;

	this.length = length;

	this.targetArray = [];
	this.durationArray = [];
	this.segmentArray = [];
	this.ti = 0;
	this.di = 0;

	for(this.i=0; this.i<envArray.length; this.i++){
		if(this.i%2==0){
			this.targetArray[this.ti] = this.envArray[this.i];
			this.ti++;
		}
		else if(this.i%2==1){
			this.length+=this.envArray[this.i];
			this.durationArray[this.di] = audioCtx.sampleRate*this.envArray[this.i];
			if(this.i==1){
				this.segmentArray[this.di] = this.durationArray[this.di];
			}
			else if(this.i!=1){
				this.segmentArray[this.di] = this.durationArray[this.di]+this.segmentArray[this.di-1];
			}
			this.di++;
		}
	}

	this.length = audioCtx.sampleRate*this.length;

	this.buffer = audioCtx.createBuffer(1, this.length, audioCtx.sampleRate);
	this.m = 0;
	this.b = 0;
	this.x = 0;
	this.idxOffset = 0;
	this.idx = 0;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){

			this.nowBuffering = this.buffer.getChannelData(this.channel);

			for(this.i=0; this.i<this.segmentArray.length; this.i++){

					if(this.i==0){
						for(this.j=0; this.j<this.durationArray[0]; this.j++){
							this.m = this.targetArray[this.i]-this.startValue;
							this.x = this.j/this.segmentArray[this.i];
							this.b = this.startValue;
							this.nowBuffering[this.j] = (this.m*this.x)+this.b;
						}

					}

					else if(this.i!=0){
						this.idxOffset = this.segmentArray[this.i-1];

						for(this.j=0; this.j<this.durationArray[this.i]; this.j++){
							this.idx = this.idxOffset+this.j;
							this.m = this.targetArray[this.i]-this.targetArray[this.i-1];
							this.x = this.j/this.durationArray[this.i];
							this.b = this.targetArray[this.i-1];

							this.nowBuffering[this.idx] = (this.m*this.x)+this.b;

				}
			}
		}
	}
}

Envelope2.prototype = {

	output: this.output,
	buffer: this.buffer,
	loop: this.loop,

	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	stop: function(){
		this.bufferSource.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

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

function ExpEnvelope(envArray, expArray){

	this.output = audioCtx.createGain();

	this.envArray = envArray;
	this.expArray = expArray;

	this.length = 0;

	this.targetArray = [];
	this.durationArray = [];
	this.segmentArray = [];
	this.ti = 0;
	this.di = 0;

	for(this.i=0; this.i<envArray.length; this.i++){
		if(this.i%2==0){
			this.targetArray[this.ti] = this.envArray[this.i];
			this.ti++;
		}
		else if(this.i%2==1){
			this.length+=this.envArray[this.i];
			this.durationArray[this.di] = audioCtx.sampleRate*this.envArray[this.i];
			if(this.i==1){
				this.segmentArray[this.di] = this.durationArray[this.di];
			}
			else if(this.i!=1){
				this.segmentArray[this.di] = this.durationArray[this.di]+this.segmentArray[this.di-1];
			}
			this.di++;
		}
	}

	this.length = audioCtx.sampleRate*this.length;

	this.buffer = audioCtx.createBuffer(1, this.length, audioCtx.sampleRate);
	this.m = 0;
	this.b = 0;
	this.x = 0;
	this.idxOffset = 0;
	this.idx = 0;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){

			this.nowBuffering = this.buffer.getChannelData(this.channel);

			for(this.i=0; this.i<this.segmentArray.length; this.i++){

				if(this.i==0){

					for(this.j=0; this.j<this.durationArray[0]; this.j++){

						this.idx = this.j
						this.y = ((this.j/this.segmentArray[this.i])*this.targetArray[this.i]);
						this.e = this.expArray[this.i%this.expArray.length];

						if(this.y>=0){
							this.nowBuffering[this.idx] = Math.pow(this.y, this.e);
						}

						else if(this.y<0){

								if(this.e%2==0 || Number.isInteger(this.e)==false){
									this.nowBuffering[this.idx] = -Math.pow(-this.y, this.e);
								}
								else if(this.e%2!=0){
									this.nowBuffering[this.idx] = Math.pow(this.y, this.e);
								}
						}

					}
				}

					else if(this.i!=0){

						this.idxOffset = this.segmentArray[this.i-1];

						for(this.j=0; this.j<this.durationArray[this.i]; this.j++){
							this.idx = this.idxOffset+this.j;
							this.m = this.targetArray[this.i]-this.targetArray[this.i-1];
							this.x = this.j/this.durationArray[this.i];
							this.b = this.targetArray[this.i-1];
							this.y = (this.m*this.x)+this.b;
							this.e = this.expArray[this.i%this.expArray.length];

							//
							if(this.y>=0){
								this.nowBuffering[this.idx] = Math.pow(this.y, this.e);
							}

							else if(this.y<0){

									if(this.e%2==0 || Number.isInteger(this.e)==false){
										this.nowBuffering[this.idx] = -Math.pow(-this.y, this.e);
									}
									else if(this.e%2!=0){
										this.nowBuffering[this.idx] = Math.pow(this.y, this.e);
									}
							}
							//

				}
			}
		}
	}
}

ExpEnvelope.prototype = {

	output: this.output,
	buffer: this.buffer,
	loop: this.loop,

	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	stop: function(){
		this.bufferSource.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

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

function ExpEnvelope2(startValue, envArray, expArray){

	this.output = audioCtx.createGain();

	this.startValue = startValue;
	this.envArray = envArray;
	this.expArray = expArray;

	this.length = length;

	this.targetArray = [];
	this.durationArray = [];
	this.segmentArray = [];
	this.ti = 0;
	this.di = 0;

	for(this.i=0; this.i<envArray.length; this.i++){
		if(this.i%2==0){
			this.targetArray[this.ti] = this.envArray[this.i];
			this.ti++;
		}
		else if(this.i%2==1){
			this.length+=this.envArray[this.i];
			this.durationArray[this.di] = audioCtx.sampleRate*this.envArray[this.i];
			if(this.i==1){
				this.segmentArray[this.di] = this.durationArray[this.di];
			}
			else if(this.i!=1){
				this.segmentArray[this.di] = this.durationArray[this.di]+this.segmentArray[this.di-1];
			}
			this.di++;
		}
	}

	this.length = audioCtx.sampleRate*this.length;

	this.buffer = audioCtx.createBuffer(1, this.length, audioCtx.sampleRate);
	this.m = 0;
	this.b = 0;
	this.x = 0;
	this.idxOffset = 0;
	this.idx = 0;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){

			this.nowBuffering = this.buffer.getChannelData(this.channel);

			for(this.i=0; this.i<this.segmentArray.length; this.i++){

					if(this.i==0){
						for(this.j=0; this.j<this.durationArray[0]; this.j++){
								this.m = this.targetArray[this.i]-this.startValue;
								this.x = this.j/this.segmentArray[this.i];
								this.b = this.startValue;
								this.y = (this.m*this.x)+this.b;
								this.e = this.expArray[this.i%this.expArray.length];

								if(this.y>=0){
									this.nowBuffering[this.j] = Math.pow(this.y, this.e);
								}

								if(this.y<0){
									if(this.e%2==0){
										this.nowBuffering[this.j] = -Math.pow(-this.y, this.e);
									}
									if(this.e%2!=0){
										this.nowBuffering[this.j] = Math.pow(this.y, this.e);
									}
							}
						}

					}

					else if(this.i!=0){
						this.idxOffset = this.segmentArray[this.i-1];

						for(this.j=0; this.j<this.durationArray[this.i]; this.j++){
							this.idx = this.idxOffset+this.j;
							this.m = this.targetArray[this.i]-this.targetArray[this.i-1];
							this.x = this.j/this.durationArray[this.i];
							this.b = this.targetArray[this.i-1];
							this.y = (this.m*this.x)+this.b;
							this.e = this.expArray[this.i%this.expArray.length];

							if(this.y>=0){
								this.nowBuffering[this.j] = Math.pow(this.y, this.e);
							}

							if(this.y<0){
								if(this.e%2==0 || Number.isInteger(this.e)==false){
									this.nowBuffering[this.j] = -Math.pow(-this.y, this.e);
								}
								if(this.e%2!=0){
									this.nowBuffering[this.j] = Math.pow(this.y, this.e);
								}
						}

				}
			}
		}
	}
}

ExpEnvelope2.prototype = {

	output: this.output,
	buffer: this.buffer,
	loop: this.loop,

	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	stop: function(){
		this.bufferSource.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

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

function BreakPoint(envArray, expArray){

	this.output = audioCtx.createGain();

	this.envArray = envArray;
	this.expArray = expArray;

	this.targetArray = [];
	this.durationArray = [];
	this.segmentArray = [];
	this.ti = 0;
	this.di = 0;

	for(this.i=0; this.i<envArray.length; this.i++){
		if(this.i%2==0){
			this.targetArray[this.ti] = this.envArray[this.i];
			this.ti++;
		}
		else if(this.i%2==1){
			this.durationArray[this.di] = parseInt(audioCtx.sampleRate*this.envArray[this.i]);
			if(this.i==1){
				this.segmentArray[this.di] = this.durationArray[this.di];
			}
			else if(this.i!=1){
				this.segmentArray[this.di] = this.durationArray[this.di]+this.segmentArray[this.di-1];
			}
			this.di++;
		}
	}

	this.buffer = audioCtx.createBuffer(1, 1*audioCtx.sampleRate, audioCtx.sampleRate);
	this.m = 0;
	this.b = 0;
	this.x = 0;
	this.idxOffset = 0;
	this.idx = 0;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){

			this.nowBuffering = this.buffer.getChannelData(this.channel);

			for(this.i=0; this.i<this.segmentArray.length; this.i++){

					if(this.i==0){

						for(this.j=0; this.j<this.durationArray[0]; this.j++){

							this.idx = this.j
							this.y = ((this.j/this.segmentArray[this.i])*this.targetArray[this.i]);
							this.e = this.expArray[this.i%this.expArray.length];

							if(this.y>=0){
								this.nowBuffering[this.idx] = Math.pow(this.y, this.e);
							}

							else if(this.y<0){

									if(this.e%2==0 || Number.isInteger(this.e)==false){
										this.nowBuffering[this.idx] = -Math.pow(-this.y, this.e);
									}
									else if(this.e%2!=0){
										this.nowBuffering[this.idx] = Math.pow(this.y, this.e);
									}
							}

						}
					}

					else if(this.i!=0){
						this.idxOffset = this.segmentArray[this.i-1];

						for(this.j=0; this.j<this.durationArray[this.i]; this.j++){
							this.idx = this.idxOffset+this.j;
							this.m = this.targetArray[this.i]-this.targetArray[this.i-1];
							this.x = this.j/this.durationArray[this.i];
							this.b = this.targetArray[this.i-1];
							this.y = (this.m*this.x)+this.b;
							this.e = this.expArray[this.i%this.expArray.length];

//
							if(this.y>=0){
								this.nowBuffering[this.idx] = Math.pow(this.y, this.e);
							}

							else if(this.y<0){

									if(this.e%2==0 || Number.isInteger(this.e)==false){
										this.nowBuffering[this.idx] = -Math.pow(-this.y, this.e);
									}
									else if(this.e%2!=0){
										this.nowBuffering[this.idx] = Math.pow(this.y, this.e);
									}
							}
//
						}
					}
				}
			}
}

BreakPoint.prototype = {

	output: this.output,
	buffer: this.buffer,
	loop: this.loop,
	playbackRate: this.playbackRate,

	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	stop: function(){
		this.bufferSource.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

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

function LFO(min, max, rate){

	this.output = audioCtx.createGain();

	this.min = min;
	this.max = max;
	this.range = this.max-this.min;
	this.rate = rate;

	this.buffer = new MyBuffer(1, 1, audioCtx.sampleRate);
	this.buffer.playbackRate = this.rate;
	this.buffer.loop = true;
	this.constant = new BufferConstant(this.min);

	this.bG = new MyGain(this.range);
	this.aG = new MyGain(1);

	this.buffer.connect(this.bG);
	this.bG.connect(this.aG); this.constant.connect(this.aG);
	this.aG.connect(this.output);

}

LFO.prototype = {

	output: this.output,
	buffer: this.buffer,
	rate: this.rate,

	start: function(){
		this.buffer.start();
		this.constant.start();
	},

	stop: function(){
		this.buffer.stopAtTime();
		this.constant.stopAtTime();
	},

	startAtTime: function(time){

		this.time = time;

		this.buffer.startAtTime(this.time);
		this.constant.startAtTime(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.buffer.stopAtTime(this.time);
		this.constant.stopAtTime(this.time);

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

function EnvelopeBuffer(){

}

EnvelopeBuffer.prototype = {

	makeExpEnvelope: function(envArray, expArray){

		this.envArray = envArray;
		this.expArray = expArray;

		this.length = 0;

		this.targetArray = [];
		this.durationArray = [];
		this.segmentArray = [];
		this.ti = 0;
		this.di = 0;

		for(this.i=0; this.i<envArray.length; this.i++){
			if(this.i%2==0){
				this.targetArray[this.ti] = this.envArray[this.i];
				this.ti++;
			}
			else if(this.i%2==1){
				this.length+=this.envArray[this.i];
				this.durationArray[this.di] = audioCtx.sampleRate*this.envArray[this.i];
				if(this.i==1){
					this.segmentArray[this.di] = this.durationArray[this.di];
				}
				else if(this.i!=1){
					this.segmentArray[this.di] = this.durationArray[this.di]+this.segmentArray[this.di-1];
				}
				this.di++;
			}
		}

		this.length = audioCtx.sampleRate*this.length;

		this.buffer = audioCtx.createBuffer(1, this.length, audioCtx.sampleRate);
		this.m = 0;
		this.b = 0;
		this.x = 0;
		this.idxOffset = 0;
		this.idx = 0;

			for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){

				this.nowBuffering = this.buffer.getChannelData(this.channel);

				for(this.i=0; this.i<this.segmentArray.length; this.i++){

					if(this.i==0){

						for(this.j=0; this.j<this.durationArray[0]; this.j++){

							this.idx = this.j
							this.y = ((this.j/this.segmentArray[this.i])*this.targetArray[this.i]);
							this.e = this.expArray[this.i%this.expArray.length];

							if(this.y>=0){
								this.nowBuffering[this.idx] = Math.pow(this.y, this.e);
							}

							else if(this.y<0){

									if(this.e%2==0 || Number.isInteger(this.e)==false){
										this.nowBuffering[this.idx] = -Math.pow(-this.y, this.e);
									}
									else if(this.e%2!=0){
										this.nowBuffering[this.idx] = Math.pow(this.y, this.e);
									}
							}

						}
					}

						else if(this.i!=0){

							this.idxOffset = this.segmentArray[this.i-1];

							for(this.j=0; this.j<this.durationArray[this.i]; this.j++){
								this.idx = this.idxOffset+this.j;
								this.m = this.targetArray[this.i]-this.targetArray[this.i-1];
								this.x = this.j/this.durationArray[this.i];
								this.b = this.targetArray[this.i-1];
								this.y = (this.m*this.x)+this.b;
								this.e = this.expArray[this.i%this.expArray.length];

								//
								if(this.y>=0){
									this.nowBuffering[this.idx] = Math.pow(this.y, this.e);
								}

								else if(this.y<0){

										if(this.e%2==0 || Number.isInteger(this.e)==false){
											this.nowBuffering[this.idx] = -Math.pow(-this.y, this.e);
										}
										else if(this.e%2!=0){
											this.nowBuffering[this.idx] = Math.pow(this.y, this.e);
										}
								}
								//

					}
				}
			}
		}
	},

	makeEnvelope: function(envArray){

		this.envArray = envArray;

		this.length = 0;

		this.targetArray = [];
		this.durationArray = [];
		this.segmentArray = [];
		this.ti = 0;
		this.di = 0;

		for(this.i=0; this.i<this.envArray.length; this.i++){
			if(this.i%2==0){
				this.targetArray[this.ti] = this.envArray[this.i];
				this.ti++;
			}
			else if(this.i%2==1){
				this.length+=this.envArray[this.i];
				this.durationArray[this.di] = audioCtx.sampleRate*this.envArray[this.i];
				if(this.i==1){
					this.segmentArray[this.di] = this.durationArray[this.di];
				}
				else if(this.i!=1){
					this.segmentArray[this.di] = this.durationArray[this.di]+this.segmentArray[this.di-1];
				}
				this.di++;
			}
		}

		this.length = audioCtx.sampleRate*this.length;

		this.buffer = audioCtx.createBuffer(1, this.length, audioCtx.sampleRate);
		this.m = 0;
		this.b = 0;
		this.x = 0;
		this.idxOffset = 0;
		this.idx = 0;

			for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){

				this.nowBuffering = this.buffer.getChannelData(this.channel);

				for(this.i=0; this.i<this.segmentArray.length; this.i++){

						if(this.i==0){
							for(this.j=0; this.j<this.durationArray[0]; this.j++){
								this.nowBuffering[this.j] = (this.j/this.segmentArray[this.i])*this.targetArray[this.i];
							}

						}

						else if(this.i!=0){
							this.idxOffset = this.segmentArray[this.i-1];

							for(this.j=0; this.j<this.durationArray[this.i]; this.j++){
								this.idx = this.idxOffset+this.j;
								this.m = this.targetArray[this.i]-this.targetArray[this.i-1];
								this.x = this.j/this.durationArray[this.i];
								this.b = this.targetArray[this.i-1];

								this.nowBuffering[this.idx] = (this.m*this.x)+this.b;

					}
				}
			}
		}

	}

}

//--------------------------------------------------------------

function PeriodicLFO(min, max, rate, rArray, iArray){

	this.output = audioCtx.createGain();

	this.min = min;
	this.max = max;
	this.range = this.max-this.min;
	this.rate = rate;
	this.rArray = rArray;
	this.iArray = iArray;

	this.constant = new BufferConstant(this.min);

	this.bG = new MyGain(this.range);
	this.aG = new MyGain(1);

	this.bG.connect(this.aG); this.constant.connect(this.aG);
	this.aG.connect(this.output);

}

PeriodicLFO.prototype = {

	output: this.output,
	buffer: this.buffer,
	rate: this.rate,
	rArray: this.rArray,
	iArray: this.iArray,
	pWave: this.pWave,
	bG: this.bG,

	start: function(){
		this.pWave = new MyPeriodicOscillator(this.rate, this.rArray, this.iArray);
		this.pWave.connect(this.bG);
		this.pWave.start();
		this.constant.start();
	},

	stop: function(){
		this.pWave.stop();
		this.constant.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.pWave = new MyPeriodicOscillator(this.rate, this.rArray, this.iArray);
		this.pWave.connect(this.bG);
		this.pWave.startAtTime(this.time);
		this.constant.startAtTime(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.pWave.stopAtTime(this.time);
		this.constant.stopAtTime(this.time);

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

// EFFECTS

//--------------------------------------------------------------

function SemiOpenPipe(length){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.length = length;
	this.lengthMultiplierArray = [1, 3, 5, 7];

	this.lengthInlet = audioCtx.createGain();

	this.filters = {};

	for(var i=0; i<4; i++){
		this.filters[i] = {filter: audioCtx.createBiquadFilter()};
		this.filters[i].filter.type = "bandpass";
		this.filters[i].filter.frequency.value = this.length*(this.lengthMultiplierArray[i]);
		this.filters[i].filter.Q.value = 30;

		this.filters[i+4] = {inletScaler: audioCtx.createGain()};
		this.filters[i+4].inletScaler.gain.value = this.lengthMultiplierArray[i];
		this.filters[i+4].inletScaler.connect(this.filters[i].filter.frequency);

		this.lengthInlet.connect(this.filters[i+4].inletScaler);
		this.input.connect(this.filters[i].filter);
		this.filters[i].filter.connect(this.output);
	}

}

SemiOpenPipe.prototype = {

	input: this.input,
	output: this.output,

	length: this.length,

	lengthInlet: this.lengthInlet,

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	}
}

//--------------------------------------------------------------

function SchwaBox(vowelPreset){

	this.vowelPreset = vowelPreset;
	this.output = audioCtx.createGain();
	this.input = audioCtx.createGain();

	this.vowelArray = ["i", "I", "E", "ae", "^", "u", "U", "&", "A"];
	this.vowelIdx = this.vowelArray.indexOf(vowelPreset);
	this.vowelOffset = this.vowelIdx*3;

	this.filterFreqArray = [
		280, 2550, 2900,
		400, 1900, 2550,
		550, 1770, 2490,
		690, 1660, 2490,
		640, 1190, 2390,
		310, 870, 2250,
		450, 1030, 2380,
		500, 1500, 2500,
		710, 1100, 2640,
	];

	this.offsetDriver = new MyOsc("triangle", 1);

	this.inputGain = audioCtx.createGain();
	this.inputGain.gain.value = 24;
	this.squareGain = audioCtx.createGain();
	this.squareGain.gain.value = 0;
	this.offsetGain = audioCtx.createGain();
	this.offsetConst = new MyWaveShaper();
	this.offsetConst.makeConstant(1);
	this.subtractionGain = audioCtx.createGain();
	this.subtractionConst = new MyWaveShaper();
	this.subtractionConst.makeConstant(-0.5);

	this.input.connect(this.inputGain);
	this.inputGain.connect(this.squareGain.gain);
	this.inputGain.connect(this.squareGain);
	this.squareGain.connect(this.offsetGain);
	this.offsetConst.connect(this.offsetGain); 	this.offsetDriver.connect(this.offsetConst);
	this.offsetGain.connect(this.subtractionGain);
	this.subtractionConst.connect(this.subtractionGain); this.offsetDriver.connect(this.subtractionConst);

	this.filters = {};

	for(var i=0; i<3; i++){
		this.filters[i] = {filter: audioCtx.createBiquadFilter()};
		this.filters[i].filter.type = "bandpass";
		this.filters[i].filter.frequency.value = this.filterFreqArray[i+this.vowelOffset];
		this.filters[i].filter.Q.value = 24;
		this.subtractionGain.connect(this.filters[i].filter);
		this.filters[i].filter.connect(this.output);
	}

	this.offsetDriver.start();

}

SchwaBox.prototype = {
	input: this.input,
	output: this.output,

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	}
}

//--------------------------------------------------------------

function DelayBank(dimensionValues, modeArray){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.dimensionValues = dimensionValues;
	this.modeArray = modeArray;
	this.delays = {};
	this.vArrays = [];
	this.sumArray = [];
	this.sV = 0;
	this.delayLength;

	this.pArray = permutations(this.modeArray, this.dimensionValues.length, true);

	for(var i=0; i<this.dimensionValues.length; i++){
		this.vArrays[i] = [];
		for(var j=0; j<this.modeArray.length; j++){
			this.vArrays[i][j] = Math.pow((this.modeArray[j]/this.dimensionValues[i]), 2);
		}
	}

	for(var i=0; i<this.pArray.length; i++){
		this.sV = 0;
			for(var j=0; j<this.pArray[i].length; j++){
				this.sV += this.vArrays[j][this.pArray[i][j]];
			}
		this.sumArray[i] = this.sV;
	}

	this.delayGain = new MyGain(1/this.pArray.length);

	for(var i=0; i<this.sumArray.length; i++){
		if(this.sumArray[i]==0){}
		else if(this.sumArray[i]!=0){
			this.delayLength = 1/(170*Math.sqrt(this.sumArray[i]));
			this.delays[i] = {delay: new MyDelay(this.delayLength, randomFloat(0, 0.7))};

			this.input.connect(this.delays[i].delay.input);
			this.delays[i].delay.connect(this.delayGain);
		}
	}

	this.delayGain.connect(this.output);
}

DelayBank.prototype = {

	input: this.input,
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

function RhythmPan(rate, quant){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.rate = rate;
	this.quant = quant;

	this.pBR = new MyBuffer(1, 1, audioCtx.sampleRate);
	this.pBR.quantizedArrayBuffer(this.quant, [0, 1]);
	this.pBR.playbackRate = this.rate;

	this.pBL = new MyBuffer(1, 1, audioCtx.sampleRate);
	this.pBL.quantizedArrayBuffer(this.quant, [0, 1]);
	this.pBL.playbackRate = this.rate;

	this.p = new MyPanner2(0);
	this.p.gainL.gain.value = 0;
	this.p.gainR.gain.value = 0;

	this.pBL.connect(this.p.gainL.gain);
	this.pBR.connect(this.p.gainR.gain);

	this.input.connect(this.p.input);
	this.p.connect(this.output);

}

RhythmPan.prototype = {

	input: this.input,
	output: this.output,
	pBR: this.pBR,
	pBL: this.pBL,

	start: function(){
		this.pBR.start();
		this.pBL.start();
	},

	stop: function(){
		this.pBR.stop();
		this.pBL.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.pBR.startAtTime(this.time);
		this.pBL.startAtTime(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.pBR.stopAtTime(this.time);
		this.pBL.stopAtTime(this.time);

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

function RevDelay(){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.delay = new MyStereoDelay(randomFloat(0.001, 0.002), randomFloat(0.003, 0.004), randomFloat(0.25, 0.4), 1);
	this.delay2 = new MyStereoDelay(randomFloat(0.001, 0.002), randomFloat(0.003, 0.004), randomFloat(0.25, 0.4), 1);

	this.input.connect(this.delay.input);
	this.input.connect(this.delay2.input);
	this.delay.connect(this.output);
	this.delay2.connect(this.output);

}

RevDelay.prototype = {

	input:this.input,
	output: this.output,
	delay: this.delay,

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

function ShaperBank(nShapers, inGainArray, outGainArray){

	this.inGainArray = inGainArray;
	this.outGainArray = outGainArray;

	this.nShapers = nShapers;

	this.onGain = {};
	this.onConstant = new BufferConstant(1);
	this.on = new MyGain(0);
	this.onFilter = new MyBiquad("lowpass", 100, 0);

	this.inGain = {};
	this.shaper = {};
	this.outGain = {};

	this.cFreqArray = [];
	this.mFreqArray = [];

	for(var i=0; i<this.nShapers; i++){

		this.onGain[i] = {gain: new MyGain(0)};

		this.inGain[i] = {gain: new MyGain(this.inGainArray[i])};
		this.shaper[i] = {shaper: new MyWaveShaper()};
		this.cFreqArray[i] = randomFloat(5.75, 8);
		this.mFreqArray[i] = randomFloat(0.15, 0.6);
		this.shaper[i].shaper.makeFm(this.cFreqArray[i], this.mFreqArray[i], 1);
		this.outGain[i] = {gain: new MyGain(this.outGainArray[i])};

		this.onConstant.connect(this.on);
		this.on.connect(this.onFilter);
		this.onGain[i].gain.connect(this.inGain[i].gain); this.onFilter.connect(this.onGain[i].gain.gain.gain);
		this.inGain[i].gain.connect(this.shaper[i].shaper);
		this.shaper[i].shaper.connect(this.outGain[i].gain);

	}

	this.onConstant.start();

}

ShaperBank.prototype = {

	outGain: this.outGain,
	shaper: this.shaper,
	on: this.on,

	nShapers: this.nShapers,

	connectOutput: function(audioNode, idx){

		var idx = idx;

		if (audioNode.hasOwnProperty('input') == 1){
			this.outGain[idx].gain.connect(audioNode.input);
		}
		else {
			this.outGain[idx].gain.connect(audioNode);
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

function OffsetSquareAM(f1, f2, d1, d2){

	this.f1 = f1;
	this.f2 = f2;
	this.d1 = d1;
	this.d2 = d2;

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.shaperOne = new MyWaveShaper();
	this.shaperTwo = new MyWaveShaper();
	this.shaperOne.makeSquare(this.d1);
	this.shaperTwo.makeSquare(this.d2);

	this.driverOne = new MyOsc("triangle", this.f1*2);
	this.driverTwo = new MyOsc("triangle", this.f2*2);
	this.smoothingFilter = new MyBiquad("lowpass", 22000, 0);

	this.negativeGain = new MyGain(-1);
	this.summationGain = new MyGain(1);
	this.amGain = new MyGain(0);

	this.driverOne.connect(this.shaperOne);
	this.driverTwo.connect(this.shaperTwo);
	this.shaperOne.connect(this.summationGain);
	this.shaperTwo.connect(this.negativeGain);
	this.negativeGain.connect(this.summationGain);
	this.summationGain.connect(this.smoothingFilter);
	this.smoothingFilter.connect(this.amGain.gain.gain);

	this.input.connect(this.amGain.input);
	this.amGain.connect(this.output);

}

OffsetSquareAM.prototype = {

	input: this.input,
	output: this.output,
	driverOne: this.driverOne,
	driverTwo: this.driverTwo,
	smoothingFilter: this.smoothingFilter,

	start: function(){
		this.driverOne.start();
		this.driverTwo.start();
	},

	stop: function(){
		this.driverOne.stop();
		this.driverTwo.stop();
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

function DelayTapLFOFeedback(){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

}

DelayTapLFOFeedback.prototype = {

	input: this.input,
	output: this.output,

	start: function(){
		this.tO.start();
		this.feedbackLFO.start();
	},

	startAtTime: function(time){

		this.time = time;

		this.tO.startAtTime(this.time);
		this.feedbackLFO.startAtTime(this.time);

	},

	presetTemplate: function(){

		this.delayL = delayL;
		this.delayR = delayR;
		this.tapRate = tapRate;
		this.dCycleRange = dCycleRange;
		this.tapSFilterFreq = tapSFilterFreq;
		this.fbLFORate = fbLFORate;
		this.fbLFORange = fbLFORange;
		this.fbSFilterFreq = fbSFilterFreq;

		this.tG = new MyGain(0);
		this.tO = new LFO(0, 1, this.tapRate);
		//
		this.tO.buffer.floatingCycleSquare(this.dCycleRange[0], this.dCycleRange[1]);
		//
		this.sFilter = new MyBiquad("lowpass", this.tapSFilterFreq, 1);
		this.feedbackLFO = new LFO(this.fbLFORange[0], this.fbLFORange[1], this.fbLFORate);
		//
		this.feedbackLFO.buffer.makeSawtooth(2);
		//
		this.fbSFilter = new MyBiquad("lowpass", this.fbSFilterFreq, 1);
		this.dly = new MyStereoDelay(this.delayL, this.delayR, 0, 1);

		this.tO.connect(this.sFilter);
		this.input.connect(this.tG.input); this.sFilter.connect(this.tG.gain.gain);
		this.feedbackLFO.connect(this.fbSFilter);
		this.tG.connect(this.dly); this.fbSFilter.connect(this.dly.feedbackGain.gain);
		this.dly.connect(this.output);

	},

	preset1: function(){

		this.delayL = 0.1;
		this.delayR = 0.1;
		this.tapRate = 0.2;
		this.dCycleRange = [0, 0.25];
		this.tapSFilterFreq = 2;
		this.fbLFORate = 0.1;
		this.fbLFORange = [0.3, 0.6];
		this.fbSFilterFreq = 10;

		this.tG = new MyGain(0);
		this.tO = new LFO(0, 1, this.tapRate);
		//
		this.tO.buffer.floatingCycleSquare(this.dCycleRange[0], this.dCycleRange[1]);
		//
		this.sFilter = new MyBiquad("lowpass", this.tapSFilterFreq, 1);
		this.feedbackLFO = new LFO(this.fbLFORange[0], this.fbLFORange[1], this.fbLFORate);
		//
		this.feedbackLFO.buffer.makeSawtooth(2);
		//
		this.fbSFilter = new MyBiquad("lowpass", this.fbSFilterFreq, 1);
		this.dly = new MyStereoDelay(this.delayL, this.delayR, 0, 1);

		this.tO.connect(this.sFilter);
		this.input.connect(this.tG.input); this.sFilter.connect(this.tG.gain.gain);
		this.feedbackLFO.connect(this.fbSFilter);
		this.tG.connect(this.dly); this.fbSFilter.connect(this.dly.feedbackGain.gain);
		this.dly.connect(this.output);

	},

	preset2: function(){

		this.delayL = 0.1;
		this.delayR = 0.1;
		this.tapRate = 0.2;
		this.dCycleRange = [0, 0.25];
		this.tapSFilterFreq = 2;
		this.fbLFORate = 0.1;
		this.fbLFORange = [0.3, 0.6];
		this.fbSFilterFreq = 10;

		this.tG = new MyGain(0);
		this.tO = new LFO(0, 1, this.tapRate);
		//
		this.tO.buffer.floatingCycleSquare(this.dCycleRange[0], this.dCycleRange[1]);
		//
		this.sFilter = new MyBiquad("lowpass", this.tapSFilterFreq, 1);
		this.feedbackLFO = new LFO(this.fbLFORange[0], this.fbLFORange[1], this.fbLFORate);
		//
		this.feedbackLFO.buffer.makeSawtooth(2);
		//
		this.fbSFilter = new MyBiquad("lowpass", this.fbSFilterFreq, 1);
		this.dly = new MyStereoDelay(this.delayL, this.delayR, 0, 1);

		this.tO.connect(this.sFilter);
		this.input.connect(this.tG.input); this.sFilter.connect(this.tG.gain.gain);
		this.feedbackLFO.connect(this.fbSFilter);
		this.tG.connect(this.dly); this.fbSFilter.connect(this.dly.feedbackGain.gain);
		this.dly.connect(this.output);

	},

	preset3: function(){

		this.delayL = 0.1;
		this.delayR = 0.1;
		this.tapRate = 0.2;
		this.dCycleRange = [0, 0.1];
		this.tapSFilterFreq = 100;
		this.fbLFORate = 2;
		this.fbLFORange = [0.3, 0.6];
		this.fbSFilterFreq = 10;

		this.tG = new MyGain(0);
		this.tO = new LFO(0, 1, this.tapRate);
		//
		this.tO.buffer.floatingCycleSquare(this.dCycleRange[0], this.dCycleRange[1]);
		//
		this.sFilter = new MyBiquad("lowpass", this.tapSFilterFreq, 1);
		this.feedbackLFO = new LFO(this.fbLFORange[0], this.fbLFORange[1], this.fbLFORate);
		//
		this.feedbackLFO.buffer.makeSawtooth(2);
		//
		this.fbSFilter = new MyBiquad("lowpass", this.fbSFilterFreq, 1);
		this.dly = new MyStereoDelay(this.delayL, this.delayR, 0, 1);

		this.tO.connect(this.sFilter);
		this.input.connect(this.tG.input); this.sFilter.connect(this.tG.gain.gain);
		this.feedbackLFO.connect(this.fbSFilter);
		this.tG.connect(this.dly); this.fbSFilter.connect(this.dly.feedbackGain.gain);
		this.dly.connect(this.output);

	},

	preset4: function(tRate, dCycleRange){

		this.delayL = 0.11;
		this.delayR = 0.1;
		this.tapRate = tRate;
		this.dCycleRange = dCycleRange;
		this.tapSFilterFreq = 10;
		this.fbLFORate = 2;
		this.fbLFORange = [0.3, 0.9];
		this.fbSFilterFreq = 10;

		this.tG = new MyGain(0);
		this.tO = new LFO(0, 1, this.tapRate);
		//
		this.tO.buffer.floatingCycleSquare(this.dCycleRange[0], this.dCycleRange[1]);
		//
		this.sFilter = new MyBiquad("lowpass", this.tapSFilterFreq, 1);
		this.feedbackLFO = new LFO(this.fbLFORange[0], this.fbLFORange[1], this.fbLFORate);
		//
		this.feedbackLFO.buffer.makeInverseSawtooth(2);
		//
		this.fbSFilter = new MyBiquad("lowpass", this.fbSFilterFreq, 1);
		this.dly = new MyStereoDelay(this.delayL, this.delayR, 0, 1);

		this.tO.connect(this.sFilter);
		this.input.connect(this.tG.input); this.sFilter.connect(this.tG.gain.gain);
		this.feedbackLFO.connect(this.fbSFilter);
		this.tG.connect(this.dly); this.fbSFilter.connect(this.dly.feedbackGain.gain);
		this.dly.connect(this.output);

	},

	preset5: function(dCycleRange){

		this.delayL = 0.3;
		this.delayR = 0.21;
		this.tapRate = 0.2;
		this.dCycleRange = dCycleRange;
		this.tapSFilterFreq = 100;
		this.fbLFORate = 1;
		this.fbLFORange = [0.3, 0.6];
		this.fbSFilterFreq = 10;

		this.tG = new MyGain(0);
		this.tO = new LFO(0, 1, this.tapRate);
		//
		this.tO.buffer.floatingCycleSquare(this.dCycleRange[0], this.dCycleRange[1]);
		//
		this.sFilter = new MyBiquad("lowpass", this.tapSFilterFreq, 1);
		this.feedbackLFO = new LFO(this.fbLFORange[0], this.fbLFORange[1], this.fbLFORate);
		//
		this.feedbackLFO.buffer.makeSawtooth(16);
		//
		this.fbSFilter = new MyBiquad("lowpass", this.fbSFilterFreq, 1);
		this.dly = new MyStereoDelay(this.delayL, this.delayR, 0, 1);

		this.tO.connect(this.sFilter);
		this.input.connect(this.tG.input); this.sFilter.connect(this.tG.gain.gain);
		this.feedbackLFO.connect(this.fbSFilter);
		this.tG.connect(this.dly); this.fbSFilter.connect(this.dly.feedbackGain.gain);
		this.dly.connect(this.output);

	},

	preset6: function(tRate, fbRate, dCycleStart, dCycleLength){

		this.delayL = 0.3;
		this.delayR = 0.21;
		this.tapRate = tRate;
		this.dCycleRange = [dCycleStart, dCycleStart+dCycleLength];
		this.tapSFilterFreq = 2;
		this.fbLFORate = 1;
		this.fbLFORange = [0.3, 0.6];
		this.fbSFilterFreq = 10;

		this.tG = new MyGain(0);
		this.tO = new LFO(0, 1, this.tapRate);
		//
		this.tO.buffer.floatingCycleSquare(this.dCycleRange[0], this.dCycleRange[1]);
		//
		this.sFilter = new MyBiquad("lowpass", this.tapSFilterFreq, 1);
		this.feedbackLFO = new LFO(this.fbLFORange[0], this.fbLFORange[1], this.fbLFORate);
		//
		this.feedbackLFO.buffer.makeSawtooth(16);
		//
		this.fbSFilter = new MyBiquad("lowpass", this.fbSFilterFreq, 1);
		this.dly = new MyStereoDelay(this.delayL, this.delayR, 0, 1);

		this.tO.connect(this.sFilter);
		this.input.connect(this.tG.input); this.sFilter.connect(this.tG.gain.gain);
		this.feedbackLFO.connect(this.fbSFilter);
		this.tG.connect(this.dly); this.fbSFilter.connect(this.dly.feedbackGain.gain);
		this.d.connect(this.output);

	},

	preset7: function(tRate, dCycleStart, dCycleLength){

		this.delayL = randomFloat(0.1, 0.3);
		this.delayR = randomFloat(0.1, 0.3);
		this.tapRate = tRate;
		this.dCycleRange = [dCycleStart, dCycleStart+dCycleLength];
		this.tapSFilterFreq = 2;
		this.fbLFORate = 1;
		this.fbLFORange = [0.3, 0.6];
		this.fbSFilterFreq = 10;

		this.tG = new MyGain(0);
		this.tO = new LFO(0, 1, this.tapRate);
		//
		this.tO.buffer.floatingCycleSquare(this.dCycleRange[0], this.dCycleRange[1]);
		//
		this.sFilter = new MyBiquad("lowpass", this.tapSFilterFreq, 1);
		this.feedbackLFO = new LFO(this.fbLFORange[0], this.fbLFORange[1], this.fbLFORate);
		//
		this.feedbackLFO.buffer.makeSawtooth(16);
		//
		this.fbSFilter = new MyBiquad("lowpass", this.fbSFilterFreq, 1);
		this.dly = new MyStereoDelay(this.delayL, this.delayR, 0, 1);

		this.tO.connect(this.sFilter);
		this.input.connect(this.tG.input); this.sFilter.connect(this.tG.gain.gain);
		this.feedbackLFO.connect(this.fbSFilter);
		this.tG.connect(this.dly); this.fbSFilter.connect(this.dly.feedbackGain.gain);
		this.dly.connect(this.output);

	},

	preset8: function(tRate, fbRate, dCycleStart, dCycleLength){

		this.delayL = randomFloat(0.005, 0.015);
		this.delayR = randomFloat(0.005, 0.015);
		this.tapRate = tRate;
		this.dCycleRange = [dCycleStart, dCycleStart+dCycleLength];
		this.tapSFilterFreq = 100;
		this.fbLFORate = fbRate;
		this.fbLFORange = [0.2, 0.4];
		this.fbSFilterFreq = 10;

		this.tG = new MyGain(0);
		this.tO = new LFO(0, 1, this.tapRate);
		//
		this.tO.buffer.floatingCycleSquare(this.dCycleRange[0], this.dCycleRange[1]);
		//
		this.sFilter = new MyBiquad("lowpass", this.tapSFilterFreq, 1);
		this.feedbackLFO = new LFO(this.fbLFORange[0], this.fbLFORange[1], this.fbLFORate);
		//
		this.feedbackLFO.buffer.makeSawtooth(2);
		//
		this.fbSFilter = new MyBiquad("lowpass", this.fbSFilterFreq, 1);
		this.dly = new MyStereoDelay(this.delayL, this.delayR, 0, 1);

		this.tO.connect(this.sFilter);
		this.input.connect(this.tG.input); this.sFilter.connect(this.tG.gain.gain);
		this.feedbackLFO.connect(this.fbSFilter);
		this.tG.connect(this.dly); this.fbSFilter.connect(this.dly.feedbackGain.gain);
		this.dly.connect(this.output);

	},

	preset9: function(tRate, fbRate, dCycleStart, dCycleLength){

		this.delayL = randomFloat(0.005, 0.015);
		this.delayR = randomFloat(0.005, 0.015);
		this.tapRate = tRate;
		this.dCycleRange = [dCycleStart, dCycleStart+dCycleLength];
		this.tapSFilterFreq = 2;
		this.fbLFORate = 0.000001;
		this.fbLFORange = [0.1, 0.3];
		this.fbSFilterFreq = 10;

		this.tG = new MyGain(0);
		this.tO = new LFO(0, 1, this.tapRate);
		//
		this.tO.buffer.floatingCycleSquare(this.dCycleRange[0], this.dCycleRange[1]);
		//
		this.sFilter = new MyBiquad("lowpass", this.tapSFilterFreq, 1);
		this.feedbackLFO = new LFO(this.fbLFORange[0], this.fbLFORange[1], this.fbLFORate);
		//
		this.feedbackLFO.buffer.makeUnipolarNoise();
		//
		this.fbSFilter = new MyBiquad("lowpass", this.fbSFilterFreq, 1);
		this.dly = new MyStereoDelay(this.delayL, this.delayR, 0, 1);

		this.tO.connect(this.sFilter);
		this.input.connect(this.tG.input); this.sFilter.connect(this.tG.gain.gain);
		this.feedbackLFO.connect(this.fbSFilter);
		this.tG.connect(this.dly); this.fbSFilter.connect(this.dly.feedbackGain.gain);
		this.dly.feedbackGain.connect(this.output);

	},

	preset10: function(tRate, fbRate, dCycleStart, dCycleLength){

		this.delayL = randomFloat(0.005, 0.015);
		this.delayR = randomFloat(0.005, 0.015);
		this.tapRate = tRate;
		this.dCycleRange = [dCycleStart, dCycleStart+dCycleLength];
		this.tapSFilterFreq = 100;
		this.fbLFORate = 0.000001;
		this.fbLFORange = [0.1, 0.2];
		this.fbSFilterFreq = 10;

		this.tG = new MyGain(0);
		this.tO = new LFO(0, 1, this.tapRate);
		//
		this.tO.buffer.floatingCycleSquare(this.dCycleRange[0], this.dCycleRange[1]);
		//
		this.sFilter = new MyBiquad("lowpass", this.tapSFilterFreq, 1);
		this.feedbackLFO = new LFO(this.fbLFORange[0], this.fbLFORange[1], this.fbLFORate);
		//
		this.feedbackLFO.buffer.makeUnipolarNoise();
		//
		this.fbSFilter = new MyBiquad("lowpass", this.fbSFilterFreq, 1);
		this.dly = new MyStereoDelay(this.delayL, this.delayR, 0, 1);

		this.f = new MyBiquad("notch", 432, 20);

		this.tO.connect(this.sFilter);
		this.input.connect(this.tG.input); this.sFilter.connect(this.tG.gain.gain);
		this.feedbackLFO.connect(this.fbSFilter);
		this.tG.connect(this.dly); this.fbSFilter.connect(this.dly.feedbackGain.gain);
		this.dly.connect(this.f);
		this.f.connect(this.output);

	},

	preset11: function(tRate, fbRate, dCycleStart, dCycleLength, tapSFilterFreq){

		this.delayL = randomFloat(0.005, 0.015);
		this.delayR = randomFloat(0.005, 0.015);
		this.tapRate = tRate;
		this.dCycleRange = [dCycleStart, dCycleStart+dCycleLength];
		this.tapSFilterFreq = tapSFilterFreq;
		this.fbLFORate = 0.000001;
		this.fbLFORange = [0.1, 0.2];
		this.fbSFilterFreq = 10;

		this.tG = new MyGain(0);
		this.tO = new LFO(0, 1, this.tapRate);
		//
		this.tO.buffer.floatingCycleSquare(this.dCycleRange[0], this.dCycleRange[1]);
		//
		this.sFilter = new MyBiquad("lowpass", this.tapSFilterFreq, 1);
		this.feedbackLFO = new LFO(this.fbLFORange[0], this.fbLFORange[1], this.fbLFORate);
		//
		this.feedbackLFO.buffer.makeUnipolarNoise();
		//
		this.fbSFilter = new MyBiquad("lowpass", this.fbSFilterFreq, 1);
		this.dly = new MyStereoDelay(this.delayL, this.delayR, 0, 1);

		this.f = new MyBiquad("notch", 432, 20);

		this.tO.connect(this.sFilter);
		this.input.connect(this.tG.input); this.sFilter.connect(this.tG.gain.gain);
		this.feedbackLFO.connect(this.fbSFilter);
		this.tG.connect(this.dly); this.fbSFilter.connect(this.dly.feedbackGain.gain);
		this.dly.connect(this.f);
		this.f.connect(this.output);

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

function SeriesFilters(typeArray, fArray, QArray){

	this.typeArray = typeArray;
	this.fArray = fArray;
	this.QArray = QArray;

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.filters = {};

	for(var i=0; i<this.typeArray.length; i++){

		this.filters[i] = {filter: new MyBiquad(this.typeArray[i], this.fArray[i], this.QArray[i])};

		if(i==0){
			this.input.connect(this.filters[i].filter.input);
		}
		else if (i>0){
			this.filters[i-1].filter.connect(this.filters[i].filter);
		}

		if(i==this.typeArray.length-1){
			this.filters[i].filter.connect(this.output);
		}

	}

}

SeriesFilters.prototype = {

	input: this.input,
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

function ParallelFilters(typeArray, fArray, QArray){

	this.typeArray = typeArray;
	this.fArray = fArray;
	this.QArray = QArray;

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.filters = {};

	for(var i=0; i<this.typeArray.length; i++){
		this.filters[i] = {filter: new MyBiquad(this.typeArray[i], this.fArray[i], this.QArray[i])};
		this.input.connect(this.filters[i].filter.input);
		this.filters[i].filter.connect(this.output);
	}

}

ParallelFilters.prototype = {

	input: this.input,
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

function PanDelay(delayLength, feedback, panVal){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.delayLength = delayLength;
	this.feedback = feedback;
	this.panVal = panVal;

	this.delay = new MyDelay(this.delayLength, this.feedback);
	this.pan = new MyPanner2(this.panVal);

	this.input.connect(this.delay.input);
	this.delay.connect(this.pan);
	this.pan.connect(this.output);

}

PanDelay.prototype = {

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

function FilterFade(initLevel){

	this.initLevel = initLevel;

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.fadeConstant = new BufferConstant(1);
	this.fadeConstantGain = new MyGain(this.initLevel);
	this.fadeConstantFilter = new MyBiquad("lowpass", 22000, 1);
	this.fadeGain = new MyGain(0);

	this.fadeConstant.connect(this.fadeConstantGain);
	this.fadeConstantGain.connect(this.fadeConstantFilter);

	this.input.connect(this.fadeGain.input); this.fadeConstantFilter.connect(this.fadeGain.gain.gain);
	this.fadeGain.connect(this.output);

	this.fadeConstant.start();

}

FilterFade.prototype = {

	input: this.input,
	output: this.output,
	fadeConstantGain: this.fadeConstantGain,
	fadeConstantFilter: this.fadeConstantFilter,

	start: function(fadeTarget, filterFreq){

		this.fadeTarget = fadeTarget;
		this.filterFreq = filterFreq;

		this.fadeConstantFilter.biquad.frequency.value = this.filterFreq;
		this.fadeConstantGain.gain.gain.value = this.fadeTarget;

	},

	startAtTime: function(fadeTarget, filterFreq, time){

		this.fadeTarget = fadeTarget;
		this.filterFreq = filterFreq;
		this.time = time;

		this.fadeConstantFilter.biquad.frequency.setValueAtTime(this.filterFreq, this.time);
		this.fadeConstantGain.gain.gain.setValueAtTime(this.fadeTarget, this.time)

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

function FilterEnvelope(type, freq, Q, eArray){

	this.type = type;
	this.freq = freq;
	this.Q = Q;
	this.eArray = eArray;

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.filter = new MyBiquad(this.type, this.freq, this.Q);
	this.envelope = new Envelope(this.eArray);

	this.input.connect(this.filter.input);
	this.filter.connect(this.output); this.envelope.connect(this.filter.biquad.frequency);

}

FilterEnvelope.prototype = {

	input: this.input,
	output: this.output,
	envelope: this.envelope,

	start: function(){
		this.envelope.start();
	},

	startAtTime: function(time){

		this.time = time;

		this.envelope.startAtTime(this.time);

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

function AmplitudeModulator(min, max, rate){

	this.min = min;
	this.max = max;
	this.rate = rate;

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.lfo = new LFO(this.min, this.max, this.rate);
	this.smoothingFilter = new MyBiquad("lowpass", 22000, 1);
	this.aG = new MyGain(0);

	this.lfo.connect(this.smoothingFilter);
	this.input.connect(this.aG.input); this.smoothingFilter.connect(this.aG.gain.gain);
	this.aG.connect(this.output);

}

AmplitudeModulator.prototype = {

	lfo: this.lfo,
	smoothingFilter: this.smoothingFilter,
	output: this.output,

	start: function(){
		this.lfo.start();
	},

	stop: function(){
		this.lfo.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.lfo.startAtTime(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.lfo.startAtTime(this.time);

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

// INSTRUMENTS

//--------------------------------------------------------------

function FmBasic(cFreq, mFreq, mGain){

	this.output = audioCtx.createGain();

	this.cFreq = cFreq;
	this.mFreq = mFreq;
	this.mGain = mGain;

	this.c = new MyOsc("sine", this.cFreq);
	this.m = new MyOsc("sine", this.mFreq);
	this.g = new MyGain(this.mGain);

}

FmBasic.prototype = {

	output: this.output,
	cFreq: this.cFreq,
	mFreq: this.mFreq,
	mGain: this.mGain,

	start: function(){
		this.c.start();
		this.m.start();

		this.m.connect(this.g);
		this.g.connect(this.c.osc.frequency);
		this.c.connect(this.output);
	},

	stop: function(){
		this.c.stop();
		this.m.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.c.start(this.time);
		this.m.start(this.time);

		this.m.connect(this.g);
		this.g.connect(this.c.osc.frequency);
		this.c.connect(this.output);

	},

	stopAtTime: function(time){

		this.time = time;

		this.c.stop(this.time);
		this.m.stop(this.time);

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

function AmBasic(cFreq, mFreq, mGain){

	this.output = audioCtx.createGain();

	this.cFreq = cFreq;
	this.mFreq = mFreq;
	this.mGain = mGain;

	this.c = new MyOsc("sine", this.cFreq);
	this.m = new MyOsc("sawtooth", this.mFreq);
	this.mG = new MyGain(this.mGain);
	this.aG = new MyGain(0);

	this.oG.connect(this.aG.gain.gain);
	this.aG.connect(this.f);

}

AmBasic.prototype = {

	output: this.output,
	c: this.c,
	m: this.m,
	cFreq: this.cFreq,
	mFreq: this.mFreq,
	mDepth: this.mDepth,

	start: function(){
		this.m.connect(this.mG);
		this.c.connect(this.aG);
		this.m.start();
		this.c.start();
	},

	stop: function(){
		this.m.stop();
		this.c.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.m.connect(this.mG);
		this.c.connect(this.aG);
		this.m.start(this.time);
		this.c.start(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.m.stop(this.time);
		this.c.stop(this.time);

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

function DX7(){

	this.output = audioCtx.createGain();

	this.ops = {};

	for(var i=0; i<6; i++){
		this.ops[i+1] = {op: new Operator()};
	}

	this.fb = audioCtx.createGain();

}

DX7.prototype = {

	output: this.output,

	ops: this.ops,
	fb: this.fb,
	fund: this.fund,

	preset0(){

		this.ops[1].op.setOp("sine", fund, 1, [1, 1, 0, 1]);
		this.ops[2].op.setOp("sine", 0, 0, [0, 0.001]);
		this.ops[3].op.setOp("sine", 0, 0, [0, 0.001]);
		this.ops[4].op.setOp("sine", 0, 0, [0, 0.001]);
		this.ops[5].op.setOp("sine", 0, 0, [0, 0.001]);
		this.ops[6].op.setOp("sine", 0, 0, [0, 0.001]);

	},

	preset1(){

		this.ops[1].op.setOp("sine", this.fund, 1, [1, 1, 0, 1]);
		this.ops[2].op.setOp("sine", this.fund, this.fund, [1, 0.001, 0, 1.9]);
		this.ops[3].op.setOp("sine", this.fund*2, 1, [1, 0.5, 0.3, 0.05, 0, 0.7]);
		this.ops[4].op.setOp("sine", this.fund*4, this.fund*0.5, [1, 0.01, 0, 1]);
		this.ops[5].op.setOp("sine", this.fund*0.462962963, this.fund*3.24074074, [1, 0.5, 1, 0.2, 0, 0.3]);
		this.ops[6].op.setOp("sine", this.fund*0.555555556, this.fund*3.24074074, [1, 0.5, 1, 0.2, 0, 0.3]);

	},

	preset2(){

		this.ops[1].op.setOp("sine", this.fund, 1, [1, 1, 0, 1]);
		this.ops[2].op.setOp("sine", this.fund, this.fund, [1, 0.001, 0, 1.9]);
		this.ops[3].op.setOp("sine", this.fund*2, 1, [1, 0.5, 0.3, 0.05, 0, 0.7]);
		this.ops[4].op.setOp("sine", this.fund*4, this.fund*0.5, [1, 0.01, 0, 1]);
		this.ops[5].op.setOp("sine", this.fund*0.462962963, 1, [1, 0.5, 1, 0.2, 0, 0.3]);
		this.ops[6].op.setOp("sine", this.fund*0.555555556, this.fund*3.24074074, [1, 0.5, 1, 0.2, 0, 0.3]);

	},

	modSwell(){

		// outOps: 3
		// algs: 7, 2, 8
		// funds: 216

		this.e1 = [1, 1, 0, 1];
		this.e2 = [1, 1, 0, 1];

		// op, type, freq, gain, env
		this.ops[1].op.setOp("sine", 0, 0, [0, 0.001]);
		this.ops[2].op.setOp("sine", 0, 0, [0, 0.001]);
		this.ops[3].op.setOp("sine", this.fund, 1, this.e1);
		this.ops[4].op.setOp("sine", this.fund*0.2, this.fund*2, this.e2);
		this.ops[5].op.setOp("sine", 0, 0, [0, 0.001]);
		this.ops[6].op.setOp("sine", 0, 0, [0, 0.001]);

	},

	alienSwell(){

		// outOps: 3
		// algs: 7, 1, 2
		// funds: 432

		this.e1 = [1, 1, 0, 0.5];
		this.e2 = [1, 0.01, 0.2, 0.75, 0.1, 1];
		this.e3 = [1, 0.01, 0.2, 0.75, 0.1, 1];

		this.ops[1].op.setOp("sine", 0, 0, [0, 0.001]);
		this.ops[2].op.setOp("sine", 0, 0, [0, 0.001]);
		this.ops[3].op.setOp("sine", this.fund, 1, this.e1);
		this.ops[4].op.setOp("sine", this.fund*0.5, this.fund*10, this.e2)
		this.ops[5].op.setOp("sine", this.fund*0.2, this.fund*15, this.e3)
		this.ops[6].op.setOp("sine", 0, 0, [0, 0.001]);

	},

	noiseTwine(){

		// outOps: 3
		// algs: 7, 8, 2
		// funds: 216

		this.e1 = [0, 0.001];
		this.e2 = [0, 0.001];
		this.e3 = [1, 1, 0, 0.5];
		this.e4 = [1, 0.01, 0.2, 0.75, 0.1, 1];
		this.e5 = [1, 0.01, 0.2, 0.75, 0.1, 1];
		this.e6 = [0.5, 1, 1, 0.1];

		this.ops[1].op.setOp("sine", 0, 0, this.e1);
		this.ops[2].op.setOp("sine", 0, 0, this.e2);
		this.ops[3].op.setOp("sine", this.fund, 1, this.e3);
		this.ops[4].op.setOp("sine", this.fund*0.5, this.fund*10, this.e4);
		this.ops[5].op.setOp("sine", this.fund*0.2, this.fund*15, this.e5);
		this.ops[6].op.setOp("sine", this.fund*0.1, this.fund*30, this.e6);

	},

	noiseToTone(){

		// outOps: 3
		// algs: 7, 8, 1, 2
		// funds: 432

		this.e1 = [1, 0.01, 0.7, 0.005, 0.3, 0.1, 0, 1];
		this.e2 = [1, 0.001, 0, 1];
		this.e3 = [1, 2, 0.25, 0.75, 0, 1.25];
		this.e4 = [1, 0.01, 0.2, 0.75, 0.1, 1];
		this.e5 = [1, 0.01, 0.2, 0.75, 0.1, 1];
		this.e6 = [1, 0.01, 0.1, 0.005, 0, 1];

		this.ops[1].op.setOp("sine", this.fund, 0, this.e1);
		this.ops[2].op.setOp("sine", this.fund*2.1, this.fund, this.e2);
		this.ops[3].op.setOp("sine", this.fund, 0.1, this.e3);
		this.ops[4].op.setOp("sine", this.fund*0.5, this.fund*10, this.e4);
		this.ops[5].op.setOp("sine", this.fund*0.2, this.fund*15, this.e5);
		this.ops[6].op.setOp("sine", this.fund*0.201, this.fund*15.01, this.e6);

	},

	a16Brass(){

		// outOps: 1
		// algs: 16
		// funds: 216

		this.e0 = [0, 0.001];
		this.e1 = [0.75, 3, 1, 8, 0, 8]; // 19
		this.e2 = [1, randomInt(4, 10), 0, randomInt(4, 12)];
		this.e3 = [1, randomInt(4, 10), 0, randomInt(4, 12)];
		this.e4 = [1, randomInt(4, 10), 0, randomInt(4, 12)];
		this.e5 = [1, randomInt(4, 10), 0, randomInt(4, 12)];
		this.e6 = [0, 16, 1, 3];

		// op, type, freq, gain, env
		this.ops[1].op.setOp("sine", this.fund, 1, this.e1);
		this.ops[2].op.setOp("sine", this.fund*1.01, this.fund*2, this.e2);
		this.ops[3].op.setOp("sine", this.fund*2, this.fund*3, this.e3);
		this.ops[4].op.setOp("sine", this.fund*0.5, this.fund*1, this.e4);
		this.ops[5].op.setOp("sine", this.fund*4.01, this.fund*4, this.e5);
		this.ops[6].op.setOp("sine", this.fund*5.17, 0, this.e6);

	},

	setTypes(typeArray){
		this.typeArray = typeArray;
		for(var i=0; i<6; i++){
			this.ops[i+1].op.setType(this.typeArray[i]);
		}
	},

	setGains(gainArray){
		this.gainArray = gainArray;
		for(var i=0; i<6; i++){
			this.ops[i+1].op.setGain(this.gainArray[i]);
		}
	},

	setFreqs(freqArray){
		this.freqArray = freqArray;
		for(var i=0; i<6; i++){
			this.ops[i+1].op.setFrequency(this.freqArray[i]);
		}
	},

	setEnvelopes(envelopeArray){
		this.envelopeArray = envelopeArray;
		for(var i=0; i<6; i++){
			this.ops[i+1].op.setEnvelope(this.envelopeArray[i]);
		}
	},

	setOp(op, type, freq, gain, envelope){

		this.op = op;
		this.type = type;
		this.freq = freq;
		this.gain = gain;
		this.envelope = envelope;

		this.ops[op].op.setOp(this.type, this.freq, this.gain, this.envelope);

	},

	a1: function(){

		this.output.gain.value = 0.5;

		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);
		this.ops[5].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[4].op.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[3].op.connect(this.output);

	},

	a2: function(){

		this.output.gain.value = 0.5;

		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);
		this.ops[5].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[4].op.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[2].op.connect(this.fb);
		this.fb.connect(this.ops[2].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[3].op.connect(this.output);

	},

	a3: function(){

		this.output.gain.value = 0.5;

		this.ops[3].op.connect(this.ops[2].op.osc.frequencyInlet);
		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);
		this.ops[5].op.connect(this.ops[4].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[4].op.connect(this.output);

	},

	a4: function(){

		this.output.gain.value = 0.5;

		this.ops[3].op.connect(this.ops[2].op.osc.frequencyInlet);
		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);
		this.ops[5].op.connect(this.ops[4].op.osc.frequencyInlet);

		this.ops[4].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[4].op.connect(this.output);

	},

	a5: function(){

		this.output.gain.value = 0.33;

		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);
		this.ops[4].op.connect(this.ops[3].op.osc.frequencyInlet);
		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[3].op.connect(this.output);
		this.ops[5].op.connect(this.output);

	},

	a6: function(){

		this.output.gain.value = 0.33;

		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[4].op.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);

		this.ops[5].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[3].op.connect(this.output);
		this.ops[5].op.connect(this.output);

	},

	a7: function(){

		this.output.gain.value = 0.5;

		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[4].op.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);
		this.ops[5].op.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[3].op.connect(this.output);

	},

	a8: function(){

		this.output.gain.value = 0.5;

		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[4].op.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);
		this.ops[5].op.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[4].op.connect(this.fb);
		this.fb.connect(this.ops[4].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[3].op.connect(this.output);

	},

	a9: function(){

		this.output.gain.value = 0.5;

		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[4].op.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);
		this.ops[5].op.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[2].op.connect(this.fb);
		this.fb.connect(this.ops[2].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[3].op.connect(this.output);

	},

	a10: function(){

		this.output.gain.value = 0.5;

		this.ops[3].op.connect(this.ops[2].op.osc.frequencyInlet);
		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[5].op.connect(this.ops[4].op.osc.frequencyInlet);

		this.ops[3].op.connect(this.fb);
		this.fb.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[4].op.connect(this.output);

	},

	a11: function(){

		this.output.gain.value = 0.5;

		this.ops[3].op.connect(this.ops[2].op.osc.frequencyInlet);
		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[5].op.connect(this.ops[4].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[4].op.connect(this.output);

	},

	a12: function(){

		this.output.gain.value = 0.5;

		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[4].op.connect(this.ops[3].op.osc.frequencyInlet);
		this.ops[5].op.connect(this.ops[3].op.osc.frequencyInlet);
		this.ops[6].op.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[2].op.connect(this.fb);
		this.fb.connect(this.ops[2].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[3].op.connect(this.output);

	},

	a13: function(){

		this.output.gain.value = 0.5;

		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[4].op.connect(this.ops[3].op.osc.frequencyInlet);
		this.ops[5].op.connect(this.ops[3].op.osc.frequencyInlet);
		this.ops[6].op.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[3].op.connect(this.output);

	},

	a14: function(){

		this.output.gain.value = 0.5;

		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[4].op.connect(this.ops[3].op.osc.frequencyInlet);
		this.ops[5].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[6].op.connect(this.ops[4].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[3].op.connect(this.output);

	},

	a15: function(){

		this.output.gain.value = 0.5;

		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[4].op.connect(this.ops[3].op.osc.frequencyInlet);
		this.ops[5].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[6].op.connect(this.ops[4].op.osc.frequencyInlet);

		this.ops[2].op.connect(this.fb);
		this.fb.connect(this.ops[2].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[3].op.connect(this.output);

	},

	a16: function(){

		this.output.gain.value = 1;

		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[4].op.connect(this.ops[3].op.osc.frequencyInlet);
		this.ops[3].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);
		this.ops[5].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);

	},

	a17: function(){

		this.output.gain.value = 1;

		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[4].op.connect(this.ops[3].op.osc.frequencyInlet);
		this.ops[3].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);
		this.ops[5].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[2].op.connect(this.fb);
		this.fb.connect(this.ops[2].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);

	},

	a18: function(){

		this.output.gain.value = 1;

		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[3].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);
		this.ops[5].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[4].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[3].op.connect(this.fb);
		this.fb.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);

	},

	a19: function(){

		this.output.gain.value = 0.33;

		this.ops[3].op.connect(this.ops[2].op.osc.frequencyInlet);
		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[4].op.connect(this.output);
		this.ops[5].op.connect(this.output);

	},

	a20: function(){

		this.output.gain.value = 0.33;

		this.ops[3].op.connect(this.ops[2].op.osc.frequencyInlet);
		this.ops[3].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[5].op.connect(this.ops[4].op.osc.frequencyInlet);

		this.ops[3].op.connect(this.fb);
		this.fb.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[2].op.connect(this.output);
		this.ops[4].op.connect(this.output);

	},

	a21: function(){

		this.output.gain.value = 0.25;

		this.ops[3].op.connect(this.ops[2].op.osc.frequencyInlet);
		this.ops[3].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);

		this.ops[3].op.connect(this.fb);
		this.fb.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[2].op.connect(this.output);
		this.ops[4].op.connect(this.output);
		this.ops[5].op.connect(this.output);

	},

	a22: function(){

		this.output.gain.value = 0.25;

		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[3].op.osc.frequencyInlet);
		this.ops[6].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[3].op.connect(this.output);
		this.ops[4].op.connect(this.output);
		this.ops[5].op.connect(this.output);

	},

	a23: function(){

		this.output.gain.value = 0.25;

		this.ops[3].op.connect(this.ops[2].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[3].op.connect(this.output);
		this.ops[4].op.connect(this.output);
		this.ops[5].op.connect(this.output);

	},

	a24: function(){

		this.output.gain.value = 0.2;

		this.ops[6].op.connect(this.ops[3].op.osc.frequencyInlet);
		this.ops[6].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[2].op.connect(this.output);
		this.ops[3].op.connect(this.output);
		this.ops[4].op.connect(this.output);
		this.ops[5].op.connect(this.output);

	},

	a25: function(){

		this.output.gain.value = 0.2;

		this.ops[6].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[2].op.connect(this.output);
		this.ops[3].op.connect(this.output);
		this.ops[4].op.connect(this.output);
		this.ops[5].op.connect(this.output);

	},

	a26: function(){

		this.output.gain.value = 0.33;

		this.ops[5].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[6].op.connect(this.ops[4].op.osc.frequencyInlet);

		this.ops[3].op.connect(this.ops[2].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[2].op.connect(this.output);
		this.ops[4].op.connect(this.output);

	},

	a27: function(){

		this.output.gain.value = 0.33;

		this.ops[5].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[6].op.connect(this.ops[4].op.osc.frequencyInlet);

		this.ops[3].op.connect(this.ops[2].op.osc.frequencyInlet);

		this.ops[3].op.connect(this.fb);
		this.fb.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[2].op.connect(this.output);
		this.ops[4].op.connect(this.output);

	},

	a28: function(){

		this.output.gain.value = 0.33;

		this.ops[5].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[4].op.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[2].op.connect(this.ops[1].op.osc.frequencyInlet);

		this.ops[5].op.connect(this.fb);
		this.fb.connect(this.ops[5].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[3].op.connect(this.output);
		this.ops[6].op.connect(this.output);

	},

	a29: function(){

		this.output.gain.value = 0.25;

		this.ops[4].op.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[2].op.connect(this.output);
		this.ops[3].op.connect(this.output);
		this.ops[5].op.connect(this.output);

	},

	a30: function(){

		this.output.gain.value = 0.25;

		this.ops[5].op.connect(this.ops[4].op.osc.frequencyInlet);
		this.ops[4].op.connect(this.ops[3].op.osc.frequencyInlet);

		this.ops[5].op.connect(this.fb);
		this.fb.connect(this.ops[5].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[2].op.connect(this.output);
		this.ops[3].op.connect(this.output);
		this.ops[6].op.connect(this.output);

	},

	a31: function(){

		this.output.gain.value = 0.2;

		this.ops[6].op.connect(this.ops[5].op.osc.frequencyInlet);

		this.ops[6].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[2].op.connect(this.output);
		this.ops[3].op.connect(this.output);
		this.ops[4].op.connect(this.output);
		this.ops[5].op.connect(this.output);

	},

	a32: function(){

		this.output.gain.value = 0.166;

		this.ops[6].op.connect(this.fb);
		this.fb.connect(this.ops[6].op.osc.frequencyInlet);

		this.ops[1].op.connect(this.output);
		this.ops[2].op.connect(this.output);
		this.ops[3].op.connect(this.output);
		this.ops[4].op.connect(this.output);
		this.ops[5].op.connect(this.output);
		this.ops[6].op.connect(this.output);

	},

	start: function(){

		for(var i=0; i<6; i++){
			this.ops[i+1].op.start();
		}

	},

	stop: function(){

		for(var i=0; i<6; i++){
			this.ops[i+1].op.stop();
			this.ops[i+1].op.output.disconnect();
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

function Operator(){

	this.output = audioCtx.createGain();

	this.osc = new MyOsc("sine", 0);
	this.osc.start();
	this.eG = new MyGain(0);
	this.gain = new MyGain(0);

}

Operator.prototype = {

	output: this.output,
	type: this.type,
	frequency: this.frequency,
	eArray: this.eArray,
	gainVal: this.gainVal,

	osc: this.osc,
	envelope: this.envelope,
	eG: this.eG,
	gain: this.gain,

	setOp(type, freq, gainVal, eArray){

		this.type = type;
		this.freq = freq;
		this.gainVal = gainVal;
		this.eArray = eArray;

		this.osc.osc.type = this.type;
		this.osc.osc.frequency.value = this.freq;
		this.gain.gain.gain.value = this.gainVal;
		this.envelope = new Envelope(this.eArray);
		this.envelope.connect(this.eG.gain.gain);

		this.osc.connect(this.eG); this.envelope.connect(this.eG.gain.gain);
		this.eG.connect(this.gain);
		this.gain.connect(this.output);

	},

	setFrequency(freq){
		this.osc.osc.frequency.value = freq;
	},

	setGain(gainVal){
		this.gain.gain.gain.value = gainVal;
	},

	setType(type){
		this.osc.osc.type = type;
	},

	setEnvelope(eArray){
		this.envelope.output.disconnect();
		this.envelope = new Envelope(eArray);
		this.envelope.connect(this.eG.gain.gain);
	},

	start: function(){
		this.envelope.start();
	},

	stop: function(){
		this.envelope.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.envelope.startAtTime(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.envelope.stopAtTime(this.time);

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

function ExpOperator(){

	this.output = audioCtx.createGain();

	this.osc = new MyOsc("sine", 0);
	this.osc.start();
	this.eG = new MyGain(0);
	this.gain = new MyGain(0);

}

ExpOperator.prototype = {

	output: this.output,
	type: this.type,
	frequency: this.frequency,
	eArray: this.eArray,
	expArray: this.expArray,
	gainVal: this.gainVal,

	osc: this.osc,
	envelope: this.envelope,
	eG: this.eG,
	gain: this.gain,
	output: this.output,

	setOp(type, freq, gainVal, eArray, expArray){

		this.type = type;
		this.freq = freq;
		this.gainVal = gainVal;
		this.eArray = eArray;
		this.expArray = expArray;

		this.osc.osc.type = this.type;
		this.osc.osc.frequency.value = this.freq;
		this.gain.gain.gain.value = this.gainVal;
		this.envelope = new ExpEnvelope(this.eArray, this.expArray);
		this.envelope.connect(this.eG.gain.gain);

		this.osc.connect(this.eG); this.envelope.connect(this.eG.gain.gain);
		this.eG.connect(this.gain);
		this.gain.connect(this.output);

	},

	setFrequency(freq){
		this.osc.osc.frequency.value = freq;
	},

	setGain(gainVal){
		this.gain.gain.gain.value = gainVal;
	},

	setType(type){
		this.osc.osc.type = type;
	},

	setEnvelope(eArray, expArray){

		this.eArray = eArray;
		this.expArray = expArray;

		this.envelope.output.disconnect();
		this.envelope = new ExpEnvelope(this.eArray, this.expArray);
		this.envelope.connect(this.eG.gain.gain);

	},

	start: function(){
		this.envelope.start();
	},

	stop: function(){
		this.envelope.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.envelope.startAtTime(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.envelope.stopAtTime(this.time);

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

function NoiseTone(freq, Q){

	this.freq = freq;
	this.Q = Q;

	this.output = audioCtx.createGain();

	this.noise = new BufferNoise();
	this.filter = new MyBiquad("bandpass", this.freq, this.Q);

	this.noise.connect(this.filter);
	this.filter.connect(this.output);

}

NoiseTone.prototype = {

	output: this.output,
	noise: this.noise,
	filter: this.filter,

	start: function(){
		this.noise.start();
	},

	stop: function(){
		this.noise.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.noise.startAtTime(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.noise.stopAtTime(this.time);

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

function ShaperSynth(){

	this.output = audioCtx.createGain();

	this.op = new Operator();

	this.op.connect(this.output);
	this.waveShaper = new MyWaveShaper();

	this.op.connect(this.waveShaper);
	this.waveShaper.connect(this.output);

}

ShaperSynth.prototype = {

	output: this.output,
	op: this.op,
	waveShaper: this.waveShaper,

	prBassSynth: function(){

		var type = "sine";
		var fund = 43.2;
		var gain = 0.05;
		var envelope = [1, 0, 0.1, 2, 0, 1];
		var cFreq = 43.2;
		var mFreq = 43.2;
		var mGain = 1;

		this.op.setOp(type, fund, gain, envelope);
		this.waveShaper.makeAm(cFreq, mFreq, mGain);

	},

	preset2: function(fund){

		var type = "sine";
		var fund = fund;
		var gain = 0.05;
		var envelope = [1, 1, 0, 1];
		var cFreq = fund*2;
		var mFreq = fund*1.1;
		var mGain = 1;

		this.op.setOp(type, fund, gain, envelope);
		this.waveShaper.makeAm(cFreq, mFreq, mGain);

	},

	amShape: function(type, fund, gain, envelope, cFreq, mFreq, mGain){

		var type = type;
		var fund = fund;
		var gain = gain;
		var envelope = envelope;
		var cFreq = cFreq;
		var mFreq = mFreq;
		var mGain = mGain;

		this.op.setOp(type, fund, gain, envelope);
		this.waveShaper.makeAm(cFreq, mFreq, mGain);

	},

	fmShape: function(type, fund, gain, envelope, cFreq, mFreq, mGain){

		var type = type;
		var fund = fund;
		var gain = gain;
		var envelope = envelope;
		var cFreq = cFreq;
		var mFreq = mFreq;
		var mGain = mGain;

		this.op.setOp(type, fund, gain, envelope);
		this.waveShaper.makeFm(cFreq, mFreq, mGain);

	},

	startAtTime: function(time, frequency){

		this.time = time;
		this.frequency = frequency;

		this.op.osc.osc.frequency.setValueAtTime(this.frequency, this.time);
		this.op.startAtTime(this.time);


	},

	stopAtTime: function(time){

		this.time = time;

		this.op.stopAtTime(this.time);

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

function MiniMoog(){

	this.output = audioCtx.createGain();

	this.osc1 = new MyOsc("sine", 0);
	this.osc2 = new MyOsc("sine", 0);
	this.osc3 = new MyOsc("sine", 0);
	this.noise = new BufferNoise();

	this.octave1=1;
	this.octave2=1;
	this.octave3=1;

	this.gain1 = new MyGain(1);
	this.gain2 = new MyGain(0);
	this.gain3 = new MyGain(0);
	this.noiseGain = new MyGain(0);

	this.amplitudeEnvelope = new Envelope([0, 1]);
	this.amplitudeAttack=1;
	this.amplitudeDecay=1;
	this.amplitudeSustain = 1;
	this.amplitudeSustainLevel=0.5;

	this.filterEnvelope = new Envelope([0, 1]);
	this.filterAttack=1;
	this.filterAttackTarget=22000;
	this.filterDecay=1;
	this.filterSustain = 2000;
	this.filterSustainLevel=22000;

	this.filter = new MyBiquad("lowpass", 0, 0);

	this.amplitudeGain = new MyGain(0);

	this.osc1.connect(this.gain1);
	this.osc2.connect(this.gain2);
	this.osc3.connect(this.gain3);
	this.noise.connect(this.noiseGain);

	this.gain1.connect(this.filter);
	this.gain2.connect(this.filter);
	this.gain3.connect(this.filter);
	this.noiseGain.connect(this.filter); this.filterEnvelope.connect(this.filter.biquad.frequency);

	this.filter.connect(this.amplitudeGain);

	this.amplitudeGain.connect(this.output);

}

MiniMoog.prototype = {

	output: this.output,

	osc1: this.osc1,
	osc2: this.osc2,
	osc3: this.osc3,
	noise: this.noise,

	octave1: this.octave1,
	octave2: this.octave2,
	octave3: this.octave3,

	gain1: this.gain1,
	gain2: this.gain2,
	gain3: this.gain3,
	noiseGain: this.noiseGain,

	amplitudeEnvelope: this.amplitudeEnvelope,
	amplitudeAttack: this.amplitudeAttack,
	amplitudeDecay: this.amplitudeDecay,
	amplitudeSustain: this.amplitudeSustain,
	amplitudeSustainLevel: this.amplitudeSustainLevel,

	filterEnvelope: this.filterEnvelope,
	filterAttack: this.filterAttack,
	filterAttackTarget: this.filterAttackTarget,
	filterDecay: this.filterDecay,
	filterSustain: this.filterSustain,
	filterSustainLevel: this.filterSustainLevel,

	filter: this.filter,

	amplitudeGain: this.amplitudeGain,

playLoopAtTime: function(freq, time){

		this.freq = freq;
		this.time = time;

		this.amplitudeEnvelope.loop = true;
		this.filterEnvelope.loop = true;

		this.amplitudeEnvelope.connect(this.amplitudeGain.gain.gain);
		this.filterEnvelope.connect(this.filter.biquad.frequency);

		this.osc1.osc.frequency.setValueAtTime(this.freq*this.octave1, this.time);
		this.osc2.osc.frequency.setValueAtTime(this.freq*this.octave2, this.time);
		this.osc3.osc.frequency.setValueAtTime(this.freq*this.octave3, this.time);

		this.amplitudeEnvelope.startAtTime(this.time);
		this.filterEnvelope.startAtTime(this.time);


	},

	playAtTime: function(freq, time){

		this.freq = freq;
		this.time = time;

		this.amplitudeEnvelope.connect(this.amplitudeGain.gain.gain);
		this.filterEnvelope.connect(this.filter.biquad.frequency);

		this.osc1.osc.frequency.setValueAtTime(this.freq*this.octave1, this.time);
		this.osc2.osc.frequency.setValueAtTime(this.freq*this.octave2, this.time);
		this.osc3.osc.frequency.setValueAtTime(this.freq*this.octave3, this.time);

		this.amplitudeEnvelope.startAtTime(this.time);
		this.filterEnvelope.startAtTime(this.time);

	},


	stop: function(){

		this.osc1.stop();
		this.osc2.stop();
		this.osc3.stop();

	},

	stopAtTime: function(time){

		this.time = time;

		this.osc1.stopAtTime(this.time);
		this.osc2.stopAtTime(this.time);
		this.osc3.stopAtTime(this.time);

	},

	presetTemplate: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 1;

		this.osc1.osc.type = "sawtooth";
		this.osc2.osc.type = "sine";
		this.osc3.osc.type = "sine";

		this.gain1.gain.gain.value = 1;
		this.gain2.gain.gain.value = 0;
		this.gain3.gain.gain.value = 0;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=22000;
		this.filter.biquad.Q.value = 0;
		this.filterAttack=1;
		this.filterDecay=1;
		this.filterSustainLevel=1*this.filterAttackTarget;
		this.filterSustain = 1;

		this.amplitudeAttack=1;
		this.amplitudeDecay=1;
		this.amplitudeSustainLevel=0.5;
		this.amplitudeSustain = 1;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trSteelDrum: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 1;
		this.octave2 = 2;
		this.octave3 = 0.5;

		this.osc1.osc.type = "triangle";
		this.osc2.osc.type = "triangle";
		this.osc3.osc.type = "triangle";

		this.osc2.osc.detune.value = 300;
		this.osc3.osc.detune.value = 350;

		this.gain1.gain.gain.value = 0.8;
		this.gain2.gain.gain.value = 0.8;
		this.gain3.gain.gain.value = 0;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=80;
		this.filter.biquad.Q.value = 0;
		this.filterAttack=0.001;
		this.filterDecay=0.8;
		this.filterSustainLevel=0*this.filterAttackTarget;
		this.filterSustain = 0;

		this.amplitudeAttack=0.001;
		this.amplitudeDecay=0.4;
		this.amplitudeSustainLevel=0.6;
		this.amplitudeSustain = 1;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trThunder: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 1;

		this.osc1.osc.type = "sawtooth";
		this.osc2.osc.type = "sine";
		this.osc3.osc.type = "sine";

		this.gain1.gain.gain.value = 0;
		this.gain2.gain.gain.value = 0;
		this.gain3.gain.gain.value = 0;
		this.noiseGain.gain.gain.value = 0.8;

		this.filterAttackTarget=155;
		this.filter.biquad.Q.value = 0;
		this.filterAttack=0.001;
		this.filterDecay=0.8;
		this.filterSustainLevel=0*this.filterAttackTarget;
		this.filterSustain = 0;

		this.amplitudeAttack=0.001;
		this.amplitudeDecay=5;
		this.amplitudeSustainLevel=0;
		this.amplitudeSustain = 0;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trSurf: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 1;

		this.osc1.osc.type = "sawtooth";
		this.osc2.osc.type = "sine";
		this.osc3.osc.type = "sine";

		this.gain1.gain.gain.value = 0;
		this.gain2.gain.gain.value = 0;
		this.gain3.gain.gain.value = 0;
		this.noiseGain.gain.gain.value = 0.8;

		this.filterAttackTarget=290;
		this.filter.biquad.Q.value = 0;
		this.filterAttack=3;
		this.filterDecay=1;
		this.filterSustainLevel=0.2*this.filterAttackTarget;
		this.filterSustain = 1;

		this.amplitudeAttack=0.8;
		this.amplitudeDecay=3;
		this.amplitudeSustainLevel=0;
		this.amplitudeSustain = 0;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trMoonChord: function(){

		// nice around 224Hz

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 1;

		this.osc1.osc.type = "square";
		this.osc2.osc.type = "sawtooth";
		this.osc3.osc.type = "square";

		this.osc3.osc.detune.value = 500;

		this.gain1.gain.gain.value = 0.3;
		this.gain2.gain.gain.value = 0.6;
		this.gain3.gain.gain.value = 0.3;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=540;
		this.filter.biquad.Q.value = 7;
		this.filterAttack=0.6;
		this.filterDecay=0.6;
		this.filterSustainLevel=0.5*this.filterAttackTarget;
		this.filterSustain = 1;

		this.amplitudeAttack=0.0005;
		this.amplitudeDecay=2;
		this.amplitudeSustainLevel=1;
		this.amplitudeSustain = 1;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trGoom: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 1;

		this.osc1.osc.type = "square";
		this.osc2.osc.type = "square";
		this.osc3.osc.type = "square";

		this.gain1.gain.gain.value = 0.6;
		this.gain2.gain.gain.value = 0.6;
		this.gain3.gain.gain.value = 0.6;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=400;
		this.filter.biquad.Q.value = 0;
		this.filterAttack=0.0005;
		this.filterDecay=0.8;
		this.filterSustainLevel=0.8*this.filterAttackTarget;
		this.filterSustain = 1;

		this.amplitudeAttack=0.01;
		this.amplitudeDecay=1;
		this.amplitudeSustainLevel=0.5;
		this.amplitudeSustain = 1;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},


	trGoodSound: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 1;
		this.octave2 = 2;
		this.octave3 = 4;

		this.osc2.osc.detune.value = 300;
		this.osc3.osc.detune.value = 600;

		this.osc1.osc.type = "sawtooth";
		this.osc2.osc.type = "square";
		this.osc3.osc.type = "sawtooth";

		this.gain1.gain.gain.value = 0.5;
		this.gain2.gain.gain.value = 0.5;
		this.gain3.gain.gain.value = 0.5;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=123;
		this.filter.biquad.Q.value=3;
		this.filterAttack=0.0005;
		this.filterDecay=0.2;
		this.filterSustainLevel=0.5*this.filterAttackTarget;
		this.filterSustain = 1;

		this.amplitudeAttack=0.0005;
		this.amplitudeDecay=0.6;
		this.amplitudeSustainLevel=0.5;
		this.amplitudeSustain = 1;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trFatBass: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 0.25;
		this.octave2 = 0.5;
		this.octave3 = 0.5;

		this.osc1.osc.type = "sawtooth";
		this.osc2.osc.type = "sawtooth";
		this.osc3.osc.type = "sawtooth";

		this.gain1.gain.gain.value = 1;
		this.gain2.gain.gain.value = 1;
		this.gain3.gain.gain.value = 1;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=300;
		this.filter.biquad.Q.value = 5;
		this.filterAttack=0.0005;
		this.filterDecay=0.3;
		this.filterSustainLevel=0*this.filterAttackTarget;
		this.filterSustain = 0;

		this.amplitudeAttack=0.0005;
		this.amplitudeDecay=0.6;
		this.amplitudeSustainLevel=0.5;
		this.amplitudeSustain = 0;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trTrilogy: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 0.5;
		this.octave2 = 4;
		this.octave3 = 0.5;

		this.osc1.osc.type = "square";
		this.osc2.osc.type = "square";
		this.osc3.osc.type = "square";

		this.gain1.gain.gain.value = 0.2;
		this.gain2.gain.gain.value = 0.8;
		this.gain3.gain.gain.value = 0.2;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=530;
		this.filter.biquad.Q.value = 6;
		this.filterAttack=0.0005;
		this.filterDecay=0.8;
		this.filterSustainLevel=0*this.filterAttackTarget;
		this.filterSustain = 0;

		this.amplitudeAttack=0.0005;
		this.amplitudeDecay=0.4;
		this.amplitudeSustainLevel=1;
		this.amplitudeSustain = 1;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trBassDrum: function(){

		// cool at 224

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 1;

		this.osc2.osc.detune.value = -200;
		this.osc3.osc.detune.value = -500;

		this.osc1.osc.type = "sawtooth";
		this.osc2.osc.type = "sawtooth";
		this.osc3.osc.type = "sawtooth";

		this.gain1.gain.gain.value = 0.8;
		this.gain2.gain.gain.value = 0.8;
		this.gain3.gain.gain.value = 0.8;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=80;
		this.filter.biquad.Q.value = 0;
		this.filterAttack=0.001;
		this.filterDecay=0.6;
		this.filterSustainLevel=0*this.filterAttackTarget;
		this.filterSustain = 0;

		this.amplitudeAttack=0.001;
		this.amplitudeDecay=0.8;
		this.amplitudeSustainLevel=0;
		this.amplitudeSustain = 0;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trTuba: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 1;

		this.osc1.osc.type = "sawtooth";
		this.osc2.osc.type = "sine";
		this.osc3.osc.type = "sine";

		this.gain1.gain.gain.value = 1;
		this.gain2.gain.gain.value = 0;
		this.gain3.gain.gain.value = 0;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=155;
		this.filter.biquad.Q.value = 0;
		this.filterAttack=0.4;
		this.filterDecay=0.4;
		this.filterSustainLevel=0.8*this.filterAttackTarget;
		this.filterSustain = 1;

		this.amplitudeAttack=0.2;
		this.amplitudeDecay=0.35;
		this.amplitudeSustainLevel=0.7;
		this.amplitudeSustain = 1;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trHarpsichord: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 1;

		this.osc1.osc.type = "sawtooth";
		this.osc2.osc.type = "square";
		this.osc3.osc.type = "sine";

		this.gain1.gain.gain.value = 0.3;
		this.gain2.gain.gain.value = 0.5;
		this.gain3.gain.gain.value = 0;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=20000;
		this.filter.biquad.Q.value = 7;
		this.filterAttack=0.0005;
		this.filterDecay=0.3;
		this.filterSustainLevel=1*this.filterAttackTarget;
		this.filterSustain = 0;

		this.amplitudeAttack=0.0005;
		this.amplitudeDecay=0.3;
		this.amplitudeSustainLevel=0;
		this.amplitudeSustain = 0;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trAquatarkus: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 1;

		this.osc2.osc.detune.value = 400;
		this.osc3.osc.detune.value = 700;

		this.osc1.osc.type = "sawtooth";
		this.osc2.osc.type = "sawtooth";
		this.osc3.osc.type = "sawtooth";

		this.gain1.gain.gain.value = 0.8;
		this.gain2.gain.gain.value = 0.8;
		this.gain3.gain.gain.value = 0.8;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=123.7;
		this.filter.biquad.Q.value = 6;
		this.filterAttack=0.01;
		this.filterDecay=0.2;
		this.filterSustainLevel=0.5*this.filterAttackTarget;
		this.filterSustain = 1;

		this.amplitudeAttack=0;
		this.amplitudeDecay=0.4;
		this.amplitudeSustainLevel=0.3;
		this.amplitudeSustain = 1;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trSteelDrum: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 4;
		this.octave2 = 4;
		this.octave3 = 0.5;

		this.osc3.osc.detune.value = 700;

		this.osc1.osc.type = "triangle";
		this.osc2.osc.type = "triangle";
		this.osc3.osc.type = "triangle";

		this.gain1.gain.gain.value = 0.8;
		this.gain2.gain.gain.value = 0.8;
		this.gain3.gain.gain.value = 0.4;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=300;
		this.filter.biquad.Q.value = 5;
		this.filterAttack=0.0005;
		this.filterDecay=0.4;
		this.filterSustainLevel=0*this.filterAttackTarget;
		this.filterSustain = 0;

		this.amplitudeAttack=0.0005;
		this.amplitudeDecay=0.4;
		this.amplitudeSustainLevel=1;
		this.amplitudeSustain = 0;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	myBlock: function(){

		// very nice at 280Hz - much like the attack of the Ben Babbitt
		// Dark Rum Noir block

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 4;
		this.octave2 = 4;
		this.octave3 = 0.5;

		this.osc3.osc.detune.value = 700;

		this.osc1.osc.type = "sawtooth";
		this.osc2.osc.type = "sawtooth";
		this.osc3.osc.type = "sawtooth";

		this.gain1.gain.gain.value = 1;
		this.gain2.gain.gain.value = 1;
		this.gain3.gain.gain.value = 0;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=300;
		this.filter.biquad.Q.value = 5;
		this.filterAttack=0.001;
		this.filterDecay=0.01;
		this.filterSustainLevel=0*this.filterAttackTarget;
		this.filterSustain = 0;

		this.amplitudeAttack=0.001;
		this.amplitudeDecay=0.4;
		this.amplitudeSustainLevel=1;
		this.amplitudeSustain = 0;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trCatherineOfAragon: function(){

		// very very nice bass (really nice quality around 280Hz and 140Hz)

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 0.25;
		this.octave2 = 0.5;
		this.octave3 = 1;

		this.osc1.osc.type = "sawtooth";
		this.osc2.osc.type = "sawtooth";
		this.osc3.osc.type = "sine";

		this.gain1.gain.gain.value = 0.6;
		this.gain2.gain.gain.value = 0.6;
		this.gain3.gain.gain.value = 0;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=159.92;
		this.filter.biquad.Q.value = 6.8;
		this.filterAttack=0.0005;
		this.filterDecay=0.8;
		this.filterSustainLevel=0*this.filterAttackTarget;
		this.filterSustain = 0;

		this.amplitudeAttack=0.0005;
		this.amplitudeDecay=1;
		this.amplitudeSustainLevel=0;
		this.amplitudeSustain = 0;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trCoALongDecay: function(){

		// very very nice bass (really nice quality around 280Hz and 140Hz)

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 0.25;
		this.octave2 = 0.5;
		this.octave3 = 1;

		this.osc1.osc.type = "sawtooth";
		this.osc2.osc.type = "sawtooth";
		this.osc3.osc.type = "sine";

		this.gain1.gain.gain.value = 0.6;
		this.gain2.gain.gain.value = 0.6;
		this.gain3.gain.gain.value = 0;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=159.92;
		this.filter.biquad.Q.value = 6.8;
		this.filterAttack=0.0005;
		this.filterDecay=0.8;
		this.filterSustainLevel=0.5*this.filterAttackTarget;
		this.filterSustain = 0;

		this.amplitudeAttack=0.0005;
		this.amplitudeDecay=20;
		this.amplitudeSustainLevel=0.1;
		this.amplitudeSustain = 0;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trHommageABadings: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 2;

		this.osc1.osc.type = "triangle";
		this.osc2.osc.type = "triangle";
		this.osc3.osc.type = "triangle";

		this.osc2.osc.detune.value = 300;
		this.osc3.osc.detune.value = -300;

		this.gain1.gain.gain.value = 0.8;
		this.gain2.gain.gain.value = 0.8;
		this.gain3.gain.gain.value = 0.8;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=40;
		this.filter.biquad.Q.value = 0;
		this.filterAttack=0.4;
		this.filterDecay=0.7;
		this.filterSustainLevel=1*this.filterAttackTarget;
		this.filterSustain = 1;

		this.amplitudeAttack=0.4;
		this.amplitudeDecay=0.7;
		this.amplitudeSustainLevel=0.5;
		this.amplitudeSustain = 1;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trRingModulatorEffects: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 0.25;

		this.osc1.osc.type = "square";
		this.osc2.osc.type = "sine";
		this.osc3.osc.type = "square";

		this.gain1.gain.gain.value = 0.8;
		this.gain2.gain.gain.value = 0;
		this.gain3.gain.gain.value = 0;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=40;
		this.filter.biquad.Q.value = 0;
		this.filterAttack=0.2;
		this.filterDecay=0.7;
		this.filterSustainLevel=0.5*this.filterAttackTarget;
		this.filterSustain = 1;

		this.amplitudeAttack=0.2;
		this.amplitudeDecay=0.7;
		this.amplitudeSustainLevel=0.5;
		this.amplitudeSustain = 1;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trJetPlane: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 1;

		this.osc1.osc.type = "sawtooth";
		this.osc2.osc.type = "sine";
		this.osc3.osc.type = "sine";

		this.gain1.gain.gain.value = 0;
		this.gain2.gain.gain.value = 0;
		this.gain3.gain.gain.value = 0;
		this.noiseGain.gain.gain.value = 1;

		this.filterAttackTarget=40;
		this.filter.biquad.Q.value = 0;
		this.filterAttack=10;
		this.filterDecay=10;
		this.filterSustainLevel=1*this.filterAttackTarget;
		this.filterSustain = 1;

		this.amplitudeAttack=5;
		this.amplitudeDecay=10;
		this.amplitudeSustainLevel=1;
		this.amplitudeSustain = 1;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trExplodingBomb: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 1;

		this.osc1.osc.type = "triangle";
		this.osc2.osc.type = "triangle";
		this.osc3.osc.type = "sine";

		this.osc2.osc.detune.value = -100;

		this.gain1.gain.gain.value = 0.4;
		this.gain2.gain.gain.value = 0.4;
		this.gain3.gain.gain.value = 0;
		this.noiseGain.gain.gain.value = 0.8;

		this.filterAttackTarget=40;
		this.filter.biquad.Q.value = 0;
		this.filterAttack=0;
		this.filterDecay=0.001;
		this.filterSustainLevel=1*this.filterAttackTarget;
		this.filterSustain = 0;

		this.amplitudeAttack=0;
		this.amplitudeDecay=0.005;
		this.amplitudeSustainLevel=0.5;
		this.amplitudeSustain = 0.5;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trClarinet: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 1;

		this.osc1.osc.type = "square";
		this.osc2.osc.type = "sine";
		this.osc3.osc.type = "sine";

		this.gain1.gain.gain.value = 0.5;
		this.gain2.gain.gain.value = 0;
		this.gain3.gain.gain.value = 0;
		this.noiseGain.gain.gain.value = 0.03;

		this.filterAttackTarget=1040.24;
		this.filter.biquad.Q.value = 5;
		this.filterAttack=0.2;
		this.filterDecay=0.4;
		this.filterSustainLevel=0.8*this.filterAttackTarget;
		this.filterSustain = 1;

		this.amplitudeAttack=0.2;
		this.amplitudeDecay=0.3;
		this.amplitudeSustainLevel=0.8;
		this.amplitudeSustain = 1;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trTrumpet: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 1;

		this.osc1.osc.type = "sawtooth";
		this.osc2.osc.type = "sawtooth";
		this.osc3.osc.type = "sawtooth";

		this.gain1.gain.gain.value = 0.5;
		this.gain2.gain.gain.value = 0.7;
		this.gain3.gain.gain.value = 0.9;
		this.noiseGain.gain.gain.value = 0;

		this.filterAttackTarget=151.96;
		this.filter.biquad.Q.value = 0;
		this.filterAttack=0.4;
		this.filterDecay=0.4;
		this.filterSustainLevel=1*this.filterAttackTarget;
		this.filterSustain = 1;

		this.amplitudeAttack=0.2;
		this.amplitudeDecay=0.4;
		this.amplitudeSustainLevel=1;
		this.amplitudeSustain = 1;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trXylophone: function(){

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.osc1.osc.type = "triangle";
		this.osc2.osc.type = "sine";
		this.osc3.osc.type = "sine";

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 1;

		this.gain1.gain.gain.value = 1;
		this.gain2.gain.gain.value = 0;
		this.gain3.gain.gain.value = 0;
		this.noiseGain.gain.gain.value = 0;

		this.amplitudeAttack=0.005;
		this.amplitudeDecay=0.6;
		this.amplitudeSustain = 0;
		this.amplitudeSustainLevel=0;

		this.filterAttack=0.005;
		this.filterAttackTarget=80;
		this.filterDecay=0.2;
		this.filterSustain = 0;
		this.filterSustainLevel=0;

		this.filter.biquad.Q.value = 4;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trTempleBlocks: function(){

		// nice percussion - cool mellow knock around 108 Hz

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.osc1.osc.type = "triangle";
		this.osc2.osc.type = "triangle";
		this.osc3.osc.type = "sine";

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 1;

		this.gain1.gain.gain.value = 1;
		this.gain2.gain.gain.value = 1;
		this.gain3.gain.gain.value = 0;
		this.noiseGain.gain.gain.value = 0;

		this.amplitudeAttack=0.005;
		this.amplitudeDecay=0.010;
		this.amplitudeSustain = 0;
		this.amplitudeSustainLevel=0;

		this.filterAttack=0;
		this.filterAttackTarget=1901.85;
		this.filterDecay=0;
		this.filterSustain = 0.015;
		this.filterSustainLevel=1901.85;

		this.filter.biquad.Q.value = 0;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

	},

	trHorn: function(){

		// pretty nice in the sub range

		this.osc1.start();
		this.osc2.start();
		this.osc3.start();
		this.noise.start();

		this.osc1.osc.type = "sawtooth";
		this.osc2.osc.type = "sine";
		this.osc3.osc.type = "sine";

		this.octave1 = 1;
		this.octave2 = 1;
		this.octave3 = 1;

		this.gain1.gain.gain.value = 1;
		this.gain2.gain.gain.value = 0;
		this.gain3.gain.gain.value = 0;
		this.noiseGain.gain.gain.value = 0;

		this.amplitudeAttack=0.01;
		this.amplitudeDecay=0.3;
		this.amplitudeSustain = 2;
		this.amplitudeSustainLevel=0.9;

		this.filterAttack=0.37;
		this.filterAttackTarget=271.1;
		this.filterDecay=0.3;
		this.filterSustain = 2;
		this.filterSustainLevel=271.1*0.8;

		this.filter.biquad.Q.value = 0;

		this.amplitudeEnvelope = new Envelope([
			1, this.amplitudeAttack,
			this.amplitudeSustainLevel, this.amplitudeDecay,
			this.amplitudeSustainLevel, this.amplitudeSustain,
			0, this.amplitudeDecay,
		]);

		this.filterEnvelope = new Envelope([
			this.filterAttackTarget, this.filterAttack,
			this.filterSustainLevel, this.filterDecay,
			this.filterSustainLevel, this.filterSustain,
			0, this.filterDecay,
		]);

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

function PlaceFormants(){

	this.output = audioCtx.createGain();

	this.fCOA = [];
	this.fMOA = [];
	this.fIGA = [];
	this.fMGA = [];
	this.eA = [];
	this.mEA = [];
	this.oMGA = [];
	this.eGA = [];
	this.oGA = [];
	this.aMFA = [];

	this.nEGA = [];
	this.nOGA = [];

	this.sIGA = [];
	this.sMEGA = [];
	this.sA = [];
	this.sEGA = [];
	this.sOGA = [];

}

PlaceFormants.prototype = {

	output: this.output,

	fCOA: this.fCOA,
	fMOA: this.fMOA,
	fIGA: this.fIGA,
	fMGA: this.fMGA,
	oMEA: this.mEA,
	oMGA: this.oMGA,
	eA: this.eA,
	eGA: this.eGA,
	oGA: this.oGA,
	aMFA: this.amFA,

	nEGA: this.nEGA,
	nOGA: this.nOGA,

	sIGA: this.sIGA,
	sMEGA: this.sMEGA,
	sA: this.sA,
	sEGA: this.sEGA,
	sOGA: this.sOGA,

	nFormants: this.nFormants,

	amForm: function(cFreq, mFreq, mIdx, mEArray, aEArray, gainVal){

		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mIdx = mIdx;
		this.mEArray = mEArray;
		this.aEArray = aEArray;
		this.gainVal = gainVal;

		this.fCOA.unshift(new MyOsc("sine", this.cFreq));
		this.fMOA.unshift(new MyOsc("sine", this.mFreq));
		this.fIGA.unshift(new MyGain(this.mIdx));
		this.fMGA.unshift(new MyGain(0));
		this.mEA.unshift(new Envelope(this.mEArray));
		this.oMGA.unshift(new MyGain(0));
		this.eA.unshift(new Envelope(this.aEArray));
		this.eGA.unshift(new MyGain(0));
		this.oGA.unshift(new MyGain(this.gainVal));
		this.aMFA.unshift(new MyBiquad("notch", this.cFreq, this.cFreq));

		this.fMOA[0].connect(this.fIGA[0]);
		this.fCOA[0].connect(this.fMGA[0]); this.fIGA[0].connect(this.fMGA[0].gain.gain);
		this.fMGA[0].connect(this.oMGA[0]); this.mEA[0].connect(this.oMGA[0].gain.gain);
		this.oMGA[0].connect(this.aMFA[0]);

		this.fCOA[0].connect(this.eGA[0]); this.eA[0].connect(this.eGA[0].gain.gain);

		this.aMFA[0].connect(this.oGA[0]);
		this.eGA[0].connect(this.oGA[0]);

		this.oGA[0].connect(this.output);

	},

	fmForm: function(cFreq, mFreq, mIdx, mEArray, aEArray, gainVal){

		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mIdx = mIdx;
		this.mEArray = mEArray;
		this.aEArray = aEArray;
		this.gainVal = gainVal;

		this.fCOA.unshift(new MyOsc("sine", this.cFreq));
		this.fMOA.unshift(new MyOsc("sine", this.mFreq));
		this.fIGA.unshift(new MyGain(this.mIdx));
		this.fMGA.unshift(new MyGain(0));
		this.mEA.unshift(new Envelope(this.mEArray));
		this.oMGA.unshift(new MyGain(0));
		this.eA.unshift(new Envelope(this.aEArray));
		this.eGA.unshift(new MyGain(0));
		this.oGA.unshift(new MyGain(this.gainVal));

		this.fMOA[0].connect(this.fIGA[0]);
		this.fIGA[0].connect(this.oMGA[0]); this.mEA[0].connect(this.oMGA[0].gain.gain);
		this.oMGA[0].connect(this.fCOA[0].frequencyInlet);

		this.fCOA[0].connect(this.eGA[0]); this.eA[0].connect(this.eGA[0].gain.gain);

		this.eGA[0].connect(this.oGA[0]);

		this.oGA[0].connect(this.output);

	},

	noiseForm: function(freq, Q, eArray, gainVal){

		this.freq = freq;
		this.Q = Q;
		this.eArray = eArray;
		this.gainVal = gainVal;

		this.fCOA.unshift(new NoiseTone(this.freq, this.Q));
		this.fMOA.unshift(0);
		this.eA.unshift(new Envelope(this.eArray));
		this.mEA.unshift(0);
		this.nEGA.unshift(new MyGain(0));
		this.nOGA.unshift(new MyGain(this.gainVal));

		this.fCOA[0].connect(this.nEGA[0]); this.eA[0].connect(this.nEGA[0].gain.gain);

		this.nEGA[0].connect(this.nOGA[0]);
		this.nOGA[0].connect(this.output);

	},

	shaperForm: function(freq, sGainVal, sEArray, aEArray, gainVal){

		this.freq = freq;
		this.sGainVal = sGainVal;
		this.gainVal = gainVal;
		this.sEArray = sEArray;
		this.aEArray = aEArray;

		this.fCOA.unshift(new MyOsc("sine", this.freq));
		this.fMOA.unshift(0);
		this.sIGA.unshift(new MyGain(this.sGainVal));
		this.sA.unshift(new MyWaveShaper());
		this.mEA.unshift(new Envelope(this.sEArray));
		this.sMEGA.unshift(new MyGain(0));
		this.eA.unshift(new Envelope(this.aEArray));
		this.sEGA.unshift(new MyGain(0));
		this.sOGA.unshift(new MyGain(this.gainVal));

		this.fCOA[0].connect(this.sIGA[0]);
		this.sIGA[0].connect(this.sMEGA[0]); this.mEA[0].connect(this.sMEGA[0].gain.gain);
		this.sMEGA[0].connect(this.sA[0]);

		this.sA[0].connect(this.sEGA[0]); this.eA[0].connect(this.sEGA[0].gain.gain);
		this.sEGA[0].connect(this.sOGA[0]);
		this.sOGA[0].connect(this.output);

	},

	start: function(){

		for(var i=0; i<this.fCOA.length; i++){
			this.fCOA[i].start();
		}

		for(var i=0; i<this.fMOA.length; i++){
			if(this.fMOA[i]!=0){
				this.fMOA[i].start();
			}
		}

	},

	playAll: function(){

		for(var i=0; i<this.eA.length; i++){
			this.eA[i].start();
		}

		for(var i=0; i<this.mEA.length; i++){
			if(this.mEA[i]!=0){
				this.mEA[i].start();
			}
		}

	},

	playAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.eA.length; i++){
			this.eA[i].startAtTime(this.time);
		}

		for(var i=0; i<this.mEA.length; i++){
			if(this.mEA[i]!=0){
				this.mEA[i].startAtTime(this.time);
			}
		}

	},

	play: function(idx){

			this.idx = idx;

			this.eA[this.idx].start();

			if(this.mEA[this.idx]!=0){
				this.mEA[this.idx].start();
			}

	},

	playAtTime: function(idx, time){

			this.idx = idx;
			this.time = time;

			this.eA[this.idx].startAtTime(this.time);

			if(this.mEA[this.idx]!=0){
				this.mEA[this.idx].startAtTime(this.time);
			}

	},

	setCFreqAtTime: function(idx, freq, time){

		this.idx = idx;
		this.freq = freq;
		this.time = time;

		if(this.fCOA[this.idx].osc){
			this.fCOA[this.idx].osc.frequency.setValueAtTime(this.freq, this.time);
		}

		if(this.fCOA[this.idx].filter){
			this.fCOA[this.idx].filter.biquad.frequency.setValueAtTime(this.freq, this.time);
		}

	},

	setMFreqAtTime: function(idx, freq, time){

		this.idx = idx;
		this.freq = freq;
		this.time = time;

		this.fMOA[this.idx].osc.frequency.setValueAtTime(this.freq, this.time);

	},

	setQAtTime: function(idx, Q, time){

		this.idx = idx;
		this.Q = Q;
		this.time = time;

		this.fCOA[this.idx].filter.biquad.Q.setValueAtTime(this.Q, this.time);

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

function PlaceLFOFormants(){

	this.output = audioCtx.createGain();

	this.fCOA = [];
	this.fMOA = [];
	this.fIGA = [];
	this.fMGA = [];
	this.lArray = [];
	this.mlArray = [];
	this.mGA = [];
	this.eGA = [];
	this.oGA = [];
	this.aMFA = [];

	this.nEGA = [];
	this.nOGA = [];

	this.sIGA = [];
	this.sMEGA = [];
	this.sA = [];
	this.sEGA = [];
	this.sOGA = [];

}

PlaceLFOFormants.prototype = {

	output: this.output,

	fCOA: this.fCOA,
	fMOA: this.fMOA,
	fIGA: this.fIGA,
	fMGA: this.fMGA,
	oMEA: this.mEA,
	mGA: this.mGA,
	lArray: this.lArray,
	mlArray: this.mlArray,
	oGA: this.oGA,
	aMFA: this.amFA,

	nEGA: this.nEGA,
	nOGA: this.nOGA,

	sIGA: this.sIGA,
	sMEGA: this.sMEGA,
	sA: this.sA,
	sEGA: this.sEGA,
	sOGA: this.sOGA,

	nFormants: this.nFormants,

	amForm: function(cFreq, mFreq, mIdx, mlRate, lRate, gainVal){

		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mIdx = mIdx;
		this.mlRate = mlRate;
		this.lRate = lRate;
		this.gainVal = gainVal;

		this.fCOA.unshift(new MyOsc("sine", this.cFreq));
		this.fMOA.unshift(new MyOsc("sine", this.mFreq));
		this.fIGA.unshift(new MyGain(this.mIdx));
		this.fMGA.unshift(new MyGain(0));
		this.lArray.unshift(new LFO(0, 1, this.lRate));
		this.mlArray.unshift(new LFO(0, 1, this.mlRate));
		this.eGA.unshift(new MyGain(0));
		this.mGA.unshift(new MyGain(0));
		this.oGA.unshift(new MyGain(this.gainVal));
		this.aMFA.unshift(new MyBiquad("notch", this.cFreq, this.cFreq));

		this.fMOA[0].connect(this.fIGA[0]);
		this.fCOA[0].connect(this.fMGA[0]); this.fIGA[0].connect(this.fMGA[0].gain.gain);
		this.fMGA[0].connect(this.mGA[0]); this.mlArray[0].connect(this.mGA[0].gain.gain);
		this.mGA[0].connect(this.aMFA[0]);

		this.fCOA[0].connect(this.eGA[0]); this.lArray[0].connect(this.eGA[0].gain.gain);

		this.aMFA[0].connect(this.oGA[0]);
		this.eGA[0].connect(this.oGA[0]);

		this.oGA[0].connect(this.output);

	},

	fmForm: function(cFreq, mFreq, mIdx, mlRate, lRate, gainVal){

		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mIdx = mIdx;
		this.mlRate = mlRate;
		this.lRate = lRate;
		this.gainVal = gainVal;

		this.fCOA.unshift(new MyOsc("sine", this.cFreq));
		this.fMOA.unshift(new MyOsc("sine", this.mFreq));
		this.fIGA.unshift(new MyGain(this.mIdx));
		this.fMGA.unshift(new MyGain(0));
		this.lArray.unshift(new LFO(0, 1, this.lRate));
		this.mlArray.unshift(new LFO(0, 1, this.mlRate));
		this.eGA.unshift(new MyGain(0));
		this.mGA.unshift(new MyGain(0));
		this.oGA.unshift(new MyGain(this.gainVal));

		this.fMOA[0].connect(this.fIGA[0]);
		this.fIGA[0].connect(this.mGA[0]); this.mlArray[0].connect(this.mGA[0].gain.gain);
		this.mGA[0].connect(this.fCOA[0].frequencyInlet);

		this.fCOA[0].connect(this.eGA[0]); this.lArray[0].connect(this.eGA[0].gain.gain);

		this.eGA[0].connect(this.oGA[0]);

		this.oGA[0].connect(this.output);

	},

	noiseForm: function(freq, Q, lRate, gainVal){

		this.freq = freq;
		this.Q = Q;
		this.lRate = lRate;
		this.gainVal = gainVal;

		this.fCOA.unshift(new NoiseTone(this.freq, this.Q));
		this.fMOA.unshift(0);
		this.lArray.unshift(new LFO(0, 1, this.lRate));
		this.mlArray.unshift(0);
		this.nEGA.unshift(new MyGain(0));
		this.nOGA.unshift(new MyGain(this.gainVal));

		this.fCOA[0].connect(this.nEGA[0]); this.lArray[0].connect(this.nEGA[0].gain.gain);

		this.nEGA[0].connect(this.nOGA[0]);
		this.nOGA[0].connect(this.output);

	},

	shaperForm: function(freq, sGainVal, mlRate, lRate, gainVal){

		this.freq = freq;
		this.sGainVal = sGainVal;
		this.gainVal = gainVal;
		this.mlRate = mlRate;
		this.lRate = lRate;

		this.fCOA.unshift(new MyOsc("sine", this.freq));
		this.fMOA.unshift(0);
		this.sIGA.unshift(new MyGain(this.sGainVal));
		this.sA.unshift(new MyWaveShaper());
		this.lArray.unshift(new LFO(0, 1, this.lRate));
		this.mlArray.unshift(new LFO(0, 1, this.mlRate));
		this.sMEGA.unshift(new MyGain(0));
		this.sEGA.unshift(new MyGain(0));
		this.sOGA.unshift(new MyGain(this.gainVal));

		this.fCOA[0].connect(this.sIGA[0]);
		this.sIGA[0].connect(this.sMEGA[0]); this.mEA[0].connect(this.sMEGA[0].gain.gain);
		this.sMEGA[0].connect(this.sA[0]);

		this.sA[0].connect(this.sEGA[0]); this.eA[0].connect(this.sEGA[0].gain.gain);
		this.sEGA[0].connect(this.sOGA[0]);
		this.sOGA[0].connect(this.output);

	},

	start: function(){

		for(var i=0; i<this.fCOA.length; i++){
			this.fCOA[i].start();
		}

		for(var i=0; i<this.fMOA.length; i++){
			if(this.fMOA[i]!=0){
				this.fMOA[i].start();
			}
		}

		for(var i=0; i<this.lArray.length; i++){
			this.lArray[i].start();
		}

		for(var i=0; i<this.mlArray.length; i++){
			if(this.mlArray[i]!=0){
				this.mlArray[i].start();
			}
		}

	},

	startAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.fCOA.length; i++){
			this.fCOA[i].startAtTime(this.time);
		}

		for(var i=0; i<this.fMOA.length; i++){
			if(this.fMOA[i]!=0){
				this.fMOA[i].startAtTime(this.time);
			}
		}

		for(var i=0; i<this.lArray.length; i++){
			this.lArray[i].startAtTime(this.time);
		}

		for(var i=0; i<this.mlArray.length; i++){
			if(this.mlArray[i]!=0){
				this.mlArray[i].startAtTime(this.time);
			}
		}

	},

	setCFreqAtTime: function(idx, freq, time){

		this.idx = idx;
		this.freq = freq;
		this.time = time;

		if(this.fCOA[this.idx].osc){
			this.fCOA[this.idx].osc.frequency.setValueAtTime(this.freq, this.time);
		}

		if(this.fCOA[this.idx].filter){
			this.fCOA[this.idx].filter.biquad.frequency.setValueAtTime(this.freq, this.time);
		}

	},

	setMFreqAtTime: function(idx, freq, time){

		this.idx = idx;
		this.freq = freq;
		this.time = time;

		this.fMOA[this.idx].osc.frequency.setValueAtTime(this.freq, this.time);

	},

	setQAtTime: function(idx, Q, time){

		this.idx = idx;
		this.Q = Q;
		this.time = time;

		this.fCOA[this.idx].filter.biquad.Q.setValueAtTime(this.Q, this.time);

	},

	setLRateAtTime: function(idx, rate, time){

		this.idx = idx;
		this.rate = rate
		this.time = time;

		this.lArray[this.idx].bufferSource.playbackRate.setValueAtTime(this.rate, this.time);

	},

	setMLRateAtTime: function(idx, rate, time){

		this.idx = idx;
		this.rate = rate;
		this.time = time;

		this.mlArray[this.idx].bufferSource.playbackRate.setValueAtTime(this.rate, this.time);

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

function PlaceBreakPointFormants(){

	this.output = audioCtx.createGain();

	this.fCOA = [];
	this.fMOA = [];
	this.fIGA = [];
	this.fMGA = [];
	this.eA = [];
	this.mEA = [];
	this.mGA = [];
	this.eGA = [];
	this.oGA = [];
	this.aMFA = [];

	this.nEGA = [];
	this.nOGA = [];

	this.sIGA = [];
	this.sMEGA = [];
	this.sA = [];
	this.sEGA = [];
	this.sOGA = [];

}

PlaceBreakPointFormants.prototype = {

	output: this.output,

	fCOA: this.fCOA,
	fMOA: this.fMOA,
	fIGA: this.fIGA,
	fMGA: this.fMGA,
	oMEA: this.mEA,
	mGA: this.mGA,
	eA: this.eA,
	eGA: this.eGA,
	oGA: this.oGA,
	aMFA: this.amFA,

	nEGA: this.nEGA,
	nOGA: this.nOGA,

	sIGA: this.sIGA,
	sMEGA: this.sMEGA,
	sA: this.sA,
	sEGA: this.sEGA,
	sOGA: this.sOGA,

	nFormants: this.nFormants,

	amForm: function(cFreq, mFreq, mIdx, mEArray, mExpArray, mBPRate, aEArray, aExpArray, aBPRate, gainVal){

		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mIdx = mIdx;
		this.mEArray = mEArray;
		this.mExpArray = mExpArray;
		this.mBPRate = mBPRate;
		this.aEArray = aEArray;
		this.aExpArray = aExpArray;
		this.aBPRate = aBPRate;
		this.gainVal = gainVal;

		this.fCOA.unshift(new MyOsc("sine", this.cFreq));
		this.fMOA.unshift(new MyOsc("sine", this.mFreq));
		this.fIGA.unshift(new MyGain(this.mIdx));
		this.fMGA.unshift(new MyGain(0));
		this.mEA.unshift(new BreakPoint(this.mEArray, this.mExpArray));
		this.mEA[0].playbackRate = this.mBPRate;
		this.mGA.unshift(new MyGain(0));
		this.eA.unshift(new BreakPoint(this.aEArray, this.aExpArray));
		this.eA[0].playbackRate = this.aBPRate;
		this.eGA.unshift(new MyGain(0));
		this.oGA.unshift(new MyGain(this.gainVal));
		this.aMFA.unshift(new MyBiquad("notch", this.cFreq, this.cFreq));

		this.fMOA[0].connect(this.fIGA[0]);
		this.fCOA[0].connect(this.fMGA[0]); this.fIGA[0].connect(this.fMGA[0].gain.gain);
		this.fMGA[0].connect(this.mGA[0]); this.mEA[0].connect(this.mGA[0].gain.gain);
		this.mGA[0].connect(this.aMFA[0]);

		this.fCOA[0].connect(this.eGA[0]); this.eA[0].connect(this.eGA[0].gain.gain);

		this.aMFA[0].connect(this.oGA[0]);
		this.eGA[0].connect(this.oGA[0]);

		this.oGA[0].connect(this.output);

	},

	fmForm: function(cFreq, mFreq, mIdx, mEArray, mExpArray, mBPRate, aEArray, aExpArray, aBPRate, gainVal){

		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mIdx = mIdx;
		this.mEArray = mEArray;
		this.mExpArray = mExpArray;
		this.mBPRate = mBPRate;
		this.aEArray = aEArray;
		this.aExpArray = aExpArray;
		this.aBPRate = aBPRate;
		this.gainVal = gainVal;

		this.fCOA.unshift(new MyOsc("sine", this.cFreq));
		this.fMOA.unshift(new MyOsc("sine", this.mFreq));
		this.fIGA.unshift(new MyGain(this.mIdx));
		this.fMGA.unshift(new MyGain(0));
		this.mEA.unshift(new BreakPoint(this.mEArray, this.mExpArray));
		this.mEA[0].playbackRate = this.mBPRate;
		this.mGA.unshift(new MyGain(0));
		this.eA.unshift(new BreakPoint(this.aEArray, this.aExpArray));
		this.eA[0].playbackRate = this.aBPRate;
		this.eGA.unshift(new MyGain(0));
		this.oGA.unshift(new MyGain(this.gainVal));

		this.fMOA[0].connect(this.fIGA[0]);
		this.fIGA[0].connect(this.mGA[0]); this.mEA[0].connect(this.mGA[0].gain.gain);
		this.mGA[0].connect(this.fCOA[0].frequencyInlet);

		this.fCOA[0].connect(this.eGA[0]); this.eA[0].connect(this.eGA[0].gain.gain);

		this.eGA[0].connect(this.oGA[0]);

		this.oGA[0].connect(this.output);

	},

	noiseForm: function(freq, Q, eArray, expArray, bPRate, gainVal){

		this.freq = freq;
		this.Q = Q;
		this.eArray = eArray;
		this.expArray = expArray;
		this.bPRate = bPRate;
		this.gainVal = gainVal;

		this.fCOA.unshift(new NoiseTone(this.freq, this.Q));
		this.fMOA.unshift(0);
		this.eA.unshift(new BreakPoint(this.eArray, this.expArray));
		this.eA[0].playbackRate = this.bPRate;
		this.mEA.unshift(0);
		this.nEGA.unshift(new MyGain(0));
		this.nOGA.unshift(new MyGain(this.gainVal));

		this.fCOA[0].connect(this.nEGA[0]); this.eA[0].connect(this.nEGA[0].gain.gain);

		this.nEGA[0].connect(this.nOGA[0]);
		this.nOGA[0].connect(this.output);

	},

	shaperForm: function(freq, sGainVal, sEArray, sExpArray, sBPRate, aEArray, aExpArray, aBPRate, gainVal){

		this.freq = freq;
		this.sGainVal = sGainVal;
		this.gainVal = gainVal;
		this.sEArray = sEArray;
		this.sExpArray = sExpArray;
		this.sBPRate = sBPRate;
		this.aEArray = aEArray;
		this.aExpArray = aExpArray;
		this.aBPRate = aBPRate;

		this.fCOA.unshift(new MyOsc("sine", this.freq));
		this.fMOA.unshift(0);
		this.sIGA.unshift(new MyGain(this.sGainVal));
		this.sA.unshift(new MyWaveShaper());
		this.mEA.unshift(new BreakPoint(this.sEArray, this.sExpArray));
		this.mEA[0].playbackRate = this.sBPRate;
		this.sMEGA.unshift(new MyGain(0));
		this.eA.unshift(new BreakPoint(this.aEArray, this.aExpArray));
		this.eA[0].playbackRate = this.aBPRate;
		this.sEGA.unshift(new MyGain(0));
		this.sOGA.unshift(new MyGain(this.gainVal));

		this.fCOA[0].connect(this.sIGA[0]);
		this.sIGA[0].connect(this.sMEGA[0]); this.mEA[0].connect(this.sMEGA[0].gain.gain);
		this.sMEGA[0].connect(this.sA[0]);

		this.sA[0].connect(this.sEGA[0]); this.eA[0].connect(this.sEGA[0].gain.gain);
		this.sEGA[0].connect(this.sOGA[0]);
		this.sOGA[0].connect(this.output);

	},

	start: function(){

		for(var i=0; i<this.fCOA.length; i++){
			this.fCOA[i].start();
		}

		for(var i=0; i<this.fMOA.length; i++){
			if(this.fMOA[i]!=0){
				this.fMOA[i].start();
			}
		}

	},

	playAll: function(){

		for(var i=0; i<this.eA.length; i++){
			this.eA[i].start();
		}

		for(var i=0; i<this.mEA.length; i++){
			if(this.mEA[i]!=0){
				this.mEA[i].start();
			}
		}

	},

	playAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.eA.length; i++){
			this.eA[i].startAtTime(this.time);
		}

		for(var i=0; i<this.mEA.length; i++){
			if(this.mEA[i]!=0){
				this.mEA[i].startAtTime(this.time);
			}
		}

	},

	play: function(idx){

			this.idx = idx;

			this.eA[this.idx].start();

			if(this.mEA[this.idx]!=0){
				this.mEA[this.idx].start();
			}

	},

	playAtTime: function(idx, time){

			this.idx = idx;
			this.time = time;

			this.eA[this.idx].startAtTime(this.time);

			if(this.mEA[this.idx]!=0){
				this.mEA[this.idx].startAtTime(this.time);
			}

	},

	setCFreqAtTime: function(idx, freq, time){

		this.idx = idx;
		this.freq = freq;
		this.time = time;

		if(this.fCOA[this.idx].osc){
			this.fCOA[this.idx].osc.frequency.setValueAtTime(this.freq, this.time);
		}

		if(this.fCOA[this.idx].filter){
			this.fCOA[this.idx].filter.biquad.frequency.setValueAtTime(this.freq, this.time);
		}

	},

	setMFreqAtTime: function(idx, freq, time){

		this.idx = idx;
		this.freq = freq;
		this.time = time;

		this.fMOA[this.idx].osc.frequency.setValueAtTime(this.freq, this.time);

	},

	setQAtTime: function(idx, Q, time){

		this.idx = idx;
		this.Q = Q;
		this.time = time;

		this.fCOA[this.idx].filter.biquad.Q.setValueAtTime(this.Q, this.time);

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

function SawSines(nNodes, freqArray, rateArray){

	this.freqArray = freqArray;
	this.rateArray = rateArray;

	this.nNodes = nNodes;

	this.osc = {};
	this.saw = {};
	this.amFilter = {};
	this.amGain = {};

	for(var i=0; i<this.nNodes; i++){

		this.osc[i] = {osc: new MyOsc("sine", this.freqArray[i])};

		this.saw[i] = {saw: new MyBuffer(1, 1, audioCtx.sampleRate)};
		this.saw[i].saw.makeTriangle();
		this.saw[i].saw.loop = true;
		this.saw[i].saw.playbackRate = this.rateArray[i];

		this.amFilter[i] = {filter: new MyBiquad("lowpass", 10, 1)};

		this.amGain[i] = {gain: new MyGain(0)};

		this.saw[i].saw.connect(this.amFilter[i].filter);

		this.osc[i].osc.connect(this.amGain[i].gain); this.amFilter[i].filter.connect(this.amGain[i].gain.gain.gain);

	}

}

SawSines.prototype = {

	nNodes: this.nNodes,
	osc: this.osc,
	saw: this.saw,
	amFilter: this.amFilter,
	amGain: this.amGain,

	setFreq: function(freq, idx){

		var freq = freq;
		var idx = idx;

		this.osc[idx].osc.osc.frequency.value = freq;

	},

	setFreqs: function(freqArray){

		var freqArray = freqArray;

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.osc.frequency.value = freqArray[i];
		}

	},

	setFreqsAtTime: function(freqArray, time){

		this.freqArray = freqArray;
		this.time = time;

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.osc.frequency.setValueAtTime(this.freqArray[i], this.time);
		}

	},

	start: function(){

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.start();
			this.saw[i].saw.start();
		}

	},

	stop: function(){

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.stop();
			this.saw[i].saw.stop();
		}

	},

	startAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.startAtTime(this.time);
			this.saw[i].saw.startAtTime(this.time);
		}

	},

	stopAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.stopAtTime(this.time);
			this.saw[i].saw.stopAtTime(this.time);
		}

	},

	connectOutput: function(audioNode, idx){

		var idx = idx;

		if (audioNode.hasOwnProperty('input') == 1){
			this.amGain[idx].gain.connect(audioNode.input);
		}
		else {
			this.amGain[idx].gain.connect(audioNode);
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

function ElectricPiano(){

	this.output = audioCtx.createGain();

	// src
	this.osc = new MyOsc("sine", 0);

	// envelope
	this.e = new MyBuffer(1, 1, audioCtx.sampleRate);
	this.e.makeInverseSawtooth(4);
	this.e.loop = false;
	this.f = new MyBiquad("lowpass", 500, 0);
	this.eG = new MyGain(0);

	// shapers
	this.s = {};
	this.timbreGain = new MyGain(0.2);
	this.sOG = new MyGain(0.3);

	for(var i=0; i<3; i++){

		this.s[i] = {shaper: new MyWaveShaper()};
		this.s[i].shaper.makeFm(randomFloat(5, 8.1), randomFloat(0.1, 0.31), 1);

		this.timbreGain.connect(this.s[i].shaper);
		this.s[i].shaper.connect(this.sOG);

	}

	// highpass
	this.hp = new MyBiquad("highpass", 20, 0);

	this.e.connect(this.f);

	this.osc.connect(this.eG);	this.f.connect(this.eG.gain.gain);
	this.eG.connect(this.timbreGain);
	this.sOG.connect(this.hp);
	this.hp.connect(this.output);

}

ElectricPiano.prototype = {

	output: this.output,
	osc: this.osc,
	e: this.e,
	eG: this.eG,
	timbreGain: this.timbreGain,

	playAtTime: function(time, freq, duration){

		this.time = time;
		this.freq = freq;
		this.duration = duration;

		this.osc.osc.frequency.setValueAtTime(this.freq, this.time);

		this.e.startAtTime(this.time);
		this.e.bufferSource.playbackRate.setValueAtTime(this.duration, this.time);

	},

	start: function(){

		this.osc.start();

	},

	stop: function(){

		this.osc.stop();

	},

	startAtTime: function(time){

		this.time = time;

		this.osc.start(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.osc.stop(this.time);

	},

	connectOutput: function(audioNode, idx){

		var idx = idx;

		if (audioNode.hasOwnProperty('input') == 1){
			this.amGain[idx].gain.connect(audioNode.input);
		}
		else {
			this.amGain[idx].gain.connect(audioNode);
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

// MULTI OBJECTS

//--------------------------------------------------------------

function MultiBuffer(nChannels, length, sRate){

	this.output = audioCtx.createGain();

	this.length = length;
	this.nChannels = nChannels;
	this.sRate = sRate;

	this.buffer = audioCtx.createBuffer(this.nChannels, this.sRate*this.length, this.sRate);
	this.splitter = audioCtx.createChannelSplitter(this.nChannels);

}

MultiBuffer.prototype = {

	buffer: this.buffer,
	splitter: this.splitter,
	playbackRate: this.playbackRate,
	loop: this.loop,

	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.splitter);
		this.bufferSource.start();
	},

	stop: function(){
		this.bufferSource.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.splitter);
		this.bufferSource.start(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

	},

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

	makeSine: function(channel){

		this.twoPi = Math.PI*2;
		this.t;
		this.v;

		this.channel = channel;

		this.nowBuffering = this.buffer.getChannelData(this.channel);

		for (this.i=0; this.i<this.buffer.length; this.i++){
				this.t = this.i/this.buffer.length;
				this.v = Math.sin(this.twoPi*this.t);
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] = 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] = this.v
				}
			}
	},

	makeUnipolarSine: function(){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
				this.p = this.i/this.buffer.length;
				this.v = (0.5*(Math.sin(this.twoPi*(this.p))))+0.5;
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] = 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] = this.v
				}
			}
		}

	},


	additiveSynth: function(overtoneArray, amplitudeArray, channel){

		this.overtoneArray = overtoneArray;
		this.amplitudeArray = amplitudeArray;

		this.twoPi = Math.PI*2;
		this.t;
		this.v;
		this.f;
		this.a;

		this.channel = channel;

		this.nowBuffering = this.buffer.getChannelData(this.channel);

			this.f = this.overtoneArray[this.channel];
			this.a = this.amplitudeArray[this.channel];
			for (this.i=0; this.i<this.buffer.length; this.i++){

				this.t = this.i/this.buffer.length;
				this.v = this.a*(Math.sin(this.twoPi*this.f*this.t));

				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] = 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] = this.v
				}

			}
	},

	makeSawtooth: function(exp, channel){

		this.exp = exp;

		this.channel = channel;

		this.nowBuffering = this.buffer.getChannelData(this.channel);

			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.pow((this.i/this.buffer.length), this.exp);
			}
	},

	makeInverseSawtooth: function(exp, channel){

		this.exp = exp;

		this.channel = channel;

		this.nowBuffering = this.buffer.getChannelData(this.channel);

			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.pow(1-(this.i/this.buffer.length), this.exp);
			}
	},

	makeNoise: function(channel){

		this.channel = channel;

		this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.random() * 2 - 1;
			}
	},

	makeConstant: function(value, channel){

		this.value = value;

		this.channel = channel;

		this.nowBuffering = this.buffer.getChannelData(this.channel);

			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = this.value;
			}
	},

	makeSquare: function(dutyCycle, channel){

		this.channel = channel;
		this.dutyCycle = dutyCycle;

		this.nowBuffering = this.buffer.getChannelData(this.channel);

			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i<this.buffer.length*this.dutyCycle){
					this.nowBuffering[this.i] = 1;
				}

				else if(this.i>this.buffer.length*this.dutyCycle){
					this.nowBuffering[this.i] = 0;
				}
			}
	},

	floatingCycleSquare: function(cycleStart, cycleEnd, channel){

		this.channel = channel;
		this.cycleStart = cycleStart;
		this.cycleEnd = cycleEnd;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i>=this.buffer.length*this.cycleStart && this.i<=this.buffer.length*this.cycleEnd){
					this.nowBuffering[this.i] = 1;
				}
				else if(this.i<=this.buffer.length*this.cycleStart || this.i>=this.buffer.length*this.cycleEnd){
					this.nowBuffering[this.i] = 0;
				}
			}
		}
	},

	quantizedArrayBuffer: function(quant, valueArray, channel){

		this.quant = quant;
		this.valueArray = valueArray;

	    this.n_samples = this.buffer.length;
	    this.curve = new Float32Array(this.n_samples);
	    this.mod = this.n_samples/this.quant;
	    this.modVal;
	    this.value;
			this.j = 0;

	    this.channel = channel;

		this.nowBuffering = this.buffer.getChannelData(this.channel);

			for (this.i=0; this.i<this.buffer.length; this.i++){

				this.modVal = this.i%this.mod;

				if(this.modVal==0){
	  				this.value = this.valueArray[this.j%this.valueArray.length];
						this.j++;
	  			}

				this.nowBuffering[this.i] = this.value;

			}
 	},
}

//--------------------------------------------------------------

function MultiOsc(typeArray, freqArray){

	this.typeArray = typeArray;
	this.freqArray = freqArray;

	this.oscs = {};

	for(var i=0; i<this.typeArray.length; i++){
		this.oscs[i] = {osc: new MyOsc(this.typeArray[i], this.freqArray[i])};
	}

}

MultiOsc.prototype = {

	oscs: this.oscs,
	typeArray: this.typeArray,
	freqArray: this.freqArray,

	start: function(oIdx){
		this.oscs[oIdx].osc.start();
	},

	stop: function(oIdx){
		this.oscs[oIdx].osc.stop();
	},

	startAtTime: function(oIdx, time){

		this.oIdx = oIdx;
		this.time = time;

		this.oscs[oIdx].osc.startAtTime(this.time);

	},

	stopAtTime: function(oIdx, time){

		this.oIdx = oIdx;
		this.time = time;

		this.oscs[oIdx].osc.stopAtTime(this.time);


	},

	startAll: function(){
		for(var i=0; i<this.typeArray.length; i++){
			this.oscs[i].osc.start();
		}
	},

	stopAll: function(){
		for(var i=0; i<this.typeArray.length; i++){
			this.oscs[i].osc.stop();
		}
	},

	startAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.typeArray.length; i++){
			this.oscs[i].osc.startAtTime(this.time);
		}

	},

	stopAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.typeArray.length; i++){
			this.oscs[i].osc.stopAtTime(this.time);
		}

	},

	connect: function(audioNode, outputIdx){
		if (audioNode.hasOwnProperty('input') == 1){
			this.oscs[outputIdx].osc.connect(audioNode.input);
		}
		else {
			this.oscs[outputIdx].osc.connect(audioNode);
		}
	},

	connectAll: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			for(var i=0; i<this.typeArray.length; i++){
				this.oscs[i].osc.connect(audioNode.input);
			}
		}
		else {
			for(var i=0; i<this.typeArray.length; i++){
				this.oscs[i].osc.connect(audioNode);
			}
		}
	},

}

//--------------------------------------------------------------

function MultiGain(gainArray){

	this.input = audioCtx.createGain();
	this.gainArray = gainArray;

	this.gains = {};

	for(var i=0; i<this.gainArray.length; i++){
		this.gains[i] = {gain: new MyGain(this.gainArray[i])};

		this.input.connect(this.gains[i].gain.input);
	}

}

MultiGain.prototype = {

	input: this.input,
	gains: this.gains,
	gainArray: this.gainArray,

	connect: function(audioNode, outputIdx){
		if (audioNode.hasOwnProperty('input') == 1){
			this.gains[outputIdx].gain.connect(audioNode.input);
		}
		else {
			this.gains[outputIdx].gain.connect(audioNode);
		}
	},

	connectAll: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			for(var i=0; i<this.gainArray.length; i++){
				this.gains[i].gain.connect(audioNode.input);
			}
		}
		else {
			for(var i=0; i<this.gainArray.length; i++){
				this.gains[i].gain.connect(audioNode);
			}
		}
	},

}

//--------------------------------------------------------------

function MultiPan(panArray){

	this.input = audioCtx.createGain();
	this.panArray = panArray;

	this.pans = {};

	for(var i=0; i<this.panArray.length; i++){
		this.pans[i] = {pan: new MyPanner2(this.panArray[i])};

		this.input.connect(this.pans[i].pan.input);
	}

}

MultiPan.prototype = {

	input: this.input,
	pans: this.pans,
	panArray: this.panArray,

	connect: function(audioNode, outputIdx){
		if (audioNode.hasOwnProperty('input') == 1){
			this.pans[outputIdx].pan.connect(audioNode.input);
		}
		else {
			this.pans[outputIdx].pan.connect(audioNode);
		}
	},

	connectAll: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			for(var i=0; i<this.panArray.length; i++){
				this.pans[i].pan.connect(audioNode.input);
			}
		}
		else {
			for(var i=0; i<this.panArray.length; i++){
				this.pans[i].pan.connect(audioNode);
			}
		}
	},

}

//--------------------------------------------------------------

function MultiDelay(delayArray){

	this.input = audioCtx.createGain();
	this.delayArray = delayArray;

	this.delays = {};

	for(var i=0; i<this.delayArray.length; i++){
		this.delays[i] = {delay: audioCtx.createDelay()};
		this.delays[i].delay.delayTime.value = this.delayArray[i];

		this.input.connect(this.delays[i].delay.input);
	}

}

MultiDelay.prototype = {

	input: this.input,
	delays: this.delays,
	delayArray: this.delayArray,

	connect: function(audioNode, outputIdx){
		if (audioNode.hasOwnProperty('input') == 1){
			this.delays[outputIdx].delay.connect(audioNode.input);
		}
		else {
			this.delays[outputIdx].delay.connect(audioNode);
		}
	},

	connectAll: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			for(var i=0; i<this.delayArray.length; i++){
				this.delays[i].delay.connect(audioNode.input);
			}
		}
		else {
			for(var i=0; i<this.delayArray.length; i++){
				this.delays[i].delay.connect(audioNode);
			}
		}
	},

}

//--------------------------------------------------------------

function MultiPannedDelay(delayArray, panArray){

	this.input = audioCtx.createGain();

	this.delayArray = delayArray;
	this.panArray = panArray;

	this.delays = {};
	this.pans = {};

	for(var i=0; i<this.delayArray.length; i++){
		this.delays[i] = {delay: audioCtx.createDelay()};
		this.delays[i].delay.delayTime.value = this.delayArray[i];
		this.pans[i] = {pan: new MyPanner2(this.panArray[i])};

		this.input.connect(this.delays[i].delay.input);
		this.delays[i].delay.connect(this.pans[i].pan.input);

	}

}

MultiPannedDelay.prototype = {

	input: this.input,
	delays: this.delays,
	pans: this.pans,
	delayArray: this.delayArray,
	panArray: this.panArray,

	connect: function(audioNode, outputIdx){
		if (audioNode.hasOwnProperty('input') == 1){
			this.pans[outputIdx].pan.connect(audioNode.input);
		}
		else {
			this.pans[outputIdx].pan.connect(audioNode);
		}
	},

	connectAll: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			for(var i=0; i<this.panArray.length; i++){
				this.pans[i].pan.connect(audioNode.input);
			}
		}
		else {
			for(var i=0; i<this.panArray.length; i++){
				this.pans[i].pan.connect(audioNode);
			}
		}
	},

}

//--------------------------------------------------------------

function MultiStereoDelay(delayLArray, delayRArray, fbArray){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();
	this.delayLArray = delayLArray;
	this.delayRArray = delayRArray;
	this.fbArray = fbArray;

	this.nDelays = this.delayLArray.length;

	this.delays = {};

	for(var i=0; i<this.nDelays; i++){
		this.delays[i] = {delay: new MyStereoDelay(this.delayLArray[i], this.delayRArray[i], this.fbArray[i], 1)};

		this.input.connect(this.delays[i].delay.input);
		this.delays[i].delay.connect(this.output);
	}

}

MultiStereoDelay.prototype = {

	input: this.input,
	output: this.output,
	delays: this.delays,
	delayLArray: this.delayLArray,
	delayRArray: this.delayRArray,
	fbArray: this.fbArray,
	nDelays: this.nDelays,

	connect: function(audioNode, outputIdx){
		if (audioNode.hasOwnProperty('input') == 1){
			this.delays[outputIdx].delay.connect(audioNode.input);
		}
		else {
			this.delays[outputIdx].delay.connect(audioNode);
		}
	},

	connectAll: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
				this.output.connect(audioNode.input);
		}
		else {
				this.output.connect(audioNode);
		}
	},

}

//--------------------------------------------------------------

function MultiEnvelope(envelopeArray){

	this.envelopeArray = envelopeArray;

	this.envelopes = {};

	for(var i=0; i<this.envelopeArray.length; i++){
		this.envelopes[i] = {envelope: new Envelope(this.envelopeArray[i])};
	}

}

MultiEnvelope.prototype = {

	envelopes: this.envelopes,
	envelopeArray: this.envelopeArray,

	start: function(eIndex){
		this.envelopes[eIndex].envelope.start();
	},

	stop: function(eIndex){
		this.envelopes[eIndex].envelope.stop();
	},

	startAtTime: function(eIndex, time){

		this.eIndex = eIndex;
		this.time = time;

		this.envelopes[this.eIndex].envelope.startAtTime(this.time);

	},

	stopAtTime: function(eIndex, time){

		this.eIndex = eIndex;
		this.time = time;

		this.envelopes[this.eIndex].envelope.stopAtTime(this.time);

	},

	startAll: function(){
		for(var i=0; i<this.envelopeArray.length; i++){
			this.envelopes[i].envelope.start();
		}
	},

	stopAll: function(){
		for(var i=0; i<this.envelopeArray.length; i++){
			this.envelopes[i].envelope.stop();
		}
	},

	startAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.envelopeArray.length; i++){
			this.envelopes[i].envelope.startAtTime(this.time);
		}

	},

	stopAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.envelopeArray.length; i++){
			this.envelopes[i].envelope.stopAtTime(this.time);
		}

	},

	connect: function(audioNode, outputIdx){
		if (audioNode.hasOwnProperty('input') == 1){
			this.envelopes[outputIdx].envelope.connect(audioNode.input);
		}
		else {
			this.envelopes[outputIdx].envelope.connect(audioNode);
		}
	},

	connectAll: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			for(var i=0; i<this.envelopeArray.length; i++){
				this.envelopes[i].envelope.connect(audioNode.input);
			}
		}
		else {
			for(var i=0; i<this.envelopeArray.length; i++){
				this.envelopes[i].envelope.connect(audioNode);
			}
		}
	},

}

//--------------------------------------------------------------

function MultiOperator(nOps){

	this.nOps = nOps;

	this.ops = {};

	for(var i=0; i<this.nOps; i++){
		this.ops[i] = {op: new Operator()};
	}

}

MultiOperator.prototype = {

	ops: this.ops,
	nOps: this.nOps,

	start: function(oIdx){
		this.ops[oIdx].op.start();
	},

	stop: function(oIdx){
		this.ops[oIdx].op.stop();
	},

	startAtTime: function(oIndex, time){

		this.oIndex = oIndex;
		this.time = time;

		this.ops[this.oIndex].op.startAtTime(this.time);

	},

	stopAtTime: function(oIndex, time){

		this.oIndex = oIndex;
		this.time = time;

		this.ops[this.oIndex].op.stopAtTime(this.time);

	},

	startAll: function(){
		for(var i=0; i<this.nOps; i++){
			this.ops[i].op.start();
		}
	},

	stopAll: function(){
		for(var i=0; i<this.nOps; i++){
			this.ops[i].op.stop();
		}
	},

	startAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nOps; i++){
			this.ops[i].op.startAtTime(this.time);
		}
	},

	stopAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nOps; i++){
			this.ops[i].op.stopAtTime(this.time);
		}

	},

	connect: function(audioNode, outputIdx){
		if (audioNode.hasOwnProperty('input') == 1){
			this.ops[outputIdx].op.connect(audioNode.input);
		}
		else {
			this.ops[outputIdx].op.connect(audioNode);
		}
	},

	connectAll: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			for(var i=0; i<this.nOps; i++){
				this.ops[i].op.connect(audioNode.input);
			}
		}
		else {
			for(var i=0; i<this.nOps; i++){
				this.ops[i].op.connect(audioNode);
			}
		}
	},


}

//--------------------------------------------------------------

function MultiInstrument(nInstruments){

	this.output = audioCtx.createGain();

	this.nInstruments = nInstruments;

	this.instruments = {};

	for(var i=0; i<this.nInstruments; i++){
		this.instruments[i] = {instrument: new Instrument()};
		this.instruments[i].instrument.connect(this.output);
	}

}

MultiInstrument.prototype = {

	output: this.output,
	instruments: this.instruments,
	nInstruments: this.nInstruments,

	start: function(idx){

		this.idx = idx;

		this.instruments[this.idx].instrument.start();

	},

	stop: function(idx){

		this.idx = idx;

		this.instruments[this.idx].instrument.stop();

	},

	startAtTime: function(idx, time){

		this.idx = idx;
		this.time = time;

		this.instruments[this.idx].instrument.startAtTime(this.time);

	},

	stopAtTime: function(idx, time){

		this.idx = idx;
		this.time = time;

		this.instruments[this.idx].instrument.stopAtTime(this.time);

	},

	startAll: function(){
		for(var i=0; i<this.nInstruments; i++){
			this.instruments[i].instrument.start();
		}
	},

	stopAll: function(){
		for(var i=0; i<this.nInstruments; i++){
			this.instruments[i].instrument.stop();
		}
	},

	startAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nInstruments; i++){
			this.instruments[i].instrument.startAtTime(this.time);
		}

	},

	stopAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nInstruments; i++){
			this.instruments[i].instrument.stopAtTime(this.time);
		}

	},

	connect: function(idx, audioNode){

		this.idx = idx;

		if (audioNode.hasOwnProperty('input') == 1){
			this.instruments[this.idx].instrument.connect(audioNode.input);
		}
		else {
			this.instruments[this.idx].instrument.connect(audioNode);
		}
	},

	connectAll: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

}

//--------------------------------------------------------------

function MultiEffect(nEffects){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.nEffects = nEffects;

	this.effects = {};

	for(var i=0; i<this.nEffects; i++){
		this.effects[i] = {effect: new Effect()};
		this.input.connect(this.effects[i].effect.input);
		this.effects[i].effect.connect(this.output);
	}

}

MultiEffect.prototype = {

	input: this.input,
	output: this.output,
	effects: this.effects,
	nEffects: this.nEffects,

	start: function(){
		for(var i=0; i<this.nInstruments; i++){
			this.effects[i].effect.start();
		}
	},

	stop: function(){
		for(var i=0; i<this.nInstruments; i++){
			this.effects[i].effect.stop();
		}
	},

	startAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nInstruments; i++){
			this.effects[i].effect.startAtTime(this.time);
		}

	},

	stopAtTime: function(){

		this.time = time;

		for(var i=0; i<this.nInstruments; i++){
			this.effects[i].effect.stopAtTime(this.time);
		}

	},

	connectAll: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

	connect: function(idx, audioNode){

		this.idx = idx;

		if (audioNode.hasOwnProperty('input') == 1){
			this.effects[this.idx].effect.connect(audioNode.input);
		}
		else {
			this.effects[this.idx].effect.connect(audioNode);
		}
	},

}

//--------------------------------------------------------------

// MY NODES

//--------------------------------------------------------------

function MyWaveShaper(){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.waveShaper = audioCtx.createWaveShaper();

	this.input.connect(this.waveShaper);
	this.waveShaper.connect(this.output);

}

MyWaveShaper.prototype = {

	input: this.input,
	output: this.output,
	waveShaper: this.waveShaper,

	makeConstant: function(value){

		this.nSamples = audioCtx.sampleRate;
		this.curve = new Float32Array(this.nSamples);

		for (var i=0 ; i < this.nSamples; ++i ) {

			this.curve[i] = value;

		}

		this.waveShaper.curve = this.curve;
	},

	makeNoise: function(rangeMin, rangeMax){

		this.nSamples = audioCtx.sampleRate;
		this.curve = new Float32Array(this.nSamples);
		var rangeMin = rangeMin;
		var rangeMax = rangeMax;

		for (var i=0 ; i < this.nSamples; ++i ) {

			this.curve[i] = randomFloat(rangeMin, rangeMax);

		}

		this.waveShaper.curve = this.curve;
	},

	makeSawtooth: function(exp){

		this.exp = exp;
		this.nSamples = audioCtx.sampleRate;
		this.curve = new Float32Array(this.nSamples);

		for (var i=0 ; i < this.nSamples; ++i ) {

			this.curve[i] = Math.pow((i/this.nSamples), this.exp);

		}

		this.waveShaper.curve = this.curve;

	},

	makeInverseSawtooth: function(exp){

		this.exp = exp;
		this.nSamples = audioCtx.sampleRate;
		this.curve = new Float32Array(this.nSamples);

		for (var i=0 ; i < this.nSamples; ++i ) {

			this.curve[i] = Math.pow((1-(i/this.nSamples)), this.exp);

		}

		this.waveShaper.curve = this.curve;
	},

	makeSquare: function(dutyCycle){

		this.nSamples = audioCtx.sampleRate;
		this.curve = new Float32Array(this.nSamples);
		this.dutyCycle = dutyCycle;

		for (var i=0 ; i < this.nSamples; ++i ) {

			if(i<this.nSamples*this.dutyCycle){
				this.curve[i] = 1;
			}

			else if(i>this.nSamples*this.dutyCycle){
				this.curve[i] = 0;
			}

		}

		this.waveShaper.curve = this.curve;
	},

	makeTriangle: function(){

		this.nSamples = audioCtx.sampleRate;
		this.curve = new Float32Array(this.nSamples);

		for (var i=0 ; i < this.nSamples; ++i ) {

			if(i<=this.nSamples/2){
				this.curve[i] = i/(this.nSamples/2);
			}

			else if(i>this.nSamples/2){
				this.curve[i] = 1-((i-this.nSamples/2)/this.nSamples/2);
			}

		}

		this.waveShaper.curve = this.curve;
	},

	makeSine: function(){

		this.nSamples = audioCtx.sampleRate;
		this.curve = new Float32Array(this.nSamples);
		this.twoPi = 2*Math.PI;
		this.v;

		for (var i=0 ; i < this.nSamples; ++i ) {

			this.v = Math.sin(this.twoPi*(i/this.nSamples));

			if(Math.abs(this.v)>=0.0001308996870648116){
				this.curve[i] = this.v;
			}

			else if(Math.abs(this.v)<0.0001308996870648116){
				this.curve[i] = 0;
			}

		}

		this.waveShaper.curve = this.curve;

	},

	makeUnipolarSine: function(){

		this.nSamples = audioCtx.sampleRate;
		this.curve = new Float32Array(this.nSamples);
		this.twoPi = 2*Math.PI;

		for (var i=0 ; i < this.nSamples; ++i ) {

			this.curve[i] = (0.5*(Math.sin(this.twoPi*(i/this.nSamples))))+0.5;

		}

		this.waveShaper.curve = this.curve;

	},

	quantizedWavetable: function(quant, rangeMin, rangeMax){

	    var n_samples = audioCtx.sampleRate;
	    var curve = new Float32Array(n_samples);
	    var mod = n_samples/quant;
	    var modVal;
	    var value;
	    var rangeMin = rangeMin;
	    var rangeMax = rangeMax;

	  for (var i=0 ; i < n_samples; i++ ) {

	  	modVal = i%mod;

	  	if(modVal==0){
	  		value = randomFloat(rangeMin, rangeMax);
	  		}

	  	curve[i] = value;

	  	}

	  	this.waveShaper.curve = curve;

 	},

 	quantizedArrayWavetable: function(quant, valueArray){

	    var n_samples = audioCtx.sampleRate;
	    var curve = new Float32Array(n_samples);
	    var mod = n_samples/quant;
	    var modVal;
	    var value;
	    var valueArray = valueArray;

	  for (var i=0 ; i < n_samples; i++ ) {

	  	modVal = i%mod;

	  	if(modVal==0){
	  		value = valueArray[randomInt(0, valueArray.length)];
	  		}

	  	curve[i] = value;

	  	}

	  	this.waveShaper.curve = curve;

 	},

 	makeSigmoid: function(amount){

 	var k = amount;
    var n_samples = audioCtx.sampleRate;
    var curve = new Float32Array(n_samples);
    var deg = Math.PI / 180;
    var x;

	  for (var i=0; i<n_samples; i++) {
	    x = i * 2 / n_samples - 1;
	    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
	  }

	  	this.waveShaper.curve = curve;

 	},

	makeRamp: function(rampStart, rampEnd){

		this.nSamples = audioCtx.sampleRate;
		this.curve = new Float32Array(this.nSamples);
		this.m = rampEnd-rampStart;
		this.b = rampStart;

		for (var i=0 ; i < this.nSamples; ++i ) {

			this.curve[i] = (this.m*(i/this.nSamples))+this.b;

		}

		this.waveShaper.curve = this.curve;
	},

	additiveBlend: function(ratioArray, ampArray){

		this.nSamples = audioCtx.sampleRate;
		this.curve = new Float32Array(this.nSamples);
		this.twoPi = 2*Math.PI;
		this.ratioArray = ratioArray;
		this.ampArray = ampArray;
		this.arrayLength = ratioArray.length;
		this.idx;

		for (this.idx=0; this.idx<this.arrayLength; this.idx++){

			for (var i=0 ; i <this.nSamples; ++i ) {

			this.curve[i] = ((this.curve[i]+((this.ampArray[this.idx])*((Math.cos((this.ratioArray[this.idx])*(this.twoPi*(i/this.nSamples)))))))/this.arrayLength);

			}

		}

		this.waveShaper.curve = this.curve;

	},

	makeFm: function(cFreq, mFreq, mGain){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;
		this.t;
		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mGain = mGain;

		this.nSamples = audioCtx.sampleRate;
		this.curve = new Float32Array(this.nSamples);

		for (var i=0 ; i < this.nSamples; ++i){
				this.p = i/this.nSamples;
				this.t = this.p*this.twoPi
				this.a2 = this.mGain*(Math.sin(this.mFreq*this.t));
				this.v = Math.sin((this.cFreq+this.a2)*this.t);
				if(Math.abs(this.v) <= 0.0001308996870648116){
					this.curve[i] = 0;
				}
				else if(Math.abs(this.v) > 0.0001308996870648116){
					this.curve[i] = this.v
				}
			}

		this.waveShaper.curve = this.curve;

	},

	makeAm: function(cFreq, mFreq, mGain){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;
		this.t;
		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mGain = mGain;

		this.nSamples = audioCtx.sampleRate;
		this.curve = new Float32Array(this.nSamples);

		for (var i=0 ; i < this.nSamples; ++i){
				this.p = i/this.nSamples;
				this.t = this.p*this.twoPi
				this.a2 = this.mGain*(Math.sin(this.mFreq*this.t));
				this.v = this.a2*Math.sin(this.cFreq*this.t);
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.curve[i] = 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.curve[i] = this.v
				}
			}

		this.waveShaper.curve = this.curve;

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

function MyDelay(length, feedback){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.length = length;
	this.feedback = feedback;

	this.delay = audioCtx.createDelay();
	this.delay.delayTime.value = this.length;

	this.feedbackGain = audioCtx.createGain();
	this.feedbackGain.gain.value = this.feedback;

	this.input.connect(this.delay);
	this.delay.connect(this.feedbackGain);
	this.feedbackGain.connect(this.delay);
	this.delay.connect(this.output);

}

MyDelay.prototype = {

	output: this.output,
	feedbackGain: this.feedbackGain,
	delay: this.delay,

	setFeedback: function(feedback){
		this.feedbackGain.gain.value = feedback;
	},

	setDelayTime: function(delayTime){
		this.delay.delayTime.value = delayTime;
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

function MyStereoDelay(delayTimeL, delayTimeR, feedbackGainValue, dryWetMix){

	this.delayTimeL = delayTimeL;
	this.delayTimeR = delayTimeR;
	this.feedbackGainValue = feedbackGainValue;
	this.dryWetMix = dryWetMix;

	this.delayL = audioCtx.createDelay();
	this.delayL.delayTime.value = this.delayTimeL;
	this.delayR = audioCtx.createDelay();
	this.delayR.delayTime.value = this.delayTimeR;

	this.feedbackGain = audioCtx.createGain();

	this.delayL.connect(this.feedbackGain);
	this.delayR.connect(this.feedbackGain);
	this.feedbackGain.connect(this.delayL);
	this.feedbackGain.connect(this.delayR);
	this.feedbackGain.gain.value = this.feedbackGainValue;

	this.input = audioCtx.createGain();

	this.dryGain = audioCtx.createGain();
	this.wetGainL = audioCtx.createGain();
	this.wetGainR = audioCtx.createGain();

	this.panL = audioCtx.createPanner();
	this.panR = audioCtx.createPanner();
	this.panL.setPosition(-1, 0, 0);
	this.panR.setPosition(1, 0, 0);

	this.input.connect(this.dryGain);
	this.input.connect(this.delayL);
	this.input.connect(this.delayR);
	this.delayL.connect(this.wetGainL);
	this.delayR.connect(this.wetGainR);
	this.wetGainL.connect(this.panL);
	this.wetGainR.connect(this.panR);

	this.dryGain.gain.value = 1-this.dryWetMix;
	this.wetGainL.gain.value = this.dryWetMix;
	this.wetGainR.gain.value = this.dryWetMix;

	this.output = audioCtx.createGain();

	this.dryGain.connect(this.output);
	this.panL.connect(this.output);
	this.panR.connect(this.output);


}

MyStereoDelay.prototype = {
	delayL: this.delayL,
	delayR: this.delayR,
	feedbackGain: this.feedbackGain,
	input: this.input,
	dryGain: this.dryGain,
	wetGain: this.wetGain,
	output: this.output,

	maxDelayTime: this.maxDelayTime,
	delayTimeL: this.delayTimeL,
	delayTimeR: this.delayTimeR,
	feedbackGainValue: this.feedbackGainValue,
	dryWetMix: this.dryWetMix,

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	}
}

//--------------------------------------------------------------

function MyPanner(x, y, z){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.x = x;
	this.y = y;
	this.z = z;

	this.panner = audioCtx.createPanner();
	this.panner.setPosition(this.x, this.y, this.z);

	this.input.connect(this.panner);
	this.panner.connect(this.output);

}

MyPanner.prototype = {

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

function MyPanner2(position){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.position = (position+1)/2;

	this.panL = audioCtx.createPanner();
	this.panR = audioCtx.createPanner();
	this.panL.setPosition(-1, 0, 0);
	this.panR.setPosition(1, 0, 0);

	this.gainL = audioCtx.createGain();
	this.gainR = audioCtx.createGain();
	this.gainL.gain.value = 1-this.position;
	this.gainR.gain.value = this.position;

	this.input.connect(this.panL);
	this.input.connect(this.panR);
	this.panL.connect(this.gainL);
	this.panR.connect(this.gainR);
	this.gainL.connect(this.output);
	this.gainR.connect(this.output);

}

MyPanner2.prototype = {

	output: this.output,
	gainL: this.gainL,
	gainR: this.gainR,

	setPosition: function(position){
		this.position = (position+1)/2;
		this.gainL.gain.value = 1-this.position;
		this.gainR.gain.value = this.position;
	},

	setPositionAtTime: function(position, time){

		this.time = time;

		this.position = (position+1)/2;
		this.gainL.gain.setValueAtTime(1-this.position, this.time);
		this.gainR.gain.setValueAtTime(this.position, this.time);

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

function MyOsc(type, frequency){

	this.type = type;
	this.frequency = frequency;

	this.frequencyInlet = audioCtx.createGain();
	this.frequencyInlet.gain.value = 1;

	this.output = audioCtx.createGain();

}

MyOsc.prototype = {

	output: this.output,
	osc: this.osc,
	type: this.type,
	frequency: this.frequency,
	frequencyInlet: this.frequencyInlet,
	detune: this.detune,

	start: function(){
		this.osc = audioCtx.createOscillator();
		this.osc.type = this.type;
		this.osc.frequency.value = this.frequency;
		this.frequencyInlet.connect(this.osc.frequency);
		this.osc.connect(this.output);
		this.osc.start();
	},

	stop: function(){
		this.osc.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.osc = audioCtx.createOscillator();
		this.osc.type = this.type;
		this.osc.frequency.value = this.frequency;
		this.frequencyInlet.connect(this.osc.frequency);
		this.osc.connect(this.output);
		this.osc.start(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.osc.stop(this.time);

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

function MyGain(gain){

	this.gainVal = gain;

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();
	this.gain = audioCtx.createGain();

	this.gain.gain.value = this.gainVal;

	this.input.connect(this.gain);
	this.gain.connect(this.output);

}

MyGain.prototype = {

	input: this.input,
	output: this.output,
	gain: this.gain,

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

function MyBiquad(type, frequency, Q){

	this.type = type;
	this.frequency = frequency;
	this.Q = Q;

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.biquad = audioCtx.createBiquadFilter();
	this.biquad.type = this.type;
	this.biquad.frequency.value = this.frequency;
	this.biquad.Q.value = this.Q;

	this.input.connect(this.biquad);
	this.biquad.connect(this.output);

}

MyBiquad.prototype = {

	input: this.input,
	output: this.output,
	biquad: this.biquad,

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

function MyPeriodicOscillator(frequency, realArray, imagArray){

	this.frequency = frequency;
	this.realArray = realArray;
	this.imagArray = imagArray;

	this.real = new Float32Array(realArray.length);
	this.imag = new Float32Array(imagArray.length);

	this.output = audioCtx.createGain();

	for(this.i=0; this.i<this.realArray.length; this.i++){
		this.real[this.i] = this.realArray[this.i];
		this.imag[this.i] = this.imagArray[this.i];
	}

	this.wave = audioCtx.createPeriodicWave(this.real, this.imag, {disableNormalization: true});

}

MyPeriodicOscillator.prototype = {

	output: this.output,
	osc: this.osc,
	frequency: this.frequency,
	wave: this.wave,

	start: function(){
		this.osc = audioCtx.createOscillator();
		this.osc.setPeriodicWave(this.wave);
		this.osc.frequency.value = this.frequency;
		this.osc.connect(this.output);
		this.osc.start();
	},

	stop: function(){
		this.osc.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.osc = audioCtx.createOscillator();
		this.osc.setPeriodicWave(this.wave);
		this.osc.frequency.value = this.frequency;
		this.osc.connect(this.output);
		this.osc.start(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.osc.stop(this.time);

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

function MyConvolver(nChannels, length, sRate){

	this.nChannels = nChannels;
	this.length = length;
	this.sRate = sRate;

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.convolver = audioCtx.createConvolver();
	this.buffer = audioCtx.createBuffer(this.nChannels, this.sRate*this.length, this.sRate);

	this.input.connect(this.convolver);
	this.convolver.connect(this.output);

}

MyConvolver.prototype = {

	input: this.input,
	output: this.output,
	convolver: this.convolver,
	buffer: this.buffer,

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

	makeSine: function(){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
				this.p = this.i/this.buffer.length;
				this.v = Math.sin(this.twoPi*this.p);
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] = 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] = this.v
				}
			}
		}

		this.convolver.buffer = this.buffer;

	},

	makeFm: function(cFreq, mFreq, mGain){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;
		this.t;
		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mGain = mGain;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
				this.p = this.i/this.buffer.length;
				this.t = this.p*this.twoPi
				this.a2 = this.mGain*(Math.sin(this.mFreq*this.t));
				this.v = Math.sin((this.cFreq+this.a2)*this.t);
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] = 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] = this.v
				}
			}
		}

		this.convolver.buffer = this.buffer;

	},

	makeAm: function(cFreq, mFreq, mGain){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;
		this.t;
		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mGain = mGain;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
				this.p = this.i/this.buffer.length;
				this.t = this.p*this.twoPi
				this.a2 = this.mGain*(Math.sin(this.mFreq*this.t));
				this.v = this.a2*Math.sin(this.cFreq*this.t);
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] = 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] = this.v
				}
			}
		}

		this.convolver.buffer = this.buffer;

	},

	makeUnipolarSine: function(){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
				this.p = this.i/this.buffer.length;
				this.v = (0.5*(Math.sin(this.twoPi*(this.p))))+0.5;
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] = 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] = this.v
				}
			}
		}

		this.convolver.buffer = this.buffer;

	},

 	makeSigmoid: function(amount){

 	this.k = amount;
    this.deg = Math.PI / 180;
    this.x;
    this.nSamples = audioCtx.sampleRate;

	  for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.x = this.i * 2 / this.nSamples - 1;
					this.nowBuffering[this.i] = ( 3 + this.k ) * this.x * 20 * this.deg / ( Math.PI + this.k * Math.abs(this.x) );
			}
		}

		this.convolver.buffer = this.buffer;
 	},

	makeSawtooth: function(exp){

		this.exp = exp;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.pow((this.i/this.buffer.length), this.exp);
			}
		}

		this.convolver.buffer = this.buffer;
	},

	makeInverseSawtooth: function(exp){

		this.exp = exp;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.pow(1-(this.i/this.buffer.length), this.exp);
			}
		}

		this.convolver.buffer = this.buffer;

	},

	makeNoise: function(){

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.random() * 2 - 1;
			}
		}

		this.convolver.buffer = this.buffer;
	},

	makeConstant: function(value){

		this.value = value;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = this.value;
			}
		}

		this.convolver.buffer = this.buffer;
	},

	makeSquare: function(dutyCycle){

		this.dutyCycle = dutyCycle;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i<this.buffer.length*this.dutyCycle){
					this.nowBuffering[this.i] = 1;
				}

				else if(this.i>this.buffer.length*this.dutyCycle){
					this.nowBuffering[this.i] = 0;
				}
			}
		}

		this.convolver.buffer = this.buffer;

	},

	floatingCycleSquare: function(cycleStart, cycleEnd){

		this.cycleStart = cycleStart;
		this.cycleEnd = cycleEnd;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i>=this.buffer.length*this.cycleStart && this.i<=this.buffer.length*this.cycleEnd){
					this.nowBuffering[this.i] = 1;
				}
				else if(this.i<=this.buffer.length*this.cycleStart || this.i>=this.buffer.length*this.cycleEnd){
					this.nowBuffering[this.i] = 0;
				}
			}
		}
	},

	makeRamp: function(peakPoint, upExp, downExp){

		this.peakPoint = parseInt(this.buffer.length*peakPoint);
		this.upExp = upExp;
		this.downExp = downExp;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i<=this.peakPoint){
					this.nowBuffering[this.i] = Math.pow(this.i/this.peakPoint, this.upExp);
				}

				else if(this.i>this.peakPoint){
					this.nowBuffering[this.i] = Math.pow(1-((this.i-this.peakPoint)/(this.buffer.length-this.peakPoint)), this.downExp);
				}
			}
		}
	},

	quantizedArrayBuffer: function(quant, valueArray){

		this.quant = quant;
		this.valueArray = valueArray;

	    this.n_samples = this.buffer.length;
	    this.curve = new Float32Array(this.n_samples);
	    this.mod = this.n_samples/this.quant;
	    this.modVal;
	    this.value;
			this.j = 0;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){

			this.nowBuffering = this.buffer.getChannelData(this.channel);

			for (this.i=0; this.i<this.buffer.length; this.i++){

				this.modVal = this.i%this.mod;

				if(this.modVal==0){
	  				this.value = this.valueArray[this.j%this.valueArray.length];
						this.j++;
	  			}

				this.nowBuffering[this.i] = this.value;

			}
		}

		this.convolver.buffer = this.buffer;
 	},

	applyDecay: function(exp){

		this.exp = exp;
		this.l;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.l = Math.pow(1-(this.i/this.buffer.length), this.exp);
					this.nowBuffering[this.i] *= this.l;
			}
		}
		this.convolver.buffer = this.buffer;
	},

	applyRamp: function(peakPoint, upExp, downExp){

		this.peakPoint = parseInt(this.buffer.length*peakPoint);
		this.upExp = upExp;
		this.downExp = downExp;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i<=this.peakPoint){
					this.nowBuffering[this.i] *= Math.pow(this.i/this.peakPoint, this.upExp);
				}

				else if(this.i>this.peakPoint){
					this.nowBuffering[this.i] *= Math.pow(1-((this.i-this.peakPoint)/(this.buffer.length-this.peakPoint)), this.downExp);
				}
			}
		}
		this.convolver.buffer = this.buffer;
	},

	applySquare: function(dutyCycle){

		this.dutyCycle = dutyCycle;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i<this.buffer.length*this.dutyCycle){
					this.nowBuffering[this.i] *= 1;
				}

				else if(this.i>this.buffer.length*this.dutyCycle){
					this.nowBuffering[this.i] *= 0;
				}
			}
		}

		this.convolver.buffer = this.buffer;

	},

	applySine: function(freq){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;
		this.f = freq;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
				this.p = this.i/this.buffer.length;
				this.v = Math.sin(this.twoPi*(this.p*this.f));
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] *= 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] *= this.v
				}
			}
		}

		this.convolver.buffer = this.buffer;

	},

	applyUnipolarSine: function(freq){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;
		this.f = freq;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
				this.p = this.i/this.buffer.length;
				this.v = (0.5*(Math.sin(this.twoPi*(this.p*this.f))))+0.5;
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] *= 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] *= this.v
				}
			}
		}

		this.convolver.buffer = this.buffer;

	},

	applyQuantizedArrayBuffer: function(quant, valueArray){

		this.quant = quant;
		this.valueArray = valueArray;

			this.n_samples = this.buffer.length;
			this.curve = new Float32Array(this.n_samples);
			this.mod = this.n_samples/this.quant;
			this.modVal;
			this.value;
			this.j = 0;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){

			this.nowBuffering = this.buffer.getChannelData(this.channel);

			for (this.i=0; this.i<this.buffer.length; this.i++){

				this.modVal = this.i%this.mod;

				if(this.modVal==0){
						this.value = this.valueArray[this.j%this.valueArray.length];
						this.j++;
					}

				this.nowBuffering[this.i] *= this.value;

			}
		}

		this.convolver.buffer = this.buffer;
	},

	applyNoise: function(amount){

		this.a = amount;
		this.r;
		this.v;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.r = Math.random() * 2 - 1;
					this.v = 1-(this.r*this.a);
					this.nowBuffering[this.i] *= this.v;
			}
		}

		this.convolver.buffer = this.buffer;
	},

	applyFloatingCycleSquare: function(cycleStart, cycleEnd){

		this.cycleStart = cycleStart;
		this.cycleEnd = cycleEnd;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i>=this.buffer.length*this.cycleStart && this.i<=this.buffer.length*this.cycleEnd){
					this.nowBuffering[this.i] = 1;
				}
				else if(this.i<=this.buffer.length*this.cycleStart || this.i>=this.buffer.length*this.cycleEnd){
					this.nowBuffering[this.i] = 0;
				}
			}
		}
	},

	applyFm: function(cFreq, mFreq, mGain){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;
		this.t;
		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mGain = mGain;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
				this.p = this.i/this.buffer.length;
				this.t = this.p*this.twoPi
				this.a2 = this.mGain*(Math.sin(this.mFreq*this.t));
				this.v = Math.sin((this.cFreq+this.a2)*this.t);
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] *= 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] *= this.v
				}
			}
		}

		this.convolver.buffer = this.buffer;

	},

	applyAm: function(cFreq, mFreq, mGain){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;
		this.t;
		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mGain = mGain;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
				this.p = this.i/this.buffer.length;
				this.t = this.p*this.twoPi
				this.a2 = this.mGain*(Math.sin(this.mFreq*this.t));
				this.v = this.a2*Math.sin(this.cFreq*this.t);
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] *= 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] *= this.v
				}
			}
		}

		this.convolver.buffer = this.buffer;

	},

}

//--------------------------------------------------------------

function MyBuffer(nChannels, length, sRate){

	this.output = audioCtx.createGain();

	this.nChannels = nChannels;
	this.length = length;
	this.sRate = sRate;

	this.playbackRateInlet = new MyGain(1);

	this.buffer = audioCtx.createBuffer(this.nChannels, this.sRate*this.length, this.sRate);

}

MyBuffer.prototype = {

	output: this.output,
	buffer: this.buffer,
	playbackRate: this.playbackRate,
	loop: this.loop,

	playbackRateInlet: this.playbackRateInlet,

	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.loop = this.loop;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.buffer = this.buffer;
		this.playbackRateInlet.connect(this.bufferSource.playbackRate);
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	stop: function(){
		this.bufferSource.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.loop = this.loop;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.buffer = this.buffer;
		this.playbackRateInlet.connect(this.bufferSource.playbackRate);
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

	},

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

	makeSine: function(){

		this.twoPi = Math.PI*2;
		this.t;
		this.v;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
				this.t = this.i/this.buffer.length;
				this.v = Math.sin(this.twoPi*this.t);
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] = 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] = this.v
				}
			}
		}
	},

	makeUnipolarSine: function(){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
				this.p = this.i/this.buffer.length;
				this.v = (0.5*(Math.sin(this.twoPi*(this.p))))+0.5;
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] = 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] = this.v
				}
			}
		}
	},

	additiveSynth: function(overtoneArray, amplitudeArray){

		this.overtoneArray = overtoneArray;
		this.amplitudeArray = amplitudeArray;

		this.twoPi = Math.PI*2;
		this.t;
		this.v;
		this.f;
		this.a;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			this.f = this.overtoneArray[this.channel];
			this.a = this.amplitudeArray[this.channel];
			for (this.i=0; this.i<this.buffer.length; this.i++){

				this.t = this.i/this.buffer.length;
				this.v = this.a*(Math.sin(this.twoPi*this.f*this.t));

				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] = 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] = this.v
				}

			}
		}
	},

	makeSawtooth: function(exp){

		this.exp = exp;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.pow((this.i/this.buffer.length), this.exp);
			}
		}
	},

	makeInverseSawtooth: function(exp){

		this.exp = exp;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.pow(1-(this.i/this.buffer.length), this.exp);
			}
		}
	},

	makeTriangle: function(){

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i<=this.buffer.length/2){
					this.nowBuffering[this.i] = this.i/(this.buffer.length/2);
				}

				else if(this.i>this.buffer.length/2){
					this.nowBuffering[this.i] = 1-((this.i-this.buffer.length/2)/(this.buffer.length/2));
				}

			}
		}
	},

	makeRamp: function(peakPoint, upExp, downExp){

		this.peakPoint = parseInt(this.buffer.length*peakPoint);
		this.upExp = upExp;
		this.downExp = downExp;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i<=this.peakPoint){
					this.nowBuffering[this.i] = Math.pow(this.i/this.peakPoint, this.upExp);
				}

				else if(this.i>this.peakPoint){
					this.nowBuffering[this.i] = Math.pow(1-((this.i-this.peakPoint)/(this.buffer.length-this.peakPoint)), this.downExp);
				}
			}
		}
	},

	makeNoise: function(){

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.random() * 2 - 1;
			}
		}
	},

	makeUnipolarNoise: function(){

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.random();
			}
		}
	},

	makeConstant: function(value){

		this.value = value;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = this.value;
			}
		}
	},

	makeSquare: function(dutyCycle){

		this.dutyCycle = dutyCycle;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i<this.buffer.length*this.dutyCycle){
					this.nowBuffering[this.i] = 1;
				}

				else if(this.i>this.buffer.length*this.dutyCycle){
					this.nowBuffering[this.i] = 0;
				}
			}
		}
	},

	floatingCycleSquare: function(cycleStart, cycleEnd){

		this.cycleStart = cycleStart;
		this.cycleEnd = cycleEnd;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i>=this.buffer.length*this.cycleStart && this.i<=this.buffer.length*this.cycleEnd){
					this.nowBuffering[this.i] = 1;
				}
				else if(this.i<=this.buffer.length*this.cycleStart || this.i>=this.buffer.length*this.cycleEnd){
					this.nowBuffering[this.i] = 0;
				}
			}
		}
	},

	makeFm: function(cFreq, mFreq, mGain){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;
		this.t;
		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mGain = mGain;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
				this.p = this.i/this.buffer.length;
				this.t = this.p*this.twoPi
				this.a2 = this.mGain*(Math.sin(this.mFreq*this.t));
				this.v = Math.sin((this.cFreq+this.a2)*this.t);
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] = 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] = this.v
				}
			}
		}

	},

	makeAm: function(cFreq, mFreq, mGain){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;
		this.t;
		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mGain = mGain;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
				this.p = this.i/this.buffer.length;
				this.t = this.p*this.twoPi
				this.a2 = this.mGain*(Math.sin(this.mFreq*this.t));
				this.v = this.a2*Math.sin(this.cFreq*this.t);
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] = 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] = this.v
				}
			}
		}

	},

	quantizedArrayBuffer: function(quant, valueArray){

		this.quant = quant;
		this.valueArray = valueArray;

	    this.n_samples = this.buffer.length;
	    this.curve = new Float32Array(this.n_samples);
	    this.mod = this.n_samples/this.quant;
	    this.modVal;
	    this.value;
			this.j = 0;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){

			this.nowBuffering = this.buffer.getChannelData(this.channel);

			for (this.i=0; this.i<this.buffer.length; this.i++){

				this.modVal = this.i%this.mod;

				if(this.modVal==0){
	  				this.value = this.valueArray[this.j%this.valueArray.length];
						this.j++;
	  			}

				this.nowBuffering[this.i] = this.value;

			}
		}
 	},

	applyDecay: function(exp){

		this.exp = exp;
		this.l;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.l = Math.pow(1-(this.i/this.buffer.length), this.exp);
					this.nowBuffering[this.i] *= this.l;
			}
		}
	},

	applyRamp: function(peakPoint, upExp, downExp){

		this.peakPoint = parseInt(this.buffer.length*peakPoint);
		this.upExp = upExp;
		this.downExp = downExp;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i<=this.peakPoint){
					this.nowBuffering[this.i] *= Math.pow(this.i/this.peakPoint, this.upExp);
				}

				else if(this.i>this.peakPoint){
					this.nowBuffering[this.i] *= Math.pow(1-((this.i-this.peakPoint)/(this.buffer.length-this.peakPoint)), this.downExp);
				}
			}
		}
	},

	applySquare: function(dutyCycle){

		this.dutyCycle = dutyCycle;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i<this.buffer.length*this.dutyCycle){
					this.nowBuffering[this.i] *= 1;
				}

				else if(this.i>this.buffer.length*this.dutyCycle){
					this.nowBuffering[this.i] *= 0;
				}
			}
		}
	},

	applySine: function(freq){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;
		this.f = freq;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
				this.p = this.i/this.buffer.length;
				this.v = Math.sin(this.twoPi*(this.p*this.f));
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] *= 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] *= this.v
				}
			}
		}
	},

	applyUnipolarSine: function(freq){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;
		this.f = freq;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
				this.p = this.i/this.buffer.length;
				this.v = (0.5*(Math.sin(this.twoPi*(this.p*this.f))))+0.5;
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] *= 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] *= this.v
				}
			}
		}
	},

	applyQuantizedArrayBuffer: function(quant, valueArray){

		this.quant = quant;
		this.valueArray = valueArray;

			this.n_samples = this.buffer.length;
			this.curve = new Float32Array(this.n_samples);
			this.mod = this.n_samples/this.quant;
			this.modVal;
			this.value;
			this.j = 0;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){

			this.nowBuffering = this.buffer.getChannelData(this.channel);

			for (this.i=0; this.i<this.buffer.length; this.i++){

				this.modVal = this.i%this.mod;

				if(this.modVal==0){
						this.value = this.valueArray[this.j%this.valueArray.length];
						this.j++;
					}

				this.nowBuffering[this.i] *= this.value;

			}
		}
	},

	applyNoise: function(amount){

		this.a = amount;
		this.r;
		this.v;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.r = Math.random() * 2 - 1;
					this.v = 1-(this.r*this.a);
					this.nowBuffering[this.i] *= this.v;
			}
		}
	},

	applyFloatingCycleSquare: function(cycleStart, cycleEnd){

		this.cycleStart = cycleStart;
		this.cycleEnd = cycleEnd;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i>=this.buffer.length*this.cycleStart && this.i<=this.buffer.length*this.cycleEnd){
					this.nowBuffering[this.i] *= 1;
				}
				else if(this.i<=this.buffer.length*this.cycleStart || this.i>=this.buffer.length*this.cycleEnd){
					this.nowBuffering[this.i] *= 0;
				}
			}
		}
	},

	applyFm: function(cFreq, mFreq, mGain){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;
		this.t;
		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mGain = mGain;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
				this.p = this.i/this.buffer.length;
				this.t = this.p*this.twoPi
				this.a2 = this.mGain*(Math.sin(this.mFreq*this.t));
				this.v = Math.sin((this.cFreq+this.a2)*this.t);
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] *= 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] *= this.v
				}
			}
		}

	},

	applyAm: function(cFreq, mFreq, mGain){

		this.twoPi = Math.PI*2;
		this.p;
		this.v;
		this.t;
		this.cFreq = cFreq;
		this.mFreq = mFreq;
		this.mGain = mGain;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
				this.p = this.i/this.buffer.length;
				this.t = this.p*this.twoPi
				this.a2 = this.mGain*(Math.sin(this.mFreq*this.t));
				this.v = this.a2*Math.sin(this.cFreq*this.t);
				if(Math.abs(this.v) <= 0.00013089969352576765){
					this.nowBuffering[this.i] *= 0;
				}
				else if(Math.abs(this.v) > 0.00013089969352576765){
					this.nowBuffering[this.i] *= this.v
				}
			}
		}

	},

}

//--------------------------------------------------------------

function MyCompressor(ratio, attack, release, threshold, makeUp){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

	this.ratio = ratio;
	this.attack = attack;
	this.release = release;
	this.threshold = threshold;
	this.makeUp = makeUp;

	this.compressor = audioCtx.createDynamicsCompressor();
	this.compressor.ratio.value = this.ratio;
	this.compressor.attack.value = this.attack;
	this.compressor.release.value = this.release;
	this.compressor.threshold.value = this.threshold;

	this.makeUpGain = new MyGain(this.makeUp);

	this.input.connect(this.compressor);
	this.compressor.connect(this.makeUpGain.input);
	this.makeUpGain.connect(this.output);

}

MyCompressor.prototype = {

	input: this.input,
	output: this.output,
	compressor: this.compressor,
	makeUpGain: this.makeUpGain,

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

// PRESETS

//--------------------------------------------------------------

function ConvolverPreset(){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

}

ConvolverPreset.prototype = {

	input: this.input,
	output: this.output,
	convolver: this.convolver,

	noiseReverb: function(length, decayExp){

		this.length = length;
		this.decayExp = decayExp;

		this.convolver = new MyConvolver(2, this.length, audioCtx.sampleRate);
		this.convolver.makeNoise();
		this.convolver.applyDecay(this.decayExp);

		this.input.connect(this.convolver.input);
		this.convolver.connect(this.output);

		this.buffer = this.convolver.buffer;

	},

	preset1: function(){

		this.convolver = new MyConvolver(1, 0.25, audioCtx.sampleRate);
		this.convolver.makeAm(432, 432*2, 1);

		this.input.connect(this.convolver.input);
		this.convolver.connect(this.output);

		this.buffer = this.convolver.buffer;

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

function BufferPreset(){

	this.output = audioCtx.createGain();

	this.playbackRateInlet = new MyGain(1);

}

BufferPreset.prototype = {

	output: this.output,
	myBuffer: this.myBuffer,
	buffer: this.buffer,
	playbackRate: this.playbackRate,
	loop: this.loop,

	playbackRateInlet: this.playbackRateInlet,

	preset1: function(){

		this.myBuffer = new MyBuffer(1, 1, audioCtx.sampleRate);
		this.buffer = this.myBuffer.buffer;

		this.myBuffer.makeAm(1, 4, 1);
		// this.myBuffer.applyFm(2.1, 10, 1);

	},

	cBP1: function(){

		this.myBuffer = new MyBuffer(1, 1, audioCtx.sampleRate);
		this.buffer = this.myBuffer.buffer;

		this.myBuffer.makeAm(1, 4, 1);
		this.myBuffer.applyFm(2.1, 10, 1);

	},

	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.loop = this.loop;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.buffer = this.buffer;
		this.playbackRateInlet.connect(this.bufferSource.playbackRate);
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	stop: function(){
		this.bufferSource.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.loop = this.loop;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.buffer = this.buffer;
		this.playbackRateInlet.connect(this.bufferSource.playbackRate);
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

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

function EnvelopePreset(){

	this.output = audioCtx.createGain();
	this.envelopeBuffer = new EnvelopeBuffer();

}

EnvelopePreset.prototype = {

	output: this.output,
	envelopeBuffer: this.envelopeBuffer,
	loop: this.loop,

	evenRamp: function(length){

		this.length = length;

		this.envelopeBuffer.makeExpEnvelope(
			[1, this.length*0.5, 0, this.length*0.5],
			[1, 1],
		);

		this.buffer = this.envelopeBuffer.buffer;

	},

	customRamp: function(length, peakPoint, upExp, downExp){

		this.length = length;
		this.peakPoint = peakPoint;
		this.upExp = upExp;
		this.downExp = downExp;

		this.envelopeBuffer.makeExpEnvelope(
			[1, this.length*this.peakPoint, 0, this.length*(1-this.peakPoint)],
			[this.upExp, this.downExp]
		);

		this.buffer = this.envelopeBuffer.buffer;

	},

	ee_pr1_pluck1: function(){

		this.envelopeBuffer.makeExpEnvelope(
			[1, 0.01, 0.5, 0.05, 0.1, 0.25, 0, 0.25],
			[0.1, 1, 1.5, 2],
		);

		this.buffer = this.envelopeBuffer.buffer;

	},

	ee_pr2_pluck2: function(){

		this.envelopeBuffer.makeEnvelope(
			[1, 0.01, 0.5, 0.05, 0.1, 0.25, 0, 0.25]
		);

		this.buffer = this.envelopeBuffer.buffer;

	},

	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	stop: function(){
		this.bufferSource.stop();
	},

	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

	},

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

	makeExpEnvelope: function(eArray, expArray){

		this.eArray,
		this.expArray,

		this.envelopeBuffer.makeExpEnvelope(this.eArray, this.expArray);

		this.buffer = this.envelopeBuffer.buffer;

	},

	makeEnvelope: function(eArray){

		this.eArray = eArray;

		this.envelopeBuffer.makeEnvelope(this.eArray);

		this.buffer = this.envelopeBuffer.buffer;

	},

}
