export interface IGameConstants {
  virtualGameWidth: number;
  virtualGameHeight: number;
}

export const getGameConstants = (): IGameConstants => {
  return {
    virtualGameWidth: 640,
    virtualGameHeight: 360,
  };
};
