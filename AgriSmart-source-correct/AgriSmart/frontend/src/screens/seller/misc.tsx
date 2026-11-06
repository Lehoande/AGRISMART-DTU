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
import { useNav } from "@/lib/nav-store";

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
export function SellerProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [seller, setSeller] = useState<{ farm_name: string; farm_address: string; status: string; review_note: string | null } | null>(null);
  const [stats, setStats] = useState<{ products: number; orders: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getMyProfile(), getSellerSummary()])
      .then(([user, summary]) => {
        if (!active) return;
        setProfile(user);
        setSeller(summary.seller);
        setStats({ products: summary.products, orders: summary.orders });
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Không tải được hồ sơ người bán");
      });
    return () => { active = false; };
  }, []);

  const initials = (profile?.name || "?").trim().slice(0, 1).toUpperCase();
  const isApproved = seller ? ["active", "approved"].includes(seller.status) : false;
  const sellerStatusLabel = !seller ? "" : isApproved ? "Đang hoạt động" : seller.status === "pending" ? "Đang chờ admin duyệt" : seller.status === "rejected" ? "Hồ sơ chưa được duyệt" : "Chưa rõ trạng thái";
  return (
    <SellerLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Hồ sơ người bán</h1>
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <Card className="p-6 mb-6">
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

        <Card className="p-6">
          <h3 className="font-bold mb-1">Thông tin tài khoản và gian hàng</h3>
          <p className="mb-4 text-xs text-stone-500">Tên, email và số điện thoại lấy từ hồ sơ tài khoản người mua; thông tin gian hàng lấy từ hồ sơ người bán.</p>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <User className="size-4 text-stone-400" />
              <span className="text-stone-500 w-32">Người đại diện:</span>
              <span className="font-medium">{profile?.name || "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="size-4 text-stone-400" />
              <span className="text-stone-500 w-32">Số điện thoại:</span>
              <span className="font-medium">{profile?.phone || "Chưa cập nhật"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-stone-400" />
              <span className="text-stone-500 w-32">Email:</span>
              <span className="font-medium">{profile?.email || "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="size-4 text-stone-400" />
              <span className="text-stone-500 w-32">Địa chỉ gian hàng:</span>
              <span className="font-medium">{seller?.farm_address || "Chưa cập nhật"}</span>
            </div>
          </div>
        </Card>
      </div>
    </SellerLayout>
  );
}

// ============================================
// AGREEMENT VIEW
// ============================================
export function SellerAgreementViewPage() {
  return (
    <SellerLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Thỏa thuận mua bán và hợp tác</h1>
        <p className="text-sm text-stone-500 mb-6">Phiên bản 2.0 · Các điều khoản được hiển thị giống bản người bán đọc khi đăng ký.</p>

        <Card className="p-6 space-y-4">
          {sellerAgreementSections.map((s, i) => (
            <div key={i} className="border-l-4 border-amber-400 pl-4">
              <h3 className="font-bold mb-1">{i + 1}. {s.title}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </Card>
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
