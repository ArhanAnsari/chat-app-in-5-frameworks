import {
  Chat,
  Channel,
  ChannelList,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  useCreateChatClient,
} from 'stream-chat-react';
import './App.css';

const apiKey = '87qf4vgmedfz';
const userId = 'falling-wildflower-6';
const userName = 'Falling Wildflower';
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmFsbGluZy13aWxkZmxvd2VyLTYifQ.VHEp0eEuZxvYJGCA9nw72Swd8C_A9mTfvZmXNaCn_lY';

const user = {
  id: userId,
  name: userName,
  image: `https://getstream.io/random_png/?name=${userName}`,
};

const sort = { last_message_at: -1 };
const filters = {
  type: 'messaging',
  members: { $in: [userId] },
};
const options = {
  limit: 10,
};

function App() {
  const client = useCreateChatClient({
    apiKey,
    tokenOrProvider: token,
    userData: user,
  });

  if (!client) return <div>Loading...</div>;

  return (
    <Chat client={client}>
      <ChannelList sort={sort} filters={filters} options={options} />
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

export default App;
