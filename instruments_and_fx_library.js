// template for an instrument or effect object
function InstrumentConstructorTemplate(){

	this.output = audioCtx.createGain();

}

InstrumentConstructorTemplate.prototype = {

	output: this.output,

	// connect the output of this node to the input of another
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

// BUFFERS (2)
//  - a pair of commonly used buffers

//--------------------------------------------------------------

// create a buffer containing a single value
function BufferConstant(value){

	this.value = value;
	this.output = audioCtx.createGain();

	this.bufferSource = audioCtx.createBufferSource();

	this.buffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);

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

	// output constant (on loop) immediately
	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.loop = "true";
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	// stop outputting constant immediately
	stop: function(){
		this.bufferSource.stop();
	},

	// begin outputting constant (on loop) at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.loop = "true";
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	// stop outputting constant at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

	},

	// connect the output node of this object to the input of another
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

// create a buffer containing random values
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

	// output buffer contents (on loop) immediately
	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.loop = "true";
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	// stop outputting buffer contents immediately
	stop: function(){
		this.bufferSource.stop();
	},

	// begin outputting buffer contents (on loop) at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.loop = "true";
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	// stop outputting buffer contents at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

	},

	// connect the output node of this object to the input of another
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

// CV NODES (8)
//  - objects for creating parameter control signals (control voltages)

//--------------------------------------------------------------

// create a buffer containing a custom breakpoint function from an array of "duration, value" pairs,
// starting at 0
// expArray specifies exponential curves applied to each line segment
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

	// output buffer contents immediately
	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	// stop outputting buffer contents immediately
	stop: function(){
		this.bufferSource.stop();
	},

	// begin outputting buffer contents at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	// stop outputting constant at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

	},

	// connect the output node of this object to the input of another
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

// container for envelope presets
function EnvelopeBuffer(){

}

EnvelopeBuffer.prototype = {

	// create a buffer containing a custom breakpoint function from an array of "time, value" pairs
	// expArray specifies exponential curves applied to each line segment
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

	// create a custom breakpoint function from an array of "time, value" pairs
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

// create a custom breakpoint function from an array of "time, value" pairs,
// starting at 0
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

	// output buffer contents immediately
	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	// stop outputting buffer contents immediately
	stop: function(){
		this.bufferSource.stop();
	},

	// begin outputting buffer contents at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	// stop outputting buffer contents at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

	},

	// connect the output node of this object to the input of another
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

// create a custom breakpoint function from an array of "time, value" pairs,
// starting at a specified value
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

	// output buffer contents immediately
	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	// stop outputting buffer contents immediately
	stop: function(){
		this.bufferSource.stop();
	},

	// begin outputting buffer contents at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	// stop outputting buffer contents at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

	},

	// connect the output node of this object to the input of another
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

// create a custom breakpoint function from an array of "time, value" pairs,
// starting at 0
// expArray specifies exponential curves applied to each line segment
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

	// output buffer contents immediately
	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	// stop outputting buffer contents immediately
	stop: function(){
		this.bufferSource.stop();
	},

	// begin outputting buffer contents at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	// stop outputting buffer contents at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

	},

	// connect the output node of this object to the input of another
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

// create a custom breakpoint function from an array of "time, value" pairs,
// starting at a specified value
// expArray specifies exponential curves applied to each line segment
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

	// output buffer contents immediately
	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	// stop outputting buffer contents immediately
	stop: function(){
		this.bufferSource.stop();
	},

	// begin outputting buffer contents at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	// stop outputting buffer contents at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

	},

	// connect the output node of this object to the input of another
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

// create a buffer to be filled with a custom shape (via MyBuffer methods),
// scale its output bewteen the specified, min and max, and loop it at the
// specified rate
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
	min: this.min,
	max: this.max,
	rate: this.rate,

	// output buffer contents (on loop) immediately
	start: function(){
		this.buffer.start();
		this.constant.start();
	},

	// stop outputting buffer contents immediately
	stop: function(){
		this.buffer.stopAtTime();
		this.constant.stopAtTime();
	},

	// begin outputting buffer contents (on loop) at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.buffer.startAtTime(this.time);
		this.constant.startAtTime(this.time);

	},

	// stop outputting buffer contents at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.buffer.stopAtTime(this.time);
		this.constant.stopAtTime(this.time);

	},

	// connect the output node of this object to the input of another
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

// fill a buffer with a specified periodic wave, scale its output
// bewteen the specified min and max, and loop it at the specified rate
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

	// output buffer contents (on loop) immediately
	start: function(){
		this.pWave = new MyPeriodicOscillator(this.rate, this.rArray, this.iArray);
		this.pWave.connect(this.bG);
		this.pWave.start();
		this.constant.start();
	},

	// stop outputting buffer contents immediately
	stop: function(){
		this.pWave.stop();
		this.constant.stop();
	},

	// begin outputting buffer contents (on loop) at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.pWave = new MyPeriodicOscillator(this.rate, this.rArray, this.iArray);
		this.pWave.connect(this.bG);
		this.pWave.startAtTime(this.time);
		this.constant.startAtTime(this.time);

	},

	// stop outputting buffer contents at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.pWave.stopAtTime(this.time);
		this.constant.stopAtTime(this.time);

	},

	// connect the output node of this object to the input of another
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

// EFFECTS (14)
//  - objects for processing audio signals

//--------------------------------------------------------------

// multiply an incoming signal by the output of an LFO
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

	// begin lfo immediately
	start: function(){
		this.lfo.start();
	},

	// stop lfo immediately
	stop: function(){
		this.lfo.stop();
	},

	// start lfo at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.lfo.startAtTime(this.time);

	},

	// stop lfo at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.lfo.startAtTime(this.time);

	},

	// connect the output node of this object to the input of another
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

// create a network of delays that model the resonance of a membrane
// described by "dimensionValues" and "modeArray"
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

	// connect the output node of this object to the input of another
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

// stereo delay gated by a square wave LFO, with the feedback gain
// modulated by another LFO - initialized with preset methods
function DelayTapLFOFeedback(){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

}

DelayTapLFOFeedback.prototype = {

	input: this.input,
	output: this.output,

	// begin gate and feedback LFO()s immediately
	start: function(){
		this.tO.start();
		this.feedbackLFO.start();
	},

	// stop gate and feedback LFO()s immediately
	stop: function(){
		this.tO.stop();
		this.feedbackLFO.stop();
	},

	// start gate and feedback LFO()s (on loop) at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.tO.startAtTime(this.time);
		this.feedbackLFO.startAtTime(this.time);

	},

	// stop gate and feedback LFO()s (on loop) at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.tO.stopAtTime(this.time);
		this.feedbackLFO.stopAtTime(this.time);

	},

	// template for a preset method
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

	// preset 1
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

	// preset 2
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

	// preset 3
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

	// preset 4
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

	// preset 5
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

	// preset 6
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

	// preset 7
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

	// preset 8
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

	// preset 9
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

	// preset 10
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

	// preset 11
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

	// connect the output node of this object to the input of another
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

