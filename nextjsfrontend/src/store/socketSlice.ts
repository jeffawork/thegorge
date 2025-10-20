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
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL, { reconnection: true })
    set({ socket: newSocket })
  },

  disconnect: () => {
    set((state) => {
      state.socket?.close()
      return { socket: null }
    })
  },
}))
