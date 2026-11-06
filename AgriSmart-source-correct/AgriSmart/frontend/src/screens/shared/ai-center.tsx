"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Brain, CalendarClock, Check, ClipboardCheck, Copy, FileText, MessageSquareText, RefreshCw, Sparkles, Tag, Scale, ShoppingBasket, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BuyerHeader } from "@/components/agri/buyer-header";
import { SellerLayout } from "@/components/agri/seller-layout";
import { useNav } from "@/lib/nav-store";
import { askBuyerAi, generateSellerDraft, getAiServiceHealth, getApiCategories, getApiProducts, getMyOrders, getMyProfile, getRecommendations, getSellerInsights, type ApiCategory, type ApiProduct, type SellerProductInsight } from "@/lib/api-client";
import { formatPrice, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE, type Product } from "@/lib/agri-data";
import { useCart } from "@/lib/cart-store";

type Recommendation = { id: number; name: string; price: number; unit: string; stock: number; origin: string | null; image_url: string | null; reason?: string };
const strategyLabels: Record<string, string> = {
  "personalized-rules-v2": "Gợi ý theo nhóm bạn chọn và lịch sử tương tác",
  "inventory-rules-v2": "Gợi ý theo lượng hàng còn lại",
  "inventory-fallback": "Phương án dự phòng theo nhóm và tồn kho",
};

export function AICenterPage() {
  const [accountRole, setAccountRole] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    getMyProfile().then((profile) => { if (active) setAccountRole(profile.role || "customer"); })
      .catch(() => { if (active) setAccountRole("customer"); });
    return () => { active = false; };
  }, []);

  if (accountRole === null) return <div className="min-h-screen flex items-center justify-center text-sm text-stone-500">Đang tải trợ lý AI…</div>;
  return accountRole === "seller" ? <SellerAIAssistant /> : <BuyerAICenter />;
}

export function BuyerAICenterPage() {
  return <BuyerAICenter />;
}

export function SellerAIAssistantPage() {
  return <SellerAIAssistant />;
}

