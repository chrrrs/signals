"use client";

import {
  computed,
  createAsyncSignal,
  createSignal,
  useSignal,
  useSignalSelector,
  type Computed,
  type Signal,
} from "@chrrrs/signals";

import styles from "./page.module.css";

type ReactorState = {
  output: number;
  mode: "Nominal" | "Boost" | "Coast";
  sector: string;
};

type Advisory = {
  title: string;
  body: string;
};

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const reactorSignal = createSignal<ReactorState>({
  output: 48,
  mode: "Nominal",
  sector: "North Quarter",
});
const tempoSignal = createSignal(3);
const accentSignal = createSignal<"ember" | "ice" | "sun">("ember");
const eventCountSignal = createSignal(0);
const systemPulseSignal = computed(() => reactorSignal.get().output * tempoSignal.get());
const pulseLabelSignal = computed(() => {
  const pulse = systemPulseSignal.get();

  if (pulse >= 280) {
    return "Overclocked";
  }

  if (pulse >= 180) {
    return "Prime";
  }

  if (pulse >= 110) {
    return "Stable";
  }

  return "Warming";
});

const advisorySignal = createAsyncSignal(async () => {
  await wait(900);

  const pulse = systemPulseSignal.get();
  const reactorState = reactorSignal.get();

  if (pulse >= 240) {
    return {
      title: "Throttle the relay ring",
      body: `${reactorState.sector} is peaking in ${reactorState.mode.toLowerCase()} mode. Reduce tempo or shift to coast for a softer thermal profile.`,
    };
  }

  return {
    title: "Hold the current cadence",
    body: `${reactorState.sector} is balanced. Use boost only when you need a visible pulse spike for the demo floor.`,
  };
});

const advisoryViewSignal = computed(
  () =>
    advisorySignal.get() ?? {
      title: "No advisory loaded",
      body: "Trigger the async signal to fetch a scenario-specific note.",
    },
);

function ReadoutCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <article className={styles.readoutCard}>
      <p className={styles.readoutLabel}>{title}</p>
      <strong className={styles.readoutValue}>{value}</strong>
      <p className={styles.readoutDetail}>{detail}</p>
    </article>
  );
}

function ThemeFrame({ children }: { children: React.ReactNode }) {
  const accent = useSignal(accentSignal);
  const toneClassName =
    accent === "ember" ? styles.themeEmber : accent === "ice" ? styles.themeIce : styles.themeSun;

  return <main className={`${styles.page} ${toneClassName}`}>{children}</main>;
}

function HeroPanel() {
  const systemPulse = useSignal(systemPulseSignal);
  const pulseLabel = useSignal(pulseLabelSignal);
  const mode = useSignalSelector(reactorSignal, (value) => value.mode);
  const sector = useSignalSelector(reactorSignal, (value) => value.sector);

  return (
    <div className={styles.heroPanel}>
      <div className={styles.heroGauge}>
        <span>system pulse</span>
        <strong>{systemPulse}</strong>
      </div>
      <div className={styles.heroMeta}>
        <p>{pulseLabel}</p>
        <small>
          {mode} mode in {sector}
        </small>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.kicker}>Kairo / Signals demo</p>
        <h1>Reactive state with visible edges.</h1>
        <p className={styles.intro}>
          This page is driven by `@chrrrs/signals`: direct writes, lazy computed values, a
          selector-backed probe, and an async advisory feed. No reducer boilerplate, no hidden data
          layer.
        </p>
      </div>
      <HeroPanel />
    </section>
  );
}

function OutputReadout() {
  const output = useSignalSelector(reactorSignal, (value) => value.output);

  return <ReadoutCard title="Signal" value={`${output} mw`} detail="Base writable signal" />;
}

function ComputedReadout() {
  const systemPulse = useSignal(systemPulseSignal);

  return (
    <ReadoutCard title="Computed" value={`${systemPulse} flux`} detail="Lazy cached derivation" />
  );
}

function EventsReadout() {
  const eventCount = useSignal(eventCountSignal);

  return <ReadoutCard title="Events" value={String(eventCount)} detail="Counts direct mutations" />;
}

function AccentReadout() {
  const accent = useSignal(accentSignal);

  return <ReadoutCard title="Accent" value={accent} detail="Theme updates without a provider" />;
}

function ReadoutGrid() {
  return (
    <div className={styles.readoutGrid}>
      <OutputReadout />
      <ComputedReadout />
      <EventsReadout />
      <AccentReadout />
    </div>
  );
}

