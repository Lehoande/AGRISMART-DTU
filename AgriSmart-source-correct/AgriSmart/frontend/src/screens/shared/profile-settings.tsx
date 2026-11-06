"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Settings,
  Bell,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Star,
  ShoppingBag,
  Heart,
  Edit,
  ArrowLeftRight,
  CheckCircle2,
  Wheat,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BuyerHeader } from "@/components/agri/buyer-header";
import { useNav } from "@/lib/nav-store";
import { formatPrice } from "@/lib/agri-data";
import { getAuthToken, getMyOrders, getMyProfile, getMyReviewCount, logoutApi, updateMyAvatar, updateMyProfile, type UserProfile } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { CommuneAutocomplete, DistrictAutocomplete, hasDistrictOptions, ProvinceAutocomplete } from "@/components/agri/province-autocomplete";
import { SecuritySettings } from "@/components/agri/security-settings";

function compressAvatar(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) return Promise.reject(new Error("Vui lòng chọn một tệp hình ảnh."));
  if (file.size > 10 * 1024 * 1024) return Promise.reject(new Error("Ảnh cần nhỏ hơn 10 MB."));
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const side = Math.min(image.naturalWidth, image.naturalHeight);
      const sx = (image.naturalWidth - side) / 2;
      const sy = (image.naturalHeight - side) / 2;
      for (const size of [256, 192, 128]) {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) { reject(new Error("Trình duyệt không xử lý được ảnh này.")); return; }
        context.drawImage(image, sx, sy, side, side, 0, 0, size, size);
        for (const quality of [0.82, 0.68, 0.54]) {
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          if (dataUrl.length <= 58000) { resolve(dataUrl); return; }
        }
      }
      reject(new Error("Không thể nén ảnh đủ nhỏ. Vui lòng chọn ảnh khác."));
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Không đọc được tệp ảnh.")); };
    image.src = objectUrl;
  });
}

