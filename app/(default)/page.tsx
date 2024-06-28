"use client";

import dynamic from "next/dynamic";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import ImageUploader from "@/components/ImageUploader";
import Hero from "@/components/hero";
import Input from "@/components/input";
import UserLogos from "@/components/user-logos";
import { AppContext } from "@/contexts/AppContext";
import { Logo } from "@/types/logo";

const ImageCanvas = dynamic(() => import("@/components/ImageCanvas"), {
  ssr: false,
});

export default function Page() {
  const { user } = useContext(AppContext);
  const [userLogos, setUserLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pollLogoID, setPollLogoID] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null); // State to hold the selected image file
  const [backgroundColor, setBackgroundColor] = useState("white_t"); // State to hold the background color

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

  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
  };

  return (
    <div className="flex">
      <div className="flex-1">
        <ImageCanvas imageFile={imageFile} backgroundColor={backgroundColor} />
      </div>
      <div className="max-w-3xl mx-auto flex-1">
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
          />
        </div>
        <h3 className="text-2xl font-bold">Upload and Edit Image</h3>
        <ImageUploader onImageUpload={setImageFile} />
        <div className="flex items-center mt-4">
          <span className="mr-2">Background:</span>
          <div
            className={`w-6 h-6 rounded-full bg-white border ${
              backgroundColor === "white_t" ? "border-black" : ""
            }`}
            onClick={() => handleBackgroundColorChange("white_t")}
            style={{ cursor: "pointer" }}
          />
          <div
            className={`w-6 h-6 rounded-full bg-black border ml-2 ${
              backgroundColor === "black_t" ? "border-black" : ""
            }`}
            onClick={() => handleBackgroundColorChange("black_t")}
            style={{ cursor: "pointer" }}
          />
          <div
            className={`w-6 h-6 rounded-full bg-gray-500 border ml-2 ${
              backgroundColor === "grey_t" ? "border-black" : ""
            }`}
            onClick={() => handleBackgroundColorChange("grey_t")}
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>
    </div>
  );
}
