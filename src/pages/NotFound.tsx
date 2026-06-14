import { Link } from "react-router-dom";
import { Film } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#02020a] px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-6">
          <Film className="w-10 h-10 text-purple-400" />
        </div>
        <h1 className="text-6xl font-black text-white mb-2">404</h1>
        <p className="text-white/50 mb-8">
          This scene didn't make the final cut — the page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-block px-8 h-12 leading-[3rem] rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest text-sm transition-all"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
