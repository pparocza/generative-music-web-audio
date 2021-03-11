# Generative Music Web Audio

A collection of custom synthesizers and effects made with the Web Audio API

  - [live piece made with this library](http://paulparoczai.hostingerapp.com/live/community_infinite_offline/community_infinite.html?__cf_chl_jschl_tk__=aae609b14446b8146b4fc487b8eb160d720261d3-1615345578-0-AXt1Gmu9jU9uzzjHQlAzgwjiOVU7p2jG9YFDz9pczrI1nDSwfooKTnFW23q9A3psWoHJvfBWcT0HRuQ5wG_Hp2lREXEcMHd5sUqjNl9-XMPXZppv0ropj2fje_N-biqUtpYpACD8vPSWSGS2GVuxW618X3dHEYLNM_aA8PwSfhAv9sOUmzmxPzCrp-0_R2DKl_IZqxNTiYy_xHRoIW8Y46AY7gA0oMbn5sv5kDVBYAPl3U0HksPrf-vUpLD77oVUf1TPV9t_AI2UCMxmFNZq2ekdvUzypUx3IaMCjubNmLCyhSKwHfmiCAVPjjOjm7cs81rc_Y40MoxW2zU-mf2ynqX7zJ8WuxGqng2Szu6C43rWugkR2ZnPgEQakIEcDZBx29TGsSYjZiKW85Vly3l5_nfZOpjq0tmsPBeSuC4bWxHvsXDwO_E2QqsBbCoqsA9FbRhLLKfy3LqVGD_z8zpwuH4)
  - [collection of pieces made with this library](https://www.paulparoczai.net/#/webaudio/)

NOTE:

- the "Piece Page Template" Release is a complete HTML/JS template for creating music in the same manner as in the pieces at the links above
- since many of the files included in the template are specific to my own workflow, files containing synthesizers, effects, and utilities used for audio generation are detailed below (doc and API coming soon)

<!-- INSTRUMENTS AND FX LIBRARY.js -->

instruments_and_fx_library.js
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

instruments_and_fx.js
  - file for rapid prototyping and management of the instruments and effects being built for a specific piece

<blockquote>
  
 Effect
  - object within which to design signal-processing chains, which are stored as methods

 Instrument
  - object within which to design signal-generating chains, which are stored as methods

</blockquote>

<!-- UTILITIES.js -->

utilities.js
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
