"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { FaDownload, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Logo } from "@/types/logo";

interface ItemProps {
  logo: Logo;
  index: number;
  setPollLogoID: (id: string) => void;
  onImageClick: (imgRef: HTMLImageElement | null) => void;
}

interface Props {
  logos: Logo[];
  loading: boolean;
  setPollLogoID: (id: string) => void;
  onImageClick: (imgRef: HTMLImageElement | null) => void;
  onEditClick: (id: string) => void;
}

function UserLogoItem({ logo, index, setPollLogoID, onImageClick }: ItemProps) {
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
    const uri = "/api/protected/gen-logo";
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
  const imageRef = useRef<HTMLImageElement>(null);
  return (
    <div key={index} className="rounded-xl overflow-hidden border border-solid">
      {isGenerating ? (
        <div className="py-5 bg-black bg-opacity-50 flex flex-col items-center justify-center aspect-square">
          <FaSpinner className="animate-spin text-white text-4xl" />
          <p className="text-white text-2xl font-bold mt-2">Generating...</p>
        </div>
      ) : isFailed ? (
        <div className="py-5 bg-black bg-opacity-50 flex flex-col items-center justify-center aspect-square">
          <FaExclamationTriangle className="text-white text-4xl" />
          <p className="text-white text-xl font-bold mt-2">Failed</p>
          <Button onClick={onClickRetry} disabled={isGenerating}>
            Retry
          </Button>
        </div>
      ) : (
        <Image
          src={logo.img_url}
          alt={logo.img_description}
          width={350}
          height={350}
          loading="lazy"
          ref={imageRef}
          className="aspect-square object-contain"
          onClick={() => onImageClick(imageRef.current)}
        />
      )}

      <div className="px-2 text-center">
        <CopyToClipboard
          text={logo.img_description}
          onCopy={() => toast.success("Prompt Copied")}
        >
          <p className="text-[#808080] truncate w-full cursor-pointer">
            {logo.img_description}
          </p>
        </CopyToClipboard>
      </div>
    </div>
  );
}

export default function ({
  logos,
  loading,
  setPollLogoID,
  onImageClick,
  onEditClick,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-7xl py-2">
      {loading ? (
        <div className="text-center mx-auto py-4">loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-4">
          {logos?.map((logo, idx) => (
            <UserLogoItem
              key={logo.id}
              logo={logo}
              index={idx}
              setPollLogoID={setPollLogoID}
              onImageClick={onImageClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