// sweep the cutoff frequency of a filter with an Envelope
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

	// start the Envelope() immediately
	start: function(){
		this.envelope.start();
	},

	// stop the Envelope() immediately
	stop: function(){
		this.envelope.stop();
	},

	// start the Envelope() at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.envelope.startAtTime(this.time);

	},

	// stop the Envelope() at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.envelope.startAtTime(this.time);

	},

	// connect the output node of this object to the input of another
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

// create a smooth transition between changing constant values
// by sending them through a lowpass filter
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

	// change BufferConstant() value immediately
	start: function(fadeTarget, filterFreq){

		this.fadeTarget = fadeTarget;
		this.filterFreq = filterFreq;

		this.fadeConstantFilter.biquad.frequency.value = this.filterFreq;
		this.fadeConstantGain.gain.gain.value = this.fadeTarget;

	},

	// change BufferConstant() value at specified time (in seconds)
	startAtTime: function(fadeTarget, filterFreq, time){

		this.fadeTarget = fadeTarget;
		this.filterFreq = filterFreq;
		this.time = time;

		this.fadeConstantFilter.biquad.frequency.setValueAtTime(this.filterFreq, this.time);
		this.fadeConstantGain.gain.gain.setValueAtTime(this.fadeTarget, this.time)

	},

	// connect the output node of this object to the input of another
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

// amplitude modulate an incoming signal with two separate square
// waves in series
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

	// start square wave modulators (on loop) immediately
	start: function(){
		this.driverOne.start();
		this.driverTwo.start();
	},

	// start square wave modulators (on loop) at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.driverOne.startAtTime(this.time);
		this.driverTwo.startAtTime(this.time);

	},

	// stop square wave modulators immediately
	stop: function(){
		this.driverOne.stop();
		this.driverTwo.stop();
	},

	// start square wave modulators at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.driverOne.stopAtTime(this.time);
		this.driverTwo.stopAtTime(this.time);

	},

	// connect the output node of this object to the input of another
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

// delay and pan an incoming signal
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

	// connect the output node of this object to the input of another
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

// create a network of parallel filters
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

	// connect the output node of this object to the input of another
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

// create a reverb effect with a pair of delays
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

	// connect the output node of this object to the input of another
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

// loop through a random set of pan values (number of values determined
// by "quant") at a specified rate
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

	// start pan value buffers (on loop) immediately
	start: function(){
		this.pBR.start();
		this.pBL.start();
	},

	// stop pan value buffers immediately
	stop: function(){
		this.pBR.stop();
		this.pBL.stop();
	},

	// start pan value buffers (on loop) at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.pBR.startAtTime(this.time);
		this.pBL.startAtTime(this.time);

	},

	// stop pan value buffers at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.pBR.stopAtTime(this.time);
		this.pBL.stopAtTime(this.time);

	},

	// connect the output node of this object to the input of another
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

// create a network of filters to model vocal formants
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

	// connect the output node of this object to the input of another
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

// create a network of filters to model a pipe of specified length (in meters)
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

	// connect the output node of this object to the input of another
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

// create a network of filters in series
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

	// connect the output node of this object to the input of another
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

// create a network of parallel waveshapers
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

	// connect the output node of an indivdual waveshaper to the input of another object
	connectOutput: function(audioNode, idx){

		var idx = idx;

		if (audioNode.hasOwnProperty('input') == 1){
			this.outGain[idx].gain.connect(audioNode.input);
		}
		else {
			this.outGain[idx].gain.connect(audioNode);
		}

	},

	// connect the output node of this object to the input of another
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

// INSTRUMENTS (13)
//  - objects for synthesizing audio signals

//--------------------------------------------------------------

// output the results of an amplitude modulation generated from specified parameters
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

	// output signal (on loop) immediately
	start: function(){
		this.m.connect(this.mG);
		this.c.connect(this.aG);
		this.m.start();
		this.c.start();
	},

	// stop signal immediately
	stop: function(){
		this.m.stop();
		this.c.stop();
	},

	// output signal (on loop) at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.m.connect(this.mG);
		this.c.connect(this.aG);
		this.m.start(this.time);
		this.c.start(this.time);

	},

	// stop signal at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.m.stop(this.time);
		this.c.stop(this.time);

	},

	// connect the output node of this object to the input of another
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

