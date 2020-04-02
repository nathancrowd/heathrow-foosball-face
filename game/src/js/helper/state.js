let stage = 1;

function getStage() {
    return stage;
}

function setStage(s) {
    if (s != 1 && s != 2) {
        return;
    }
    stage = s;
}

export {
    getStage,
    setStage
}