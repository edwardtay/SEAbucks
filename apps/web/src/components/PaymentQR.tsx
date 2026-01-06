"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Download, Share2, Copy, Check, Smartphone } from "lucide-react";

interface PaymentQRProps {
  paymentUrl: string;
  amount: string;
  currency: string;
  merchantName?: string;
  memo?: string;
}

export function PaymentQR({ paymentUrl, amount, currency, merchantName, memo }: PaymentQRProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pay ${amount} ${currency}`,
          text: memo || `Payment request from ${merchantName || "SEAbucks"}`,
          url: paymentUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `💰 Payment Request\n\nAmount: ${amount} ${currency}${memo ? `\nNote: ${memo}` : ""}\n\nPay here: ${paymentUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleDownload = () => {
    const svg = document.getElementById("payment-qr-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `seabucks-payment-${Date.now()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="bg-white rounded-2xl p-6 text-center">
      {/* QR Code */}
      <div className="inline-block p-4 bg-white rounded-xl shadow-inner">
        <QRCodeSVG
          id="payment-qr-svg"
          value={paymentUrl}
          size={200}
          level="H"
          marginSize={4}
          imageSettings={{
            src: "/logo.svg",
            x: undefined,
            y: undefined,
            height: 40,
            width: 40,
            excavate: true,
          }}
        />
      </div>

      {/* Amount Display */}
      <div className="mt-4">
        <div className="text-3xl font-bold text-black">
          {amount} <span className="text-slate-500">{currency}</span>
        </div>
        {memo && (
          <div className="text-sm text-slate-500 mt-1">"{memo}"</div>
        )}
      </div>

      {/* Scan instruction */}
      <div className="mt-4 flex items-center justify-center gap-2 text-slate-600 text-sm">
        <Smartphone className="w-4 h-4" />
        <span>Scan with any wallet app</span>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            copied 
              ? "bg-green-100 text-green-700" 
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          onClick={handleWhatsAppShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
        >
          <Download className="w-4 h-4" />
          Save
        </button>
      </div>

      {/* SEAbucks branding */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-400">Powered by SEAbucks on Lisk</div>
      </div>
    </div>
  );
}

// Compact QR for inline display
export function CompactQR({ url, size = 120 }: { url: string; size?: number }) {
  return (
    <div className="inline-block p-2 bg-white rounded-lg">
      <QRCodeSVG value={url} size={size} level="M" />
    </div>
  );
}