// synthesizer based on the Yamaha DX7 (operator configuration algorithms
// and presets stored in methods)
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

	// set values of specified Operator()
	setOp: function(op, type, freq, gain, envelope){

		this.op = op;
		this.type = type;
		this.freq = freq;
		this.gain = gain;
		this.envelope = envelope;

		this.ops[op].op.setOp(this.type, this.freq, this.gain, this.envelope);

	},

	// set oscillator types of all Operator()s
	setTypes: function(typeArray){
		this.typeArray = typeArray;
		for(var i=0; i<6; i++){
			this.ops[i+1].op.setType(this.typeArray[i]);
		}
	},

	// set output gains of all Operator()s
	setGains: function(gainArray){
		this.gainArray = gainArray;
		for(var i=0; i<6; i++){
			this.ops[i+1].op.setGain(this.gainArray[i]);
		}
	},

	// set frequency value of oscillators in all Operator()s
	setFreqs: function(freqArray){
		this.freqArray = freqArray;
		for(var i=0; i<6; i++){
			this.ops[i+1].op.setFrequency(this.freqArray[i]);
		}
	},

	// set amplitude envelopes of all Operator()s
	setEnvelopes: function(envelopeArray){
		this.envelopeArray = envelopeArray;
		for(var i=0; i<6; i++){
			this.ops[i+1].op.setEnvelope(this.envelopeArray[i]);
		}
	},

	// algorithm 1
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

	// algorithm 2
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

	// algorithm 3
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

	// algorithm 4
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

	// algorithm 5
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

	// algorithm 6
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

	// algorithm 7
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

	// algorithm 8
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

	// algorithm 9
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

	// algorithm 10
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

	// algorithm 11
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

	// algorithm 12
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

	// algorithm 13
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

	// algorithm 14
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

	// algorithm 15
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

	// algorithm 16
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

	// algorithm 17
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

	// algorithm 18
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

	// algorithm 19
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

	// algorithm 20
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

	// algorithm 21
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

	// algorithm 22
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

	// algorithm 23
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

	// algorithm 24
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

	// algorithm 25
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

	// algorithm 26
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

	// algorithm 27
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

	// algorithm 28
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

	// algorithm 29
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

	// algorithm 30
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

	// algorithm 31
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

	// algorithm 32
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

	// preset 1
	preset0: function(){

		this.ops[1].op.setOp("sine", fund, 1, [1, 1, 0, 1]);
		this.ops[2].op.setOp("sine", 0, 0, [0, 0.001]);
		this.ops[3].op.setOp("sine", 0, 0, [0, 0.001]);
		this.ops[4].op.setOp("sine", 0, 0, [0, 0.001]);
		this.ops[5].op.setOp("sine", 0, 0, [0, 0.001]);
		this.ops[6].op.setOp("sine", 0, 0, [0, 0.001]);

	},

	// preset 2
	preset1: function(){

		this.ops[1].op.setOp("sine", this.fund, 1, [1, 1, 0, 1]);
		this.ops[2].op.setOp("sine", this.fund, this.fund, [1, 0.001, 0, 1.9]);
		this.ops[3].op.setOp("sine", this.fund*2, 1, [1, 0.5, 0.3, 0.05, 0, 0.7]);
		this.ops[4].op.setOp("sine", this.fund*4, this.fund*0.5, [1, 0.01, 0, 1]);
		this.ops[5].op.setOp("sine", this.fund*0.462962963, this.fund*3.24074074, [1, 0.5, 1, 0.2, 0, 0.3]);
		this.ops[6].op.setOp("sine", this.fund*0.555555556, this.fund*3.24074074, [1, 0.5, 1, 0.2, 0, 0.3]);

	},

	// preset 3
	preset2: function(){

		this.ops[1].op.setOp("sine", this.fund, 1, [1, 1, 0, 1]);
		this.ops[2].op.setOp("sine", this.fund, this.fund, [1, 0.001, 0, 1.9]);
		this.ops[3].op.setOp("sine", this.fund*2, 1, [1, 0.5, 0.3, 0.05, 0, 0.7]);
		this.ops[4].op.setOp("sine", this.fund*4, this.fund*0.5, [1, 0.01, 0, 1]);
		this.ops[5].op.setOp("sine", this.fund*0.462962963, 1, [1, 0.5, 1, 0.2, 0, 0.3]);
		this.ops[6].op.setOp("sine", this.fund*0.555555556, this.fund*3.24074074, [1, 0.5, 1, 0.2, 0, 0.3]);

	},

	// preset 4
	modSwell: function(){

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

	// preset 5
	alienSwell: function(){

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

	// preset 6
	noiseTwine: function(){

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

	// preset 7
	noiseToTone: function(){

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

	// preset 8
	a16BrassL: function(){

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

	// start all Operator()s immediately
	start: function(){

		for(var i=0; i<6; i++){
			this.ops[i+1].op.start();
		}

	},

	// start all Operator()s at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		for(var i=0; i<6; i++){
			this.ops[i+1].op.startAtTime(this.time);
		}

	},

	// stop all Operator()s immediately
	stop: function(){

		for(var i=0; i<6; i++){
			this.ops[i+1].op.stop();
			this.ops[i+1].op.output.disconnect();
		}

	},

	// stop all Operator()s at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		for(var i=0; i<6; i++){
			this.ops[i+1].op.stopAtTime(this.time);
		}

	},

	// connect the output node of this object to the input of another
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

// waveshaper synthesizer that sounds like an electric piano
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

	// play a tone of specified frequency and duration at specified time (in seconds)
	playAtTime: function(time, freq, duration){

		this.time = time;
		this.freq = freq;
		this.duration = duration;

		this.osc.osc.frequency.setValueAtTime(this.freq, this.time);

		this.e.startAtTime(this.time);
		this.e.bufferSource.playbackRate.setValueAtTime(this.duration, this.time);

	},

	// start synthesizer oscillator (on loop) immediately
	start: function(){

		this.osc.start();

	},

	// stop syntheiszier oscillator immediately
	stop: function(){

		this.osc.stop();

	},

	// start synthesizer oscillator (on loop) at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.osc.start(this.time);

	},

	// stop synthesizer oscillator at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.osc.stop(this.time);

	},

	// connect the output node of this object to the input of another
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

// Operator with ExpEnvelope
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

	// set operator parameters and initialize nodes
	setOp: function(type, freq, gainVal, eArray, expArray){

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

	// set the frequency of the operator's oscillator
	setFrequency: function(freq){
		this.osc.osc.frequency.value = freq;
	},

	// set the output gain of the operator
	setGain: function(gainVal){
		this.gain.gain.gain.value = gainVal;
	},

	// set the type of the operator's oscillator
	setType: function(type){
		this.osc.osc.type = type;
	},

	// set the operator's envelope
	setEnvelope: function(eArray, expArray){

		this.eArray = eArray;
		this.expArray = expArray;

		this.envelope.output.disconnect();
		this.envelope = new ExpEnvelope(this.eArray, this.expArray);
		this.envelope.connect(this.eG.gain.gain);

	},

	// start the operator's envelope immediately
	start: function(){
		this.envelope.start();
	},

	// stop the operator's envelope immediately
	stop: function(){
		this.envelope.stop();
	},

	// start the operator's envelope at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.envelope.startAtTime(this.time);

	},

	// stop the operator's envelope at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.envelope.stopAtTime(this.time);

	},

	// connect the output node of this object to the input of another
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

// output the results of a frequency modulation generated from specified parameters
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

	// output signal (on loop) immediately
	start: function(){
		this.c.start();
		this.m.start();

		this.m.connect(this.g);
		this.g.connect(this.c.osc.frequency);
		this.c.connect(this.output);
	},

	// stop outputting signal immediately
	stop: function(){
		this.c.stop();
		this.m.stop();
	},

	// start outputting signal (on loop) at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.c.start(this.time);
		this.m.start(this.time);

		this.m.connect(this.g);
		this.g.connect(this.c.osc.frequency);
		this.c.connect(this.output);

	},

	// stop outputting signal at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.c.stop(this.time);
		this.m.stop(this.time);

	},

	// connect the output node of this object to the input of another
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

// synthesizer based on the Moog MiniMoog
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


//--------------------------------------------------------------

// bandpass-filtered noise
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

	// start noise buffer (on loop) immediately
	start: function(){
		this.noise.start();
	},

	// stop noise buffer immediately
	stop: function(){
		this.noise.stop();
	},

	// start noise buffer (on loop) at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.noise.startAtTime(this.time);

	},

	// stop noise buffer (on loop) at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.noise.stopAtTime(this.time);

	},

	// connect the output node of this object to the input of another
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

// basic oscillator-envelope combination
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

	// set operator parameters and initialize nodes
	setOp: function(type, freq, gainVal, eArray){

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

	// set the frequency of the operator's oscillator
	setFrequency: function(freq){
		this.osc.osc.frequency.value = freq;
	},

	// set the output gain of the operator
	setGain: function(gainVal){
		this.gain.gain.gain.value = gainVal;
	},

	// set the type of the operator's oscillator
	setType: function(type){
		this.osc.osc.type = type;
	},

	// set the operator's envelope
	setEnvelope: function(eArray){
		this.envelope.output.disconnect();
		this.envelope = new Envelope(eArray);
		this.envelope.connect(this.eG.gain.gain);
	},

	// start the operator's envelope immediately
	start: function(){
		this.envelope.start();
	},

	// stop the operator's envelope immediately
	stop: function(){
		this.envelope.stop();
	},

	// start the opeartor's envelope at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.envelope.startAtTime(this.time);

	},

	// stop the operator's envelope at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.envelope.stopAtTime(this.time);

	},

	// connect the output node of this object to the input of another
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

