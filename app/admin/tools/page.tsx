import { supabase } from "@/lib/supabase";
import { getSettings } from "@/lib/settings";
import ClinicalWorkspace from "@/components/ClinicalWorkspace";

export const dynamic = "force-dynamic";

export default async function ClinicalToolsPage({
  searchParams,
}: {
  searchParams: { patient?: string };
}) {
  const { data: patients } = await supabase
    .from("patients")
    .select("id, name, phone")
    .order("name")
    .limit(500);

  const settings = await getSettings();

  return (
    <ClinicalWorkspace
      patients={(patients || []) as { id: string; name: string; phone: string }[]}
      initialPatientId={searchParams?.patient}
      clinicName={settings.clinic_name}
      clinicPhone={settings.clinic_phone}
    />
  );
}
