import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Sliders, Users, Database, Shield, Save, Image as ImageIcon } from "lucide-react";
import { Card, PageHeader, Button } from "@/components/common";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

const sections = [
  { id: "company", label: "Informations de l'entreprise", icon: Building2 },
  { id: "prefs", label: "Préférences", icon: Sliders },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "backup", label: "Sauvegarde", icon: Database },
  { id: "security", label: "Sécurité", icon: Shield },
];

function SettingsPage() {
  const [active, setActive] = useState("company");
  const inputCls = "w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <div className="space-y-6">
      <PageHeader title="Paramètres" subtitle="Configurez votre application" />
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        <Card className="p-2 h-fit">
          <nav className="space-y-1">
            {sections.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setActive(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition ${active === s.id ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted"}`}>
                  <Icon className="w-4 h-4" />{s.label}
                </button>
              );
            })}
          </nav>
        </Card>

        <Card className="p-6">
          {active === "company" && (
            <>
              <h3 className="font-semibold mb-1">Informations de l'entreprise</h3>
              <p className="text-sm text-muted-foreground mb-6">Ces informations apparaîtront sur vos factures.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nom de l'entreprise"><input className={inputCls} defaultValue="StockFact Pro SARL" /></Field>
                <div className="sm:col-span-1">
                  <span className="text-xs font-medium mb-1.5 block">Logo</span>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center"><ImageIcon className="w-5 h-5 text-muted-foreground" /></div>
                    <Button variant="outline" size="sm">Changer</Button>
                  </div>
                </div>
                <Field label="Téléphone"><input className={inputCls} defaultValue="77 123 45 67" /></Field>
                <Field label="Email"><input className={inputCls} defaultValue="contact@stockfact.sn" /></Field>
                <div className="sm:col-span-2"><Field label="Adresse"><input className={inputCls} defaultValue="Dakar, Sénégal" /></Field></div>
                <Field label="NINEA"><input className={inputCls} defaultValue="123456789" /></Field>
                <Field label="RCCM"><input className={inputCls} defaultValue="SN-DKR-2020-B-12345" /></Field>
                <div className="sm:col-span-2"><Field label="Texte bas de facture"><textarea rows={3} className={inputCls} defaultValue="Merci pour votre confiance ! Le meilleur partenaire de votre réussite." /></Field></div>
              </div>
              <div className="flex justify-end mt-6"><Button><Save className="w-4 h-4" />Enregistrer les modifications</Button></div>
            </>
          )}
          {active !== "company" && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Section "{sections.find(s => s.id === active)?.label}" — bientôt disponible.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-medium mb-1.5 block">{label}</span>{children}</label>;
}
