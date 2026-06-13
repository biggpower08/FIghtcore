import './styles/main.css';
import { Game } from './game/Game';

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
const menuRoot = document.querySelector<HTMLDivElement>('#menu-root');
const rewardRoot = document.querySelector<HTMLDivElement>('#reward-root');

if (!canvas || !menuRoot || !rewardRoot) {
  throw new Error('Game canvas, menu root, or reward root was not found.');
}

const game = new Game(canvas, menuRoot, rewardRoot);
game.start();
