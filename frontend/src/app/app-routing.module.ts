import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateLobbyComponent } from './create-lobby/create-lobby.component';
import { LobbyComponent } from './lobby/lobby.component';

const routes: Routes = [
  {path: '', component: CreateLobbyComponent},
  {path: 'room/:id', component: LobbyComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
