"use client";
import { useEffect, useState } from "react";
import { BuyerHeader } from "@/components/agri/buyer-header";
import { BuyerContractDocument } from "@/components/agri/buyer-contract-document";
import { getMyProfile, type UserProfile } from "@/lib/api-client";

export function BuyerAgreementViewPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let active = true;
    getMyProfile()
      .then((user) => {
        if (active) setProfile(user);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const fullAddress = [profile?.address, profile?.ward, profile?.district, profile?.province]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
      <BuyerHeader />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Văn bản Hợp đồng Mua sắm & Thỏa thuận Người tiêu dùng</h1>
          <p className="text-sm text-stone-500">
            Văn bản điện tử chính thức được xác lập giữa Khách hàng và Sàn Thương mại điện tử AgriSmart AI.
          </p>
        </div>

        <BuyerContractDocument
          readOnly={true}
          isSigned={true}
          partyB={{
            name: profile?.name,
            phone: profile?.phone,
            email: profile?.email,
            address: fullAddress || undefined,
          }}
        />
      </div>
    </div>
  );
}
