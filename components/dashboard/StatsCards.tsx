const stats = [
  {
    title: "Active Courses",
    value: 4,
  },
  {
    title: "Total Students",
    value: 150,
  },
  {
    title: "Pending Reviews",
    value: 12,
  },
];

export default function StatsCards() {
  return (
    <div className="grid md:grid-cols-3 gap-5 text-xs text-center rounded-2xl">
      {stats.map((item) => (
        <div
          key={item.title}
          className="bg-gray-200 rounded-2xl p-2 shadow-sm hover:bg-gray-300 transition-colors"
        >
          <h3 className="text-3xl font-bold text-blue-600">
            {item.value}
          </h3>

          <p className="text-gray-500 mt-2">
            {item.title}
          </p>
        </div>
      ))}
    </div>
  );
}