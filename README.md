# Cat-apult #

A js13k game jam entry 2025

Theme: Black Cat

You can play the game at: https://labrat.mobi/games/catapult/

Game developed using: [karlib](https://github.com/goldenratio/karlib)

## Requirements

- [Node.js LTS](https://nodejs.org/en/download)

## Local Developement

```console
npm i
npm run dev
```

## Packing for js13k

- Run `npm run build:js13k`, to build game and create `dist.zip` for distribution

## Run in native (opengl/metal/vulkan) env with skia-canvas

```console
npm run build:node
node ./js/main.mjs
```
