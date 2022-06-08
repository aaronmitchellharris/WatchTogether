import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebsocketService } from '../websocket.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  lobbyId?: Number;
  @Input() message?: any;

  constructor(
    private route: ActivatedRoute,
    private WebsocketService: WebsocketService
  ) {
    this.WebsocketService.connect();
  }
  
  ngOnInit(): void {
    this.lobbyId = Number(this.route.snapshot.paramMap.get('id'));
  }

  send(): void {
    if (this.message) {
      this.WebsocketService.sendMessage(this.message);
    }
  }

}