// PlaceFormants() with formants' amplitude modulated by BreakPoints
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

	// create a formant via amplitude modulation
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

	// create a formant via frequency modulation
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

	// create a formant of filtered noise
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

	// create a formant with a waveshaped sine wave
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

	// start all oscillators immediately
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

	// play all formant envelopes immediately
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

	// play all formant envelopes at specified time (in seconds)
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

	// play individual formant envelope at specified time
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

	// set the frequency of an individual formant's carrier oscillator
	// at a specified time (in seconds)
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

	// set the frequency of an individual formant's modulating oscillator
	// at a specified time (in seconds)
	setMFreqAtTime: function(idx, freq, time){

		this.idx = idx;
		this.freq = freq;
		this.time = time;

		this.fMOA[this.idx].osc.frequency.setValueAtTime(this.freq, this.time);

	},

	// set Q value of an individual noise formant at a specified
	// time (in seconds)
	setQAtTime: function(idx, Q, time){

		this.idx = idx;
		this.Q = Q;
		this.time = time;

		this.fCOA[this.idx].filter.biquad.Q.setValueAtTime(this.Q, this.time);

	},

	// connect the output node of this object to the input of another
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

// design multiple individual formants via methods
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

	// create a formant via amplitude modulation
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

	// create a formant via frequency modulation
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

	// create a formant of filtered noise
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

	// create a formant with a waveshaped sine wave
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

	// start all oscillators immediately
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

	// play all formant envelopes immediately
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

	// play all formant envelopes at specified time (in seconds)
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

	// play individual formant envelope immediately
	play: function(idx){

			this.idx = idx;

			this.eA[this.idx].start();

			if(this.mEA[this.idx]!=0){
				this.mEA[this.idx].start();
			}

	},

	// play individual formant envelope at specified time
	playAtTime: function(idx, time){

			this.idx = idx;
			this.time = time;

			this.eA[this.idx].startAtTime(this.time);

			if(this.mEA[this.idx]!=0){
				this.mEA[this.idx].startAtTime(this.time);
			}

	},

	// set the frequency of an individual formant's carrier oscillator
	// at a specified time (in seconds)
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

	// set the frequency of an individual formant's modulating oscillator
	// at a specified time (in seconds)
	setMFreqAtTime: function(idx, freq, time){

		this.idx = idx;
		this.freq = freq;
		this.time = time;

		this.fMOA[this.idx].osc.frequency.setValueAtTime(this.freq, this.time);

	},

	// set Q value of an individual noise formant at a specified
	// time (in seconds)
	setQAtTime: function(idx, Q, time){

		this.idx = idx;
		this.Q = Q;
		this.time = time;

		this.fCOA[this.idx].filter.biquad.Q.setValueAtTime(this.Q, this.time);

	},

	// connect the output node of this object to the input of another
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

// PlaceFormants() with formants' amplitude modulated by LFOs
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

	// create a formant via amplitude modulation
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

	// create a formant via frequency modulation
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

	// create a formant of filtered noise
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

	// create a formant with a waveshaped sine wave
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

	// start all oscillators immediately
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

	// start all oscillators at specified time (in seconds)
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

	// set the frequency of an individual formant's carrier oscillator
	// at a specified time (in seconds)
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

	// set the frequency of an individual formant's modulating oscillator
	// at a specified time (in seconds)
	setMFreqAtTime: function(idx, freq, time){

		this.idx = idx;
		this.freq = freq;
		this.time = time;

		this.fMOA[this.idx].osc.frequency.setValueAtTime(this.freq, this.time);

	},

	// set Q value of an individual noise formant at a specified
	// time (in seconds)
	setQAtTime: function(idx, Q, time){

		this.idx = idx;
		this.Q = Q;
		this.time = time;

		this.fCOA[this.idx].filter.biquad.Q.setValueAtTime(this.Q, this.time);

	},

	// set the rate of an individual formant's output LFO() at a
	// specified time (in seconds)
	setLRateAtTime: function(idx, rate, time){

		this.idx = idx;
		this.rate = rate
		this.time = time;

		this.lArray[this.idx].bufferSource.playbackRate.setValueAtTime(this.rate, this.time);

	},

	// set the rate of an individual formant's modulator LFO() at a
	// specified time (in seconds)
	setMLRateAtTime: function(idx, rate, time){

		this.idx = idx;
		this.rate = rate;
		this.time = time;

		this.mlArray[this.idx].bufferSource.playbackRate.setValueAtTime(this.rate, this.time);

	},

	// connect the output node of this object to the input of another
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

// amplitude modulate a group of sine waves with a group of sawtooth LFOs
function SawSines(nNodes, freqArray, rateArray, sawtoothExp){

	this.nNodes = nNodes;
	this.freqArray = freqArray;
	this.rateArray = rateArray;
	this.sawtoothExp = sawtoothExp;

	this.osc = {};
	this.saw = {};
	this.amFilter = {};
	this.amGain = {};

	for(var i=0; i<this.nNodes; i++){

		this.osc[i] = {osc: new MyOsc("sine", this.freqArray[i])};

		this.saw[i] = {saw: new MyBuffer(1, 1, audioCtx.sampleRate)};
		this.saw[i].saw.makeInverseSawtooth(this.sawtoothExp);
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

	// set frequency of individual oscillator immediately
	setFreq: function(freq, idx){

		var freq = freq;
		var idx = idx;

		this.osc[idx].osc.osc.frequency.value = freq;

	},

	// set frequencies of all oscillators immediately
	setFreqs: function(freqArray){

		var freqArray = freqArray;

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.osc.frequency.value = freqArray[i];
		}

	},

	// set frequencies of all oscillators at specified time (in seconds)
	setFreqsAtTime: function(freqArray, time){

		this.freqArray = freqArray;
		this.time = time;

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.osc.frequency.setValueAtTime(this.freqArray[i], this.time);
		}

	},

	// start all oscillators immediately
	start: function(){

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.start();
			this.saw[i].saw.start();
		}

	},

	// stop all oscillators immediately
	stop: function(){

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.stop();
			this.saw[i].saw.stop();
		}

	},

	// start all oscillators at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.startAtTime(this.time);
			this.saw[i].saw.startAtTime(this.time);
		}

	},

	// stop all oscillators at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.stopAtTime(this.time);
			this.saw[i].saw.stopAtTime(this.time);
		}

	},

	// connect the output of a specified node to the input of another
	connectOutput: function(audioNode, idx){

		var idx = idx;

		if (audioNode.hasOwnProperty('input') == 1){
			this.amGain[idx].gain.connect(audioNode.input);
		}
		else {
			this.amGain[idx].gain.connect(audioNode);
		}

	},

	// connect the output node of this object to the input of another
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

