"use client";

import { motion } from "framer-motion";
import { Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormattedText } from "@/components/FormattedText";
import { formatPrice, formatDuration } from "@/lib/utils";
import type { Service } from "@/types";

interface ServiceListItemProps {
  service: Service;
  onBook: (service: Service) => void;
  index?: number;
}

export default function ServiceListItem({ service, onBook, index = 0 }: ServiceListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start justify-between p-4 bg-white rounded-2xl border border-neutral-100 hover:border-primary-200 hover:shadow-soft transition-all group"
    >
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
          {service.name}
        </h4>
        {service.description && (
          <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
            <FormattedText text={service.description} as="span" />
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 text-sm text-neutral-500">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDuration(service.duration)}
          </span>
        </div>
      </div>
      <div className="text-right ml-4 flex-shrink-0">
        <p className="text-lg font-bold text-neutral-900">
          {formatPrice(service.price)}
        </p>
        <Button
          size="sm"
          className="mt-2"
          onClick={() => onBook(service)}
        >
          Book
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// Grouped service list by category
interface ServiceListProps {
  services: Service[];
  onBook: (service: Service) => void;
}

export function ServiceList({ services, onBook }: ServiceListProps) {
  return (
    <div className="space-y-3">
      {services.map((service, index) => (
        <ServiceListItem
          key={service.id}
          service={service}
          onBook={onBook}
          index={index}
        />
      ))}
    </div>
  );
}
