import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebsocketService } from '../websocket.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  lobbyId?: String;
  @Input() message?: any;

  constructor(
    private route: ActivatedRoute,
    private WebsocketService: WebsocketService
  ) {
    this.lobbyId = String(this.route.snapshot.paramMap.get('id'));
    this.WebsocketService.connect();
    this.WebsocketService.sendMessage("join", this.lobbyId, null);
  }
  
  ngOnInit(): void {
  }

  send(): void {
    if (this.message && this.lobbyId) {
      this.WebsocketService.sendMessage("message", this.lobbyId, this.message);
    }
  }

}
