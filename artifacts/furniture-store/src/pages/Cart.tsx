import { useState } from "react";
import { Link } from "wouter";
import {
  ShoppingCart, Trash2, ArrowLeft, Box, ChevronRight,
  CheckCircle2, Package, Paintbrush, Layers,
} from "lucide-react";
import { useCart, FLOOR_MATERIALS, WALL_COLORS, ROOM_AREA_M2 } from "../context/CartContext";

/* ─── format ─────────────────────────────────────────────── */
const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });

/* ─── Category icon map ───────────────────────────────────── */
const CAT_ICON: Record<string, string> = {
  sofa: "🛋️", armchair: "💺", bench: "🪑",
  coffee: "☕", dining: "🍽️", side: "🔲",
  bookshelf: "📚", cabinet: "🗄️",
  floorlamp: "💡", pendant: "🔦",
  plant: "🌿", rug_classic: "🟫", rug_round: "⭕", rug_runner: "▬",
};

/* ─── Checkout Modal ──────────────────────────────────────── */
function CheckoutModal({ onClose }: { onClose: () => void }) {
  const { items, floorKind, wallColorId, furnitureTotal, floorTotal, wallTotal, grandTotal } = useCart();
  const [done, setDone] = useState(false);

  if (done) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-3">Замовлення прийнято!</h2>
        <p className="text-gray-500 mb-2">Дякуємо за покупку у FormaHaus.</p>
        <p className="text-gray-400 text-sm mb-8">Менеджер зв'яжеться з вами протягом 24 годин для підтвердження та узгодження доставки.</p>
        <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Підсумок замовлення</div>
          <div className="flex justify-between text-sm text-gray-700 mb-1"><span>Меблі ({items.length} шт.)</span><span className="font-bold">{fmt(furnitureTotal)}</span></div>
          <div className="flex justify-between text-sm text-gray-700 mb-1"><span>Оздоблення підлоги</span><span className="font-bold">{fmt(floorTotal)}</span></div>
          <div className="flex justify-between text-sm text-gray-700 mb-3"><span>Оздоблення стін</span><span className="font-bold">{fmt(wallTotal)}</span></div>
          <div className="border-t border-gray-200 pt-3 flex justify-between font-black text-gray-900"><span>Разом</span><span className="text-blue-600 text-lg">{fmt(grandTotal)}</span></div>
        </div>
        <Link href="/">
          <button className="w-full h-12 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors" onClick={onClose}>
            На головну
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-8 py-6">
          <h2 className="text-xl font-black text-white mb-1">Оформлення замовлення</h2>
          <p className="text-gray-400 text-sm">Перевірте склад замовлення перед підтвердженням</p>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto">
          {/* Furniture list */}
          {items.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                <Package size={14} /> Меблі та декор
              </div>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{CAT_ICON[item.type] ?? "🛋️"}</span>
                      <span className="text-sm font-semibold text-gray-800">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{fmt(item.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Floor */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              <Layers size={14} /> Підлога
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{FLOOR_MATERIALS.find(f=>f.id===floorKind)?.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{ROOM_AREA_M2} м² × {fmt(FLOOR_MATERIALS.find(f=>f.id===floorKind)?.pricePerM2 ?? 0)}/м²</div>
                </div>
                <div className="font-bold text-gray-900">{fmt(floorTotal)}</div>
              </div>
            </div>
          </div>

          {/* Walls */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              <Paintbrush size={14} /> Стіни
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-800 text-sm">{WALL_COLORS.find(w=>w.id===wallColorId)?.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">Фарбування 3 стін (~121 м²)</div>
              </div>
              <div className="font-bold text-gray-900">{fmt(wallTotal)}</div>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 pt-5 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Меблі та декор</span><span className="font-semibold">{fmt(furnitureTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Підлога</span><span className="font-semibold">{fmt(floorTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Стіни</span><span className="font-semibold">{fmt(wallTotal)}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-gray-900 pt-3 border-t border-gray-100">
              <span>Разом</span>
              <span className="text-blue-600">{fmt(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-gray-400 transition-colors"
          >
            Назад
          </button>
          <button
            onClick={() => setDone(true)}
            className="flex-1 h-12 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Підтвердити замовлення
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── CART PAGE ───────────────────────────────────────────── */
export default function Cart() {
  const {
    items, removeItem, clearItems,
    floorKind, wallColorId,
    furnitureTotal, floorTotal, wallTotal, grandTotal,
    itemCount,
  } = useCart();

  const [checkout, setCheckout] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {checkout && <CheckoutModal onClose={() => setCheckout(false)} />}

      {/* ── NAV ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <span className="text-xl font-black tracking-widest text-gray-900 cursor-pointer select-none">
              FORMA<span className="font-light text-blue-600">HAUS</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/designer">
              <button className="flex items-center gap-2 px-4 h-9 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors">
                <Box size={15} /> 3D Designer
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Page title */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <button className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 transition-colors text-gray-500">
              <ArrowLeft size={16} />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Кошик</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {itemCount > 0 ? `${itemCount} меблів + підлога + стіни` : "Кошик порожній"}
            </p>
          </div>
        </div>

        {itemCount === 0 && (
          /* ── EMPTY STATE ── */
          <div className="bg-white rounded-3xl p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart size={36} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Кошик порожній</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
              Відкрийте 3D-дизайнер, розставте меблі в кімнаті — вони автоматично з'являться тут.
            </p>
            <Link href="/designer">
              <button className="flex items-center gap-2 px-8 h-12 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors mx-auto">
                <Box size={16} /> Відкрити 3D Designer
              </button>
            </Link>
          </div>
        )}

        {itemCount > 0 && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* ── LEFT: line items ── */}
            <div className="flex-1 space-y-4">

              {/* Furniture section */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-blue-600" />
                    <span className="text-sm font-black text-gray-900">Меблі та декор</span>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{itemCount}</span>
                  </div>
                  <button
                    onClick={clearItems}
                    className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Очистити все
                  </button>
                </div>

                <div className="divide-y divide-gray-50">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        {CAT_ICON[item.type] ?? "🛋️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">{item.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5">Додано з 3D-редактора</div>
                      </div>
                      <div className="text-base font-black text-gray-900 flex-shrink-0">
                        {fmt(item.price)}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-3 bg-gray-50 flex justify-between text-sm">
                  <span className="text-gray-500 font-semibold">Підсумок меблів</span>
                  <span className="font-black text-gray-900">{fmt(furnitureTotal)}</span>
                </div>
              </div>

              {/* Floor section */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <Layers size={16} className="text-blue-600" />
                  <span className="text-sm font-black text-gray-900">Оздоблення підлоги</span>
                </div>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      {FLOOR_MATERIALS.find(f=>f.id===floorKind)?.label ?? floorKind}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {ROOM_AREA_M2} м² × {fmt(FLOOR_MATERIALS.find(f=>f.id===floorKind)?.pricePerM2 ?? 0)}/м²
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-gray-900">{fmt(floorTotal)}</div>
                    <div className="text-xs text-gray-400">матеріал + укладання</div>
                  </div>
                </div>
                <div className="px-6 pb-4">
                  <Link href="/designer">
                    <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      Змінити матеріал у 3D-редакторі <ChevronRight size={12} />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Wall section */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <Paintbrush size={16} className="text-blue-600" />
                  <span className="text-sm font-black text-gray-900">Оздоблення стін</span>
                </div>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      {WALL_COLORS.find(w=>w.id===wallColorId)?.label ?? wallColorId}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Фарбування 3 стін, ~121 м²
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-gray-900">{fmt(wallTotal)}</div>
                    <div className="text-xs text-gray-400">матеріал + робота</div>
                  </div>
                </div>
                <div className="px-6 pb-4">
                  <Link href="/designer">
                    <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      Змінити колір у 3D-редакторі <ChevronRight size={12} />
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* ── RIGHT: order summary ── */}
            <div className="w-full lg:w-80 flex-shrink-0 sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50">
                  <h2 className="text-sm font-black text-gray-900">Підсумок замовлення</h2>
                </div>

                <div className="px-6 py-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Меблі та декор ({itemCount} шт.)</span>
                    <span className="font-semibold text-gray-800">{fmt(furnitureTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Підлога ({ROOM_AREA_M2} м²)</span>
                    <span className="font-semibold text-gray-800">{fmt(floorTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Стіни</span>
                    <span className="font-semibold text-gray-800">{fmt(wallTotal)}</span>
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="font-black text-gray-900">Разом</span>
                    <span className="text-xl font-black text-blue-600">{fmt(grandTotal)}</span>
                  </div>
                </div>

                <div className="px-6 pb-6 space-y-3">
                  <button
                    onClick={() => setCheckout(true)}
                    className="w-full h-12 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Checkout
                    <ChevronRight size={16} />
                  </button>
                  <Link href="/designer">
                    <button className="w-full h-11 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:border-gray-400 transition-colors flex items-center justify-center gap-2">
                      <Box size={15} /> Продовжити в 3D
                    </button>
                  </Link>
                </div>

                {/* Benefits */}
                <div className="px-6 pb-6 space-y-2">
                  {[
                    { icon: "🚚", text: "Безкоштовна доставка від $500" },
                    { icon: "🛡️", text: "Гарантія 3 роки на всі вироби" },
                    { icon: "🔄", text: "Повернення протягом 30 днів" },
                  ].map(b => (
                    <div key={b.text} className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{b.icon}</span>
                      <span>{b.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
