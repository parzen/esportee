import {Injectable} from '@angular/core';
import * as Rx from 'rxjs/Rx';

@Injectable()
export class WebsocketService {

  private subject: Rx.Subject<MessageEvent>;
  private ws: WebSocket;

  constructor() {
  }

  public connect(): Rx.Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create();
    }
    this.subject.subscribe(msg => {
      console.log(msg);
    });
    return this.subject;
  }

  public close() {
    this.ws.close();
    this.ws = null;
  }

  private create(): Rx.Subject<MessageEvent> {
    if (this.ws != null) {
      this.ws.close()
    }

    let idToken = localStorage.getItem('id_token');
    let url = 'ws://localhost:1234?token=' + encodeURIComponent(idToken)
    this.ws = new WebSocket(url);
    let observable = Rx.Observable.create(
      (obs: Rx.Observer<MessageEvent>) => {
        this.ws.onmessage = obs.next.bind(obs);
        this.ws.onerror = obs.error.bind(obs);
        this.ws.onclose = obs.complete.bind(obs);
        return this.ws.close.bind(this.ws);
      });
    let observer = {
      next: (data: Object) => {
        if (this.ws.readyState === WebSocket.OPEN) {
          console.log(data);
          this.ws.send(JSON.stringify(data));
        }
      }
    };

    return Rx.Subject.create(observer, observable);
  }

}

export interface WebSocketMessage {
  type: string;
  data: any;
}