// ============================================
// USER PROFILE
// ============================================
export function UserProfilePage() {
  const navigate = useNav((s) => s.navigate);
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", ward: "", district: "", province: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [orderSummary, setOrderSummary] = useState({ total: 0, completed: 0 });
  const [reviewCount, setReviewCount] = useState<number | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!getAuthToken()) {
      queueMicrotask(() => setIsLoading(false));
      return;
    }
    getMyProfile()
      .then((result) => {
        setProfile(result);
        setForm({ name: result.name || "", phone: result.phone || "", address: result.address || "", ward: result.ward || "", district: result.district || "", province: result.province || "" });
      })
      .catch((error: unknown) => {
        toast({ title: "Không tải được hồ sơ", description: error instanceof Error ? error.message : "Vui lòng thử lại.", variant: "destructive" });
      })
      .finally(() => setIsLoading(false));
  }, [toast]);

  useEffect(() => {
    if (!getAuthToken()) return;
    let active = true;
    Promise.allSettled([getMyOrders("buyer"), getMyReviewCount()]).then(([orders, reviews]) => {
      if (!active) return;
      if (orders.status === "fulfilled") setOrderSummary({ total: orders.value.length, completed: orders.value.filter((order) => order.status === "completed").length });
      if (reviews.status === "fulfilled") setReviewCount(reviews.value.total);
    });
    return () => { active = false; };
  }, []);

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast({ title: "Tên không hợp lệ", description: "Vui lòng nhập tên có ít nhất 2 ký tự.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updateMyProfile({ name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim(), ward: form.ward.trim(), district: form.district.trim(), province: form.province.trim() });
      setProfile(updated);
      setForm({ name: updated.name, phone: updated.phone || "", address: updated.address || "", ward: updated.ward || "", district: updated.district || "", province: updated.province || "" });
      setIsEditing(false);
      toast({ title: "Đã cập nhật hồ sơ" });
    } catch (error) {
      toast({ title: "Không lưu được hồ sơ", description: error instanceof Error ? error.message : "Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const saveAvatar = async (file: File | null) => {
    if (!file || !profile) return;
    setIsSavingAvatar(true);
    try {
      const avatarUrl = await compressAvatar(file);
      await updateMyAvatar(avatarUrl);
      setProfile({ ...profile, avatar_url: avatarUrl });
      toast({ title: "Đã cập nhật ảnh đại diện" });
    } catch (error) {
      toast({ title: "Không đổi được ảnh đại diện", description: error instanceof Error ? error.message : "Vui lòng thử ảnh khác.", variant: "destructive" });
    } finally { setIsSavingAvatar(false); }
  };

  const removeAvatar = async () => {
    if (!profile) return;
    setIsSavingAvatar(true);
    try {
      await updateMyAvatar(null);
      setProfile({ ...profile, avatar_url: null });
      toast({ title: "Đã gỡ ảnh đại diện" });
    } catch (error) {
      toast({ title: "Không gỡ được ảnh đại diện", description: error instanceof Error ? error.message : "Vui lòng thử lại.", variant: "destructive" });
    } finally { setIsSavingAvatar(false); }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
      <BuyerHeader />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Hồ sơ của tôi</h1>
          <Button variant="outline" onClick={() => navigate("user-settings")}>
            <Settings className="size-4 mr-2" /> Cài đặt
          </Button>
        </div>

        {/* Profile card */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="size-20 border-4 border-green-200">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>{profile?.name?.trim().slice(0, 1) || "?"}</AvatarFallback>
              </Avatar>
              <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => { void saveAvatar(event.target.files?.[0] || null); event.target.value = ""; }} />
              <Button type="button" variant="outline" size="sm" disabled={!profile || isLoading || isSavingAvatar} onClick={() => avatarInputRef.current?.click()}>
                {isSavingAvatar ? "Đang lưu…" : "Đổi ảnh"}
              </Button>
              {profile?.avatar_url && <Button type="button" variant="ghost" size="sm" disabled={isSavingAvatar} onClick={() => void removeAvatar()}>Gỡ ảnh</Button>}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{profile?.name || (isLoading ? "Đang tải hồ sơ…" : "Hồ sơ người dùng")}</h2>
                <Badge className="bg-green-100 text-green-700 gap-1">
                  <CheckCircle2 className="size-3" /> {profile?.role === "seller" ? "Tài khoản người bán" : "Tài khoản người mua"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-sm">
                <div className="bg-stone-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">Tổng đơn mua</div>
                  <div className="font-bold">{orderSummary.total}</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">Đơn hoàn thành</div>
                  <div className="font-bold">{orderSummary.completed}</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">Đã đánh giá</div>
                  <div className="font-bold">{reviewCount ?? "—"}</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">Tham gia</div>
                  <div className="font-bold text-sm">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" }) : "—"}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" disabled={!profile || isLoading} onClick={() => setIsEditing((editing) => !editing)}>
                  {isEditing ? <X className="size-4 mr-1" /> : <Edit className="size-4 mr-1" />}{isEditing ? "Đóng" : "Sửa hồ sơ"}
                </Button>
                {profile?.role === "seller" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("seller-dashboard")}
                    className="border-amber-500 text-amber-700 hover:bg-amber-50"
                  >
                    <ArrowLeftRight className="size-4 mr-1" /> Chế độ Người bán
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {isEditing && profile && (
          <Card className="p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Thông tin cá nhân</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profile-name">Họ và tên</Label>
                  <Input id="profile-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength={2} maxLength={120} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="profile-email">Email</Label>
                  <Input id="profile-email" type="email" value={profile.email} disabled className="mt-1" />
                  <p className="mt-1 text-xs text-stone-500">Email đăng nhập chưa thể thay đổi.</p>
                </div>
                <div>
                  <Label htmlFor="profile-phone">Số điện thoại</Label>
                  <Input id="profile-phone" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="0901 234 567" maxLength={30} className="mt-1" />
                </div>
                <div className="sm:col-span-2 rounded-lg bg-stone-50 p-3">
                  <p className="text-sm font-semibold">Địa chỉ mặc định</p>
                  <p className="mt-1 text-xs text-stone-500">Chọn tỉnh/thành phố rồi chọn phường/xã. Chỉ cần nhập tay số nhà và tên đường.</p>
                </div>
                <div>
                  <Label htmlFor="profile-province">Tỉnh/Thành phố</Label>
                  <ProvinceAutocomplete id="profile-province" value={form.province} onChange={(province) => setForm({ ...form, province, district: "", ward: "" })} placeholder="Gõ để tìm tỉnh/thành phố" maxLength={120} className="mt-1" />
                </div>
                {hasDistrictOptions(form.province) > 0 && <div>
                  <Label htmlFor="profile-district">Quận/Huyện</Label>
                  <DistrictAutocomplete id="profile-district" province={form.province} value={form.district} onChange={(district) => setForm({ ...form, district, ward: "" })} placeholder="Chọn quận/huyện" maxLength={120} className="mt-1" />
                </div>}
                <div>
                  <Label htmlFor="profile-ward">Phường/Xã</Label>
                  <CommuneAutocomplete id="profile-ward" province={form.province} district={form.district} value={form.ward} onChange={(ward) => setForm({ ...form, ward })} placeholder={form.province ? "Gõ để tìm phường/xã" : "Chọn tỉnh/thành phố trước"} maxLength={120} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="profile-address">Số nhà, tên đường, thôn/ấp</Label>
                  <Input id="profile-address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Ví dụ: 12 Nguyễn Trãi, thôn 3" maxLength={5000} className="mt-1" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setForm({ name: profile.name, phone: profile.phone || "", address: profile.address || "", ward: profile.ward || "", district: profile.district || "", province: profile.province || "" }); setIsEditing(false); }}>Hủy</Button>
                <Button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                  <Save className="size-4 mr-2" />{isSaving ? "Đang lưu…" : "Lưu hồ sơ"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-5 cursor-pointer hover:shadow-md transition" >
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-green-100 flex items-center justify-center">
                <ShoppingBag className="size-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Đơn hàng của tôi</h3>
                <p className="text-xs text-stone-500">{orderSummary.completed} / {orderSummary.total} đơn hoàn thành</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate("buyer-orders")}>Xem</Button>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-rose-100 flex items-center justify-center">
                <Heart className="size-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Đánh giá đã gửi</h3>
                <p className="text-xs text-stone-500">{reviewCount ?? "Đang tải…"} đánh giá</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Account activity */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ShoppingBag className="size-5 text-green-600"/>Hoạt động tài khoản</h3>
          <p className="text-sm text-stone-600">Tài khoản có {orderSummary.total} đơn mua, trong đó {orderSummary.completed} đơn đã hoàn tất, và {reviewCount ?? "—"} đánh giá đã gửi.</p>
          <p className="mt-2 text-xs text-stone-500">Các số liệu được tính từ lịch sử giao dịch và đánh giá của tài khoản này.</p>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// USER SETTINGS
// ============================================
export function UserSettingsPage() {
  const navigate = useNav((s) => s.navigate);
  const setMode = useNav((s) => s.setMode);
  const [accountRole, setAccountRole] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    getMyProfile().then((profile) => { if (active) setAccountRole(profile.role); }).catch(() => { if (active) setAccountRole(null); });
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
      <BuyerHeader />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Cài đặt</h1>

        <Card className="p-6 mb-4">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Bell className="size-4 text-amber-600" /> Thông báo
          </h3>
          <p className="text-sm text-stone-600">Thông báo trong ứng dụng được tạo khi có cập nhật đơn hàng và khiếu nại. Tùy chọn bật/tắt từng loại chưa được hỗ trợ.</p>
        </Card>

        <SecuritySettings />

        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Globe className="size-4 text-blue-600" /> Khác
          </h3>
          <div className="space-y-3">
            {accountRole === "seller" && <Button variant="outline" onClick={() => { setMode("seller"); navigate("seller-dashboard"); }} className="w-full justify-start">
              <Wheat className="size-4 mr-2" /> Chuyển sang chế độ Người bán
            </Button>}
            <Button variant="outline" onClick={() => { logoutApi(); navigate("login"); }} className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
              Đăng xuất
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