// Operator() connected to a waveshaper
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

	// start the opeartor's envelope at specified time (in seconds)
	startAtTime: function(time, frequency){

		this.time = time;
		this.frequency = frequency;

		this.op.osc.osc.frequency.setValueAtTime(this.frequency, this.time);
		this.op.startAtTime(this.time);


	},

	// stop the opeartor's envelope at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.op.stopAtTime(this.time);

	},

	// connect the output node of this object to the input of another
	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

	// preset 1
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

	// preset 2
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

	// preset 3
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

	// preset 4
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

}

//--------------------------------------------------------------

// MULTI OBJECTS (11)
// - objects which provide an interface for quickly loading
//   multiple objects of the same type

//--------------------------------------------------------------

// interface for quickly loading multiple buffer objects
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

	// start all buffers immediately
	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.splitter);
		this.bufferSource.start();
	},

	// stop all buffers immediately
	stop: function(){
		this.bufferSource.stop();
	},

	// start all buffers at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.splitter);
		this.bufferSource.start(this.time);

	},

	// stop all buffers at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

	},

	// connect the output node of this object to the input of another
	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

	// fill specified buffer with a sine wave
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

	// fill specified buffer with a unipolar sine wave
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

	// fill specified buffer with the sum of multiple sine waves
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

	// fill specified buffer with a sawtooth wave
	makeSawtooth: function(exp, channel){

		this.exp = exp;

		this.channel = channel;

		this.nowBuffering = this.buffer.getChannelData(this.channel);

			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.pow((this.i/this.buffer.length), this.exp);
			}
	},

	// fill specified buffer with an inverse sawtooth wave
	makeInverseSawtooth: function(exp, channel){

		this.exp = exp;

		this.channel = channel;

		this.nowBuffering = this.buffer.getChannelData(this.channel);

			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.pow(1-(this.i/this.buffer.length), this.exp);
			}
	},

	// fill specified buffer with random values
	makeNoise: function(channel){

		this.channel = channel;

		this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.random() * 2 - 1;
			}
	},

	// fill specified buffer with a single value
	makeConstant: function(value, channel){

		this.value = value;

		this.channel = channel;

		this.nowBuffering = this.buffer.getChannelData(this.channel);

			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = this.value;
			}
	},

	// fill specified buffer with a square wave
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

	// fill specified buffer with a square wave with custom
	// start and end points
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

	// fill specified buffer with a random arrangment of a series of values,
	// with the number of values specified by "quant"
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

// interface for quickly loading multiple delay objects
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

	// connect the output node of an individual object to the input of another
	connect: function(audioNode, outputIdx){
		if (audioNode.hasOwnProperty('input') == 1){
			this.delays[outputIdx].delay.connect(audioNode.input);
		}
		else {
			this.delays[outputIdx].delay.connect(audioNode);
		}
	},

	// connect the output node of this object to the input of another
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

// interface for quickly loading multiple Effect objects
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

	// start all effects immediately
	start: function(){
		for(var i=0; i<this.nInstruments; i++){
			this.effects[i].effect.start();
		}
	},

	// stop all effects immediately
	stop: function(){
		for(var i=0; i<this.nInstruments; i++){
			this.effects[i].effect.stop();
		}
	},

	// start all effects at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nInstruments; i++){
			this.effects[i].effect.startAtTime(this.time);
		}

	},

	// stop all effects at specified time (in seconds)
	stopAtTime: function(){

		this.time = time;

		for(var i=0; i<this.nInstruments; i++){
			this.effects[i].effect.stopAtTime(this.time);
		}

	},

	// connect the output node of this object to the input of another
	connectAll: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

	// connect the output node of an individual object to the input of another
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

// interface for quickly loading multiple Envelope objects
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

	// start specified envelope immediately
	start: function(idx){
		this.envelopes[idx].envelope.start();
	},

	// stop specified envelope immediately
	stop: function(idx){
		this.envelopes[idx].envelope.stop();
	},

	// start specified envelope at specified time (in seconds)
	startAtTime: function(idx, time){

		this.idx = idx;
		this.time = time;

		this.envelopes[this.eIndex].envelope.startAtTime(this.time);

	},

	// stop specified envelope at specified time (in seconds)
	stopAtTime: function(eIndex, time){

		this.eIndex = eIndex;
		this.time = time;

		this.envelopes[this.eIndex].envelope.stopAtTime(this.time);

	},

	// start all envelopes immediately
	startAll: function(){
		for(var i=0; i<this.envelopeArray.length; i++){
			this.envelopes[i].envelope.start();
		}
	},

	// stop all envelopes immediately
	stopAll: function(){
		for(var i=0; i<this.envelopeArray.length; i++){
			this.envelopes[i].envelope.stop();
		}
	},

	// start all envelopes at specified time (in seconds)
	startAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.envelopeArray.length; i++){
			this.envelopes[i].envelope.startAtTime(this.time);
		}

	},

	// stop all envelopes at specified time (in seconds)
	stopAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.envelopeArray.length; i++){
			this.envelopes[i].envelope.stopAtTime(this.time);
		}

	},

	// connect the output node of an individual object to the input of another
	connect: function(audioNode, outputIdx){
		if (audioNode.hasOwnProperty('input') == 1){
			this.envelopes[outputIdx].envelope.connect(audioNode.input);
		}
		else {
			this.envelopes[outputIdx].envelope.connect(audioNode);
		}
	},

	// connect the output node of this object to the input of another
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

// interface for quickly loading multiple Gain objects
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

	// connect the output node of an individual object to the input of another
	connect: function(audioNode, outputIdx){
		if (audioNode.hasOwnProperty('input') == 1){
			this.gains[outputIdx].gain.connect(audioNode.input);
		}
		else {
			this.gains[outputIdx].gain.connect(audioNode);
		}
	},

	// connect the output node of this object to the input of another
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

// interface for quickly loading multiple Instrument objects
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

	// start specified instrument immediately
	start: function(idx){

		this.idx = idx;

		this.instruments[this.idx].instrument.start();

	},

	// stop specified instrument immediately
	stop: function(idx){

		this.idx = idx;

		this.instruments[this.idx].instrument.stop();

	},

	// start specified instrument at specified time (in seconds)
	startAtTime: function(idx, time){

		this.idx = idx;
		this.time = time;

		this.instruments[this.idx].instrument.startAtTime(this.time);

	},

	// stop specijfied instrument at specified time (in seconds)
	stopAtTime: function(idx, time){

		this.idx = idx;
		this.time = time;

		this.instruments[this.idx].instrument.stopAtTime(this.time);

	},

	// start all instruments immediately
	startAll: function(){
		for(var i=0; i<this.nInstruments; i++){
			this.instruments[i].instrument.start();
		}
	},

	// stop all instruments immediately
	stopAll: function(){
		for(var i=0; i<this.nInstruments; i++){
			this.instruments[i].instrument.stop();
		}
	},

	// start all instruments at specified time
	startAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nInstruments; i++){
			this.instruments[i].instrument.startAtTime(this.time);
		}

	},

	// stop all instruments at specified time
	stopAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nInstruments; i++){
			this.instruments[i].instrument.stopAtTime(this.time);
		}

	},

	// connect the output node of an individual object to the input of another
	connect: function(idx, audioNode){

		this.idx = idx;

		if (audioNode.hasOwnProperty('input') == 1){
			this.instruments[this.idx].instrument.connect(audioNode.input);
		}
		else {
			this.instruments[this.idx].instrument.connect(audioNode);
		}
	},

	// connect the output node of this object to the input of another
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

