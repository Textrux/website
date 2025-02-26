# **Wave Computing**

Wave computing is the idea that you have independent units of computation that exist in discrete locations on a grid and can broadcast and receive signals between them.

## Basic Concepts

If you were to think about raindrops on a pond you would get a sense of the activity in a wave computer. Better yet would be a number of fishing lures held up by bobbers. As a fish bit at one lure, it would cause the bobber on the surface to send out waves that would reach all the other bobbers nearby. They, in turn, might bob and sometimes trigger a fish to bite at that lure. This would, in turn, cause that bobber to move and send out waves to other bobbers which might trigger them to get a bite, sending out their own waves. This continual interplay between the bobbers, the lures, the fish, and the waves would create an interesting system without any real consequences.

However, imagine now that the pond was a flat surface, the bobbers were antennae on that surface, the lures were tiny computers at the bottom of those antennae, the fish were the functions running on those computers that might respond to a disturbance and might not, and the waves were radio waves that rippled out and were sensed by the antennae.

What set of functions could you write on each tiny computer to make this system produce an interesting result for you? That's the goal of this section, to answer that very question.

First, lets look at the general types of signals.

### Types of Signals

- Pulse

  A pulse is like a single wave in a pond. It propagates across the space and cause one discrete disturbance in every direction until it dissipates. Imagine a bobber being pulled down sharply but quickly returning to its original position.

- Tone

  A tone is like a single continuous wave carrying the same message over and over again continually to every point within its propagation area. Imagine a bobber bobbing up and down on the surface of the pond continually causing the same size wave to propagate at a continuous interval.

- Packet

  A packet is a discrete group of waves that propagate together but only once. If dropping one stone in the pond only caused one discrete wave to propagate, then imagine dropping three stones of different sizes in a pond at the same place one after the other. You would then get one set of 3 waves, each of a different size, propagating together as a pack across the pond.

- Broadcast

  A broadcast is like a continual stream of waves of various sizes continually dissipating across the pond. Again, continuing the "one rock makes one wave" thought experiment, imagine a pipe above the water dropping a continual stream of various sized stones into the pond one after the other. Waves of different sizes would be continually dissipated across the pond with no area of the pond left still.

What qualities would you be able to look for in the waves to build your functions from? What types of waves would you produce in return?

### Computing Signals

- While / Unless / When

  You could decide that you only wanted to broadcast signals out from your antennae while/unless/When you were or were not receiving certain other signals. This moves away a bit from the pond analogy into radio waves as you can think of different frequencies of radio waves being broadcast from different sources at the same time.

  For instance, maybe you only wanted to broadcast a signal from your antenna while you were receiving another signal on a particular frequency.

- Repetition

  You could decide that you only wanted to broadcast a message if you heard a certain signal repeated a number of times. In turn, you might want to broadcast your signal a certain number of times as well, or continuously.

- Conflict Resolution

  If your function is triggered to send a signal but receives a conflicting signal while in processing, do you push forward and finish sending your signal, stop immediately and start processing the new signal, or perhaps stop and wait a specified amount of time until you process any more signals.

- Targeting

  When you send signals, do you address them to any particular node or just let them be processed by any nodes that see fit.

- Additive Signals

  If you send a signal and another node sends the same signal at the same time, should recipients expect to interpret the increased strength of that signal a certain way or consider its mere receipt as ample information to process it.

- Auction vs Open Market Signals

  Should all nodes expect to transition as a group from one cascade of signals to a brand new cascade of signals only after all nodes have completed processing the first cascade? For instance, if you are at an auction, you expect to hear a continual array of sounds but eventually everything settles down after each item is sold since the sole auctioneer is controlling the action. Or should there be an open market for signals with nodes continuously sending signals that may be received by many other sellers and buyers with no central auctioneer controlling the airwaves.

- Historical Signals

  You might also want to consider time as a part of your processing and, say, look back at the history of signals at a particular frequency to see if they match up to a certain pattern before sending out a signal.

- Charged Nodes

  You might also think of each node as being "charged" and allowing it to lose energy over time, either reducing it's available output power gradually (analog) or waiting until the power output has reached a certain threshold and then it would not be able to broadcast at all (digital). The node could then be "charged up" by receiving certain input signals. As it heard more and more of those signals, its energy would increase and it could gradually (analog) or after a threshold (digital) start outputting a signal again.

### Defining Signal Patterns

There could even be a Wave Expression (WavEx) language that allowed you to find patterns in signal sequences much like Regular Expressions (RegEx) help you find patterns in character sequences or Structural Expressions (StrEx) help you find patterns in structures. You could create a certain Wave Expression and then pass that to a function that checks for this pattern in a signal and returns true if it finds it, just like a Regular Expression works.
