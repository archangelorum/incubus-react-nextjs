'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useRouter, usePathname } from '@/i18n/navigation';

interface SortSelectProps {
  currentSort: string;
  currentOrder: string;
}

export function SortSelect({ currentSort, currentOrder }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSort, newOrder] = e.target.value.split('-');
    const url = new URL(window.location.href);
    url.searchParams.set('sort', newSort);
    url.searchParams.set('order', newOrder);
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
        <option value="createdAt-desc">Newest First</option>
        <option value="createdAt-asc">Oldest First</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </div>
  );
}