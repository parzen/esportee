import {
  it,
  describe,
  async,
  inject,
  beforeEachProviders
} from '@angular/core/testing';

import { TestComponentBuilder } from '@angular/compiler/testing';

import { GamesCardComponent } from './games-card.component';

describe('Games-card Component', () => {

  beforeEachProviders(() => []);

  it('should ...', async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    tcb.createAsync(GamesCardComponent).then((fixture) => {
      fixture.detectChanges();
    });
  })));

});
