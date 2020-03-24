import * as Tone from 'tone';
import CONFIG from '../helper/config';

let running = false;
let kickSynth = null;
let tuneSynth = null;
let noiseSynth = null;

async function init() {
    if (running) {
        return;
    }
    await Tone.start();
    console.log('Sound: initialised');
    running = true;
    kickSynth = new Tone.MembraneSynth({
        pitchDecay : 0.05,
        octaves : 10,
        oscillator : {
            type : 'sine'
        } ,
        envelope : {
            attack : 0.001,
            decay : 0.4,
            sustain : 0.01,
            release : 1.4,
            attackCurve : 'exponential'
        }
    }).toMaster();
    noiseSynth = new Tone.NoiseSynth({
        noise: 'brown',
        envelope : {
            attack : 0.005 ,
            decay : 0.2 ,
            sustain : 0.3
        }
    }).toMaster();
    tuneSynth = new Tone.Synth({
        envelope: {
            attack: 0.29,
            attackCurve: 'sine',
            decay: 0.01,
            decayCurve: 'exponential',
            sustain: 0.88,
            release: 0.25,
            releaseCurve: 'cosine'
        },
        oscillator: {
            type: 'sine',
        }
    }).toMaster();
}

function kick() {
    kickSynth.triggerAttackRelease('C1', '2n');
}

function fanfare() {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    Tone.Transport.cancel();
    Tone.Transport.loop = false;

    Tone.Transport.schedule(time => {
        noiseSynth.triggerAttackRelease('2n',time);
    }, 0);
    Tone.Transport.schedule(time => {
        noiseSynth.triggerAttackRelease('8n',time);
    }, 1/2);
    Tone.Transport.schedule(time => {
        noiseSynth.triggerAttackRelease('8n',time);
    }, 1/2 + 1/8);
    Tone.Transport.schedule(time => {
        noiseSynth.triggerAttackRelease('2n',time);
    }, 1/2 + 1/4);

    Tone.Transport.start();
    // tuneSynth.triggerAttackRelease('E4', '4n', Tone.Time('4n') + Tone.Time('8n') + Tone.Time('16n'));
    // tuneSynth.triggerAttackRelease('G4', '4n', '2n');
    // tuneSynth.triggerAttackRelease('C5', '2n', Tone.Time('2n') + Tone.Time('4n'));
}

function chant() {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    Tone.Transport.cancel();
    Tone.Transport.loop = false;
    // chantNoise = new Tone.Noise('brown').start().connect(Tone.Master);
    Tone.Transport.schedule(time => {
        noiseSynth.triggerAttackRelease("2n",time);
    }, 0);
    Tone.Transport.schedule(time => {
        noiseSynth.triggerAttackRelease("2n", time);
    }, 1/2);
    Tone.Transport.schedule(time => {
        noiseSynth.triggerAttackRelease("4n", time);
    }, 1);
    Tone.Transport.schedule(time => {
        noiseSynth.triggerAttackRelease("4n", time);
    }, 1 + 1/4);
    Tone.Transport.schedule(time => {
        noiseSynth.triggerAttackRelease("2n", time);
    }, 1 + 1/2);
    Tone.Transport.schedule(time => {
        noiseSynth.triggerAttackRelease("4n", time);
    }, 2);
    Tone.Transport.schedule(time => {
        noiseSynth.triggerAttackRelease("4n", time);
    }, 2 + 1/4);
    Tone.Transport.schedule(time => {
        noiseSynth.triggerAttackRelease("4n", time);
    }, 2 + 1/2);
    Tone.Transport.schedule(time => {
        noiseSynth.triggerAttackRelease("2n", time);
    }, 2 + 3/4);
    Tone.Transport.schedule(time => {
        noiseSynth.triggerAttackRelease("4n",time);
    }, 3 + 1/4);
    Tone.Transport.schedule(time => {
        noiseSynth.triggerAttackRelease("4n", time);
    }, 3 + 1/2);
    Tone.Transport.start();

    // let autoFilter = new Tone.AutoFilter({
    //     "frequency" : "4n",
    //     "min" : 12000,
    //     "max" : 15000
    // }).connect(Tone.Master);
    // chantNoise.connect(autoFilter);
    // autoFilter.start();
}

function bell() {
    if(tuneSynth)tuneSynth.triggerAttackRelease('C4', '8n');
}

export {
    init,
    kick,
    fanfare,
    chant,
    bell,
    running
}