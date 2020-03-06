export default {
    wallFriction: 0.4,
    wallBounce: 0.5,
    cameraPosition: {
        x:-8,
        y: 5,
        z: 30
    },
    enableControls: false,
    faceSlots: [
        {},
        {},
        {},
    ],
    faceCountdown: 10000, // milliseconds
    poles: [
        {
            x: -8,
            y: -3.4,
            z: 0,
        },
        {
            x: -8,
            y: -3.4,
            z: -11.5,
        }
    ],
    characters: [
        { // Front Right
            x: -4,
            y: -3.3,
            z: 0
        },
        { // Back Middle
            x: -8,
            y: -3.3,
            z: -11.5
        },
        { // Front Left
            x: -12,
            y: -3.3,
            z: 0
        },
    ],
    posenetArchitecture: 'MobileNetV1',
    outputStride: 8,
    maxPlayers: 3,
    scoreThreshold: 0.1,
    maxXMovement: 8,
    ballFriction: 0.4,
    ballBounce: 0.5,
    ballMass: 0.6,
    ballFrequency: 1000, // milliseconds
    ballSpeed: 25,
    ballDecay: 15000, // milliseconds
    preGameTimer: 10000, // milliseconds
    gameTime: 20000, // milliseconds
    postGameTime: 5000,
    idleTime: 5000 // milliseconds
}