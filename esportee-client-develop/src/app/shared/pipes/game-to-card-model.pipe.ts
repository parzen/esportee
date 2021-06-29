import {Pipe, PipeTransform} from '@angular/core';
import {Game} from '../models/game.model';

@Pipe({name: 'myGameToCardModel'})
export class GameToCardModelPipe implements PipeTransform {
  transform(game: Game): Object {
    let result = {};
    result['id'] = game.id;
    result['coverImageUrl'] = game.coverImageUrl;
    result['imgCap'] = game.title;
    result['title'] = game.title;
    result['subTitle'] = game.publisher;
    result['description'] = game.description;
    result['studio'] = game.studio;
    result['urlParam'] = game.urlParam;
    return result;
  }
}
