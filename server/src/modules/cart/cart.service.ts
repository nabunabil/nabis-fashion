import { prisma } from "../../lib/prisma";

async function getUserIdByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return user?.id ?? null;
}

async function getOrCreateCartByUserId(userId: number) {
  const existingCart = await prisma.cart.findFirst({
    where: { userId },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (existingCart) {
    return existingCart;
  }

  return prisma.cart.create({
    data: { userId },
    select: { id: true },
  });
}

const cartItemSelect = {
  id: true,
  quantity: true,
  productVariantId: true,
  productVariant: {
    select: {
      id: true,
      size: true,
      color: true,
      stock: true,
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          discountPrice: true,
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
            },
          },
        },
      },
    },
  },
} as const;

async function getCartWithItemsByUserId(userId: number) {
  return prisma.cart.findFirst({
    where: { userId },
    select: {
      id: true,
      userId: true,
      createdAt: true,
      items: {
        select: cartItemSelect,
        orderBy: { id: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

function buildCartSummary(
  cart: Awaited<ReturnType<typeof getCartWithItemsByUserId>>,
) {
  const items = cart?.items ?? [];

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = Number(
      item.productVariant.product.discountPrice ||
        item.productVariant.product.price,
    );
    return sum + unitPrice * item.quantity;
  }, 0);

  return {
    totalItems: items.length,
    totalQuantity,
    subtotal,
  };
}

export async function getMyCart(email: string) {
  const userId = await getUserIdByEmail(email);

  if (!userId) {
    return null;
  }

  let cart = await getCartWithItemsByUserId(userId);

  if (!cart) {
    await getOrCreateCartByUserId(userId);
    cart = await getCartWithItemsByUserId(userId);
  }

  return {
    cart,
    summary: buildCartSummary(cart),
  };
}

export async function addItemToMyCart(
  email: string,
  productVariantId: number,
  quantity: number,
) {
  const userId = await getUserIdByEmail(email);

  if (!userId) {
    return null;
  }

  const productVariant = await prisma.productVariant.findUnique({
    where: { id: productVariantId },
    select: { id: true, stock: true },
  });

  if (!productVariant) {
    return null;
  }

  const cart = await getOrCreateCartByUserId(userId);

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productVariantId,
    },
    select: { id: true, quantity: true },
  });

  const requestedQuantity = (existingItem?.quantity ?? 0) + quantity;
  if (requestedQuantity > productVariant.stock) {
    throw new Error("INSUFFICIENT_STOCK");
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productVariantId,
        quantity,
      },
    });
  }

  const updatedCart = await getCartWithItemsByUserId(userId);

  return {
    cart: updatedCart,
    summary: buildCartSummary(updatedCart),
  };
}

export async function updateMyCartItemQuantity(
  email: string,
  productVariantId: number,
  quantity: number,
) {
  const userId = await getUserIdByEmail(email);

  if (!userId) {
    return null;
  }

  const cart = await getOrCreateCartByUserId(userId);

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productVariantId,
    },
    select: {
      id: true,
      productVariant: { select: { stock: true } },
    },
  });

  if (!cartItem) {
    return null;
  }

  if (quantity > cartItem.productVariant.stock) {
    throw new Error("INSUFFICIENT_STOCK");
  }

  await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { quantity },
  });

  const updatedCart = await getCartWithItemsByUserId(userId);

  return {
    cart: updatedCart,
    summary: buildCartSummary(updatedCart),
  };
}

export async function removeMyCartItem(
  email: string,
  productVariantId: number,
) {
  const userId = await getUserIdByEmail(email);

  if (!userId) {
    return null;
  }

  const cart = await getOrCreateCartByUserId(userId);

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productVariantId,
    },
    select: { id: true },
  });

  if (!cartItem) {
    return null;
  }

  await prisma.cartItem.delete({
    where: { id: cartItem.id },
  });

  const updatedCart = await getCartWithItemsByUserId(userId);

  return {
    cart: updatedCart,
    summary: buildCartSummary(updatedCart),
  };
}

export async function clearMyCart(email: string) {
  const userId = await getUserIdByEmail(email);

  if (!userId) {
    return null;
  }

  const cart = await getOrCreateCartByUserId(userId);

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  const updatedCart = await getCartWithItemsByUserId(userId);

  return {
    cart: updatedCart,
    summary: buildCartSummary(updatedCart),
  };
}
