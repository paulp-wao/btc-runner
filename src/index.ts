import { simpleScene } from '~/scenes/simple/_main';
import { createDiContainer } from '~/util/di-container';

export const createEngine = async (props: { canvas: HTMLCanvasElement }) => {
  const { canvas } = props;
  const di = createDiContainer();

  try {
    await di.appRef().init({
      backgroundColor: '#0066ff',
      resolution: 1,
      autoDensity: true,
      antialias: true,
      canvas: canvas,
    });

    const sceneEngine = di.sceneEngine();

    sceneEngine.next(() => simpleScene(di));
  } catch (error) {
    console.error(error);
  }

  return {
    constants: () => di.gameConstants(),
    appRef: () => di.appRef(),
  };
};
