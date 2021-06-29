import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class LoadingService {
  loading: boolean;
  subject = new BehaviorSubject<boolean>(false);

  constructor() {

  }

  getSubject(): BehaviorSubject<boolean> {
    return this.subject;
  }

  isLoading(): boolean {
    return this.loading;
  }

  setLoading(loading: boolean) {
    this.loading = loading;
    this.subject.next(this.loading);
  }

}