// interface for quickly loading multiple Operator objects
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

	// start specified operator immediately
	start: function(oIdx){
		this.ops[oIdx].op.start();
	},

	// stop specified operator immediately
	stop: function(oIdx){
		this.ops[oIdx].op.stop();
	},

	// start specified operator at specified time (in seconds)
	startAtTime: function(oIndex, time){

		this.oIndex = oIndex;
		this.time = time;

		this.ops[this.oIndex].op.startAtTime(this.time);

	},

	// stop specified operator at specified time (in seconds)
	stopAtTime: function(oIndex, time){

		this.oIndex = oIndex;
		this.time = time;

		this.ops[this.oIndex].op.stopAtTime(this.time);

	},

	// start all operators immediately
	startAll: function(){
		for(var i=0; i<this.nOps; i++){
			this.ops[i].op.start();
		}
	},

	// stop all operators immediately
	stopAll: function(){
		for(var i=0; i<this.nOps; i++){
			this.ops[i].op.stop();
		}
	},

	// start all operators at specified time (in seconds)
	startAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nOps; i++){
			this.ops[i].op.startAtTime(this.time);
		}
	},

	// stop all operators at specified time (in seconds)
	stopAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nOps; i++){
			this.ops[i].op.stopAtTime(this.time);
		}

	},

	// connect the output node of an individual object to the input of another
	connect: function(audioNode, outputIdx){
		if (audioNode.hasOwnProperty('input') == 1){
			this.ops[outputIdx].op.connect(audioNode.input);
		}
		else {
			this.ops[outputIdx].op.connect(audioNode);
		}
	},

	// connect the output node of this object to the input of another
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

// interface for quickly loading multiple oscillator objects
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

	// start specified oscillator immediately
	start: function(oIdx){
		this.oscs[oIdx].osc.start();
	},

	// stop specified oscillator immediately
	stop: function(oIdx){
		this.oscs[oIdx].osc.stop();
	},

	// start specified oscillator at specified time (in seconds)
	startAtTime: function(oIdx, time){

		this.oIdx = oIdx;
		this.time = time;

		this.oscs[oIdx].osc.startAtTime(this.time);

	},

	// stop specified oscillator at specified time (in seconds)
	stopAtTime: function(oIdx, time){

		this.oIdx = oIdx;
		this.time = time;

		this.oscs[oIdx].osc.stopAtTime(this.time);


	},

	// start all oscillators immediately
	startAll: function(){
		for(var i=0; i<this.typeArray.length; i++){
			this.oscs[i].osc.start();
		}
	},

	// stop all oscillators immediately
	stopAll: function(){
		for(var i=0; i<this.typeArray.length; i++){
			this.oscs[i].osc.stop();
		}
	},

	// start all oscillators at specified time (in seconds)
	startAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.typeArray.length; i++){
			this.oscs[i].osc.startAtTime(this.time);
		}

	},

	// stop all oscillators at specified time (in seconds)
	stopAllAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.typeArray.length; i++){
			this.oscs[i].osc.stopAtTime(this.time);
		}

	},

	// connect the output node of an individual object to the input of another
	connect: function(audioNode, outputIdx){
		if (audioNode.hasOwnProperty('input') == 1){
			this.oscs[outputIdx].osc.connect(audioNode.input);
		}
		else {
			this.oscs[outputIdx].osc.connect(audioNode);
		}
	},

	// connect the output node of this object to the input of another
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

// interface for quickly loading multiple panner objects
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

	// connect the output node of an individual object to the input of another
	connect: function(audioNode, outputIdx){
		if (audioNode.hasOwnProperty('input') == 1){
			this.pans[outputIdx].pan.connect(audioNode.input);
		}
		else {
			this.pans[outputIdx].pan.connect(audioNode);
		}
	},

	// connect the output node of this object to the input of another
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

// interface for quickly loading panned delay objects
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

	// connect the output node of an individual object to the input of another
	connect: function(audioNode, outputIdx){
		if (audioNode.hasOwnProperty('input') == 1){
			this.pans[outputIdx].pan.connect(audioNode.input);
		}
		else {
			this.pans[outputIdx].pan.connect(audioNode);
		}
	},

	// connect the output node of this object to the input of another
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

// interface for quickly loading multiple stereo delay objects
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

	// connect the output node of an individual object to the input of another
	connect: function(audioNode, outputIdx){
		if (audioNode.hasOwnProperty('input') == 1){
			this.delays[outputIdx].delay.connect(audioNode.input);
		}
		else {
			this.delays[outputIdx].delay.connect(audioNode);
		}
	},

	// connect the output node of this object to the input of another
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

// MY NODES (12)
// - simple adaptations of Web Audio API Nodes

//--------------------------------------------------------------

// adaption of the Web Audio API BiquadFilterNode
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

	// connect the output node of this object to the input of another
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

