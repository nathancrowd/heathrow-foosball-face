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
    characterMovementSpeed: 0.1,
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
        width: 1080,
        height: 1920
    },
    mobile: isMobile,
    teams: [
        {
            object:'/models/character/kits/Blue/Blue Kit 1/blue_kit_1_foosball_player.obj',
            material:'/models/character/kits/Blue/Blue Kit 1/blue_kit_1_foosball_player.mtl',
            image:'/models/character/kits/Blue/Blue Kit 1/shirt_1_bl.jpg',
            mapping: {
                flipY: false,
                offset: {
                    x: 0,
                    y: 0.05
                },
                repeat: {
                    x: 1,
                    y: 1
                },
                rotation: 1.5708
            }
        },
        {
            object:'/models/character/kits/Blue/Blue Kit 2/blue_kit_2_foosball_player.obj',
            material:'/models/character/kits/Blue/Blue Kit 2/blue_kit_2_foosball_player.mtl',
            image:'/models/character/kits/Blue/Blue Kit 2/shirt_2_bl-01.jpg',
            mapping: {
                flipY: true,
                offset: {
                    x: 0,
                    y: -0.1
                },
                repeat: {
                    x: 2,
                    y: 2
                },
                rotation: 1.5708
            }
        },
        {
            object:'/models/character/kits/Blue/Blue Kit 3/blue_kit_3_foosball_player.obj',
            material:'/models/character/kits/Blue/Blue Kit 3/blue_kit_3_foosball_player.mtl',
            image:'/models/character/kits/Blue/Blue Kit 3/shirt_3_bl-01.jpg',
            mapping: {
                flipY: false,
                offset: {
                    x: -0.2,
                    y: 0.725
                },
                repeat: {
                    x: 1.4,
                    y: 1
                },
                rotation: 1.5708
            }
        },
        {
            object:'/models/character/kits/Red/Red Kit 1/red_kit_1_foosball_player.obj',
            material:'/models/character/kits/Red/Red Kit 1/red_kit_1_foosball_player.mtl',
            image:'/models/character/kits/Red/Red Kit 1/shirt_1_red.jpg',
            mapping: {
                flipY: false,
                offset: {
                    x: 0,
                    y: 0.05
                },
                repeat: {
                    x: 1,
                    y: 1
                },
                rotation: 1.5708
            }
        },
        {
            object:'/models/character/kits/Red/Red Kit 2/red_kit_2_foosball_player.obj',
            material:'/models/character/kits/Red/Red Kit 2/red_kit_2_foosball_player.mtl',
            image:'/models/character/kits/Red/Red Kit 2/shirt_2_red-01.jpg',
            mapping: {
                flipY: true,
                offset: {
                    x: 0,
                    y: -0.1
                },
                repeat: {
                    x: 2,
                    y: 2
                },
                rotation: 1.5708
            }
        },
        {
            object:'/models/character/kits/Red/Red Kit 3/red_kit_3_foosball_player.obj',
            material:'/models/character/kits/Red/Red Kit 3/red_kit_3_foosball_player.mtl',
            image:'/models/character/kits/Red/Red Kit 3/shirt_3_red-01.jpg',
            mapping: {
                flipY: false,
                offset: {
                    x: -0.2,
                    y: 0.725
                },
                repeat: {
                    x: 1.4,
                    y: 1
                },
                rotation: 1.5708
            }
        },
    ],
    playSound: true
}