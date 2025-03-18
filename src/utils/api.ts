/**
 * API utility functions for making requests to the backend
 * 
 * This module provides a set of typed functions for interacting with the API endpoints,
 * handling common patterns like error handling, loading states, and response parsing.
 */

import { ApiResponse } from "@/app/api/types";

/**
 * Generic fetch function with error handling
 * @param url - The API endpoint URL
 * @param options - Fetch options
 * @returns The parsed response data
 * @throws Error if the request fails or returns an error response
 */
export async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  console.log(`[DEBUG] Fetching API: ${url}`, options);
  try {
    console.log(`[DEBUG] Starting fetch to: ${url}`);
    const response = await fetch(url, options);
    console.log(`[DEBUG] Fetch response status: ${response.status}`);
    
    if (!response.ok) {
      // Try to parse error message from response
      try {
        const errorData = await response.json() as ApiResponse<any>;
        console.log(`[DEBUG] Error response data:`, errorData);
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      } catch (e) {
        // If parsing fails, throw generic error
        console.log(`[DEBUG] Failed to parse error response:`, e);
        throw new Error(`Request failed with status ${response.status}`);
      }
    }
    
    console.log(`[DEBUG] Parsing response body`);
    const data = await response.json() as ApiResponse<T>;
    console.log(`[DEBUG] Response data:`, data);
    
    if (!data.success) {
      console.log(`[DEBUG] API returned success: false`);
      throw new Error(data.error || 'Unknown error occurred');
    }
    
    return data.data as T;
  } catch (error) {
    console.error('[DEBUG] API request failed:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('[DEBUG] This appears to be a network connectivity issue');
    }
    throw error;
  }
}

/**
 * Generic function to handle API mutations (POST, PUT, DELETE)
 * @param url - The API endpoint URL
 * @param method - The HTTP method
 * @param data - The request body data
 * @returns The parsed response data
 */
export async function mutateApi<T, D = any>(
  url: string, 
  method: 'POST' | 'PUT' | 'DELETE', 
  data?: D
): Promise<T> {
  return fetchApi<T>(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

// Games API
export const GamesApi = {
  /**
   * Get all games with pagination and filtering
   */
  getGames: async (page = 1, pageSize = 10, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }
    
    return fetchApi<{
      data: Array<{
        id: number;
        title: string;
        price: number;
        discountPrice: number | null;
        releaseDate: string;
        description: string;
        publisher: {
          id: number;
          name: string;
        };
      }>;
      pagination: {
        page: number;
        pageSize: number;
        total: number;
      };
    }>(`/api/games?${params.toString()}`);
  },
  
  /**
   * Get a specific game by ID
   */
  getGame: async (id: number) => {
    return fetchApi<{
      id: number;
      title: string;
      price: number;
      discountPrice: number | null;
      releaseDate: string;
      description: string;
      publisher: {
        id: number;
        name: string;
      };
      gameGenres: Array<{
        genre: {
          id: number;
          name: string;
        };
      }>;
      reviews: Array<{
        id: number;
        rating: number;
        comment: string | null;
        createdAt: string;
        player: {
          userId: string;
          user: {
            name: string | null;
            image: string | null;
          };
        };
      }>;
    }>(`/api/games/${id}`);
  },
  
  /**
   * Create a new game
   */
  createGame: async (data: {
    title: string;
    publisherId: number;
    releaseDate: Date;
    price: number;
    description: string;
    genreIds?: number[];
  }) => {
    return mutateApi<{
      id: number;
      title: string;
    }, typeof data>('/api/games', 'POST', data);
  },
  
  /**
   * Update an existing game
   */
  updateGame: async (id: number, data: {
    title?: string;
    publisherId?: number;
    releaseDate?: Date;
    price?: number;
    discountPrice?: number | null;
    description?: string;
    genreIds?: number[];
  }) => {
    return mutateApi<{
      id: number;
      title: string;
    }, typeof data>(`/api/games/${id}`, 'PUT', data);
  },
  
  /**
   * Delete a game
   */
  deleteGame: async (id: number) => {
    return mutateApi<{ message: string }>(`/api/games/${id}`, 'DELETE');
  },
  
  /**
   * Get reviews for a game
   */
  getGameReviews: async (gameId: number) => {
    return fetchApi<Array<{
      id: number;
      rating: number;
      comment: string | null;
      createdAt: string;
      player: {
        userId: string;
        user: {
          name: string | null;
          image: string | null;
        };
      };
    }>>(`/api/games/${gameId}/reviews`);
  },
  
  /**
   * Add a review to a game
   */
  addGameReview: async (gameId: number, data: {
    rating: number;
    comment?: string;
  }) => {
    return mutateApi<{
      id: number;
      rating: number;
      comment: string | null;
    }, typeof data>(`/api/games/${gameId}/reviews`, 'POST', data);
  },
};

// Publishers API
export const PublishersApi = {
  /**
   * Get all publishers with pagination and filtering
   */
  getPublishers: async (page = 1, pageSize = 10, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }
    
    return fetchApi<{
      data: Array<{
        id: number;
        name: string;
        contactInfo: string | null;
        _count: {
          games: number;
        };
      }>;
      pagination: {
        page: number;
        pageSize: number;
        total: number;
      };
    }>(`/api/publishers?${params.toString()}`);
  },
  
  /**
   * Get a specific publisher by ID
   */
  getPublisher: async (id: number) => {
    return fetchApi<{
      id: number;
      name: string;
      contactInfo: string | null;
      games: Array<{
        id: number;
        title: string;
        releaseDate: string;
        price: number;
        discountPrice: number | null;
      }>;
      PublisherStaff: Array<{
        userId: string;
        role: string;
        user: {
          name: string | null;
          email: string;
          image: string | null;
        };
      }>;
    }>(`/api/publishers/${id}`);
  },
  
  /**
   * Create a new publisher
   */
  createPublisher: async (data: {
    name: string;
    contactInfo?: string;
  }) => {
    return mutateApi<{
      id: number;
      name: string;
    }, typeof data>('/api/publishers', 'POST', data);
  },
  
  /**
   * Update an existing publisher
   */
  updatePublisher: async (id: number, data: {
    name?: string;
    contactInfo?: string;
  }) => {
    return mutateApi<{
      id: number;
      name: string;
    }, typeof data>(`/api/publishers/${id}`, 'PUT', data);
  },
  
  /**
   * Delete a publisher
   */
  deletePublisher: async (id: number) => {
    return mutateApi<{ message: string }>(`/api/publishers/${id}`, 'DELETE');
  },
  
  /**
   * Get staff for a publisher
   */
  getPublisherStaff: async (publisherId: number, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    return fetchApi<{
      staff: Array<{
        userId: string;
        role: string;
        user: {
          id: string;
          name: string | null;
          email: string;
          image: string | null;
        };
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
      };
    }>(`/api/publishers/${publisherId}/staff?${params.toString()}`);
  },
  
  /**
   * Add staff to a publisher
   */
  addPublisherStaff: async (publisherId: number, data: {
    email: string;
    name: string;
    role: string;
  }) => {
    return mutateApi<{
      userId: string;
      role: string;
      user: {
        id: string;
        name: string | null;
        email: string;
      };
    }, typeof data>(`/api/publishers/${publisherId}/staff`, 'POST', data);
  },
  
  /**
   * Remove staff from a publisher
   */
  removePublisherStaff: async (publisherId: number, staffUserId: string) => {
    return mutateApi<{ message: string }, { staffUserId: string }>(
      `/api/publishers/${publisherId}/staff`,
      'DELETE',
      { staffUserId }
    );
  },
};

