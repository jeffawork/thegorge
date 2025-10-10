import axios, {
} from 'axios';


const axiosInst = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});


// APIs related to authentication

export const  authApiService = {

  login: async (credentials: loginCredentials) => {
    const { data } = await axiosInst.post("/auth/login", credentials);
    return data;
  },

  register: async (userInfo: registerCredentials) => {
    const { data } = await axiosInst.post("/auth/register", userInfo);
    return data;
  },

  logout: async () => {
    const { data } = await axiosInst.post("/auth/logout");
    return data;
  },

  refreshToken: async () => {
    const { data } = await axiosInst.post("/auth/refresh");
    return data;
  },

  getProfile: async () => {
    const { data } = await axiosInst.get("/auth/profile");
    return data;
  },

  updateProfile: async (profileData: { firstName?: string; lastName?: string; email?: string }) => {
    const { data } = await axiosInst.put("/auth/profile", profileData);
    return data;
  },
  changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    const { data } = await axiosInst.put("/auth/change-password", passwordData);
    return data;
  },

  forgotPassword: async (email: { email: string }) => {
    const { data } = await axiosInst.post("/auth/forgot-password", email);
    return data;
  },
  resetPassword: async (resetData: { token: string; newPassword: string }) => {
    const { data } = await axiosInst.post("/auth/reset-password", resetData);
    return data;
  }
}