import {
  PrismaClient,
  TransactionType,
  TransactionStatus,
  LicenseType,
  ItemType,
  ItemRarity,
  ListingType,
  ListingStatus,
  EscrowStatus,
  ReviewStatus,
  IndexStatus,
  ProposalStatus,
  ProposalType,
  VoteType,
  DisputeStatus,
  DisputeType,
  ShardStrategy,
  StorageType,
  User,
  Blockchain,
  Wallet,
  Publisher,
  Developer,
  ContentFile,
  Genre,
  Tag,
  Game,
  GameVersion,
  NFTCollection,
  GameLicense,
  GameItem,
  ItemOwnership,
  SmartContract,
  Transaction,
  Escrow,
  ShardConfig,
  CompliancePolicy,
  $Enums,
} from '@prisma/client'
import { Decimal, JsonValue } from '@prisma/client/runtime/library'
import { randomUUID } from 'crypto'

// Define enum for report types if not in Prisma client
enum ReportType {
  SALES = 'SALES',
  USER_ACTIVITY = 'USER_ACTIVITY',
  GAME_PERFORMANCE = 'GAME_PERFORMANCE',
  MARKETPLACE_ACTIVITY = 'MARKETPLACE_ACTIVITY',
  CUSTOM = 'CUSTOM'
}

// Define enum for report status if not in Prisma client
enum ReportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed process...')

  // Clean up existing data if needed
  await cleanDatabase()

  // Create sample users
  const users = await createUsers()
  
  // Create blockchains
  const blockchains = await createBlockchains()
  
  // Create wallets for users
  const wallets = await createWallets(users, blockchains)
  
  // Create publishers and developers
  const publishers = await createPublishers(users)
  const developers = await createDevelopers(users)
  
  // Create content files for games
  const contentFiles = await createContentFiles()
  
  // Create genres and tags
  const genres = await createGenres()
  const tags = await createTags()
  
  // Create games
  const games = await createGames(publishers, developers, contentFiles, genres, tags)
  
  // Create game versions
  const gameVersions = await createGameVersions(games, contentFiles)
  
  // Create NFT collections
  const nftCollections = await createNFTCollections(blockchains)
  
  // Create game licenses
  const gameLicenses = await createGameLicenses(games, wallets, nftCollections)
  
  // Create game items
  const gameItems = await createGameItems(games, contentFiles, nftCollections)
  
  // Create item ownerships
  const itemOwnerships = await createItemOwnerships(gameItems, wallets)
  
  // Create smart contracts
  const smartContracts = await createSmartContracts(blockchains)
  
  // Create transactions
  const transactions = await createTransactions(blockchains, wallets, smartContracts)
  
  // Create license transactions
  await createLicenseTransactions(gameLicenses, transactions)
  
  // Create item transactions
  await createItemTransactions(gameItems, itemOwnerships, transactions)
  
  // Create escrows
  const escrows = await createEscrows(wallets)
  
  // Create escrow transactions
  await createEscrowTransactions(escrows, transactions)
  
  // Create marketplace listings
  await createMarketplaceListings(games, gameItems, escrows)
  
  // Create game reviews
  await createGameReviews(games, users)
  
  // Create blockchain indices
  await createBlockchainIndices(blockchains)
  
  // Create governance proposals
  const proposals = await createGovernanceProposals(users)
  
  // Create proposal votes
  await createProposalVotes(proposals, users)
  
  // Create dispute cases
  await createDisputeCases(users)
  
  // Create sharding configuration
  const shardConfigs = await createShardConfigs()
  
  // Create shards
  await createShards(shardConfigs)
  
  // Create compliance policies
  const policies = await createCompliancePolicies()
  
  // Create user consents
  await createUserConsents(users, policies)
  
  // Create analytics events
  await createAnalyticsEvents(users)
  
  // Create reports
  await createReports(users)
  
  // Create audit logs
  await createAuditLogs(users)

  console.log('Seed process completed successfully!')
}

async function cleanDatabase() {
  // Delete all records in reverse order of dependencies
  console.log('Cleaning database...')
  
  // This is a simplified version - in production you would need to handle cascading deletes properly
  const tablesToClean = [
    'audit_log', 'user_consent', 'compliance_policy', 'shard', 'shard_config',
    'dispute_case', 'proposal_vote', 'governance_proposal', 'report', 'analytics_event',
    'blockchain_index', 'cache_entry', 'game_review', 'escrow_transaction', 'marketplace_listing',
    'escrow', 'item_transaction', 'game_license_transaction', 'transaction', 'smart_contract',
    'item_ownership', 'item_tag', 'game_item', 'game_license', 'nft_collection',
    'game_version', 'game_tag', 'game_genre', 'content_file', 'developer_game',
    'developer', 'publisher_wallet', 'publisher', 'game', 'tag', 'genre', 'wallet'
  ]
  
  for (const table of tablesToClean) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`)
    } catch (error) {
      console.log(`Error cleaning table ${table}: ${error}`)
    }
  }
}

async function createUsers() {
  console.log('Creating users...')
  
  const users = []
  
  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      id: randomUUID(),
      name: 'Admin User',
      email: 'admin@example.com',
      emailVerified: true,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
  users.push(adminUser)
  
  // Create regular users
  const userNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan']
  
  for (const name of userNames) {
    const email = `${name.toLowerCase()}@example.com`
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        id: randomUUID(),
        name,
        email,
        emailVerified: true,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    users.push(user)
  }
  
  console.log(`Created ${users.length} users`)
  return users
}

async function createBlockchains() {
  console.log('Creating blockchains...')
  
  const blockchainData = [
    {
      name: 'Solana',
      chainId: '1',
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      explorerUrl: 'https://explorer.solana.com',
      isDefault: true
    },
    {
      name: 'Ethereum',
      chainId: '1',
      rpcUrl: 'https://mainnet.infura.io/v3/your-api-key',
      explorerUrl: 'https://etherscan.io'
    },
    {
      name: 'Polygon',
      chainId: '137',
      rpcUrl: 'https://polygon-rpc.com',
      explorerUrl: 'https://polygonscan.com'
    }
  ]
  
  const blockchains = []
  
  for (const data of blockchainData) {
    const blockchain = await prisma.blockchain.create({
      data: {
        ...data,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    blockchains.push(blockchain)
  }
  
  console.log(`Created ${blockchains.length} blockchains`)
  return blockchains
}

async function createWallets(users: { id: string; name: string; email: string; emailVerified: boolean; image: string | null; createdAt: Date; updatedAt: Date; role: string | null; banned: boolean | null; banReason: string | null; banExpires: Date | null }[], blockchains: { id: string; name: string; createdAt: Date; updatedAt: Date; isActive: boolean; isDefault: boolean; chainId: string; rpcUrl: string; explorerUrl: string }[]) {
  console.log('Creating wallets...')
  
  const wallets = []
  
  // Create wallets for each user on each blockchain
  for (const user of users) {
    for (const blockchain of blockchains) {
      // Generate a fake wallet address based on the blockchain
      let address
      if (blockchain.name === 'Solana') {
        address = `sol${randomUUID().replace(/-/g, '').substring(0, 32)}`
      } else if (blockchain.name === 'Ethereum' || blockchain.name === 'Polygon') {
        address = `0x${randomUUID().replace(/-/g, '').substring(0, 40)}`
      }
      
      const wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          blockchainId: blockchain.id,
          address: String(address),
          isDefault: blockchain.isDefault,
          label: `${user.name}'s ${blockchain.name} Wallet`,
          balance: Math.random() * 10000,
          lastSynced: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      wallets.push(wallet)
    }
  }
  
  console.log(`Created ${wallets.length} wallets`)
  return wallets
}

