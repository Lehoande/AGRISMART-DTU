"use client";
import { motion } from "framer-motion";
import {
  Star,
  ShoppingCart,
  MapPin,
  Eye,
  ShieldCheck,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, type Product } from "@/lib/agri-data";
import { useCart } from "@/lib/cart-store";
import { useNav } from "@/lib/nav-store";

export function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast();
  const addItem = useCart((s) => s.addItem);
  const navigate = useNav((s) => s.navigate);

  const badgeClass =
    product.cert === "organic"
      ? "badge-organic"
      : product.cert === "ocop"
      ? "badge-ocop"
      : product.cert === "globalgap"
      ? "badge-globalgap"
      : "badge-vietgap";

  const handleAdd = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    addItem(product);
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: product.name,
    });
  };

  const openDetail = () => {
    navigate("buyer-product-detail", { productId: product.id });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={openDetail}
      className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
    >
      <div>
        <div className="relative h-48 overflow-hidden bg-stone-50">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span
            className={`absolute top-3 left-3 ${badgeClass} text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow`}
          >
            {product.certLabel}
          </span>
          {product.isBestSeller && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
              🔥 Bán chạy
            </span>
          )}
          {product.isNew && !product.isBestSeller && (
            <span className="absolute top-3 right-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
              ✨ Mới
            </span>
          )}
          {product.oldPrice && (
            <div className="absolute bottom-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
              -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
            </div>
          )}
          {/* AgriSmart Verified badge */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur rounded-full px-2 py-1 shadow flex items-center gap-1">
            <ShieldCheck className="size-3 text-green-600" />
            <span className="text-[9px] font-bold text-green-700">Verified</span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center text-[11px] text-stone-500 gap-1 mb-1">
            <MapPin className="size-3 text-green-600" />
            <span>{product.regionLabel}</span>
          </div>
          <h3 className="font-bold text-stone-900 text-base hover:text-green-600 transition line-clamp-2 leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mt-1.5 text-xs">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span className="font-bold text-stone-800">{product.rating}</span>
            <span className="text-stone-400">({product.reviews})</span>
            <span className="mx-1 text-stone-300">·</span>
            <span className="text-green-600 font-medium">Còn {product.stock}</span>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-black text-green-700">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs text-stone-400">/ {product.unit}</span>
          {product.oldPrice && (
            <span className="text-xs text-stone-400 line-through ml-auto">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openDetail();
            }}
            className="border-green-600 text-green-700 hover:bg-green-50 text-xs font-bold h-9"
          >
            <Eye className="size-3.5 mr-1" /> Chi tiết
          </Button>
          <Button
            size="sm"
            onClick={handleAdd}
            className="bg-green-600 hover:bg-green-700 text-xs font-bold h-9 shadow"
          >
            <ShoppingCart className="size-3.5 mr-1" /> Thêm
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
