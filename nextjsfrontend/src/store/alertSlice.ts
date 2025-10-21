import { create } from 'zustand'
import { useSocketStore } from './socketSlice'


interface AlertSlice {
  alerts: Alert[]
  setAlerts: (alerts: Alert[]) => void
  addAlertsToState: (alerts: Alert[]) => void
  updateAlertInState: (alert: Alert) => void
  deleteAlertFromState: (id: string) => void
  setupAlertListener: () => void
  clearAlerts: () => void
}

export const useAlertStore = create<AlertSlice>((set) => ({
  alerts: [],
  // Replace entire alerts list (e.g., after fetch)
  setAlerts: (alerts) => set({ alerts }),
  
  // Add multiple alerts
  addAlertsToState: (newAlerts) =>
    set((state) => ({ alerts: [...state.alerts, ...newAlerts] })),

  updateAlertInState: (updatedAlert) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === updatedAlert.id ? updatedAlert : alert
      ),
    })),

  deleteAlertFromState: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    })),

  setupAlertListener: () => {
    const socket = useSocketStore.getState().socket
    if (!socket) return

    socket.on('alert', (alert) => {
      set((state) => ({ alerts: [...state.alerts, { ...alert, timestamp: Date.now() }] }))
    })
  },

  clearAlerts: () => set({ alerts: [] }),

}))
