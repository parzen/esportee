import {
  it,
  describe,
  async,
  inject,
  beforeEachProviders
} from '@angular/core/testing';

import { TestComponentBuilder } from '@angular/compiler/testing';

import { TournamentsComponent } from './tournaments.component';

describe('Tournaments Component', () => {

  beforeEachProviders(() => []);

  it('should ...', async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    tcb.createAsync(TournamentsComponent).then((fixture) => {
      fixture.detectChanges();
    });
  })));

});