// adaptation of the Web Audio API AudioBuffer node
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

	// output buffer contents immediately
	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.loop = this.loop;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.buffer = this.buffer;
		this.playbackRateInlet.connect(this.bufferSource.playbackRate);
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	// stop outputting buffer contents immediately
	stop: function(){
		this.bufferSource.stop();
	},

	// output buffer contents at specified time (in seconds)
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

	// stop outputting buffer contents at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

	},

	// connect the output node of this object to the input of another
	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

	// fill buffer with a sine wave
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

	// fill buffer with a unipolar sine wave
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

	// fill buffer with the sum of multiple sine waves
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

	// fill buffer with a sawtooth wave
	makeSawtooth: function(exp){

		this.exp = exp;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.pow((this.i/this.buffer.length), this.exp);
			}
		}
	},

	// fill buffer with an inverse sawtooth wave
	makeInverseSawtooth: function(exp){

		this.exp = exp;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.pow(1-(this.i/this.buffer.length), this.exp);
			}
		}
	},

	// fill buffer with a triangle wave
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

	// fill buffer with a custom triangle wave
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

	// fill buffer with random values
	makeNoise: function(){

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.random() * 2 - 1;
			}
		}
	},

	// fill buffer with random values between 0 and 1
	makeUnipolarNoise: function(){

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.random();
			}
		}
	},

	// fill buffer with a single value
	makeConstant: function(value){

		this.value = value;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = this.value;
			}
		}
	},

	// fill buffer with a square wave
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

	// fill buffer with a square wave with custom
	// start and end points
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

	// fill a buffer a frequency-modulated sine wave
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

	// fill a buffer with an amplitude modulated sine wave
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

	// fill buffer with a random arrangment of a series of values,
	// with the number of values specified by "quant"
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

	// multiply buffer values by a line with negative slope
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

	// multiply buffer values by a line with positive slope
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

	// add 1-(currentBufferValue) to all values in the buffer
	// corresponding to the active portion of the square wave
	applySquare: function(dutyCycle){

		this.dutyCycle = dutyCycle;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i<this.buffer.length*this.dutyCycle){
					this.nowBuffering[this.i] = this.nowBuffering[this.i]+(1-this.nowBuffering[this.i]);
				}
			}
		}
	},

	// multiply buffer values by a sine of specified frequency
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

	// multiply buffer values by a unipolar sine of specified frequency
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

	// multiply buffer values by a random arrangment of a series of values,
	// with the number of values specified by "quant"
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

	// multiply buffer values by random values within a specified range
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

	// add 1-(currentBufferValue) to all values in the buffer
	// corresponding to the active portion of the square wave
	applyFloatingCycleSquare: function(cycleStart, cycleEnd){

		this.cycleStart = cycleStart;
		this.cycleEnd = cycleEnd;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i>=this.buffer.length*this.cycleStart && this.i<=this.buffer.length*this.cycleEnd){
					this.nowBuffering[this.i] = this.nowBuffering[this.i]+(1-this.nowBuffering[this.i]);
				}
			}
		}

	},

	// multiply buffer values by a frequency-modulated sine wave
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

	// multiply buffer values by an amplitude modulated sine wave
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

// adaptation of the Web Audio API DynamicsCompressorNode
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

	// connect the output node of this object to the input of another
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

// adaptation of the Web Audio API ConvolverNode
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

	// connect the output node of this object to the input of another
	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

	// fill buffer with a sine wave
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

	// fill buffer a frequency-modulated sine wave
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

	// fill buffer with an amplitude modulated sine wave
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

	// fill buffer with a unipolar sine wave
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

	// fill buffer with a sigmoid function
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

	// fill buffer with a sawtooth wave
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

	// fill buffer with an inverse sawtooth wave
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

	// fill buffer with random values
	makeNoise: function(){

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){
					this.nowBuffering[this.i] = Math.random() * 2 - 1;
			}
		}

		this.convolver.buffer = this.buffer;
	},

	// fill buffer with a single value
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

	// fill buffer with a square wave
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

	// fill buffer with a square wave with custom
	// start and end points
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

	// fill buffer with a custom triangle wave
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

	// fill buffer with a random arrangment of a series of values,
	// with the number of values specified by "quant"
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

	// multiply buffer values by a line with negative slope
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

	// multiply buffer values by a line with positive slope
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

	// add 1-(currentBufferValue) to all values in the buffer
	// corresponding to the active portion of the square wave
	applySquare: function(dutyCycle){

		this.dutyCycle = dutyCycle;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i<this.buffer.length*this.dutyCycle){
					this.nowBuffering[this.i] = this.nowBuffering[this.i]+(1-this.nowBuffering[this.i]);
				}
			}
		}

		this.convolver.buffer = this.buffer;

	},

	// multiply buffer values by a sine of specified frequency
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

	// multiply buffer values by a unipolar sine of specified frequency
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

	// multiply buffer values by a random arrangment of a series of values,
	// with the number of values specified by "quant"
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

	// multiply buffer values by random values within a specified range
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

	// add 1-(currentBufferValue) to all values in the buffer
	// corresponding to the active portion of the square wave
	applyFloatingCycleSquare: function(cycleStart, cycleEnd){

		this.cycleStart = cycleStart;
		this.cycleEnd = cycleEnd;

		for (this.channel = 0; this.channel<this.buffer.numberOfChannels; this.channel++){
			this.nowBuffering = this.buffer.getChannelData(this.channel);
			for (this.i=0; this.i<this.buffer.length; this.i++){

				if(this.i>=this.buffer.length*this.cycleStart && this.i<=this.buffer.length*this.cycleEnd){
					this.nowBuffering[this.i] = this.nowBuffering[this.i]+(1-this.nowBuffering[this.i]);
				}
			}
		}

		this.convolver.buffer = this.buffer;

	},

	// multiply buffer values by a frequency-modulated sine wave
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

	// multiply buffer values by an amplitude modulated sine wave
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

// adaptation of the Web Audio API DelayNode
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

	// set feedback level
	setFeedback: function(feedback){
		this.feedbackGain.gain.value = feedback;
	},

	// set length of delay (in seconds)
	setDelayTime: function(delayTime){
		this.delay.delayTime.value = delayTime;
	},

	// connect the output node of this object to the input of another
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

// adaptation of the Web Audio API GainNode
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

	// connect the output node of this object to the input of another
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

// adaptation of the Web Audio API OscillatorNode
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

	// start oscillator immediately
	start: function(){
		this.osc = audioCtx.createOscillator();
		this.osc.type = this.type;
		this.osc.frequency.value = this.frequency;
		this.frequencyInlet.connect(this.osc.frequency);
		this.osc.connect(this.output);
		this.osc.start();
	},

	// stop oscillator immediately
	stop: function(){
		this.osc.stop();
	},

	// start oscillator at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.osc = audioCtx.createOscillator();
		this.osc.type = this.type;
		this.osc.frequency.value = this.frequency;
		this.frequencyInlet.connect(this.osc.frequency);
		this.osc.connect(this.output);
		this.osc.start(this.time);

	},

	// stop oscillator at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.osc.stop(this.time);

	},

	// connect the output node of this object to the input of another
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

// adaptation of the Web Audio API PannerNode
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

	// connect the output node of this object to the input of another
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

// adaptation of the Web Audio API Panner node limited to x-axis panning
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

	// set position immediately
	setPosition: function(position){
		this.position = (position+1)/2;
		this.gainL.gain.value = 1-this.position;
		this.gainR.gain.value = this.position;
	},

	// set position at specified time (in seconds)
	setPositionAtTime: function(position, time){

		this.time = time;

		this.position = (position+1)/2;
		this.gainL.gain.setValueAtTime(1-this.position, this.time);
		this.gainR.gain.setValueAtTime(this.position, this.time);

	},

	// connect the output node of this object to the input of another
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

// adaptation of the Web Audio API PeriodicWave
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

	// start oscillator immediately
	start: function(){
		this.osc = audioCtx.createOscillator();
		this.osc.setPeriodicWave(this.wave);
		this.osc.frequency.value = this.frequency;
		this.osc.connect(this.output);
		this.osc.start();
	},

	// stop oscillator immediately
	stop: function(){
		this.osc.stop();
	},

	// start oscillator at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.osc = audioCtx.createOscillator();
		this.osc.setPeriodicWave(this.wave);
		this.osc.frequency.value = this.frequency;
		this.osc.connect(this.output);
		this.osc.start(this.time);

	},

	// stop oscillator at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.osc.stop(this.time);

	},

	// connect the output node of this object to the input of another
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

