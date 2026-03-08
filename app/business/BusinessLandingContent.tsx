"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Calendar,
  TrendingUp,
  Users,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: Users,
    title: "Reach more diners",
    description:
      "Get discovered by people searching for restaurants in your city. Show up when it matters.",
  },
  {
    icon: Calendar,
    title: "Manage reservations",
    description:
      "One calendar for all your bookings. Confirm, reschedule, or cancel with ease.",
  },
  {
    icon: TrendingUp,
    title: "Fill more tables",
    description:
      "Reduce no-shows and empty seats. Diners book in seconds, you stay in control.",
  },
  {
    icon: BarChart3,
    title: "Grow your business",
    description:
      "See what works. Track bookings, peak times, and popular dishes.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your restaurant profile",
    description: "Add your restaurant name, location, opening hours, and cuisine type. It takes a few minutes.",
  },
  {
    number: "02",
    title: "Set your tables & availability",
    description: "Define how many tables you have and when you accept reservations.",
  },
  {
    number: "03",
    title: "Start receiving bookings",
    description: "Diners find you on Vazivo and book instantly. You get notified and confirm in one click.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "to get started",
    features: [
      "Restaurant profile & menu",
      "Up to 20 reservations/month",
      "Basic availability calendar",
      "Email support",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "On request",
    period: "tailored to your size",
    features: [
      "Everything in Starter",
      "Unlimited reservations",
      "Table management",
      "Priority support",
      "Analytics & insights",
    ],
    cta: "Contact sales",
    highlighted: true,
  },
];

const testimonials = [
  {
    quote: "We filled 40% more tables in the first two months. Vazivo brings us diners we wouldn't have reached otherwise.",
    author: "Chef Youssef",
    role: "Restaurant owner, Casablanca",
  },
  {
    quote: "Simple to use, and our team actually checks it. No more missed reservations or double bookings.",
    author: "Samira M.",
    role: "Manager, Marrakech",
  },
];

export function BusinessLandingContent() {
  return (
    <div className="min-h-screen bg-vazivo-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-vazivo-lightGray">
        <div className="absolute inset-0 bg-gradient-to-br from-vazivo-red/5 via-transparent to-vazivo-lightGray/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-vazivo-red/10 border border-vazivo-red/20 mb-6"
            >
              <UtensilsCrossed className="h-4 w-4 text-vazivo-red" />
              <span className="text-sm font-medium text-vazivo-red">For restaurants</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-vazivo-charcoal mb-6 leading-tight"
            >
              Fill more tables with{" "}
              <span className="text-vazivo-red">Vazivo</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-lg sm:text-xl text-vazivo-warmMuted mb-8 max-w-2xl"
            >
              Join the platform where diners discover and book restaurants. Get more reservations, manage your calendar, and grow your business.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/business/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-vazivo-red hover:bg-vazivo-redLight text-vazivo-white font-semibold"
                >
                  List your restaurant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/search">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-vazivo-lightGray hover:border-vazivo-red/40 hover:text-vazivo-red hover:bg-vazivo-red/5"
                >
                  See how diners find restaurants
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-6 mt-8 text-sm text-vazivo-warmMuted"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>No long-term contract</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 border-b border-vazivo-lightGray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-vazivo-charcoal mb-4">
              Everything you need to fill more seats
            </h2>
            <p className="text-lg text-vazivo-warmMuted max-w-2xl mx-auto">
              Tools built for restaurants, not generic booking systems.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-vazivo-white rounded-2xl p-6 border border-vazivo-lightGray hover:border-vazivo-red/30 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-vazivo-red/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-vazivo-red" />
                  </div>
                  <h3 className="text-lg font-semibold text-vazivo-charcoal mb-2">{item.title}</h3>
                  <p className="text-vazivo-warmMuted text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-vazivo-lightGray/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-vazivo-charcoal mb-4">
              How it works
            </h2>
            <p className="text-lg text-vazivo-warmMuted">
              From signup to your first reservation in three steps.
            </p>
          </div>
          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-vazivo-red text-vazivo-white flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-semibold text-vazivo-charcoal mb-2">{step.title}</h3>
                  <p className="text-vazivo-warmMuted leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/business/signup">
              <Button className="bg-vazivo-red hover:bg-vazivo-redLight text-vazivo-white">
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-24 border-b border-vazivo-lightGray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-vazivo-charcoal mb-4">
              Simple pricing for restaurants
            </h2>
            <p className="text-lg text-vazivo-warmMuted max-w-2xl mx-auto">
              Start free. Upgrade when you're ready to grow.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`rounded-2xl border p-8 ${
                  plan.highlighted
                    ? "border-vazivo-red bg-vazivo-red/5 shadow-lg"
                    : "border-vazivo-lightGray bg-vazivo-white"
                }`}
              >
                <h3 className="text-xl font-semibold text-vazivo-charcoal mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-vazivo-charcoal">{plan.price}</span>
                  <span className="text-vazivo-warmMuted">{plan.period}</span>
                </div>
                <ul className="space-y-3 mt-6 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-vazivo-charcoal">
                      <CheckCircle2 className="h-4 w-4 text-vazivo-red flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.highlighted ? "/business/signup" : "/business/signup"}>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-vazivo-lightGray/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-vazivo-charcoal mb-4">
              Trusted by restaurants
            </h2>
            <p className="text-lg text-vazivo-warmMuted">
              See what restaurant owners say about Vazivo.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-vazivo-white rounded-2xl p-8 border border-vazivo-lightGray"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-vazivo-charcoal mb-4 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <footer>
                  <p className="font-semibold text-vazivo-charcoal">{t.author}</p>
                  <p className="text-sm text-vazivo-warmMuted">{t.role}</p>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-vazivo-red">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-vazivo-white mb-4">
              Ready to fill more tables?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join Vazivo and start receiving reservations from diners in your city.
            </p>
            <Link href="/business/signup">
              <Button
                size="lg"
                className="bg-vazivo-white text-vazivo-red hover:bg-vazivo-lightGray text-lg px-8 py-6 h-auto"
              >
                List your restaurant
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <p className="text-white/80 text-sm mt-6">
              Free to join · No credit card required · Support in your language
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
