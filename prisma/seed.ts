import { PrismaClient } from "@prisma/client";
import { auth } from "../lib/auth";

const prisma = new PrismaClient();

const themes = [
  {
    slug: "sovereign-grand-gallery",
    title: "The Sovereign's Grand Gallery",
    subtitle: "Buckingham & Windsor Royal State Apartments",
    era: "Victorian / Regency Era (c. 1838)",
    description: "A monumental royal gallery flanked by gilded Corinthian pilasters, crimson velvet seating, and monumental royal portraiture under a barrel-vaulted skylight. Artists are invited to explore royal presence, light diffusion, or reimagined imperial grandeur.",
    imagePath: "/background/input_file_0.jpg",
    order: 1,
  },
  {
    slug: "chancellors-study-library",
    title: "The High Chancellor's Study",
    subtitle: "Lord Chancellor's Private Quarters, Westminster",
    era: "Late Victorian Academic (c. 1885)",
    description: "An intimate yet scholarly haven lined with rich mahogany bookcases, crystal chandeliers, antique manuscripts, leather wingbacks, and an ornate fireplace. Consider atmospheric lighting, scholars' instruments, or whimsical nocturnal studies.",
    imagePath: "/background/input_file_1.jpg",
    order: 2,
  },
  {
    slug: "jacobean-long-gallery",
    title: "Jacobean Manor Long Gallery",
    subtitle: "Haddon & Hardwick Country Estate",
    era: "Jacobean Heritage (c. 1610)",
    description: "Distinguished by geometric ribbed plaster ceilings, tall mullioned leaded windows, and aged English oak wall paneling. Reinterpret the interplay of natural northern daylight across weathered wood, historical tapestries, or ethereal silhouettes.",
    imagePath: "/background/input_file_2.jpg",
    order: 3,
  },
  {
    slug: "emerald-drawing-room",
    title: "The Emerald Drawing Room",
    subtitle: "Spencer House & Georgian Townhouses",
    era: "Georgian Neoclassical (c. 1765)",
    description: "Vibrant silk damask walls in royal emerald green, adorned with salon-style framed paintings and mythological friezes. Revisit classical ornamentation, gilded mirrors, and aristocratic salon culture.",
    imagePath: "/background/input_file_3.jpg",
    order: 4,
  },
  {
    slug: "st-pauls-cathedral-nave",
    title: "The Cathedral Choir & Great Dome",
    subtitle: "St. Paul's Cathedral, London (Sir Christopher Wren)",
    era: "English Baroque (c. 1710)",
    description: "The awe-inspiring domed choir and organ loft, featuring monumental stone arches, gilded mosaics, and checkerboard marble flooring. Creators can celebrate monumental perspective, sacred atmospheres, or futuristic organ mechanics.",
    imagePath: "/background/input_file_4.jpg",
    order: 5,
  },
  {
    slug: "dukes-blue-gallery",
    title: "The Duke's Blue Long Library",
    subtitle: "Kenwood & Syon House Heritage",
    era: "Robert Adam Neoclassical (c. 1775)",
    description: "An exquisite neoclassical salon lined with arched bookshelves, delicate pastel blue damask, gilded candelabra, and intricate plasterwork medallions. Capture symmetry, refined elegance, and literary grandeur.",
    imagePath: "/background/input_file_5.jpg",
    order: 6,
  },
  {
    slug: "state-banquet-chamber",
    title: "The State Banquet Chamber",
    subtitle: "Blenheim Palace State Apartments",
    era: "High Baroque (c. 1720)",
    description: "A lavish banqueting suite set with golden centrepieces, crystal stemware, monumental tapestries, and twin gilded mirrors. An ideal canvas for celebrating feast culture, court intrigue, or nocturnal banquets.",
    imagePath: "/background/input_file_6.jpg",
    order: 7,
  },
  {
    slug: "lady-chapel-westminster",
    title: "Henry VII Lady Chapel",
    subtitle: "Westminster Abbey, London",
    era: "Perpendicular Gothic (c. 1516)",
    description: "World-famous for its breathtaking fan-vaulted stone ceiling, intricately carved choir stalls, and heraldic banners of the Knights of the Bath. Reinterpret sacred gothic geometry, heraldry, or mystical illumination.",
    imagePath: "/background/input_file_7.jpg",
    order: 8,
  },
  {
    slug: "crimson-grand-saloon",
    title: "The Crimson Grand Saloon",
    subtitle: "Chatsworth House Grand Chamber",
    era: "Baroque & Rococo (c. 1705)",
    description: "An opulent reception hall dominated by trompe-l'œil ceiling frescos, gilded friezes, royal crimson upholstery, and master oil portraits. Recreate dramatic chiaroscuro, modern allegorical paintings, or theatrical majesty.",
    imagePath: "/background/input_file_8.jpg",
    order: 9,
  },
  {
    slug: "ceremonial-blue-chamber",
    title: "The King's Cerulean Chamber",
    subtitle: "Hampton Court Palace",
    era: "Stuart & Georgian Transition (c. 1690)",
    description: "Draped in royal cerulean silk wall coverings with monumental equestrian portraits, carved chimneypieces, and crystal chandeliers. Explore regality, maritime British blue tones, or modern portraiture overlays.",
    imagePath: "/background/input_file_9.jpg",
    order: 10,
  },
];

async function main() {
  console.log("🌱 Seeding competition data...");

  // 1. Initialize Competition Configuration
  await prisma.competitionConfig.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      title: "Crown of the Realm: British Heritage & Creative Challenge",
      subtitle: "An open British artistic competition inviting creators across the globe to reinterpret the grandeur of historic British architecture.",
      areResultsPublished: false,
      resultsAnnouncement: "The jury has completed reviewing all submissions. The official laureates and commendations are now published.",
    },
  });
  console.log("✓ Competition config verified");

  // 2. Ensure Admin Account
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@crown.soad.ac.uk" },
  });

  if (!existingAdmin) {
    await auth.api.signUpEmail({
      body: {
        email: "admin@crown.soad.ac.uk",
        password: "CrownAdmin2026!",
        name: "Chief Curator & Admin",
      },
    });
    await prisma.user.update({
      where: { email: "admin@crown.soad.ac.uk" },
      data: { role: "ADMIN" },
    });
    console.log("✓ Admin user created (admin@crown.soad.ac.uk / CrownAdmin2026!)");
  } else {
    await prisma.user.update({
      where: { email: "admin@crown.soad.ac.uk" },
      data: { role: "ADMIN" },
    });
    console.log("✓ Admin user verified with ADMIN role");
  }

  // 3. Seed Themes
  for (const theme of themes) {
    await prisma.theme.upsert({
      where: { slug: theme.slug },
      update: {
        title: theme.title,
        subtitle: theme.subtitle,
        era: theme.era,
        description: theme.description,
        imagePath: theme.imagePath,
        order: theme.order,
      },
      create: theme,
    });
  }
  console.log(`✓ Seeded ${themes.length} British Heritage themes`);
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
