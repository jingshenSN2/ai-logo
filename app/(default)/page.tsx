"use client";

import { useContext, useEffect, useState } from "react";

import Hero from "@/components/hero";
import Input from "@/components/input";
// import Producthunt from "@/components/producthunt";
import { Logo } from "@/types/logo";
import Logos from "@/components/logos";
import { toast } from "sonner";
import { AppContext } from "@/contexts/AppContext";

export default function () {
  const { user } = useContext(AppContext);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogos = async function (page: number) {
    try {
      const uri = "/api/get-logos";
      const params = {
        page: page,
        limit: 50,
      };

      setLoading(true);
      const resp = await fetch(uri, {
        method: "POST",
        body: JSON.stringify(params),
      });
      setLoading(false);

      if (resp.ok) {
        const res = await resp.json();
        console.log("get logos result: ", res);
        if (res.data) {
          setLogos(res.data);
          return;
        }
      }

      toast.error("get logos failed");
    } catch (e) {
      console.log("get logos failed: ", e);
      toast.error("get logos failed");
    }
  };

  useEffect(() => {
    fetchLogos(1);
  }, []);

  return (
    <div className="md:mt-16">
      <div className="max-w-3xl mx-auto">
        <Hero />
        {/* <div className="my-4 md:my-6">
          <Producthunt />
        </div> */}
        <div className="mx-auto my-4 flex max-w-lg justify-center">
          <Input logos={logos} setLogos={setLogos} />
        </div>
      </div>

      <div className="pt-0">
        <Logos logos={logos} loading={loading} />
      </div>
    </div>
  );
}
