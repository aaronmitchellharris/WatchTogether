import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { LobbyComponent } from './lobby/lobby.component';
import { CreateLobbyComponent } from './create-lobby/create-lobby.component';
import { CookieService } from 'ngx-cookie-service';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  declarations: [
    AppComponent,
    LobbyComponent,
    CreateLobbyComponent,
    ChatBoxComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    YouTubePlayerModule,
    ClipboardModule
  ],
  providers: [
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
