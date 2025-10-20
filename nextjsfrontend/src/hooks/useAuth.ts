import { authApiService } from '@/services/apiClient';
import { notify } from '@/lib/notify';
import { useAuthStore } from '@/store/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';


export const useLogin = ( ) => {
    const QueryClient = useQueryClient()
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);


    return useMutation({
        mutationFn: authApiService.login,
        
        onSuccess: (res) => {
            // console.log(data)
            setUser(res.data);
            QueryClient.invalidateQueries({ queryKey: ['me'] });
            router.push('/dashboard');
            notify.success("Logged in successfully");

        },

        onError: (error: any) => {
            console.log(error);
            notify.error(error?.response?.data?.message || "Login failed");
        }
    })

}

export const useRegister = ( ) => {
    const QueryClient = useQueryClient()
    const router = useRouter();

    return useMutation({
        mutationFn: authApiService.register,
        
        onSuccess: (res) => {
            console.log(res.data)
            QueryClient.invalidateQueries({ queryKey: ['me'] });
            router.push('/dashboard');
            notify.success("Registered successfully");

        },

        onError: (error: any) => {
            console.log(error);
            notify.error(error?.response?.data?.message || "Login failed");
        }
    })

}

export const useLogout = ( ) => {
    const QueryClient = useQueryClient()
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);


    return useMutation({
        mutationFn: authApiService.login,
        
        onSuccess: (res) => {
            // console.log(data)
            setUser(res.data);
            QueryClient.invalidateQueries({ queryKey: ['me'] });
            router.push('/dashboard');
            notify.success("Logged in successfully");

        },

        onError: (error: any) => {
            console.log(error);
            notify.error(error?.response?.data?.message || "Login failed");
        }
    })

}