// basic stereo delay using the Web Audio API DelayNode
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

	// connect the output node of this object to the input of another
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

// adaptation of the Web Audio API WaveShaperNode
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

	// fill waveshaper with a single value
	makeConstant: function(value){

		this.nSamples = audioCtx.sampleRate;
		this.curve = new Float32Array(this.nSamples);

		for (var i=0 ; i < this.nSamples; ++i ) {

			this.curve[i] = value;

		}

		this.waveShaper.curve = this.curve;
	},

	// fill waveshaper with random values
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

	// fill waveshaper with a sawtooth wave
	makeSawtooth: function(exp){

		this.exp = exp;
		this.nSamples = audioCtx.sampleRate;
		this.curve = new Float32Array(this.nSamples);

		for (var i=0 ; i < this.nSamples; ++i ) {

			this.curve[i] = Math.pow((i/this.nSamples), this.exp);

		}

		this.waveShaper.curve = this.curve;

	},

	// fill waveshaper with an inverse sawtooth wave
	makeInverseSawtooth: function(exp){

		this.exp = exp;
		this.nSamples = audioCtx.sampleRate;
		this.curve = new Float32Array(this.nSamples);

		for (var i=0 ; i < this.nSamples; ++i ) {

			this.curve[i] = Math.pow((1-(i/this.nSamples)), this.exp);

		}

		this.waveShaper.curve = this.curve;
	},

	// fill waveshaper with a square wave
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

	// fill waveshaper with a triangle wave
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

	// fill waveshaper with a sine wave
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

	// fill waveshaper with a unipolar sine wave
	makeUnipolarSine: function(){

		this.nSamples = audioCtx.sampleRate;
		this.curve = new Float32Array(this.nSamples);
		this.twoPi = 2*Math.PI;

		for (var i=0 ; i < this.nSamples; ++i ) {

			this.curve[i] = (0.5*(Math.sin(this.twoPi*(i/this.nSamples))))+0.5;

		}

		this.waveShaper.curve = this.curve;

	},

	// fill waveshaper with a random arrangement of values within a specified
	// range, with the number of values specified by "quant"
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

	// fill waveshaper with a random arrangment of a series of values,
	// with the number of values specified by "quant"
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

	// fill waveshaper with a sigmoid function
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

	// fill waveshaper with a line between specified points
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

	// fill waveshaper with the sum of multiple sine waves
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

	// fill waveshaper with a frequency-modulated sine wave
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

	// fill waveshaper with an amplitude-modulated sine wave
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

	// connect the output node of this object to the input of another
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

// PRESETS (3)
//  - objects for storing commonly used configurations of certain nodes

//--------------------------------------------------------------

// collection of commonly used configurations of MyBuffer
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

	// preset 1
	preset1: function(){

		this.myBuffer = new MyBuffer(1, 1, audioCtx.sampleRate);
		this.buffer = this.myBuffer.buffer;

		this.myBuffer.makeAm(1, 4, 1);
		// this.myBuffer.applyFm(2.1, 10, 1);

	},

	// preset 2
	cBP1: function(){

		this.myBuffer = new MyBuffer(1, 1, audioCtx.sampleRate);
		this.buffer = this.myBuffer.buffer;

		this.myBuffer.makeAm(1, 4, 1);
		this.myBuffer.applyFm(2.1, 10, 1);

	},

	// start buffer immediately
	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.loop = this.loop;
		this.bufferSource.playbackRate.value = this.playbackRate;
		this.bufferSource.buffer = this.buffer;
		this.playbackRateInlet.connect(this.bufferSource.playbackRate);
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	// stop buffer immediately
	stop: function(){
		this.bufferSource.stop();
	},

	// start buffer at specified time (in seconds)
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

	// stop buffer at specified time (in  seconds)
	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

	},

	// connect the output node of this object to the input of another
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

// collection of commonly used configurations of MyConvolver
function ConvolverPreset(){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();

}

ConvolverPreset.prototype = {

	input: this.input,
	output: this.output,
	convolver: this.convolver,

	// preset 1
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

	// preset 2
	preset2: function(){

		this.convolver = new MyConvolver(1, 0.25, audioCtx.sampleRate);
		this.convolver.makeAm(432, 432*2, 1);

		this.input.connect(this.convolver.input);
		this.convolver.connect(this.output);

		this.buffer = this.convolver.buffer;

	},

	// connect the output node of this object to the input of another
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

// collection of commonly used Envelopes
function EnvelopePreset(){

	this.output = audioCtx.createGain();
	this.envelopeBuffer = new EnvelopeBuffer();

}

EnvelopePreset.prototype = {

	output: this.output,
	envelopeBuffer: this.envelopeBuffer,
	loop: this.loop,

	// preset 1
	evenRamp: function(length){

		this.length = length;

		this.envelopeBuffer.makeExpEnvelope(
			[1, this.length*0.5, 0, this.length*0.5],
			[1, 1],
		);

		this.buffer = this.envelopeBuffer.buffer;

	},

	// preset 2
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

	// preset 3
	ee_pr1_pluck1: function(){

		this.envelopeBuffer.makeExpEnvelope(
			[1, 0.01, 0.5, 0.05, 0.1, 0.25, 0, 0.25],
			[0.1, 1, 1.5, 2],
		);

		this.buffer = this.envelopeBuffer.buffer;

	},

	// preset 4
	ee_pr2_pluck2: function(){

		this.envelopeBuffer.makeEnvelope(
			[1, 0.01, 0.5, 0.05, 0.1, 0.25, 0, 0.25]
		);

		this.buffer = this.envelopeBuffer.buffer;

	},

	// start envelope immediately
	start: function(){
		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start();
	},

	// stop envelope immediately
	stop: function(){
		this.bufferSource.stop();
	},

	// start envelope at specified time (in seconds)
	startAtTime: function(time){

		this.time = time;

		this.bufferSource = audioCtx.createBufferSource();
		this.bufferSource.buffer = this.buffer;
		this.bufferSource.loop = this.loop;
		this.bufferSource.connect(this.output);
		this.bufferSource.start(this.time);

	},

	// stop envelope at specified time (in seconds)
	stopAtTime: function(time){

		this.time = time;

		this.bufferSource.stop(this.time);

	},

	// connect the output node of this object to the input of another
	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

	// create an envelope with exponential curves applied to each line segment
	makeExpEnvelope: function(eArray, expArray){

		this.eArray,
		this.expArray,

		this.envelopeBuffer.makeExpEnvelope(this.eArray, this.expArray);

		this.buffer = this.envelopeBuffer.buffer;

	},

	// create an envelope
	makeEnvelope: function(eArray){

		this.eArray = eArray;

		this.envelopeBuffer.makeEnvelope(this.eArray);

		this.buffer = this.envelopeBuffer.buffer;

	},

}
