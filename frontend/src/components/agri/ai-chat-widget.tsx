"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  MessageSquare,
  X,
  Send,
  Sparkles,
  RotateCcw,
  ShoppingBasket,
  ChevronDown,
  Truck,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { askBuyerAi } from "@/lib/api-client";

type ChatMessage = {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
  disclaimer?: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    sender: "ai",
    text: "Xin chào bạn! Mình là AgriSmart AI 🌱, trợ lý tư vấn khách hàng chuyên hỗ trợ mua bán nông sản trên website AgriSmart.\n\nMình có thể hỗ trợ bạn:\n• Tìm kiếm & tư vấn nông sản tươi ngon, đúng mùa vụ 🥬 🍊\n• Tra cứu giá bán, tồn kho, nguồn gốc xuất xứ\n• Chính sách giao hàng: Phí ship **25.000 ₫**, miễn phí ship từ **250.000 ₫** 🚚\n• Hướng dẫn đặt hàng, thanh toán và kiểm tra đơn hàng\n\nBạn cần mình tư vấn sản phẩm nào hôm nay?",
    time: "Vừa xong",
    disclaimer: "Tư vấn dựa trên dữ liệu sản phẩm thực tế của sàn AgriSmart.",
  },
];

const SUGGESTIONS = [
  { label: "Gợi ý nông sản hôm nay", query: "Hôm nay trên sàn có những nông sản nào tươi ngon, nổi bật nhất?" },
  { label: "Phí vận chuyển thế nào?", query: "Chính sách phí giao hàng của AgriSmart như thế nào?" },
  { label: "Rau củ hữu cơ", query: "Sàn có rau củ hữu cơ hoặc đạt chuẩn VietGAP không?" },
  { label: "Trái cây tươi", query: "Có những loại trái cây tươi ngon nào đang mở bán?" },
];

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text: query,
      time: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await askBuyerAi(query, []);
      const aiMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: response.text || "Dạ, tôi đã ghi nhận câu hỏi của bạn. Hệ thống chưa có thêm dữ liệu cho yêu cầu này.",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        disclaimer: response.disclaimer || "Thông tin dựa trên dữ liệu sản phẩm hệ thống AgriSmart.",
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (!isOpen) setHasUnread(true);
    } catch {
      // Fallback thông minh nếu API bận
      let fallbackText = "";
      const lower = query.toLowerCase();
      const isOutOfScope = /(lập trình|code|python|javascript|toán|lịch sử|chính trị|thời tiết|chữa bệnh|thuốc|bác sĩ|chứng khoán|đầu tư|tiền ảo|crypto)/i.test(lower);

      if (isOutOfScope) {
        fallbackText = "Xin lỗi bạn! Mình là AgriSmart AI, trợ lý chuyên hỗ trợ mua bán và tư vấn nông sản trên website AgriSmart. Mình chỉ có thể hỗ trợ các câu hỏi liên quan đến sản phẩm, giá bán, nguồn gốc, tồn kho, đặt hàng và vận chuyển nông sản. Bạn cần mình tư vấn sản phẩm nào không?";
      } else if (lower.includes("ship") || lower.includes("vận chuyển") || lower.includes("giao hàng")) {
        fallbackText = "Chính sách giao hàng của AgriSmart:\n• **Phí ship tiêu chuẩn:** 25.000 ₫ toàn quốc (hỗ trợ 34 tỉnh/thành phố).\n• **Miễn phí vận chuyển:** Cho đơn hàng từ 250.000 ₫ trở lên. 🚚";
      } else if (lower.includes("thanh toán") || lower.includes("tiền")) {
        fallbackText = "AgriSmart hỗ trợ 2 phương thức thanh toán an toàn:\n1. Thanh toán khi nhận hàng (COD).\n2. Chuyển khoản ngân hàng qua mã VietQR tự động.";
      } else if (lower.includes("rau") || lower.includes("cải")) {
        fallbackText = "Hiện sàn đang mở bán **Rau cải xanh hữu cơ** từ Đà Lạt (28.000 ₫/kg), thu hoạch tươi trong ngày, còn tồn 80 kg. Bạn có thể thêm vào giỏ hàng ngay nhé! 🥬";
      } else if (lower.includes("cam") || lower.includes("trái cây") || lower.includes("chuối")) {
        fallbackText = "Trái cây nổi bật trên sàn gồm:\n• **Cam sành miền Tây**: 35.000 ₫/kg (Vĩnh Long, mọng nước, còn 120 kg)\n• **Chuối cau tươi**: 22.000 ₫/kg (Quảng Nam, chín tự nhiên, còn 90 kg) 🍊";
      } else if (lower.includes("gạo") || lower.includes("cơm")) {
        fallbackText = "AgriSmart có **Gạo ST chất lượng cao** từ Sóc Trăng, giá 32.000 ₫/kg, hạt dài, thơm dẻo, còn tồn 200 kg. 🍚";
      } else {
        fallbackText = "Dạ, mình đã ghi nhận câu hỏi của bạn. Hiện hệ thống đang kết nối dữ liệu sản phẩm, bạn có thể xem các mặt hàng tại danh mục Sản phẩm hoặc cho mình biết bạn muốn tìm loại nông sản nào nhé! 🌱";
      }

      const aiMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: fallbackText,
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        disclaimer: "Phản hồi dự phòng tự động của hệ thống.",
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (!isOpen) setHasUnread(true);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <>
      {/* Floating Chat Icon (Góc phải dưới màn hình) */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Mở khung chat Trợ lý AI"
            className="group relative flex size-14 items-center justify-center rounded-full bg-gradient-to-tr from-green-700 via-emerald-600 to-teal-500 text-white shadow-xl shadow-green-900/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-700/40 focus:outline-none focus:ring-4 focus:ring-green-400/40"
          >
            <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-ping" />
            <Bot className="size-7 transition-transform group-hover:rotate-12" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex size-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex size-4 rounded-full bg-red-600" />
              </span>
            )}
            <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-stone-900/90 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
              Trợ lý AI AgriSmart 🌾
            </span>
          </button>
        )}
      </div>

      {/* Chat Window Frame */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Khung chat Trợ lý AI"
          className="fixed bottom-6 right-6 z-50 flex h-[540px] max-h-[calc(100vh-3rem)] w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-2xl shadow-stone-900/20 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-800 via-green-700 to-teal-800 px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="relative flex size-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
                <Bot className="size-5 text-emerald-200" />
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-green-800 bg-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm leading-tight">
                  Trợ lý AI AgriSmart
                  <Sparkles className="size-3.5 text-amber-300" />
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-200">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sẵn sàng hỗ trợ bạn
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-white/80">
              <button
                type="button"
                onClick={resetChat}
                title="Làm mới đoạn chat"
                className="rounded-lg p-1.5 transition hover:bg-white/15 hover:text-white"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Đóng khung chat"
                className="rounded-lg p-1.5 transition hover:bg-white/15 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-stone-50/70 p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "rounded-tr-xs bg-green-700 text-white"
                      : "rounded-tl-xs border border-stone-200/90 bg-white text-stone-800"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                {msg.disclaimer && (
                  <span className="mt-1 max-w-[85%] text-[10px] text-stone-400">
                    {msg.disclaimer}
                  </span>
                )}
                <span className="mt-0.5 text-[10px] text-stone-400 px-1">{msg.time}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-500 shadow-sm max-w-[85%]">
                <Bot className="size-4 text-green-700 animate-spin" />
                <span className="text-xs">Trợ lý AI đang soạn câu trả lời…</span>
              </div>
            )}
          </div>

          {/* Quick suggestions chips */}
          <div className="border-t border-stone-100 bg-white px-3 py-2">
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => void handleSend(item.query)}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-green-200 bg-green-50/80 px-2.5 py-1 text-green-800 transition hover:bg-green-100 disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="flex items-center gap-2 border-t border-stone-200 bg-white p-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi nông sản, phí ship..."
              disabled={loading}
              className="flex-1 rounded-xl border border-stone-200 bg-stone-50/80 px-3.5 py-2 text-sm text-stone-900 outline-none transition focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100 disabled:opacity-60"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="size-9 shrink-0 rounded-xl bg-green-700 text-white hover:bg-green-800 disabled:opacity-50"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
