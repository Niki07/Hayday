import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSample, samples } from "@/lib/fixtures/samples";
import type { PayStub } from "@/lib/types";

// Renders a sample as an on-screen agricultural payroll stub so it can be photographed from the laptop
// during the demo and screenshotted into public/samples/*.png (handoff 06). The layout is an overlay that
// covers the site header and footer, so the photo shows only the paper.

// Fictional employer details the PayStub type has no field for. Nothing here is read by the rules engine.
const extras: Record<string, { street: string; city: string; employerId: string; crew: string; checkNo: string; workerId: string }> = {
  "grape-trays": {
    street: "2180 E. Shaw Avenue",
    city: "Fresno, CA 93710",
    employerId: "XX-XXX4417",
    crew: "Crew 3, Block B",
    checkNo: "40817",
    workerId: "XXXX",
  },
  "almond-sweeping": {
    street: "915 Service Road",
    city: "Modesto, CA 95358",
    employerId: "XX-XXX2086",
    crew: "Crew 1, Sweeper",
    checkNo: "10934",
    workerId: "XXXX",
  },
  "citrus-bins": {
    street: "3302 W. Caldwell Avenue",
    city: "Visalia, CA 93277",
    employerId: "XX-XXX7731",
    crew: "Crew 6, Navel picking",
    checkNo: "22561",
    workerId: "XXXX",
  },
  "correct-stub": {
    street: "7750 Rosedale Highway",
    city: "Bakersfield, CA 93308",
    employerId: "XX-XXX5902",
    crew: "Crew 2, Field A",
    checkNo: "31208",
    workerId: "XXXX",
  },
  "unpaid-hours": {
    street: "1240 Navy Drive",
    city: "Stockton, CA 95206",
    employerId: "XX-XXX3359",
    crew: "Crew 4, Tomato rows",
    checkNo: "18475",
    workerId: "XXXX",
  },
};

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
const num2 = (n: number) => n.toFixed(2);

