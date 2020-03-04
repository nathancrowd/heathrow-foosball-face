# AR Foosball

This is where we will be putting together the components to build the game.

## Folder Structure

I think it might be helpful to segment the JavaScript into folders under `src/js` that correspond to the threads they run on.
So the main thread is found in `main`. Any workers can be given their own threads, e.g. `posenet` and then use the `entries` array in the js part of `gulpfile.js` to split the resources so webpack bundles them separately.

## Development

As the other parts of this repo:

`npm install`

then

`gulp` or `npm start`

Allowing insecure origins to capture webcam video is a bit funny, so you can install the `http-server` npm package globally if you need to run through a server. (See the root `README.md`).

## Package

TODO: running `gulp package` or `npm package` will build a production-ready package for easy deployment to the machines.