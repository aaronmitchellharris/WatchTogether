import { Component, OnInit, Input, OnDestroy, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketService } from '../websocket.service';
import { Message } from '../message';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy, AfterContentInit {

  lobbyId: string;
  lobbyLink: string;
  user?: string;
  @Input() nickname: string;
  @Input() message: any;
  @Input() videoLink?: string;
  videoId?: string;
  @Input() height?: number;
  @Input() width?: number;
  messageLog: Message[];
  subscription?: Subscription;
  size?: HTMLElement;
  sizeListener: Observable<Event>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private WebsocketService: WebsocketService,
    private cookieService: CookieService
  ) {
    this.lobbyId = String(this.route.snapshot.paramMap.get('id'));
    this.lobbyLink = window.location.origin + this.router.url;
    this.messageLog = [];
    this.nickname = cookieService.check('nickname') ? cookieService.get('nickname') : '';
    this.sizeListener = fromEvent(window, 'resize');
  }

  ngAfterContentInit(): void {
    this.size = document.getElementById('video') as HTMLElement;
    this.height = this.size!.offsetHeight;
    this.width = this.size!.offsetWidth;
    this.sizeListener.subscribe({
      next: () => {
        this.height = this.size!.offsetHeight;
        this.width = this.size!.offsetWidth;
      }
    })
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
      this.videoId = data.content.videoId;
      this.messageLog = data.content.messageLog;
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
        this.WebsocketService.sendMessage("video", this.lobbyId, param[1], this.user, this.nickname);
        return;
      }
    })
    this.videoLink = '';
  }

}
