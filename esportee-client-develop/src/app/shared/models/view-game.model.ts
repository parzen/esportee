import {Game} from './game.model';
export class ViewGame {

  game: Game;
  imgSrc: String;
  imgCap: String;
  title: String;
  description: String;


  constructor(game: Game) {
    this.game = game;
  }

  getGame(): Game {
    return this.game;
  }
}
