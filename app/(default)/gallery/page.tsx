"use client";

import { useContext, useEffect, useState } from "react";

import { Logo } from "@/types/logo";
import Logos from "@/components/logos";
import { toast } from "sonner";
import { AppContext } from "@/contexts/AppContext";

export default function () {
  const { user } = useContext(AppContext);
  const [publicLogos, setPublicLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogos = async function () {
    try {
      const uri = "/api/get-public-logos";
      setLoading(true);
      const resp = await fetch(uri, { method: "POST" });
      setLoading(false);

      if (resp.ok) {
        const res = await resp.json();
        if (res.data) {
          setPublicLogos(res.data);
          return;
        }
      }
    } catch (e) {
      console.log("get logos failed: ", e);
      toast.error("get logos failed");
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  return (
    <div className="md-16">
      <h3 className="text-2xl font-bold">Logo shared with everyone</h3>
      <Logos logos={publicLogos} loading={loading} is_public={true} />
    </div>
  );
}
