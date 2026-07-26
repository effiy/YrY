export function SettingsCard(props: { children?: unknown }) {
  return (
    <section className="card">
      <h2 className="card-title">Pet Settings</h2>
      <div className="setting-list">{props.children}</div>
    </section>
  );
}
