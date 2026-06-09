import { supabase } from "./supabase";

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

export async function getProducts(): Promise<NormalizedProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase getProducts error:", error);
    return [];
  }

  return (data || []).map((p: any) => ({
    id: String(p.id),
    productId: String(p.id),
    nameUa: String(p.name || "Товар"),
    descUa: String(p.description || "Опис товару"),
    price: Number(p.price || 0),
    imageUrl: DEFAULT_IMAGE,
    categoryId: String(p.category_id || "all"),
    categoryName: "Меблі",
    designerType: p.model_3d_url ? "furniture" : "",
    vendorName: "FormaHaus",
    stock: Number(p.stock || 1),
    rating: 4.8,
    reviewsCount: 0,
    has3DModel: Boolean(p.model_3d_url),
  }));
}

export async function getProduct(id: string): Promise<NormalizedProduct | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}

export async function createProduct(payload: any) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: payload.name || "Новий товар",
      description: payload.description || "",
      price: Number(payload.price || 0),
      stock: Number(payload.stock || 0),
      model_3d_url: payload.model_3d_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase createProduct error:", error);
    throw error;
  }

  return data;
}

export async function createOrder(payload: any) {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      profile_id: payload.profile_id || null,
      total_price: Number(payload.total_price || payload.totalPrice || 0),
      status: payload.status || "new",
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase createOrder error:", error);
    throw error;
  }

  return data;
}
