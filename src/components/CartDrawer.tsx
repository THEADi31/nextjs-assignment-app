'use client';

import { useCartStore } from '@/store/useCartStore';
import { placeCanteenOrder } from '@/app/actions/orderActions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrderSchema, CreateOrderInput } from '@/lib/schemas/orderSchema';
import { useState, useTransition } from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PICKUP_SLOTS = [
  '11:30 AM - 12:00 PM',
  '12:00 PM - 12:30 PM',
  '12:30 PM - 01:00 PM',
  '01:00 PM - 01:30 PM',
  '01:30 PM - 02:00 PM',
];

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeItem, updateQuantity, clearCart, getTotalAmount, pickupSlot, setPickupSlot } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [serverMessage, setServerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      pickupSlot,
      items: cart.map((i) => ({ menuItemId: i.id, quantity: i.quantity, unitPrice: i.price })),
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: CreateOrderInput) => {
    // Sync latest cart items into payload
    const formattedData = {
      ...data,
      items: cart.map((i) => ({
        menuItemId: i.id,
        quantity: i.quantity,
        unitPrice: i.price,
      })),
    };

    startTransition(async () => {
      const result = await placeCanteenOrder(formattedData);
      if (result.success) {
        setServerMessage({ type: 'success', text: result.message });
        clearCart();
        setTimeout(() => {
          onClose();
          setServerMessage(null);
        }, 2000);
      } else {
        setServerMessage({ type: 'error', text: result.message || 'Error placing order' });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-background p-6 shadow-xl flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-bold">Your Canteen Order</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>

          {serverMessage && (
            <div
              className={`my-4 rounded-md p-3 text-sm font-medium ${
                serverMessage.type === 'success'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}
            >
              {serverMessage.text}
            </div>
          )}

          {cart.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Your cart is empty. Add items from the menu!
            </div>
          ) : (
            <div className="divide-y my-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 rounded bg-secondary font-bold"
                    >
                      -
                    </button>
                    <span className="text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 rounded bg-secondary font-bold"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-2 text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border-t pt-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground">Name</label>
              <input
                {...register('userName')}
                placeholder="Student / Faculty Name"
                className="mt-1 w-full rounded-md border p-2 text-sm bg-background"
              />
              {errors.userName && (
                <p className="mt-1 text-xs text-red-500">{errors.userName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground">Email</label>
              <input
                {...register('userEmail')}
                placeholder="email@canteen.edu"
                className="mt-1 w-full rounded-md border p-2 text-sm bg-background"
              />
              {errors.userEmail && (
                <p className="mt-1 text-xs text-red-500">{errors.userEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground">
                Pickup Slot
              </label>
              <select
                {...register('pickupSlot')}
                onChange={(e) => {
                  setPickupSlot(e.target.value);
                  setValue('pickupSlot', e.target.value);
                }}
                className="mt-1 w-full rounded-md border p-2 text-sm bg-background"
              >
                {PICKUP_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center py-2 font-bold text-lg">
              <span>Total:</span>
              <span>₹{getTotalAmount().toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isPending ? 'Placing Pre-Order...' : 'Confirm Pre-Order'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}