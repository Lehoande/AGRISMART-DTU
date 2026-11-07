"use client";
import { motion } from "framer-motion";
import {
  User,
  Settings,
  Bell,
  Shield,
  Globe,
  Lock,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { BuyerHeader } from "@/components/agri/buyer-header";
import { useNav } from "@/lib/nav-store";
import { formatPrice } from "@/lib/agri-data";

// ============================================
// USER PROFILE
// ============================================
export function UserProfilePage() {
  const navigate = useNav((s) => s.navigate);

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
      <BuyerHeader />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Hồ sơ của tôi</h1>

        {/* Profile card */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4 flex-wrap">
            <Avatar className="size-20 border-4 border-green-200">
              <AvatarImage src="https://i.pravatar.cc/200?img=44" />
              <AvatarFallback>NV</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">Nguyễn Thị Lan</h2>
                <Badge className="bg-green-100 text-green-700 gap-1">
                  <CheckCircle2 className="size-3" /> Đã xác thực
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 text-amber-500">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-bold">Uy tín tốt</span>
                <span className="text-xs text-stone-500">(95% các tiêu chí)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-sm">
                <div className="bg-stone-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">Đơn hoàn thành</div>
                  <div className="font-bold">234</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">Đã đánh giá</div>
                  <div className="font-bold">189</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">Tham gia</div>
                  <div className="font-bold text-sm">06/2024</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">Tỷ lệ nhận</div>
                  <div className="font-bold text-green-600">98%</div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Edit className="size-4 mr-1" /> Sửa hồ sơ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("seller-dashboard")}
                  className="border-amber-500 text-amber-700 hover:bg-amber-50"
                >
                  <ArrowLeftRight className="size-4 mr-1" /> Chế độ Người bán
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-5 cursor-pointer hover:shadow-md transition" >
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-green-100 flex items-center justify-center">
                <ShoppingBag className="size-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Đơn hàng của tôi</h3>
                <p className="text-xs text-stone-500">234 đơn đã hoàn thành</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate("buyer-orders")}>Xem</Button>
            </div>
          </Card>

          <Card className="p-5 cursor-pointer hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-rose-100 flex items-center justify-center">
                <Heart className="size-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Sản phẩm yêu thích</h3>
                <p className="text-xs text-stone-500">18 sản phẩm</p>
              </div>
              <Button size="sm" variant="ghost">Xem</Button>
            </div>
          </Card>
        </div>

        {/* Trust details */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Award className="size-5 text-amber-500" /> Chi tiết uy tín người mua
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Tỷ lệ nhận hàng</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: "98%" }} />
                </div>
                <span className="font-bold text-sm">98%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tỷ lệ hủy đơn</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: "2%" }} />
                </div>
                <span className="font-bold text-sm">2%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Lịch sử giao dịch</span>
              <span className="font-bold text-sm">234 đơn</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Đánh giá từ người bán</span>
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-sm">4.8/5</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-4 italic">
            * Hệ thống uy tín chỉ hỗ trợ quản lý giao dịch và giảm rủi ro, không dùng để phân biệt đối xử.
          </p>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// USER SETTINGS
// ============================================
export function UserSettingsPage() {
  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
      <BuyerHeader />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Cài đặt</h1>

        <Card className="p-6 mb-4">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Bell className="size-4 text-amber-600" /> Thông báo
          </h3>
          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between">
              <span>Đơn hàng cập nhật trạng thái</span>
              <Checkbox defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span>Khuyến mãi nông sản</span>
              <Checkbox defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span>Sản phẩm mới theo danh mục yêu thích</span>
              <Checkbox />
            </label>
            <label className="flex items-center justify-between">
              <span>Báo cáo khiếu nại</span>
              <Checkbox defaultChecked />
            </label>
          </div>
        </Card>

        <Card className="p-6 mb-4">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Shield className="size-4 text-green-600" /> Bảo mật
          </h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Lock className="size-4 mr-2" /> Đổi mật khẩu
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="size-4 mr-2" /> Xác thực 2 bước
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Globe className="size-4 text-blue-600" /> Khác
          </h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Wheat className="size-4 mr-2" /> Chuyển sang chế độ Người bán
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
              Đăng xuất
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
