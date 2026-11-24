"use client";
import React from "react";
import { Printer, ShieldCheck, CheckCircle2, FileCheck, Award } from "lucide-react";
import {
  sellerAgreementLegalBases,
  partyAInformation,
  sellerContractArticles,
  AgreementPartyInfo,
} from "@/lib/seller-agreement";
import { Button } from "@/components/ui/button";

interface SellerContractDocumentProps {
  partyB?: AgreementPartyInfo;
  readOnly?: boolean;
  isSigned?: boolean;
}

export function SellerContractDocument({
  partyB,
  readOnly = false,
  isSigned = false,
}: SellerContractDocumentProps) {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date().toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between mb-3 px-1 print:hidden">
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <FileCheck className="size-4 text-emerald-600" />
          <span>Văn bản Hợp đồng kinh tế điện tử chính quy</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="h-8 text-xs gap-1.5 border-stone-300 text-stone-700 hover:bg-stone-100"
        >
          <Printer className="size-3.5" />
          In / Lưu PDF văn bản
        </Button>
      </div>

      {/* Main Document Paper */}
      <div className="bg-white border border-stone-300 rounded-xl shadow-md p-6 sm:p-10 text-stone-800 text-sm leading-relaxed font-sans selection:bg-amber-100 print:border-none print:shadow-none print:p-0">
        
        {/* National Emblem & Motto */}
        <div className="text-center mb-6 pb-4 border-b border-stone-200">
          <p className="font-bold uppercase tracking-wider text-stone-900 text-xs sm:text-sm">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </p>
          <p className="font-semibold text-stone-800 text-xs sm:text-sm mt-0.5">
            Độc lập – Tự do – Hạnh phúc
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-stone-400 text-xs">
            <span>——</span>
            <span className="text-[10px]">★★★</span>
            <span>——</span>
          </div>
          <p className="text-[11px] italic text-stone-500 mt-2">
            Hôm nay, ngày {formattedDate}, tại Hệ thống Sàn Giao dịch Nông sản trực tuyến AgriSmart
          </p>
        </div>

        {/* Contract Title */}
        <div className="text-center my-6">
          <h2 className="text-lg sm:text-xl font-extrabold uppercase text-stone-900 tracking-wide font-serif">
            HỢP ĐỒNG HỢP TÁC KINH DOANH VÀ CUNG ỨNG DỊCH VỤ SÀN THƯƠNG MẠI ĐIỆN TỬ
          </h2>
          <p className="text-xs text-stone-600 font-mono mt-1 font-medium">
            Số: HĐ-AGRI/2026/S-ONLINE · Phiên bản điện tử số 2.0
          </p>
        </div>

        {/* Legal Bases */}
        <div className="mb-6 bg-stone-50/80 p-3.5 rounded-lg border border-stone-200/80 text-xs text-stone-600 space-y-1">
          {sellerAgreementLegalBases.map((base, idx) => (
            <p key={idx} className="italic flex items-start gap-1.5">
              <span className="text-stone-400 font-bold shrink-0">•</span>
              <span>{base}</span>
            </p>
          ))}
          <p className="italic pt-1 font-medium text-stone-700">
            Hai bên thống nhất ký kết Hợp đồng hợp tác kinh doanh và mở gian hàng với các điều khoản chi tiết dưới đây:
          </p>
        </div>

        {/* Parties Information */}
        <div className="space-y-4 mb-8">
          {/* Party A */}
          <div className="border border-stone-200 rounded-lg p-4 bg-emerald-50/30">
            <h3 className="font-bold uppercase text-emerald-950 text-xs tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="size-4 text-emerald-600" />
              BÊN A: ĐƠN VỊ VẬN HÀNH SÀN THƯƠNG MẠI ĐIỆN TỬ (SÀN AGRISMART)
            </h3>
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-stone-700">
              <p className="sm:col-span-2">
                <strong>Đơn vị:</strong> {partyAInformation.name} ({partyAInformation.platform})
              </p>
              <p>
                <strong>Đại diện:</strong> {partyAInformation.representative}
              </p>
              <p>
                <strong>Hotline CSKH:</strong> {partyAInformation.hotline}
              </p>
              <p className="sm:col-span-2">
                <strong>Địa chỉ:</strong> {partyAInformation.address}
              </p>
              <p>
                <strong>Email hỗ trợ:</strong> {partyAInformation.email}
              </p>
              <p>
                <strong>Website:</strong> {partyAInformation.website}
              </p>
            </div>
          </div>

          {/* Party B */}
          <div className="border border-stone-200 rounded-lg p-4 bg-amber-50/30">
            <h3 className="font-bold uppercase text-amber-950 text-xs tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-amber-600" />
              BÊN B: THƯƠNG NHÂN / CHỦ GIAN HÀNG NÔNG SẢN ĐỐI TÁC
            </h3>
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-stone-700">
              <p>
                <strong>Họ tên người đăng ký / đại diện:</strong>{" "}
                <span className="font-semibold text-stone-900">{partyB?.name || "(Theo tài khoản đăng ký)"}</span>
              </p>
              <p>
                <strong>Tên gian hàng / Nông trại:</strong>{" "}
                <span className="font-semibold text-stone-900">{partyB?.farmName || "(Chưa cập nhật)"}</span>
              </p>
              <p>
                <strong>Số Căn cước công dân (CCCD):</strong>{" "}
                <span className="font-mono font-bold text-amber-900 bg-amber-100/60 px-1.5 py-0.5 rounded border border-amber-200">
                  {partyB?.citizenId || "Đang cập nhật hồ sơ"}
                </span>
              </p>
              <p>
                <strong>Ngày cấp CCCD:</strong>{" "}
                <span>
                  {partyB?.citizenCardDate
                    ? new Date(partyB.citizenCardDate).toLocaleDateString("vi-VN")
                    : "Theo thông tin CCCD"}
                </span>
              </p>
              <p className="sm:col-span-2">
                <strong>Địa chỉ cơ sở sản xuất / Trang trại:</strong>{" "}
                <span>{partyB?.farmAddress || "(Chưa cập nhật địa chỉ)"}</span>
              </p>
              <p>
                <strong>Số điện thoại:</strong> <span>{partyB?.phone || "(Theo tài khoản)"}</span>
              </p>
              <p>
                <strong>Email liên hệ:</strong> <span>{partyB?.email || "(Theo tài khoản)"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Contract Articles */}
        <div className="space-y-6 mb-10">
          {sellerContractArticles.map((article, idx) => (
            <div key={idx} className="space-y-1.5 text-justify">
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wide">
                Điều {idx + 1}. {article.title}
              </h4>
              <div className="space-y-1 pl-3 text-stone-700 text-xs sm:text-sm leading-relaxed">
                {article.clauses.map((clause, cIdx) => (
                  <p key={cIdx} className="relative pl-5">
                    <span className="absolute left-0 top-0 font-medium text-stone-500">
                      {idx + 1}.{cIdx + 1}.
                    </span>
                    {clause}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Signatures Section */}
        <div className="border-t-2 border-stone-300 pt-6 mt-8">
          <div className="text-center font-bold text-xs uppercase text-stone-700 mb-6 tracking-wide">
            XÁC NHẬN VÀ KÝ KẾT HỢP ĐỒNG ĐIỆN TỬ
          </div>
          
          <div className="grid grid-cols-2 gap-6 text-center text-xs">
            {/* Party A Signature */}
            <div className="space-y-2 flex flex-col items-center">
              <p className="font-bold uppercase text-stone-900">ĐẠI DIỆN BÊN A</p>
              <p className="text-[11px] text-stone-500 italic">(Đã ký số điện tử)</p>
              
              {/* Digital Stamp Seal */}
              <div className="my-3 size-28 rounded-full border-2 border-dashed border-red-500 flex flex-col items-center justify-center p-2 text-red-600 bg-red-50/40 transform -rotate-3 select-none">
                <span className="text-[9px] font-extrabold uppercase leading-tight text-center">
                  CÔNG TY CP AGRISMART
                </span>
                <span className="text-[10px] font-bold text-red-700 my-0.5">
                  ★ ĐÃ PHÊ DUYỆT ★
                </span>
                <span className="text-[8px] text-stone-500">
                  {formattedDate}
                </span>
                <span className="text-[8px] font-mono text-red-500">
                  ID: #AGRI-SYS-AUTH
                </span>
              </div>
              
              <p className="font-bold text-stone-800">BAN GIÁM ĐỐC NỀN TẢNG</p>
              <p className="text-[11px] text-emerald-700 font-medium">Hệ thống Sàn AgriSmart AI</p>
            </div>

            {/* Party B Signature */}
            <div className="space-y-2 flex flex-col items-center">
              <p className="font-bold uppercase text-stone-900">ĐẠI DIỆN BÊN B</p>
              <p className="text-[11px] text-stone-500 italic">
                {isSigned || readOnly ? "(Đã xác nhận điện tử)" : "(Ký điện tử khi nộp hồ sơ)"}
              </p>
              
              {/* Party B Confirmation Badge */}
              <div className="my-3 h-28 w-44 rounded-lg border border-amber-300 bg-amber-50/50 flex flex-col items-center justify-center p-2 text-stone-700">
                <CheckCircle2 className="size-6 text-amber-600 mb-1" />
                <span className="text-[10px] font-bold text-amber-900">XÁC NHẬN TRỰC TUYẾN</span>
                <span className="text-[9px] font-mono text-stone-600 mt-0.5">
                  CCCD: {partyB?.citizenId ? partyB.citizenId.slice(0, 4) + " •••• " + partyB.citizenId.slice(-4) : "CHƯA XÁC MINH"}
                </span>
                <span className="text-[8px] text-stone-500 mt-1">
                  Giá trị pháp lý theo Luật GDĐT 2023
                </span>
              </div>

              <p className="font-bold text-stone-800 uppercase">
                {partyB?.name || "NGƯỜI ĐẠI DIỆN GIAN HÀNG"}
              </p>
              <p className="text-[11px] text-stone-500 font-medium">
                {partyB?.farmName || "Chủ hộ / Doanh nghiệp nông sản"}
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-[11px] text-stone-500 italic border-t border-stone-100 pt-3">
            Hợp đồng điện tử này được khởi tạo và lưu trữ trên Hệ sinh thái Thương mại điện tử AgriSmart AI.
          </div>
        </div>

      </div>
    </div>
  );
}
