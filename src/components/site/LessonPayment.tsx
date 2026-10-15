import { useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { openRazorpayCheckout, type RazorpaySuccessResponse } from "@/lib/razorpay";
import { toast } from "sonner";

const PRESET_AMOUNTS = [
  { label: "₹500 Advance", value: "500" },
  { label: "₹1,500 Registration", value: "1500" },
  { label: "₹3,500 Bike Course", value: "3500" },
  { label: "₹5,500 Car Course", value: "5500" },
];

export function LessonPayment({
  id = "lesson-payment",
  learnerName: initialName = "",
  mobile: initialMobile = "",
  email: initialEmail = "",
}: {
  id?: string;
  learnerName?: string;
  mobile?: string;
  email?: string;
}) {
  const [amount, setAmount] = useState("500");
  const [purpose, setPurpose] = useState("Booking advance");
  const [name, setName] = useState(initialName);
  const [mobile, setMobile] = useState(initialMobile);
  const [email, setEmail] = useState(initialEmail);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<RazorpaySuccessResponse | null>(null);

  const numAmount = Number(amount);
  const validAmount = /^\d+(\.\d{1,2})?$/.test(amount) && numAmount >= 1;

  async function handlePay() {
    if (!validAmount) {
      toast.error("Please enter a valid amount (minimum ₹1).");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter learner full name for the payment receipt.");
      return;
    }
    if (!mobile.trim() || mobile.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setPaying(true);

    await openRazorpayCheckout({
      amount: numAmount,
      purpose,
      learnerName: name.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      description: `Laxmi Driving Training - ${purpose}`,
      onSuccess: (res) => {
        setPaying(false);
        setPaymentSuccess(res);
        toast.success(`Payment of ₹${numAmount.toLocaleString("en-IN")} successful!`);
      },
      onError: (err) => {
        setPaying(false);
        toast.error(
          err instanceof Error ? err.message : "Payment was cancelled or failed. Please try again.",
        );
      },
      onDismiss: () => {
        setPaying(false);
      },
    });
  }

  if (paymentSuccess) {
    const receiptMessage = `Hello Laxmi Driving Training, I have completed my online payment via Razorpay!\n\n📋 *Payment Receipt:*\n• Transaction ID: ${paymentSuccess.razorpay_payment_id}\n• Purpose: ${purpose}\n• Amount Paid: ₹${numAmount.toLocaleString("en-IN")}\n• Learner Name: ${name}\n• Mobile: ${mobile}\n\nPlease confirm my lesson booking batch.`;

    return (
      <div
        id={id}
        className="card-surface animate-fade-up rounded-2xl border border-success/30 bg-success/5 p-6 text-center space-y-4"
      >
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-9" />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">
            <Sparkles className="size-3.5" /> Razorpay Verified
          </span>
          <h3 className="mt-2 text-xl font-bold font-display text-foreground">
            Payment Successful!
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Thank you! Your transaction has been securely processed.
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-background/80 p-4 text-left text-xs sm:text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount Paid:</span>
            <span className="font-bold text-foreground">₹{numAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment ID:</span>
            <span className="font-mono text-primary break-all">
              {paymentSuccess.razorpay_payment_id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Purpose:</span>
            <span className="font-medium text-foreground">{purpose}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Learner:</span>
            <span className="font-medium text-foreground">{name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mobile:</span>
            <span className="font-medium text-foreground">{mobile}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Button asChild variant="cta" className="w-full">
            <a
              href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(receiptMessage)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="size-4" /> Share Receipt on WhatsApp
            </a>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setPaymentSuccess(null);
            }}
          >
            Make another payment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div id={id} className="card-surface rounded-2xl border border-border/80 p-5 sm:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <ShieldCheck className="size-3.5" /> Instant & Secure
          </div>
          <h2 className="font-display text-xl font-bold mt-0.5">Pay Online with Razorpay</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pay booking advance or course fees instantly using UPI (GPay, PhonePe, Paytm), Cards, or
            NetBanking.
          </p>
        </div>
      </div>

      {/* Preset Amount Pills */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
          Quick Amounts
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setAmount(preset.value)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                amount === preset.value
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-input bg-background hover:bg-muted text-foreground"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid gap-3">
        <label className="grid gap-1.5 text-xs font-semibold" htmlFor={`${id}-amount`}>
          <span>Amount to Pay (₹) *</span>
          <input
            id={`${id}-amount`}
            type="number"
            inputMode="decimal"
            min="1"
            step="1"
            placeholder="Enter amount in ₹"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-semibold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </label>

        <label className="grid gap-1.5 text-xs font-semibold" htmlFor={`${id}-purpose`}>
          <span>Payment Purpose</span>
          <select
            id={`${id}-purpose`}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option>Booking advance</option>
            <option>Lesson fees</option>
            <option>Full Course fee</option>
            <option>Driving License fee</option>
          </select>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="grid gap-1.5 text-xs font-semibold" htmlFor={`${id}-name`}>
            <span>Learner Name *</span>
            <input
              id={`${id}-name`}
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-xs font-semibold" htmlFor={`${id}-mobile`}>
            <span>Mobile Number *</span>
            <input
              id={`${id}-mobile`}
              type="tel"
              placeholder="10-digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </label>
        </div>

        <label className="grid gap-1.5 text-xs font-semibold" htmlFor={`${id}-email`}>
          <span>Email ID (Optional, for instant receipt)</span>
          <input
            id={`${id}-email`}
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </label>
      </div>

      {/* Razorpay Pay Button */}
      <Button
        type="button"
        variant="cta"
        size="lg"
        disabled={paying || !validAmount}
        onClick={handlePay}
        className="w-full shadow-md"
      >
        {paying ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Processing Razorpay…
          </>
        ) : (
          <>
            <CreditCard className="size-4" /> Pay ₹
            {validAmount ? numAmount.toLocaleString("en-IN") : "0"} with Razorpay
          </>
        )}
      </Button>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <ShieldCheck className="size-3.5 text-emerald-600" /> 256-bit SSL Secure
        </span>
        <span>•</span>
        <span>UPI / Cards / NetBanking</span>
        <span>•</span>
        <span className="font-semibold text-foreground/80">Powered by Razorpay</span>
      </div>
    </div>
  );
}
