'use client';

import { useCallback } from 'react';
import {
  Channel,
  ChannelHeader,
  ChannelList,
  Chat,
  DefaultStreamChatGenerics,
  MessageInput,
  MessageList,
  Thread,
  Window,
  useCreateChatClient,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { ChannelSort } from 'stream-chat';

export default function App({
  apiKey,
  createToken,
  userId,
  userName,
}: {
  apiKey: string;
  createToken: (userId: string) => Promise<string>;
  userId: string;
  userName: string;
}) {
  const tokenProvider = useCallback(async () => {
    return await createToken(userId);
  }, [createToken, userId]);

  const client = useCreateChatClient({
    apiKey,
    tokenOrProvider: tokenProvider,
    userData: {
      id: userId,
      name: userName,
      image: `https://getstream.io/random_png/?name=${userName}`,
    },
  });

  const sort: ChannelSort<DefaultStreamChatGenerics> = { last_message_at: -1 };
  const filters = {
    type: 'messaging',
    members: { $in: [userId] },
  };
  const options = {
    limit: 10,
  };

  if (!client) return <div>Setting up client & connection</div>;
  return (
    <Chat client={client}>
      <ChannelList filters={filters} sort={sort} options={options} />
      <Channel>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
}
