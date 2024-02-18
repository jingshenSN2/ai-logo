"use client";

import {
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { AppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/types/logo";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Select } from "../ui/select";

interface Props {
  logos: Logo[];
  setLogos: Dispatch<SetStateAction<Logo[]>>;
}

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

export default function ({ setLogos }: Props) {
  const { user, fetchUserInfo } = useContext(AppContext);

  const [description, setDescription] = useState("");
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
      console.log("gen logo resp", resp);

      if (resp.ok) {
        const { code, message, data } = await resp.json();
        if (code !== 0) {
          toast.error(message);
          return;
        }
        if (data && data.img_url) {
          fetchUserInfo();

          setDescription("");

          const logo: Logo = data;
          logo.llm_params = JSON.parse(logo.llm_params);
          setLogos((logos: Logo[]) => [logo, ...logos]);

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

    if (user.credits && user.credits.left_credits < 1) {
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

      <h3 className="mx-2 my-4 text-sm text-[#636262]">Advance Options:</h3>
      <div className="flex w-full gap-3">
        {/* Dropdown of LLM model */}
        <Select
          value={llmname}
          onChange={(e) => setLlmname(e.target.value as LLM)}
          disabled={loading}
          options={[LLM.DALL_E_3, LLM.DALL_E_2]}
        />
        {/* Dropdown of image size */}
        <Select
          value={imgsize}
          onChange={(e) => setImgsize(e.target.value)}
          disabled={loading}
          options={IMG_SIZES[llmname]}
        />
        {/* Dropdown of image quality */}
        <Select
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          disabled={loading}
          options={QUALITIES[llmname]}
        />
        {/* Dropdown of image style */}
        <Select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          disabled={loading}
          options={STYLES[llmname]}
        />
      </div>
    </div>
  );
}
