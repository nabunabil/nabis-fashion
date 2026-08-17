import { prisma } from "../../lib/prisma";

export interface VariantInput {
  size: string;
  color?: string;
  stock: number;
  sku?: string;
}

export interface CreateProductInput {
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number;
  categoryId: number;
  variants?: VariantInput[];
}

export interface UpdateProductInput {
  title?: string;
  slug?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  categoryId?: number;
  variants?: VariantInput[];
}

export interface CreateProductImageInput {
  productId: number;
  imageUrl: string;
  publicId?: string | null;
}

const productSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  price: true,
  discountPrice: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface ProductQueryOptions {
  page?: number | undefined;
  limit?: number | undefined;
  category?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  search?: string | undefined;
  sortBy?: string | undefined;
}

export async function getPaginatedProducts(options: ProductQueryOptions = {}) {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Math.min(Number(options.limit) || 12, 100)); // Default 12 per page
  const skip = (page - 1) * limit;

  const where: any = {};

  if (options.category && options.category !== "all") {
    where.category = {
      OR: [
        { slug: { equals: options.category, mode: "insensitive" } },
        { name: { equals: options.category, mode: "insensitive" } },
      ],
    };
  }

  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    where.price = {};
    if (options.minPrice !== undefined && !isNaN(Number(options.minPrice))) {
      where.price.gte = Number(options.minPrice);
    }
    if (options.maxPrice !== undefined && !isNaN(Number(options.maxPrice))) {
      where.price.lte = Number(options.maxPrice);
    }
  }

  if (options.search && options.search.trim() !== "") {
    const q = options.search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  let orderBy: any = { createdAt: "desc" };
  if (options.sortBy === "price-low") orderBy = { price: "asc" };
  else if (options.sortBy === "price-high") orderBy = { price: "desc" };
  else if (options.sortBy === "newest") orderBy = { createdAt: "desc" };
  else if (options.sortBy === "oldest") orderBy = { createdAt: "asc" };

  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        ...productSelect,
        category: { select: { id: true, name: true, slug: true } },
        images: { select: { id: true, imageUrl: true, publicId: true } },
        variants: { select: { id: true, size: true, color: true, stock: true, sku: true } },
        _count: { select: { variants: true, images: true, reviews: true } },
      },
      take: limit,
      skip,
      orderBy,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalProducts / limit) || 1;

  return {
    products,
    totalProducts,
    totalPages,
    currentPage: page,
    limit,
  };
}

export async function getAllProducts(limit: number = 20, offset: number = 0) {
  return prisma.product.findMany({
    select: {
      ...productSelect,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        select: {
          id: true,
          imageUrl: true,
          publicId: true,
        },
      },
      variants: {
        select: {
          id: true,
          size: true,
          color: true,
          stock: true,
          sku: true,
        },
      },
      _count: {
        select: {
          variants: true,
          images: true,
          reviews: true,
        },
      },
    },
    take: limit,
    skip: offset,
    orderBy: { createdAt: "desc" },
  });
}

export async function getHomepageCategoryProducts() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    take: 3,
    orderBy: { id: "asc" },
  });

  const categoryProducts = await Promise.all(
    categories.map(async (cat) => {
      const products = await prisma.product.findMany({
        where: { categoryId: cat.id },
        select: {
          ...productSelect,
          category: { select: { id: true, name: true, slug: true } },
          images: { select: { id: true, imageUrl: true, publicId: true } },
          variants: { select: { id: true, size: true, color: true, stock: true } },
          _count: { select: { reviews: true } },
        },
        take: 4,
        orderBy: { createdAt: "desc" },
      });

      return {
        ...cat,
        products,
      };
    })
  );

  return categoryProducts;
}


export async function searchProducts(
  q: string,
  limit: number = 20,
  offset: number = 0,
) {
  const query = q.trim();
  if (!query) return [];

  return prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      ...productSelect,
      category: { select: { id: true, name: true, slug: true } },
      images: { select: { id: true, imageUrl: true } },
      variants: { select: { id: true, size: true, color: true, stock: true } },
      _count: { select: { variants: true, images: true, reviews: true } },
    },
    take: limit,
    skip: offset,
  });
}

export async function getProductById(id: number) {
  return prisma.product.findUnique({
    where: { id },
    select: {
      ...productSelect,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      variants: {
        select: {
          id: true,
          size: true,
          color: true,
          stock: true,
          sku: true,
        },
      },
      images: {
        select: {
          id: true,
          imageUrl: true,
          publicId: true,
        },
      },
      reviews: {
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug },
    select: {
      ...productSelect,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      variants: {
        select: {
          id: true,
          size: true,
          color: true,
          stock: true,
          sku: true,
        },
      },
      images: {
        select: {
          id: true,
          imageUrl: true,
          publicId: true,
        },
      },
      reviews: {
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });
}

export async function createProduct(input: CreateProductInput) {
  const created = await prisma.product.create({
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      price: input.price,
      discountPrice: input.discountPrice,
      categoryId: input.categoryId,
    },
    select: productSelect,
  });

  // Sync size-based variants if provided
  if (input.variants && input.variants.length > 0) {
    await syncProductVariants(created.id, input.variants);
  }

  return created;
}

export async function updateProduct(id: number, input: UpdateProductInput) {
  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.discountPrice !== undefined
        ? { discountPrice: input.discountPrice }
        : {}),
      ...(input.categoryId !== undefined
        ? { categoryId: input.categoryId }
        : {}),
    },
    select: productSelect,
  });

  if (input.variants && input.variants.length > 0) {
    await syncProductVariants(id, input.variants);
  }

  return updated;
}

export async function syncProductVariants(productId: number, variants: VariantInput[]) {
  for (const v of variants) {
    const size = v.size || "M";
    const color = v.color || "Default";
    const sku = v.sku || `PROD-${productId}-${color.slice(0, 3).toUpperCase()}-${size}`;
    const stock = Math.max(0, Number(v.stock) || 0);

    await prisma.productVariant.upsert({
      where: {
        productId_size_color: {
          productId,
          size,
          color,
        },
      },
      update: {
        stock,
        sku,
      },
      create: {
        productId,
        size,
        color,
        stock,
        sku,
      },
    });
  }
}

export async function deleteProduct(id: number) {
  return prisma.product.delete({
    where: { id },
    select: productSelect,
  });
}

export async function getProductImages(productId: number) {
  return prisma.productImage.findMany({
    where: { productId },
    select: {
      id: true,
      productId: true,
      imageUrl: true,
      publicId: true,
    },
    orderBy: { id: "asc" },
  });
}

export async function addProductImage(input: CreateProductImageInput) {
  return prisma.productImage.create({
    data: {
      productId: input.productId,
      imageUrl: input.imageUrl,
      publicId: input.publicId ?? null,
    },
    select: {
      id: true,
      productId: true,
      imageUrl: true,
      publicId: true,
    },
  });
}

export async function removeProductImage(id: number) {
  return prisma.productImage.delete({
    where: { id },
    select: {
      id: true,
      productId: true,
      imageUrl: true,
      publicId: true,
    },
  });
}
