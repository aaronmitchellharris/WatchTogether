import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';

const url = environment.websocket_url;

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket?: WebSocketSubject<any>;

  constructor() {}

  connect(): void {
    this.socket = webSocket(url);
    this.socket.subscribe({
      next: msg => console.log('message received: ' + msg), // Called whenever there is a message from the server.
      error: err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
      complete: () => console.log('complete') // Called when connection is closed (for whatever reason).
    });
  }

  sendMessage(msg: any): void {
    this.socket?.next({message: msg});
  }

  close() {
    this.socket?.complete();
  }

}
