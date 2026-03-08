'use client';

import { FormattedText } from '@/components/FormattedText';
import type { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  onBook?: (service: Service) => void;
}

export default function ServiceCard({ service, onBook }: ServiceCardProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-MA", {
      style: "currency",
      currency: "MAD",
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{service.name}</h4>
          {service.description && (
            <p className="text-sm text-gray-500 mt-1">
              <FormattedText text={service.description} as="span" />
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(service.duration)}
            </span>
          </div>
        </div>

        <div className="text-right ml-4">
          <p className="text-lg font-semibold text-gray-900">
            {formatPrice(service.price)}
          </p>
          {onBook && (
            <button
              onClick={() => onBook(service)}
              className="mt-2 bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Book
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
