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
  model3dUrl?: string;
  oldPrice?: number;
  status?: string;
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80";

function designerTypeByCategory(category: string) {
  const value = String(category || "").toLowerCase();

  if (value.includes("освіт") || value.includes("ламп") || value.includes("люстр")) return "floorlamp";
  if (value.includes("підлог") || value.includes("ламінат") || value.includes("плит")) return "floor_product";
  if (value.includes("стін") || value.includes("обої") || value.includes("фарб")) return "wall_product";
  if (value.includes("декор") || value.includes("рослин")) return "plant";
  if (value.includes("шаф") || value.includes("комод")) return "cabinet";
  if (value.includes("крісл")) return "armchair";
  if (value.includes("стіл")) return "coffee";

  return "sofa";
}

function normalizeProduct(p: any): NormalizedProduct {
  const category = String(p.category || p.category_name || "Меблі");
  const model3dUrl = p.model_3d_url || p.model3d_url || p.model3dUrl || "";
  const designerType = String(p.designer_type || p.designerType || "") || designerTypeByCategory(category);

  return {
    id: String(p.id),
    productId: String(p.id),
    nameUa: String(p.name || p.name_ua || "Товар"),
    descUa: String(p.description || p.desc_ua || "Опис товару"),
    price: Number(p.price || 0),
    oldPrice: p.old_price ? Number(p.old_price) : undefined,
    imageUrl: String(p.image_url || p.imageUrl || p.photo_url || DEFAULT_IMAGE),
    categoryId: String(p.category_id || "all"),
    categoryName: category,
    designerType,
    vendorName: String(p.vendor_name || p.vendorName || "FormaHaus"),
    stock: Number(p.stock ?? 1),
    rating: Number(p.rating || 4.8),
    reviewsCount: Number(p.reviews_count || p.reviewsCount || 0),
    has3DModel: Boolean(p.has_3d_model) || Boolean(model3dUrl) || Boolean(p.designer_type),
    model3dUrl: model3dUrl || undefined,
    status: String(p.status || "active"),
  };
}

export async function getProducts(): Promise<NormalizedProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .neq("status", "paused")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase getProducts error:", error);
    return [];
  }

  return (data || []).map(normalizeProduct);
}

export async function getProduct(id: string): Promise<NormalizedProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Supabase getProduct error:", error);
    return null;
  }

  return data ? normalizeProduct(data) : null;
}

export async function createProduct(payload: any) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      vendor_id: payload.vendor_id || payload.vendorId || null,
      vendor_name: payload.vendor_name || payload.vendorName || "FormaHaus",
      category: payload.category || "Меблі",
      category_id: payload.category_id || payload.categoryId || null,
      name: payload.name || "Новий товар",
      description: payload.description || "",
      price: Number(payload.price || 0),
      old_price: payload.old_price || payload.oldPrice ? Number(payload.old_price || payload.oldPrice) : null,
      stock: Number(payload.stock || 0),
      image_url: payload.image_url || payload.imageUrl || null,
      model_3d_url: payload.model_3d_url || payload.model3dUrl || null,
      designer_type: payload.designer_type || payload.designerType || "",
      has_3d_model: Boolean(payload.has_3d_model || payload.has3DModel || payload.model_3d_url || payload.model3dUrl),
      status: payload.status || "active",
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase createProduct error:", error);
    throw error;
  }

  return data;
}

export async function updateProduct(id: string, payload: any) {
  const { data, error } = await supabase
    .from("products")
    .update({
      vendor_name: payload.vendor_name || payload.vendorName,
      category: payload.category,
      name: payload.name,
      description: payload.description,
      price: payload.price !== undefined ? Number(payload.price) : undefined,
      old_price: payload.old_price || payload.oldPrice ? Number(payload.old_price || payload.oldPrice) : null,
      stock: payload.stock !== undefined ? Number(payload.stock) : undefined,
      image_url: payload.image_url || payload.imageUrl,
      model_3d_url: payload.model_3d_url || payload.model3dUrl || null,
      designer_type: payload.designer_type || payload.designerType || "",
      has_3d_model: Boolean(payload.has_3d_model || payload.has3DModel || payload.model_3d_url || payload.model3dUrl),
      status: payload.status || "active",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Supabase updateProduct error:", error);
    throw error;
  }

  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("Supabase deleteProduct error:", error);
    throw error;
  }

  return true;
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
