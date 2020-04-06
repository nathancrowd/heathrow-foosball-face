import * as Tone from 'tone';
import {Howl, Howler} from 'howler';
import CONFIG from '../helper/config';

let running = false;
let kickSynth = null;
let tuneSynth = null;
let whistle = null;
let cheer = null;

async function init() {
    if (running) {
        return;
    }
    whistle = new Howl({
        src: [CONFIG.sound.whistle.src],
        preload: true
    });
    cheer = new Howl({
        src: [CONFIG.sound.cheer.src],
        preload: true,
        volume: 0,
        loop: true
    });
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

function blowWhistle() {
    whistle.stop();
    whistle.play();
}

function crowdCheer() {
    cheer.stop();
    cheer.play();
    cheer.fade(0,1,CONFIG.sound.cheer.duration);
    setTimeout(() => {
        cheer.fade(1,0,CONFIG.sound.cheer.duration);
    }, CONFIG.sound.cheer.duration);
}

function kick() {
    kickSynth.triggerAttackRelease('C1', '2n');
}

function bell() {
    tuneSynth.triggerAttackRelease('C4', '8n');
}

export {
    init,
    kick,
    bell,
    blowWhistle,
    crowdCheer,
    running
}