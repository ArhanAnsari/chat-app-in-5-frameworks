<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStreamStore } from './stores/streamStore'
import type { Attachment, Message } from 'stream-chat'

const store = useStreamStore()
const { channels, activeChannel } = storeToRefs(store)
store.setupUser()

function imageUrlForMessage(message: Message): Attachment[] {
  const images = message.attachments?.filter(
    (attachment: Attachment) => attachment.type === 'image'
  )
  if (images?.length && images?.length > 0) {
    // console.log(images.map((image) => JSON.stringify(image)))
  }
  return images ?? []
}

function isOwnMessage(message: Message): boolean {
  return message.user?.id === store.userId
}
</script>

<template>
  <main>
    <section class="channelList">
      <button
        class="channelPreview"
        :class="{ activeChannelPreview: activeChannel === channel }"
        v-for="channel in channels"
        :key="channel.cid"
        @click="store.setActiveChannel(channel)"
      >
        <img :src="channel.data?.image" alt="Channel Image" />
        <div>
          <h2>{{ channel.data?.name || channel.cid }}</h2>
          <p>{{ channel.state.messages[channel.state.messages.length - 1].text }}</p>
        </div>
      </button>
    </section>
    <section class="channelSection" v-if="activeChannel">
      <div class="channelHeader">
        <img
          v-if="activeChannel.data?.image"
          :src="activeChannel.data?.image"
          alt="Channel Image"
        />
        <div>
          <h2>
            {{ activeChannel.data?.name || activeChannel.cid }}
          </h2>
          <p>
            {{ activeChannel.data?.member_count }} members,
            {{ activeChannel.state.watcher_count }} online
          </p>
        </div>
      </div>

      <div class="messageList">
        <div
          class="messageContainer"
          v-for="message in activeChannel.state.messages"
          :key="message.cid"
          :class="{ ownMessageContainer: isOwnMessage(message as Message) }"
        >
          <div class="message" :class="{ ownMessage: isOwnMessage(message as Message) }">
            <div
              v-if="message.attachments?.length && message.attachments?.length > 0"
              class="messageImageContainer"
              :class="{ multipleImages: message.attachments?.length > 1 }"
            >
              <img
                v-for="image in imageUrlForMessage(message as Message)"
                :key="image.thumb_url"
                :src="image.thumb_url"
                alt=""
              />
            </div>

            <p>{{ message.text }}</p>
          </div>
          <div class="messageSignature">
            <span v-if="!isOwnMessage(message as Message)">{{ message.user?.name }}</span>
            <span>{{ message.updated_at.toLocaleDateString('en') }}</span>
          </div>
        </div>
      </div>
    </section>
    <div v-else>No Channel is selected</div>
  </main>
</template>

<style scoped>
main {
  display: grid;
  width: 100dvw;
  height: 100dvh;
  grid-template-columns: 240px 1fr;
  border: 1px solid #ccc;
}

h3 {
  border-bottom: 1px solid #ccc;
  font-weight: bold;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

h3 > p {
  font-size: 0.8rem;
  color: #666;
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

.channelPreview > div {
  white-space: nowrap;
  overflow-x: clip;
  text-overflow: ellipsis;
  overflow-y: hidden;
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

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
