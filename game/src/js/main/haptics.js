import tactJs from "../bhaptics/tact-js.es5";
import {FileLoader} from "three";


export default class Haptics {
    constructor() {
        console.log("HAPTICS: Initialising...");
        this.player = tactJs;
        console.log("HAPTICS: Initialised");
        this.loadModels();
        console.log("HAPTICS: Loaded assets");
    }

    loadModels() {
        const loader = new FileLoader();
        const player = this.player;
        console.log("HAPTICS: Loading assets...");
        const current_folder = document.URL.substr(0, document.URL.lastIndexOf('/'));
        loader.load(current_folder + "/models/haptics/BowShoot.tact", function (text) {
            player.registerFile("BowShoot", text);

            window.setTimeout(function(){
                player.submitRegistered("BowShoot");
                console.log("HAPTICS: Played BowShot");




                player.submit({"Submit":[{"Type":"frame","Key":"FootRpath","Frame":{"Position":"FootR","PathPoints":[{"X":0.904,"Y":0.156,"Intensity":50}],"DotPoints":[],"DurationMillis":1000}}]})
            }, 1000);



            for (var i = 0; i <= 20; i++) {
                player.submitDot('dot', 'FootRpath', [{
                    Index: i,
                    Intensity: 100
                }], 1000);
            }
        });

    }
}