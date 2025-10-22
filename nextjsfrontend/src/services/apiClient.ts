import axios from "axios";

const axiosInst = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// No need for a request interceptor — cookies handle auth
axiosInst.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        // ✅ Use POST to trigger refresh through the API gateway
        await axios.post("/api/auth/refresh", {}, { withCredentials: true });

        // After refresh, cookies are updated automatically
        return axiosInst(original);
      } catch (refreshErr) {
        console.warn("Refresh failed:", refreshErr);
        // maybe redirect to login or clear user session
      }
    }

    throw err;
  }
);


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



// APIs related RPCs

export const rpcApiService = {
 
  addRpc: async (credentials : RpcCredentials) => {
    const {data} = await axiosInst.post("/rpcs", credentials)
    return data;  
  },

  updateRpc: async (Id:string ,credentials : UpdateRpcCredentials) => {
    const {data} = await axiosInst.put(`/rpcs/${Id}`, credentials)
    return data;  
  },

  testRpc: async (credentials: RpcTestCredentials ) => {
    const {data} = await axiosInst.post("/rpcs/test", credentials)
    return data;  
  },

  deleteRpc: async (Id:string) => {
    const {data} = await axiosInst.delete(`/rpcs/${Id}`)
    return data;  
  },
  
  getRpc: async () => {
    const {data} = await axiosInst.get("/rpcs")
    return data;  
  },

  getRpcById: async (Id: string) => {
    const {data} = await axiosInst.get(`/rpcs/${Id}`)
    return data;  
  },

  getRpcStatus: async (Id: string) => {
    const {data} = await axiosInst.get(`/rpcs/${Id}/status`)
    return data;  
  },

  getRpcMetrics: async (Id: string) => {
    const {data} = await axiosInst.get(`/rpcs/${Id}/metrics`)
    return data;  
  },
  
  getRpcToggle: async (Id: string) => {
    const {data} = await axiosInst.get(`/rpcs/${Id}/toggle`)
    return data;  
  },

}


// APIs related Alerts

export const alertApiService = {

  addAlert: async (alert: Alert) => {
    const {data} = await axiosInst.post("/alerts", alert)
    return data;  
  },

  getAlerts: async (Id:string) => {
    const {data} = await axiosInst.get(`/alerts/${Id}`)
    return data;  
  },

  resolveAlert: async (Id:string) => {
    const {data} = await axiosInst.put(`/alerts/${Id}/resolve`)
    return data;  
  },

  deleteAlert: async (Id:string) => {
    const {data} = await axiosInst.delete(`/alerts/${Id}`)
    return data;  
  }

}