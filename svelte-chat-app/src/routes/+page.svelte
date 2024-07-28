<script lang="ts">
	import {
		Channel,
		type Attachment,
		type DefaultGenerics,
		type FormatMessageResponse
	} from 'stream-chat';
	import type { LoadData } from './+page';
	import { onMount } from 'svelte';
	/** @type {import('./$types').PageData} */
	export let data: LoadData;

	let activeChannel: Channel;
	let message: string = '';
	console.log('Data is: ', data);
	if (Object.keys(data.channels).length > 0) {
		console.log('Setting active channel');
		activeChannel = Object.values(data.channels)[0];
	}

	function isOwnMessage(message: FormatMessageResponse<DefaultGenerics>): boolean {
		return message.user?.id === data.userId;
	}

	function imageUrlForMessage(message: FormatMessageResponse<DefaultGenerics>): Attachment[] {
		return (
			message.attachments?.filter((attachment: Attachment) => attachment.type === 'image') ?? []
		);
	}

	function formatDate(date: Date | string): string {
		if (typeof date === 'string') {
			date = new Date(date);
		}
		return date.toLocaleDateString('en');
	}

	function sendMessage() {
		if (message.length > 0) {
			activeChannel?.sendMessage({ text: message });
			message = '';
		}
	}

	onMount(() => {
		data.client.on('message.new', (event) => {
			const channelId = event.cid;
			if (channelId) {
				const channel = data.channels[channelId];
				const channelMessages = channel.state.messages;
				if (channel && event.message) {
					data.channels[channelId].state.messages = channelMessages;

					if (activeChannel.cid === channel.cid) {
						activeChannel = data.channels[channelId];
					}
				}
			}
		});
	});
</script>

<main>
	{#await data.channels}
		<p>Loading channels...</p>
	{:then channels}
		<section class="channelList">
			{#each Object.values(channels) as channel}
				<button
					class="channelPreview"
					class:activeChannelPreview={activeChannel === channel}
					on:click={() => (activeChannel = channel)}
				>
					<img
						src={String(channel.data?.image) ||
							`https://getstream.io/random_png/?name=${channel.data?.name || channel.cid}`}
						alt={channel.data?.name}
					/>
					<div>
						<h2>
							{channel.data?.name || channel.cid}
							{#if channel.countUnread() > 0}
								<span class="unreadBadge">{channel.countUnread()}</span>
							{/if}
						</h2>
						<p>{channel.state.messages[channel.state.messages.length - 1].text}</p>
					</div>
				</button>
			{/each}
		</section>
		<section class="channelSection">
			{#if activeChannel}
				<div class="channelHeader">
					{#if activeChannel.data?.image}
						<img src={String(activeChannel.data?.image)} alt={activeChannel.data?.name} />
					{/if}
					<div>
						<h2>{activeChannel.data?.name || activeChannel.cid}</h2>
						<p>
							{activeChannel.data?.member_count} members,
							{activeChannel.state.watcher_count} online
						</p>
					</div>
				</div>
				<div class="messageList">
					{#each activeChannel.state.messages as message}
						<div class="messageContainer" class:ownMessageContainer={isOwnMessage(message)}>
							<div class="message" class:ownMessage={isOwnMessage(message)}>
								{#if message.attachments?.length && message.attachments?.length > 0}
									<div
										class="messageImageContainer"
										class:multipleImages={message.attachments?.length > 1}
									>
										{#each imageUrlForMessage(message) as image}
											<img src={image.thumb_url} alt={message.text} />
										{/each}
									</div>
								{/if}
								<p>{message.text}</p>
							</div>
							<div class="messageSignature">
								{#if !isOwnMessage(message)}
									<span>{message.user?.name}</span>
								{/if}
								<span>{formatDate(message.updated_at)}</span>
							</div>
						</div>
					{/each}
				</div>
				<div class="messageComposer">
					<input bind:value={message} type="text" placeholder="Type your message" />
					<button class:activeIcon={message.length > 0} on:click={() => sendMessage()}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
							/>
						</svg>
					</button>
				</div>
			{:else}
				<p>No active channel</p>
			{/if}
		</section>
	{/await}
</main>

<style>
	:global(body) {
		margin: 0;
	}
	main {
		display: grid;
		width: 100dvw;
		height: 100dvh;
		grid-template-columns: 240px 1fr;
		border: 1px solid #ccc;
	}

	.channelList {
		border-right: 1px solid #ccc;
	}

	.channelSection {
		display: flex;
		flex-direction: column;
		max-height: 100dvh;
	}

	.channelPreview {
		display: flex;
		width: 100%;
		text-align: start;
		background: white;
		padding: 0.75rem 1rem;
		border: 0px solid #ccc;
		cursor: pointer;
	}

	.channelPreview h2 {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}

	.unreadBadge {
		background: red;
		border-radius: 50%;
		padding: 0.25rem;
		width: 1.25rem;
		height: 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: small;
	}

	.channelPreview > div {
		white-space: nowrap;
		overflow-x: clip;
		text-overflow: ellipsis;
		overflow-y: hidden;
		flex: 1;
	}

	.channelPreview img,
	.channelHeader img {
		width: 2.5rem;
		aspect-ratio: 1;
		border-radius: 50%;
		margin-right: 0.75rem;
	}

	h2 {
		font-size: 1rem;
		margin: 0;
	}

	.channelPreview p {
		font-size: 0.8rem;
		color: #666;
		margin: 0;
		white-space: nowrap;
		overflow-y: visible;
		overflow-x: clip;
		text-overflow: ellipsis;
		box-sizing: border-box;
	}

	.activeChannelPreview {
		background: lightgray;
	}

	.channelPreview:hover {
		background: #f9f9f9;
	}

	.channelHeader {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
		padding: 1rem;
	}

	.channelHeader p {
		font-size: 0.875rem;
		color: #aaa;
	}

	.messageList {
		flex: 1;
		overflow-y: scroll;
		padding: 1rem;
	}

	.messageContainer {
		display: flex;
		flex-direction: column;
		margin: 0.5rem 0;
		overflow-y: scroll;
		max-height: 100%;
	}

	.ownMessageContainer {
		align-items: end;
	}

	.message {
		max-width: 400px;
		background: rgb(231, 231, 231);
		overflow: hidden;
		border-radius: 1rem 1rem 1rem 0;
	}

	.message p {
		padding: 0.25rem 0.75rem;
	}

	.ownMessage {
		border-radius: 1rem 1rem 0 1rem;
		background: #e0f0ff;
	}

	.messageImageContainer {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.15rem;
		padding: 2px;
		overflow: hidden;
		height: 300px;
	}

	.multipleImages {
		grid-template-columns: 50% 50%;
	}

	.message img {
		width: 100%;
		height: 100%;
		border-radius: 1rem;
		object-fit: cover;
		cursor: zoom-in;
	}

	.messageSignature {
		display: flex;
		gap: 0.5rem;
		font-size: small;
		color: #777;
	}

	.messageComposer {
		display: flex;
		gap: 0.5rem;
		padding: 1rem;
	}

	.messageComposer input[type='text'] {
		flex: 1;
		padding: 0.5rem 0.75rem;
		border-radius: 1rem;
		border: 1px solid #ccc;
	}

	.messageComposer button {
		background: none;
		border: none;
		cursor: pointer;
	}

	.messageComposer svg {
		--icon-color: gray;
		color: var(--icon-color);
		width: 1.5rem;
		aspect-ratio: 1;
	}

	.activeIcon svg {
		--icon-color: #005fff;
	}
</style>
