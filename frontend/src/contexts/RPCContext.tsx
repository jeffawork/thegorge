import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useConnection } from './ConnectionContext'

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

interface RPCContextType {
  rpcs: RPC[]
  loading: boolean
  error: string | null
  addRPC: (rpcData: Omit<RPC, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateRPC: (id: string, updates: Partial<RPC>) => Promise<void>
  deleteRPC: (id: string) => Promise<void>
  testRPC: (id: string) => Promise<void>
  refreshRPCs: () => Promise<void>
}

const RPCContext = createContext<RPCContextType | undefined>(undefined)

export const useRPC = () => {
  const context = useContext(RPCContext)
  if (context === undefined) {
    throw new Error('useRPC must be used within a RPCProvider')
  }
  return context
}

interface RPCProviderProps {
  children: ReactNode
}

export const RPCProvider: React.FC<RPCProviderProps> = ({ children }) => {
  const [rpcs, setRpcs] = useState<RPC[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { socket } = useConnection()

  useEffect(() => {
    loadRPCs()
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on('rpcStatusUpdate', (rpcId: string, status: RPC['status']) => {
      setRpcs(prev => prev.map(rpc => 
        rpc.id === rpcId ? { ...rpc, status } : rpc
      ))
    })

    socket.on('rpcAdded', (rpc: RPC) => {
      setRpcs(prev => [...prev, rpc])
    })

    socket.on('rpcUpdated', (rpc: RPC) => {
      setRpcs(prev => prev.map(r => r.id === rpc.id ? rpc : r))
    })

    socket.on('rpcDeleted', (rpcId: string) => {
      setRpcs(prev => prev.filter(r => r.id !== rpcId))
    })

    return () => {
      socket.off('rpcStatusUpdate')
      socket.off('rpcAdded')
      socket.off('rpcUpdated')
      socket.off('rpcDeleted')
    }
  }, [socket])

  const loadRPCs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/users/default/rpcs')
      if (!response.ok) {
        throw new Error('Failed to load RPCs')
      }
      
      const data = await response.json()
      setRpcs(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load RPCs')
    } finally {
      setLoading(false)
    }
  }

  const addRPC = async (rpcData: Omit<RPC, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/users/default/rpcs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rpcData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add RPC')
      }

      const result = await response.json()
      setRpcs(prev => [...prev, result.data])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add RPC')
      throw err
    }
  }

  const updateRPC = async (id: string, updates: Partial<RPC>) => {
    try {
      const response = await fetch(`/api/users/default/rpcs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update RPC')
      }

      const result = await response.json()
      setRpcs(prev => prev.map(rpc => 
        rpc.id === id ? { ...rpc, ...result.data } : rpc
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update RPC')
      throw err
    }
  }

  const deleteRPC = async (id: string) => {
    try {
      const response = await fetch(`/api/users/default/rpcs/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete RPC')
      }

      setRpcs(prev => prev.filter(rpc => rpc.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete RPC')
      throw err
    }
  }

  const testRPC = async (id: string) => {
    try {
      setRpcs(prev => prev.map(rpc => 
        rpc.id === id ? { ...rpc, status: 'testing' } : rpc
      ))

      const response = await fetch(`/api/users/default/rpcs/${id}/health`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('RPC test failed')
      }

      const result = await response.json()
      setRpcs(prev => prev.map(rpc => 
        rpc.id === id ? { ...rpc, status: result.status, responseTime: result.responseTime } : rpc
      ))
    } catch (err) {
      setRpcs(prev => prev.map(rpc => 
        rpc.id === id ? { ...rpc, status: 'offline' } : rpc
      ))
      setError(err instanceof Error ? err.message : 'RPC test failed')
    }
  }

  const refreshRPCs = async () => {
    await loadRPCs()
  }

  const value: RPCContextType = {
    rpcs,
    loading,
    error,
    addRPC,
    updateRPC,
    deleteRPC,
    testRPC,
    refreshRPCs,
  }

  return (
    <RPCContext.Provider value={value}>
      {children}
    </RPCContext.Provider>
  )
}
