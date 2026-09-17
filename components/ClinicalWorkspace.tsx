"use client";

import { useState } from "react";
import { useLang } from "@/lib/translations/context";
import { clinicalI18n } from "@/lib/clinical-i18n";
import ToothIcon from "@/components/ToothIcon";
import DentalChart from "@/components/DentalChart";
import XRayAnalyzer from "@/components/XRayAnalyzer";
import TreatmentPlanBuilder from "@/components/TreatmentPlanBuilder";
import PrescriptionStudio from "@/components/PrescriptionStudio";
import { getProcedure } from "@/lib/dental-catalog";
import { newPlanItem, type PlanItem } from "@/lib/treatment-plan";

type Patient = { id: string; name: string; phone: string };
type Tab = "chart" | "xray" | "plan" | "rx";

export default function ClinicalWorkspace({
  patients,
  initialPatientId,
  clinicName,
  clinicPhone,
  doctorName,
}: {
  patients: Patient[];
  initialPatientId?: string;
  clinicName?: string;
  clinicPhone?: string;
  doctorName?: string;
}) {
  const { lang } = useLang();
  const L = clinicalI18n[lang];

  const initialId = initialPatientId && patients.some((p) => p.id === initialPatientId) ? initialPatientId : patients[0]?.id || "";
  const [patientId, setPatientId] = useState(initialId);
  const [tab, setTab] = useState<Tab>("chart");
  const [pendingPlanItems, setPendingPlanItems] = useState<PlanItem[]>([]);
  const [toast, setToast] = useState("");

  const patient = patients.find((p) => p.id === patientId);

  const TABS: { id: Tab; label: string; icon: "tooth" | "sparkle" | "shield" | "plus" }[] = [
    { id: "chart", label: L.tools.tabChart, icon: "tooth" },
    { id: "xray", label: L.tools.tabXray, icon: "sparkle" },
    { id: "plan", label: L.tools.tabPlan, icon: "shield" },
    { id: "rx", label: L.tools.tabRx, icon: "plus" },
  ];

  function addToPlan(procedureId: string, tooth: string, label: { ar: string; en: string }) {
    const procedure = getProcedure(procedureId);
    if (!procedure) return;
    setPendingPlanItems((prev) => [...prev, newPlanItem(procedure, tooth)]);
    setTab("plan");
    setToast(`${L.xray.addedToPlan}: ${label[lang]}${tooth ? ` · ${tooth}` : ""}`);
    setTimeout(() => setToast(""), 3200);
  }

  if (!patients.length) {
    return <div className="card text-center text-sm text-c-muted">{L.tools.noPatients}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-black uppercase tracking-wider text-c-white">{L.tools.title}</h2>
          <p className="mt-1 text-xs text-c-muted">{L.tools.subtitle}</p>
        </div>
        <label className="text-[11px] text-c-muted">
          <span className="mb-1 block uppercase tracking-wider">{L.tools.patient}</span>
          <select className="form-input !w-auto min-w-[230px] !py-2 text-sm" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            <option value="">{L.tools.selectPatient}</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.phone}
              </option>
            ))}
          </select>
        </label>
      </div>

      {toast && <div className="border border-c-accent/30 bg-c-accent/10 px-4 py-2 text-xs text-c-accent">✓ {toast}</div>}

      <div className="flex flex-wrap gap-1 border-b border-c-border">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-[11px] uppercase tracking-wider transition-colors ${
              tab === item.id ? "border-c-accent text-c-accent" : "border-transparent text-c-muted hover:text-c-light"
            }`}
          >
            <ToothIcon variant={item.icon} className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      {!patientId ? (
        <div className="card text-center text-sm text-c-muted">{L.tools.noPatient}</div>
      ) : (
        <>
          <div className={tab === "chart" ? "" : "hidden"}>
            <DentalChart patientId={patientId} patientName={patient?.name} onAddToPlan={addToPlan} />
          </div>
          <div className={tab === "xray" ? "" : "hidden"}>
            <XRayAnalyzer patientId={patientId} onAddToPlan={addToPlan} />
          </div>
          <div className={tab === "plan" ? "" : "hidden"}>
            <TreatmentPlanBuilder
              patientId={patientId}
              patientName={patient?.name}
              patientPhone={patient?.phone}
              clinicName={clinicName}
              doctorName={doctorName}
              incomingItems={pendingPlanItems}
              onConsumeIncoming={() => setPendingPlanItems([])}
            />
          </div>
          <div className={tab === "rx" ? "" : "hidden"}>
            <PrescriptionStudio
              patientId={patientId}
              patientName={patient?.name}
              patientPhone={patient?.phone}
              clinicName={clinicName}
              clinicPhone={clinicPhone}
              doctorName={doctorName}
            />
          </div>
        </>
      )}
    </div>
  );
}
