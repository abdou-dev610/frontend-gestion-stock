export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

export const formatDate = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
};
