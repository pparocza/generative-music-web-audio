# Generative Music Web Audio

A collection of custom synthesizers and effects made with the Web Audio API

## Live Pieces

[upcast](https://pparocza.github.io/upcast/) // [edge customer](https://pparocza.github.io/edge_customer/) // [await promise](https://pparocza.github.io/await_promise/) // [n-stop designer](https://pparocza.github.io/n-stop_designer/) // [assembly expression](https://pparocza.github.io/assembly_expression/) // [peach address](https://pparocza.github.io/peach_address/) // [target equals blank](https://pparocza.github.io/target_equals_blank/) // [stack](https://pparocza.github.io/stack/) // [community infinite](https://pparocza.github.io/community_infinite/) // [from stone](https://pparocza.github.io/from_stone/) // [hsl](https://pparocza.github.io/hsl/) //  [&&gift](https://pparocza.github.io/-_gift/) // [living in the mouth](https://pparocza.github.io/living_in_the_mouth/) // [lotus ampersand](https://pparocza.github.io/lotus_ampersand/)

## Note:

- the "Piece Page Template" Release is a complete HTML/JS template for creating music in the same manner as in the pieces at the links above (to use, write your code in "runPatch()" in "script.js", and then run "index.html" in any browser)
- since many of the files included in the template are specific to my own workflow, files containing synthesizers, effects, and utilities used directly for audio generation are detailed below (doc and API coming soon)

### instruments_and_fx_library.js
  - a collection of custom processing, control, synthesis, and interface objects shared by all pieces made with this library
 
<blockquote>
 
BUFFERS
  - a pair of commonly used buffers - one that generates a constant value (since the Web Audio API's ConstantSourceNode is not supported by a number of browsers), and another that outputs noise

CV NODES
  - 8 objects for creating parameter control signals (control voltages) such as Envelopes and LFOs.
  
EFFECTS
  - 14 objects for processing audio signals, including custom filters, delays and time-based effects, and waveshapers.

INSTRUMENTS
  - 13 objects for synthesizing audio signals - some based on existing synthesizer architectures such as the Yamaha DX7 and Moog MiniMoog, others custom-built and unique to this library.

MULTI OBJECTS
  - 11 objects which provide an interface for quickly loading multiple objects of the same type (i.e. MultiBuffer, MultiOsc, MultiPan, etc.)

MY NODES
  - 12 custom interfaces for Web Audio API nodes (i.e. MyOsc, MyDelay, MyGain)

PRESETS
  - 3 objects for storing commonly used configurations of certain nodes (BufferPreset, ConvolverPreset, EnvelopePreset)

</blockquote>

<!-- INSTRUMENTS AND FX.js -->

### instruments_and_fx.js
  - file for rapid prototyping and management of the instruments and effects being built for a specific piece

<blockquote>
  
 Effect
  - object within which to design signal-processing chains, which are stored as methods

 Instrument
  - object within which to design signal-generating chains, which are stored as methods

</blockquote>

<!-- UTILITIES.js -->

### utilities.js
  - commonly used functions and values for algorithmic composition and value generation

<blockquote>

Arrays
- functions for generating and operating on arrays

Graphing
- functions for printing the contents of a buffer as a graph in the brower console

MIDI to Frequency
- function that returns a frequency in Hertz for a specified MIDI value

Randoms
- functions that return random values within a specified range

Sequence
- object with a variety of methods for generating sequences of values (additive, exponential, random, etc.)

Tuner
- function that returns an array containing the MIDI values of a scale specified by mode and tonic as arguments

Values
- global variables for easy access to common musical values like tuning ratios
  
</blockquote>
