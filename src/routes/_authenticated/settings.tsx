import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Save, CheckCircle, Loader2 } from "lucide-react";
import { Card, PageHeader, Button } from "@/components/common";
import { settingsService } from "@/services/settingsService";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

interface SettingsForm {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  ninea: string;
  rccm: string;
  invoiceFooter: string;
}

function SettingsPage() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState<SettingsForm>({
    companyName: "", phone: "", email: "", address: "", ninea: "", rccm: "", invoiceFooter: "",
  });

  const { data, isLoading } = useQuery({ queryKey: ["settings"], queryFn: () => settingsService.get() });

  useEffect(() => {
    if (data?.data?.data) {
      const s = data.data.data;
      setForm({ companyName: s.companyName || "", phone: s.phone || "", email: s.email || "", address: s.address || "", ninea: s.ninea || "", rccm: s.rccm || "", invoiceFooter: s.invoiceFooter || "" });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: () => settingsService.update(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      setSaved(true);
      setSaveError("");
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err: unknown) => setSaveError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erreur"),
  });

  const inputCls = "w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <div className="space-y-6">
      <PageHeader title="Paramètres" subtitle="Configurez votre application" />

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Informations de l'entreprise</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Ces informations apparaîtront sur vos factures.</p>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            {saveError && <p className="text-sm text-destructive mb-3">{saveError}</p>}
            {saved && (
              <div className="flex items-center gap-2 text-success text-sm mb-3">
                <CheckCircle className="w-4 h-4" /> Paramètres enregistrés avec succès
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nom de l'entreprise"><input className={inputCls} value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} /></Field>
              <Field label="Téléphone"><input className={inputCls} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="Email"><input type="email" className={inputCls} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label="NINEA"><input className={inputCls} value={form.ninea} onChange={e => setForm({ ...form, ninea: e.target.value })} /></Field>
              <div className="sm:col-span-2"><Field label="Adresse"><input className={inputCls} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></Field></div>
              <Field label="RCCM"><input className={inputCls} value={form.rccm} onChange={e => setForm({ ...form, rccm: e.target.value })} /></Field>
              <div className="sm:col-span-2">
                <Field label="Texte bas de facture">
                  <textarea rows={3} className={inputCls} value={form.invoiceFooter} onChange={e => setForm({ ...form, invoiceFooter: e.target.value })} />
                </Field>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {updateMutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-medium mb-1.5 block">{label}</span>{children}</label>;
}
