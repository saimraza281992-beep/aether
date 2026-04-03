// A simple Web Audio API ambient drone generator
let audioCtx: AudioContext | null = null;
let oscillators: OscillatorNode[] = [];
let gainNode: GainNode | null = null;

export function playAmbient() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (oscillators.length > 0) return; // Already playing

  gainNode = audioCtx.createGain();
  gainNode.connect(audioCtx.destination);
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 5); // Fade in

  // Create a mystical drone chord (e.g., Root, Fifth, Octave with slight detuning)
  const frequencies = [110, 164.81, 220]; // A2, E3, A3
  
  frequencies.forEach((freq, i) => {
    const osc = audioCtx!.createOscillator();
    const filter = audioCtx!.createBiquadFilter();
    const lfo = audioCtx!.createOscillator();
    const lfoGain = audioCtx!.createGain();

    // Oscillator setup
    osc.type = i % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.value = freq + (Math.random() * 2 - 1); // Slight detune

    // Filter setup (lowpass to make it muffled and ethereal)
    filter.type = 'lowpass';
    filter.frequency.value = 400 + Math.random() * 200;

    // LFO setup (slow modulation for "breathing" effect)
    lfo.type = 'sine';
    lfo.frequency.value = 0.05 + Math.random() * 0.05; // Very slow
    lfoGain.gain.value = 100; // Modulation depth

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    osc.connect(filter);
    filter.connect(gainNode!);

    osc.start();
    lfo.start();

    oscillators.push(osc, lfo);
  });
}

export function stopAmbient() {
  if (gainNode && audioCtx) {
    // Fade out
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 3);
    setTimeout(() => {
      oscillators.forEach(osc => {
        try { osc.stop(); } catch (e) {}
      });
      oscillators = [];
      gainNode?.disconnect();
      gainNode = null;
    }, 3000);
  }
}