function usDate(iso?: string): string {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[2]}/${m[3]}/${m[1]}` : "";
}

/** Payday is five days after the period ends. Computed in UTC so the date does not shift with the time zone. */
function payDate(periodEnd?: string): string {
  const m = periodEnd?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + 5));
  return `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}/${d.getUTCFullYear()}`;
}

type Line = { description: string; qty?: string; rate?: string; amount: number };

/** Earnings lines as a payroll system would print them. The main line carries whatever is left of the gross,
 *  so the stub always adds up to its own gross even when hours × rate does not (the unpaid-hours sample). */
function earningsLines(stub: PayStub): Line[] {
  const gross = stub.grossPay ?? 0;
  const lines: Line[] = [];
  const otAmount =
    stub.overtimeHours && stub.overtimeRate ? Math.round(stub.overtimeHours * stub.overtimeRate * 100) / 100 : 0;
  const main = Math.round((gross - otAmount) * 100) / 100;

  if (stub.payType === "piece") {
    const unit = stub.pieceUnitName ?? "piece";
    lines.push({
      description: `Piece rate (${unit})`,
      qty: stub.pieceUnits !== undefined ? String(stub.pieceUnits) : undefined,
      rate: stub.pieceRate !== undefined ? money(stub.pieceRate) : undefined,
      amount: main,
    });
  } else {
    const regularHours =
      stub.hoursWorked !== undefined ? stub.hoursWorked - (stub.overtimeHours ?? 0) : undefined;
    lines.push({
      description: "Regular hours",
      qty: regularHours !== undefined ? num2(regularHours) : undefined,
      rate: stub.hourlyRate !== undefined ? money(stub.hourlyRate) : undefined,
      amount: main,
    });
  }
  if (otAmount) {
    lines.push({
      description: "Overtime hours",
      qty: num2(stub.overtimeHours!),
      rate: money(stub.overtimeRate!),
      amount: otAmount,
    });
  }
  return lines;
}

// Cache Components needs the ids known at build time. Both spellings of each sample are prerendered.
export function generateStaticParams() {
  return [...samples.map((s) => ({ id: s.id })), ...samples.map((_, i) => ({ id: String(i + 1) }))];
}

export async function generateMetadata({ params }: PageProps<"/samples/[id]">): Promise<Metadata> {
  const { id } = await params;
  const sample = getSample(id);
  return { title: sample ? `Sample pay stub: ${sample.stub.employerName}` : "Sample pay stub" };
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">{label}</div>
      <div className="mt-1 text-[17px] leading-snug text-stone-900">{children}</div>
    </div>
  );
}

export default function SampleStubPage({ params }: PageProps<"/samples/[id]">) {
  return (
    <Suspense fallback={<div className="fixed inset-0 z-[100] bg-[#d9d6cd]" />}>
      <SampleStub params={params} />
    </Suspense>
  );
}

async function SampleStub({ params }: { params: PageProps<"/samples/[id]">["params"] }) {
  const { id } = await params;
  const sample = getSample(id);
  if (!sample) notFound();

  const { stub } = sample;
  const x = extras[sample.id];
  const lines = earningsLines(stub);
  const deductions = stub.deductions ?? [];
  const totalDeductions = Math.round(deductions.reduce((sum, d) => sum + d.amount, 0) * 100) / 100;
  const payType =
    stub.payType === "piece" ? "Piece rate" : stub.payType === "hourly" ? "Hourly" : "Mixed";

  return (
    <div className="fixed inset-0 z-[100] overflow-auto bg-[#d9d6cd] px-4 py-10 [font-family:ui-monospace,'SF_Mono',Menlo,Consolas,'Liberation_Mono',monospace]">
      <article className="mx-auto w-full max-w-[1000px] bg-[#fbfaf5] px-12 py-10 text-stone-900 shadow-[0_2px_4px_rgba(0,0,0,0.12),0_14px_36px_rgba(0,0,0,0.18)]">
        {/* Employer and statement header */}
        <header className="flex items-start justify-between gap-8 border-b-2 border-stone-400 pb-6">
          <div>
            <h1 className="text-[28px] font-bold uppercase leading-tight tracking-wide">{stub.employerName}</h1>
            <p className="mt-2 text-[16px] text-stone-700">{x.street}</p>
            <p className="text-[16px] text-stone-700">{x.city}</p>
            <p className="mt-1 text-[13px] text-stone-500">Employer ID {x.employerId}</p>
          </div>
          <div className="text-right">
            <div className="text-[20px] font-bold uppercase tracking-[0.14em]">Earnings Statement</div>
            <div className="mt-3 text-[16px] text-stone-700">
              Check no. <span className="font-bold text-stone-900">{x.checkNo}</span>
            </div>
            <div className="text-[16px] text-stone-700">
              Pay date <span className="font-bold text-stone-900">{payDate(stub.periodEnd)}</span>
            </div>
          </div>
        </header>

        {/* Employee and period */}
        <section className="grid grid-cols-3 gap-6 border-b border-stone-300 py-6">
          <Cell label="Employee">
            <span className="font-bold">{stub.employeeName}</span>
            <br />
            <span className="text-[14px] text-stone-600">Worker ID {x.workerId}</span>
          </Cell>
          <Cell label="Pay period">
            {usDate(stub.periodStart)} to {usDate(stub.periodEnd)}
          </Cell>
          <Cell label="Pay type">
            {payType}
            <br />
            <span className="text-[14px] text-stone-600">{x.crew}</span>
          </Cell>
        </section>

        {/* Earnings */}
        <section className="py-6">
          <table className="w-full border-collapse text-[17px]">
            <thead>
              <tr className="border-b-2 border-stone-400 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">
                <th className="pb-2 font-semibold">Earnings</th>
                <th className="pb-2 text-right font-semibold">{stub.payType === "piece" ? "Units" : "Hours"}</th>
                <th className="pb-2 text-right font-semibold">Rate</th>
                <th className="pb-2 text-right font-semibold">This period</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.description} className="border-b border-stone-300">
                  <td className="py-3">{l.description}</td>
                  <td className="py-3 text-right tabular-nums">{l.qty ?? ""}</td>
                  <td className="py-3 text-right tabular-nums">{l.rate ?? ""}</td>
                  <td className="py-3 text-right tabular-nums">{money(l.amount)}</td>
                </tr>
              ))}
              {stub.hoursWorked !== undefined && (
                <tr className="border-b border-stone-300 text-stone-700">
                  <td className="py-3">Total hours worked</td>
                  <td className="py-3 text-right tabular-nums">{num2(stub.hoursWorked)}</td>
                  <td />
                  <td />
                </tr>
              )}
              <tr>
                <td className="pt-4 align-baseline font-bold uppercase tracking-wide">Gross pay</td>
                <td />
                <td />
                <td className="pt-4 text-right align-baseline text-[19px] font-bold tabular-nums">{money(stub.grossPay ?? 0)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Deductions and net */}
        <section className="grid grid-cols-[1.4fr_1fr] gap-10 border-t border-stone-300 py-6">
          <table className="w-full border-collapse text-[16px]">
            <thead>
              <tr className="border-b-2 border-stone-400 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">
                <th className="pb-2 font-semibold">Deductions</th>
                <th className="pb-2 text-right font-semibold">This period</th>
              </tr>
            </thead>
            <tbody>
              {deductions.map((d) => (
                <tr key={d.label} className="border-b border-stone-300">
                  <td className="py-2">{d.label}</td>
                  <td className="py-2 text-right tabular-nums">{money(d.amount)}</td>
                </tr>
              ))}
              <tr>
                <td className="pt-3 font-bold uppercase tracking-wide">Total deductions</td>
                <td className="pt-3 text-right font-bold tabular-nums">{money(totalDeductions)}</td>
              </tr>
            </tbody>
          </table>

          <div className="self-start border-2 border-stone-400 p-5">
            <div className="flex items-baseline justify-between text-[16px] text-stone-700">
              <span>Gross pay</span>
              <span className="tabular-nums">{money(stub.grossPay ?? 0)}</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between text-[16px] text-stone-700">
              <span>Deductions</span>
              <span className="tabular-nums">-{money(totalDeductions)}</span>
            </div>
            <div className="mt-4 border-t-2 border-stone-400 pt-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">Net pay</div>
              <div className="mt-1 text-[34px] font-bold leading-none tabular-nums">{money(stub.netPay ?? 0)}</div>
            </div>
          </div>
        </section>

        {/* Detach line and check strip */}
        <footer className="mt-2 border-t-2 border-dashed border-stone-400 pt-5">
          <div className="flex items-baseline justify-between text-[14px] text-stone-600">
            <span>
              Paid by check no. {x.checkNo} on {payDate(stub.periodEnd)}
            </span>
            <span className="font-bold text-stone-900">{money(stub.netPay ?? 0)}</span>
          </div>
          <p className="mt-4 text-[11px] text-stone-400">
            Fictional sample for the Hayday demo. Employer and worker are made up.
          </p>
        </footer>
      </article>
    </div>
  );
}
