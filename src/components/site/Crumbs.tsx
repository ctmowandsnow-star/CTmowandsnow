import { Verweis as Link } from '@/components/ui/Verweis';
import { ChevronRight } from 'lucide-react';

/**
 * Sichtbare Brotkrumen.
 *
 * Das BreadcrumbList-Schema hatten wir schon, die sichtbare Spur nicht -
 * hvnh-ai.com hat beides. Beides gehoert zusammen: das Schema erzeugt die
 * Pfadanzeige im Suchergebnis, die sichtbare Spur ist der Weg zurueck fuer
 * jemanden, der ueber eine Leistung-Ort-Seite einsteigt und sonst in einer
 * Sackgasse landet.
 */
export function Crumbs({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-bark-400">
        {trail.map((c, i) => {
          const letzte = i === trail.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} className="text-bark-600" />}
              {letzte ? (
                <span aria-current="page" className="text-bark-300">{c.name}</span>
              ) : (
                <Link href={c.path} className="transition-colors hover:text-white">{c.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
