"use client";
import { useEffect, useState } from "react";
import {
  Star,
  Headphones,
  User,
  FileText,
  Settings,
  Bell,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  CheckCircle2,
  TrendingUp,
  Edit,
  Wheat,
  CreditCard,
  AlertCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SellerLayout } from "@/components/agri/seller-layout";
import { getComplaints, getMyProfile, getSellerReviews, getSellerSummary, logoutApi, type UserProfile } from "@/lib/api-client";
import { SecuritySettings } from "@/components/agri/security-settings";
import { sellerAgreementSections } from "@/lib/seller-agreement";
import { SellerContractDocument } from "@/components/agri/seller-contract-document";
import { useNav } from "@/lib/nav-store";
import { ResubmitCccdModal } from "@/components/agri/resubmit-cccd-modal";

// ============================================
// COMPLAINTS AND REVIEWS
// ============================================
export function SellerComplaintsPage() {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; getComplaints().then((data) => { if (active) setRows(data); }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Không tải được khiếu nại"); }); return () => { active = false; }; }, []);
  return <SellerLayout><h1 className="mb-1 text-2xl font-bold">Khiếu nại</h1><p className="mb-6 text-sm text-stone-500">Khiếu nại liên quan tới đơn có sản phẩm của cửa hàng.</p>{error && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{rows.length === 0 && !error && <p className="rounded-xl border bg-white p-5 text-sm text-stone-500">Chưa có khiếu nại.</p>}<div className="space-y-3">{rows.map((row) => <Card key={String(row.id)} className="p-4"><div className="flex justify-between gap-2"><b>#{String(row.id)} · Đơn #{String(row.order_id)}</b><Badge>{String(row.status)}</Badge></div><p className="mt-2 text-sm">{String(row.issue_type)} · {String(row.product_name || "Toàn đơn")}</p><p className="mt-1 text-sm text-stone-600">{String(row.description)}</p>{Boolean(row.evidence_url) && <a className="mt-2 inline-block text-sm text-blue-700 underline" href={String(row.evidence_url)} target="_blank" rel="noreferrer">Xem bằng chứng</a>}</Card>)}</div></SellerLayout>;
}

export function SellerReviewsPage() {
  const [rows, setRows] = useState<Array<{ id: number; rating: number; comment: string | null; created_at: string; customer_name: string; product_name: string }>>([]);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; getSellerReviews().then((data) => { if (active) setRows(data); }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Không tải được đánh giá"); }); return () => { active = false; }; }, []);
  const average = rows.length ? rows.reduce((sum, row) => sum + row.rating, 0) / rows.length : 0;
  return <SellerLayout><h1 className="mb-1 text-2xl font-bold">Đánh giá sản phẩm</h1><p className="mb-6 text-sm text-stone-500">Đánh giá đã xác minh từ người mua sản phẩm của bạn.</p><Card className="mb-5 p-4"><b className="text-2xl">{average.toFixed(1)} ★</b><span className="ml-2 text-sm text-stone-500">{rows.length} đánh giá</span></Card>{error && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{rows.length === 0 && !error && <p className="rounded-xl border bg-white p-5 text-sm text-stone-500">Chưa có đánh giá.</p>}<div className="space-y-3">{rows.map((row) => <Card key={row.id} className="p-4"><div className="flex justify-between gap-2"><div><b>{row.customer_name}</b><p className="text-xs text-stone-500">{row.product_name} · {new Date(row.created_at).toLocaleDateString("vi-VN")}</p></div><b className="text-amber-600">{row.rating} ★</b></div><p className="mt-2 text-sm">{row.comment || "Không có nhận xét."}</p></Card>)}</div></SellerLayout>;
}

// ============================================
// PROFILE
// ============================================
type SellerProfileData = {
  farm_name: string;
  farm_address: string;
  status: string;
  review_note: string | null;
  citizen_id?: string | null;
  citizen_card_date?: string | null;
  id_card_front_url?: string | null;
  id_card_back_url?: string | null;
};

export function SellerProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [seller, setSeller] = useState<SellerProfileData | null>(null);
  const [stats, setStats] = useState<{ products: number; orders: number } | null>(null);
  const [error, setError] = useState("");
  const [showResubmit, setShowResubmit] = useState(false);

  const loadProfile = async () => {
    try {
      const [user, summary] = await Promise.all([getMyProfile(), getSellerSummary()]);
      setProfile(user);
      setSeller(summary.seller);
      setStats({ products: summary.products, orders: summary.orders });
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Không tải được hồ sơ người bán");
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const initials = (profile?.name || "?").trim().slice(0, 1).toUpperCase();
  const isApproved = seller ? ["active", "approved"].includes(seller.status) : false;
  const sellerStatusLabel = !seller ? "" : isApproved ? "Đang hoạt động" : seller.status === "pending" ? "Đang chờ admin duyệt" : seller.status === "rejected" ? "Hồ sơ chưa được duyệt" : "Chưa rõ trạng thái";
  return (
    <SellerLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Hồ sơ người bán</h1>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <Card className="p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <Avatar className="size-20 border-4 border-green-200">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{seller?.farm_name || "Đang tải tên gian hàng…"}</h2>
                {seller && <Badge className={isApproved ? "bg-green-100 text-green-700 gap-1" : seller.status === "pending" ? "bg-amber-100 text-amber-800 gap-1" : "bg-red-100 text-red-800 gap-1"}>
                  <CheckCircle2 className="size-3" /> {sellerStatusLabel}
                </Badge>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-sm">
                <div className="bg-stone-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">Sản phẩm</div>
                  <div className="font-bold">{stats?.products ?? "—"}</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">Đơn hàng</div>
                  <div className="font-bold">{stats?.orders ?? "—"}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Thông tin Căn cước công dân */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                <CreditCard className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Xác thực Căn cước công dân (CCCD)</h3>
                <p className="text-xs text-stone-500">Định danh chủ gian hàng theo quy định sàn thương mại điện tử</p>
              </div>
            </div>
            {seller?.status !== "approved" && (
              <Button size="sm" variant="outline" onClick={() => setShowResubmit(true)}>
                Cập nhật lại CCCD
              </Button>
            )}
          </div>

          {seller?.status === "rejected" && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-red-800">Lý do từ chối:</p>
                  <p className="mt-1 text-sm text-red-900 font-medium">{seller.review_note || "Vui lòng chụp lại ảnh rõ nét và kiểm tra lại thông tin."}</p>
                </div>
              </div>
            </div>
          )}

          {seller?.status === "pending" && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2">
              <Clock className="size-4 text-amber-600 shrink-0" />
              <span>Hồ sơ CCCD đang chờ Ban quản trị duyệt. Bạn có thể bấm "Cập nhật lại CCCD" nếu muốn chỉnh sửa ảnh hoặc số thẻ.</span>
            </div>
          )}

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-stone-500 w-36">Số CCCD (12 số):</span>
              <span className="font-mono font-bold text-stone-900">{seller?.citizen_id || "Chưa cung cấp"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-stone-500 w-36">Ngày cấp CCCD:</span>
              <span className="font-medium text-stone-900">
                {seller?.citizen_card_date ? new Date(seller.citizen_card_date).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-stone-500 w-36">Trạng thái định danh:</span>
              <span>
                {isApproved ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                    <ShieldCheck className="size-3.5" /> Đã xác thực danh tính
                  </span>
                ) : seller?.status === "pending" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <Clock className="size-3.5" /> Chờ quản trị viên duyệt
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                    <AlertCircle className="size-3.5" /> Chưa đạt yêu cầu
                  </span>
                )}
              </span>
            </div>

            {(seller?.id_card_front_url || seller?.id_card_back_url) && (
              <div className="pt-2">
                <span className="text-stone-500 block text-xs mb-2 font-medium">Ảnh chụp thẻ CCCD đã nộp:</span>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  {seller.id_card_front_url && (
                    <div className="text-center">
                      <img src={seller.id_card_front_url} alt="Mặt trước CCCD" className="h-24 w-full rounded-lg border object-contain bg-stone-50" />
                      <span className="text-[11px] text-stone-500 mt-1 block">Mặt trước</span>
                    </div>
                  )}
                  {seller.id_card_back_url && (
                    <div className="text-center">
                      <img src={seller.id_card_back_url} alt="Mặt sau CCCD" className="h-24 w-full rounded-lg border object-contain bg-stone-50" />
                      <span className="text-[11px] text-stone-500 mt-1 block">Mặt sau</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-1">Thông tin tài khoản và gian hàng</h3>
          <p className="mb-4 text-xs text-stone-500">Tên, email và số điện thoại lấy từ hồ sơ tài khoản người mua; thông tin gian hàng lấy từ hồ sơ người bán.</p>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <User className="size-4 text-stone-400" />
              <span className="text-stone-500 w-36">Người đại diện:</span>
              <span className="font-medium">{profile?.name || "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="size-4 text-stone-400" />
              <span className="text-stone-500 w-36">Số điện thoại:</span>
              <span className="font-medium">{profile?.phone || "Chưa cập nhật"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-stone-400" />
              <span className="text-stone-500 w-36">Email:</span>
              <span className="font-medium">{profile?.email || "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="size-4 text-stone-400" />
              <span className="text-stone-500 w-36">Địa chỉ gian hàng:</span>
              <span className="font-medium">{seller?.farm_address || "Chưa cập nhật"}</span>
            </div>
          </div>
        </Card>

        <ResubmitCccdModal
          isOpen={showResubmit}
          onClose={() => setShowResubmit(false)}
          onSuccess={() => void loadProfile()}
          initialCitizenId={seller?.citizen_id}
          initialCitizenCardDate={seller?.citizen_card_date}
          initialFrontUrl={seller?.id_card_front_url}
          initialBackUrl={seller?.id_card_back_url}
          currentReviewNote={seller?.review_note}
        />
      </div>
    </SellerLayout>
  );
}

// ============================================
// AGREEMENT VIEW
// ============================================
export function SellerAgreementViewPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [seller, setSeller] = useState<SellerProfileData | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getMyProfile(), getSellerSummary()])
      .then(([user, summary]) => {
        if (active) {
          setProfile(user);
          setSeller(summary.seller);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Văn bản Hợp đồng Hợp tác Kinh doanh</h1>
          <p className="text-sm text-stone-500">
            Văn bản điện tử chính thức được xác lập giữa Chủ gian hàng và Sàn Thương mại điện tử AgriSmart AI.
          </p>
        </div>

        <SellerContractDocument
          readOnly={true}
          isSigned={true}
          partyB={{
            name: profile?.name,
            farmName: seller?.farm_name,
            phone: profile?.phone,
            email: profile?.email,
            citizenId: seller?.citizen_id || undefined,
            citizenCardDate: seller?.citizen_card_date || undefined,
            farmAddress: seller?.farm_address,
          }}
        />
      </div>
    </SellerLayout>
  );
}

// ============================================
// SETTINGS
// ============================================
export function SellerSettingsPage() {
  const navigate = useNav((s) => s.navigate);
  const setMode = useNav((s) => s.setMode);
  return (
    <SellerLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Cài đặt</h1>

        <Card className="p-6 mb-4">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Bell className="size-4 text-amber-600" /> Thông báo
          </h3>
          <p className="text-sm text-stone-600">Thông báo trong ứng dụng được tạo khi có cập nhật đơn hàng và khiếu nại. Tùy chọn bật/tắt từng loại và báo cáo email chưa được hỗ trợ.</p>
        </Card>

        <SecuritySettings />

        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Globe className="size-4 text-blue-600" /> Khác
          </h3>
          <div className="space-y-3">
            <Button variant="outline" onClick={() => { setMode("buyer"); navigate("buyer-home"); }} className="w-full justify-start">
              <Wheat className="size-4 mr-2" /> Chuyển sang chế độ Người mua
            </Button>
            <Button variant="outline" onClick={() => { logoutApi(); navigate("login"); }} className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
              Đăng xuất
            </Button>
          </div>
        </Card>
      </div>
    </SellerLayout>
  );
}
