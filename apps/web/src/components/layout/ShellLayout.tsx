import type { PropsWithChildren } from "react";

type ShellLayoutProps = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

export function ShellLayout(props: ShellLayoutProps) {
  return (
    <main className="shell">
      <header className="hero panel">
        <p className="eyebrow">Finance Simulator Rebuild</p>
        <h1>{props.title}</h1>
        <p>{props.subtitle}</p>
      </header>
      {props.children}
    </main>
  );
}
