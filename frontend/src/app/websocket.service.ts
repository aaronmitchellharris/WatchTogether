import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';

const url = environment.websocket_url;

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket: WebSocketSubject<any>;
  updateSubject: Subject<any>;

  constructor() {
    this.socket = webSocket(url);  // create socket
    this.updateSubject = new Subject<any>();
  }

  // connect to socket
  connect(): void {
    this.socket.subscribe({
      next: (msg) => this.receiveMessage(msg), // Called whenever there is a message from the server.
      error: err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
      complete: () => console.log('complete') // Called when connection is closed (for whatever reason).
    });
    console.log('Connected to lobby');
  }

  getUpdateSubject(): Subject<any> {
    return this.updateSubject;
  }

  receiveMessage(msg: any): void {
    this.updateSubject.next(msg);
  }

  // send message to server
  sendMessage(meta: any, lobby: string, content: any, user?: string, nickname?: string): void {
    this.socket.next({ 
      meta: meta,
      lobby: lobby,
      user: user,
      nickname: nickname,
      content: content
    });
  }

  close() {
    this.socket.complete();
  }

}
