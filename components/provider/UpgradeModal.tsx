"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Crown,
  Calendar,
  CalendarDays,
  Layers,
  MessageCircle,
  Users,
  Image as ImageIcon,
  Check,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

const SUPPORT_WHATSAPP =
  process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "+212674016417";

const BENEFITS = [
  { icon: Calendar, key: "calendar" },
  { icon: CalendarDays, key: "bookings" },
  { icon: Layers, key: "services" },
  { icon: MessageCircle, key: "reviews" },
  { icon: Users, key: "team" },
  { icon: ImageIcon, key: "photos" },
] as const;

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const t = useTranslations("providerPremium");
  const whatsappNumber = SUPPORT_WHATSAPP.replace(/\D/g, "");

  const handleStripeCheckout = () => {
    // TODO: Integrate with Stripe Checkout
    // For now, redirect to a contact page or Stripe payment link
    const stripeLink = process.env.NEXT_PUBLIC_STRIPE_PREMIUM_LINK;
    if (stripeLink) {
      window.open(stripeLink, "_blank");
    }
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      t("whatsappMessage")
    );
    window.open(
      `https://wa.me/${whatsappNumber}?text=${message}`,
      "_blank"
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent size="lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10  bg-primary-100">
              <Crown className="h-5 w-5 text-primary-600" />
            </div>
            <DialogTitle className="text-xl font-display font-bold text-neutral-900">
              {t("modal.title")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-neutral-600">
            {t("modal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Plan Card */}
          <div className=" border-2 border-primary-200 bg-gradient-to-br from-primary-50/80 to-white p-6">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-display font-bold text-neutral-900">
                {t("modal.price")}
              </span>
              <span className="text-neutral-500 text-sm">
                {t("modal.pricePeriod")}
              </span>
            </div>

            {/* Benefits list */}
            <div className="space-y-3 mb-6">
              {BENEFITS.map(({ icon: Icon, key }) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.05 * BENEFITS.findIndex((b) => b.key === key),
                  }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100">
                    <Icon className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="text-sm text-neutral-700 font-medium">
                    {t(`modal.benefits.${key}`)}
                  </span>
                  <Check className="h-4 w-4 text-emerald-500 ml-auto" />
                </motion.div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="space-y-3">
              <Button
                size="lg"
                onClick={handleStripeCheckout}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3  group"
              >
                <Crown className="h-5 w-5 mr-2 text-amber-300" />
                {t("modal.payByCard")}
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleWhatsAppContact}
                className="w-full border-neutral-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-neutral-700 font-medium py-3 "
              >
                <MessageSquare className="h-5 w-5 mr-2 text-emerald-500" />
                {t("modal.otherPayment")}
              </Button>
            </div>
          </div>

          {/* Fine print */}
          <p className="text-xs text-neutral-400 text-center mt-4">
            {t("modal.finePrint")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