// Players API
export const PlayersApi = {
  /**
   * Get all players with pagination and filtering
   */
  getPlayers: async (page = 1, limit = 10, search?: string, type?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }
    
    if (type) {
      params.append('type', type);
    }
    
    return fetchApi<{
      players: Array<{
        userId: string;
        type: string;
        user: {
          id: string;
          name: string | null;
          email: string;
          image: string | null;
          createdAt: string;
        };
        _count: {
          reviews: number;
          playerGames: number;
        };
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
      };
    }>(`/api/players?${params.toString()}`);
  },
  
  /**
   * Get a specific player by ID
   */
  getPlayer: async (playerId: string) => {
    return fetchApi<{
      userId: string;
      type: string;
      user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
        createdAt: string;
      };
      playerGames: Array<{
        gameId: number;
        owned: boolean;
        game: {
          id: number;
          title: string;
          releaseDate: string;
          price: number;
          discountPrice: number | null;
          publisher: {
            id: number;
            name: string;
          };
        };
      }>;
      reviews: Array<{
        id: number;
        rating: number;
        comment: string | null;
        createdAt: string;
        game: {
          id: number;
          title: string;
        };
      }>;
    }>(`/api/players/${playerId}`);
  },
  
  /**
   * Update a player
   */
  updatePlayer: async (playerId: string, data: {
    type?: string;
  }) => {
    return mutateApi<{
      userId: string;
      type: string;
    }, typeof data>(`/api/players/${playerId}`, 'PUT', data);
  },
  
  /**
   * Delete a player
   */
  deletePlayer: async (playerId: string, deleteUser = false) => {
    const params = new URLSearchParams();
    if (deleteUser) {
      params.append('deleteUser', 'true');
    }
    
    return mutateApi<{ message: string }>(
      `/api/players/${playerId}?${params.toString()}`,
      'DELETE'
    );
  },
  
  /**
   * Get player's games
   */
  getPlayerGames: async (playerId: string, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    return fetchApi<{
      playerGames: Array<{
        gameId: number;
        owned: boolean;
        game: {
          id: number;
          title: string;
          price: number;
          publisher: {
            id: number;
            name: string;
          };
          gameGenres: Array<{
            genre: {
              id: number;
              name: string;
            };
          }>;
        };
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
      };
    }>(`/api/players/${playerId}/games?${params.toString()}`);
  },
  
  /**
   * Add a game to player's library
   */
  addPlayerGame: async (playerId: string, data: {
    gameId: number;
    owned?: boolean;
  }) => {
    return mutateApi<{
      playerGame: {
        playerId: string;
        gameId: number;
        owned: boolean;
      };
      message: string;
    }, typeof data>(`/api/players/${playerId}/games`, 'POST', data);
  },
  
  /**
   * Remove a game from player's library
   */
  removePlayerGame: async (playerId: string, gameId: number) => {
    return mutateApi<{ message: string }, { gameId: number }>(
      `/api/players/${playerId}/games`,
      'DELETE',
      { gameId }
    );
  },
};

