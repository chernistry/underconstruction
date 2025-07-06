const MIDI_URL = 'https://pub-c0133a339b81441ba6214aac709da74e.r2.dev/gipsy.mid'; // Default MIDI file (Crystal Waters - "She's Homeless" chords example)
const MIDI_FALLBACK_URL = 'https://cdn.jsdelivr.net/gh/cifkao/html-midi-player@2.0.0/demo/bach_846.mid'; // Fallback if the primary fails

export default {
    async fetch(request, env, ctx) {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <title>Making things sound right...</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
          <style>
          :root {
            --bg-color: #1a1a1a;
            --window-bg: rgba(30, 30, 30, 0.75);
            --glass-blur: blur(20px) saturate(180%);
            --border-color: rgba(255, 255, 255, 0.125);
            --text-color: #e0e0e0;
            --primary-text-color: #ffffff;
            --tertiary-text-color: #888888;
            --pad-bg: rgba(255, 255, 255, 0.1);
            --pad-hover-bg: rgba(255, 255, 255, 0.2);
            --pad-active-bg: #7f5af0;
            --font-family: 'Inter', sans-serif;
          }
          html, body {
            overscroll-behavior: none;
          }
            body {
            background-color: var(--bg-color);
            color: var(--text-color);
            font-family: var(--font-family);
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0);
            background-size: 20px 20px;
            padding: 20px;
            box-sizing: border-box;
          }
          .main-container {
            width: 100%;
            max-width: 800px;
          }
          .window-glass {
            background: var(--window-bg);
            -webkit-backdrop-filter: var(--glass-blur);
            backdrop-filter: var(--glass-blur);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }
          .title-bar {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            background: rgba(0,0,0,0.2);
            flex-shrink: 0;
            cursor: move;
          }
          .buttons { display: flex; }
          .btn { width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; border: 1px solid rgba(0,0,0,0.2); }
          .close { background-color: #ff5f56; }
          .min { background-color: #ffbd2e; }
          .max { background-color: #27c93f; }
          .title { flex-grow: 1; text-align: center; font-weight: 500; font-size: 0.9em; color: var(--tertiary-text-color); }
          .fullscreen-button { cursor: pointer; color: var(--tertiary-text-color); padding: 4px; border-radius: 4px; transition: background-color 0.2s; }
          .fullscreen-button:hover { background-color: rgba(255,255,255,0.1); color: var(--primary-text-color); }
          .content { padding: 20px; flex-grow: 1; display: flex; flex-direction: column; gap: 20px; }
          .info h2 { font-size: 1.8em; color: var(--primary-text-color); margin: 0 0 10px; }
          .info p { font-size: 1em; color: var(--text-color); line-height: 1.6; margin: 0; }
          .controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap;}
          .controls label { font-weight: 500; }
          input[type="range"] { -webkit-appearance: none; appearance: none; width: 150px; height: 5px; background: rgba(255, 255, 255, 0.1); border-radius: 5px; outline: none; }
          input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; background: var(--pad-active-bg); cursor: pointer; border-radius: 50%; }
          input[type="range"]::-moz-range-thumb { width: 16px; height: 16px; background: var(--pad-active-bg); cursor: pointer; border-radius: 50%; border: none; }
          #synth-volume-value { font-family: monospace; font-size: 0.9em; min-width: 35px; text-align: right; color: var(--tertiary-text-color); }
          .sampler-pads { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 10px; }
          .synth-pad { aspect-ratio: 1 / 1; border-radius: 8px; border: 1px solid var(--border-color); background: var(--pad-bg); color: var(--text-color); font-size: clamp(0.6rem, 2.5vw, 0.75rem); cursor: pointer; transition: all 0.1s ease; display: flex; justify-content: center; align-items: center; font-family: var(--font-family); padding: 4px; text-align: center; -webkit-user-select: none; user-select: none; }
          .synth-pad:disabled { opacity: 0.3; cursor: not-allowed; }
          .synth-pad:not(:disabled):hover { background: var(--pad-hover-bg); transform: translateY(-2px); }
          .synth-pad.pressed { background: var(--pad-active-bg); color: white; transform: translateY(1px); box-shadow: 0 0 20px var(--pad-active-bg); }
          .synth-is-fullscreen-mobile { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; border-radius: 0 !important; z-index: 9999; }
          </style>
        </head>
        <body>
        <div class="main-container">
          <div id="synth-window" class="window-glass">
            <div class="title-bar">
              <div class="buttons">
                <div class="btn close"></div>
                <div class="btn min"></div>
                <div class="btn max"></div>
              </div>
              <div class="title">Come back soon!</div>
              <div id="synth-fullscreen-button" class="fullscreen-button"><i class="bi bi-fullscreen"></i></div>
            </div>
            <div class="content">
              <div class="info">
                <h2>Making things sound right...</h2>
                <p>Our website is getting a tune-up. While you wait, feel free to play with this sampler (click or use 1-9 keys). The pads are loaded with chords from "She's Homeless" by Crystal Waters.</p>
              </div>
              <div class="controls">
                <label for="synth-volume">Volume</label>
                <input type="range" id="synth-volume" min="0" max="1" step="0.01" value="0.5">
                <span id="synth-volume-value">0.50</span>
              </div>
              <div class="sampler-pads">
                ${Array(9).fill('<button class="synth-pad" disabled></button>').join('')}
              </div>
            </div>
          </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/@tonejs/midi@2.0.27/build/Midi.js"></script>
        <script>
          document.addEventListener('DOMContentLoaded', () => {
            console.log('[Synth] DOMContentLoaded fired');
            let audioContext;
            let masterGain;
            const volumeRange = document.getElementById('synth-volume');
            const volumeValueDisplay = document.getElementById('synth-volume-value');
            const fullscreenButton = document.getElementById('synth-fullscreen-button');
            const samplerPadsContainer = document.querySelector('.sampler-pads');
            if (!samplerPadsContainer) {
              console.error('[Synth] .sampler-pads not found!');
            } else {
              console.log('[Synth] .sampler-pads found, children:', samplerPadsContainer.children.length);
            }
            let isAudioInitialized = false;
            
            if (typeof Midi === 'undefined') {
              console.error('[Synth] Midi is not defined! Check script include.');
              return;
            } else {
              console.log('[Synth] Midi is defined:', typeof Midi);
            }
            
            function midiNoteToFrequency(midi) {
              return Math.pow(2, (midi - 69) / 12) * 440;
            }
            
            function playChord(frequencies, time) {
              if (!isAudioInitialized || !audioContext || !masterGain) {
                console.warn('[Synth] playChord: Audio not initialized');
                return;
              }
              const playTime = time || audioContext.currentTime;
              
              // --- Brighter Classic House Organ Sound ---
              const attack = 0.002;
              const decay = 0.1;
              const sustain = 0.6;
              const release = 0.15;
              const baseGain = 0.35; // Lowered slightly to prevent clipping with brighter harmonics
              const detuneCents = [-7, 0, 7]; // Tighter chorus for more focus
              const panValues = [-0.5, 0.5, 0];
  
              // Добавляем басовую ноту на две октавы ниже от нижней ноты аккорда
              if (frequencies.length > 0) {
                const lowestFreq = Math.min(...frequencies);
                const bassFreq = lowestFreq / 4; // Две октавы вниз = деление на 4
                
                // Создаем мощный бас
                const bassOsc = audioContext.createOscillator();
                const bassGain = audioContext.createGain();
                const bassFilter = audioContext.createBiquadFilter();
                
                bassOsc.type = 'sine';
                bassOsc.frequency.setValueAtTime(bassFreq, playTime);
                
                bassGain.gain.setValueAtTime(0, playTime);
                bassGain.gain.linearRampToValueAtTime(0.8, playTime + attack);
                bassGain.gain.linearRampToValueAtTime(0.5, playTime + attack + decay);
                bassGain.gain.linearRampToValueAtTime(0, playTime + attack + decay + release + 0.1);
                
                bassFilter.type = 'lowpass';
                bassFilter.frequency.value = 300;
                bassFilter.Q.value = 0.5;
                
                bassOsc.connect(bassGain).connect(bassFilter).connect(masterGain);
                bassOsc.start(playTime);
                bassOsc.stop(playTime + attack + decay + release + 0.2);
              }
  
              frequencies.forEach((freq) => {
                const harmonics = [
                  { freq: freq,     type: 'sine',    gain: 1.0  }, // Fundamental
                  { freq: freq * 2, type: 'square',  gain: 0.6  }, // Body
                  { freq: freq * 4, type: 'sawtooth',gain: 0.4  }, // Brightness
                  { freq: freq * 8, type: 'sine',    gain: 0.25 }  // Air
                ];
  
                harmonics.forEach(harm => {
                  detuneCents.forEach((det, dIdx) => {
                    const osc = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    const panNode = audioContext.createStereoPanner();
                    const filter = audioContext.createBiquadFilter();
  
                    osc.type = harm.type;
                    osc.frequency.setValueAtTime(harm.freq, playTime);
                    osc.detune.setValueAtTime(det, playTime);
                    
                    panNode.pan.setValueAtTime(panValues[dIdx % panValues.length], playTime);
                    
                    const vol = baseGain * harm.gain;
                    gainNode.gain.setValueAtTime(0, playTime);
                    gainNode.gain.linearRampToValueAtTime(vol, playTime + attack);
                    gainNode.gain.linearRampToValueAtTime(vol * sustain, playTime + attack + decay);
                    gainNode.gain.linearRampToValueAtTime(0, playTime + attack + decay + release);
                    
                    // Higher cutoff frequency for a much brighter sound
                    filter.type = 'lowpass';
                    filter.frequency.value = 9500;
                    filter.Q.value = 0.7;
  
                    osc.connect(gainNode).connect(filter).connect(panNode).connect(masterGain);
                    osc.start(playTime);
                    osc.stop(playTime + attack + decay + release + 0.1);
                  });
                });
              });
            }
            
            function play808Clap(time) {
              if (!isAudioInitialized || !audioContext || !masterGain) {
                console.warn('[Synth] play808Clap: Audio not initialized');
                return;
              }
              const playTime = time || audioContext.currentTime;
              
              // Основные параметры 808 clap
              const attack = 0.001;
              const decay = 0.3;
              const totalDuration = 0.4;
              
              // Создаем микшер для всего звука
              const clapMixer = audioContext.createGain();
              clapMixer.gain.value = 0.9;
              clapMixer.connect(masterGain);
              
              // 1. Основная шумовая компонента
              const createNoiseBuffer = () => {
                const bufferSize = audioContext.sampleRate * 0.5; // полсекунды шума
                const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                  data[i] = Math.random() * 2 - 1;
                }
                return buffer;
              };
              
              const noiseBuffer = createNoiseBuffer();
              
              // Функция для создания одного "хлопка"
              const createClapPulse = (delayTime, gainValue) => {
                const noise = audioContext.createBufferSource();
                noise.buffer = noiseBuffer;
                
                const noiseFilter = audioContext.createBiquadFilter();
                noiseFilter.type = 'bandpass';
                noiseFilter.frequency.value = 1500;
                noiseFilter.Q.value = 1.5;
                
                const pulseEnv = audioContext.createGain();
                pulseEnv.gain.setValueAtTime(0, playTime + delayTime);
                pulseEnv.gain.linearRampToValueAtTime(gainValue, playTime + delayTime + attack);
                pulseEnv.gain.exponentialRampToValueAtTime(0.001, playTime + delayTime + attack + decay);
                
                noise.connect(noiseFilter).connect(pulseEnv).connect(clapMixer);
                noise.start(playTime + delayTime);
                noise.stop(playTime + delayTime + decay + 0.05);
              };
              
              // Создаем серию из 4 быстрых импульсов с небольшой задержкой между ними
              // Это создает характерный эффект "хлопка в ладоши"
              createClapPulse(0.000, 0.7);
              createClapPulse(0.010, 0.8);
              createClapPulse(0.020, 0.9);
              createClapPulse(0.030, 1.0);
              
              // 2. Добавляем тональный компонент для "тела" звука
              const tone = audioContext.createOscillator();
              tone.type = 'triangle';
              tone.frequency.value = 450;
              
              const toneEnv = audioContext.createGain();
              toneEnv.gain.setValueAtTime(0, playTime);
              toneEnv.gain.linearRampToValueAtTime(0.3, playTime + 0.005);
              toneEnv.gain.exponentialRampToValueAtTime(0.001, playTime + 0.1);
              
              const toneFilter = audioContext.createBiquadFilter();
              toneFilter.type = 'lowpass';
              toneFilter.frequency.value = 800;
              
              tone.connect(toneEnv).connect(toneFilter).connect(clapMixer);
              tone.start(playTime);
              tone.stop(playTime + 0.1);
              
              // 3. Добавляем эффект реверберации для объемности
              const convolver = audioContext.createConvolver();
              const reverbTime = 0.2;
              const reverbBuffer = audioContext.createBuffer(2, audioContext.sampleRate * reverbTime, audioContext.sampleRate);
              
              for (let channel = 0; channel < 2; channel++) {
                const data = reverbBuffer.getChannelData(channel);
                for (let i = 0; i < data.length; i++) {
                  data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioContext.sampleRate * 0.1));
                }
              }
              
              convolver.buffer = reverbBuffer;
              
              const reverbGain = audioContext.createGain();
              reverbGain.gain.value = 0.2;
              
              clapMixer.connect(convolver);
              convolver.connect(reverbGain);
              reverbGain.connect(masterGain);
            }
            
            function setupSamplerPads(chords) {
              if (!samplerPadsContainer) {
                console.error('[Synth] setupSamplerPads: .sampler-pads not found!');
                return;
              }
              const pads = samplerPadsContainer.querySelectorAll('.synth-pad');
              console.log('[Synth] setupSamplerPads: pads found:', pads.length, 'chords:', chords.length);
              
              pads.forEach((pad, index) => {
                // Remove any old listeners to be safe, by replacing the node with a clone
                const newPad = pad.cloneNode(true);
                pad.parentNode.replaceChild(newPad, pad);
  
                const isCrashPad = (index === 8);
                const isChordPad = (index < 8 && index < chords.length);
  
                if (isChordPad) {
                  const chordMidiNotes = chords[index];
                  const frequencies = chordMidiNotes.map(midiNoteToFrequency);
                  newPad.dataset.frequencies = JSON.stringify(frequencies);
                  const rootMidi = chordMidiNotes[0];
                  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                  const noteName = noteNames[rootMidi % 12] + Math.floor(rootMidi / 12 - 1);
                  newPad.textContent = noteName.replace('#', '♯');
                  newPad.disabled = false;
                  newPad.style.opacity = 1;
                } else if (isCrashPad) {
                  newPad.textContent = 'Clap';
                  newPad.disabled = false;
                  newPad.style.opacity = 1;
                } else {
                  newPad.textContent = '';
                  newPad.disabled = true;
                  newPad.style.opacity = 0.3;
                }
  
                const handlePress = (e) => {
                  if (newPad.disabled) return;
                  if (e.type === 'touchstart') e.preventDefault();
                  if (!isAudioInitialized) initAudio();
                  if (audioContext && audioContext.state === 'suspended') audioContext.resume();
  
                  if (isCrashPad) {
                    play808Clap(audioContext.currentTime);
                  } else if (isChordPad) {
                    const storedFrequencies = JSON.parse(newPad.dataset.frequencies || '[]');
                    if (storedFrequencies.length > 0) {
                      playChord(storedFrequencies, audioContext.currentTime);
                    }
                  }
                  newPad.classList.add('pressed');
                };
  
                const handleRelease = () => {
                  if (newPad.disabled) return;
                  newPad.classList.remove('pressed');
                };
  
                newPad.addEventListener('mousedown', handlePress);
                newPad.addEventListener('mouseup', handleRelease);
                newPad.addEventListener('mouseleave', handleRelease);
                newPad.addEventListener('touchstart', handlePress, { passive: false });
                newPad.addEventListener('touchend', handleRelease);
                newPad.addEventListener('touchcancel', handleRelease);
              });
  
              const allPads = Array.from(samplerPadsContainer.querySelectorAll('.synth-pad'));
              const keyToPadIndex = { '7': 0, '8': 1, '9': 2, '4': 3, '5': 4, '6': 5, '1': 6, '2': 7, '3': 8 };
              
              window.addEventListener('keydown', (e) => {
                if (e.repeat) return;
                const idx = keyToPadIndex[e.key];
                if (typeof idx === 'number') {
                  const pad = allPads[idx];
                  if (pad && !pad.disabled) {
                    pad.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                  }
                }
              });
              window.addEventListener('keyup', (e) => {
                const idx = keyToPadIndex[e.key];
                if (typeof idx === 'number') {
                  const pad = allPads[idx];
                  if (pad && !pad.disabled) {
                    pad.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                  }
                }
              });
            }
            
            async function loadMidiAndSetupSampler(midiUrl) {
              console.log('[Synth] Attempting to load MIDI file from:', midiUrl);
              try {
                const response = await fetch(midiUrl, { mode: 'cors' });
                if (!response.ok) {
                  throw new Error('HTTP error! status: ' + response.status);
                }
                const arrayBuffer = await response.arrayBuffer();
                console.log('[Synth] MIDI file fetched successfully, size:', arrayBuffer.byteLength, 'bytes');
                const midi = new Midi(arrayBuffer);
                console.log('[Synth] MIDI parsed successfully:', midi);
                const chordsMap = new Map();
                const quantizeValue = 1 / 32;
                midi.tracks.forEach(track => {
                  if (track.channel === 9) return;
                  track.notes.forEach(note => {
                    const quantizedTime = Math.round(note.time / quantizeValue) * quantizeValue;
                    if (!chordsMap.has(quantizedTime)) {
                      chordsMap.set(quantizedTime, new Set());
                    }
                    chordsMap.get(quantizedTime).add(note.midi);
                  });
                });
                const uniqueChordStrings = new Set();
                const sortedTimes = Array.from(chordsMap.keys()).sort((a, b) => a - b);
                const uniqueChordsInOrder = [];
                for (const time of sortedTimes) {
                  const notes = Array.from(chordsMap.get(time)).sort((a,b) => a - b);
                  if (notes.length < 2) continue;
                  const chordString = JSON.stringify(notes);
                  if (!uniqueChordStrings.has(chordString)) {
                    uniqueChordStrings.add(chordString);
                    uniqueChordsInOrder.push(notes);
                  }
                }
                console.log('[Synth] Found', uniqueChordsInOrder.length, 'unique chords in the MIDI file.');
                setupSamplerPads(uniqueChordsInOrder.slice(0, 8));
              } catch (e) {
                console.error('[Synth] Failed to load or parse MIDI file:', e);
                if(samplerPadsContainer) samplerPadsContainer.innerHTML = '<p style="color: var(--tertiary-text-color); font-size: 0.8rem; text-align: center;">Error loading MIDI data: ' + e.message + '</p>';
              }
            }
            
            function initAudio() {
              if (isAudioInitialized) return;
              try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                masterGain = audioContext.createGain();
                const initialVolume = volumeRange ? parseFloat(volumeRange.value) : 0.5;
                masterGain.gain.setValueAtTime(initialVolume, audioContext.currentTime);
                masterGain.connect(audioContext.destination);
                isAudioInitialized = true;
                console.log('[Synth] AudioContext initialization successful.');
              } catch (e) {
                console.error('[Synth] Error initializing AudioContext:', e);
                isAudioInitialized = false;
              }
            }
            
      
            if (volumeRange) {
              volumeRange.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (masterGain && audioContext) masterGain.gain.setTargetAtTime(value, audioContext.currentTime, 0.01);
                if (volumeValueDisplay) volumeValueDisplay.textContent = value.toFixed(2);
                console.log('[Synth] Volume changed:', value);
              });
            } else {
              console.warn('[Synth] Volume range element not found');
            }
            
            let originalSynthWindowStyles = {};
            function requestSynthFullscreenAndLandscape() {
              if (!isAudioInitialized) initAudio();
              if (!audioContext) { console.error('[Synth] Audio not ready for fullscreen'); return; }
              if (audioContext.state === 'suspended') audioContext.resume();
              const synthWindow = document.getElementById('synth-window');
              if (!synthWindow) return;
              if (Object.keys(originalSynthWindowStyles).length === 0 && !document.fullscreenElement) {
                originalSynthWindowStyles = {
                  display: synthWindow.style.display || 'block',
                  width: synthWindow.style.width,
                  height: synthWindow.style.height,
                  top: synthWindow.style.top,
                  left: synthWindow.style.left,
                };
              }
              synthWindow.requestFullscreen()
                .then(() => {
                  if (screen.orientation && typeof screen.orientation.lock === 'function') {
                    screen.orientation.lock('landscape').catch(err => console.warn('[Synth] Screen orientation lock failed:', err));
                  }
                })
                .catch(err => {
                  console.error('[Synth] Error attempting to enable full-screen mode:', err);
                });
            }
            
            function exitSynthFullscreen() {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              }
            }
            
            if (fullscreenButton) {
              fullscreenButton.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                  requestSynthFullscreenAndLandscape();
                } else {
                  exitSynthFullscreen();
                }
              });
            } else {
              console.warn('[Synth] Fullscreen button not found');
            }
            
            document.addEventListener('fullscreenchange', () => {
              const synthWindow = document.getElementById('synth-window');
              if (!synthWindow) return;
              const isFullscreen = !!document.fullscreenElement;
              synthWindow.classList.toggle('synth-is-fullscreen-mobile', isFullscreen);
              if(fullscreenButton) fullscreenButton.innerHTML = isFullscreen ? '<i class="bi bi-fullscreen-exit"></i>' : '<i class="bi bi-fullscreen"></i>';
              if (!isFullscreen) {
                if (Object.keys(originalSynthWindowStyles).length > 0) {
                  Object.assign(synthWindow.style, originalSynthWindowStyles);
                  originalSynthWindowStyles = {};
                }
                if (screen.orientation && typeof screen.orientation.unlock === 'function') {
                  screen.orientation.unlock();
                }
              }
            });
            
            // Инициализация синтезатора и загрузка MIDI
            loadMidiAndSetupSampler(MIDI_URL);
            
            // Fallback если первый URL не загрузится
            window.addEventListener('error', function(e) {
              if (e.message && e.message.includes('MIDI')) {
                console.log('[Synth] Trying fallback MIDI URL...');
                loadMidiAndSetupSampler(MIDI_FALLBACK_URL);
              }
            }, {once: true});
            
            // Инициализируем аудио при первом клике на странице
            document.body.addEventListener('click', function initOnFirstClick() {
              if (!isAudioInitialized) {
                console.log('[Synth] First click: initializing audio');
                initAudio();
              }
              document.body.removeEventListener('click', initOnFirstClick);
            }, {once: true});
            
            console.log('[Synth] Logic initialized.');
          });
        </script>
        </body>
        </html>
      `;
  
      return new Response(html, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    },
  };
  