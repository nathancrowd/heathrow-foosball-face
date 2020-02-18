# Face Mapping First Test

This is using 2 libraries: JeelizFaceFilter, and Face-Api.

Face-Api is used to capture a user's face and save it as a canvas element.
(A nice-to-have is to have their live face mapped, not just a capture)

Jeeliz is used to take that canvas and map it over faces in a video.
I have been using the demos supplied in the Jeeliz repo as a starting point, the ones under `/demos/faceReplacement` are exactly what we're looking for but hard to replicate in our use case.

`index.js` is where I'm initializing these libraries and running most of the code