// Genres API
export const GenresApi = {
  /**
   * Get all genres
   */
  getGenres: async (search?: string) => {
    const params = new URLSearchParams();
    
    if (search) {
      params.append('search', search);
    }
    
    return fetchApi<Array<{
      id: number;
      name: string;
      _count: {
        gameGenres: number;
      };
    }>>(`/api/genres?${params.toString()}`);
  },
  
  /**
   * Get a specific genre by ID
   */
  getGenre: async (id: number) => {
    return fetchApi<{
      id: number;
      name: string;
      gameGenres: Array<{
        game: {
          id: number;
          title: string;
          publisher: {
            id: number;
            name: string;
          };
        };
      }>;
    }>(`/api/genres/${id}`);
  },
  
  /**
   * Create a new genre
   */
  createGenre: async (data: {
    name: string;
  }) => {
    return mutateApi<{
      id: number;
      name: string;
    }, typeof data>('/api/genres', 'POST', data);
  },
  
  /**
   * Update an existing genre
   */
  updateGenre: async (id: number, data: {
    name: string;
  }) => {
    return mutateApi<{
      id: number;
      name: string;
    }, typeof data>(`/api/genres/${id}`, 'PUT', data);
  },
  
  /**
   * Delete a genre
   */
  deleteGenre: async (id: number) => {
    return mutateApi<{ message: string }>(`/api/genres/${id}`, 'DELETE');
  },
};

// Bundles API
export const BundlesApi = {
  /**
   * Get all bundles with pagination and filtering
   */
  getBundles: async (page = 1, pageSize = 10, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }
    
    return fetchApi<{
      data: Array<{
        id: number;
        title: string;
        discountPrice: number | null;
        bundleGames: Array<{
          game: {
            id: number;
            title: string;
            price: number;
            publisher: {
              id: number;
              name: string;
            };
          };
        }>;
        pricing: {
          totalOriginalPrice: number;
          savings: number;
          savingsPercentage: number;
        };
      }>;
      pagination: {
        page: number;
        pageSize: number;
        total: number;
      };
    }>(`/api/bundles?${params.toString()}`);
  },
  
  /**
   * Get a specific bundle by ID
   */
  getBundle: async (id: number) => {
    return fetchApi<{
      id: number;
      title: string;
      discountPrice: number | null;
      bundleGames: Array<{
        game: {
          id: number;
          title: string;
          price: number;
          publisher: {
            id: number;
            name: string;
          };
          gameGenres: Array<{
            genre: {
              id: number;
              name: string;
            };
          }>;
        };
      }>;
      pricing: {
        totalOriginalPrice: number;
        savings: number;
        savingsPercentage: number;
      };
    }>(`/api/bundles/${id}`);
  },
  
  /**
   * Create a new bundle
   */
  createBundle: async (data: {
    title: string;
    discountPrice?: number;
    gameIds: number[];
  }) => {
    return mutateApi<{
      id: number;
      title: string;
      discountPrice: number | null;
      bundleGames: Array<{
        game: {
          id: number;
          title: string;
        };
      }>;
      pricing: {
        totalOriginalPrice: number;
        savings: number;
        savingsPercentage: number;
      };
    }, typeof data>('/api/bundles', 'POST', data);
  },
  
  /**
   * Update an existing bundle
   */
  updateBundle: async (id: number, data: {
    title?: string;
    discountPrice?: number | null;
    gameIds?: number[];
  }) => {
    return mutateApi<{
      id: number;
      title: string;
      discountPrice: number | null;
      bundleGames: Array<{
        game: {
          id: number;
          title: string;
        };
      }>;
      pricing: {
        totalOriginalPrice: number;
        savings: number;
        savingsPercentage: number;
      };
    }, typeof data>(`/api/bundles/${id}`, 'PUT', data);
  },
  
  /**
   * Delete a bundle
   */
  deleteBundle: async (id: number) => {
    return mutateApi<{ message: string }>(`/api/bundles/${id}`, 'DELETE');
  },
};