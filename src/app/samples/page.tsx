import Link from "next/link";
import type { Metadata } from "next";
import PageContainer from "@/components/ui/PageContainer";
import Card from "@/components/ui/Card";
import { samples } from "@/lib/fixtures/samples";

export const metadata: Metadata = { title: "Sample pay stubs | Hayday" };

// Both languages are always shown here: this page is for the team and for the demo, not for workers.
export default function SamplesIndexPage() {
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold">Sample pay stubs</h1>
      <p className="mt-1 text-gray-600">Talones de pago de ejemplo</p>
      <p className="mt-4 text-sm text-gray-600">
        Made-up pay stubs for the demo. Open one full screen and photograph it with a phone.
        <br />
        Talones inventados para la demostración. Ábrelo en pantalla completa y tómale una foto.
      </p>
      <ul className="mt-6 space-y-3">
        {samples.map((s, i) => (
          <li key={s.id}>
            <Link href={`/samples/${i + 1}`} className="block">
              <Card className="transition hover:border-accent">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">
                      {i + 1}. {s.label.en}
                    </div>
                    <div className="text-sm text-gray-600">{s.label.es}</div>
                    <div className="mt-1 text-xs text-gray-500">{s.stub.employerName}</div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-accent">View / Ver</span>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
