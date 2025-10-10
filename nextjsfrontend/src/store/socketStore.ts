// socketStore.ts
import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'


interface SocketState {
  socket: Socket | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void
}

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  isConnected: false,

  connect: () => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log(' Connected')
      set({ isConnected: true })
    })

    socket.on('disconnect', () => {
      console.log(' Disconnected')
      set({ isConnected: false })
    })

    set({ socket })
  },

  disconnect: () => {
    set((state) => {
      state.socket?.disconnect()
      return { socket: null, isConnected: false }
    })
  },
}))
