import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebsocketService } from '../websocket.service';
import { Message } from '../message';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {

  lobbyId: string;
  user?: string;
  @Input() nickname: string;
  @Input() message: any;
  @Input() videoLink?: string;
  videoId?: string;
  messageLog: Message[];
  subscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private WebsocketService: WebsocketService,
    private cookieService: CookieService
  ) {
    this.lobbyId = String(this.route.snapshot.paramMap.get('id'));
    this.messageLog = [];
    this.nickname = cookieService.check('nickname') ? cookieService.get('nickname') : '';
  }
  
  ngOnInit(): void {
    this.WebsocketService.connect();
    this.WebsocketService.sendMessage("join", this.lobbyId, null, this.user, this.nickname);
    this.subscription = this.WebsocketService.getUpdateSubject().subscribe({
      next: (msg) => {this.addMessage(msg)},
      error: (error) => console.log(error)
    })
  }

  ngOnDestroy(): void {
    this.WebsocketService.close();
    this.subscription?.unsubscribe();
  }

  // send message to server
  send(): void {
    if (this.message && this.lobbyId) {
      this.WebsocketService.sendMessage("message", this.lobbyId, this.message, this.user, this.nickname);
      this.message = '';
    }
  }

  // add messages to message log
  addMessage(data: Message): void {
    if (data.meta === 'initial') {
      this.messageLog = data.content;
      this.user = data.user;
      if (!this.cookieService.check('nickname')) {
        this.nickname = data.user;
      }
    } else if (data.meta === 'log' || data.meta == 'system') {
      this.messageLog = data.content;
    } else if (data.meta === 'video') {
      this.videoId = data.content;
    } else {
      this.messageLog.push(data);
    }
  }

  // update nickname
  updateNickname(): void {
    this.WebsocketService.sendMessage("nickname", this.lobbyId, null, this.user, this.nickname);
    this.cookieService.set('nickname', this.nickname);
  }

  // update video ID
  updateVideoId(): void {
    let paramString = this.videoLink?.split('?')[1];
    let paramPairs = paramString?.split('&');

    paramPairs?.forEach(pair => {
      let param = pair.split('=');
      if (param[0] == 'v') {
        //this.videoId = param[1];
        this.WebsocketService.sendMessage("video", this.lobbyId, param[1], this.user, this.nickname);
        return;
      }
    })
  }

}
