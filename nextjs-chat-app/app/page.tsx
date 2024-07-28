import App from '@/components/App';
import { StreamChat } from 'stream-chat';

export default function Home() {
  async function createToken(userId: string): Promise<string> {
    'use server';

    const apiKey = process.env.API_KEY;
    const secret = process.env.STREAM_SECRET;

    if (!apiKey) throw new Error('API key not found');
    if (!secret) throw new Error('Secret not found');

    const serverClient = new StreamChat(apiKey, secret);
    return serverClient.createToken(userId);
  }

  const apiKey = process.env.API_KEY;

  const userId = '4r4bGPFtRlTBJKDm1Jieb';
  const userName = 'Efrain';

  if (!apiKey) {
    return <div>Error: API key not found.</div>;
  }

  return (
    <App
      apiKey={apiKey}
      createToken={createToken}
      userId={userId}
      userName={userName}
    />
  );
}
