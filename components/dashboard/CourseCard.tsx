import Image from "next/image";

interface Props {
  title: string;
  image: string;
  students: number;
  completion: number;
}

export default function CourseCard({
  title,
  image,
  students,
}: Props) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
      <div className="relative h-48 w-full text-sm">
        <Image
          src={image}
          alt={title}
          fill
          unoptimized
          className="object-cover text-sm"
        />
      </div>

      <div className="p-5">
        <h3 className="font-bold text-2xl">
          {title}
        </h3>

        <p className="text-sm text-gray-500 mt-2">
          {students} Students
        </p>

      </div>
    </div>
  );
}
