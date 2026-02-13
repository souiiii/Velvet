import { Construction } from "lucide-react";

const ComingSoon = () => (
  <div className="coming-soon">
    <div className="coming-soon__inner">
      <img src="/logo3.svg" />
      <div className="coming-soon__badge">
        <Construction style={{ width: 16, height: 16 }} />
        Under Development
      </div>
      <h1 className="coming-soon__title">Coming Soon</h1>
      <p className="coming-soon__desc">
        We're crafting something special. This feature will be available
        shortly.
      </p>
      <a href="/" className="coming-soon__link">
        Back to Vault
      </a>
    </div>
  </div>
);

export default ComingSoon;
