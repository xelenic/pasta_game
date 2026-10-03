/*
 * Milan Pasta – Slice the Ingredients
 * Tiny synthesised sound effects (Web Audio), no audio files needed.
 */
(function () {
    'use strict';

    const MUTE_KEY = 'milan-slice-muted';
    const VOLUME = 0.7;

    let audio = null;
    let master = null;
    let noiseBuffer = null;
    let muted = false;

    try {
        muted = localStorage.getItem(MUTE_KEY) === '1';
    } catch (error) {
        muted = false;
    }

    function ensureContext() {
        if (!audio) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                return null;
            }
            audio = new AudioContextClass();
            master = audio.createGain();
            master.gain.value = muted ? 0 : VOLUME;
            master.connect(audio.destination);

            const length = audio.sampleRate;
            noiseBuffer = audio.createBuffer(1, length, audio.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < length; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        }
        if (audio.state === 'suspended') {
            audio.resume();
        }
        return audio;
    }

    function envelope(start, attack, duration, peak) {
        const gain = audio.createGain();
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(peak, start + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        gain.connect(master);
        return gain;
    }

    function tone(frequency, duration, options = {}) {
        if (muted || !ensureContext()) {
            return;
        }
        const { type = 'sine', gain = 0.2, to = null, delay = 0, attack = 0.005 } = options;
        const start = audio.currentTime + delay;
        const oscillator = audio.createOscillator();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, start);
        if (to) {
            oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
        }
        oscillator.connect(envelope(start, attack, duration, gain));
        oscillator.start(start);
        oscillator.stop(start + duration + 0.05);
    }

    function noise(duration, options = {}) {
        if (muted || !ensureContext()) {
            return;
        }
        const { filter = 'bandpass', frequency = 1000, to = null, q = 1, gain = 0.2, delay = 0, attack = 0.005 } = options;
        const start = audio.currentTime + delay;
        const source = audio.createBufferSource();
        source.buffer = noiseBuffer;
        const biquad = audio.createBiquadFilter();
        biquad.type = filter;
        biquad.Q.value = q;
        biquad.frequency.setValueAtTime(frequency, start);
        if (to) {
            biquad.frequency.exponentialRampToValueAtTime(to, start + duration);
        }
        source.connect(biquad);
        biquad.connect(envelope(start, attack, duration, gain));
        source.start(start, Math.random() * 0.5);
        source.stop(start + duration + 0.05);
    }

    function melody(notes, step, options) {
        notes.forEach((frequency, index) => {
            const last = index === notes.length - 1;
            tone(frequency, last ? step * 3 : step * 1.3, { ...options, delay: index * step });
        });
    }

    window.PastaSfx = {
        unlock() {
            ensureContext();
        },
        isMuted() {
            return muted;
        },
        setMuted(value) {
            muted = value;
            try {
                localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
            } catch (error) {
                // Storage can be unavailable (private mode); the setting just won't persist.
            }
            if (master) {
                master.gain.value = muted ? 0 : VOLUME;
            }
        },
        click() {
            tone(520, 0.08, { type: 'triangle', gain: 0.12, to: 780 });
        },
        toss() {
            tone(220, 0.12, { type: 'sine', gain: 0.08, to: 420 });
        },
        swoosh() {
            noise(0.16, { frequency: 900, to: 3200, q: 0.8, gain: 0.12, attack: 0.03 });
        },
        slice() {
            noise(0.08, { filter: 'highpass', frequency: 3000, gain: 0.2 });
            noise(0.16, { filter: 'lowpass', frequency: 1400, to: 300, gain: 0.3, delay: 0.01 });
            tone(820, 0.1, { type: 'triangle', to: 260, gain: 0.07 });
        },
        squish() {
            tone(180, 0.32, { type: 'sawtooth', to: 55, gain: 0.1 });
            noise(0.3, { filter: 'lowpass', frequency: 600, to: 120, gain: 0.35 });
        },
        bonus() {
            [1046, 1318, 1568, 2093].forEach((frequency, index) =>
                tone(frequency, 0.18, { type: 'triangle', gain: 0.12, delay: index * 0.06 }),
            );
        },
        combo(count) {
            const steps = [0, 4, 7, 12, 16, 19];
            for (let i = 0; i < Math.min(count, steps.length); i++) {
                tone(523.25 * Math.pow(2, steps[i] / 12), 0.14, { type: 'square', gain: 0.05, delay: i * 0.055 });
            }
        },
        tick() {
            tone(1250, 0.05, { type: 'square', gain: 0.05 });
        },
        go() {
            tone(660, 0.12, { type: 'triangle', gain: 0.15 });
            tone(990, 0.28, { type: 'triangle', gain: 0.15, delay: 0.12 });
        },
        win() {
            melody([523, 659, 784, 1046, 1318], 0.11, { type: 'triangle', gain: 0.14 });
        },
        lose() {
            melody([392, 330, 262, 196], 0.18, { type: 'triangle', gain: 0.14 });
        },
    };
})();
