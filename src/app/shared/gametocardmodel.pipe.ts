import {Pipe, PipeTransform} from '@angular/core';
import {Game} from './model/Game';

@Pipe({name: 'myGameToCardModel'})
export class GameToCardModelPipe implements PipeTransform {
    transform(game:Game):Object {
        let result = {};
        result['coverImageUrl'] = game.coverImageUrl;
        result['imgCap'] = game.title;
        result['title'] = game.title;
        result['subTitle'] = game.publisher;
        result['description'] = game.description;
        result['studio'] = game.studio;
        return result;
    }
}
