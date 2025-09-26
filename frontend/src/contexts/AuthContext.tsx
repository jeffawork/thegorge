import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  email: string
  name: string
  role?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('the-gorge-user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('the-gorge-user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const result = await response.json()
      const userWithDefaults = {
        ...result.data,
        role: result.data.role || 'admin',
        avatar: result.data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(result.data.name)}&background=3b82f6&color=ffffff`
      }

      setUser(userWithDefaults)
      localStorage.setItem('the-gorge-user', JSON.stringify(userWithDefaults))
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('the-gorge-user')
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (user) {
      try {
        const response = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        })

        if (!response.ok) {
          throw new Error('Profile update failed')
        }

        const result = await response.json()
        const updatedUser = { ...user, ...result.data }
        setUser(updatedUser)
        localStorage.setItem('the-gorge-user', JSON.stringify(updatedUser))
      } catch (error) {
        console.error('Profile update error:', error)
        // Fallback to local update
        const updatedUser = { ...user, ...updates }
        setUser(updatedUser)
        localStorage.setItem('the-gorge-user', JSON.stringify(updatedUser))
      }
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
