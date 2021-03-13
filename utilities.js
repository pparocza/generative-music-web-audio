//--------------------------------------------------------------

// ARRAYS

//--------------------------------------------------------------

// return the maximum value of an array
function arrayMax(array){

	return(Math.max(...array));

}

// return the minimum value of an array
function arrayMin(array){

	return(Math.min(...array));

}

// sort the values in an array from highest to lowest
function arraySortDown(array){

		return array.sort(function(a, b){return b-a});

}

// sort the values in an array from lowest to highest
function arraySortUp(array){

		return array.sort(function(a, b){return a-b});

}

// manipulate an array via methods
function MyArray(array){

	this.array = array;

}

MyArray.prototype = {

	array: this.array,

	// add specified value to all array values
	add: function(value){

		this.value = value;

		for(var i=0; i<this.array.length; i++){
			this.array[i] += this.value;
		}

		return this.array;

	},

	// subtract specified value from all array values
	subtract: function(value){

		this.value = value;

		for(var i=0; i<this.array.length; i++){
			this.array[i] -= this.value;
		}

		return this.array;

	},

	// multiply all array values by specified value
	multiply: function(value){

		this.value = value;

		for(var i=0; i<this.array.length; i++){
			this.array[i] *= this.value;
		}

		return this.array;

	},

	// divide all array values by specified value
	divide: function(value){

		this.value = value;

		for(var i=0; i<this.array.length; i++){
			this.array[i] /= this.value;
		}

		return this.array;

	},

	// return minimum value of the array
	min: function(){

		this.min = Math.min(...this.array);
		return this.min;

	},

	// return maximum value of the array
	max: function(){

		this.max = Math.max(...this.array);
		return this.max;

	},

	// sort the values in the array from lowest to highest
	sortUp: function(){

		this.array.sort(function(a, b){return a-b});

	},

	// sort the values in the array from highest to lowest
	sortDown: function(){

		this.array.sort(function(a, b){return b-a});

	},

	// return a random value from the array
	randomValue: function(){

		this.rV = this.array[randomInt(0, this.array.length)];
		return this.rV;

	},

	// randomly arrange the values in the array
	shuffle: function(){

		shuffle(this.array);

		return this.array;

	},

	// insert specified value at the front of the array
	append: function(newArray){

		this.newArray = newArray;

		for(var i=0; i<this.newArray.length; i++){
			this.array.push(this.newArray[i]);
		}

		return this.array;

	},

	// insert specified value at the end of the array
	prepend: function(newArray){

		this.newArray = newArray;

		for(var i=0; i<this.newArray.length; i++){
			this.array.unshift(this.newArray[i]);
		}

		return this.array;

	},

	// alternate the values of the array with those of another array
	lace: function(newArray){

		this.newArray = newArray;
		this.oldArray = this.array;
		this.array = [];

		for(var i=0; i<this.newArray.length; i++){
			this.array[i*2] = this.oldArray[i];
			this.array[(i*2)+1] = this.newArray[i];
		}

		return this.array;

	},

}

// return an array with alternating values from each array
function arrayLace(a1, a2){

	var a1 = a1;
	var a2 = a2;
	var a = [];

	for(var i=0; i<a1.length; i++){
		a[i*2] = a1[i];
		a[(i*2)+1] = a2[i];
	}

	return a;

}

// append the second array to the first, and return the new array
function arrayJoin(a1, a2){

	var a1 = a1;
	var a2 = a2;
	var a = a1;

	for(var i=0; i<a1.length; i++){
		a.push(a2[i]);
	}

	return a;

}

// return a random value from the array
function randomArrayValue(array){

	var v = array[randomInt(0, array.length)];
	return v;

}

// return all possible permtutations (of a specified length)
// of the array
function permutations(arr, len, repeat = false) {

  len = len || arr.length;
  if(len > arr.length) len = arr.length;
  const results = [];

	function eliminate(el, arr) {
		let i = arr.indexOf(el);
		arr.splice(i, 1);
		return arr;
	}

	function perms(arr, len, prefix = []) {
		if (prefix.length === len) {
			results.push(prefix);
		} else {
			for (let elem of arr) {
				let newPrefix = [...prefix];
				newPrefix.push(elem);

        let newRest = null;

        if(repeat){
          newRest = arr;
        }else{
          newRest = eliminate(elem, [...arr]);
        }

	 perms(newRest, len, newPrefix);
	}
 }
		return;
	}
	perms(arr, len);

	return results;
}

