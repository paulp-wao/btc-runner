import type * as PIXI from 'pixi.js';
import { createEngine } from '~/index';

const getCanvas = () => {
  const result = document.getElementById('game');
  if (!result) throw new Error("couldn't find game canvas");
  return result as HTMLCanvasElement;
};

const resizeApp = (props: {
  appRef: PIXI.Application;
  canvas: HTMLCanvasElement;
  virtSize: { width: number; height: number };
}) => {
  const { appRef: app, canvas, virtSize } = props;
  const targetAspect = virtSize.width / virtSize.height;
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const windowAspect = winW / winH;

  let newWidth: number;
  let newHeight: number;
  if (windowAspect > targetAspect) {
    newHeight = winH;
    newWidth = newHeight * targetAspect;
  } else {
    newWidth = winW;
    newHeight = newWidth / targetAspect;
  }

  app.renderer.resize(newWidth, newHeight);

  const scaleX = newWidth / virtSize.width;
  const scaleY = newHeight / virtSize.height;
  app.stage.scale.set(scaleX, scaleY);

  canvas.style.width = `${newWidth}px`;
  canvas.style.height = `${newHeight}px`;
  canvas.style.margin = 'auto';
};

const main = async () => {
  const canvas = getCanvas();
  const gameEngine = await createEngine({ canvas });
  const appRef = gameEngine.appRef();

  appRef.canvas.style.display = 'none';

  const virtSize = {
    width: gameEngine.constants().virtualGameWidth,
    height: gameEngine.constants().virtualGameHeight,
  };

  const resizer = () => resizeApp({ appRef, canvas, virtSize });

  const startGame = () => {
    setTimeout(() => {
      const loadgingText = document.getElementById('loading-wrapper');
      if (loadgingText) {
        loadgingText.style.display = 'none';
      }
      resizer();
      appRef.canvas.style.display = 'block';
      appRef.canvas.style.border = '2px solid white';
    }, 250);
  };

  if (document.readyState === 'complete') {
    startGame();
  } else {
    window.addEventListener('load', startGame);
  }

  window.onresize = resizer;
};

main();