async function createPublishers(users: string | any[]) {
  console.log('Creating publishers...')
  
  const publisherData = [
    {
      name: 'Cosmic Games',
      slug: 'cosmic-games',
      description: 'A publisher focused on space-themed games',
      website: 'https://cosmicgames.example.com',
      royaltyPercentage: 10.0
    },
    {
      name: 'Medieval Studios',
      slug: 'medieval-studios',
      description: 'Specializing in historical and fantasy games',
      website: 'https://medievalstudios.example.com',
      royaltyPercentage: 12.5
    },
    {
      name: 'Cyber Nexus',
      slug: 'cyber-nexus',
      description: 'Cyberpunk and futuristic game publisher',
      website: 'https://cybernexus.example.com',
      royaltyPercentage: 15.0
    }
  ]
  
  const publishers = []
  
  for (let i = 0; i < publisherData.length; i++) {
    const data = publisherData[i]
    const user = users[i % users.length]
    
    const publisher = await prisma.publisher.create({
      data: {
        ...data,
        organizationId: null, // Link to organization if needed
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    publishers.push(publisher)
  }
  
  console.log(`Created ${publishers.length} publishers`)
  return publishers
}

async function createDevelopers(users: string | any[]) {
  console.log('Creating developers...')
  
  const developerData = [
    {
      name: 'Stellar Dev Team',
      slug: 'stellar-dev-team',
      description: 'Innovative game development studio',
      website: 'https://stellardev.example.com'
    },
    {
      name: 'Ancient Forge',
      slug: 'ancient-forge',
      description: 'Crafting immersive historical experiences',
      website: 'https://ancientforge.example.com'
    },
    {
      name: 'Future Labs',
      slug: 'future-labs',
      description: 'Pushing the boundaries of gaming technology',
      website: 'https://futurelabs.example.com'
    },
    {
      name: 'Pixel Pioneers',
      slug: 'pixel-pioneers',
      description: 'Indie game development collective',
      website: 'https://pixelpioneers.example.com'
    }
  ]
  
  const developers = []
  
  for (let i = 0; i < developerData.length; i++) {
    const data = developerData[i]
    const user = users[i % users.length]
    
    const developer = await prisma.developer.create({
      data: {
        ...data,
        organizationId: null, // Link to organization if needed
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    developers.push(developer)
  }
  
  console.log(`Created ${developers.length} developers`)
  return developers
}

async function createContentFiles() {
  console.log('Creating content files...')
  
  const contentFileData = [
    {
      filename: 'cosmic_explorers_cover.jpg',
      mimeType: 'image/jpeg',
      size: 1024000,
      path: '/storage/games/covers/cosmic_explorers_cover.jpg',
      contentHash: 'hash1',
      contentCid: 'Qm1',
      storageType: StorageType.CENTRALIZED,
      isPublic: true
    },
    {
      filename: 'medieval_kingdom_cover.jpg',
      mimeType: 'image/jpeg',
      size: 1536000,
      path: '/storage/games/covers/medieval_kingdom_cover.jpg',
      contentHash: 'hash2',
      contentCid: 'Qm2',
      storageType: StorageType.CENTRALIZED,
      isPublic: true
    },
    {
      filename: 'cyber_nexus_cover.jpg',
      mimeType: 'image/jpeg',
      size: 2048000,
      path: '/storage/games/covers/cyber_nexus_cover.jpg',
      contentHash: 'hash3',
      contentCid: 'Qm3',
      storageType: StorageType.CENTRALIZED,
      isPublic: true
    },
    {
      filename: 'cosmic_explorers_screenshot1.jpg',
      mimeType: 'image/jpeg',
      size: 512000,
      path: '/storage/games/screenshots/cosmic_explorers_screenshot1.jpg',
      contentHash: 'hash4',
      contentCid: 'Qm4',
      storageType: StorageType.CENTRALIZED,
      isPublic: true
    },
    {
      filename: 'cosmic_explorers_trailer.mp4',
      mimeType: 'video/mp4',
      size: 10240000,
      path: '/storage/games/trailers/cosmic_explorers_trailer.mp4',
      contentHash: 'hash5',
      contentCid: 'Qm5',
      storageType: StorageType.CENTRALIZED,
      isPublic: true
    },
    {
      filename: 'space_helmet_item.png',
      mimeType: 'image/png',
      size: 256000,
      path: '/storage/items/space_helmet_item.png',
      contentHash: 'hash6',
      contentCid: 'Qm6',
      storageType: StorageType.CENTRALIZED,
      isPublic: true
    },
    {
      filename: 'medieval_sword_item.png',
      mimeType: 'image/png',
      size: 256000,
      path: '/storage/items/medieval_sword_item.png',
      contentHash: 'hash7',
      contentCid: 'Qm7',
      storageType: StorageType.CENTRALIZED,
      isPublic: true
    }
  ]
  
  const contentFiles = []
  
  for (const data of contentFileData) {
    const contentFile = await prisma.contentFile.create({
      data: {
        ...data,
        metadata: { resolution: '1920x1080' },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    contentFiles.push(contentFile)
  }
  
  console.log(`Created ${contentFiles.length} content files`)
  return contentFiles
}

async function createGenres() {
  console.log('Creating genres...')
  
  const genreData = [
    { name: 'Action', slug: 'action', description: 'Fast-paced games focusing on combat and movement' },
    { name: 'Adventure', slug: 'adventure', description: 'Story-driven exploration games' },
    { name: 'RPG', slug: 'rpg', description: 'Role-playing games with character development' },
    { name: 'Strategy', slug: 'strategy', description: 'Games that prioritize decision-making and planning' },
    { name: 'Simulation', slug: 'simulation', description: 'Games that simulate real-world activities' },
    { name: 'Sports', slug: 'sports', description: 'Games based on real-world sports' },
    { name: 'Racing', slug: 'racing', description: 'Competitive racing games' },
    { name: 'Puzzle', slug: 'puzzle', description: 'Games focused on solving puzzles' }
  ]
  
  const genres = []
  
  for (const data of genreData) {
    const genre = await prisma.genre.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    genres.push(genre)
  }
  
  console.log(`Created ${genres.length} genres`)
  return genres
}

async function createTags() {
  console.log('Creating tags...')
  
  const tagData = [
    { name: 'Multiplayer', slug: 'multiplayer' },
    { name: 'Single Player', slug: 'single-player' },
    { name: 'Open World', slug: 'open-world' },
    { name: 'First Person', slug: 'first-person' },
    { name: 'Third Person', slug: 'third-person' },
    { name: 'Sci-Fi', slug: 'sci-fi' },
    { name: 'Fantasy', slug: 'fantasy' },
    { name: 'Horror', slug: 'horror' },
    { name: 'Casual', slug: 'casual' },
    { name: 'Competitive', slug: 'competitive' }
  ]
  
  const tags = []
  
  for (const data of tagData) {
    const tag = await prisma.tag.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    tags.push(tag)
  }
  
  console.log(`Created ${tags.length} tags`)
  return tags
}

async function createGames(publishers: { id: any }[], developers: string | any[], contentFiles: { id: any }[], genres: { id: any }[], tags: { id: any }[]) {
  console.log('Creating games...')
  
  const gameData = [
    {
      title: 'Cosmic Explorers',
      slug: 'cosmic-explorers',
      description: 'Embark on an epic journey through the cosmos, discovering new planets and alien civilizations.',
      shortDescription: 'Space exploration adventure',
      publisherId: publishers[0].id,
      releaseDate: new Date('2024-01-15'),
      basePrice: 59.99,
      discountPrice: 49.99,
      contentRating: 'PEGI 12',
      systemRequirements: {
        minimum: {
          os: 'Windows 10',
          cpu: 'Intel Core i5-6600K',
          gpu: 'NVIDIA GTX 1060',
          ram: '8 GB',
          storage: '50 GB'
        },
        recommended: {
          os: 'Windows 11',
          cpu: 'Intel Core i7-8700K',
          gpu: 'NVIDIA RTX 2070',
          ram: '16 GB',
          storage: '50 GB'
        }
      },
      coverImageId: contentFiles[0].id,
      trailerVideoId: contentFiles[4].id,
      genreIds: [genres[0].id, genres[1].id, genres[2].id], // Action, Adventure, RPG
      tagIds: [tags[1].id, tags[5].id] // Single Player, Sci-Fi
    },
    {
      title: 'Medieval Kingdom',
      slug: 'medieval-kingdom',
      description: 'Build and manage your medieval kingdom, form alliances, and conquer neighboring territories.',
      shortDescription: 'Medieval strategy game',
      publisherId: publishers[1].id,
      releaseDate: new Date('2023-11-05'),
      basePrice: 49.99,
      contentRating: 'PEGI 12',
      systemRequirements: {
        minimum: {
          os: 'Windows 10',
          cpu: 'Intel Core i5-4460',
          gpu: 'NVIDIA GTX 960',
          ram: '8 GB',
          storage: '30 GB'
        },
        recommended: {
          os: 'Windows 10',
          cpu: 'Intel Core i7-6700',
          gpu: 'NVIDIA GTX 1070',
          ram: '16 GB',
          storage: '30 GB'
        }
      },
      coverImageId: contentFiles[1].id,
      genreIds: [genres[3].id, genres[4].id], // Strategy, Simulation
      tagIds: [tags[1].id, tags[6].id] // Single Player, Fantasy
    },
    {
      title: 'Cyber Nexus',
      slug: 'cyber-nexus',
      description: 'Navigate a dystopian cyberpunk world filled with corporate espionage, advanced technology, and moral dilemmas.',
      shortDescription: 'Cyberpunk action RPG',
      publisherId: publishers[2].id,
      releaseDate: new Date('2024-03-22'),
      basePrice: 69.99,
      discountPrice: 59.99,
      contentRating: 'PEGI 18',
      systemRequirements: {
        minimum: {
          os: 'Windows 10',
          cpu: 'Intel Core i7-4790',
          gpu: 'NVIDIA GTX 1060',
          ram: '12 GB',
          storage: '70 GB'
        },
        recommended: {
          os: 'Windows 10',
          cpu: 'Intel Core i7-8700K',
          gpu: 'NVIDIA RTX 3070',
          ram: '16 GB',
          storage: '70 GB'
        }
      },
      coverImageId: contentFiles[2].id,
      genreIds: [genres[0].id, genres[2].id], // Action, RPG
      tagIds: [tags[0].id, tags[2].id, tags[5].id] // Multiplayer, Open World, Sci-Fi
    }
  ]
  
  const games = []
  
  for (const data of gameData) {
    const { genreIds, tagIds, ...gameInfo } = data
    
    // Create the game
    const game = await prisma.game.create({
      data: {
        ...gameInfo,
        isActive: true,
        isFeatured: Math.random() > 0.5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    // Add genres
    for (const genreId of genreIds) {
      await prisma.gameGenre.create({
        data: {
          gameId: game.id,
          genreId
        }
      })
    }
    
    // Add tags
    for (const tagId of tagIds) {
      await prisma.gameTag.create({
        data: {
          gameId: game.id,
          tagId
        }
      })
    }
    
    // Add developer relationships
    const devIndex = games.length % developers.length
    await prisma.developerGame.create({
      data: {
        gameId: game.id,
        developerId: developers[devIndex].id,
        role: 'Lead Developer',
        createdAt: new Date()
      }
    })
    
    games.push(game)
  }
  
  console.log(`Created ${games.length} games`)
  return games
}

async function createGameVersions(games: { id: string; createdAt: Date; updatedAt: Date; description: string; isActive: boolean; slug: string; title: string; shortDescription: string | null; publisherId: string; releaseDate: Date; basePrice: Decimal; discountPrice: Decimal | null; isFeatured: boolean; contentRating: string | null; systemRequirements: JsonValue | null; coverImageId: string | null; trailerVideoId: string | null }[], contentFiles: { id: string; createdAt: Date; updatedAt: Date; filename: string; mimeType: string; size: bigint; path: string; contentHash: string; contentCid: string | null; storageType: $Enums.StorageType; isPublic: boolean; metadata: JsonValue | null; gameId: string | null; gameVersionId: string | null }[]) {
  console.log('Creating game versions...')
  
  const gameVersions = []
  
  for (const game of games) {
    // Create initial release version
    const initialVersion = await prisma.gameVersion.create({
      data: {
        gameId: game.id,
        version: '1.0.0',
        releaseNotes: 'Initial release',
        isActive: true,
        size: BigInt(5000000000), // 5 GB
        contentHash: `${game.slug}_1.0.0_hash`,
        contentCid: `${game.slug}_1.0.0_cid`,
        createdAt: game.releaseDate,
        updatedAt: game.releaseDate
      }
    })
    gameVersions.push(initialVersion)
    
    // Create patch version
    const patchDate = new Date(game.releaseDate)
    patchDate.setMonth(patchDate.getMonth() + 1)
    
    const patchVersion = await prisma.gameVersion.create({
      data: {
        gameId: game.id,
        version: '1.0.1',
        releaseNotes: 'Bug fixes and performance improvements',
        isActive: true,
        size: BigInt(5100000000), // 5.1 GB
        contentHash: `${game.slug}_1.0.1_hash`,
        contentCid: `${game.slug}_1.0.1_cid`,
        createdAt: patchDate,
        updatedAt: patchDate
      }
    })
    gameVersions.push(patchVersion)
  }
  
  console.log(`Created ${gameVersions.length} game versions`)
  return gameVersions
}

async function createNFTCollections(blockchains: any[]) {
  console.log('Creating NFT collections...')
  
  const nftCollections = []
  
  const collectionData = [
    {
      name: 'Game License NFTs',
      symbol: 'GLNFT',
      standard: 'SPL',
      blockchainId: blockchains.find((b: { name: string }) => b.name === 'Solana').id,
      contractAddress: 'sol' + randomUUID().replace(/-/g, '').substring(0, 32)
    },
    {
      name: 'Game Item NFTs',
      symbol: 'GINFT',
      standard: 'SPL',
      blockchainId: blockchains.find((b: { name: string }) => b.name === 'Solana').id,
      contractAddress: 'sol' + randomUUID().replace(/-/g, '').substring(0, 32)
    },
    {
      name: 'Ethereum Game Licenses',
      symbol: 'EGLNFT',
      standard: 'ERC721',
      blockchainId: blockchains.find((b: { name: string }) => b.name === 'Ethereum').id,
      contractAddress: '0x' + randomUUID().replace(/-/g, '').substring(0, 40)
    }
  ]
  
  for (const data of collectionData) {
    const collection = await prisma.nFTCollection.create({
      data: {
        ...data,
        metadata: { description: `NFT collection for ${data.name}` },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    nftCollections.push(collection)
  }
  
  console.log(`Created ${nftCollections.length} NFT collections`)
  return nftCollections
}

async function createGameLicenses(games: string | any[], wallets: string | any[], nftCollections: any[]) {
  console.log('Creating game licenses...')
  
  const gameLicenses = []
  
  // Each user (wallet) will own some games
  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i]
    
    // Skip some wallets to make the distribution more realistic
    if (Math.random() > 0.7) continue
    
    // Select 1-3 random games for this wallet
    const numGames = Math.floor(Math.random() * 3) + 1
    const gameIndices = new Set()
    
    while (gameIndices.size < numGames && gameIndices.size < games.length) {
      const randomIndex = Math.floor(Math.random() * games.length)
      gameIndices.add(randomIndex)
    }
    
    for (const index of gameIndices) {
      const game = games[Number(index)]
      
      // Determine license type
      const licenseTypes = Object.values(LicenseType)
      const licenseType = licenseTypes[Math.floor(Math.random() * licenseTypes.length)]
      
      // Determine if it's an NFT license
      const isNFT = Math.random() > 0.5
      
      const licenseData: any = {
        gameId: game.id,
        walletId: wallet.id,
        licenseType,
        isActive: true,
        acquiredAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date in the last 30 days
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      if (isNFT) {
        // Find a compatible NFT collection for this wallet's blockchain
        const compatibleCollections = nftCollections.filter((c: { blockchainId: any }) => c.blockchainId === wallet.blockchainId)
        
        if (compatibleCollections.length > 0) {
          const collection = compatibleCollections[0]
          licenseData.nftCollectionId = collection.id
          licenseData.nftId = randomUUID().substring(0, 8)
        }
      }
      
      // Add expiration date for subscription licenses
      if (licenseType === LicenseType.SUBSCRIPTION) {
        const expiresAt = new Date(licenseData.acquiredAt)
        expiresAt.setMonth(expiresAt.getMonth() + 1) // 1 month subscription
        licenseData.expiresAt = expiresAt
      }
      
      // Add metadata
      licenseData.metadata = {
        purchasePrice: game.discountPrice || game.basePrice,
        platform: 'PC',
        activations: 1
      }
      
      const license = await prisma.gameLicense.create({
        data: licenseData
      })
      
      gameLicenses.push(license)
    }
  }
  
  console.log(`Created ${gameLicenses.length} game licenses`)
  return gameLicenses
}

async function createGameItems(games: { id: string; createdAt: Date; updatedAt: Date; description: string; isActive: boolean; slug: string; title: string; shortDescription: string | null; publisherId: string; releaseDate: Date; basePrice: Decimal; discountPrice: Decimal | null; isFeatured: boolean; contentRating: string | null; systemRequirements: JsonValue | null; coverImageId: string | null; trailerVideoId: string | null }[], contentFiles: any[], nftCollections: string | any[]) {
  console.log('Creating game items...')
  
  const gameItems = []
  
  // Item templates
  const itemTemplates = [
    {
      name: 'Space Helmet',
      description: 'A high-tech helmet for space exploration',
      itemType: ItemType.COSMETIC,
      rarity: ItemRarity.RARE,
      price: 9.99,
      supply: 1000,
      remaining: 800,
      imageId: contentFiles.find((f: { filename: string }) => f.filename === 'space_helmet_item.png')?.id
    },
    {
      name: 'Medieval Sword',
      description: 'A finely crafted sword from the medieval era',
      itemType: ItemType.FUNCTIONAL,
      rarity: ItemRarity.UNCOMMON,
      price: 5.99,
      supply: 5000,
      remaining: 4200,
      imageId: contentFiles.find((f: { filename: string }) => f.filename === 'medieval_sword_item.png')?.id
    },
    {
      name: 'Cyber Implant',
      description: 'A cybernetic implant that enhances abilities',
      itemType: ItemType.FUNCTIONAL,
      rarity: ItemRarity.EPIC,
      price: 19.99,
      supply: 500,
      remaining: 350
    },
    {
      name: 'Health Potion',
      description: 'Restores health when consumed',
      itemType: ItemType.CONSUMABLE,
      rarity: ItemRarity.COMMON,
      price: 1.99,
      supply: null, // Unlimited supply
      remaining: null
    },
    {
      name: 'Legendary Artifact',
      description: 'An ancient artifact with mysterious powers',
      itemType: ItemType.COLLECTIBLE,
      rarity: ItemRarity.LEGENDARY,
      price: 49.99,
      supply: 100,
      remaining: 50
    }
  ]
  
  // Create items for each game
  for (const game of games) {
    // Select 2-4 random item templates for this game
    const numItems = Math.floor(Math.random() * 3) + 2
    const templateIndices = new Set()
    
    while (templateIndices.size < numItems && templateIndices.size < itemTemplates.length) {
      const randomIndex = Math.floor(Math.random() * itemTemplates.length)
      templateIndices.add(randomIndex)
    }
    
    for (const index of templateIndices) {
      const template = itemTemplates[Number(index)]
      
      // Determine if it's an NFT item
      const isNFT = Math.random() > 0.7
      
      const itemData: any = {
        ...template,
        gameId: game.id,
        isTransferable: Math.random() > 0.2,
        isTradeable: Math.random() > 0.3,
        contentHash: `${game.slug}_${template.name.toLowerCase().replace(/\s/g, '_')}_hash`,
        contentCid: `${game.slug}_${template.name.toLowerCase().replace(/\s/g, '_')}_cid`,
        metadata: {
          effects: {
            strength: Math.floor(Math.random() * 10),
            agility: Math.floor(Math.random() * 10),
            intelligence: Math.floor(Math.random() * 10)
          },
          durability: Math.floor(Math.random() * 100) + 1
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      if (isNFT && nftCollections.length > 0) {
        // Assign to a random NFT collection
        const collection = nftCollections[Math.floor(Math.random() * nftCollections.length)]
        itemData.nftCollectionId = collection.id
      }
      
      const item = await prisma.gameItem.create({
        data: itemData
      })
      
      gameItems.push(item)
    }
  }
  
  console.log(`Created ${gameItems.length} game items`)
  return gameItems
}

async function createItemOwnerships(gameItems: string | any[], wallets: string | any[]) {
  console.log('Creating item ownerships...')
  
  const itemOwnerships = []
  
  // Each wallet will own some items
  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i]
    
    // Skip some wallets to make the distribution more realistic
    if (Math.random() > 0.6) continue
    
    // Select 1-5 random items for this wallet
    const numItems = Math.floor(Math.random() * 5) + 1
    const itemIndices = new Set()
    
    while (itemIndices.size < numItems && itemIndices.size < gameItems.length) {
      const randomIndex = Math.floor(Math.random() * gameItems.length)
      itemIndices.add(randomIndex)
    }
    
    for (const index of itemIndices) {
      const item = gameItems[Number(index)]
      
      // Skip if the item is not transferable or tradeable
      if (!item.isTransferable && !item.isTradeable) continue
      
      const quantity = Math.floor(Math.random() * 3) + 1
      
      const ownership = await prisma.itemOwnership.create({
        data: {
          itemId: item.id,
          walletId: wallet.id,
          quantity,
          nftId: item.nftCollectionId ? randomUUID().substring(0, 8) : null,
          acquiredAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date in the last 30 days
        }
      })
      
      itemOwnerships.push(ownership)
    }
  }
  
  console.log(`Created ${itemOwnerships.length} item ownerships`)
  return itemOwnerships
}

async function createSmartContracts(blockchains: { id: string; name: string; createdAt: Date; updatedAt: Date; isActive: boolean; isDefault: boolean; chainId: string; rpcUrl: string; explorerUrl: string }[]) {
  console.log('Creating smart contracts...')
  
  const smartContracts = []
  
  const contractTypes = [
    'GameLicense',
    'Marketplace',
    'ItemNFT',
    'Governance'
  ]
  
  for (const blockchain of blockchains) {
    for (const type of contractTypes) {
      let address
      if (blockchain.name === 'Solana') {
        address = `sol${randomUUID().replace(/-/g, '').substring(0, 32)}`
      } else if (blockchain.name === 'Ethereum' || blockchain.name === 'Polygon') {
        address = `0x${randomUUID().replace(/-/g, '').substring(0, 40)}`
      }
      
      const contract = await prisma.smartContract.create({
        data: {
          blockchainId: blockchain.id,
          address: String(address),
          name: `${blockchain.name} ${type} Contract`,
          type,
          abi: { /* Sample ABI structure */ },
          bytecode: null,
          deployedAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000), // Random date in the last 90 days
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      smartContracts.push(contract)
    }
  }
  
  console.log(`Created ${smartContracts.length} smart contracts`)
  return smartContracts
}

async function createTransactions(blockchains: string | any[], wallets: any[], smartContracts: any[]) {
  console.log('Creating transactions...')
  
  const transactions = []
  
  // Create some random transactions
  const numTransactions = 20
  const transactionTypes = Object.values(TransactionType)
  const transactionStatuses = Object.values(TransactionStatus)
  
  for (let i = 0; i < numTransactions; i++) {
    const blockchain = blockchains[Math.floor(Math.random() * blockchains.length)]
    const wallet = wallets.filter((w: { blockchainId: any }) => w.blockchainId === blockchain.id)[Math.floor(Math.random() * wallets.filter((w: { blockchainId: any }) => w.blockchainId === blockchain.id).length)]
    const smartContract = smartContracts.filter((sc: { blockchainId: any }) => sc.blockchainId === blockchain.id)[Math.floor(Math.random() * smartContracts.filter((sc: { blockchainId: any }) => sc.blockchainId === blockchain.id).length)]
    
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]
    const status = transactionStatuses[Math.floor(Math.random() * transactionStatuses.length)]
    
    let hash
    if (blockchain.name === 'Solana') {
      hash = randomUUID().replace(/-/g, '')
    } else {
      hash = '0x' + randomUUID().replace(/-/g, '')
    }
    
    const amount = parseFloat((Math.random() * 100).toFixed(2))
    const fee = parseFloat((Math.random() * 1).toFixed(4))
    
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date in the last 30 days
    
    const transaction = await prisma.transaction.create({
      data: {
        hash,
        blockchainId: blockchain.id,
        walletId: wallet.id,
        smartContractId: smartContract.id,
        type,
        status,
        amount,
        fee,
        data: {
          method: 'transfer',
          params: {
            to: '0x' + randomUUID().replace(/-/g, '').substring(0, 40),
            value: amount.toString()
          }
        },
        blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
        timestamp,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    })
    
    transactions.push(transaction)
  }
  
  console.log(`Created ${transactions.length} transactions`)
  return transactions
}

async function createLicenseTransactions(gameLicenses: string | any[], transactions: string | any[]) {
  console.log('Creating license transactions...')
  
  const licenseTransactions = []
  
  // Create a purchase transaction for each license
  for (let i = 0; i < Math.min(gameLicenses.length, transactions.length); i++) {
    const license = gameLicenses[i]
    const transaction = transactions[i]
    
    const licenseTransaction = await prisma.gameLicenseTransaction.create({
      data: {
        licenseeId: license.id,
        transactionId: transaction.id,
        type: 'PURCHASE',
        price: parseFloat((Math.random() * 50 + 10).toFixed(2)),
        createdAt: new Date()
      }
    })
    
    licenseTransactions.push(licenseTransaction)
  }
  
  console.log(`Created ${licenseTransactions.length} license transactions`)
  return licenseTransactions
}

async function createItemTransactions(gameItems: any[], itemOwnerships: string | any[], transactions: string | any[]) {
  console.log('Creating item transactions...')
  
  const itemTransactions = []
  
  // Create a purchase transaction for each ownership
  for (let i = 0; i < Math.min(itemOwnerships.length, transactions.length); i++) {
    const ownership = itemOwnerships[i]
    const item = gameItems.find((item: { id: any }) => item.id === ownership.itemId)
    const transaction = transactions[(i + transactions.length / 2) % transactions.length] // Use different transactions than license transactions
    
    if (!item) continue
    
    const itemTransaction = await prisma.itemTransaction.create({
      data: {
        itemId: item.id,
        ownershipId: ownership.id,
        transactionId: transaction.id,
        type: 'PURCHASE',
        quantity: ownership.quantity,
        price: item.price,
        createdAt: new Date()
      }
    })
    
    itemTransactions.push(itemTransaction)
  }
  
  console.log(`Created ${itemTransactions.length} item transactions`)
  return itemTransactions
}

async function createEscrows(wallets: any[]) {
  console.log('Creating escrows...')
  
  const escrows = []
  
  // Create some escrows between wallets
  const numEscrows = 5
  
  for (let i = 0; i < numEscrows; i++) {
    // Select two different wallets on the same blockchain
    const blockchainId = wallets[0].blockchainId
    const compatibleWallets = wallets.filter((w: { blockchainId: any }) => w.blockchainId === blockchainId)
    
    if (compatibleWallets.length < 2) continue
    
    const depositorIndex = Math.floor(Math.random() * compatibleWallets.length)
    let beneficiaryIndex
    do {
      beneficiaryIndex = Math.floor(Math.random() * compatibleWallets.length)
    } while (beneficiaryIndex === depositorIndex)
    
    const depositorWallet = compatibleWallets[depositorIndex]
    const beneficiaryWallet = compatibleWallets[beneficiaryIndex]
    
    const amount = parseFloat((Math.random() * 100 + 50).toFixed(2))
    
    // Random status
    const statuses = Object.values(EscrowStatus)
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    // Create expiration date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    
    const escrow = await prisma.escrow.create({
      data: {
        depositorWalletId: depositorWallet.id,
        beneficiaryWalletId: beneficiaryWallet.id,
        amount,
        status,
        releaseCondition: 'Item delivery confirmation',
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    escrows.push(escrow)
  }
  
  console.log(`Created ${escrows.length} escrows`)
  return escrows
}

async function createEscrowTransactions(escrows: string | any[], transactions: string | any[]) {
  console.log('Creating escrow transactions...')
  
  const escrowTransactions = []
  
  // Create transactions for each escrow
  for (let i = 0; i < Math.min(escrows.length, transactions.length / 4); i++) {
    const escrow = escrows[i]
    const transaction = transactions[i]
    
    const escrowTransaction = await prisma.escrowTransaction.create({
      data: {
        escrowId: escrow.id,
        transactionId: transaction.id,
        type: 'DEPOSIT',
        amount: escrow.amount,
        createdAt: new Date()
      }
    })
    
    escrowTransactions.push(escrowTransaction)
    
    // For some escrows, also create a release transaction
    if (escrow.status === 'RELEASED' && i + transactions.length / 4 < transactions.length) {
      const releaseTransaction = await prisma.escrowTransaction.create({
        data: {
          escrowId: escrow.id,
          transactionId: transactions[i + Math.floor(transactions.length / 4)].id,
          type: 'RELEASE',
          amount: escrow.amount,
          createdAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day after deposit
        }
      })
      
      escrowTransactions.push(releaseTransaction)
    }
  }
  
  console.log(`Created ${escrowTransactions.length} escrow transactions`)
  return escrowTransactions
}

async function createMarketplaceListings(games: string | any[], gameItems: string | any[], escrows: string | any[]) {
  console.log('Creating marketplace listings...')
  
  const marketplaceListings = []
  
  // Create game license listings
  for (let i = 0; i < Math.min(games.length, 2); i++) {
    const game = games[i]
    
    const listing = await prisma.marketplaceListing.create({
      data: {
        type: ListingType.GAME_LICENSE,
        status: ListingStatus.ACTIVE,
        sellerId: randomUUID(), // User ID
        price: game.basePrice * 0.8, // 20% discount for resale
        quantity: 1,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        gameId: game.id,
        escrowId: escrows[i % escrows.length]?.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    marketplaceListings.push(listing)
  }
  
  // Create game item listings
  for (let i = 0; i < Math.min(gameItems.length, 5); i++) {
    const item = gameItems[i]
    
    // Skip if the item is not tradeable
    if (!item.isTradeable) continue
    
    const quantity = Math.floor(Math.random() * 3) + 1
    
    const listing = await prisma.marketplaceListing.create({
      data: {
        type: ListingType.GAME_ITEM,
        status: ListingStatus.ACTIVE,
        sellerId: randomUUID(), // User ID
        price: item.price * (Math.random() * 0.4 + 0.8), // Random price between 80% and 120% of original
        quantity,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        itemId: item.id,
        escrowId: i < escrows.length ? escrows[i].id : null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    marketplaceListings.push(listing)
  }
  
  console.log(`Created ${marketplaceListings.length} marketplace listings`)
  return marketplaceListings
}

async function createGameReviews(games: { id: string; createdAt: Date; updatedAt: Date; description: string; isActive: boolean; slug: string; title: string; shortDescription: string | null; publisherId: string; releaseDate: Date; basePrice: Decimal; discountPrice: Decimal | null; isFeatured: boolean; contentRating: string | null; systemRequirements: JsonValue | null; coverImageId: string | null; trailerVideoId: string | null }[], users: string | any[]) {
  console.log('Creating game reviews...')
  
  const gameReviews = []
  
  // Create reviews for each game
  for (const game of games) {
    // Each game gets 3-5 reviews
    const numReviews = Math.floor(Math.random() * 3) + 3
    
    for (let i = 0; i < numReviews; i++) {
      // Skip if we run out of users
      if (i >= users.length) break
      
      const user = users[i]
      const rating = Math.floor(Math.random() * 5) + 1 // 1-5 stars
      const isRecommended = rating >= 4 // Recommend if 4+ stars
      
      const review = await prisma.gameReview.create({
        data: {
          gameId: game.id,
          userId: user.id,
          rating,
          title: `My review of ${game.title}`,
          content: getRandomReviewContent(rating),
          playTime: Math.floor(Math.random() * 100) + 1, // 1-100 hours
          isVerifiedPurchase: Math.random() > 0.2,
          isRecommended,
          upvotes: Math.floor(Math.random() * 50),
          downvotes: Math.floor(Math.random() * 10),
          status: ReviewStatus.APPROVED,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date in the last 30 days
          updatedAt: new Date()
        }
      })
      
      gameReviews.push(review)
    }
  }
  
  console.log(`Created ${gameReviews.length} game reviews`)
  return gameReviews
}

function getRandomReviewContent(rating: number): string {
  const positiveReviews = [
    "This game is absolutely amazing! The graphics are stunning and the gameplay is incredibly immersive.",
    "I've been playing for hours and can't put it down. Definitely worth every penny!",
    "One of the best games I've played this year. The story is captivating and the mechanics are solid."
  ]
  
  const neutralReviews = [
    "It's a decent game with some good moments, but there are a few bugs that need to be fixed.",
    "The gameplay is fun but the story is a bit lacking. Still worth playing though.",
    "Good game overall, but nothing revolutionary. I enjoyed my time with it."
  ]
  
  const negativeReviews = [
    "I was really disappointed with this game. It doesn't live up to the hype at all.",
    "Too many bugs and performance issues. Wait for patches before buying.",
    "The gameplay is repetitive and boring. I regret purchasing this."
  ]
  
  if (rating >= 4) {
    return positiveReviews[Math.floor(Math.random() * positiveReviews.length)]
  } else if (rating >= 3) {
    return neutralReviews[Math.floor(Math.random() * neutralReviews.length)]
  } else {
    return negativeReviews[Math.floor(Math.random() * negativeReviews.length)]
  }
}

async function createBlockchainIndices(blockchains: { id: string; name: string; createdAt: Date; updatedAt: Date; isActive: boolean; isDefault: boolean; chainId: string; rpcUrl: string; explorerUrl: string }[]) {
  console.log('Creating blockchain indices...')
  
  const blockchainIndices = []
  
  for (const blockchain of blockchains) {
    const index = await prisma.blockchainIndex.create({
      data: {
        blockchainId: blockchain.id,
        lastBlockProcessed: Math.floor(Math.random() * 1000000) + 10000000,
        lastProcessedAt: new Date(),
        status: IndexStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    blockchainIndices.push(index)
  }
  
  console.log(`Created ${blockchainIndices.length} blockchain indices`)
  return blockchainIndices
}

async function createGovernanceProposals(users: string | any[]) {
  console.log('Creating governance proposals...')
  
  const proposals = []
  
  const proposalData = [
    {
      title: 'Reduce Platform Fees',
      description: 'Proposal to reduce platform fees from 5% to 3% to encourage more transactions.',
      proposalType: ProposalType.PARAMETER_CHANGE
    },
    {
      title: 'Add Support for New Blockchain',
      description: 'Proposal to add support for the Avalanche blockchain to expand our ecosystem.',
      proposalType: ProposalType.FEATURE_REQUEST
    },
    {
      title: 'Community Fund Allocation',
      description: 'Proposal to allocate 100,000 tokens to the community development fund.',
      proposalType: ProposalType.FUND_ALLOCATION
    }
  ]
  
  for (let i = 0; i < proposalData.length; i++) {
    const data = proposalData[i]
    const proposerId = users[i % users.length].id
    
    // Determine status
    const statuses = Object.values(ProposalStatus)
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    // Create dates
    const createdAt = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
    const votingStartsAt = new Date(createdAt)
    votingStartsAt.setDate(votingStartsAt.getDate() + 1) // 1 day after creation
    
    const votingEndsAt = new Date(votingStartsAt)
    votingEndsAt.setDate(votingEndsAt.getDate() + 7) // 7 days of voting
    
    const implementationDate = new Date(votingEndsAt)
    implementationDate.setDate(implementationDate.getDate() + 3) // 3 days after voting ends
    
    const proposal = await prisma.governanceProposal.create({
      data: {
        title: data.title,
        description: data.description,
        proposerId,
        status,
        proposalType: data.proposalType,
        votingStartsAt,
        votingEndsAt,
        implementationDate: status === ProposalStatus.IMPLEMENTED ? implementationDate : null,
        createdAt,
        updatedAt: new Date()
      }
    })
    
    proposals.push(proposal)
  }
  
  console.log(`Created ${proposals.length} governance proposals`)
  return proposals
}

async function createProposalVotes(proposals: { id: string; createdAt: Date; updatedAt: Date; description: string; title: string; status: $Enums.ProposalStatus; proposerId: string; proposalType: $Enums.ProposalType; votingStartsAt: Date | null; votingEndsAt: Date | null; implementationDate: Date | null }[], users: string | any[]) {
  console.log('Creating proposal votes...')
  
  const votes = []
  
  for (const proposal of proposals) {
    // Skip if the proposal is in DRAFT status
    if (proposal.status === ProposalStatus.DRAFT) continue
    
    // Each proposal gets 3-7 votes
    const numVotes = Math.floor(Math.random() * 5) + 3
    
    for (let i = 0; i < numVotes; i++) {
      // Skip if we run out of users
      if (i >= users.length) break
      
      const user = users[i]
      
      // Determine vote type
      const voteTypes = Object.values(VoteType)
      const voteType = voteTypes[Math.floor(Math.random() * voteTypes.length)]
      
      // Determine vote power (weighted by some token amount)
      const votePower = parseFloat((Math.random() * 10 + 1).toFixed(2))
      
      const vote = await prisma.proposalVote.create({
        data: {
          proposalId: proposal.id,
          voterId: user.id,
          vote: voteType,
          votePower,
          reason: voteType === VoteType.FOR
            ? 'I support this proposal because it benefits the community.'
            : voteType === VoteType.AGAINST
              ? 'I oppose this proposal because it has potential drawbacks.'
              : 'I need more information before making a decision.',
          createdAt: new Date(proposal.votingStartsAt!.getTime() + Math.random() * (proposal.votingEndsAt!.getTime() - proposal.votingStartsAt!.getTime()))
        }
      })
      
      votes.push(vote)
    }
  }
  
  console.log(`Created ${votes.length} proposal votes`)
  return votes
}

async function createDisputeCases(users: string | any[]) {
  console.log('Creating dispute cases...')
  
  const disputes = []
  
  const disputeData = [
    {
      title: 'Transaction Failed but Funds Deducted',
      description: 'I attempted to purchase a game license but the transaction failed. However, the funds were still deducted from my wallet.',
      type: DisputeType.TRANSACTION,
      relatedEntityType: 'Transaction',
      relatedEntityId: randomUUID()
    },
    {
      title: 'Inappropriate Content in Game',
      description: 'I found inappropriate content in the game that violates the platform\'s content policy.',
      type: DisputeType.CONTENT,
      relatedEntityType: 'Game',
      relatedEntityId: randomUUID()
    },
    {
      title: 'User Harassment',
      description: 'A user has been harassing me in the game chat and sending threatening messages.',
      type: DisputeType.USER_BEHAVIOR,
      relatedEntityType: 'User',
      relatedEntityId: randomUUID()
    }
  ]
  
  for (let i = 0; i < disputeData.length; i++) {
    const data = disputeData[i]
    const reporterId = users[i % users.length].id
    const defenderId = users[(i + 1) % users.length].id
    
    // Determine status
    const statuses = Object.values(DisputeStatus)
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date in the last 30 days
    
    const dispute = await prisma.disputeCase.create({
      data: {
        title: data.title,
        description: data.description,
        reporterId,
        defenderId,
        status,
        type: data.type,
        relatedEntityType: data.relatedEntityType,
        relatedEntityId: data.relatedEntityId,
        resolution: status === DisputeStatus.RESOLVED ? 'Issue has been resolved to the satisfaction of both parties.' : null,
        resolvedById: status === DisputeStatus.RESOLVED ? users[0].id : null, // Admin user
        resolvedAt: status === DisputeStatus.RESOLVED ? new Date() : null,
        createdAt,
        updatedAt: new Date()
      }
    })
    
    disputes.push(dispute)
  }
  
  console.log(`Created ${disputes.length} dispute cases`)
  return disputes
}

async function createShardConfigs() {
  console.log('Creating shard configurations...')
  
  const shardConfigs = []
  
  const configData = [
    {
      name: 'Geographic Sharding',
      description: 'Sharding based on geographic regions for lower latency',
      strategy: ShardStrategy.GEOGRAPHIC,
      parameters: {
        regions: ['NA', 'EU', 'ASIA', 'OCEANIA'],
        replicationFactor: 2
      }
    },
    {
      name: 'User-Based Sharding',
      description: 'Sharding based on user ID ranges',
      strategy: ShardStrategy.USER_BASED,
      parameters: {
        shardCount: 4,
        distributionAlgorithm: 'consistent-hashing'
      }
    }
  ]
  
  for (const data of configData) {
    const config = await prisma.shardConfig.create({
      data: {
        ...data,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    shardConfigs.push(config)
  }
  
  console.log(`Created ${shardConfigs.length} shard configurations`)
  return shardConfigs
}

async function createShards(shardConfigs: any[]) {
  console.log('Creating shards...')
  
  const shards = []
  
  // Create shards for geographic sharding
  const geoConfig = shardConfigs.find((c: { strategy: string }) => c.strategy === ShardStrategy.GEOGRAPHIC)
  if (geoConfig) {
    const regions = geoConfig.parameters.regions
    
    for (const region of regions) {
      const shard = await prisma.shard.create({
        data: {
          shardConfigId: geoConfig.id,
          name: `${region}-Shard`,
          endpoint: `https://api-${region.toLowerCase()}.example.com`,
          region,
          capacity: 1000,
          load: Math.floor(Math.random() * 500),
          isActive: true,
          metadata: {
            datacenter: `${region}-DC-1`,
            backupRegion: regions[(regions.indexOf(region) + 1) % regions.length]
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      shards.push(shard)
    }
  }
  
  // Create shards for user-based sharding
  const userConfig = shardConfigs.find((c: { strategy: string }) => c.strategy === ShardStrategy.USER_BASED)
  if (userConfig) {
    const shardCount = userConfig.parameters.shardCount
    
    for (let i = 0; i < shardCount; i++) {
      const shard = await prisma.shard.create({
        data: {
          shardConfigId: userConfig.id,
          name: `User-Shard-${i + 1}`,
          endpoint: `https://api-user-${i + 1}.example.com`,
          capacity: 2000,
          load: Math.floor(Math.random() * 1000),
          isActive: true,
          metadata: {
            userIdRange: {
              start: i * (1000000 / shardCount),
              end: (i + 1) * (1000000 / shardCount) - 1
            }
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      shards.push(shard)
    }
  }
  
  console.log(`Created ${shards.length} shards`)
  return shards
}

async function createCompliancePolicies() {
  console.log('Creating compliance policies...')
  
  const policies = []
  
  const policyData = [
    {
      name: 'Terms of Service',
      description: 'General terms of service for the platform',
      policyText: 'This is a sample terms of service document that outlines the rules and guidelines for using our platform...',
      version: '1.0',
      effectiveDate: new Date(),
      jurisdictions: ['Global']
    },
    {
      name: 'Privacy Policy',
      description: 'How we collect, use, and protect user data',
      policyText: 'This privacy policy describes how we collect, use, and share your personal information when you use our services...',
      version: '1.2',
      effectiveDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      jurisdictions: ['Global', 'EU', 'US']
    },
    {
      name: 'GDPR Compliance',
      description: 'European Union data protection regulations',
      policyText: 'Under the General Data Protection Regulation (GDPR), users in the EU have certain rights regarding their personal data...',
      version: '2.0',
      effectiveDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
      jurisdictions: ['EU']
    }
  ]
  
  for (const data of policyData) {
    const policy = await prisma.compliancePolicy.create({
      data: {
        ...data,
        isActive: true,
        createdAt: new Date(data.effectiveDate),
        updatedAt: new Date()
      }
    })
    
    policies.push(policy)
  }
  
  console.log(`Created ${policies.length} compliance policies`)
  return policies
}

async function createUserConsents(users: { id: string; name: string; email: string; emailVerified: boolean; image: string | null; createdAt: Date; updatedAt: Date; role: string | null; banned: boolean | null; banReason: string | null; banExpires: Date | null }[], policies: { id: string; name: string; createdAt: Date; updatedAt: Date; description: string; isActive: boolean; policyText: string; version: string; effectiveDate: Date; jurisdictions: string[] }[]) {
  console.log('Creating user consents...')
  
  const consents = []
  
  // Each user consents to some policies
  for (const user of users) {
    for (const policy of policies) {
      // 80% chance of consenting
      const consentGiven = Math.random() > 0.2
      
      // Skip some to make it more realistic
      if (Math.random() > 0.8) continue
      
      const consent = await prisma.userConsent.create({
        data: {
          userId: user.id,
          policyId: policy.id,
          consentGiven,
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          consentDate: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000) // Random date in the last 60 days
        }
      })
      
      consents.push(consent)
    }
  }
  
  console.log(`Created ${consents.length} user consents`)
  return consents
}

async function createAnalyticsEvents(users: string | any[]) {
  console.log('Creating analytics events...')
  
  const events = []
  
  const eventTypes = [
    'PAGE_VIEW',
    'GAME_VIEW',
    'GAME_PURCHASE',
    'ITEM_VIEW',
    'ITEM_PURCHASE',
    'SEARCH',
    'LOGIN',
    'LOGOUT',
    'ACCOUNT_UPDATE'
  ]
  
  // Create 50 random events
  for (let i = 0; i < 50; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const user = users[Math.floor(Math.random() * users.length)]
    
    let eventData: any = {}
    
    switch (eventType) {
      case 'PAGE_VIEW':
        eventData = {
          path: ['/', '/games', '/marketplace', '/profile'][Math.floor(Math.random() * 4)],
          referrer: ['direct', 'google', 'twitter', 'discord'][Math.floor(Math.random() * 4)],
          duration: Math.floor(Math.random() * 300) + 10 // 10-310 seconds
        }
        break
      case 'GAME_VIEW':
      case 'GAME_PURCHASE':
        eventData = {
          gameId: randomUUID(),
          gameTitle: ['Cosmic Explorers', 'Medieval Kingdom', 'Cyber Nexus'][Math.floor(Math.random() * 3)],
          price: parseFloat((Math.random() * 60 + 10).toFixed(2))
        }
        break
      case 'SEARCH':
        eventData = {
          query: ['rpg', 'action', 'adventure', 'multiplayer'][Math.floor(Math.random() * 4)],
          results: Math.floor(Math.random() * 20) + 1,
          filters: {
            genre: ['action', 'rpg'][Math.floor(Math.random() * 2)],
            priceRange: ['0-20', '20-50', '50+'][Math.floor(Math.random() * 3)]
          }
        }
        break
      default:
        eventData = {
          timestamp: new Date().toISOString()
        }
    }
    
    const event = await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        sessionId: `session_${randomUUID().substring(0, 8)}`,
        eventType,
        eventData,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000) // Random date in the last 7 days
      }
    })
    
    events.push(event)
  }
  
  console.log(`Created ${events.length} analytics events`)
  return events
}

async function createReports(users: string | any[]) {
  console.log('Creating reports...')
  
  const reports = []
  
  const reportData = [
    {
      title: 'Monthly Sales Report',
      description: 'Summary of all sales for the current month',
      type: ReportType.SALES,
      parameters: {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        endDate: new Date().toISOString(),
        groupBy: 'day'
      }
    },
    {
      title: 'User Activity Analysis',
      description: 'Analysis of user engagement and activity patterns',
      type: ReportType.USER_ACTIVITY,
      parameters: {
        timeframe: 'last_30_days',
        metrics: ['active_users', 'session_duration', 'conversion_rate']
      }
    },
    {
      title: 'Game Performance Metrics',
      description: 'Performance metrics for top-selling games',
      type: ReportType.GAME_PERFORMANCE,
      parameters: {
        limit: 10,
        metrics: ['sales', 'revenue', 'average_rating']
      }
    },
    {
      title: 'Marketplace Activity',
      description: 'Analysis of marketplace transactions and listings',
      type: ReportType.MARKETPLACE_ACTIVITY,
      parameters: {
        timeframe: 'last_90_days',
        groupBy: 'week'
      }
    }
  ]
  
  for (let i = 0; i < reportData.length; i++) {
    const data = reportData[i]
    const createdById = users[i % users.length].id
    
    // Determine status
    const statuses = Object.values(ReportStatus)
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date in the last 30 days
    
    // Generate sample result data for completed reports
    let resultData;
    if (status === ReportStatus.COMPLETED) {
      switch (data.type) {
        case ReportType.SALES:
          resultData = {
            totalSales: Math.floor(Math.random() * 10000) + 1000,
            totalRevenue: parseFloat((Math.random() * 50000 + 10000).toFixed(2)),
            topSellingGame: 'Cosmic Explorers',
            dailyBreakdown: [
              { date: '2025-03-01', sales: 120, revenue: 5999.88 },
              { date: '2025-03-02', sales: 145, revenue: 7249.55 },
              // More data would be here in a real report
            ]
          }
          break
        case ReportType.USER_ACTIVITY:
          resultData = {
            activeUsers: Math.floor(Math.random() * 5000) + 1000,
            averageSessionDuration: Math.floor(Math.random() * 30) + 10,
            conversionRate: parseFloat((Math.random() * 10).toFixed(2)),
            peakHours: [18, 19, 20, 21] // 6 PM - 9 PM
          }
          break
        default:
          resultData = {
            generatedAt: new Date().toISOString(),
            summary: 'This is a sample report result'
          }
      }
    }
    
    const report = await prisma.report.create({
      data: {
        ...data,
        createdById,
        status,
        scheduledAt: Math.random() > 0.5 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null, // 7 days in the future for some
        completedAt: status === ReportStatus.COMPLETED ? new Date() : null,
        resultData,
        createdAt,
        updatedAt: new Date()
      }
    })
    
    reports.push(report)
  }
  
  console.log(`Created ${reports.length} reports`)
  return reports
}

async function createAuditLogs(users: string | any[]) {
  console.log('Creating audit logs...')
  
  const auditLogs = []
  
  const actionTypes = [
    'USER_LOGIN',
    'USER_LOGOUT',
    'USER_CREATED',
    'USER_UPDATED',
    'USER_DELETED',
    'GAME_CREATED',
    'GAME_UPDATED',
    'GAME_DELETED',
    'TRANSACTION_CREATED',
    'SETTINGS_UPDATED',
    'PERMISSION_GRANTED',
    'PERMISSION_REVOKED'
  ]
  
  // Create 30 random audit logs
  for (let i = 0; i < 30; i++) {
    const action = actionTypes[Math.floor(Math.random() * actionTypes.length)]
    const user = users[Math.floor(Math.random() * users.length)]
    
    let entityType, details
    
    switch (action) {
      case 'USER_LOGIN':
      case 'USER_LOGOUT':
        entityType = 'User'
        details = {
          userId: user.id,
          email: user.email,
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        }
        break
      case 'USER_CREATED':
      case 'USER_UPDATED':
      case 'USER_DELETED':
        entityType = 'User'
        details = {
          userId: randomUUID(),
          email: `user${Math.floor(Math.random() * 1000)}@example.com`,
          changes: action === 'USER_UPDATED' ? { role: ['user', 'admin'][Math.floor(Math.random() * 2)] } : null
        }
        break
      case 'GAME_CREATED':
      case 'GAME_UPDATED':
      case 'GAME_DELETED':
        entityType = 'Game'
        details = {
          gameId: randomUUID(),
          title: ['New Game', 'Updated Game', 'Cosmic Explorers'][Math.floor(Math.random() * 3)],
          changes: action === 'GAME_UPDATED' ? { price: 59.99, discountPrice: 49.99 } : null
        }
        break
      case 'TRANSACTION_CREATED':
        entityType = 'Transaction'
        details = {
          transactionId: randomUUID(),
          amount: parseFloat((Math.random() * 100).toFixed(2)),
          status: 'COMPLETED'
        }
        break
      default:
        entityType = 'System'
        details = {
          component: ['Auth', 'Payments', 'Storage'][Math.floor(Math.random() * 3)],
          changes: { enabled: true, config: { timeout: 30000 } }
        }
    }
    
    const auditLog = await prisma.auditLog.create({
      data: {
        userId: user.id,
        action,
        entityType,
        entityId: details.userId || details.gameId || details.transactionId || null,
        details,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date in the last 30 days
      }
    })
    
    auditLogs.push(auditLog)
  }
  
  console.log(`Created ${auditLogs.length} audit logs`)
  return auditLogs
}

// Call the main function
main()
  .catch((e) => {
    console.error('Error in seed script:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