// randomly arrange the values of an array
function shuffle(myArray){
	var i = myArray.length;
	var j = 0;
	var temp;

		while (i--) {
			j = Math.floor(Math.random() * (i+1));
			temp = myArray[i];
			myArray[i] = myArray[j];
			myArray[j] = temp;
			}
	return myArray;
}

//--------------------------------------------------------------

// GRAPHING

//--------------------------------------------------------------

(function(){
    if (!window.console || !window.console.log) {
        return;
    }

    // context.fillStyle = '#fff';

    var _graph = function(imageURL) {
        console.log('%c ', '' +
            'font-size: 0;' +
            'padding-left: ' + 299 + 'px;' +
            'padding-bottom: ' + 100 + 'px;' +
            'background: url("' + imageURL + '"),' +
                '-webkit-linear-gradient(#fff, #fff);' +
        '');
    };

    window.console.graph = function (data) {

				var canvas;
				var	context;

				canvas = document.createElement('canvas');
				context = canvas.getContext('2d');
				context.lineWidth = 1;
				context.strokeStyle = "rgb(0, 0, 0)";

				context.beginPath();

			  var sliceWidth = canvas.width * 1.0 / data.length;
			  var x = 0;

			  for (var i = 0; i < data.length; i++) {

			    var v = data[i] / 128.0;
			    var y = v * canvas.height / 2;

			    if (i === 0) {
			      context.moveTo(x, y);
			    } else {
			      context.lineTo(x, y);
			    }

			    x += sliceWidth;
			  }

			  context.lineTo(canvas.width, canvas.height / 2);
			  context.stroke();

        _graph(canvas.toDataURL());
    };

})();

// print the contents of a buffer as a graph in the browser consolse
function bufferGraph(buffer, channel, tag){

	var buffer = buffer;
	var channel = channel;

	if(tag){console.log(tag)};

	var a = new Float32Array(buffer.length);
	buffer.copyFromChannel(a, channel, 0);

	for(var i=0; i<a.length; i++){
		a[i] = (0.5*(100+(Math.floor(a[i]*100))));
	}

	console.graph(a);

}

// print the contents of a waveshaper curve as a graph in the browser console
function shaperGraph(shaper, tag){

	var shaper = shaper;

	if(tag){console.log(tag)};

	var a = new Float32Array(shaper.curve.length);

	for(var i=0; i<a.length; i++){
		a[i] = (0.5*(100+(Math.floor(shaper.curve[i]*100))));
	}

	console.graph(a);

}


//--------------------------------------------------------------

// MIDI TO FREQUENCY

//--------------------------------------------------------------

// return a frequency in Hertz for a specified MIDI value
function mtof(midiPitchNumber){
	var freq = 440 * Math.pow(2, (midiPitchNumber-69)/12);
	return freq;
}

//--------------------------------------------------------------

// RANDOMS

//--------------------------------------------------------------

// create a breakpoint function with a specified number of points
// based on the arguments provided
function randomEnvelope(nPoints, gainRange, durationRange, divRange){

	var array = [];

	var nPoints =  nPoints;
	var gainRange = gainRange;
	var durationRange = durationRange;
	var divRange = divRange;

	for(var i=0; i<nPoints; i++){
		array.push(randomFloat(gainRange[0], gainRange[1]), randomInt(durationRange[0], durationRange[1])/randomInt(divRange[0], divRange[1]));
	}

	array.push(0, randomInt(durationRange[0], durationRange[1])/(Math.pow(10, randomInt(divRange[0], divRange[1]))));

	return array;

}

// return a random floating point number within the specified range
function randomFloat(min, max){
	return Math.random() * (max-min) + min;
}

// return a random integer within the specified range
function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

//--------------------------------------------------------------

// SEQUENCE

//--------------------------------------------------------------

// object with a variety of methods for generating sequences of values
function Sequence(){

	this.sequence = [];

}

