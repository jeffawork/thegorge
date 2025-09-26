import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import io, { Socket } from 'socket.io-client'

export interface Alert {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  severity: 'low' | 'medium' | 'high' | 'critical'
  rpcId?: string
  resolved: boolean
  createdAt: Date
  resolvedAt?: Date
}

interface AlertContextType {
  alerts: Alert[]
  loading: boolean
  error: string | null
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt'>) => Promise<void>
  resolveAlert: (id: string) => Promise<void>
  clearAlerts: () => Promise<void>
  getActiveAlerts: () => Alert[]
  getAlertsByRPC: (rpcId: string) => Alert[]
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export const useAlert = () => {
  const context = useContext(AlertContext)
  if (context === undefined) {
    throw new Error('useAlert must be used within a AlertProvider')
  }
  return context
}

interface AlertProviderProps {
  children: ReactNode
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    loadAlerts()
    
    // Initialize socket connection
    const newSocket = io('http://localhost:3000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
    
    setSocket(newSocket)
    
    return () => {
      newSocket.close()
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on('newAlert', (alert: Alert) => {
      setAlerts(prev => [alert, ...prev])
    })

    socket.on('alertResolved', (alert: Alert) => {
      setAlerts(prev => prev.map(a => a.id === alert.id ? alert : a))
    })

    return () => {
      socket.off('newAlert')
      socket.off('alertResolved')
    }
  }, [socket])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/users/default/alerts?resolved=false')
      if (!response.ok) {
        throw new Error('Failed to load alerts')
      }
      
      const data = await response.json()
      setAlerts(data.data?.alerts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  const addAlert = async (alertData: Omit<Alert, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/users/default/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add alert')
      }

      const result = await response.json()
      setAlerts(prev => [result.data, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add alert')
      throw err
    }
  }

  const resolveAlert = async (id: string) => {
    try {
      const response = await fetch(`/api/users/default/alerts/${id}/resolve`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to resolve alert')
      }

      const result = await response.json()
      setAlerts(prev => prev.map(alert => 
        alert.id === id ? result.data : alert
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve alert')
      throw err
    }
  }

  const clearAlerts = async () => {
    try {
      const response = await fetch('/api/users/default/alerts', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to clear alerts')
      }

      setAlerts([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear alerts')
      throw err
    }
  }

  const getActiveAlerts = () => {
    return alerts.filter(alert => !alert.resolved)
  }

  const getAlertsByRPC = (rpcId: string) => {
    return alerts.filter(alert => alert.rpcId === rpcId && !alert.resolved)
  }

  const value: AlertContextType = {
    alerts,
    loading,
    error,
    addAlert,
    resolveAlert,
    clearAlerts,
    getActiveAlerts,
    getAlertsByRPC,
  }

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  )
}
