"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FaDownload, FaSpinner } from "react-icons/fa";
import Image from "next/image";
import { Logo } from "@/types/logo";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface ItemProps {
  logo: Logo;
  index: number;
}

interface Props {
  logos: Logo[];
  loading: boolean;
  is_public: boolean;
}

function UserLogoItem({ logo, index }: ItemProps) {
  const [disable, setDisable] = useState(false);

  const onClick = async () => {
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

  return (
    <div
      key={index}
      className="rounded-xl overflow-hidden mb-4 inline-block border border-solid border-[#cdcdcd] md:mb-8 lg:mb-10"
    >
      {logo.generating ? (
        <div className="py-20 bg-black bg-opacity-50 flex flex-col items-center justify-center">
          <FaSpinner className="animate-spin text-white text-4xl" />
          <p className="text-white text-2xl font-bold mt-2">Generating...</p>
        </div>
      ) : (
        <Image
          src={logo.img_url}
          alt={logo.img_description}
          width={350}
          height={200}
          loading="lazy"
        />
      )}

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
          {logo.generating ? (
            <div className="flex items-center max-w-full gap-2.5 text-sm font-bold uppercase text-gray-500">
              <p>Download unavailable</p>
            </div>
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
          {!logo.generating && (
            <Button onClick={onClick} disabled={disable}>
              Public/Private
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PublicLogoItem({ logo, index }: ItemProps) {
  return (
    <div
      key={index}
      className="rounded-xl overflow-hidden mb-4 inline-block border border-solid border-[#cdcdcd] md:mb-8 lg:mb-10"
    >
      {logo.generating ? (
        <div className="absolute top-0 left-0 w-[350px] h-[200px] bg-black bg-opacity-50 flex items-center justify-center">
          <p className="text-white text-2xl font-bold">Generating...</p>
        </div>
      ) : (
        <Image
          src={logo.img_url}
          alt={logo.img_description}
          width={350}
          height={200}
          loading="lazy"
        />
      )}

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

export default function ({ logos, loading, is_public }: Props) {
  return (
    <section>
      <div className="mx-auto w-full max-w-7xl px-0 py-2 md:px-10 md:py-8 lg:py-8">
        <div className="flex flex-col items-stretch">
          <div className="gap-x-8 [column-count:1] md:grid-cols-2 md:gap-x-4 md:[column-count:3]">
            {loading ? (
              <div className="text-center mx-auto py-4">loading...</div>
            ) : (
              <>
                {logos?.map((logo, idx) =>
                  is_public ? (
                    <PublicLogoItem key={idx} logo={logo} index={idx} />
                  ) : (
                    <UserLogoItem key={idx} logo={logo} index={idx} />
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