Sequence.prototype = {

	sequence: this.sequence,

	// create a sequence of identival values of specified length
	duplicates: function(length, value){

		this.length = length;
		this.value = value;

		for(var i=0; i<this.length; i++){
			this.sequence[i] = this.value;
		}

		return this.sequence;

	},

	// append a specified amount of a given value
	pad: function(padLength, value){

		this.padLength = padLength;
		this.value = value;

		for(var i=0; i<this.padLength; i++){
			this.sequence.push(this.value);
		}

		return this.sequence;

	},

	// loop a set of specified values
	loop: function(length, valuesArray){

		this.length = length;
		this.valuesArray = valuesArray;

		for(var i=0; i<this.length; i++){
			this.sequence[i] = this.valuesArray[i%this.valuesArray.length];
		}

		return this.sequence;

	},

	// create a sequence of specified length from the specified
	// values, and add each subsequent value to the preceding value
	additive: function(length, valuesArray){

		this.length = length;
		this.valuesArray = valuesArray;

		this.v = 0;

		for(var i=0; i<this.length; i++){
			this.sequence[i] = this.v;
			this.v += this.valuesArray[randomInt(0, this.valuesArray.length)];
		}

		return this.sequence;

	},

	// create a sequence of specified length by multiplying
	// each value in "multiplesArray" by the "base"
	multiples: function(length, base, multiplesArray){

		this.length = length;
		this.base = base;
		this.multiplesArray = multiplesArray;

		for(var i=0; i<this.length; i++){
			this.sequence[i] = this.base*this.multiplesArray[i];
		}

		return this.sequence;

	},

	// create a sequence of specified length by raising
	// "base" to each value in "expArray"
	powers: function(length, base, expArray){

		this.length = length;
		this.base = base;
		this.expArray = expArray

		for(var i=0; i<this.length; i++){
			this.sequence[i] = Math.pow(this.base, this.expArray[i]);
		}

		return this.sequence;

	},

	// create a sequence of specified length by randomly selecting
	// a value from "valueArray", adding it to the preceding value,
	// and not re-selecting a given "valueArray" value until all values
	// have been selected
	additiveUrn: function(length, valuesArray){

		this.length = length;
		this.valuesArray = valuesArray;

		this.v = 0;

		for(var i=0; i<this.length; i++){
			if(i%this.valuesArray.length == 0){shuffle(this.valuesArray)};
			this.sequence[i] = this.v;
			this.v += this.valuesArray[i%this.valuesArray.length];
		}

		return this.sequence;

	},

	// create a sequence of specified length by randomly
	// selecting integers from a specified range
	additiveRandomInt: function(length, min, max){

		this.length = length;
		this.min = min;
		this.max = max;

		this.v = 0;

		for(var i=0; i<this.length; i++){
			this.sequence[i] = this.v;
			this.v += randomInt(this.min, this.max);
		}

		return this.sequence;

	},

	// create a sequence of specified length by randomly
	// selecting flating point numbers from a specified range
	additiveRandomFloat: function(length, min, max){

		this.length = length;
		this.min = min;
		this.max = max;

		this.v = 0;

		for(var i=0; i<this.length; i++){
			this.sequence[i] = this.v;
			this.v += randomFloat(this.min, this.max);
		}

		return this.sequence;

	},

	// create a sequence of specified length by raising
	// the "base" to each value in "expArray", and adding
	// each subsequent value to the preceding value
	additivePowers: function(length, base, powArray){

		this.length = length;
		this.base = base;
		this.powArray = powArray;

		this.v = 0;

		for(var i=0; i<this.length; i++){
			this.sequence[i] = this.v;
			this.v += Math.pow(this.base, this.powArray[i%this.powArray.length]);
		}

		return this.sequence;

	},

	// create a sequence of specified length by raising
	// "base" to a value randomly selected from "powArray",
	// and adding each subsequent value to the preceding value
	additiveRandomPowers: function(length, base, powArray){

		this.length = length;
		this.base = base;
		this.powArray = powArray;

		this.v = 0;

		for(var i=0; i<this.length; i++){
			if(i%this.powArray.length == 0){shuffle(this.powArray)};
			this.sequence[i] = this.v;
			this.v += Math.pow(this.base, randomArrayValue(this.powArray));
		}

		return this.sequence;

	},

	// create a sequence of specified length by raising
	// "base" to a value randomly selected from "powArray"
	// and adding each subsequent value to the preceding value
	// do not re-select a value from "powArray" until all values
	// have been selected
	additiveUrnPowers: function(length, base, powArray){

		this.length = length;
		this.base = base;
		this.powArray = powArray;

		this.v = 0;

		for(var i=0; i<this.length; i++){
			if(i%this.powArray.length == 0){shuffle(this.powArray)};
			this.sequence[i] = this.v;
			this.v += Math.pow(this.base, this.powArray[i%this.powArray.length]);
		}

		return this.sequence;

	},

	// create a sequence of specified length by multiplying
	// each value in "multiplesArray" by "base", and adding
	// each subsequent value to the preceding value
	additiveMultiples: function(length, base, multArray){

		this.length = length;
		this.base = base;
		this.multArray = multArray;

		this.v = 0;

		for(var i=0; i<this.length; i++){
			this.sequence[i] = this.v;
			this.v += this.base*(this.multArray[i%this.multArray.length]);
		}

		return this.sequence;

	},

	// create a sequence of specified length by multiplying
	// "base" by a value randomly selected from "multArray"
	// and adding each subsequent value to the preceding value
	additiveRandomMultiples: function(length, base, multArray){

		this.length = length;
		this.base = base;
		this.multArray = multArray;

		this.v = 0;

		for(var i=0; i<this.length; i++){
			this.sequence[i] = this.v;
			this.v += this.base*randomArrayValue(this.multArray);
		}

		return this.sequence;

	},

	// create a sequence of specified length by multiplying
	// "base" by a value randomly selected from "multArray"
	// and adding each subsequent value to the preceding value
	// do not re-select a value from "multArray" until all values
	// have been selected
	additiveUrnMultiples: function(length, base, multArray){

		this.length = length;
		this.base = base;
		this.multArray = multArray;

		this.v = 0;

		for(var i=0; i<this.length; i++){
			if(i%this.multArray.length == 0){shuffle(this.multArray)};
			this.sequence[i] = this.v;
			this.v += this.base*this.multArray[i%this.multArray.length];
		}

		return this.sequence;

	},

	// create a sequence of specified length by raising
	// "base" to a value randomly selected from "powArray"
	randomPowers: function(length, base, powArray){

		this.length = length;
		this.base = base;
		this.powArray = powArray;

		for(var i=0; i<this.length; i++){
			this.sequence[i] = Math.pow(this.base, randomArrayValue(this.powArray));
		}

		return this.sequence;

	},

	// create a sequence of specified length by raising
	// "base" to a value randomly selected from "powArray"
	// do not re-select a value from "powArray" until
	// all values have been selected
	urnPowers: function(length, base, powArray){

		this.length = length;
		this.base = base;
		this.powArray = powArray;

		for(var i=0; i<this.length; i++){
			if(i%this.powArray.length == 0){shuffle(this.powArray)};
			this.sequence[i] = Math.pow(this.base, this.powArray[i%this.powArray.length]);
		}

		return this.sequence;

	},

	// create a sequence of specified length by multiplying
	// "base" from a value randomly selected from "multArray"
	randomMultiples: function(length, base, multArray){

		this.length = length;
		this.base = base;
		this.multArray = multArray;

		for(var i=0; i<this.length; i++){
			this.sequence[i] = this.base*randomArrayValue(this.multArray);
		}

		return this.sequence;

	},

	// create a sequence of specified length by multiplying
	// "base" from a value randomly selected from "multArray"
	// do not re-select a value from "multArray" until all values
	// have been selected
	urnMultiples: function(length, base, multArray){

		this.length = length;
		this.base = base;
		this.multArray = multArray;

		for(var i=0; i<this.length; i++){
			if(i%this.multArray.length == 0){shuffle(this.multArray)};
			this.sequence[i] = this.base*this.multArray[i%this.multArray.length];
		}

		return this.sequence;

	},

	// create a sequence of values of length "div" where
	// each value is (arrayPosition+1)/"div"
	evenDiv: function(div){

		this.div = div;

		for(var i=0; i<this.div; i++){
			this.sequence[i] = (i+1)/this.div;
		}

		return this.sequence;

	},

	// create a sequence by randomly selecting values from an array
	randomSelect: function(length, valuesArray){

		this.length = length;
		this.valuesArray = valuesArray;

		for(var i=0; i<this.length; i++){
			this.sequence[i] = this.valuesArray[randomInt(0, this.valuesArray.length)];
		}

		return this.sequence;

	},

	// create a sequence by randomly selecting values from an array
	// without repeating a value until all have been selected
	urnSelect: function(length, valuesArray){

		this.length = length;
		this.valuesArray = valuesArray;

		for(var i=0; i<this.length; i++){
			if(i%this.valuesArray.length == 0){shuffle(this.valuesArray)};
			this.sequence[i] = this.valuesArray[i%this.valuesArray.length];
		}

		return this.sequence;

	},

	// create a sequence of random floating point number within a specified range
	randomFloats: function(length, min, max){

		this.length = length;
		this.min = min;
		this.max = max;

		for(var i=0; i<this.length; i++){
			this.sequence[i] = randomFloat(this.min, this.max);
		}

		return this.sequence;

	},

	// create a sequence of random integers within a specified range
	randomInts: function(length, min, max){

		this.length = length;
		this.min = min;
		this.max = max;

		for(var i=0; i<this.length; i++){
			this.sequence[i] = randomInt(this.min, this.max);
		}

		return this.sequence;

	},

	// add specified value to all vallues in the array
	add: function(value){

		this.value = value;

		for(var i=0; i<this.sequence.length; i++){
			this.sequence[i] += this.value;
		}

		return this.sequence;

	},

	// subtract specified value from all values in the sequence
	subtract: function(value){

		this.value = value;

		for(var i=0; i<this.sequence.length; i++){
			this.sequence[i] -= this.value;
		}

		return this.sequence;

	},

	// multiply all values in the sequence by specified value
	multiply: function(value){

		this.value = value;

		for(var i=0; i<this.sequence.length; i++){
			this.sequence[i] *= this.value;
		}

		return this.sequence;

	},

	// divide all values in the sequence by specified value
	divide: function(value){

		this.value = value;

		for(var i=0; i<this.sequence.length; i++){
			this.sequence[i] /= this.value;
		}

		return this.sequence;

	},

	// alternate all values in the sequence with values in
	// specified array
	lace: function(newSequence){

		this.newSequence = newSequence;
		this.oldSequence = this.sequence;
		this.sequence = [];

		for(var i=0; i<this.newSequence.length; i++){
			this.sequence[i*2] = this.oldSequence[i];
			this.sequence[(i*2)+1] = this.newSequence[i];
		}

		return this.sequence;

	},

	// add all values in the sequence to corresponding
	// values in specified array
	laceAdd: function(newSequence){

		this.newSequence = newSequence;
		this.oldSequence = this.sequence;
		this.sequence = [];

		for(var i=0; i<this.newSequence.length; i++){
			this.sequence[i*2] = this.oldSequence[i];
			this.sequence[(i*2)+1] = this.newSequence[i];
		}

		for(var i=0; i<this.sequence.length; i++){
			if(i!=0){
				this.sequence[i] = this.sequence[i]+this.sequence[i-1];
			}
			else if(i==0){
				this.sequence[i] = this.sequence[i];
			}
		}

		return this.sequence;

	},

	// append all values in the sequence in reverse order
	palindrome: function(){

		this.l = this.sequence.length-1;

		for(var i=0; i<this.l; i++){
			this.sequence.push(this.sequence[this.l-1-i]);
		}

		return this.sequence;

	},

	// append the inversion of the sequence
	bipolar: function(){

		this.l = this.sequence.length;

		for(var i=0; i<this.l; i++){
			if(i==0){
				if(this.sequence[i]==-0){}
				else if(this.sequence[i]!=-0){this.sequence.push(-this.sequence[i])}
			}
			else if(i==this.l-1){
				if(this.sequence[this.l-1]==-0){}
				else if(this.sequence[this.l-1]!=-0){this.sequence.push(-this.sequence[i])}
			}
			else if(i!=0 && i!=this.l){
				this.sequence.push(-this.sequence[i]);
			}
		}
			return this.sequence;

	},

	// append specified array to sequence
	join: function(array){

		this.array = array;

		for(var i=0; i<this.array.length; i++){
			this.sequence.push(this.array[i]);
		}

		return this.sequence;

	},

	// replace specified sequence value with specified value
	replace: function(idx, value){

		this.idx = idx;
		this.value = value;

		this.sequence[this.idx] = this.value;

	},

	// insert specified value at specified position in the sequence
	insert: function(idx, value){

		this.idx = idx;
		this.value = value;

		this.sequence.splice(this.idx, 0, this.value);

	}

}

