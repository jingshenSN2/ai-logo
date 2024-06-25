"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { FaDownload } from "react-icons/fa";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/types/logo";

interface ItemProps {
  logo: Logo;
  index: number;
}

function PublicLogoItem({ logo, index }: ItemProps) {
  return (
    <div
      key={index}
      className="rounded-xl overflow-hidden mb-4 border border-solid border-[#cdcdcd] md:mb-8 lg:mb-10"
    >
      <Image
        // src={logo.img_url}
        src={logo.img_url.replace(".png", "_white.png")}
        alt={logo.img_description}
        width={350}
        height={200}
        loading="lazy"
        className="aspect-[14/8] object-contain"
      />

      <div className="px-5 py-8 sm:px-6">
        <CopyToClipboard
          text={logo.img_description}
          onCopy={() => toast.success("Copied")}
        >
          <p className="text-[#808080] truncate w-full cursor-pointer">
            {logo.img_description}
          </p>
        </CopyToClipboard>
        <div className="flex items-start mb-5 mt-6 flex-wrap gap-2 md:mb-6 lg:mb-8">
          <div className="flex flex-wrap gap-2 flex-1">
            <Badge variant="secondary">{logo.img_size}</Badge>
            <Badge variant="secondary">{logo.llm_name}</Badge>
            {logo.llm_name === "dall-e-3" && (
              <Badge variant="secondary">{logo.img_quality}</Badge>
            )}
            {logo.llm_name === "dall-e-3" && (
              <Badge variant="secondary">{logo.img_style}</Badge>
            )}
          </div>
          <Avatar>
            <AvatarImage
              src={logo.created_user_avatar_url}
              alt={logo.created_user_nickname}
            />
            <AvatarFallback>{logo.created_user_nickname}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <a
            href={logo.img_url}
            className="flex items-center max-w-full gap-2.5 text-sm font-bold uppercase text-black"
          >
            <p>Download</p>
            <p className="text-sm">
              <FaDownload />
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function () {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogos = async function () {
    try {
      const uri = "/api/get-public-logos";
      setLoading(true);
      const resp = await fetch(uri, { method: "POST" });
      setLoading(false);

      if (resp.ok) {
        const res = await resp.json();
        if (res.data) {
          setLogos(res.data);
          return;
        }
      }
    } catch (e) {
      console.log("get public logos failed: ", e);
      toast.error("get public logos failed");
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-0 py-2 md:px-10 md:py-8 lg:py-8">
      {loading ? (
        <div className="text-center mx-auto py-4">loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-x-4">
          {logos?.map((logo, idx) => (
            <PublicLogoItem key={logo.id} logo={logo} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
