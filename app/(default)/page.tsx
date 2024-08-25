"use client";

import dynamic from "next/dynamic";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

import ImageUploader from "@/components/ImageUploader";
import Hero from "@/components/hero";
import Input from "@/components/input";
import UserLogos from "@/components/user-logos";
import { AppContext } from "@/contexts/AppContext";
import { Logo } from "@/types/logo";
import StripeButton from "@/components/payment/StripeButton";

const ImageCanvas = dynamic(() => import("@/components/ImageCanvas"), {
  ssr: false,
});

export default function Page() {
  const { user } = useContext(AppContext);
  const [userLogos, setUserLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pollLogoID, setPollLogoID] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();

  // ... (keep existing fetchLogos and checkLogoStatus functions)
  const fetchLogos = async function () {
    try {
      const uri = "/api/protected/get-user-logos";
      const resp = await fetch(uri, { method: "POST" });
      setLoading(false);

      if (resp.ok) {
        const res = await resp.json();
        if (res.data) {
          setUserLogos(res.data);
          // Check if any of the logos are still generating
          for (const logo of res.data) {
            if (logo.status === "generating") {
              setPollLogoID(logo.id);
              break;
            }
          }
          return;
        }
      }
    } catch (e) {
      console.log("get logos failed: ", e);
      toast.error("get logos failed");
    }
  };

  // Function to check logo status
  const checkLogoStatus = async (logoId: string) => {
    const uri = "/api/protected/check-logo-status";
    const body = JSON.stringify({ logo_id: logoId });
    const resp = await fetch(uri, { method: "POST", body: body });
    if (resp.ok) {
      const { data } = await resp.json();
      if (data.status !== "generating") {
        console.log("logo is ready");
        setPollLogoID("");
        fetchLogos();
      }
    }
  };

  useEffect(() => {
    // Fetch user logos on page load
    fetchLogos();
  }, []);

  useEffect(() => {
    // Poll for logo status if a logo is still generating
    const pollInterval = setInterval(() => {
      if (pollLogoID) {
        checkLogoStatus(pollLogoID);
      }
    }, 5000);
    return () => clearInterval(pollInterval);
  }, [pollLogoID]);

  const handleEditClick = (logoId: string) => {
    router.push(`/edit/${logoId}`);
  };

  // ... (keep existing useEffect hooks)

  return (
    <div className="flex gap-x-6">
      <div className="flex-1">
        <div className="rounded-lg overflow-hidden p-4 border border-solid">
          <ImageCanvas imageFile={imageFile} />
        </div>
      </div>
      <div className="max-w-3xl flex-1">
        <Hero />
        <div className="my-2 flex justify-center">
          <Input fetchLogos={fetchLogos} />
        </div>
        <h3 className="text-2xl font-bold">Your logos</h3>
        <div className="pt-0">
          <UserLogos
            logos={userLogos}
            loading={loading}
            setPollLogoID={setPollLogoID}
            onImageClick={(imgRef: HTMLImageElement | null) => {
              console.log("Image clicked", imgRef);
              if (!imgRef) return;
              fetch(imgRef.src)
                .then((res) => res.blob())
                .then((blob) => {
                  const file = new File([blob], "logo.png", {
                    type: blob.type,
                  });
                  setImageFile(file);
                });
            }}
            onEditClick={handleEditClick}
          />
        </div>
        <h3 className="text-2xl font-bold">Upload and Edit Image</h3>
        <ImageUploader onImageUpload={setImageFile} />
        <div className="mt-6">
          <StripeButton 
            buyButtonId="buy_btn_1PcwJJRvffTd7ttlE3xYAJDx"
            publishableKey="pk_test_51PatnnRvffTd7ttlX8dfYxHNGhQdNl9jJZbr7NL36PTlx0EkqlmaXb6LFiMYgi4BpOr4zymB6lzh1thuy82eV0XC00ui1w3kxz"
          />
        </div>
      </div>
    </div>
  );
}