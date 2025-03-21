# API Documentation

This document provides an overview of the RESTful API endpoints implemented in this project. All endpoints enforce proper authentication using better-auth with admin and organization plugins, implement role-based access control (RBAC), include input validation, response formatting, and appropriate HTTP status codes.

## Authentication

All protected endpoints require authentication using the better-auth library. Authentication is enforced through middleware in the `src/app/api/utils/auth.ts` file.

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    },
    ...
  }
}
```

For errors:

```json
{
  "success": false,
  "error": "Error message"
}
```

## User Endpoints

### GET /api/users
- **Description**: Retrieves a paginated list of users
- **Auth Required**: Yes (Admin only)
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `sortBy`: Field to sort by (name, email, createdAt, updatedAt, role)
  - `sortOrder`: Sort order (asc, desc)
  - `search`: Search term for name or email
  - `role`: Filter by role
  - `banned`: Filter by banned status (true/false)

### POST /api/users
- **Description**: Creates a new user
- **Auth Required**: Yes (Admin only)
- **Request Body**:
  - `name`: User's name
  - `email`: User's email
  - `emailVerified`: Whether email is verified (default: false)
  - `image`: User's profile image URL (optional)
  - `role`: User's role (optional)
  - `banned`: Whether user is banned (optional)
  - `banReason`: Reason for ban (optional)
  - `banExpires`: Ban expiration date (optional)

### GET /api/users/:id
- **Description**: Retrieves a specific user
- **Auth Required**: Yes (User or Admin)
- **Path Parameters**:
  - `id`: User ID

### PUT /api/users/:id
- **Description**: Updates a specific user
- **Auth Required**: Yes (User or Admin)
- **Path Parameters**:
  - `id`: User ID
- **Request Body**: Same as POST /api/users, all fields optional

### DELETE /api/users/:id
- **Description**: Deletes a specific user
- **Auth Required**: Yes (Admin only)
- **Path Parameters**:
  - `id`: User ID

## Organization Endpoints

### GET /api/organizations
- **Description**: Retrieves a paginated list of organizations
- **Auth Required**: Yes
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `sortBy`: Field to sort by (name, createdAt)
  - `sortOrder`: Sort order (asc, desc)
  - `search`: Search term for name or slug

### POST /api/organizations
- **Description**: Creates a new organization
- **Auth Required**: Yes
- **Request Body**:
  - `name`: Organization name
  - `slug`: Organization slug (optional, generated from name if not provided)
  - `logo`: Organization logo URL (optional)
  - `metadata`: Additional metadata (optional)

### GET /api/organizations/:id
- **Description**: Retrieves a specific organization
- **Auth Required**: Yes (Organization member or Admin)
- **Path Parameters**:
  - `id`: Organization ID

### PUT /api/organizations/:id
- **Description**: Updates a specific organization
- **Auth Required**: Yes (Organization owner or Admin)
- **Path Parameters**:
  - `id`: Organization ID
- **Request Body**: Same as POST /api/organizations, all fields optional

### DELETE /api/organizations/:id
- **Description**: Deletes a specific organization
- **Auth Required**: Yes (Organization owner or Admin)
- **Path Parameters**:
  - `id`: Organization ID

### GET /api/organizations/:id/members
- **Description**: Retrieves a paginated list of members for an organization
- **Auth Required**: Yes (Organization member)
- **Path Parameters**:
  - `id`: Organization ID
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `sortBy`: Field to sort by (createdAt, role)
  - `sortOrder`: Sort order (asc, desc)

### POST /api/organizations/:id/members
- **Description**: Adds a new member to an organization
- **Auth Required**: Yes (Organization owner)
- **Path Parameters**:
  - `id`: Organization ID
- **Request Body**:
  - `userId`: User ID to add as member
  - `role`: Member role

### PUT /api/organizations/:id/members/:memberId
- **Description**: Updates a member's role in an organization
- **Auth Required**: Yes (Organization owner)
- **Path Parameters**:
  - `id`: Organization ID
  - `memberId`: Member ID
- **Request Body**:
  - `role`: New member role

### DELETE /api/organizations/:id/members/:memberId
- **Description**: Removes a member from an organization
- **Auth Required**: Yes (Organization owner)
- **Path Parameters**:
  - `id`: Organization ID
  - `memberId`: Member ID

### GET /api/organizations/:id/invitations
- **Description**: Retrieves a paginated list of invitations for an organization
- **Auth Required**: Yes (Organization member)
- **Path Parameters**:
  - `id`: Organization ID
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `sortBy`: Field to sort by (expiresAt, status)
  - `sortOrder`: Sort order (asc, desc)
  - `status`: Filter by status

### POST /api/organizations/:id/invitations
- **Description**: Creates a new invitation for an organization
- **Auth Required**: Yes (Organization owner or admin)
- **Path Parameters**:
  - `id`: Organization ID
- **Request Body**:
  - `email`: Email to invite
  - `role`: Role to assign (optional)

### PUT /api/organizations/:id/invitations/:invitationId
- **Description**: Updates an invitation status
- **Auth Required**: Yes
- **Path Parameters**:
  - `id`: Organization ID
  - `invitationId`: Invitation ID
- **Request Body**:
  - `status`: New status (ACCEPTED, REJECTED, CANCELLED)

### DELETE /api/organizations/:id/invitations/:invitationId
- **Description**: Deletes an invitation
- **Auth Required**: Yes (Organization owner or admin)
- **Path Parameters**:
  - `id`: Organization ID
  - `invitationId`: Invitation ID

## Game Endpoints

### GET /api/games
- **Description**: Retrieves a paginated list of games
- **Auth Required**: No
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `sortBy`: Field to sort by (title, releaseDate, basePrice, createdAt)
  - `sortOrder`: Sort order (asc, desc)
  - `search`: Search term for title, description, or shortDescription
  - `publisherId`: Filter by publisher ID
  - `developerId`: Filter by developer ID
  - `genreId`: Filter by genre ID
  - `tagId`: Filter by tag ID
  - `isActive`: Filter by active status (true/false)
  - `isFeatured`: Filter by featured status (true/false)
  - `minPrice`: Filter by minimum price
  - `maxPrice`: Filter by maximum price
  - `releasedAfter`: Filter by release date after
  - `releasedBefore`: Filter by release date before

### POST /api/games
- **Description**: Creates a new game
- **Auth Required**: Yes (Publisher organization member with permissions)
- **Request Body**:
  - `title`: Game title
  - `slug`: Game slug (optional, generated from title if not provided)
  - `description`: Game description
  - `shortDescription`: Short description (optional)
  - `publisherId`: Publisher ID
  - `developerIds`: Array of developer IDs (optional)
  - `releaseDate`: Release date
  - `basePrice`: Base price
  - `discountPrice`: Discount price (optional)
  - `isActive`: Whether game is active (default: true)
  - `isFeatured`: Whether game is featured (default: false)
  - `contentRating`: Content rating (optional)
  - `systemRequirements`: System requirements (optional)
  - `tagIds`: Array of tag IDs (optional)
  - `genreIds`: Array of genre IDs (optional)
  - `coverImageId`: Cover image ID (optional)
  - `trailerVideoId`: Trailer video ID (optional)
  - `screenshotIds`: Array of screenshot IDs (optional)

### GET /api/games/:id
- **Description**: Retrieves a specific game
- **Auth Required**: No
- **Path Parameters**:
  - `id`: Game ID

### PUT /api/games/:id
- **Description**: Updates a specific game
- **Auth Required**: Yes (Publisher organization member with permissions)
- **Path Parameters**:
  - `id`: Game ID
- **Request Body**: Same as POST /api/games, all fields optional

### DELETE /api/games/:id
- **Description**: Deletes a specific game
- **Auth Required**: Yes (Publisher organization member with permissions)
- **Path Parameters**:
  - `id`: Game ID

### GET /api/games/:id/versions
- **Description**: Retrieves a paginated list of versions for a game
- **Auth Required**: No
- **Path Parameters**:
  - `id`: Game ID
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `sortBy`: Field to sort by (version, createdAt)
  - `sortOrder`: Sort order (asc, desc)
  - `isActive`: Filter by active status (true/false)

### POST /api/games/:id/versions
- **Description**: Creates a new version for a game
- **Auth Required**: Yes (Publisher organization member with permissions)
- **Path Parameters**:
  - `id`: Game ID
- **Request Body**:
  - `version`: Version number
  - `releaseNotes`: Release notes (optional)
  - `isActive`: Whether version is active (default: true)
  - `size`: Size in bytes
  - `contentHash`: Content hash
  - `contentCid`: Content CID
  - `contentFileIds`: Array of content file IDs (optional)

### GET /api/games/:id/versions/:versionId
- **Description**: Retrieves a specific game version
- **Auth Required**: No
- **Path Parameters**:
  - `id`: Game ID
  - `versionId`: Version ID

### PUT /api/games/:id/versions/:versionId
- **Description**: Updates a specific game version
- **Auth Required**: Yes (Publisher organization member with permissions)
- **Path Parameters**:
  - `id`: Game ID
  - `versionId`: Version ID
- **Request Body**:
  - `isActive`: Whether version is active
  - `releaseNotes`: Release notes

### DELETE /api/games/:id/versions/:versionId
- **Description**: Deletes a specific game version
- **Auth Required**: Yes (Publisher organization member with permissions)
- **Path Parameters**:
  - `id`: Game ID
  - `versionId`: Version ID

### GET /api/games/:id/reviews
- **Description**: Retrieves a paginated list of reviews for a game
- **Auth Required**: No
- **Path Parameters**:
  - `id`: Game ID
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `sortBy`: Field to sort by (rating, createdAt, upvotes)
  - `sortOrder`: Sort order (asc, desc)
  - `rating`: Filter by rating
  - `status`: Filter by status
  - `verified`: Filter by verified purchase status (true/false)
  - `recommended`: Filter by recommended status (true/false)

### POST /api/games/:id/reviews
- **Description**: Creates a new review for a game
- **Auth Required**: Yes
- **Path Parameters**:
  - `id`: Game ID
- **Request Body**:
  - `rating`: Rating (1-5)
  - `title`: Review title (optional)
  - `content`: Review content (optional)
  - `playTime`: Play time in minutes (optional)
  - `isRecommended`: Whether game is recommended (optional)

### GET /api/games/:id/reviews/:reviewId
- **Description**: Retrieves a specific review
- **Auth Required**: No
- **Path Parameters**:
  - `id`: Game ID
  - `reviewId`: Review ID

### PUT /api/games/:id/reviews/:reviewId
- **Description**: Updates a specific review
- **Auth Required**: Yes (Review owner or Admin)
- **Path Parameters**:
  - `id`: Game ID
  - `reviewId`: Review ID
- **Request Body**:
  - `rating`: Rating (1-5) (optional)
  - `title`: Review title (optional)
  - `content`: Review content (optional)
  - `isRecommended`: Whether game is recommended (optional)
  - `status`: Review status (Admin only, optional)

### DELETE /api/games/:id/reviews/:reviewId
- **Description**: Deletes a specific review
- **Auth Required**: Yes (Review owner or Admin)
- **Path Parameters**:
  - `id`: Game ID
  - `reviewId`: Review ID

### PATCH /api/games/:id/reviews/:reviewId/vote
- **Description**: Votes on a review
- **Auth Required**: Yes
- **Path Parameters**:
  - `id`: Game ID
  - `reviewId`: Review ID
- **Request Body**:
  - `voteType`: Vote type (upvote, downvote, remove)
  - `previousVote`: Previous vote type (for remove)

## Wallet Endpoints

### GET /api/wallets
- **Description**: Retrieves a paginated list of wallets for the authenticated user
- **Auth Required**: Yes
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `sortBy`: Field to sort by (createdAt, updatedAt, balance, label)
  - `sortOrder`: Sort order (asc, desc)
  - `blockchainId`: Filter by blockchain ID
  - `isDefault`: Filter by default status (true/false)

### POST /api/wallets
- **Description**: Creates a new wallet for the authenticated user
- **Auth Required**: Yes
- **Request Body**:
  - `blockchainId`: Blockchain ID
  - `address`: Wallet address
  - `isDefault`: Whether wallet is default (default: false)
  - `label`: Wallet label (optional)

### GET /api/wallets/:id
- **Description**: Retrieves a specific wallet
- **Auth Required**: Yes (Wallet owner)
- **Path Parameters**:
  - `id`: Wallet ID

### PUT /api/wallets/:id
- **Description**: Updates a specific wallet
- **Auth Required**: Yes (Wallet owner)
- **Path Parameters**:
  - `id`: Wallet ID
- **Request Body**:
  - `isDefault`: Whether wallet is default (optional)
  - `label`: Wallet label (optional)

### DELETE /api/wallets/:id
- **Description**: Deletes a specific wallet
- **Auth Required**: Yes (Wallet owner)
- **Path Parameters**:
  - `id`: Wallet ID

### POST /api/wallets/:id/sync
- **Description**: Syncs a wallet's balance with the blockchain
- **Auth Required**: Yes (Wallet owner)
- **Path Parameters**:
  - `id`: Wallet ID
- **Request Body**:
  - `forceSync`: Whether to force sync (default: false)

### GET /api/wallets/:id/transactions
- **Description**: Retrieves a paginated list of transactions for a wallet
- **Auth Required**: Yes (Wallet owner)
- **Path Parameters**:
  - `id`: Wallet ID
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `sortBy`: Field to sort by (timestamp, amount, fee)
  - `sortOrder`: Sort order (asc, desc)
  - `type`: Filter by transaction type
  - `status`: Filter by transaction status
  - `startDate`: Filter by start date
  - `endDate`: Filter by end date
  - `minAmount`: Filter by minimum amount
  - `maxAmount`: Filter by maximum amount

### GET /api/wallets/:id/transactions/:transactionId
- **Description**: Retrieves a specific transaction for a wallet
- **Auth Required**: Yes (Wallet owner)
- **Path Parameters**:
  - `id`: Wallet ID
  - `transactionId`: Transaction ID

## Blockchain Endpoints

### GET /api/blockchains
- **Description**: Retrieves a paginated list of blockchains
- **Auth Required**: No
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `sortBy`: Field to sort by (name, createdAt)
  - `sortOrder`: Sort order (asc, desc)
  - `isActive`: Filter by active status (true/false)
  - `isDefault`: Filter by default status (true/false)
  - `search`: Search term for name or chainId

### POST /api/blockchains
- **Description**: Creates a new blockchain
- **Auth Required**: Yes (Admin only)
- **Request Body**:
  - `name`: Blockchain name
  - `chainId`: Chain ID
  - `rpcUrl`: RPC URL
  - `explorerUrl`: Explorer URL
  - `isActive`: Whether blockchain is active (default: true)
  - `isDefault`: Whether blockchain is default (default: false)

### GET /api/blockchains/:id
- **Description**: Retrieves a specific blockchain
- **Auth Required**: No
- **Path Parameters**:
  - `id`: Blockchain ID

### PUT /api/blockchains/:id
- **Description**: Updates a specific blockchain
- **Auth Required**: Yes (Admin only)
- **Path Parameters**:
  - `id`: Blockchain ID
- **Request Body**:
  - `name`: Blockchain name (optional)
  - `rpcUrl`: RPC URL (optional)
  - `explorerUrl`: Explorer URL (optional)
  - `isActive`: Whether blockchain is active (optional)
  - `isDefault`: Whether blockchain is default (optional)

### DELETE /api/blockchains/:id
- **Description**: Deletes a specific blockchain
- **Auth Required**: Yes (Admin only)
- **Path Parameters**:
  - `id`: Blockchain ID