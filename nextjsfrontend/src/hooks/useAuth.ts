import { authApiService } from '@/lib/apiClient';
import { notify } from '@/lib/notify';
import { useAuthStore } from '@/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';


export const useLogin = ( ) => {
    const QueryClient = useQueryClient()
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);


    return useMutation({
        mutationFn: authApiService.login,
        
        onSuccess: (data) => {
            setUser(data.user);
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