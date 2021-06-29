import {Subscription} from 'rxjs/Subscription';

export class HasSubscriptions {
  private subscriptions: Array<Subscription> = new Array<Subscription>();

  public addSubscription(subscription: Subscription) {
    this.subscriptions.push(subscription);
  }

  public unsubscribeAll() {
    this.subscriptions.map(subscription => {
      subscription.unsubscribe();
    })
  }

}
