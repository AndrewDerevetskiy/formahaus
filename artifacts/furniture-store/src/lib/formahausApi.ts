export type ApiProduct = {
  id: string | number;
  vendor_id?: string | number | null;
  vendorId?: string | number | null;
  category_id?: string;
  categoryId?: string;
  category_name?: string;
  categoryName?: string;
  name?: string;
  nameUa?: string;
  description?: string;
  descUa?: string;
  price: string | number;
  image_url?: string;
  imageUrl?: string;
  model_path?: string | null;
  modelPath?: string | null;
  designer_type?: string | null;
  designerType?: string | null;
  vendor_name?: string | null;
  vendorName?: string | null;
  stock?: number;
  rating?: number;
  reviewsCount?: number;
  reviews_count?: number;
  status?: string;
};

export type NormalizedProduct = {
  id: string;
  productId: string;
  nameUa: string;
  descUa: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  categoryName: string;
  designerType: string;
  vendorName: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  has3DModel: boolean;
};

export const API_BASE = "";

export function normalizeProduct(p: ApiProduct): NormalizedProduct {
  const designerType = String(p.designerType ?? p.designer_type ?? "");
  const imageUrl = String(
    p.imageUrl ??
    p.image_url ??
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80"
  );

  return {
    id: String(p.id),
    productId: String(p.id),
    nameUa: String(p.nameUa ?? p.name ?? "Товар"),
    descUa: String(p.descUa ?? p.description ?? "Опис товару"),
    price: Number(p.price ?? 0),
    imageUrl,
    categoryId: String(p.categoryId ?? p.category_id ?? "other"),
    categoryName: String(p.categoryName ?? p.category_name ?? p.category_id ?? "Категорія"),
    designerType,
    vendorName: String(p.vendorName ?? p.vendor_name ?? "Продавець"),
    stock: Number(p.stock ?? 1),
    rating: Number(p.rating ?? 4.8),
    reviewsCount: Number(p.reviewsCount ?? p.reviews_count ?? 0),
    has3DModel: Boolean(designerType),
  };
}

export async function getProducts(): Promise<NormalizedProduct[]> {
  const res = await fetch(`${API_BASE}/api/products`);
  if (!res.ok) throw new Error("Не вдалося завантажити товари");
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeProduct) : [];
}

export async function getProduct(id: string): Promise<NormalizedProduct | null> {
  const products = await getProducts();
  return products.find(p => p.id === id || p.designerType === id) ?? null;
}

export async function createOrder(payload: unknown) {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Не вдалося створити замовлення");
  }

  return res.json();
}

export async function createProduct(payload: unknown) {
  const res = await fetch(`${API_BASE}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Не вдалося створити товар");
  }

  return res.json();
}
