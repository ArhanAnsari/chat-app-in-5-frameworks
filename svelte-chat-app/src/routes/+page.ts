import { Channel, StreamChat, type DefaultGenerics } from 'stream-chat';

export const ssr = false;

export type LoadData = { userId: string; channels: { [key: string]: Channel }; client: StreamChat };

/** @type {import('./$types').PageLoad} */
export async function load({ params }): Promise<LoadData> {
	console.log("I'm being processed with params: ", params);
	const apiKey = import.meta.env.VITE_APP_API_KEY;
	const token = import.meta.env.VITE_APP_TOKEN;

	if (apiKey === undefined) {
		throw new Error('API key is not defined');
	}
	if (token === undefined) {
		throw new Error('Token is not defined');
	}
	const client = StreamChat.getInstance(apiKey);
	const userId = 'falling-wildflower-6';

	async function connectUser() {
		const userName = 'Falling Wildflower';
		const user = {
			id: userId,
			name: userName,
			image: `https://getstream.io/random_png/?name=${userName}`
		};

		await client.connectUser(user, token);
		console.log('User connected successfully!');
	}

	await connectUser();

	return { userId: userId, channels: await loadChannels(userId, client), client: client };
}

async function loadChannels(userId: string, client: StreamChat) {
	const filters = {
		type: 'messaging',
		members: { $in: [userId] }
	};
	const options = {
		limit: 10,
		watch: true
	};
	const queriedChannels: Channel<DefaultGenerics>[] = await client.queryChannels(
		filters,
		{ last_message_at: -1 },
		options
	);
	const channelKeys: { [key: string]: Channel } = {};
	for (const channel of queriedChannels) {
		channelKeys[channel.cid] = channel;
	}
	// client.on('message.new', (event) => {
	// 	const channelId = event.cid;
	// 	if (channelId) {
	// 		const channel = channelKeys[channelId];
	// 		const channelMessages = channel.state.messages;
	// 		if (channel && event.message) {
	// 			channelKeys[channelId].state.messages = channelMessages;
	// 		}
	// 	}
	// });
	return channelKeys;
}
