import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Starting database seeding...");

  // Clean database
  console.log("Cleaning existing database records...");
  await prisma.inventoryMovement.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  console.log("Creating categories...");
  const men = await prisma.category.create({
    data: { name: "Men", slug: "men" },
  });
  const women = await prisma.category.create({
    data: { name: "Women", slug: "women" },
  });
  const accessories = await prisma.category.create({
    data: { name: "Accessories", slug: "accessories" },
  });

  console.log("Creating products and variants...");

  // 1. Men's products
  const p1 = await prisma.product.create({
    data: {
      title: "Vanta Premium Boxer Briefs",
      slug: "vanta-premium-boxer-briefs",
      description: "Made from premium organic cotton for maximum comfort and breathability. Featuring a soft elastic waistband and perfect fit.",
      price: 15.00,
      discountPrice: 12.00,
      categoryId: men.id,
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: p1.id, imageUrl: "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800&auto=format&fit=crop&q=80" },
    ],
  });
  await prisma.productVariant.createMany({
    data: [
      { productId: p1.id, sku: "M-VAN-BOX-BLK-S", size: "S", color: "Black", stock: 50 },
      { productId: p1.id, sku: "M-VAN-BOX-BLK-M", size: "M", color: "Black", stock: 45 },
      { productId: p1.id, sku: "M-VAN-BOX-BLK-L", size: "L", color: "Black", stock: 30 },
      { productId: p1.id, sku: "M-VAN-BOX-GRY-M", size: "M", color: "Grey", stock: 25 },
      { productId: p1.id, sku: "M-VAN-BOX-GRY-L", size: "L", color: "Grey", stock: 20 },
    ],
  });

  const p2 = await prisma.product.create({
    data: {
      title: "Classic Denim Jacket",
      slug: "classic-denim-jacket",
      description: "A timeless outer layer designed with a relaxed fit and durable high-quality blue denim. Features double button chest pockets and side welt pockets.",
      price: 65.00,
      discountPrice: 50.00,
      categoryId: men.id,
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: p2.id, imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80" },
    ],
  });
  await prisma.productVariant.createMany({
    data: [
      { productId: p2.id, sku: "M-DEN-JAC-BLU-M", size: "M", color: "Blue", stock: 15 },
      { productId: p2.id, sku: "M-DEN-JAC-BLU-L", size: "L", color: "Blue", stock: 20 },
      { productId: p2.id, sku: "M-DEN-JAC-BLU-XL", size: "XL", color: "Blue", stock: 10 },
      { productId: p2.id, sku: "M-DEN-JAC-BLK-M", size: "M", color: "Black", stock: 12 },
      { productId: p2.id, sku: "M-DEN-JAC-BLK-L", size: "L", color: "Black", stock: 18 },
    ],
  });

  const p3 = await prisma.product.create({
    data: {
      title: "Essential Everyday Hoodie",
      slug: "essential-everyday-hoodie",
      description: "Ultra-soft cotton blend hoodie with front kangaroo pocket. Perfect for layering and staying warm in style.",
      price: 45.00,
      discountPrice: 35.00,
      categoryId: men.id,
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: p3.id, imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80" },
    ],
  });
  await prisma.productVariant.createMany({
    data: [
      { productId: p3.id, sku: "M-ESS-HUD-GRY-S", size: "S", color: "Grey", stock: 30 },
      { productId: p3.id, sku: "M-ESS-HUD-GRY-M", size: "M", color: "Grey", stock: 40 },
      { productId: p3.id, sku: "M-ESS-HUD-GRY-L", size: "L", color: "Grey", stock: 35 },
      { productId: p3.id, sku: "M-ESS-HUD-BLK-M", size: "M", color: "Black", stock: 25 },
      { productId: p3.id, sku: "M-ESS-HUD-BLK-L", size: "L", color: "Black", stock: 30 },
    ],
  });

  // 2. Women's products
  const p4 = await prisma.product.create({
    data: {
      title: "Striped Knit Tank Top",
      slug: "striped-knit-tank-top",
      description: "A trendy knit ribbed tank top with classic stripes. Perfect pairing for denim shorts or wide leg trousers.",
      price: 25.00,
      discountPrice: 19.99,
      categoryId: women.id,
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: p4.id, imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80" },
    ],
  });
  await prisma.productVariant.createMany({
    data: [
      { productId: p4.id, sku: "W-STP-TNK-WHT-XS", size: "XS", color: "White/Navy", stock: 15 },
      { productId: p4.id, sku: "W-STP-TNK-WHT-S", size: "S", color: "White/Navy", stock: 25 },
      { productId: p4.id, sku: "W-STP-TNK-WHT-M", size: "M", color: "White/Navy", stock: 30 },
      { productId: p4.id, sku: "W-STP-TNK-WHT-L", size: "L", color: "White/Navy", stock: 20 },
    ],
  });

  const p5 = await prisma.product.create({
    data: {
      title: "Summer Breeze Floral Dress",
      slug: "summer-breeze-floral-dress",
      description: "Flowy, lightweight wrap dress featuring a beautiful floral pattern and flattering V-neckline. Perfect for sunny days and weekend brunches.",
      price: 55.00,
      discountPrice: 42.50,
      categoryId: women.id,
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: p5.id, imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80" },
    ],
  });
  await prisma.productVariant.createMany({
    data: [
      { productId: p5.id, sku: "W-SUM-DRS-RED-S", size: "S", color: "Red", stock: 15 },
      { productId: p5.id, sku: "W-SUM-DRS-RED-M", size: "M", color: "Red", stock: 20 },
      { productId: p5.id, sku: "W-SUM-DRS-RED-L", size: "L", color: "Red", stock: 12 },
      { productId: p5.id, sku: "W-SUM-DRS-BLU-S", size: "S", color: "Blue", stock: 10 },
      { productId: p5.id, sku: "W-SUM-DRS-BLU-M", size: "M", color: "Blue", stock: 15 },
    ],
  });

  const p6 = await prisma.product.create({
    data: {
      title: "Tailored Linen Trousers",
      slug: "tailored-linen-trousers",
      description: "Elegant high-rise trousers crafted from pure breathable linen. Features wide-leg design and side pockets for functional style.",
      price: 48.00,
      discountPrice: 38.00,
      categoryId: women.id,
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: p6.id, imageUrl: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=800&auto=format&fit=crop&q=80" },
    ],
  });
  await prisma.productVariant.createMany({
    data: [
      { productId: p6.id, sku: "W-LIN-TRN-BEG-S", size: "S", color: "Beige", stock: 18 },
      { productId: p6.id, sku: "W-LIN-TRN-BEG-M", size: "M", color: "Beige", stock: 22 },
      { productId: p6.id, sku: "W-LIN-TRN-BEG-L", size: "L", color: "Beige", stock: 15 },
      { productId: p6.id, sku: "W-LIN-TRN-WHT-M", size: "M", color: "White", stock: 12 },
    ],
  });

  // 3. Accessories
  const p7 = await prisma.product.create({
    data: {
      title: "Minimalist Leather Watch",
      slug: "minimalist-leather-watch",
      description: "Sophisticated timepiece featuring a clean analog face, Japanese quartz movement, and premium brown genuine leather strap.",
      price: 89.00,
      discountPrice: 75.00,
      categoryId: accessories.id,
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: p7.id, imageUrl: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&auto=format&fit=crop&q=80" },
    ],
  });
  await prisma.productVariant.createMany({
    data: [
      { productId: p7.id, sku: "A-MIN-WCH-BRN-OS", size: "OS", color: "Brown", stock: 25 },
      { productId: p7.id, sku: "A-MIN-WCH-BLK-OS", size: "OS", color: "Black", stock: 18 },
    ],
  });

  const p8 = await prisma.product.create({
    data: {
      title: "Classic Retro Sunglasses",
      slug: "classic-retro-sunglasses",
      description: "Iconic square frame sunglasses with UV400 protective polarized lenses. Finished with gold hinge details and glossy black temples.",
      price: 30.00,
      discountPrice: 20.00,
      categoryId: accessories.id,
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: p8.id, imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80" },
    ],
  });
  await prisma.productVariant.createMany({
    data: [
      { productId: p8.id, sku: "A-RET-SGL-BLK-OS", size: "OS", color: "Black", stock: 40 },
      { productId: p8.id, sku: "A-RET-SGL-BRN-OS", size: "OS", color: "Brown Tortoise", stock: 30 },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
