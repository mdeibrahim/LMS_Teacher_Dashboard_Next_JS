import CourseCard from "./CourseCard";

const courses = [
  {
    title: "Advanced Web Design",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    students: 48,
    completion: 78,
  },
  {
    title: "Data Visualization",
    image:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c",
    students: 62,
    completion: 42,
  },
  {
    title: "Introduction to UI/UX",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    students: 0,
    completion: 0,
  },
];

export default function CourseGrid() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">
        My Courses
      </h2>

      <div className="grid lg:grid-cols-4 gap-8">
        {courses.map((course) => (
          <CourseCard
            key={course.title}
            {...course}
          />
        ))}
      </div>
    </section>
  );
}