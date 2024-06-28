"use client";

import Image from "next/image";
import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { FaDownload, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/types/logo";

interface ItemProps {
  logo: Logo;
  index: number;
  setPollLogoID: (id: string) => void;
}

interface Props {
  logos: Logo[];
  loading: boolean;
  setPollLogoID: (id: string) => void;
}

function UserLogoItem({ logo, index, setPollLogoID }: ItemProps) {
  const [disable, setDisable] = useState(false);

  const onClickPublicOrPrivate = async () => {
    const uri = "/api/protected/update-logo";
    const body = JSON.stringify({ logo_id: logo.id });
    setDisable(true);
    const resp = await fetch(uri, { method: "POST", body: body });
    setDisable(false);
    if (resp.status === 401) {
      toast.error("Update failed, please try again");
      return;
    }
    if (resp.ok) {
      const { data } = await resp.json();
      const new_state = data.new_state;
      if (new_state === "public") {
        toast.success(
          `update logo to ${new_state.toUpperCase()}, check it in gallery`
        );
      } else {
        toast.success(
          `update logo to ${new_state.toUpperCase()}, only you can see it now`
        );
      }
      return;
    }
  };

  const onClickRetry = async () => {
    const uri = "/api/protected/regen-logo";
    const body = JSON.stringify({
      logo_id: logo.id,
    });

    logo.status = "generating";
    const resp = await fetch(uri, { method: "POST", body: body });

    if (resp.ok) {
      toast.success("Retrying, please wait for a moment");
      setPollLogoID(logo.id);
    }
  };

  const isGenerating = logo.status === "generating";
  const isFailed = logo.status === "failed";

  return (
    <div
      key={index}
      className="rounded-xl overflow-hidden mb-4 border border-solid border-[#cdcdcd] md:mb-8 lg:mb-10"
    >
      {isGenerating ? (
        <div className="py-5 bg-black bg-opacity-50 flex flex-col items-center justify-center aspect-[14/8]">
          <FaSpinner className="animate-spin text-white text-4xl" />
          <p className="text-white text-2xl font-bold mt-2">Generating...</p>
        </div>
      ) : isFailed ? (
        <div className="py-5 bg-black bg-opacity-50 flex flex-col items-center justify-center aspect-[14/8]">
          <FaExclamationTriangle className="text-white text-4xl" />
          <p className="text-white text-2xl font-bold mt-2">Generate failed</p>
        </div>
      ) : (
        <Image
          src={logo.img_url}
          alt={logo.img_description}
          width={350}
          height={200}
          loading="lazy"
          className="aspect-[14/8] object-contain"
        />
      )}

      <div className="px-5 py-4 sm:px-6">
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
          {isGenerating ? (
            <div className="flex items-center max-w-full gap-2.5 text-sm font-bold uppercase text-gray-500">
              <p>Download unavailable</p>
            </div>
          ) : isFailed ? (
            <Button onClick={onClickRetry}>Retry</Button>
          ) : (
            <a
              href={logo.img_url}
              className="flex items-center max-w-full gap-2.5 text-sm font-bold uppercase text-black"
            >
              <p>Download</p>
              <p className="text-sm">
                <FaDownload />
              </p>
            </a>
          )}
          {!isGenerating && !isFailed && (
            <Button onClick={onClickPublicOrPrivate} disabled={disable}>
              Public/Private
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ({ logos, loading, setPollLogoID }: Props) {
  return (
    <div className="mx-auto w-full max-w-7xl px-0 py-2 md:px-10 md:py-8 lg:py-8">
      {loading ? (
        <div className="text-center mx-auto py-4">loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-x-4">
          {logos?.map((logo, idx) => (
            <UserLogoItem
              key={logo.id}
              logo={logo}
              index={idx}
              setPollLogoID={setPollLogoID}
            />
          ))}
        </div>
      )}
    </div>
  );
}
