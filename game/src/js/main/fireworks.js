function createParticle(x, y) {
    const particle = document.createElement('particle');
    document.body.appendChild(particle);
    const size = Math.floor(Math.random() * 20 + 5);
    // Apply the size on each particle
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    // Generate a random color in a blue/purple palette
    let color = `#d5bd68`;
    particle.style.background = color;
    particle.style.boxShadow = `0 0 ${Math.floor(Math.random() * 10 + 10)}px ${color}`;

    // Generate a random x & y destination within a distance of 75px from the mouse
    const destinationX = x + (Math.random() - 0.5) * 2 * (window.innerWidth / 5);
    const destinationY = y + (Math.random() - 0.5) * 2 * (window.innerWidth / 5);

    // Store the animation in a variable because we will need it later
    const animation = particle.animate([
        {
        // Set the origin position of the particle
        // We offset the particle with half its size to center it around the mouse
        transform: `translate(${x - (size / 2)}px, ${y - (size / 2)}px)`,
        opacity: 1
        },
        {
        // We define the final coordinates as the second keyframe
        transform: `translate(${destinationX}px, ${destinationY}px)`,
        opacity: 0
        }
    ], {
        // Set a random duration from 500 to 1500ms
        duration: 2500 + Math.random() * 3200,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        // Delay every particle with a random value from 0ms to 200ms
        delay: Math.random() * 200
    });

    animation.onfinish = () => {
        particle.remove();
    };
}

function display() {
    for (let i = 0; i < 30; i++) {
        // We pass the mouse coordinates to the createParticle() function
        createParticle(window.innerWidth * 0.25, window.innerHeight * 0.2);
    }
    setTimeout(() => {
        for (let i = 0; i < 30; i++) {
            // We pass the mouse coordinates to the createParticle() function
            createParticle(window.innerWidth * 0.75, window.innerHeight * 0.2);
        }
    }, 100);
    setTimeout(() => {
        for (let i = 0; i < 30; i++) {
            // We pass the mouse coordinates to the createParticle() function
            createParticle(window.innerWidth * 0.25, window.innerHeight * 0.8);
        }
    }, 300);
    setTimeout(() => {
        for (let i = 0; i < 30; i++) {
            // We pass the mouse coordinates to the createParticle() function
            createParticle(window.innerWidth * 0.75, window.innerHeight * 0.8);
        }
    }, 120);
}

export {
    display
}