const config = {
    netArchitecture: 'MobileNetV1',
    outputStride: 8,
    maxPlayers: 2,
    maxXMovement: 3,
    threeJsMaxFps: 60,
    movementDuration: 0.5,
    stages: [
        'playerMovement',
        'playerSpin',
        'playerKick'
    ]
}

export default config;