//--------------------------------------------------------------

// TUNER

//--------------------------------------------------------------

// returns an array containing the MIDI values of a scale specified by
// mode and tonic as arguments
function tuner(modeIdx, tonicIdx){

	var tonics = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

	var major = [0, 2, 4, 5, 7, 9, 11, 12];
	var minor = [0, 2, 3, 5, 7, 8, 10, 12];
	var dorian = [0, 2, 3, 5, 7, 9, 10, 12];
	var phrygian = [0, 1, 3, 5, 7, 8, 10, 12];
	var lydian = [0, 2, 4, 6, 7, 9, 11, 12];
	var mixolydian = [0, 2, 4, 5, 7, 9, 10, 12];

	var modes = [major, minor, dorian, phrygian, lydian, mixolydian];

	var theTonic = tonics[tonicIdx];
	var theMode = modes[modeIdx];

	var scale = [];

	for (tunerIdx = 0 ; tunerIdx < theMode.length ; tunerIdx++){
		scale[tunerIdx] = theMode[tunerIdx] + theTonic;
	}

	return scale;
}

//--------------------------------------------------------------

// VALUES

//--------------------------------------------------------------

// global variables for easy access to common values

var m2 = 25/24;
var M2 = 9/8;
var m3 = 6/5;
var M3 = 5/4;
var P4 = 4/3;
var d5 = 45/32;
var P5 = 3/2;
var m6 = 8/5;
var M6 = 5/3;
var m7 = 9/5;
var M7 = 15/8;
