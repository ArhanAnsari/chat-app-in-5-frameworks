import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Channel, StreamChat, type DefaultGenerics } from 'stream-chat'

export const useStreamStore = defineStore('stream', () => {
  const channelKeys = ref<{ [key: string]: Channel }>({})
  const activeChannel = ref<Channel | undefined>(undefined)

  const apiKey = import.meta.env.VITE_APP_API_KEY
  const token = import.meta.env.VITE_APP_TOKEN

  if (apiKey === undefined) {
    throw new Error('API key is not defined')
  }
  if (token === undefined) {
    throw new Error('Token is not defined')
  }

  const client = StreamChat.getInstance(apiKey)
  const userId = 'falling-wildflower-6'

  async function setupUser() {
    await connectUser()
    await loadChannels()
  }
  async function connectUser() {
    const userName = 'Falling Wildflower'
    const user = {
      id: userId,
      name: userName,
      image: `https://getstream.io/random_png/?name=${userName}`
    }

    await client.connectUser(user, token)
  }

  async function loadChannels() {
    console.log('Stream store setup done.')

    const filters = {
      type: 'messaging',
      members: { $in: [userId] }
    }
    const options = {
      limit: 10,
      watch: true
    }
    const queriedChannels: Channel<DefaultGenerics>[] = await client.queryChannels(
      filters,
      { last_message_at: -1 },
      options
    )
    if (queriedChannels.values.length > 0) {
      activeChannel.value = queriedChannels[0]
    }
    for (const channel of queriedChannels) {
      channelKeys.value[channel.cid] = channel
    }
    client.on('message.new', (event) => {
      const channelId = event.cid
      if (channelId) {
        const channel = channelKeys.value[channelId]
        const channelMessages = channel.state.messages
        if (channel && event.message) {
          channelKeys.value[channelId].state.messages = channelMessages
        }
      }
    })
  }

  async function setActiveChannel(channel: Channel | undefined) {
    activeChannel.value = channel
  }
  return { channelKeys, userId, setupUser, activeChannel, setActiveChannel }
})
