"use client";

import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export function FaqSection() {
  const t = useTranslations("home");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  const faqs = [
    { questionKey: "faqQuestion1", answerKey: "faqAnswer1" },
    { questionKey: "faqQuestion2", answerKey: "faqAnswer2" },
    { questionKey: "faqQuestion3", answerKey: "faqAnswer3" },
    { questionKey: "faqQuestion4", answerKey: "faqAnswer4" },
    { questionKey: "faqQuestion5", answerKey: "faqAnswer5" },
    { questionKey: "faqQuestion6", answerKey: "faqAnswer6" },
    { questionKey: "faqQuestion7", answerKey: "faqAnswer7" },
    { questionKey: "faqQuestion8", answerKey: "faqAnswer8" },
    { questionKey: "faqQuestion9", answerKey: "faqAnswer9" },
    { questionKey: "faqQuestion10", answerKey: "faqAnswer10" },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
            {t("faqTitle")}
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            {t("faqDesc")}
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs
            .slice(0, showAllFaqs ? 10 : 3)
            .map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full text-left bg-white border border-neutral-200 rounded-2xl p-6 hover:border-primary-300 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-neutral-900 text-lg">
                      {t(faq.questionKey)}
                    </h3>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-neutral-500 transition-transform flex-shrink-0",
                        openFaqIndex === index && "rotate-180"
                      )}
                    />
                  </div>
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFaqIndex === index ? "auto" : 0,
                      opacity: openFaqIndex === index ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-neutral-600 mt-4 leading-relaxed">
                      {t(faq.answerKey)}
                    </p>
                  </motion.div>
                </button>
              </motion.div>
            ))}
        </div>

        {!showAllFaqs && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-8 text-center"
          >
            <button
              onClick={() => setShowAllFaqs(true)}
              className="group inline-flex items-center px-6 py-3 rounded-full border border-neutral-200 text-neutral-700 hover:border-primary-300 hover:text-primary-600 transition-all"
            >
              {t("faqSeeMore")}
              <ChevronDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
