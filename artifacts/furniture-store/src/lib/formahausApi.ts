import { supabase } from "./supabase";

export type ApiProduct = {
  id: string | number;
  vendor_id?: string | number | null;
  vendorId?: string | number | null;
  category_id?: string | null;
  categoryId?: string | null;
  category_name?: string | null;
  categoryName?: string | null;
  name?: string | null;
  nameUa?: string | null;
  description?: string | null;
  descUa?: string | null;
  price?: string | number | null;
  image_url?: string | null;
  imageUrl?: string | null;
  model_3d_url?: string | null;
  model_url?: string | null;
  model_path?: string | null;
  modelPath?: string | null;
  designer_type?: string | null;
  designerType?: string | null;
  vendor_name?: string | null;
  vendorName?: string | null;
  stock?: number | null;
  rating?: number | null;
  reviewsCount?: number | null;
  reviews_count?: number | null;
  status?: string | null;

  categories?: {
    name?: string | null;
  } | null;

  vendors?: {
    company_name?: string | null;
  } | null;

  product_images?: Array<{
    image_url?: string | null;
  }> | null;

  product_models?: Array<{
    model_url?: string | null;
  }> | null;
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

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80";

function firstProductImage(p: ApiProduct) {
  return p.product_images?.[0]?.image_url || "";
}

function firstProductModel(p: ApiProduct) {
  return p.product_models?.[0]?.model_url || "";
}

export function normalizeProduct(p: ApiProduct): NormalizedProduct {
  const modelUrl = String(
    p.model_3d_url ??
      p.model_url ??
      p.modelPath ??
      p.model_path ??
      firstProductModel(p) ??
      ""
  );

  const designerType = String(
    p.designerType ??
      p.designer_type ??
      (modelUrl ? "furniture" : "")
  );

  const imageUrl = String(
    p.imageUrl ??
      p.image_url ??
      firstProductImage(p) ??
      DEFAULT_IMAGE
  );

  return {
    id: String(p.id),
    productId: String(p.id),
    nameUa: String(p.nameUa ?? p.name ?? "Товар"),
    descUa: String(p.descUa ?? p.description ?? "Опис товару"),
    price: Number(p.price ?? 0),
    imageUrl,
    categoryId: String(p.categoryId ?? p.category_id ?? "other"),
    categoryName: String(
      p.categoryName ??
        p.category_name ??
        p.categories?.name ??
        "Категорія"
    ),
    designerType,
    vendorName: String(
      p.vendorName ??
        p.vendor_name ??
        p.vendors?.company_name ??
        "FormaHaus"
    ),
    stock: Number(p.stock ?? 1),
    rating: Number(p.rating ?? 4.8),
    reviewsCount: Number(p.reviewsCount ?? p.reviews_count ?? 0),
    has3DModel: Boolean(modelUrl || designerType),
  };
}

export async function getProducts(): Promise<NormalizedProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      vendor_id,
      category_id,
      name,
      description,
      price,
      stock,
      model_3d_url,
      created_at,
      categories(name),
      vendors(company_name),
      product_images(image_url),
      product_models(model_url)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase getProducts error:", error);
    throw new Error("Не вдалося завантажити товари з Supabase");
  }

  return Array.isArray(data)
    ? (data as ApiProduct[]).map(normalizeProduct)
    : [];
}

export async function getProduct(id: string): Promise<NormalizedProduct | null> {
  const products = await getProducts();
  return products.find(p => p.id === id || p.designerType === id) ?? null;
}

export async function createOrder(payload: any) {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      profile_id: payload?.profile_id ?? null,
      total_price: Number(payload?.total_price ?? payload?.totalPrice ?? 0),
      status: payload?.status ?? "new",
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase createOrder error:", error);
    throw new Error("Не вдалося створити замовлення");
  }

  return data;
}

export async function createProduct(payload: any) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      vendor_id: payload?.vendor_id ?? payload?.vendorId ?? null,
      category_id: payload?.category_id ?? payload?.categoryId ?? null,
      name: payload?.name ?? payload?.nameUa ?? "Новий товар",
      description: payload?.description ?? payload?.descUa ?? "",
      price: Number(payload?.price ?? 0),
      stock: Number(payload?.stock ?? 0),
      model_3d_url: payload?.model_3d_url ?? payload?.model3dUrl ?? payload?.modelUrl ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase createProduct error:", error);
    throw new Error("Не вдалося створити товар");
  }

  return data;
}
