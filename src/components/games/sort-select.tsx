'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';

interface SortSelectProps {
  currentSort: string;
  currentOrder: string;
}

export function SortSelect({ currentSort, currentOrder }: SortSelectProps) {
  const router = useRouter();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSort, newOrder] = e.target.value.split('-');
    const url = new URL(window.location.href);
    url.searchParams.set('sort', newSort);
    url.searchParams.set('order', newOrder);
    
    // Use router.push instead of directly changing window.location for better performance
    router.push(url.toString());
  };

  return (
    <div className="flex items-center">
      <SlidersHorizontal className="w-4 h-4 mr-2" />
      <select
        className="bg-transparent text-sm border-none focus:outline-none focus:ring-0"
        defaultValue={`${currentSort}-${currentOrder}`}
        onChange={handleSortChange}
      >
        <option value="releaseDate-desc">Newest First</option>
        <option value="releaseDate-asc">Oldest First</option>
        <option value="basePrice-asc">Price: Low to High</option>
        <option value="basePrice-desc">Price: High to Low</option>
        <option value="title-asc">Title: A to Z</option>
        <option value="title-desc">Title: Z to A</option>
        <option value="popularity-desc">Most Popular</option>
      </select>
    </div>
  );
}