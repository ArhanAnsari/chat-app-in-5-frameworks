import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  ChannelService,
  ChatClientService,
  StreamAutocompleteTextareaModule,
  StreamChatModule,
  StreamI18nService,
} from 'stream-chat-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TranslateModule,
    StreamAutocompleteTextareaModule,
    StreamChatModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  userId: string = 'falling-wildflower-6';

  constructor(
    private chatService: ChatClientService,
    private channelService: ChannelService,
    private streamI18nService: StreamI18nService
  ) {
    const apiKey = '87qf4vgmedfz';
    const userId = 'falling-wildflower-6';
    const userName = 'Falling Wildflower';
    const userToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmFsbGluZy13aWxkZmxvd2VyLTYifQ.VHEp0eEuZxvYJGCA9nw72Swd8C_A9mTfvZmXNaCn_lY';

    const user = {
      id: userId,
      name: userName,
      image: `https://getstream.io/random_png/?name=${userName}`,
    };

    this.chatService.init(apiKey, user, userToken);
    this.streamI18nService.setTranslation();
  }

  async ngOnInit() {
    this.channelService.init({
      type: 'messaging',
      members: { $in: [this.userId] },
    });
  }
}
