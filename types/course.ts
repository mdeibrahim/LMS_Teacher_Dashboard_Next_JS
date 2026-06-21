export interface Course {
  id: number;
  title: string;
  image: string;
  students: number;
  completion: number;
  status: "active" | "draft";
}