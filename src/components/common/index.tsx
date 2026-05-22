import React, { ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-card rounded-2xl border border-border shadow-sm ${className}`}>{children}</div>
  );
}

type BadgeTone = "success" | "warning" | "destructive" | "default" | "info";
export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: BadgeTone }) {
  const map: Record<BadgeTone, string> = {
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    destructive: "bg-destructive-soft text-destructive",
    default: "bg-muted text-muted-foreground",
    info: "bg-primary-soft text-primary",
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${map[tone]}`}>{children}</span>;
}

export function Button({
  children, variant = "primary", size = "md", className = "", ...rest
}: { children: ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger" | "outline"; size?: "sm" | "md" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-accent text-accent-foreground hover:opacity-90",
    secondary: "bg-primary text-primary-foreground hover:opacity-90",
    ghost: "text-foreground hover:bg-muted",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90",
    outline: "border border-border bg-card text-foreground hover:bg-muted",
  };
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>{children}</button>;
}

export function SearchInput({ placeholder = "Rechercher...", value, onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
      <input
        type="text" placeholder={placeholder} value={value || ""} onChange={(e) => onChange?.(e.target.value)}
        className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0l-2 7H6l-2-7m16 0H4" /></svg>
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-medium text-foreground mb-1.5 block">{label}</span>{children}</label>;
}

export function Modal({ open, onClose, title, children, footer, size = "md" }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; size?: "md" | "lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-card w-full ${size === "lg" ? "sm:max-w-2xl" : "sm:max-w-md"} rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="p-5 border-t border-border flex flex-wrap gap-2 justify-end">{footer}</div>}
      </div>
    </div>
  );
}
