import { Component, OnInit, Input } from '@angular/core';
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
export class LobbyComponent implements OnInit {

  lobbyId: string;
  @Input() message: any;
  messageLog: Message[];
  user?: string;
  @Input() nickname: string;
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
    console.log(this.messageLog);
  }

  ngOnDestroy(): void {
    this.WebsocketService.close();
    this.subscription?.unsubscribe();
  }

  // send message to server
  send(): void {
    if (this.message && this.lobbyId) {
      this.WebsocketService.sendMessage("message", this.lobbyId, this.message, this.user, this.nickname);
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
    } else {
      this.messageLog.push(data);
    }
  }

  // update nickname
  onSubmit(): void {
    this.WebsocketService.sendMessage("nickname", this.lobbyId, null, this.user, this.nickname);
    this.cookieService.set('nickname', this.nickname);
  }

}
