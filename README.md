# Generative Music Web Audio

A collection of custom synthesizers and effects made with the Web Audio API

  - [live piece made with this library](http://paulparoczai.hostingerapp.com/live/community_infinite_offline/community_infinite.html?__cf_chl_jschl_tk__=aae609b14446b8146b4fc487b8eb160d720261d3-1615345578-0-AXt1Gmu9jU9uzzjHQlAzgwjiOVU7p2jG9YFDz9pczrI1nDSwfooKTnFW23q9A3psWoHJvfBWcT0HRuQ5wG_Hp2lREXEcMHd5sUqjNl9-XMPXZppv0ropj2fje_N-biqUtpYpACD8vPSWSGS2GVuxW618X3dHEYLNM_aA8PwSfhAv9sOUmzmxPzCrp-0_R2DKl_IZqxNTiYy_xHRoIW8Y46AY7gA0oMbn5sv5kDVBYAPl3U0HksPrf-vUpLD77oVUf1TPV9t_AI2UCMxmFNZq2ekdvUzypUx3IaMCjubNmLCyhSKwHfmiCAVPjjOjm7cs81rc_Y40MoxW2zU-mf2ynqX7zJ8WuxGqng2Szu6C43rWugkR2ZnPgEQakIEcDZBx29TGsSYjZiKW85Vly3l5_nfZOpjq0tmsPBeSuC4bWxHvsXDwO_E2QqsBbCoqsA9FbRhLLKfy3LqVGD_z8zpwuH4)
  - [collection of pieces made with this library](https://www.paulparoczai.net/#/webaudio/)

NOTE:

- the Piece Page Template is a complete HTML template for creating the pieces at the links above
- since many of the files included in the template are specific to my own workflow, files containing specific synths, effects, and utilities used in actual audio generation are detailed below (doc and API coming soon)

<!-- INSTRUMENTS AND FX LIBRARY.js -->

instruments_and_fx_library.js
  - a collection of custom processing, control, synthesis, and interface objects shared by all pieces made with this library
 
<blockquote>
 
BUFFERS
  - a pair of commonly used buffers, one which generates a constant (since the Web Audio API's ConstantSourceNode is not supported by a number of browsers), and another that outputs noise

CV NODES
  - 8 objects for creating parameter control signals (control voltages) such as Envelopes and LFOs.
  
EFFECTS
  - 14 objects for processing audio signals, including custom filters, delays and time-based effects, and waveshapers.

INSTRUMENTS
  - 13 objects for synthesizing audio signals - some based on existing synthesizer architectures such as the Yamaha DX7 and Moog MiniMoog, others custom-built and unique to this library.

MULTI OBJECTS
  - 13 objects for synthesizing audio signals - some based on existing synthesizer architectures such as the Yamaha DX7 and Moog MiniMoog, others custom-built and unique to this library.

</blockquote>

<!-- INSTRUMENTS AND FX.js -->

instruments_and_fx.js<blockquote>
  
 Effect
  - output a custom breakpoint function starting at 0

 Instrument
  - output a custom breakpoint function starting at 0

</blockquote>

<!-- UTILITIES.js -->

utilities.js<blockquote>
