"use client";
import { useState } from "react";
import { CreditCard, Upload, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateSellerProfileApi } from "@/lib/api-client";

interface ResubmitCccdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialCitizenId?: string | null;
  initialCitizenCardDate?: string | null;
  initialFrontUrl?: string | null;
  initialBackUrl?: string | null;
  currentReviewNote?: string | null;
}

function compressIdCardImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Vui lòng chọn một tệp hình ảnh."));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Trình duyệt không hỗ trợ xử lý ảnh."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Không thể tải hình ảnh."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Không thể đọc tệp ảnh."));
    reader.readAsDataURL(file);
  });
}

export function ResubmitCccdModal({
  isOpen,
  onClose,
  onSuccess,
  initialCitizenId,
  initialCitizenCardDate,
  initialFrontUrl,
  initialBackUrl,
  currentReviewNote,
}: ResubmitCccdModalProps) {
  const { toast } = useToast();
  const [citizenId, setCitizenId] = useState(initialCitizenId || "");
  const [citizenCardDate, setCitizenCardDate] = useState(
    initialCitizenCardDate ? initialCitizenCardDate.split("T")[0] : ""
  );
  const [idCardFront, setIdCardFront] = useState<string | null>(initialFrontUrl || null);
  const [idCardBack, setIdCardBack] = useState<string | null>(initialBackUrl || null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setError("Dung lượng ảnh tối đa 15MB.");
      return;
    }
    try {
      const compressed = await compressIdCardImage(file);
      if (side === "front") setIdCardFront(compressed);
      else setIdCardBack(compressed);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xử lý ảnh.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedId = citizenId.trim();
    if (!trimmedId || !/^\d{12}$/.test(trimmedId)) {
      setError("Số Căn cước công dân phải gồm đúng 12 chữ số.");
      return;
    }
    if (!citizenCardDate) {
      setError("Vui lòng chọn ngày cấp CCCD.");
      return;
    }
    if (!idCardFront || !idCardBack) {
      setError("Vui lòng tải lên đầy đủ ảnh chụp mặt trước và mặt sau của CCCD.");
      return;
    }

    setSubmitting(true);
    try {
      await updateSellerProfileApi({
        citizen_id: trimmedId,
        citizen_card_date: citizenCardDate,
        id_card_front_url: idCardFront,
        id_card_back_url: idCardBack,
      });
      toast({
        title: "Đã gửi lại hồ sơ CCCD",
        description: "Hồ sơ của bạn đã được chuyển sang trạng thái Chờ duyệt. Ban quản trị sẽ sớm xem xét.",
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi lại hồ sơ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="relative max-h-[90vh] max-w-2xl w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <CreditCard className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-lg">Cập nhật & Gửi lại hồ sơ CCCD</h2>
              <p className="text-xs text-stone-500">Chỉnh sửa thông tin và gửi lại để Ban quản trị xét duyệt</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-stone-100 text-stone-500">
            <X className="size-5" />
          </button>
        </div>

        {currentReviewNote && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-800">Lý do từ chối từ Ban quản trị:</p>
                <p className="mt-1 text-sm text-red-900 font-medium">{currentReviewNote}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="resubmit-citizen-id">Số Căn cước công dân (12 số) *</Label>
              <Input
                id="resubmit-citizen-id"
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="Ví dụ: 001201012345"
                required
                maxLength={12}
                className="h-11 mt-1 bg-white font-mono tracking-wider text-base"
              />
              <p className="mt-1 text-[11px] text-stone-500">Định dạng chuẩn 12 chữ số trên thẻ gắn chip</p>
            </div>
            <div>
              <Label htmlFor="resubmit-citizen-date">Ngày cấp CCCD *</Label>
              <Input
                id="resubmit-citizen-date"
                type="date"
                value={citizenCardDate}
                onChange={(e) => setCitizenCardDate(e.target.value)}
                required
                max={new Date().toISOString().split("T")[0]}
                className="h-11 mt-1 bg-white"
              />
              <p className="mt-1 text-[11px] text-stone-500">Ngày cấp ghi ở mặt sau thẻ</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Ảnh mặt trước */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-800">Ảnh mặt trước CCCD *</Label>
              {idCardFront ? (
                <div className="relative rounded-xl border border-stone-200 bg-white p-2 text-center shadow-sm">
                  <img
                    src={idCardFront}
                    alt="Mặt trước CCCD"
                    className="h-32 w-full rounded-lg object-contain bg-stone-100"
                  />
                  <div className="mt-2 flex items-center justify-between px-1">
                    <span className="text-xs text-green-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Đã chọn ảnh
                    </span>
                    <button
                      type="button"
                      onClick={() => setIdCardFront(null)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
                    >
                      Chọn lại
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-white p-4 transition-colors hover:border-amber-500 hover:bg-amber-50/30">
                  <Upload className="size-6 text-amber-600 mb-2" />
                  <span className="text-xs font-semibold text-stone-700">Tải ảnh mặt trước CCCD</span>
                  <span className="text-[10px] text-stone-400 mt-1">Ảnh rõ nét, đủ 4 góc (tối đa 8MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "front")}
                  />
                </label>
              )}
            </div>

            {/* Ảnh mặt sau */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-800">Ảnh mặt sau CCCD *</Label>
              {idCardBack ? (
                <div className="relative rounded-xl border border-stone-200 bg-white p-2 text-center shadow-sm">
                  <img
                    src={idCardBack}
                    alt="Mặt sau CCCD"
                    className="h-32 w-full rounded-lg object-contain bg-stone-100"
                  />
                  <div className="mt-2 flex items-center justify-between px-1">
                    <span className="text-xs text-green-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Đã chọn ảnh
                    </span>
                    <button
                      type="button"
                      onClick={() => setIdCardBack(null)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
                    >
                      Chọn lại
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-white p-4 transition-colors hover:border-amber-500 hover:bg-amber-50/30">
                  <Upload className="size-6 text-amber-600 mb-2" />
                  <span className="text-xs font-semibold text-stone-700">Tải ảnh mặt sau CCCD</span>
                  <span className="text-[10px] text-stone-400 mt-1">Ảnh rõ phần vân tay, ngày cấp</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "back")}
                  />
                </label>
              )}
            </div>
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <div className="mt-6 flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Hủy
            </Button>
            <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 shadow-md" disabled={submitting}>
              {submitting ? "Đang gửi hồ sơ…" : "Gửi lại xét duyệt"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