function BuyerAICenter() {
  const navigate = useNav((state) => state.navigate);
  const addItem = useCart((state) => state.addItem);
  const [items, setItems] = useState<Recommendation[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [strategy, setStrategy] = useState("");
  const [explanation, setExplanation] = useState("");
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCompare, setSelectedCompare] = useState<number[]>([]);
  const [budget, setBudget] = useState("300000");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [questionProduct, setQuestionProduct] = useState("");
  const [aiError, setAiError] = useState("");
  const load = useCallback(async (selectedCategory: string) => {
    setLoading(true); setError("");
    try {
      const [result, catalog] = await Promise.all([getRecommendations(selectedCategory ? Number(selectedCategory) : undefined), getApiProducts()]);
      setItems(result.items || []); setStrategy(result.strategy || ""); setExplanation(result.explanation || "");
      setProducts(catalog.filter((product) => Number(product.stock) > 0));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không tải được gợi ý"); }
    finally { setLoading(false); }
  }, []);

  const compareItems = selectedCompare.map((id) => products.find((product) => product.id === id)).filter((product): product is ApiProduct => Boolean(product));
  const recentHarvest = useMemo(() => products.filter((product) => product.harvest_date).sort((a, b) => String(b.harvest_date).localeCompare(String(a.harvest_date))).slice(0, 6), [products]);
  const suggestedCart = useMemo(() => {
    const availableBudget = Math.max(0, Number(budget) || 0);
    const chosen: Array<{ product: ApiProduct; quantity: number }> = [];
    let subtotal = 0;
    for (const product of items) {
      const source = products.find((entry) => entry.id === product.id);
      const price = Number(source?.price ?? product.price);
      const stock = Number(source?.stock ?? product.stock);
      if (source && stock > 0 && price > 0 && subtotal + price <= availableBudget - STANDARD_SHIPPING_FEE) {
        chosen.push({ product: source, quantity: 1 }); subtotal += price;
      }
    }
    for (const row of chosen) {
      const extra = Math.min(Math.max(0, Number(row.product.stock) - row.quantity), Math.floor((availableBudget - subtotal - STANDARD_SHIPPING_FEE) / Number(row.product.price)));
      if (extra > 0) { row.quantity += extra; subtotal += extra * Number(row.product.price); }
    }
    return { rows: chosen, subtotal, shipping: subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : chosen.length ? STANDARD_SHIPPING_FEE : 0, total: subtotal + (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : chosen.length ? STANDARD_SHIPPING_FEE : 0) };
  }, [budget, items, products]);
  const addSuggestedToCart = () => {
    for (const { product, quantity } of suggestedCart.rows) {
      const cartProduct: Product = { id: String(product.id), name: product.name, category: "nongsan", categoryLabel: product.category_name || "Nông sản", price: Number(product.price), unit: product.unit, cert: "unverified", certLabel: product.certification || "Chưa xác minh", region: product.region || product.origin || "Chưa cập nhật", regionLabel: product.region || product.origin || "Chưa cập nhật", harvestPlace: product.origin || undefined, rating: Number(product.rating || 0), reviews: Number(product.reviews || 0), seller: product.farmer_name || "Gian hàng", sellerRating: 0, image: product.image_url || "/logo.svg", desc: product.description || "", batchId: product.traceability_code || "", harvestDate: product.harvest_date || "", inspectionDate: "", inspector: "", storageCondition: product.storage_condition || "", stock: Number(product.stock) };
      addItem(cartProduct, quantity);
    }
  };
  const submitQuestion = async () => {
    if (!question.trim() || !questionProduct) return;
    setAsking(true); setAiError(""); setAnswer("");
    try { const result = await askBuyerAi(question.trim(), [Number(questionProduct)]); setAnswer(result.text); }
    catch (reason) { setAiError(reason instanceof Error ? reason.message : "Trợ lý chưa trả lời được. Hãy thử lại."); }
    finally { setAsking(false); }
  };
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load(""); getApiCategories().then(setCategories).catch(() => setCategories([]));
      getAiServiceHealth().then((health) => setAiAvailable(health.available)).catch(() => setAiAvailable(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return <div className="min-h-screen bg-stone-50 pb-16"><BuyerHeader/><main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
    <section className="rounded-3xl bg-gradient-to-br from-green-900 to-green-700 p-8 text-white"><div className="mb-3 flex items-center gap-2"><Brain className="size-6 text-amber-300"/><span className="font-semibold">AgriSmart · Trợ lý nông sản</span></div><h1 className="text-3xl font-bold">Trợ lý mua sắm nông sản</h1><p className="mt-3 max-w-2xl text-green-100">Gợi ý cá nhân hóa, trả lời theo hồ sơ sản phẩm, so sánh mặt hàng, xem ngày thu hoạch khai báo và lập giỏ trong ngân sách.</p></section>
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-bold">Sản phẩm đề xuất</h2><p className="text-xs text-stone-500">{strategyLabels[strategy] || (strategy ? "Gợi ý sản phẩm" : "")}</p></div><div className="flex flex-wrap items-end gap-2"><label className="text-sm">Nhóm sản phẩm<select className="mt-1 block h-10 min-w-48 rounded-lg border bg-white px-3" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Tất cả nhóm</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><Button variant="outline" disabled={loading} onClick={() => void load(categoryId)}><Sparkles className="mr-2 size-4"/>Gợi ý cho tôi</Button><Button variant="ghost" size="icon" disabled={loading} aria-label="Tải lại gợi ý" onClick={() => void load(categoryId)}><RefreshCw className="size-4"/></Button></div></div>
    {aiAvailable === false && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Dịch vụ gợi ý đang tạm ngưng. Hệ thống đang dùng xếp hạng dự phòng theo nhóm và tồn kho.</p>}
    {explanation && <p className="text-xs text-stone-500">{explanation}</p>}
    {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}{loading && <p className="text-sm text-stone-500">Đang phân tích sản phẩm…</p>}{!loading && !error && items.length === 0 && <p className="rounded-xl border bg-white p-5 text-sm text-stone-500">Hiện chưa có sản phẩm còn hàng phù hợp.</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map((item) => <Card key={item.id} className="overflow-hidden p-0"><button className="w-full text-left" onClick={() => navigate("buyer-product-detail", { productId: String(item.id) })}><img src={item.image_url || "/logo.svg"} alt="" className="h-40 w-full object-cover"/><div className="p-4"><b>{item.name}</b><p className="mt-1 text-xs text-stone-500">{item.origin || "Nguồn gốc chưa cập nhật"} · Còn {item.stock} {item.unit}</p><p className="mt-2 min-h-8 text-xs text-green-800">{item.reason || "Còn hàng"}</p><div className="mt-3 flex items-center justify-between"><strong className="text-green-700">{formatPrice(Number(item.price))}/{item.unit}</strong><ArrowRight className="size-4"/></div></div></button></Card>)}</div>
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="p-5"><div className="mb-3 flex items-center gap-2"><MessageSquareText className="size-5 text-blue-700"/><h2 className="font-bold">Hỏi về sản phẩm và truy xuất</h2></div><p className="mb-3 text-xs text-stone-500">AI chỉ dùng dữ liệu mặt hàng đang mở bán; thông tin nguồn gốc/chứng nhận do người bán khai báo.</p><Label>Sản phẩm</Label><select className="mt-1 h-10 w-full rounded-lg border bg-white px-3" value={questionProduct} onChange={(e) => setQuestionProduct(e.target.value)}><option value="">Chọn sản phẩm</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select><Textarea className="mt-3" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ví dụ: Sản phẩm thu hoạch ở đâu? Có thông tin bảo quản không?"/><Button className="mt-3" onClick={() => void submitQuestion()} disabled={asking || !question.trim() || !questionProduct}><Send className="mr-2 size-4"/>{asking ? "Đang trả lời…" : "Hỏi trợ lý"}</Button>{aiError && <p role="alert" className="mt-3 text-sm text-red-700">{aiError}</p>}{answer && <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm"><p>{answer}</p><p className="mt-2 text-xs text-stone-500">Dựa trên dữ liệu người bán khai báo; chưa được xác minh độc lập.</p></div>}</Card>
      <Card className="p-5"><div className="mb-3 flex items-center gap-2"><Scale className="size-5 text-purple-700"/><h2 className="font-bold">So sánh sản phẩm</h2></div><p className="mb-2 text-xs text-stone-500">Chọn tối đa 3 mặt hàng. Chỉ so giá khi cùng đơn vị bán.</p><div className="flex flex-wrap gap-2">{products.map((p) => <label key={p.id} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><input type="checkbox" checked={selectedCompare.includes(p.id)} disabled={!selectedCompare.includes(p.id) && selectedCompare.length >= 3} onChange={(e) => setSelectedCompare((current) => e.target.checked ? [...current, p.id] : current.filter((id) => id !== p.id))}/>{p.name}</label>)}</div>{compareItems.length > 0 && <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{compareItems.map((p) => <th className="p-2" key={p.id}>{p.name}</th>)}</tr></thead><tbody>{([["Giá", (p: ApiProduct) => `${formatPrice(Number(p.price))}/${p.unit}`], ["Nơi thu hoạch", (p: ApiProduct) => p.origin || "Chưa khai báo"], ["Vùng trồng", (p: ApiProduct) => p.region || "Chưa khai báo"], ["Ngày thu hoạch", (p: ApiProduct) => p.harvest_date ? new Date(p.harvest_date).toLocaleDateString("vi-VN") : "Chưa khai báo"], ["Tồn kho", (p: ApiProduct) => `${p.stock} ${p.unit}`]] as Array<[string, (p: ApiProduct) => string]>).map(([label, value]) => <tr key={label} className="border-t"><th className="p-2 text-stone-500">{label}</th>{compareItems.map((p) => <td className="p-2" key={p.id}>{value(p)}</td>)}</tr>)}</tbody></table>{new Set(compareItems.map((p) => p.unit)).size > 1 && <p className="mt-2 text-xs text-amber-800">Đơn vị khác nhau, không thể kết luận mặt hàng nào rẻ hơn.</p>}</div>}</Card>
      <Card className="p-5"><div className="mb-3 flex items-center gap-2"><CalendarClock className="size-5 text-orange-600"/><h2 className="font-bold">Ngày thu hoạch khai báo</h2></div><p className="mb-3 text-xs text-stone-500">Danh sách hàng còn tồn, sắp xếp theo ngày thu hoạch người bán đã nhập; đây không phải dự báo mùa vụ.</p>{recentHarvest.length ? <ul className="space-y-2">{recentHarvest.map((p) => <li key={p.id} className="flex justify-between gap-3 rounded-lg border p-3 text-sm"><span><b>{p.name}</b><span className="block text-xs text-stone-500">{p.origin || "Chưa khai báo nơi thu hoạch"} · {p.stock} {p.unit}</span></span><span className="shrink-0">{new Date(String(p.harvest_date).slice(0, 10) + "T00:00:00").toLocaleDateString("vi-VN")}</span></li>)}</ul> : <p className="text-sm text-stone-500">Chưa có sản phẩm còn hàng khai báo ngày thu hoạch.</p>}</Card>
      <Card className="p-5"><div className="mb-3 flex items-center gap-2"><ShoppingBasket className="size-5 text-green-700"/><h2 className="font-bold">Gợi ý giỏ theo ngân sách</h2></div><Label htmlFor="buyer-ai-budget">Ngân sách đã gồm phí vận chuyển (₫)</Label><Input id="buyer-ai-budget" className="mt-1" type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)}/><p className="mt-2 text-xs text-stone-500">Ưu tiên sản phẩm được đề xuất, tối đa theo tồn kho. Ship {formatPrice(STANDARD_SHIPPING_FEE)}; miễn phí từ {formatPrice(FREE_SHIPPING_THRESHOLD)}.</p>{suggestedCart.rows.length ? <><ul className="mt-3 space-y-1 text-sm">{suggestedCart.rows.map(({ product, quantity }) => <li key={product.id}>{product.name} × {quantity} — {formatPrice(Number(product.price) * quantity)}</li>)}</ul><div className="mt-3 border-t pt-3 text-sm">Tạm tính: {formatPrice(suggestedCart.subtotal)} · Ship: {suggestedCart.shipping ? formatPrice(suggestedCart.shipping) : "Miễn phí"}<p className="font-bold">Dự kiến: {formatPrice(suggestedCart.total)}</p></div><Button className="mt-3" disabled={suggestedCart.total > Number(budget)} onClick={addSuggestedToCart}>Thêm gợi ý vào giỏ</Button></> : <p className="mt-3 text-sm text-stone-500">Chưa đủ ngân sách cho sản phẩm đề xuất và phí ship tiêu chuẩn.</p>}</Card>
    </div>
  </main></div>;
}

