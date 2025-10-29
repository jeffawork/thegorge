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
            setUser(res.data.user);
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

export const useRegister = () => {
    const QueryClient = useQueryClient()
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);


    return useMutation({
        mutationFn: authApiService.register,
        onMutate: () => {
            notify.info("Registering...");
        },
        
        onSuccess: (res) => {
            setUser(res.data.user)
            console.log(res)
            QueryClient.invalidateQueries({ queryKey: ['me'] });
            router.push('/sign-in');
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
    const logout = useAuthStore((state) => state.logout);


    return useMutation({
        mutationFn: authApiService.logout,

        onSuccess: (res) => {
            // console.log(data)
            logout();
            QueryClient.invalidateQueries({ queryKey: ['me'] });
            router.push('/sign-in');
            notify.success("Logged  out successfully");

        },

        onError: (error: any) => {
            console.log(error);
            notify.error(error?.response?.data?.message || "Login failed");
        }
    })

}