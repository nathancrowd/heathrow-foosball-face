import hapticPlayer from "../bhaptics/hapticPlayer";


export default class Haptics {
    constructor() {
        this.player = new hapticPlayer();
        const current_folder = document.URL.substr(0,document.URL.lastIndexOf('/'));
        this.player.register("BowShoot", current_folder + "/models/haptics/BowShoot.tact");
        this.player.submitRegistered("BowShoot");
    }
}