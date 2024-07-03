import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Channel, StreamChat } from 'stream-chat'

export const useStreamStore = defineStore('stream', () => {
  const channels = ref<any[]>([])
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
      limit: 10
    }
    channels.value = await client.queryChannels(filters, { last_message_at: -1 }, options)
    if (channels.value.length > 0) {
      activeChannel.value = channels.value[0]
    }
  }

  async function setActiveChannel(channel: Channel | undefined) {
    activeChannel.value = channel
  }
  return { channels, userId, setupUser, activeChannel, setActiveChannel }
})
