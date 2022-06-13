import { Component, OnInit, Input, AfterViewChecked } from '@angular/core';
import { Message } from '../message';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent implements OnInit, AfterViewChecked {

  @Input() messages: Message[];
  @Input() lastMessageIndex: number;

  constructor() {
    this.messages = [];
    this.lastMessageIndex = 0;
  }

  ngAfterViewChecked(): void {
    this.updateIndex();
    document.getElementById('message_'+this.lastMessageIndex.toString())?.scrollIntoView(true);
  }

  ngOnInit(): void {
  }

  updateIndex(): void {
    try {
      this.lastMessageIndex = Number((<HTMLInputElement>document.getElementById('last_message')).value);
    } catch (err) {}
  }

}
