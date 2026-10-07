'use client';

import { useCartStore } from '@/store/useCartStore';
import { placeCanteenOrder, getOrderDetails } from '@/app/actions/orderActions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrderSchema, CreateOrderInput } from '@/lib/schemas/orderSchema';
import { useState, useTransition, useEffect, useCallback } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Clock,
  User,
  Mail,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Receipt,
  Utensils,
  RefreshCw,
  Flame,
  PackageCheck,
} from 'lucide-react';

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

interface ConfirmedOrderDetails {
  orderId: string;
  userName: string;
  userEmail: string;
  pickupSlot: string;
  totalAmount: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

const STATUS_UI: Record<
  string,
  { label: string; badgeClass: string; dotClass: string; step: number; icon: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled' }
> = {
  PENDING: {
    label: 'Kitchen: PENDING PREP',
    badgeClass: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
    dotClass: 'bg-amber-500 animate-ping',
    step: 1,
    icon: 'pending',
  },
  PREPARING: {
    label: 'Kitchen: IN KITCHEN 🔥',
    badgeClass: 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400',
    dotClass: 'bg-blue-500 animate-pulse',
    step: 2,
    icon: 'preparing',
  },
  READY: {
    label: 'Kitchen: READY FOR PICKUP! 🎉',
    badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20',
    dotClass: 'bg-emerald-500 animate-ping',
    step: 3,
    icon: 'ready',
  },
  COMPLETED: {
    label: 'Kitchen: COMPLETED ✅',
    badgeClass: 'bg-slate-500/15 border-slate-500/30 text-slate-600 dark:text-slate-400',
    dotClass: 'bg-slate-400',
    step: 4,
    icon: 'completed',
  },
  CANCELLED: {
    label: 'Kitchen: CANCELLED ❌',
    badgeClass: 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400',
    dotClass: 'bg-rose-500',
    step: 0,
    icon: 'cancelled',
  },
};

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    cart,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalAmount,
    pickupSlot,
    setPickupSlot,
    setActiveOrderId,
  } = useCartStore();

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrderDetails | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>('PENDING');
  const [isPollingRefreshing, setIsPollingRefreshing] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      userName: '',
      userEmail: '',
      pickupSlot: pickupSlot || PICKUP_SLOTS[0],
      items: [],
    },
  });

  // Keep form synced with cart contents
  useEffect(() => {
    setValue(
      'items',
      cart.map((i) => ({
        menuItemId: i.id,
        quantity: i.quantity,
        unitPrice: i.price,
      }))
    );
  }, [cart, setValue]);

  // Real-time status polling whenever an order is confirmed
  const fetchLatestStatus = useCallback(async (orderId: string) => {
    try {
      const res = await getOrderDetails(orderId);
      if (res.success && res.order?.status) {
        setLiveStatus(res.order.status);
      }
    } catch (e) {
      console.error('Error fetching latest order status:', e);
    }
  }, []);

  useEffect(() => {
    if (!confirmedOrder?.orderId) return;

    // Deferred check to avoid cascading renders
    const timer = setTimeout(() => {
      fetchLatestStatus(confirmedOrder.orderId);
    }, 50);

    // Poll every 2 seconds for instantaneous updates when admin toggles status
    const interval = setInterval(() => {
      fetchLatestStatus(confirmedOrder.orderId);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [confirmedOrder?.orderId, fetchLatestStatus]);

  const handleManualRefresh = async () => {
    if (!confirmedOrder?.orderId) return;
    setIsPollingRefreshing(true);
    await fetchLatestStatus(confirmedOrder.orderId);
    setTimeout(() => setIsPollingRefreshing(false), 400);
  };

  if (!isOpen) return null;

  const handleClose = () => {
    setConfirmedOrder(null);
    setErrorMessage(null);
    onClose();
  };

  const onSubmit = (data: CreateOrderInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await placeCanteenOrder(data);
      if (result.success && result.orderId) {
        // Save order snapshot for customer confirmation receipt
        const snapshot: ConfirmedOrderDetails = {
          orderId: result.orderId,
          userName: data.userName,
          userEmail: data.userEmail,
          pickupSlot: data.pickupSlot,
          totalAmount: getTotalAmount(),
          items: [...cart],
        };
        setConfirmedOrder(snapshot);
        setLiveStatus('PENDING');
        setActiveOrderId(result.orderId);
        clearCart();
        reset();
      } else {
        setErrorMessage(result.message || 'Error placing order. Please try again.');
      }
    });
  };

  const statusConfig = STATUS_UI[liveStatus] || STATUS_UI.PENDING;
  const currentStep = statusConfig.step;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card text-card-foreground border-l border-border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* If Order Confirmed, show Confirmation Ticket on the user page with LIVE Status updates */}
        {confirmedOrder ? (
          <div className="flex flex-col h-full justify-between py-2">
            <div>
              {/* Success Header */}
              <div className="text-center pt-2 pb-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 ring-8 ring-emerald-500/10 mb-3 animate-in zoom-in duration-300">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  Order Confirmed! 🎉
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your meal has been sent to the kitchen.
                </p>
              </div>

              {/* Order Receipt Card */}
              <div className="rounded-2xl border border-border bg-secondary/40 p-5 space-y-4 shadow-xs">
                {/* Header with live status and refresh button */}
                <div className="flex items-center justify-between pb-3 border-b border-border/80">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      ORDER NUMBER
                    </span>
                    <p className="font-mono text-base font-extrabold text-orange-600 dark:text-orange-400">
                      #{confirmedOrder.orderId.slice(0, 8).toUpperCase()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition-all ${statusConfig.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
                      {statusConfig.label}
                    </span>

                    <button
                      type="button"
                      onClick={handleManualRefresh}
                      title="Check latest status"
                      className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isPollingRefreshing ? 'animate-spin text-orange-500' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Live Step Progress Indicator */}
                <div className="py-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground mb-1.5">
                    <span className={currentStep >= 1 ? 'text-orange-600 dark:text-orange-400' : ''}>
                      1. Placed
                    </span>
                    <span className={currentStep >= 2 ? 'text-blue-600 dark:text-blue-400' : ''}>
                      2. In Kitchen
                    </span>
                    <span className={currentStep >= 3 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                      3. Ready
                    </span>
                    <span className={currentStep >= 4 ? 'text-foreground' : ''}>
                      4. Picked Up
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="h-2 w-full rounded-full bg-border overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 ${
                        currentStep === 1
                          ? 'w-1/4 bg-amber-500'
                          : currentStep === 2
                          ? 'w-2/4 bg-blue-500'
                          : currentStep === 3
                          ? 'w-3/4 bg-emerald-500 animate-pulse'
                          : currentStep >= 4
                          ? 'w-full bg-slate-500'
                          : 'w-0'
                      }`}
                    />
                  </div>
                </div>

                {/* Ready Alert Announcement when status changes to READY */}
                {liveStatus === 'READY' && (
                  <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-700 dark:text-emerald-300 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2 font-bold">
                      <PackageCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>YOUR FOOD IS READY FOR PICKUP!</span>
                    </div>
                    <p className="mt-1 text-[11px] opacity-90">
                      Please head over to <strong>Counter 2</strong> with your order number.
                    </p>
                  </div>
                )}

                {/* Preparing announcement */}
                {liveStatus === 'PREPARING' && (
                  <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-2.5 text-xs text-blue-700 dark:text-blue-300">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Flame className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Chefs are preparing your meal right now!</span>
                    </div>
                  </div>
                )}

                {/* Customer and slot details */}
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-500" /> Pickup Slot:
                    </span>
                    <span className="font-bold text-foreground text-right">
                      {confirmedOrder.pickupSlot}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-orange-500" /> Student:
                    </span>
                    <span className="font-medium text-foreground text-right truncate max-w-[200px]">
                      {confirmedOrder.userName} ({confirmedOrder.userEmail})
                    </span>
                  </div>
                </div>

                {/* Items summary */}
                <div className="pt-2 border-t border-border/80">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    DISHES ({confirmedOrder.items.length})
                  </span>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {confirmedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-xs text-foreground/90 font-medium"
                      >
                        <span className="truncate mr-2">
                          {item.name} <span className="text-muted-foreground">× {item.quantity}</span>
                        </span>
                        <span className="font-semibold shrink-0">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2.5 border-t border-border font-bold text-base">
                  <span>Total Due / Paid:</span>
                  <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                    ₹{confirmedOrder.totalAmount}
                  </span>
                </div>
              </div>

              {/* Informational tip */}
              <div className="mt-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 p-3 text-xs text-orange-800 dark:text-orange-300">
                <p className="font-semibold">📍 Pickup Instructions:</p>
                <p className="mt-0.5 text-[11px] opacity-90">
                  Head to <strong>Counter 2 (Pre-Order Express)</strong> at your selected time slot and show your Order #{confirmedOrder.orderId.slice(0, 8).toUpperCase()}.
                </p>
              </div>
            </div>

            {/* Stay on User Page button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 cursor-pointer active:scale-[0.98] transition-all"
              >
                <Utensils className="w-4 h-4" />
                <span>Order More Delicious Food</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Cart View */
          <>
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Your Food Tray</h2>
                    <p className="text-xs text-muted-foreground">
                      {cart.length} {cart.length === 1 ? 'item' : 'items'} in pre-order
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Close tray"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Server error message if any */}
              {errorMessage && (
                <div className="my-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
                  {errorMessage}
                </div>
              )}

              {/* Items List */}
              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-3">
                    <Utensils className="h-8 w-8 opacity-40" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">Your tray is empty</h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
                    Browse today&apos;s menu and add your favorite dishes to bypass the canteen queue.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-600 transition-colors cursor-pointer"
                  >
                    <span>Browse Menu</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-border/60 my-4 max-h-[38vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3.5 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-border"
                          />
                        )}
                        <div className="truncate">
                          <p className="font-bold text-sm text-foreground truncate">{item.name}</p>
                          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                            ₹{item.price}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-orange-500 hover:text-white transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-orange-500 hover:text-white transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="ml-1 text-muted-foreground hover:text-red-500 p-1 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form & Pre-Order Submission */}
            {cart.length > 0 && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 border-t border-border pt-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1">
                    <User className="w-3.5 h-3.5 text-orange-500" />
                    <span>Your Full Name</span>
                  </label>
                  <input
                    {...register('userName')}
                    placeholder="e.g. Aditya Purohit"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-2xs"
                  />
                  {errors.userName && (
                    <p className="mt-1 text-[11px] font-semibold text-red-500">
                      {errors.userName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1">
                    <Mail className="w-3.5 h-3.5 text-orange-500" />
                    <span>Campus Email</span>
                  </label>
                  <input
                    {...register('userEmail')}
                    placeholder="e.g. aditya@canteen.edu"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-2xs"
                  />
                  {errors.userEmail && (
                    <p className="mt-1 text-[11px] font-semibold text-red-500">
                      {errors.userEmail.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span>Select Express Pickup Window</span>
                  </label>
                  <select
                    {...register('pickupSlot')}
                    onChange={(e) => {
                      setPickupSlot(e.target.value);
                      setValue('pickupSlot', e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-2xs cursor-pointer"
                  >
                    {PICKUP_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subtotal Breakdown */}
                <div className="rounded-xl bg-secondary/60 p-3 space-y-1.5 text-xs border border-border/60">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{getTotalAmount()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Canteen Express Fee</span>
                    <span className="text-emerald-500 font-semibold">FREE (₹0)</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-border/80 font-black text-sm text-foreground">
                    <span>Total Amount</span>
                    <span className="text-base text-orange-600 dark:text-orange-400">
                      ₹{getTotalAmount()}
                    </span>
                  </div>
                </div>

                {/* Confirm Order Button - Note: NEVER redirects to Admin! */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Sending to Kitchen...</span>
                    </>
                  ) : (
                    <>
                      <Receipt className="h-4 w-4" />
                      <span>Confirm Pre-Order (₹{getTotalAmount()})</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}