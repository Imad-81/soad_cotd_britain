import { PrismaClient } from "@prisma/client";
import { auth } from "../lib/auth";

const prisma = new PrismaClient();

const themes = [
  {
    slug: "dukes-blue-gallery",
    title: "The Duke's Blue Long Library",
    subtitle: "Kenwood & Syon House Heritage",
    era: "Robert Adam Neoclassical (c. 1775)",
    description: "An exquisite neoclassical salon lined with arched bookshelves, delicate pastel blue damask, gilded candelabra, and intricate plasterwork medallions. Capture symmetry, refined elegance, and literary grandeur.",
    imagePath: "/background/theme_1.jpg",
    order: 1,
  },
  {
    slug: "jacobean-long-gallery",
    title: "Jacobean Manor Long Gallery",
    subtitle: "Haddon & Hardwick Country Estate",
    era: "Jacobean Heritage (c. 1610)",
    description: "Distinguished by geometric ribbed plaster ceilings, tall mullioned leaded windows, and aged English oak wall paneling. Reinterpret the interplay of natural northern daylight across weathered wood, historical tapestries, or ethereal silhouettes.",
    imagePath: "/background/theme_2.jpg",
    order: 2,
  },
  {
    slug: "state-banquet-chamber",
    title: "The State Banquet Chamber",
    subtitle: "Blenheim Palace State Apartments",
    era: "High Baroque (c. 1720)",
    description: "A lavish banqueting suite set with golden centrepieces, crystal stemware, monumental tapestries, and twin gilded mirrors. An ideal canvas for celebrating feast culture, court intrigue, or nocturnal banquets.",
    imagePath: "/background/theme_3.jpg",
    order: 3,
  },
  {
    slug: "lady-chapel-westminster",
    title: "Henry VII Lady Chapel",
    subtitle: "Westminster Abbey, London",
    era: "Perpendicular Gothic (c. 1516)",
    description: "World-famous for its breathtaking fan-vaulted stone ceiling, intricately carved choir stalls, and heraldic banners of the Knights of the Bath. Reinterpret sacred gothic geometry, heraldry, or mystical illumination.",
    imagePath: "/background/theme_4.jpg",
    order: 4,
  },
];

async function main() {
  console.log("🌱 Seeding competition data...");

  // 1. Initialize Competition Configuration
  await prisma.competitionConfig.upsert({
    where: { id: "global" },
    update: {
      subtitle: "School of Arts and Design (SOAD) • An open British artistic competition inviting creators across the globe to reinterpret the grandeur of historic British interiors.",
    },
    create: {
      id: "global",
      title: "Crown of the Realm: British Heritage & Creative Challenge",
      subtitle: "School of Arts and Design (SOAD) • An open British artistic competition inviting creators across the globe to reinterpret the grandeur of historic British interiors.",
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

  // 4. Remove any legacy themes outside of the 4 requested themes
  const activeSlugs = themes.map((t) => t.slug);
  const defaultTheme = await prisma.theme.findUnique({
    where: { slug: "dukes-blue-gallery" },
  });
  if (defaultTheme) {
    await prisma.submission.updateMany({
      where: { theme: { slug: { notIn: activeSlugs } } },
      data: { themeId: defaultTheme.id },
    });
    await prisma.theme.deleteMany({
      where: { slug: { notIn: activeSlugs } },
    });
    console.log("✓ Removed legacy themes, exactly 4 requested themes active in database");
  }
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