function OutputControl() {
  const output = useSignalSelector(reactorSignal, (value) => value.output);

  return (
    <label className={styles.sliderBlock}>
      <span>Output</span>
      <input
        type="range"
        min="12"
        max="96"
        value={output}
        onChange={(event) => {
          const nextOutput = Number(event.target.value);
          reactorSignal.set({
            ...reactorSignal.get(),
            output: nextOutput,
          });
          eventCountSignal.set(eventCountSignal.get() + 1);
        }}
      />
      <strong>{output} mw</strong>
    </label>
  );
}

function TempoControl() {
  const tempo = useSignal(tempoSignal);

  return (
    <label className={styles.sliderBlock}>
      <span>Tempo</span>
      <input
        type="range"
        min="1"
        max="6"
        value={tempo}
        onChange={(event) => {
          tempoSignal.set(Number(event.target.value));
          eventCountSignal.set(eventCountSignal.get() + 1);
        }}
      />
      <strong>{tempo}x</strong>
    </label>
  );
}

function ModeButtons() {
  const mode = useSignalSelector(reactorSignal, (value) => value.mode);

  return (
    <div className={styles.buttonRow}>
      {(["Nominal", "Boost", "Coast"] as const).map((nextMode) => (
        <button
          key={nextMode}
          type="button"
          className={mode === nextMode ? styles.activeChip : styles.chip}
          onClick={() => {
            reactorSignal.set({
              ...reactorSignal.get(),
              mode: nextMode,
            });
            eventCountSignal.set(eventCountSignal.get() + 1);
          }}
        >
          {nextMode}
        </button>
      ))}
    </div>
  );
}

function SectorButtons() {
  const sector = useSignalSelector(reactorSignal, (value) => value.sector);

  return (
    <div className={styles.buttonRow}>
      {(
        [
          ["North Quarter", "ember"],
          ["Glass Canal", "ice"],
          ["Solar Arcade", "sun"],
        ] as const
      ).map(([nextSector, tone]) => (
        <button
          key={nextSector}
          type="button"
          className={sector === nextSector ? styles.activeChip : styles.chip}
          onClick={() => {
            reactorSignal.set({
              ...reactorSignal.get(),
              sector: nextSector,
            });
            accentSignal.set(tone);
            eventCountSignal.set(eventCountSignal.get() + 1);
          }}
        >
          {nextSector}
        </button>
      ))}
    </div>
  );
}

function ControlPanel() {
  return (
    <section className={styles.controlPanel}>
      <div className={styles.sectionHeading}>
        <p className={styles.kicker}>Writable signals</p>
        <h2>Manipulate the reactor</h2>
      </div>

      <OutputControl />
      <TempoControl />
      <ModeButtons />
      <SectorButtons />
    </section>
  );
}

function SelectorProbe({ reactor }: { reactor: Signal<ReactorState> }) {
  const output = useSignalSelector(reactor, (value) => value.output);

  return (
    <article className={styles.selectorCard}>
      <div>
        <p className={styles.selectorEyebrow}>Selector probe</p>
        <h3>Only watching output</h3>
      </div>
      <div className={styles.selectorStats}>
        <span>{output} mw</span>
        <small>selector locked to output</small>
      </div>
      <p className={styles.selectorHint}>
        Change mode or sector and this panel stays put. Change output and it updates.
      </p>
    </article>
  );
}

function AdvisoryCard({ advisory }: { advisory: Computed<Advisory> }) {
  const currentAdvisory = useSignal(advisory);

  return (
    <article className={styles.asyncCard}>
      <div className={styles.sectionHeading}>
        <p className={styles.kicker}>Async signal</p>
        <h2>Scenario advisory</h2>
      </div>
      <strong>{currentAdvisory.title}</strong>
      <p>{currentAdvisory.body}</p>
      <button
        type="button"
        className={styles.primaryButton}
        onClick={() => {
          void advisorySignal.load();
        }}
      >
        Load advisory
      </button>
    </article>
  );
}

function Dashboard() {
  return (
    <section className={styles.dashboard}>
      <ReadoutGrid />

      <div className={styles.controlShell}>
        <ControlPanel />

        <div className={styles.sideColumn}>
          <SelectorProbe reactor={reactorSignal} />
          <AdvisoryCard advisory={advisoryViewSignal} />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <ThemeFrame>
      <HeroSection />
      <Dashboard />
    </ThemeFrame>
  );
}
