import { rpcApiService } from "@/services/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RPC, useRPCStore } from "@/store/rpcSlice";
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



// 🟢 ADD RPC
export function useAddRpc() {
  const queryClient = useQueryClient();
  const addRpcToState = useRPCStore((s) => s.addRpcToState);

  return useMutation({
    mutationFn: rpcApiService.addRpc,

    // Optimistic update
    onMutate: async (newRpc: any) => {
      await queryClient.cancelQueries({ queryKey: ["rpcs"] });
      const previousRpcs = queryClient.getQueryData<any[]>(["rpcs"]);

      const optimisticRpc = {
        ...newRpc,
        id: `temp-${Date.now()}`,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<RPC[]>(["rpcs"], (old: RPC[] | undefined) =>
        Array.isArray(old) ? [...old, optimisticRpc] : [optimisticRpc]
      );

      return { previousRpcs };
    },

    // Rollback if error
    onError: (err, _, context) => {
      if (context?.previousRpcs) {
        queryClient.setQueryData(["rpcs"], context.previousRpcs);
      }
    },

    // ✅ On success: update both React Query cache & Zustand
    onSuccess: (data) => {
      queryClient.setQueryData<RPC[]>(["rpcs"], (old: RPC[] | undefined) =>
        old
          ? old.map((rpc: RPC) =>
          typeof rpc.id === "string" && rpc.id.startsWith("temp-") ? data.data as RPC : rpc
        )
          : [data.data as RPC]
      );

      // Push result into Zustand store
      addRpcToState(data.data);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rpcs"] });
    },
  });
}

// 🟡 UPDATE RPC
export function useUpdateRpc() {
  const queryClient = useQueryClient();
  const updateRpcInState = useRPCStore((s) => s.updateRpcInState);

  return useMutation({
    mutationFn: (params: { Id: string; credentials: any }) =>
      rpcApiService.updateRpc(params.Id, params.credentials),

    onMutate: async (updatedRpc: any) => {
      await queryClient.cancelQueries({ queryKey: ["rpcs"] });
      const previousRpcs = queryClient.getQueryData<any[]>(["rpcs"]);

      queryClient.setQueryData<RPC[]>(["rpcs"], (old: RPC[] | undefined) =>
        old
                ? old.map((rpc: RPC) =>
                rpc.id === updatedRpc.Id ? { ...rpc, ...updatedRpc.credentials } : rpc
        )
          : []
      );

      return { previousRpcs };
    },

    onError: (err, _, context) => {
      if (context?.previousRpcs)
        queryClient.setQueryData(["rpcs"], context.previousRpcs);
    },

    // ✅ On success: reflect update in Zustand
    onSuccess: (data, variables) => {
      queryClient.setQueryData<RPC[]>(["rpcs"], (old: RPC[] | undefined) =>
        old
          ? old.map((rpc: RPC) => (rpc.id === variables.Id ? data.data as RPC : rpc))
          : [data.data as RPC]
      );

      updateRpcInState(data.data);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rpcs"] });
    },
  });
}

// 🔴 DELETE RPC
export function useDeleteRpc() {
  const queryClient = useQueryClient();
  const deleteRpcFromState = useRPCStore((s) => s.deleteRpcFromState);

  return useMutation({
    mutationFn: (Id: string) => rpcApiService.deleteRpc(Id),

    onMutate: async (Id: string) => {
      await queryClient.cancelQueries({ queryKey: ["rpcs"] });
      const previousRpcs = queryClient.getQueryData<any[]>(["rpcs"]);

      queryClient.setQueryData<RPC[]>(["rpcs"], (old) =>
        Array.isArray(old) ? old.filter((rpc: RPC) => rpc.id !== Id) : []
      );

      return { previousRpcs };
    },

    onError: (err, _, context) => {
      if (context?.previousRpcs) {
        queryClient.setQueryData(["rpcs"], context.previousRpcs);
      }
    },

    // ✅ On success: remove from Zustand
    onSuccess: (_, Id) => {
      queryClient.setQueryData<RPC[]>(["rpcs"], (old: RPC[] | undefined) =>
        old ? old.filter((rpc: RPC) => rpc.id !== Id) : []
      );

      deleteRpcFromState(Id);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rpcs"] });
    },
  });
}
