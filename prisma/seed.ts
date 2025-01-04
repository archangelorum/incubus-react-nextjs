import { prisma } from './prisma'

async function main() {
  // Upsert roles
  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      id: 1,
      name: "user",
    },
  });

  const contentCreatorRole = await prisma.role.upsert({
    where: { name: "content_creator" },
    update: {},
    create: {
      id: 2,
      name: "content_creator",
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      id: 3,
      name: "admin",
    },
  });

  console.log({ userRole, contentCreatorRole, adminRole });

  // Create sample users with roles
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'User Name',
      roleId: userRole.id,
      emailVerified: new Date(),
      image: 'https://example.com/user-image.png',
    },
  });

  const contentCreator = await prisma.user.create({
    data: {
      email: 'content_creator@example.com',
      name: 'Content Creator Name',
      roleId: contentCreatorRole.id,
      emailVerified: new Date(),
      image: 'https://example.com/content-creator-image.png',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin Name',
      roleId: adminRole.id,
      emailVerified: new Date(),
      image: 'https://example.com/admin-image.png',
    },
  });

  console.log({ user, contentCreator, admin });

  // Create accounts for each user (example for OAuth accounts)
  await prisma.account.create({
    data: {
      userId: user.id,
      type: 'oauth',
      provider: 'google',
      providerAccountId: 'google-account-id-user',
      refresh_token: 'refresh-token-user',
      access_token: 'access-token-user',
      expires_at: 1718497348,
      token_type: 'Bearer',
      scope: 'profile email',
      id_token: 'id-token-user',
      session_state: 'active',
    },
  });

  await prisma.account.create({
    data: {
      userId: contentCreator.id,
      type: 'oauth',
      provider: 'google',
      providerAccountId: 'google-account-id-creator',
      refresh_token: 'refresh-token-creator',
      access_token: 'access-token-creator',
      expires_at: 1718497348,
      token_type: 'Bearer',
      scope: 'profile email',
      id_token: 'id-token-creator',
      session_state: 'active',
    },
  });

  await prisma.account.create({
    data: {
      userId: admin.id,
      type: 'oauth',
      provider: 'google',
      providerAccountId: 'google-account-id-admin',
      refresh_token: 'refresh-token-admin',
      access_token: 'access-token-admin',
      expires_at: 1718497348,
      token_type: 'Bearer',
      scope: 'profile email',
      id_token: 'id-token-admin',
      session_state: 'active',
    },
  });

  // Optionally create sessions
  await prisma.session.create({
    data: {
      sessionToken: 'session-token-user',
      userId: user.id,
      expires: new Date(Date.now() + 1000 * 60 * 60), // Expires in 1 hour
    },
  });

  await prisma.session.create({
    data: {
      sessionToken: 'session-token-creator',
      userId: contentCreator.id,
      expires: new Date(Date.now() + 1000 * 60 * 60), // Expires in 1 hour
    },
  });

  await prisma.session.create({
    data: {
      sessionToken: 'session-token-admin',
      userId: admin.id,
      expires: new Date(Date.now() + 1000 * 60 * 60), // Expires in 1 hour
    },
  });

  console.log('Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
