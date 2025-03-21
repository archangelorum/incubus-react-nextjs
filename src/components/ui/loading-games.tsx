import React from 'react';

type LoadingGamesProps = {
  count?: number;
  large?: boolean;
};

export function LoadingGames({ count = 4, large = false }: LoadingGamesProps) {
  return (
    <div className={`grid grid-cols-1 ${large ? 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-6`}>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingGameCard key={index} large={large} />
      ))}
    </div>
  );
}

function LoadingGameCard({ large = false }: { large?: boolean }) {
  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-md animate-pulse">
      <div className={`${large ? 'h-72' : 'h-48'} bg-muted`}></div>
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
        {large && <div className="h-3 bg-muted rounded w-full mt-2"></div>}
        <div className="h-3 bg-muted rounded w-1/4 mt-4"></div>
        
        {large && (
          <div className="flex space-x-2 mt-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/3"></div>
          </div>
        )}
      </div>
    </div>
  );
}