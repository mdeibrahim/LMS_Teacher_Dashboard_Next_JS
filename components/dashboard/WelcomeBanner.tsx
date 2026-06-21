export default function WelcomeBanner() {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-blue-100 to-cyan-100 p-10">
      <span className="inline-block text-xs bg-white px-3 py-1 rounded-full text-blue-600 ">
        TEACHING COMMAND CENTER
      </span>

      <h1 className="text-3xl font-bold mt-5">
        Welcome back,
        <span className="text-blue-600">
          {" "}Sarah Jenkins
        </span>
      </h1>

      <p className="text-gray-600 mt-5 text-xs max-w-2xl">
        Your dashboard is ready. You have 12 assignments
        pending review and your students average
        completion rate is up by 8% this week.
      </p>
    </div>
  );
}