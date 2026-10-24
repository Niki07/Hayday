"use client";

import { useId, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageContainer from "@/components/ui/PageContainer";
import { useCheck } from "@/lib/check-state";
import { useT, type TKey } from "@/lib/i18n";
import { checkPayStub } from "@/lib/rules";
import type { PayStub, WorkerAnswers } from "@/lib/types";

type Choice = "yes" | "some" | "no";
type PayType = PayStub["payType"];

// Central Valley first (value stored in WorkerAnswers.county, label from i18n), then everything else.
const VALLEY_COUNTIES: { value: string; label: TKey }[] = [
  { value: "Fresno", label: "county.fresno" },
  { value: "Kern", label: "county.kern" },
  { value: "Tulare", label: "county.tulare" },
  { value: "Kings", label: "county.kings" },
  { value: "Madera", label: "county.madera" },
  { value: "Merced", label: "county.merced" },
  { value: "Stanislaus", label: "county.stanislaus" },
  { value: "San Joaquin", label: "county.sanjoaquin" },
];
const OTHER_COUNTY = "Other";

const PAY_TYPES: { value: PayType; label: TKey }[] = [
  { value: "hourly", label: "review.payType.hourly" },
  { value: "piece", label: "review.payType.piece" },
  { value: "mixed", label: "review.payType.mixed" },
  { value: "unknown", label: "review.payType.unknown" },
];

const MAX_DAYS = 7;
const DEFAULT_DAYS = 5;
const DEFAULT_HOURS = "8";

const inputClass =
  "mt-1 block min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900 focus:border-accent";

const str = (n: number | undefined) => (n === undefined ? "" : String(n));

function num(s: string): number | undefined {
  const cleaned = s.replace(/[$,\s]/g, "");
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      {children}
      {help && <span className="mt-1 block text-xs text-gray-500">{help}</span>}
    </label>
  );
}

function NumberInput(props: {
  value: string;
  onChange: (v: string) => void;
  step?: string;
  "aria-label"?: string;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min="0"
      step={props.step ?? "any"}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      aria-label={props["aria-label"]}
      className={inputClass}
    />
  );
}

