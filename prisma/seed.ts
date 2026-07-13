import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@thekerala.store";
const adminPassword = process.env.ADMIN_PASSWORD || "change-this-password";

const leafCategories = [
  { name: "HOME", slug: "home", sortOrder: 10 },
  { name: "SPICES", slug: "spices", sortOrder: 20 },
  { name: "FOOD", slug: "food", sortOrder: 30 },
  { name: "CARE", slug: "care", sortOrder: 40 },
  { name: "APPAREL", slug: "apparel", sortOrder: 50 },
];

const products: Array<{
  name: string;
  slug: string;
  categorySlug: string;
  price: string;
  stock: number;
  sizes: string[];
  colors: string[];
  material: string;
  itemImageUrl: string;
  modelImageUrl: string;
  parentSlug?: string;
}> = [
  {
    name: "Malabar Black Pepper",
    slug: "malabar-black-pepper",
    categorySlug: "spices",
    price: "48.00",
    stock: 80,
    sizes: ["100g", "250g"],
    colors: ["Natural"],
    material: "Whole black pepper",
    itemImageUrl:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
    modelImageUrl:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Green Cardamom Pods",
    slug: "green-cardamom-pods",
    categorySlug: "spices",
    price: "62.00",
    stock: 60,
    sizes: ["50g", "100g"],
    colors: ["Green"],
    material: "Dried green cardamom",
    itemImageUrl:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
    modelImageUrl:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Nilgiri Leaf Tea",
    slug: "nilgiri-leaf-tea",
    categorySlug: "food",
    price: "54.00",
    stock: 70,
    sizes: ["100g", "250g"],
    colors: ["Natural"],
    material: "Black tea leaves",
    itemImageUrl:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80",
    modelImageUrl:
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Kasavu Stole",
    slug: "kasavu-stole",
    categorySlug: "apparel",
    price: "186.00",
    stock: 25,
    sizes: ["One size"],
    colors: ["Ivory", "Gold"],
    material: "Cotton handloom",
    itemImageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
    modelImageUrl:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Brass Nilavilakku",
    slug: "brass-nilavilakku",
    categorySlug: "home",
    price: "220.00",
    stock: 18,
    sizes: ["One size"],
    colors: ["Brass"],
    material: "Solid brass",
    parentSlug: "gifts",
    itemImageUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=80",
    modelImageUrl:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Virgin Coconut Oil",
    slug: "virgin-coconut-oil",
    categorySlug: "care",
    price: "72.00",
    stock: 55,
    sizes: ["250ml", "500ml"],
    colors: ["Natural"],
    material: "Virgin coconut oil",
    itemImageUrl:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80",
    modelImageUrl:
      "https://images.unsplash.com/photo-1608571421850-a6e8f1c5b5b3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Ayurvedic Soap Trio",
    slug: "ayurvedic-soap-trio",
    categorySlug: "care",
    price: "58.00",
    stock: 40,
    sizes: ["Set"],
    colors: ["Assorted"],
    material: "Herbal soap base",
    parentSlug: "gifts",
    itemImageUrl:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80",
    modelImageUrl:
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Coir Market Basket",
    slug: "coir-market-basket",
    categorySlug: "home",
    price: "95.00",
    stock: 30,
    sizes: ["One size"],
    colors: ["Natural"],
    material: "Natural coir",
    itemImageUrl:
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80",
    modelImageUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=80",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "The Kerala Store Admin",
      passwordHash,
      role: "ADMIN",
    },
    create: {
      name: "The Kerala Store Admin",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      siteName: "The Kerala Store",
      metaTitle: "The Kerala Store · കേരള സ്റ്റോർ",
      metaDescription:
        "Jewellery, beauty, spices and home — curated Kerala essentials.",
      currency: "INR",
    },
    create: {
      id: "default",
      siteName: "The Kerala Store",
      metaTitle: "The Kerala Store · കേരള സ്റ്റോർ",
      metaDescription:
        "Jewellery, beauty, spices and home — curated Kerala essentials.",
      currency: "INR",
    },
  });

  const women = await prisma.category.upsert({
    where: { slug: "women" },
    update: {
      name: "WOMEN",
      sortOrder: 0,
      isVisible: true,
      parentId: null,
    },
    create: {
      name: "WOMEN",
      slug: "women",
      sortOrder: 0,
      isVisible: true,
    },
  });

  const kids = await prisma.category.upsert({
    where: { slug: "kids" },
    update: {
      name: "KIDS",
      sortOrder: 1,
      isVisible: true,
      parentId: null,
    },
    create: {
      name: "KIDS",
      slug: "kids",
      sortOrder: 1,
      isVisible: true,
    },
  });

  const men = await prisma.category.upsert({
    where: { slug: "men" },
    update: {
      name: "MEN",
      sortOrder: 2,
      isVisible: true,
      parentId: null,
    },
    create: {
      name: "MEN",
      slug: "men",
      sortOrder: 2,
      isVisible: true,
    },
  });

  for (const category of leafCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        sortOrder: category.sortOrder,
        isVisible: true,
        parentId: women.id,
      },
      create: {
        ...category,
        isVisible: true,
        parentId: women.id,
      },
    });
  }

  for (const slug of ["care", "apparel"]) {
    await prisma.category.upsert({
      where: { slug: `kids-${slug}` },
      update: {
        name: slug.toUpperCase(),
        sortOrder: slug === "apparel" ? 50 : 40,
        isVisible: true,
        parentId: kids.id,
      },
      create: {
        name: slug.toUpperCase(),
        slug: `kids-${slug}`,
        sortOrder: slug === "apparel" ? 50 : 40,
        isVisible: true,
        parentId: kids.id,
      },
    });
  }

  for (const slug of ["apparel", "home"]) {
    await prisma.category.upsert({
      where: { slug: `men-${slug}` },
      update: {
        name: slug.toUpperCase(),
        sortOrder: slug === "apparel" ? 50 : 10,
        isVisible: true,
        parentId: men.id,
      },
      create: {
        name: slug.toUpperCase(),
        slug: `men-${slug}`,
        sortOrder: slug === "apparel" ? 50 : 10,
        isVisible: true,
        parentId: men.id,
      },
    });
  }

  await prisma.category.updateMany({
    where: { slug: { in: ["rep", "non-rep", "t-shirts", "shoes", "chains", "bottom", "accessories", "headwear"] } },
    data: { isVisible: false },
  });

  const categoryRecords = await prisma.category.findMany({
    where: {
      slug: {
        in: [
          ...leafCategories.map((category) => category.slug),
          "gift-home",
          "gift-care",
        ],
      },
    },
  });
  const categoryBySlug = new Map(categoryRecords.map((category) => [category.slug, category]));

  for (const [index, product] of products.entries()) {
    const categorySlug =
      product.parentSlug === "gifts"
        ? product.categorySlug === "home"
          ? "gift-home"
          : product.categorySlug === "care"
            ? "gift-care"
            : product.categorySlug
        : product.categorySlug;
    const category = categoryBySlug.get(categorySlug);

    if (!category) {
      continue;
    }

    const savedProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        shortDescription: "Curated from Kerala for everyday living.",
        longDescription:
          "Sourced with care from Kerala — authentic materials, thoughtful packing, ready for your home.",
        brand: "The Kerala Store",
        price: Number(product.price),
        stock: product.stock,
        sizes: product.sizes,
        colors: product.colors,
        tags: ["kerala", "thekerala.store", product.categorySlug],
        material: product.material,
        status: "ACTIVE",
        featured: index < 4,
        newArrival: index >= 5,
        homepageOrder: index + 1,
        categoryId: category.id,
      },
      create: {
        name: product.name,
        slug: product.slug,
        shortDescription: "Curated from Kerala for everyday living.",
        longDescription:
          "Sourced with care from Kerala — authentic materials, thoughtful packing, ready for your home.",
        brand: "The Kerala Store",
        price: Number(product.price),
        sku: `KS-${String(index + 1).padStart(3, "0")}`,
        stock: product.stock,
        sizes: product.sizes,
        colors: product.colors,
        tags: ["kerala", "thekerala.store", product.categorySlug],
        material: product.material,
        status: "ACTIVE",
        featured: index < 4,
        newArrival: index >= 5,
        homepageOrder: index + 1,
        categoryId: category.id,
      },
    });

    await prisma.productMedia.deleteMany({
      where: { productId: savedProduct.id },
    });

    await prisma.productMedia.createMany({
      data: [
        {
          productId: savedProduct.id,
          url: product.itemImageUrl,
          kind: "ITEM",
          alt: `${product.name} image 1`,
          sortOrder: 0,
        },
        {
          productId: savedProduct.id,
          url: product.modelImageUrl,
          kind: "ITEM",
          alt: `${product.name} image 2`,
          sortOrder: 1,
        },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
