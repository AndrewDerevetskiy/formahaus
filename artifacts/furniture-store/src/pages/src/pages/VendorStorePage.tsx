import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import NavBar from "../components/NavBar";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";

type Product = {
  id: string;
  vendor_id?: string | null;
  vendor_name?: string | null;
  name?: string | null;
  description?: string | null;
  price?: number | null;
  old_price?: number | null;
  stock?: number | null;
  category?: string | null;
  image_url?: string | null;
  designer_type?: string | null;
  has_3d_model?: boolean | null;
  status?: string | null;
};

function money(value: number) {
  return `${Number(value || 0).toLocaleString("uk-UA")} грн`;
}

function defaultImage(category = "Меблі") {
  if (category.includes("Підлога") || category.includes("Плитка")) {
    return "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=700&q=80";
  }
  if (category.includes("Освітлення")) {
    return "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=700&q=80";
  }
  return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80";
}

export default function VendorStorePage() {
  const params = useParams<{ vendorId: string }>();
  const cart = useCart();

  const vendorId = params.vendorId || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const vendorName = products[0]?.vendor_name || "Магазин продавця";

  useEffect(() => {
    async function loadStore() {
      setLoading(true);

      const query = supabase
        .from("products")
        .select("*")
        .eq("status", "active")
