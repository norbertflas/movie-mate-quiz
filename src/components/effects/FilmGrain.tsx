
export const FilmGrain = () => (
  <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50 overflow-hidden">
    <div
      className="absolute inset-[-200%] animate-grain"
      style={{
        backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
      }}
    />
  </div>
);
