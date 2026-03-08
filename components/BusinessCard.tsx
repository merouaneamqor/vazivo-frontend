import Link from 'next/link';
import { getBusinessCityDisplay, getBusinessCategoryDisplay } from '@/lib/utils';
import type { Business } from '@/types';

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Link href={`/businesses/${business.id}`}>
      <div className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
            <p className="text-sm text-gray-500">{getBusinessCategoryDisplay(business.category)}</p>
          </div>
          <div className="flex items-center bg-primary-50 text-primary-700 px-2 py-1 rounded-lg">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium">
              {business.average_rating > 0 ? business.average_rating.toFixed(1) : 'New'}
            </span>
            {business.total_reviews > 0 && (
              <span className="text-xs text-primary-600 ml-1">
                ({business.total_reviews})
              </span>
            )}
          </div>
        </div>

        {business.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {business.description}
          </p>
        )}

        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{business.address}, {getBusinessCityDisplay(business.city)}</span>
        </div>
      </div>
    </Link>
  );
}
