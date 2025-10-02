import axios, {
  AxiosInstance,
} from 'axios';



const axiosInst : AxiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


export const  authApiService = {

  login: async (credentials: loginCredentials) => {
    const { data } = await axiosInst.post("/auth/login", credentials);
    return data;
  }

}