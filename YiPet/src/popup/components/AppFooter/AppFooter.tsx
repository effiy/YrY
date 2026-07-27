import './AppFooter.css';

export interface AppFooterProps {
  hintText: string;
  version: string;
}

export function AppFooter(props: AppFooterProps) {
  return (
    <footer className="footer">
      <p className="hint-text">{props.hintText}</p>
      <span className="version-badge">{props.version}</span>
    </footer>
  );
}
