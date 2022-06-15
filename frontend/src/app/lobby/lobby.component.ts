import { Component, OnInit, Input, OnDestroy, AfterContentInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketService } from '../websocket.service';
import { Message } from '../message';
import { Subscription, fromEvent } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { YouTubePlayer } from '@angular/youtube-player';

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
  @Input() time: number = 0;
  messageLog: Message[];
  joinInfo = {isLate: false, state: -1, time: 0};
  websocketSubscription?: Subscription;
  eventSubscription?: Subscription;
  size?: HTMLElement;
  playerVars = {
    controls: 1, 
    mute: 0, 
    autoplay: 0, 
    disablekb: 1, 
    enablejsapi: 1, 
    modestbranding: 1, 
    origin: window.location.origin, 
    rel: 0
  };
  @ViewChild('yt') yt!: YouTubePlayer;
  sendState: boolean = false;

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
  }

  // play/pause video at specific time
  videoControl(state: number, time: number): void {
    if (state == 1) {
      this.yt.seekTo(time, true);
      this.yt.playVideo();
    } else if (state == 2) {
      this.yt.seekTo(time, true);
      this.yt.pauseVideo();
    }
  }

  // update server with video player state changes
  onStateChange(state: any): void {
    if (this.sendState) {
      let time = 0;
      if (state.data == 1 || state.data == 2) {
        time = this.yt.getCurrentTime();
        this.WebsocketService.sendMessage("state", this.lobbyId, time, this.user, this.nickname, state.data);
      }
    }
  }

  // called when video player is ready
  onReady(e: any): void {
    if (this.joinInfo.isLate) {
      //this.videoControl(this.joinInfo.state, this.joinInfo.time);
      let state = this.joinInfo.state;
      let time = this.joinInfo.time;
      if (state == 1) {
        this.yt.seekTo(time, true);
        this.yt.playVideo();
      } else if (state == 2) {
        this.yt.playVideo();
        this.yt.seekTo(time, true);
        setTimeout(()=> this.yt.pauseVideo(), 1000);
      }
      setTimeout(() => {this.sendState = true;}, 3000);
    } else {
      this.sendState = true;
    }
    let time = 0;
    setInterval(() => {
      time = this.yt.getCurrentTime();
      this.WebsocketService.sendMessage("time", this.lobbyId, time, this.user, this.nickname);
    }, 1000);
  }

  ngAfterContentInit(): void {
    this.size = document.getElementById('video') as HTMLElement;
    this.height = this.size?.offsetHeight;
    this.width = this.size?.offsetWidth;
    this.eventSubscription = fromEvent(window, 'resize').subscribe({
      next: () => {
        this.height = this.size?.offsetHeight;
        this.width = this.size?.offsetWidth;
      }
    });
  }

  ngOnInit(): void {
    this.WebsocketService.connect();
    this.WebsocketService.sendMessage("join", this.lobbyId, null, this.user, this.nickname);
    this.websocketSubscription = this.WebsocketService.getUpdateSubject().subscribe({
      next: (msg) => {this.addMessage(msg)},
      error: (error) => console.log('websocket subscription error: ', error)
    });
  }

  ngOnDestroy(): void {
    this.WebsocketService.close();
    this.websocketSubscription?.unsubscribe();
    this.eventSubscription?.unsubscribe();
  }

  // send chat message to server
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
      this.videoId = data.videoId;
      if (data.state != -1) {
        this.joinInfo.isLate = true;
        this.joinInfo.state = data.state;
        this.joinInfo.time = data.time;
      }
    } else if (data.meta === 'log' || data.meta == 'system') {
      this.messageLog = data.content;
    } else if (data.meta === 'video') {
      this.videoId = data.videoId;
      this.messageLog = data.content;
    } else if (data.meta === 'control') {
      this.videoControl(data.state, data.content);
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
