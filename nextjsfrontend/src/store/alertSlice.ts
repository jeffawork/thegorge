import { create } from 'zustand'
import { useSocketStore } from './socketSlice'

interface Alert {
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

interface AlertSlice {
  alerts: Alert[]
  setupAlertListener: () => void
  clearAlerts: () => void
}

export const useAlertStore = create<AlertSlice>((set) => ({
  alerts: [],
  
  setupAlertListener: () => {
    const socket = useSocketStore.getState().socket
    if (!socket) return

    socket.on('alert', (alert) => {
      set((state) => ({ alerts: [...state.alerts, { ...alert, timestamp: Date.now() }] }))
    })
  },

  clearAlerts: () => set({ alerts: [] }),
}))
