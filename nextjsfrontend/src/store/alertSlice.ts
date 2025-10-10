import { create } from 'zustand'
import { useSocketStore } from './socketSlice'

interface Alert {
  message: string
  type: 'info' | 'warning' | 'error'
  timestamp: number
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
