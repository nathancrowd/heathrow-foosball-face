let isMobile = false;
if (typeof window === 'object') {
    isMobile = window.innerWidth < 769 ? true : false;
}

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
    characterSpacing: 4,
    posenetArchitecture: 'MobileNetV1',
    outputStride: 16,
    quantBytes: 2,
    posenetMult: 0.75,
    maxPlayers: 3,
    maxFps: 60,
    drawShadows: true,
    scoreThreshold: 0.3,
    maxXMovement: 16,
    characterMovementSpeed: 0.01,
    characterMovementDelay: 0,
    ballFriction: 0.4,
    ballBounce: 0.5,
    ballMass: 0.6,
    ballFrequency: 1000, // milliseconds
    ballSpeed: 25,
    ballDecay: 15000, // milliseconds
    preGameTimer: 10000, // milliseconds
    gameTime: 20000, // milliseconds
    postGameTime: 5000,
    idleTime: 5000, // milliseconds
    dimensions: {
        width: 2160,
        height: 3840
    },
    mobile: isMobile,
    teams: [
        'Italy',
        'Switzerland',
        'Turkey',
        'Wales',
        'Belgium',
        'Denmark',
        'Finland',
        'Russia',
        'Austria',
        'Netherlands',
        '',
        'Ukraine',
        'Croatia',
        'Czech Republic',
        'England',
        '',
        '',
        'Poland',
        'Spain',
        'Sweden',
        'France',
        'Germany',
        '',
        'Portugal'
    ]
}