"use client";

import { useRouter } from "next/navigation";
import {
  KeyboardEvent,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { AppContext } from "@/contexts/AppContext";

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

  type InputStates = {
    description: string;
    llmname: LLM;
    imgsize: string;
    quality: string;
    style: string;
  };

  const initStates: InputStates = {
    description: "",
    llmname: LLM.DALL_E_3,
    imgsize: IMG_SIZES[LLM.DALL_E_3][0],
    quality: QUALITIES[LLM.DALL_E_3][0],
    style: STYLES[LLM.DALL_E_3][0],
  };

  type Action = { type: "update"; newStates: Partial<InputStates> };

  const reducer = (state: InputStates, action: Action): InputStates => {
    switch (action.type) {
      case "update":
        return { ...state, ...action.newStates };
      default:
        return state;
    }
  };

  const [inputs, dispatch] = useReducer(reducer, initStates);

  const [advanceOptOpen, setAdvanceOptOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const requestGenLogo = async function () {
    try {
      const uri = "/api/protected/gen-logo";
      const params = {
        description: inputs.description,
        llm_name: inputs.llmname,
        img_size: inputs.imgsize,
        quality: inputs.quality,
        style: inputs.style,
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
          dispatch({ type: "update", newStates: { description: "" } });
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
    if (!inputs.description) {
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
            value={inputs.description}
            onChange={(e) =>
              dispatch({
                type: "update",
                newStates: { description: e.target.value },
              })
            }
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
              value={inputs.llmname}
              onChange={(e) => {
                dispatch({
                  type: "update",
                  newStates: {
                    llmname: e as LLM,
                    imgsize: IMG_SIZES[e as LLM][0],
                    quality: QUALITIES[e as LLM][0],
                    style: STYLES[e as LLM][0],
                  },
                });
              }}
              disabled={loading}
              options={[LLM.DALL_E_3, LLM.DALL_E_2]}
            />
          </div>
          {/* Dropdown of image size */}
          <div className="flex items-center">
            <div className="mx-2 text-sm text-[#636262]">Image Size:</div>
            <ToggleGroup
              value={inputs.imgsize}
              onChange={(e) =>
                dispatch({ type: "update", newStates: { imgsize: e } })
              }
              disabled={loading}
              options={IMG_SIZES[inputs.llmname as LLM]}
            />
          </div>
          {/* Dropdown of image quality */}
          <div className="flex items-center">
            <div className="mx-2 text-sm text-[#636262]">Quality:</div>
            <ToggleGroup
              value={inputs.quality}
              onChange={(e) =>
                dispatch({ type: "update", newStates: { quality: e } })
              }
              disabled={loading}
              options={QUALITIES[inputs.llmname as LLM]}
            />
          </div>
          {/* Dropdown of image style */}
          <div className="flex items-center">
            <div className="mx-2 text-sm text-[#636262]">Style:</div>
            <ToggleGroup
              value={inputs.style}
              onChange={(e) =>
                dispatch({ type: "update", newStates: { style: e } })
              }
              disabled={loading}
              options={STYLES[inputs.llmname as LLM]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
