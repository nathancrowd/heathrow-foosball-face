import tactJs from "../bhaptics/tact-js.es5";
import {FileLoader} from "three";


export default class Haptics {
    constructor() {
        self.loaded = false;
        console.log("HAPTICS: Initialising...");
        this.haptics = tactJs;
        console.log("HAPTICS: Initialised");
        this.loadModels();
        console.log("HAPTICS: Loaded assets");
    }

    listenKicks(players) {
        players.forEach(p => {
            p.onCollision((co, v, r, n) => {
                if(self.haptics){
                console.log('HAPTICS: kick', co, v, r, n);
                this.haptics.submit({
                    "Submit": [{
                        "Type": "frame",
                        "Key": "FootRpath",
                        "Frame": {
                            "Position": "FootR",
                            "PathPoints": [{"X": 0.904, "Y": 0.156, "Intensity": 50}],
                            "DotPoints": [],
                            "DurationMillis": 1000
                        }
                    }]
                })
            }}, 1000);

        });


    }

    loadModels() {
        const loader = new FileLoader();
        let haptics = this.haptics;
        if(haptics) {
            console.log("HAPTICS: Loading assets...");
            const current_folder = document.URL.substr(0, document.URL.lastIndexOf('/'));
            loader.load(current_folder + "/models/haptics/BowShoot.tact", function (text) {
                haptics.registerFile("BowShoot", text);

                window.setTimeout(function () {
                    haptics.submitRegistered("BowShoot");
                    console.log("HAPTICS: Played BowShot");


                    haptics.submit({
                        "Submit": [{
                            "Type": "frame",
                            "Key": "FootRpath",
                            "Frame": {
                                "Position": "FootR",
                                "PathPoints": [{"X": 0.904, "Y": 0.156, "Intensity": 50}],
                                "DotPoints": [],
                                "DurationMillis": 1000
                            }
                        }]
                    })
                }, 1000);

                for (var i = 0; i <= 20; i++) {
                    haptics.submitDot('dot', 'FootRpath', [{
                        Index: i,
                        Intensity: 100
                    }], 1000);
                }
            });
        }

    }
}