function SellerAIAssistant() {
  const navigate = useNav((state) => state.navigate);
  const [products, setProducts] = useState<SellerProductInsight[]>([]);
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [buyerQuestion, setBuyerQuestion] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [copied, setCopied] = useState("");
  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);
  const [generating, setGenerating] = useState<"description" | "reply" | null>(null);
  const [draftSource, setDraftSource] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [insights, sellerOrders] = await Promise.all([getSellerInsights(), getMyOrders()]);
      setProducts(insights.products); setUpdatedAt(insights.updated_at); setOrders(sellerOrders);
      setSelectedId((current) => insights.products.some((product) => String(product.id) === current) ? current : String(insights.products[0]?.id || ""));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không tải được dữ liệu gian hàng"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { getAiServiceHealth().then((health) => setGeminiConfigured(Boolean(health.geminiConfigured))).catch(() => setGeminiConfigured(false)); }, []);

  const selected = products.find((product) => String(product.id) === selectedId) || null;
  const alerts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return products.flatMap((product) => {
      const rows: Array<{ key: string; title: string; detail: string; severity: "danger" | "warning" }> = [];
      const stock = Number(product.stock);
      const threshold = Number(product.low_stock_threshold ?? 10);
      if (stock === 0) rows.push({ key: `${product.id}-out`, title: `${product.name}: đã hết hàng`, detail: "Cập nhật tồn kho trước khi tiếp tục nhận đơn.", severity: "danger" });
      else if (stock <= threshold) rows.push({ key: `${product.id}-low`, title: `${product.name}: tồn kho thấp`, detail: `Còn ${stock} ${product.unit}, ngưỡng cảnh báo ${threshold} ${product.unit}.`, severity: "warning" });
      if (!product.harvest_date) rows.push({ key: `${product.id}-date-missing`, title: `${product.name}: chưa có ngày thu hoạch`, detail: "Bổ sung ngày thu hoạch để khách theo dõi mùa vụ và truy xuất.", severity: "warning" });
      else {
        const harvest = new Date(`${String(product.harvest_date).slice(0, 10)}T00:00:00`);
        const days = Math.ceil((harvest.getTime() - today.getTime()) / 86400000);
        if (days >= 0 && days <= 14) rows.push({ key: `${product.id}-soon`, title: `${product.name}: gần ngày thu hoạch`, detail: days === 0 ? "Ngày thu hoạch đã tới theo lịch đã nhập." : `Còn khoảng ${days} ngày theo ngày thu hoạch đã nhập.`, severity: "warning" });
        if (days < -7) rows.push({ key: `${product.id}-past`, title: `${product.name}: cần xác nhận lại mùa vụ`, detail: "Ngày thu hoạch đã qua hơn 7 ngày; kiểm tra lại lô và số lượng còn bán.", severity: "warning" });
      }
      return rows;
    });
  }, [products]);

  const makeRuleDescription = () => {
    if (!selected) return;
    const parts = [`${selected.name} do gian hàng cung cấp${selected.origin ? `, có nguồn gốc tại ${selected.origin}` : ""}${selected.region ? `, thuộc vùng trồng ${selected.region}` : ""}.`];
    if (selected.harvest_date) parts.push(`Ngày thu hoạch khai báo: ${new Date(`${String(selected.harvest_date).slice(0, 10)}T00:00:00`).toLocaleDateString("vi-VN")}.`);
    if (selected.certification) parts.push(`Thông tin chứng nhận do gian hàng khai báo: ${selected.certification}; vui lòng đối chiếu giấy tờ trước khi công bố.`);
    if (selected.storage_condition) parts.push(`Bảo quản: ${selected.storage_condition}.`);
    parts.push(`Quy cách bán: ${selected.unit}. Vui lòng xem thông tin lô và tồn kho hiện tại trước khi đặt hàng.`);
    setDescriptionDraft(parts.join(" "));
  };

  const createDescription = async () => {
    if (!selected) return;
    setGenerating("description"); setDraftSource("");
    try {
      const result = await generateSellerDraft("product-description", selected as unknown as Record<string, unknown>);
      setDescriptionDraft(result.text); setDraftSource(`Bản nháp Gemini (${result.model}); hãy kiểm tra trước khi dùng.`);
    } catch {
      makeRuleDescription(); setDraftSource("Gemini chưa phản hồi; đây là bản nháp dự phòng theo dữ liệu sản phẩm.");
    } finally { setGenerating(null); }
  };

  const makeRuleReply = () => {
    if (!selected) return;
    const question = buyerQuestion.trim();
    const facts = [
      selected.origin ? `Nguồn gốc đang ghi nhận: ${selected.origin}${selected.region ? ` (${selected.region})` : ""}.` : "Gian hàng chưa cập nhật nguồn gốc; vui lòng xác nhận trước khi trả lời khách.",
      selected.harvest_date ? `Ngày thu hoạch khai báo: ${new Date(`${String(selected.harvest_date).slice(0, 10)}T00:00:00`).toLocaleDateString("vi-VN")}.` : "Ngày thu hoạch chưa được cập nhật.",
      selected.traceability_code ? `Mã truy xuất: ${selected.traceability_code}.` : "Sản phẩm chưa có mã truy xuất.",
      `Tồn kho hệ thống hiện là ${selected.stock} ${selected.unit}; vui lòng xác nhận lại trước khi chốt đơn.`,
    ];
    setReplyDraft(`Chào bạn, cảm ơn bạn đã quan tâm đến ${selected.name}${question ? ` và đã hỏi: “${question}”` : ""}. ${facts.join(" ")} Nếu cần thêm thông tin, bạn nhắn lại để gian hàng kiểm tra và phản hồi nhé.`);
  };

  const createReply = async () => {
    if (!selected) return;
    setGenerating("reply"); setDraftSource("");
    try {
      const result = await generateSellerDraft("buyer-reply", selected as unknown as Record<string, unknown>, buyerQuestion.trim());
      setReplyDraft(result.text); setDraftSource(`Bản nháp Gemini (${result.model}); hãy kiểm tra trước khi gửi.`);
    } catch {
      makeRuleReply(); setDraftSource("Gemini chưa phản hồi; đây là bản nháp dự phòng theo dữ liệu sản phẩm.");
    } finally { setGenerating(null); }
  };

  const copyText = async (key: string, value: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(key); window.setTimeout(() => setCopied(""), 1800); }
    catch { setError("Trình duyệt không cho phép sao chép. Hãy chọn và sao chép nội dung thủ công."); }
  };

  const traceability = (product: SellerProductInsight) => [
    ["Nơi thu hoạch / nguồn gốc", product.origin], ["Vùng trồng", product.region], ["Ngày thu hoạch", product.harvest_date],
    ["Mã truy xuất lô", product.traceability_code], ["Bảo quản", product.storage_condition],
  ] as const;

  return <SellerLayout><div className="mx-auto max-w-6xl space-y-6">
    <section className="rounded-3xl bg-gradient-to-br from-green-950 to-green-700 p-6 text-white sm:p-8"><div className="mb-3 flex items-center gap-2"><Brain className="size-6 text-amber-300"/><span className="font-semibold">AgriSmart · Trợ lý người bán</span></div><h1 className="text-2xl font-bold sm:text-3xl">Công cụ hỗ trợ gian hàng</h1><p className="mt-2 max-w-3xl text-sm text-green-100">Gợi ý được tạo từ sản phẩm, tồn kho, đơn hàng và dữ liệu truy xuất đang có trong gian hàng. Nội dung chỉ là bản nháp để bạn duyệt; hệ thống không tự đăng, xác nhận chứng nhận hay bảo đảm giá thị trường.</p><div className="mt-4 flex flex-wrap items-center gap-3"><Button variant="secondary" disabled={loading} onClick={() => void load()}><RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}/>Làm mới dữ liệu</Button><span className="text-xs text-green-100">{geminiConfigured === null ? "Đang kiểm tra Gemini…" : geminiConfigured ? "Gemini đã cấu hình · dự phòng theo quy tắc khi dịch vụ bận" : "Gemini chưa cấu hình · đang dùng quy tắc"}</span>{updatedAt && <span className="text-xs text-green-100">Dữ liệu cập nhật lúc {new Date(updatedAt).toLocaleString("vi-VN")}</span>}</div></section>
    {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {loading && <p className="text-sm text-stone-500">Đang tải dữ liệu gian hàng…</p>}
    {!loading && products.length === 0 && <Card className="p-5"><p className="font-semibold">Chưa có sản phẩm để phân tích</p><p className="mt-1 text-sm text-stone-500">Thêm sản phẩm để xem cảnh báo tồn kho, giá tham khảo và kiểm tra truy xuất.</p><Button className="mt-3" onClick={() => navigate("seller-add-product")}>Thêm sản phẩm</Button></Card>}
    {products.length > 0 && <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5"><div className="mb-3 flex items-center gap-2"><Tag className="size-5 text-amber-600"/><h2 className="font-bold">Gợi ý giá tham khảo</h2></div><p className="mb-4 text-xs text-stone-500">So sánh với mặt hàng đang mở bán trên AgriSmart cùng danh mục và đơn vị; đây không phải giá toàn thị trường.</p><div className="space-y-3">{products.map((product) => <div key={product.id} className="rounded-lg border p-3"><div className="flex flex-wrap justify-between gap-2"><b>{product.name}</b><span className="font-semibold text-green-700">Giá của bạn: {formatPrice(Number(product.price))}/{product.unit}</span></div>{Number(product.benchmark_count) > 0 ? <p className="mt-1 text-xs text-stone-600">{product.category_name || "Cùng danh mục"} · {product.benchmark_count} sản phẩm đối chiếu: {formatPrice(Number(product.benchmark_min))}–{formatPrice(Number(product.benchmark_max))}/{product.unit}, trung bình {formatPrice(Number(product.benchmark_average))}/{product.unit}.</p> : <p className="mt-1 text-xs text-stone-500">Chưa có mặt hàng cùng danh mục và đơn vị từ gian hàng khác để đối chiếu.</p>}</div>)}</div></Card>
        <Card className="p-5"><div className="mb-3 flex items-center gap-2"><CalendarClock className="size-5 text-orange-600"/><h2 className="font-bold">Cảnh báo tồn kho & mùa vụ</h2></div><p className="mb-4 text-xs text-stone-500">Dựa trên tồn kho, ngưỡng cảnh báo và ngày thu hoạch bạn đã nhập.</p>{alerts.length ? <ul className="space-y-2">{alerts.map((alert) => <li key={alert.key} className={`flex gap-2 rounded-lg p-3 text-sm ${alert.severity === "danger" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-900"}`}><AlertTriangle className="mt-0.5 size-4 shrink-0"/><span><b>{alert.title}</b><span className="block text-xs">{alert.detail}</span></span></li>)}</ul> : <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Chưa có cảnh báo tồn kho hoặc ngày thu hoạch theo dữ liệu hiện tại.</p>}{orders.length > 0 && <p className="mt-3 text-xs text-stone-500">Hệ thống đang ghi nhận {orders.length} đơn hàng liên quan đến gian hàng; cần đối chiếu với lượng hàng trước khi cập nhật tồn kho.</p>}</Card>
      </div>

      <Card className="p-5"><div className="mb-4 flex items-center gap-2"><FileText className="size-5 text-purple-600"/><div><h2 className="font-bold">Soạn mô tả sản phẩm</h2><p className="text-xs text-stone-500">Bản nháp từ Gemini khi khả dụng; chỉ dùng dữ liệu sản phẩm hiện có.</p></div></div><Label htmlFor="ai-description-product">Chọn sản phẩm</Label><select id="ai-description-product" className="mt-1 h-10 w-full rounded-lg border bg-white px-3" value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setDescriptionDraft(""); setReplyDraft(""); setDraftSource(""); }}><option value="">Chọn sản phẩm</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select><Button className="mt-3" variant="outline" onClick={() => void createDescription()} disabled={!selected || generating !== null}><Sparkles className="mr-2 size-4"/>{generating === "description" ? "Gemini đang soạn…" : "Tạo bản nháp mô tả"}</Button>{descriptionDraft && <div className="mt-3 space-y-2"><Textarea value={descriptionDraft} onChange={(event) => setDescriptionDraft(event.target.value)} className="min-h-28" aria-label="Bản nháp mô tả sản phẩm"/><p className="text-xs text-stone-500">{draftSource}</p><Button variant="ghost" size="sm" onClick={() => void copyText("description", descriptionDraft)}>{copied === "description" ? <Check className="mr-2 size-4"/> : <Copy className="mr-2 size-4"/>}{copied === "description" ? "Đã sao chép" : "Sao chép bản nháp"}</Button></div>}</Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5"><div className="mb-3 flex items-center gap-2"><MessageSquareText className="size-5 text-blue-600"/><h2 className="font-bold">Soạn trả lời khách hàng</h2></div><p className="mb-3 text-xs text-stone-500">Gemini chỉ nhận dữ liệu sản phẩm đang có và câu hỏi; hãy kiểm tra nội dung trước khi gửi khách.</p><Label htmlFor="ai-buyer-question">Câu hỏi của khách (nếu có)</Label><Input id="ai-buyer-question" className="mt-1" value={buyerQuestion} onChange={(event) => setBuyerQuestion(event.target.value)} placeholder="Ví dụ: Sản phẩm thu hoạch ở đâu?"/><Button className="mt-3" variant="outline" onClick={() => void createReply()} disabled={!selected || generating !== null}><Sparkles className="mr-2 size-4"/>{generating === "reply" ? "Gemini đang soạn…" : "Soạn câu trả lời"}</Button>{replyDraft && <div className="mt-3 space-y-2"><Textarea value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} className="min-h-32" aria-label="Bản nháp trả lời khách hàng"/><p className="text-xs text-stone-500">{draftSource}</p><Button variant="ghost" size="sm" onClick={() => void copyText("reply", replyDraft)}>{copied === "reply" ? <Check className="mr-2 size-4"/> : <Copy className="mr-2 size-4"/>}{copied === "reply" ? "Đã sao chép" : "Sao chép để gửi"}</Button></div>}</Card>
        <Card className="p-5"><div className="mb-3 flex items-center gap-2"><ClipboardCheck className="size-5 text-green-700"/><h2 className="font-bold">Kiểm tra hồ sơ truy xuất</h2></div><p className="mb-3 text-xs text-stone-500">Kiểm tra trường đã nhập, không xác minh độc lập nguồn gốc hay chứng nhận.</p><div className="space-y-3">{products.map((product) => { const fields = traceability(product); const missing = fields.filter(([, value]) => !value); return <div key={product.id} className="rounded-lg border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><b>{product.name}</b><span className={`text-xs font-semibold ${missing.length ? "text-amber-700" : "text-green-700"}`}>{missing.length ? `Thiếu ${missing.length} mục` : "Đã đủ trường cơ bản"}</span></div><p className="mt-1 text-xs text-stone-600">{missing.length ? `Cần bổ sung: ${missing.map(([label]) => label).join(", ")}.` : "Đã có nơi thu hoạch, vùng trồng, ngày thu hoạch, mã lô và hướng dẫn bảo quản."}</p>{product.certification && <p className="mt-1 text-xs text-amber-700">Chứng nhận “{product.certification}” do gian hàng khai báo; cần nhân viên kiểm duyệt giấy tờ.</p>}</div>; })}</div></Card>
      </div>
    </>}
  </div></SellerLayout>;
}
