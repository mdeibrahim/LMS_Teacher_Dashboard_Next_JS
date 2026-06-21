export default function GlowBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -top-24 left-[-6rem] h-72 w-72 rounded-full bg-sky-300/35 blur-3xl" />
      <div className="absolute top-20 right-[-4rem] h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="absolute bottom-[-5rem] left-1/3 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-20" />
    </div>
  );
}
