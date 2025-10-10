import { create } from 'zustand'
import { useSocketStore } from './socketSlice'

export interface RPC {
  id: string
  name: string
  url: string
  network: string
  chainId?: number
  timeout: number
  priority: number
  enabled: boolean
  status: 'online' | 'offline' | 'testing'
  responseTime?: number
  uptime?: number
  lastChecked?: Date
  createdAt: Date
  updatedAt: Date
}

interface RPCSlice {
  rpcs: RPC[]
  loading: boolean
  error: string | null
  fetchRPCs: () => Promise<void>
  addRPC: (rpc: Omit<RPC, 'id'>) => Promise<void>
  setupSocketListeners: () => void
}

export const useRPCStore = create<RPCSlice>((set, get) => ({
  rpcs: [],
  loading: false,
  error: null,

  fetchRPCs: async () => {
    set({ loading: true })
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/default/rpcs`)
      const data = await res.json()
      set({ rpcs: data.data, loading: false })
    } catch (err) {
      set({ error: 'Failed to fetch RPCs', loading: false })
    }
  },

  addRPC: async (rpc) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/default/rpcs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rpc),
    })
    const data = await res.json()
    set((state) => ({ rpcs: [...state.rpcs, data.data] }))
  },

  setupSocketListeners: () => {
    const socket = useSocketStore.getState().socket
    if (!socket) return

    socket.on('rpcAdded', (rpc) => {
      set((state) => ({ rpcs: [...state.rpcs, rpc] }))
    })

    socket.on('rpcUpdated', (rpc) => {
      set((state) => ({
        rpcs: state.rpcs.map((r) => (r.id === rpc.id ? rpc : r)),
      }))
    })

    socket.on('rpcDeleted', (rpcId) => {
      set((state) => ({
        rpcs: state.rpcs.filter((r) => r.id !== rpcId),
      }))
    })
  },
}))
