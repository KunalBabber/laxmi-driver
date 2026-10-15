import { useState } from "react";
import { CheckCircle2, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site, telHref } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { LessonPayment } from "./LessonPayment";

export type BookingValues = {
  fullName: string;
  mobile: string;
  email: string;
  vehicleType: "" | "Car" | "Bike" | "Scooter" | "Auto";
  experience: "" | "Beginner" | "Intermediate" | "Advanced";
  date: string;
  time: string;
  message: string;
  paymentChoice: "Pay after confirmation" | "Razorpay" | "Cash" | string;
};

type Errors = Partial<Record<keyof BookingValues, string>>;

const emptyValues: BookingValues = {
  fullName: "",
  mobile: "",
  email: "",
  vehicleType: "",
  experience: "",
  date: "",
  time: "",
  message: "",
  paymentChoice: "Razorpay",
};

function validate(v: BookingValues): Errors {
  const e: Errors = {};
  if (v.fullName.trim().length < 3) e.fullName = "Please enter your full name.";
  if (!/^[6-9]\d{9}$/.test(v.mobile.replace(/\D/g, "").slice(-10)))
    e.mobile = "Enter a valid 10-digit Indian mobile number.";
  if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim()))
    e.email = "Enter a valid e-mail ID, for example name@gmail.com.";
  if (!v.vehicleType) e.vehicleType = "Please choose Car, Auto, Bike or Scooter.";
  if (!v.experience) e.experience = "Please choose your experience level.";
  if (!v.date) e.date = "Please choose a preferred date.";
  else if (new Date(v.date + "T23:59:59") < new Date(new Date().toDateString()))
    e.date = "Please choose today or a future date.";
  if (!v.time) e.time = "Please choose a preferred time.";
  return e;
}

async function submitBooking(values: BookingValues): Promise<void> {
  const { error } = await supabase.from("lesson_bookings").insert({
    full_name: values.fullName.trim(),
    mobile: values.mobile.trim(),
    email: values.email.trim() || "",
    vehicle_type: values.vehicleType,
    experience: values.experience,
    preferred_date: values.date,
    preferred_time: values.time,
    message: values.message.trim() || null,
    payment_choice: values.paymentChoice,
  });
  if (error) throw error;
}

const fieldClass =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/30";

