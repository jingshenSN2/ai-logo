"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";
import { FaDownload } from "react-icons/fa";
import Image from "next/image";
import { Logo } from "@/types/logo";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ItemProps {
  logo: Logo;
  index: number;
}

function PublicLogoItem({ logo, index }: ItemProps) {
  return (
    <div
      key={index}
      className="rounded-xl overflow-hidden mb-4 inline-block border border-solid border-[#cdcdcd] md:mb-8 lg:mb-10"
    >
      <Image
        src={logo.img_url}
        alt={logo.img_description}
        width={350}
        height={200}
        loading="lazy"
      />

      <div className="px-5 py-8 sm:px-6">
        <p className="flex-col text-[#808080]">{logo.img_description}</p>
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
    <section>
      <div className="mx-auto w-full max-w-7xl px-0 py-2 md:px-10 md:py-8 lg:py-8">
        <div className="flex flex-col items-stretch">
          <div className="gap-x-8 [column-count:1] md:grid-cols-2 md:gap-x-4 md:[column-count:3]">
            {loading ? (
              <div className="text-center mx-auto py-4">loading...</div>
            ) : (
              <>
                {logos?.map((logo, idx) => (
                  <PublicLogoItem key={logo.id} logo={logo} index={idx} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
