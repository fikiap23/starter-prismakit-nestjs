// Suggested RELATION_MODEL_ALIASES entries (merge into your resolver config)
export const SUGGESTED_RELATION_MODEL_ALIASES = {
  actor: 'user',
  auditLogs: 'auditLog',
  cartItems: 'cartItem',
  children: 'category',
  fileAssets: 'fileAsset',
  images: 'productImage',
  items: 'orderItem',
  orderItems: 'orderItem',
  orders: 'order',
  parent: 'category',
  productImages: 'productImage',
  products: 'productTag',
  tags: 'productTag',
  uploadedByUser: 'user',
} as const;