export function BookingForm({ defaultVehicle }: { defaultVehicle?: BookingValues["vehicleType"] }) {
  const [values, setValues] = useState<BookingValues>({
    ...emptyValues,
    vehicleType: defaultVehicle ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [submitError, setSubmitError] = useState("");
  const [bookingRef, setBookingRef] = useState("");
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof BookingValues>(key: K, value: BookingValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = document.querySelector<HTMLElement>("[data-invalid='true']");
      first?.focus();
      return;
    }
    setStatus("sending");
    setSubmitError("");
    try {
      await submitBooking(values);
      const generatedRef = "LDT-BK-" + Math.floor(100000 + Math.random() * 900000);
      setBookingRef(generatedRef);
      setStatus("done");
    } catch {
      setSubmitError("Your request could not be saved. Please try again or call us.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    const confirmationText = `🚗 *LAXMI DRIVING TRAINING - BOOKING CONFIRMATION*\n\nHello *${values.fullName}*!\nYour driving lesson enquiry has been confirmed.\n\n📌 *Booking Details:*\n• Booking Ref: ${bookingRef}\n• Vehicle: ${values.vehicleType} Training\n• Experience Level: ${values.experience}\n• Preferred Date: ${values.date}\n• Preferred Time: ${values.time}\n• Contact Mobile: ${values.mobile}\n• Payment Option: ${values.paymentChoice}\n\n📞 Our instructor will call you shortly on ${values.mobile} to confirm batch & pickup.\nHelpline: ${site.phoneDisplay}`;

    const handleCopy = () => {
      navigator.clipboard.writeText(confirmationText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    };

    return (
      <div
        role="status"
        aria-live="polite"
        className="card-surface animate-fade-up flex flex-col items-center gap-5 p-6 sm:p-8 text-center"
      >
        <span className="grid size-16 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-9" aria-hidden="true" />
        </span>

        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            ✓ Booking Received & Confirmed
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold mt-2 text-foreground">
            Thank you, {values.fullName}!
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Booking Reference ID: <strong className="font-mono text-primary font-bold">{bookingRef}</strong>
          </p>
        </div>

        {/* Customer Reply Message Box */}
        <div className="w-full text-left rounded-2xl border-2 border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-primary/10 pb-2">
            <span className="flex items-center gap-2 text-xs sm:text-sm font-bold text-primary">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Confirmation Reply Message
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {copied ? "✓ Copied!" : "Copy message"}
            </button>
          </div>

          <div className="space-y-1.5 text-xs sm:text-sm text-foreground/90 font-mono bg-background/80 rounded-xl p-3 border border-border">
            <p className="font-bold text-primary">Dear {values.fullName},</p>
            <p>Your request for <strong className="text-foreground">{values.vehicleType}</strong> training on <strong className="text-foreground">{values.date}</strong> at <strong className="text-foreground">{values.time}</strong> is confirmed.</p>
            <p className="text-muted-foreground text-[11px] sm:text-xs">
              Our training instructor will call you on <strong>{values.mobile}</strong> to confirm your first class & pickup point.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild variant="cta" size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
              <a
                href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(confirmationText)}`}
                target="_blank"
                rel="noreferrer"
              >
                Send Confirmation to WhatsApp
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="border-primary/40 text-primary"
            >
              {copied ? "✓ Copied to Clipboard" : "Copy Reply Slip"}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 w-full">
          <Button asChild variant="cta" className="flex-1 min-w-[200px]">
            <a href={telHref}>
              <Phone aria-hidden="true" className="size-4" /> Call {site.phoneDisplay}
            </a>
          </Button>
          <Button
            variant="outline"
            className="flex-1 min-w-[200px]"
            onClick={() => {
              setValues({ ...emptyValues, vehicleType: defaultVehicle ?? "" });
              setStatus("idle");
            }}
          >
            Book another lesson
          </Button>
        </div>

        <div className="w-full text-left mt-4 border-t pt-6">
          <LessonPayment
            id="booking-success-payment"
            learnerName={values.fullName}
            mobile={values.mobile}
            email={values.email}
          />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card-surface grid gap-5 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full Name" htmlFor="fullName" error={errors.fullName} required>
          <input
            id="fullName"
            name="fullName"
            className={fieldClass}
            placeholder="Your full name"
            autoComplete="name"
            value={values.fullName}
            data-invalid={Boolean(errors.fullName)}
            onChange={(e) => set("fullName", e.target.value)}
          />
        </Field>

        <Field label="Mobile Number" htmlFor="mobile" error={errors.mobile} required>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            inputMode="numeric"
            className={fieldClass}
            placeholder="10-digit mobile number"
            autoComplete="tel"
            value={values.mobile}
            data-invalid={Boolean(errors.mobile)}
            onChange={(e) => set("mobile", e.target.value)}
          />
        </Field>

        <Field label="E-mail ID (Optional)" htmlFor="email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            className={fieldClass}
            placeholder="name@example.com"
            autoComplete="email"
            value={values.email}
            data-invalid={Boolean(errors.email)}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>

        <Field label="Vehicle Type" htmlFor="vehicleType" error={errors.vehicleType} required>
          <select
            id="vehicleType"
            name="vehicleType"
            className={fieldClass}
            value={values.vehicleType}
            data-invalid={Boolean(errors.vehicleType)}
            onChange={(e) => set("vehicleType", e.target.value as BookingValues["vehicleType"])}
          >
            <option value="">Select vehicle</option>
            <option value="Car">Car</option>
            <option value="Auto">Auto</option>
            <option value="Bike">Bike</option>
            <option value="Scooter">Scooter</option>
          </select>
        </Field>

        <Field label="Experience Level" htmlFor="experience" error={errors.experience} required>
          <select
            id="experience"
            name="experience"
            className={fieldClass}
            value={values.experience}
            data-invalid={Boolean(errors.experience)}
            onChange={(e) => set("experience", e.target.value as BookingValues["experience"])}
          >
            <option value="">Select level</option>
            <option value="Beginner">Beginner — never driven before</option>
            <option value="Intermediate">Intermediate — some practice</option>
            <option value="Advanced">Advanced — need polishing</option>
          </select>
        </Field>

        <Field label="Preferred Date" htmlFor="date" error={errors.date} required>
          <input
            id="date"
            name="date"
            type="date"
            className={fieldClass}
            value={values.date}
            data-invalid={Boolean(errors.date)}
            onChange={(e) => set("date", e.target.value)}
          />
        </Field>

        <Field label="Preferred Time" htmlFor="time" error={errors.time} required>
          <input
            id="time"
            name="time"
            type="time"
            className={fieldClass}
            value={values.time}
            data-invalid={Boolean(errors.time)}
            onChange={(e) => set("time", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Message" htmlFor="message" error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={4}
          className={`${fieldClass} h-auto py-3`}
          placeholder="Anything you want to tell us — pick-up area, lady instructor request, etc."
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
        />
      </Field>

      <Field label="Payment preference" htmlFor="paymentChoice">
        <select
          id="paymentChoice"
          name="paymentChoice"
          className={fieldClass}
          value={values.paymentChoice}
          onChange={(e) => set("paymentChoice", e.target.value as BookingValues["paymentChoice"])}
        >
          <option value="Razorpay">Pay Online via Razorpay (UPI, Card, NetBanking)</option>
          <option value="Pay after confirmation">Decide after confirmation call</option>
          <option value="Cash">Cash at office</option>
        </select>
      </Field>

      {values.paymentChoice === "Razorpay" && (
        <LessonPayment
          id="booking-razorpay-payment"
          learnerName={values.fullName}
          mobile={values.mobile}
          email={values.email}
        />
      )}
      {submitError && (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      )}
      <Button type="submit" variant="cta" size="xl" disabled={status === "sending"}>
        {status === "sending" ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" /> Sending your request…
          </>
        ) : (
          "Book Your Lesson"
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Sending this form registers your enquiry. Online payments are securely processed by Razorpay
        with instant receipt.
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  required?: boolean | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-foreground">
        {label}
        {required && (
          <span className="text-accent" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