// Big tappable radio buttons in a row.
function Segmented<V extends string>(props: {
  legend: string;
  options: { value: V; label: string }[];
  value: V | undefined;
  onChange: (v: V) => void;
  error?: string;
}) {
  const name = useId();
  return (
    <fieldset>
      <legend className="text-base font-semibold text-gray-900">{props.legend}</legend>
      <div className="mt-2 flex gap-2">
        {props.options.map((o) => (
          <label
            key={o.value}
            className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border-2 border-gray-300 bg-white px-2 text-center text-base font-semibold text-gray-800 has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={props.value === o.value}
              onChange={() => props.onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
      {props.error && <p className="mt-1 text-sm font-medium text-red-700">{props.error}</p>}
    </fieldset>
  );
}

function ReviewForm({ stub, answers, imagePreview }: { stub: PayStub; answers?: WorkerAnswers; imagePreview?: string }) {
  const t = useT();
  const router = useRouter();
  const { update } = useCheck();

  // Fields that only apply to one pay type stay visible if the extractor filled them in.
  const hadHourly = [stub.hourlyRate, stub.overtimeHours, stub.overtimeRate].some((v) => v !== undefined);
  const hadPiece = [stub.pieceUnits, stub.pieceRate].some((v) => v !== undefined);

  const [employer, setEmployer] = useState(stub.employerName ?? "");
  const [periodStart, setPeriodStart] = useState(stub.periodStart ?? "");
  const [periodEnd, setPeriodEnd] = useState(stub.periodEnd ?? "");
  const [payType, setPayType] = useState<PayType>(stub.payType);
  const [hours, setHours] = useState(str(stub.hoursWorked));
  const [hourlyRate, setHourlyRate] = useState(str(stub.hourlyRate));
  const [overtimeHours, setOvertimeHours] = useState(str(stub.overtimeHours));
  const [overtimeRate, setOvertimeRate] = useState(str(stub.overtimeRate));
  const [pieceUnits, setPieceUnits] = useState(str(stub.pieceUnits));
  const [pieceRate, setPieceRate] = useState(str(stub.pieceRate));
  const [restBreakPay, setRestBreakPay] = useState(str(stub.restBreakPay));
  const [gross, setGross] = useState(str(stub.grossPay));
  const [net, setNet] = useState(str(stub.netPay));

  const [county, setCounty] = useState(
    answers?.county
      ? VALLEY_COUNTIES.some((c) => c.value === answers.county)
        ? answers.county
        : OTHER_COUNTY
      : "",
  );
  const [days, setDays] = useState(
    Math.min(MAX_DAYS, Math.max(1, answers?.dailyHours.length ?? DEFAULT_DAYS)),
  );
  const [dayHours, setDayHours] = useState<string[]>(() =>
    Array.from({ length: MAX_DAYS }, (_, i) => str(answers?.dailyHours[i]) || DEFAULT_HOURS),
  );
  const [rest, setRest] = useState<Choice | undefined>(answers?.gotRestBreaks);
  const [meal, setMeal] = useState<Choice | undefined>(answers?.gotMealBreaks);
  const [byPiece, setByPiece] = useState<"yes" | "no">(
    (answers ? answers.paidByPiece : stub.payType === "piece" || stub.payType === "mixed") ? "yes" : "no",
  );
  const [submitted, setSubmitted] = useState(false);

  const showHourly = payType !== "piece" || hadHourly;
  const showPiece = payType !== "hourly" || hadPiece;

  const shownHours = dayHours.slice(0, days).map(num);
  const countyError = !county;
  const hoursError = shownHours.some((h) => h === undefined || h <= 0 || h > 24);
  const restError = rest === undefined;
  const mealError = meal === undefined;
  const hasErrors = countyError || hoursError || restError || mealError;

  const lowConfidence = stub.confidence !== undefined && stub.confidence < 0.6;
  const unreadable = stub.payType === "unknown" && stub.confidence === 0;
  const byHand = stub.confidence === undefined && !answers;

  function submit() {
    setSubmitted(true);
    if (hasErrors) return;
    const nextStub: PayStub = {
      ...stub,
      employerName: employer.trim() || undefined,
      periodStart: periodStart || undefined,
      periodEnd: periodEnd || undefined,
      payType,
      hoursWorked: num(hours),
      hourlyRate: showHourly ? num(hourlyRate) : stub.hourlyRate,
      overtimeHours: showHourly ? num(overtimeHours) : stub.overtimeHours,
      overtimeRate: showHourly ? num(overtimeRate) : stub.overtimeRate,
      pieceUnits: showPiece ? num(pieceUnits) : stub.pieceUnits,
      pieceRate: showPiece ? num(pieceRate) : stub.pieceRate,
      restBreakPay: num(restBreakPay),
      grossPay: num(gross),
      netPay: num(net),
    };
    const nextAnswers: WorkerAnswers = {
      county,
      dailyHours: shownHours as number[],
      gotRestBreaks: rest!,
      gotMealBreaks: meal!,
      paidByPiece: byPiece === "yes",
    };
    update({ stub: nextStub, answers: nextAnswers, result: checkPayStub(nextStub, nextAnswers) });
    router.push("/check/result");
  }

  const yesSomeNo = [
    { value: "yes" as const, label: t("review.yes") },
    { value: "some" as const, label: t("review.some") },
    { value: "no" as const, label: t("review.no") },
  ];

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("review.title")}</h1>

      {unreadable ? (
        <div role="alert" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-gray-900">
          <p className="font-semibold">{t("review.unreadable")}</p>
        </div>
      ) : byHand ? (
        <p className="mt-3 text-gray-600">{t("review.byHandIntro")}</p>
      ) : (
        <p className="mt-3 text-gray-600">{t("review.intro")}</p>
      )}
      {lowConfidence && !unreadable && (
        <div role="alert" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-gray-900">
          <p className="font-semibold">{t("review.lowConfidence")}</p>
          <p className="mt-1 text-sm text-gray-700">{t("review.lowConfidenceBody")}</p>
        </div>
      )}

      <Card className="mt-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">{t("review.stubSection")}</h2>
        {imagePreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePreview}
            alt={t("review.photo")}
            className="max-h-32 rounded-lg border border-gray-200"
          />
        )}
        <Field label={t("review.employer")}>
          <input
            type="text"
            value={employer}
            onChange={(e) => setEmployer(e.target.value)}
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("review.periodStart")}>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label={t("review.periodEnd")}>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label={t("review.payType")}>
          <select
            value={payType}
            onChange={(e) => setPayType(e.target.value as PayType)}
            className={inputClass}
          >
            {PAY_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {t(p.label)}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("review.hours")} help={t("review.hoursHelp")}>
            <NumberInput value={hours} onChange={setHours} />
          </Field>
          {showHourly && (
            <Field label={t("review.hourlyRate")}>
              <NumberInput value={hourlyRate} onChange={setHourlyRate} />
            </Field>
          )}
        </div>
        {showHourly && (
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("review.overtimeHours")}>
              <NumberInput value={overtimeHours} onChange={setOvertimeHours} />
            </Field>
            <Field label={t("review.overtimeRate")}>
              <NumberInput value={overtimeRate} onChange={setOvertimeRate} />
            </Field>
          </div>
        )}
        {showPiece && (
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("review.pieceUnits")}>
              <NumberInput value={pieceUnits} onChange={setPieceUnits} />
            </Field>
            <Field label={t("review.pieceRate")}>
              <NumberInput value={pieceRate} onChange={setPieceRate} />
            </Field>
          </div>
        )}
        <Field label={t("review.restBreakPay")} help={t("review.restBreakPayHelp")}>
          <NumberInput value={restBreakPay} onChange={setRestBreakPay} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("review.gross")}>
            <NumberInput value={gross} onChange={setGross} />
          </Field>
          <Field label={t("review.net")}>
            <NumberInput value={net} onChange={setNet} />
          </Field>
        </div>
      </Card>

      <Card className="mt-4 space-y-6">
        <h2 className="text-lg font-bold text-gray-900">{t("review.questionsSection")}</h2>

        <div>
          <Field label={t("review.county")}>
            <select value={county} onChange={(e) => setCounty(e.target.value)} className={inputClass}>
              <option value="" disabled>
                {t("review.countyPlaceholder")}
              </option>
              <optgroup label={t("review.countyValley")}>
                {VALLEY_COUNTIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {t(c.label)}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t("review.countyOtherGroup")}>
                <option value={OTHER_COUNTY}>{t("review.countyOther")}</option>
              </optgroup>
            </select>
          </Field>
          {submitted && countyError && (
            <p className="mt-1 text-sm font-medium text-red-700">{t("review.errorCounty")}</p>
          )}
        </div>

        <Segmented
          legend={t("review.days")}
          options={Array.from({ length: MAX_DAYS }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
          value={String(days)}
          onChange={(v) => setDays(Number(v))}
        />

        <fieldset>
          <legend className="text-base font-semibold text-gray-900">{t("review.hoursEachDay")}</legend>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {dayHours.slice(0, days).map((h, i) => (
              <label key={i} className="block">
                <span className="block text-center text-xs text-gray-600">
                  {t("review.day")} {i + 1}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="24"
                  step="any"
                  value={h}
                  onChange={(e) =>
                    setDayHours((prev) => prev.map((p, j) => (j === i ? e.target.value : p)))
                  }
                  className="mt-1 block min-h-11 w-full rounded-xl border border-gray-300 bg-white px-1 text-center text-base text-gray-900 focus:border-accent"
                />
              </label>
            ))}
          </div>
          {submitted && hoursError && (
            <p className="mt-1 text-sm font-medium text-red-700">{t("review.errorHours")}</p>
          )}
        </fieldset>

        <Segmented
          legend={t("review.rest")}
          options={yesSomeNo}
          value={rest}
          onChange={setRest}
          error={submitted && restError ? t("review.errorAnswer") : undefined}
        />
        <Segmented
          legend={t("review.meal")}
          options={yesSomeNo}
          value={meal}
          onChange={setMeal}
          error={submitted && mealError ? t("review.errorAnswer") : undefined}
        />
        <Segmented
          legend={t("review.piece")}
          options={[
            { value: "yes" as const, label: t("review.yes") },
            { value: "no" as const, label: t("review.no") },
          ]}
          value={byPiece}
          onChange={setByPiece}
        />
      </Card>

      {submitted && hasErrors && (
        <p role="alert" className="mt-4 text-center font-semibold text-red-700">
          {t("review.errorSummary")}
        </p>
      )}
      <Button size="lg" className="mt-4 w-full" onClick={submit}>
        {t("review.submit")}
      </Button>
      <div className="mt-2 flex justify-center">
        <Button variant="ghost" size="md" href="/check">
          {t("review.startOver")}
        </Button>
      </div>
    </PageContainer>
  );
}

export default function ReviewPage() {
  const { ready, stub, answers, imagePreview } = useCheck();
  // Wait for hydration so the form starts from the stored data, not from an empty server render.
  if (!ready) return null;
  return <ReviewForm stub={stub ?? { payType: "unknown" }} answers={answers} imagePreview={imagePreview} />;
}
