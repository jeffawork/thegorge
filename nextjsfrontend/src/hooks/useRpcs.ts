import { rpcApiService } from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetRpcs = () => {
  return useQuery({
    queryKey: ["rpcs"], // Unique cache key
    queryFn: rpcApiService.getRpc, // The GET request
    staleTime: 1000 * 60, // 1 minute caching (optional)
  });
};

export const useGetRpcById = (Id: string) => {
  return useQuery({
    queryKey: ["rpc", Id], // Unique cache key
    queryFn: () => rpcApiService.getRpcById( Id ), // The GET request
    enabled: !!Id, // Only run the query if Id is provided
  });
};

export const useGetRpcStatus = (Id: string) => {
  return useQuery({
    queryKey: ["rpcStatus", Id], // Unique cache key
    queryFn: () => rpcApiService.getRpcStatus(Id ), // The GET request
    enabled: !!Id, // Only run the query if Id is provided
  });
};

export const useGetRpcMetrics = (Id: string) => {
  return useQuery({
    queryKey: ["rpcMetrics", Id], // Unique cache key
    queryFn: () => rpcApiService.getRpcMetrics(Id), // The GET request
    enabled: !!Id, // Only run the query if Id is provided
  });
};

export const useGetRpcToggle = (Id: string) => {
  return useQuery({
    queryKey: ["rpcToggle", Id], // Unique cache key
    queryFn: () => rpcApiService.getRpcToggle(Id), // The GET request
    enabled: !!Id, // Only run the query if Id is provided
  });
};


export const useTestRpc = (credentials: RpcTestCredentials) => {
  return useMutation({
    mutationKey: ["testRpc"],
    mutationFn: () => rpcApiService.testRpc(credentials),

  });
};

export function useAddRpc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rpcApiService.addRpc,

    // Optimistic update before API response
    onMutate: async (newRpc: any) => {
      await queryClient.cancelQueries({ queryKey: ["rpcs"] });

      const previousRpcs = queryClient.getQueryData<any[]>(["rpcs"]);

      const optimisticRpc = {
        ...newRpc,
        id: `temp-${Date.now()}`,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<any[]>(["rpcs"], (old) =>
        old ? [...old, optimisticRpc] : [optimisticRpc]
      );

      return { previousRpcs };
    },

    // If error, roll back
    onError: (err, _, context) => {
      if (context?.previousRpcs) {
        queryClient.setQueryData(["rpcs"], context.previousRpcs);
      }
    },

    // On success, replace the optimistic entry with real data
    onSuccess: (data) => {
      queryClient.setQueryData<any[]>(["rpcs"], (old) =>
        old
          ? old.map((rpc) =>
              rpc.id.startsWith("temp-") ? data.data : rpc
            )
          : [data.data]
      );
    },

    // Optionally refetch after
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rpcs"] });
    },
  });
}

export function useUpdateRpc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { Id: string; credentials: UpdateRpcCredentials }) =>
      rpcApiService.updateRpc(params.Id, params.credentials),
    mutationKey: ["updateRpc"],

    // Optimistic update before API response
    onMutate: async (updatedRpc: any) => {
      await queryClient.cancelQueries({ queryKey: ["rpcs"] });
      const previousRpcs = queryClient.getQueryData<any[]>(["rpcs"]);

      // Optimistically update the cache
      queryClient.setQueryData<any[]>(["rpcs"], (old) =>
        old ? old.map((rpc) => (rpc.id === updatedRpc.Id ? updatedRpc : rpc)) : []
      );

      return { previousRpcs };

    },

    // If error, roll back
    onError: (err, _, context) => {
      if (context?.previousRpcs) {
        queryClient.setQueryData(["rpcs"], context.previousRpcs);
      }
    },  

    // On success, ensure the cache is updated with server response
    onSuccess: (data, variables) => {
      queryClient.setQueryData<any[]>(["rpcs"], (old) =>
        old ? old.map((rpc) => (rpc.id === variables.Id ? data.data : rpc)) : [data.data]
      );
    },

    // Optionally refetch after
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rpcs"] });
    },
  });

}  
 
export function useDeleteRpc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (Id: string) => rpcApiService.deleteRpc(Id),
    mutationKey: ["deleteRpc"],
    // Optimistic update before API response
    onMutate: async (Id: string) => {
      await queryClient.cancelQueries({ queryKey: ["rpcs"] });
      const previousRpcs = queryClient.getQueryData<any[]>(["rpcs"]);
        // Optimistically update the cache  
        queryClient.setQueryData<any[]>(["rpcs"], (old) =>
        old ? old.filter((rpc) => rpc.id !== Id) : []
      );
      return { previousRpcs };
    },

    // If error, roll back
    onError: (err, _, context) => {
      if (context?.previousRpcs) {
        queryClient.setQueryData(["rpcs"], context.previousRpcs);
      }
    },
    // On success, ensure the cache is updated with server response 
    onSuccess: (_, Id) => {
      queryClient.setQueryData<any[]>(["rpcs"], (old) =>
        old ? old.filter((rpc) => rpc.id !== Id) : []
      );
    },

    // Optionally refetch after
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rpcs"] });
    },
  });

}