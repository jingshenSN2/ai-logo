"use client";

import { KeyboardEvent, useContext, useEffect, useRef, useState } from "react";

import { AppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

enum LLM {
  DALL_E_3 = "dall-e-3",
  DALL_E_2 = "dall-e-2",
}
const IMG_SIZES = {
  [LLM.DALL_E_3]: ["1792x1024", "1024x1792", "1024x1024"],
  [LLM.DALL_E_2]: ["1024x1024", "512x512", "256x256"],
};
const QUALITIES = {
  [LLM.DALL_E_3]: ["hd", "standard"],
  [LLM.DALL_E_2]: ["standard"],
};
const STYLES = {
  [LLM.DALL_E_3]: ["vivid", "natural"],
  [LLM.DALL_E_2]: ["natural"],
};

interface Props {
  fetchLogos: () => void;
}

export default function ({ fetchLogos }: Props) {
  const { user, fetchUserInfo } = useContext(AppContext);

  const [description, setDescription] = useState("");

  const [advanceOptOpen, setAdvanceOptOpen] = useState(false);

  const [llmname, setLlmname] = useState(LLM.DALL_E_3);
  const [imgsize, setImgsize] = useState(IMG_SIZES[llmname][0]);
  const [quality, setQuality] = useState(QUALITIES[llmname][0]);
  const [style, setStyle] = useState(STYLES[llmname][0]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const requestGenLogo = async function () {
    try {
      const uri = "/api/protected/gen-logo";
      const params = {
        description: description,
        llm_name: llmname,
        img_size: imgsize,
        quality: quality,
        style: style,
      };

      setLoading(true);
      const resp = await fetch(uri, {
        method: "POST",
        body: JSON.stringify(params),
      });
      setLoading(false);

      if (resp.status === 401) {
        toast.error("Please Sign In");
        router.push("/sign-in");
        return;
      }

      if (resp.ok) {
        const { code, message, data } = await resp.json();
        if (code !== 0) {
          toast.error(message);
          return;
        }
        if (data && data.id) {
          setDescription("");
          fetchUserInfo();
          fetchLogos();
          toast.success("gen logo ok");
          return;
        }
      }

      toast.error("gen logo failed");
    } catch (e) {
      console.log("search failed: ", e);
      toast.error("gen logo failed");
    }
  };

  const handleInputKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter" && !e.shiftKey) {
      if (e.keyCode !== 229) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const handleSubmit = function () {
    if (!description) {
      toast.error("invalid image description");
      inputRef.current?.focus();
      return;
    }

    if (!user) {
      toast.error("please sign in");
      return;
    }

    if (!user.super_user && user.credits && user.credits.left_credits < 1) {
      toast.error("credits not enough");
      return;
    }

    requestGenLogo();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col w-full">
        <form
          className="flex w-full flex-col gap-3 sm:flex-row"
          onSubmit={() => {
            return false;
          }}
        >
          <Input
            type="text"
            placeholder="Logo description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleInputKeydown}
            disabled={loading}
            ref={inputRef}
          />
          <Button type="button" disabled={loading} onClick={handleSubmit}>
            {loading ? "Generating..." : "Generate"}
          </Button>
        </form>
      </div>

      <div className="flex items-center">
        <h3 className="mx-2 my-4 text-sm text-[#636262]">Advance Options</h3>
        <div
          className="cursor-pointer"
          onClick={() => setAdvanceOptOpen(!advanceOptOpen)}
        >
          {advanceOptOpen ? <FaAngleUp /> : <FaAngleDown />}
        </div>
      </div>
      {advanceOptOpen && (
        <div className="w-full gap-3 border border-input rounded-md p-2">
          {/* Dropdown of LLM model */}
          <div className="flex items-center">
            <div className="mx-2 text-sm text-[#636262]">Model:</div>
            <ToggleGroup
              value={llmname}
              onChange={(e) => {
                setLlmname(e as LLM);
                setImgsize(IMG_SIZES[e as LLM][0]);
                setQuality(QUALITIES[e as LLM][0]);
                setStyle(STYLES[e as LLM][0]);
              }}
              disabled={loading}
              options={[LLM.DALL_E_3, LLM.DALL_E_2]}
            />
          </div>
          {/* Dropdown of image size */}
          <div className="flex items-center">
            <div className="mx-2 text-sm text-[#636262]">Image Size:</div>
            <ToggleGroup
              value={imgsize}
              onChange={setImgsize}
              disabled={loading}
              options={IMG_SIZES[llmname]}
            />
          </div>
          {/* Dropdown of image quality */}
          <div className="flex items-center">
            <div className="mx-2 text-sm text-[#636262]">Quality:</div>
            <ToggleGroup
              value={quality}
              onChange={setQuality}
              disabled={loading}
              options={QUALITIES[llmname]}
            />
          </div>
          {/* Dropdown of image style */}
          <div className="flex items-center">
            <div className="mx-2 text-sm text-[#636262]">Style:</div>
            <ToggleGroup
              value={style}
              onChange={setStyle}
              disabled={loading}
              options={STYLES[llmname]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
