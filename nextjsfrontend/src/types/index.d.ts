
declare global {
  // Authentication types

  type AuthFormTypes =
  | 'sign-in'
  | 'sign-up'
  | 'forgot-password'


  // Registeration Types

  export interface CourseFormData {
  basicInfo: Partial<BasicInfo>;
  advancedInfo: Partial<AdvancedInfo>;
  curriculum: Partial<Curriculum>;
  publishInfo: Partial<PublishInfo>;
}

// Authentication Store tyoes
 interface User {
  id:string
  email: string
  name: string
  role?: string
  avatar?: string
}
  interface AuthState {
  user: User | null;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  logout: () => void;
}

// AuthApi types

interface loginCredentials {
 email: string;
 password: string;
}

// Dashboard
interface ActivePanelProps {
  activeTab: string
  onTabChange: (tab: string) => void
}


}


export {};