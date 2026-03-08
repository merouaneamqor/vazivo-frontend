"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QrCode, Download, Share2, Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { getBusinessCityDisplay } from "@/lib/utils";
import QRCode from "qrcode";

export default function ReviewQRCodePage() {
  const t = useTranslations("businessPage");
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [selectedBusinessName, setSelectedBusinessName] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const { data: businesses } = useQuery({
    queryKey: ["provider", "businesses"],
    queryFn: () => api.getProviderBusinesses(),
  });

  const generateQR = async (businessId: number, businessSlug: string, businessName: string) => {
    const reviewUrl = `${window.location.origin}/review/${businessSlug}`;
    const dataUrl = await QRCode.toDataURL(reviewUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    setQrDataUrl(dataUrl);
    setSelectedBusinessId(businessId);
    setSelectedBusinessName(businessName);
  };

  const downloadQR = () => {
    const link = document.createElement("a");
    link.download = "review-qr-code.png";
    link.href = qrDataUrl;
    link.click();
  };

  const printQR = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Review QR Code</title>
            <style>
              body { text-align: center; padding: 40px; font-family: system-ui, -apple-system, sans-serif; }
              h1 { font-size: 32px; margin-bottom: 10px; }
              h2 { font-size: 24px; color: #666; margin-bottom: 30px; }
              img { max-width: 400px; }
            </style>
          </head>
          <body>
            <h1>${selectedBusinessName}</h1>
            <h2>${t("scanToReview")}</h2>
            <img src="${qrDataUrl}" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("generateQRCode")}</h1>
        <p className="text-neutral-600 mt-2">
          {t("customersCanScan")}
        </p>
      </div>

      {/* Business Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t("selectBusiness")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {businesses?.businesses?.map((business: any) => (
              <button
                key={business.id}
                onClick={() => generateQR(business.id, business.slug, business.name)}
                className={`p-4 border rounded-lg text-left hover:border-primary-500 transition-colors ${
                  selectedBusinessId === business.id ? "border-primary-500 bg-primary-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {business.logo_url && (
                    <img
                      src={business.logo_url}
                      alt={business.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{business.name}</h3>
                    <p className="text-sm text-neutral-500">{getBusinessCityDisplay(business.city)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* QR Code Display */}
      {qrDataUrl && (
        <Card>
          <CardHeader>
            <CardTitle>{t("yourReviewQRCode")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">{selectedBusinessName}</h3>
                <p className="text-neutral-600 mb-4">{t("scanToReview")}</p>
              </div>
              
              <div className="bg-white p-6  border-2 border-neutral-200">
                <img src={qrDataUrl} alt="Review QR Code" className="w-80 h-80" />
              </div>

              <div className="text-center">
                <p className="text-sm text-neutral-600 mb-4">
                  {t("customersCanScan")}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={downloadQR} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {t("download")}
                  </Button>
                  <Button onClick={printQR} variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    {t("print")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
