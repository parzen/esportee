import { EsporteeClientNg2Page } from './app.po';

describe('esportee-client-ng2 App', function() {
  let page: EsporteeClientNg2Page;

  beforeEach(() => {
    page = new EsporteeClientNg2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
