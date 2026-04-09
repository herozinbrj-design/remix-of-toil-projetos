import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-6">
      <div className="text-center">
        <h1 className="text-8xl font-display font-bold text-accent mb-4">404</h1>
        <p className="text-xl text-navy-300 mb-8">Página não encontrada</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-semibold px-6 py-3 rounded-lg hover:bg-accent/90 transition-all"
        >
          <Home className="w-4 h-4" />
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
