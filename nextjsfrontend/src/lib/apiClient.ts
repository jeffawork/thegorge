import axios, {
  AxiosInstance,
} from 'axios';



const axiosInst = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});


export const  authApiService = {

  login: async (credentials: loginCredentials) => {
    const { data } = await axiosInst.post("/auth/login", credentials);
    return data;
  }

}