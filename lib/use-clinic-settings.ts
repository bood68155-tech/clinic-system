"use client";

import { useState, useEffect } from "react";
import type { ClinicSettings } from "./settings";

const defaults: ClinicSettings = {
  clinic_name: "",
  clinic_phone: "",
  clinic_address: "",
  clinic_logo: "",
};

export function useClinicSettings(): ClinicSettings {
  const [settings, setSettings] = useState<ClinicSettings>(defaults);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  return settings;
}
