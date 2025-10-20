// useRPCStore.ts
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
  setRpcs: (rpcs: RPC[]) => void
  addRpcToState: (rpc: RPC) => void
  updateRpcInState: (rpc: RPC) => void
  deleteRpcFromState: (id: string) => void
  setupSocketListeners: () => void
}

export const useRPCStore = create<RPCSlice>((set, get) => ({
  rpcs: [],
  loading: false,
  error: null,

  // Replace entire RPC list (e.g., after fetch)
  setRpcs: (rpcs) => set({ rpcs }),

  // Add one RPC
  addRpcToState: (rpc) =>
    set((state) => ({ rpcs: [...state.rpcs, rpc] })),

  // Update one RPC
  updateRpcInState: (updated) =>
    set((state) => ({
      rpcs: state.rpcs.map((r) => (r.id === updated.id ? updated : r)),
    })),

  // Delete one RPC
  deleteRpcFromState: (id) =>
    set((state) => ({
      rpcs: state.rpcs.filter((r) => r.id !== id),
    })),

  // Socket real-time sync
  setupSocketListeners: () => {
    const socket = useSocketStore.getState().socket
    if (!socket) return

    socket.on('rpcAdded', (rpc) => {
      get().addRpcToState(rpc)
    })

    socket.on('rpcUpdated', (rpc) => {
      get().updateRpcInState(rpc)
    })

    socket.on('rpcDeleted', (rpcId) => {
      get().deleteRpcFromState(rpcId)
    })
  },
}))
