'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Server,
  Link,
  Hash,
  Clock,
  Flag,
  ToggleRight,
  Zap,
} from 'lucide-react';
import { rpcSchema } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@radix-ui/react-checkbox';
import { Input } from '@/components/ui/input';
import { useAddRpc } from '@/hooks/useRpcs';
import { RPC } from '@/store/rpcSlice';

interface RpcDialogFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RpcDialogForm: React.FC<RpcDialogFormProps> = ({
  isOpen,
  onClose,
}) => {
  const { mutate: addRPC, isPending } = useAddRpc();
  const form = useForm({
    resolver: zodResolver(rpcSchema),
    defaultValues: {
      name: '',
      url: '',
      network: '',
      chainId: '',
      timeout: 10000,
      priority: 2,
      enabled: true,
    },
  });

  const showChainId = form.watch('network') === 'custom';

  const handleSubmit = (data: any) => {
    // Ensure required fields match RpcCredentials (chainId must be a number)
    addRPC(data);
  };

  // const testConnection = async () => {
  //   if (!formData.url) return

  //   // This would typically call an API endpoint to test the connection
  //   console.log('Testing connection to:', formData.url)
  // }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 text-black backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="bg-bl relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-foreground shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="from-primary-500 to-secondary-500 flex items-center justify-between bg-gradient-to-r p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/20 p-2">
                  <Server className="h-6 w-6 text-black" />
                </div>
                <h2 className="text-gradient text-center text-xl font-semibold">
                  Add New RPC Endpoint
                </h2>
              </div>
              <motion.button
                className="rounded-lg p-2 transition-colors hover:bg-white/20"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-5 w-5 bg-white/20" />
              </motion.button>
            </div>

            {/* Body */}
            <div className="p-6">
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                {/* RPC Name */}
                <div>
                  <label className="text-gradient mb-1 flex items-center gap-2 font-medium">
                    <Server className="text-gradient h-4 w-4" /> RPC Name *
                  </label>
                  <Input
                    placeholder="e.g., My Ethereum Node"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {form.formState.errors.name.message as string}
                    </p>
                  )}
                </div>

                {/* RPC URL */}
                <div>
                  <label className="text-gradient mb-1 flex items-center gap-2 font-medium">
                    <Link className="text-gradient h-4 w-4" /> RPC URL *
                  </label>
                  <Input
                    placeholder="https://eth-mainnet.rpc.x.superfluid.dev"
                    {...form.register('url')}
                  />
                  {form.formState.errors.url && (
                    <p className="mt-1 text-sm text-red-500">
                      {form.formState.errors.url.message as string}
                    </p>
                  )}
                </div>

                {/* Network */}
                <div>
                  <label className="text-gradient mb-1 flex items-center gap-2 font-medium">
                    <Server className="text-gradient h-4 w-4" /> Network *
                  </label>
                  <select
                    {...form.register('network')}
                    className="focus:border-primary-500 focus:ring-primary-200 w-full rounded-md border border-gray-300 p-2 focus:ring"
                  >
                    <option value="">Select a network...</option>
                    <option value="ethereum">Ethereum Mainnet</option>
                    <option value="polygon">Polygon</option>
                    <option value="bsc">Binance Smart Chain</option>
                    <option value="arbitrum">Arbitrum</option>
                    <option value="optimism">Optimism</option>
                    <option value="custom">Custom Network</option>
                  </select>
                </div>

                {/* Chain ID */}
                <AnimatePresence>
                  {showChainId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <label className="text-gradient mb-1 flex items-center gap-2 font-medium">
                        <Hash className="text-gradient h-4 w-4" /> Chain ID *
                      </label>
                      <Input
                        type="number"
                        placeholder="1 for Ethereum Mainnet"
                        {...form.register('chainId')}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Timeout */}
                <div>
                  <label className="text-gradient mb-1 flex items-center gap-2 font-medium">
                    <Clock className="text-gradient h-4 w-4" /> Timeout (ms)
                  </label>
                  <Input
                    type="number"
                    min="1000"
                    max="60000"
                    {...form.register('timeout', { valueAsNumber: true })}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="text-gradient mb-1 flex items-center gap-2 font-medium">
                    <Flag className="text-gradient h-4 w-4" /> Priority
                  </label>
                  <select
                    {...form.register('priority', { valueAsNumber: true })}
                    className="focus:border-primary-500 focus:ring-primary-200 w-full rounded-md border border-gray-300 p-2 focus:ring"
                  >
                    <option value={1}>High</option>
                    <option value={2}>Medium</option>
                    <option value={3}>Low</option>
                  </select>
                </div>

                {/* Enabled */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.watch('enabled')}
                    onCheckedChange={(val) =>
                      form.setValue('enabled', Boolean(val))
                    }
                  />
                  <label className="text-gradient flex cursor-pointer items-center gap-2">
                    <ToggleRight className="text-gradient h-4 w-4" />
                    Enable monitoring
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex flex-1 items-center justify-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Test Connection
                  </Button>

                  <Button
                    type="submit"
                    className="flex flex-1 items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Server className="h-4 w-4" />
                        Add RPC
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
