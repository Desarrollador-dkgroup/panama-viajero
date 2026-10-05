import Link from "next/link";
import { categories } from "@/data/categories";

// Presenta los mismos accesos de categoría en todas las páginas
export function CategoryNavigation({ active }: { active?: string }) {
  return (
    <nav className="categories" aria-label="Categorías">
      {categories.map(({ name, icon: Icon, href }) => (
        <Link key={href} href={href} aria-current={active === href ? "page" : undefined}>
          <span><Icon size={30} strokeWidth={1.8} /></span>
          {name}
        </Link>
      ))}
    </nav>
  );
}
