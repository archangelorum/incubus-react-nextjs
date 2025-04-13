'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
  ...props
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const totalPageNumbers = siblingCount * 2 + 3; // siblings + current + first + last
    
    // If total pages is less than total page numbers, show all pages
    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Calculate left and right sibling indexes
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    
    // Show dots when there's a gap
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
    
    // Define the array of page numbers
    const pageNumbers: (number | string)[] = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Show left dots if needed
    if (shouldShowLeftDots) {
      pageNumbers.push('leftDots');
    }
    
    // Add page numbers between dots
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) {
        pageNumbers.push(i);
      }
    }
    
    // Show right dots if needed
    if (shouldShowRightDots) {
      pageNumbers.push('rightDots');
    }
    
    // Always show last page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div
      className={`flex items-center justify-center space-x-2 ${className || ''}`}
      {...props}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {pageNumbers.map((page, index) => {
        if (page === 'leftDots' || page === 'rightDots') {
          return (
            <div
              key={`dots-${index}`}
              className="flex items-center justify-center h-8 w-8"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>
          );
        }
        
        return (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="icon"
            onClick={() => onPageChange(page as number)}
            className={`h-8 w-8 ${currentPage === page ? 'animate-pulse-glow' : ''}`}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </Button>
        );
      })}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8"
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}