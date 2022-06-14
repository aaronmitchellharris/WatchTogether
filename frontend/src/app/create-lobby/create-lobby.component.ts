import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-lobby',
  templateUrl: './create-lobby.component.html',
  styleUrls: ['./create-lobby.component.css']
})
export class CreateLobbyComponent implements OnInit {

  newCode: string;
  @Input() inputCode: string;
  alert: boolean;
  characters: string;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.newCode = '';
    this.inputCode = '';
    this.alert = false;
    this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }

  ngOnInit(): void {
    // create lobby code
    for (let i = 0; i < 6; i++) {
      this.newCode += this.characters[Math.floor(Math.random() * this.characters.length)];
    }
  }

  // get list of existing lobbies
  getLobbies(): Observable<any> {
    return this.http.get<any>(`${environment.server_url}/lobbies`);
  }

  // join lobby if it exists
  onSubmit(code: string): void {
    this.getLobbies().subscribe(data => {
      if ( data.lobbies.includes(code) ) {
        this.router.navigate([`/room/${code}`]);
      } else {
        this.alert = true;
      }
    });
  }

}
