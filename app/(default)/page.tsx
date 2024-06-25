"use client";

import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import dynamic from 'next/dynamic';

import Hero from "@/components/hero";
import Input from "@/components/input";
import UserLogos from "@/components/user-logos";
import ImageUploader from "@/components/ImageUploader";
import { AppContext } from "@/contexts/AppContext";
import { Logo } from "@/types/logo";

// 动态导入 ImageEditor 以确保仅在客户端加载
const ImageEditor = dynamic(() => import('@/components/ImageEditor'), { ssr: false });

export default function Page() {
  const { user } = useContext(AppContext);
  const [userLogos, setUserLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pollLogoID, setPollLogoID] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null); // State to hold the selected image file

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
            if (logo.generating) {
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
      if (!data.generating) {
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

  return (
    <div className="md:mt-16">
      <div className="max-w-3xl mx-auto">
        <Hero />
        <div className="mx-auto my-4 flex max-w-lg justify-center">
          <Input fetchLogos={fetchLogos} />
        </div>
      </div>
      <h3 className="text-2xl font-bold">Your logos</h3>
      <div className="pt-0">
        <UserLogos
          logos={userLogos}
          loading={loading}
          setPollLogoID={setPollLogoID}
        />
      </div>
      <h3 className="text-2xl font-bold">Upload and Edit Image</h3>
      <ImageUploader onImageUpload={setImageFile} />
      {imageFile && <ImageEditor imageFile={imageFile} />}
    </div>
  );
}
