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
import { useRPCStore } from '@/store/rpcSlice';
import { rpcSchema } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@radix-ui/react-checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@radix-ui/react-select';
import { Input } from '@/components/ui/input';

interface RpcDialogFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RpcDialogForm: React.FC<RpcDialogFormProps> = ({
  isOpen,
  onClose,
}) => {
  const { addRPC } = useRPCStore();
  const [showChainId, setShowChainId] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // const showChainId = form.watch('network') === 'custom';

  const handleSubmit = (data: any) => {};

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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="glass-card overflow-hidden">
              {/* Header */}
              <div className="from-primary-500 to-secondary-500 bg-gradient-to-r p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-white/20 p-2">
                      <Server className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Add New RPC Endpoint
                    </h2>
                  </div>
                  <motion.button
                    className="rounded-lg p-2 transition-colors hover:bg-white/20"
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-5 w-5 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-6"
                  >
                    {/* RPC Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Server className="h-4 w-4" /> RPC Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., My Ethereum Node"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* RPC URL */}
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Link className="h-4 w-4" /> RPC URL *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://eth-mainnet.rpc.x.superfluid.dev"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Network */}
                    <FormField
                      control={form.control}
                      name="network"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Server className="h-4 w-4" /> Network *
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a network..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ethereum">
                                  Ethereum Mainnet
                                </SelectItem>
                                <SelectItem value="polygon">Polygon</SelectItem>
                                <SelectItem value="bsc">
                                  Binance Smart Chain
                                </SelectItem>
                                <SelectItem value="arbitrum">
                                  Arbitrum
                                </SelectItem>
                                <SelectItem value="optimism">
                                  Optimism
                                </SelectItem>
                                <SelectItem value="custom">
                                  Custom Network
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Chain ID */}
                    <AnimatePresence>
                      {showChainId && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <FormField
                            control={form.control}
                            name="chainId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Hash className="h-4 w-4" /> Chain ID *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="1 for Ethereum Mainnet"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Timeout */}
                    <FormField
                      control={form.control}
                      name="timeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Timeout (ms)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1000"
                              max="60000"
                              {...field}
                              value={
                                typeof field.value === 'number'
                                  ? field.value
                                  : Number(field.value) || 10000
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Priority */}
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Flag className="h-4 w-4" /> Priority
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={String(field.value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">High</SelectItem>
                                <SelectItem value="2">Medium</SelectItem>
                                <SelectItem value="3">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Enabled */}
                    <FormField
                      control={form.control}
                      name="enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="flex items-center gap-2">
                            <ToggleRight className="text-primary-400 h-4 w-4" />
                            Enable monitoring
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        // onClick={testConnection}
                        className="flex flex-1 items-center justify-center gap-2"
                      >
                        <Zap className="h-4 w-4" />
                        Test Connection
                      </Button>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex flex-1 items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
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
                </Form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
