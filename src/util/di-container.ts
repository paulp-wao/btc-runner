import * as PIXI from 'pixi.js';
import { createEntityStore, type IEntityStore } from '~/ecs/entity.store';
import { createSystemAgg, type ISystemAgg } from '~/ecs/system.agg';
import { createSceneEngine, type ISceneEngine } from '~/scenes/scene-engine';
import { createAssetLoader, type IAssetLoader } from './asset-loader';
import { createEventBus, type IEventBus } from './event-bus';
import { getGameConstants, type IGameConstants } from './game.constants';

export interface IDiContainer {
  appRef: () => PIXI.Application;
  assetLoader: () => IAssetLoader;
  entityStore: () => IEntityStore;
  eventBus: () => IEventBus;
  gameConstants: () => IGameConstants;
  gameRef: () => PIXI.Container;
  sceneEngine: () => ISceneEngine;
  systemAgg: () => ISystemAgg;
}

const diContainer = (): IDiContainer => {
  let _appRef: PIXI.Application | undefined;
  let _eventBus: IEventBus | undefined;
  let _entityStore: IEntityStore | undefined;
  let _gameRef: PIXI.Container | undefined;
  let _assetLoader: IAssetLoader | undefined;
  let _sceneEngine: ISceneEngine | undefined;
  let _systemAgg: ISystemAgg | undefined;

  const appRef = () => {
    if (!_appRef) {
      _appRef = new PIXI.Application();
    }
    return _appRef;
  };

  const assetLoader = (): IAssetLoader => {
    if (!_assetLoader) {
      _assetLoader = createAssetLoader();
    }
    return _assetLoader;
  };

  const eventBus = () => {
    if (!_eventBus) {
      _eventBus = createEventBus();
    }
    return _eventBus;
  };

  const entityStore = () => {
    if (!_entityStore) {
      _entityStore = createEntityStore(gameRef());
    }
    return _entityStore;
  };

  const gameConstants = () => getGameConstants();

  const gameRef = () => {
    if (!_gameRef) {
      _gameRef = new PIXI.Container();
      _gameRef.sortableChildren = true;
    }
    return _gameRef;
  };

  const sceneEngine = () => {
    if (!_sceneEngine) {
      _sceneEngine = createSceneEngine(gameRef());
    }
    return _sceneEngine;
  };

  const systemAgg = () => {
    if (!_systemAgg) {
      _systemAgg = createSystemAgg();
    }
    return _systemAgg;
  };

  return {
    appRef,
    assetLoader,
    entityStore,
    eventBus,
    gameConstants,
    gameRef,
    sceneEngine,
    systemAgg,
  };
};

export const createDiContainer = (): IDiContainer => {
  return diContainer();
};
