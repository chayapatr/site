// pubOS default sound theme
// Cues receive (ctx: AudioContext, Tone).
// Run `soundd reload` after editing to apply changes live.

cue("window-open", (ctx, Tone) => {
  const synth = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.005, decay: 0.18, sustain: 0, release: 0 },
    portamento: 0.08
  }).toDestination()
  synth.volume.value = -18
  synth.triggerAttack("C5")
  synth.frequency.rampTo("E5", 0.08)
  setTimeout(() => { synth.triggerRelease(); synth.dispose() }, 200)
})

cue("window-close", (ctx, Tone) => {
  const synth = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0 },
    portamento: 0.1
  }).toDestination()
  synth.volume.value = -20
  synth.triggerAttack("A4")
  synth.frequency.rampTo("C4", 0.1)
  setTimeout(() => { synth.triggerRelease(); synth.dispose() }, 250)
})

cue("notify", (ctx, Tone) => {
  const synth = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0 }
  }).toDestination()
  synth.volume.value = -16
  synth.triggerAttackRelease("A5", "16n")
  setTimeout(() => { synth.triggerAttackRelease("C6", "16n") }, 100)
  setTimeout(() => synth.dispose(), 500)
})

cue("error", (ctx, Tone) => {
  const synth = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.005, decay: 0.25, sustain: 0, release: 0 }
  }).toDestination()
  synth.volume.value = -22
  synth.triggerAttackRelease("C3", "8n")
  setTimeout(() => synth.dispose(), 600)
})

cue("ping", (ctx, Tone) => {
  const synth = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0 }
  }).toDestination()
  synth.volume.value = -18
  synth.triggerAttackRelease("C6", "32n")
  setTimeout(() => synth.dispose(), 400)
})

cue("boot", (ctx, Tone) => {
  const synth = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0 }
  }).toDestination()
  synth.volume.value = -18
  synth.triggerAttackRelease("C4", "16n")
  setTimeout(() => synth.triggerAttackRelease("E4", "16n"), 100)
  setTimeout(() => synth.triggerAttackRelease("G4", "16n"), 200)
  setTimeout(() => synth.triggerAttackRelease("C5", "8n"), 300)
  setTimeout(() => synth.dispose(), 900)
})
