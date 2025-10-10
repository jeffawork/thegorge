import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

interface SocketSlice {
  socket: Socket | null
  connect: () => void
  disconnect: () => void
}

export const useSocketStore = create<SocketSlice>((set) => ({
  socket: null,

  connect: () => {
    const newSocket = io('http://localhost:3000', { reconnection: true })
    set({ socket: newSocket })
  },

  disconnect: () => {
    set((state) => {
      state.socket?.close()
      return { socket: null }
    })
  },
}))
