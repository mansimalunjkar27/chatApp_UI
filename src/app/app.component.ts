import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebsocketService } from './services/websocket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmojiButton } from '@joeattardi/emoji-button';  // Correct import for the class

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'frontend';
  username: string = '';  // Stores the username entered by the user
  message: string = '';  // Stores the message being typed by the user
  messages: any[] = [];  // Stores all the chat messages
  isConnected = false;  // Tracks whether the user is connected to the WebSocket
  connectingMessage = 'Connecting...';  // Message to show while connecting
  showEmojiPicker = false;  // Flag to toggle the emoji picker visibility

  private picker: EmojiButton;  // Declare picker to store EmojiButton instance

  @ViewChild('emojiButton', { static: false }) emojiButton!: ElementRef;  // Access the emoji button in the template

  constructor(private websocketService: WebsocketService, private el: ElementRef) {
    this.picker = new EmojiButton({
      position: 'top',
      autoFocusSearch: true,
      theme: 'auto'  
    });
  }

  ngOnInit(): void {
    // Initialize emoji picker event listener
    // this.picker.on('emoji', (emoji: any) => {
    //   if (emoji && emoji.native) {
    //     this.message += emoji.native;  // Append emoji to message (use native property)
    //     this.showEmojiPicker = false;  // Hide the emoji picker after selection
    //   } else {
    //     console.error('Selected emoji is invalid:', emoji);
    //   }

      this.picker.on('emoji', (selection: any) => {
        this.message += selection.emoji;
      });
    

    // WebSocket service to handle messages
    this.websocketService.messages$.subscribe(message => {
      if (message) {
        this.messages.push(message);
      }
    });

    // Connection status update
    this.websocketService.connectionStatus$.subscribe(connected => {
      this.isConnected = connected;
      if (connected) {
        this.connectingMessage = '';
      }
    });
  }
  addEmoji(event: any) {
    const emoji = event.emoji?.native || event.native; // handle different formats
    this.message += emoji;
  }
  

  connect() {
    this.websocketService.connect(this.username);
  }

  sendMessage() {
    if (this.message.trim()) {
      this.websocketService.sendMessage(this.username, this.message);
      this.message = '';  // Clear the message input field after sending the message
    }
  }
  toggleEmojiPicker() {
    if (this.picker) {
      this.picker.togglePicker(this.emojiButton.nativeElement);
    }
  }

  getAvatarColor(sender: string): string {
    const colors = ['#2196F3', '#32c787', '#00BCD4', '#ff5652', '#ffc107', '#ff85af', '#FF9800', '#39bbb0'];
    let hash = 0;
    for (let i = 0; i < sender.length; i++) {
      hash = 31 * hash + sender.charCodeAt(i);
    }
    return colors[Math.abs(hash % colors.length)];
  }
}
