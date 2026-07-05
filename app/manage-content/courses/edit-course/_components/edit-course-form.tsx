"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Category } from "@/services/category";
import { getCategories } from "@/services/category";
import { getCourse } from "@/services/courses";
import { updateCourse } from "@/services/courses";

type CourseFormData = {
  category: string;
  subcategory: string;
  name: string;
  price: string;
  description: string;
  is_published: string;
};

type EditCourseFormProps = {
  courseId: number | null;
};

export default function EditCourseForm({
  courseId,
}: EditCourseFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<CourseFormData>({
    category: "",
    subcategory: "",
    name: "",
    price: "",
    description: "",
    is_published: "false",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [existingCover, setExistingCover] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories", error);
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    void fetchCategories();
  }, []);

  useEffect(() => {
    if (!courseId) {
      setLoadingCourse(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        setLoadingCourse(true);
        const course = await getCourse(courseId);

        // Resolve actual IDs for category and subcategory.
        // The API may return either IDs or names. We attempt to match both.
        // Resolve IDs, handling both object and primitive representations.
        let resolvedCategoryId = "";
        let resolvedSubcategoryId = "";
        // Category may be an object {id, name} or a primitive (id or name).
        if (course.category) {
          if (typeof course.category === "object") {
            // @ts-ignore – we know the shape contains id
            resolvedCategoryId = String((course.category as any).id);
          } else {
            const matchedCategory = categories.find(
              (c) => String(c.id) === String(course.category)
            );
            if (matchedCategory) {
              resolvedCategoryId = String(matchedCategory.id);
            }
          }
        }
        // Subcategory may be an object or primitive.
        if (course.subcategory) {
          if (typeof course.subcategory === "object") {
            // @ts-ignore
            resolvedSubcategoryId = String((course.subcategory as any).id);
          } else if (resolvedCategoryId) {
            const parentCategory = categories.find((c) => String(c.id) === resolvedCategoryId);
            if (parentCategory) {
              const matchedSub = parentCategory.subcategories.find(
                (sc) => String(sc.id) === String(course.subcategory) 
              );
              if (matchedSub) {
                resolvedSubcategoryId = String(matchedSub.id);
              }
            }
          }
        }

        setFormData({
          category: resolvedCategoryId,
          subcategory: resolvedSubcategoryId,
          name: course.name,
          price: String(course.price),
          description: course.description,
          is_published: String(course.is_published),
        });
        setExistingCover(course.cover_image);
      } catch (error) {
        console.error("Failed to load course", error);
        toast.error("Failed to load course");
      } finally {
        setLoadingCourse(false);
      }
    };

    void fetchCourse();
  }, [courseId, categories]);

  const selectedCategory = categories.find(
    (category) => String(category.id) === formData.category
  );

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const nextState = {
        ...prev,
        [name]: value,
      };

      if (name === "category") {
        nextState.subcategory = "";
      }

      return nextState;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!courseId) {
      toast.error("Missing course ID");
      return;
    }

    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("price", formData.price);
      payload.append("description", formData.description);
      payload.append("is_published", formData.is_published);

      if (formData.category) {
        payload.append("category", formData.category);
      }

      if (formData.subcategory) {
        payload.append("subcategory", formData.subcategory);
      }

      if (coverImage) {
        payload.append("cover_image", coverImage);
      }

      const response = await updateCourse(courseId, payload);

      toast.success(response.message || "Course updated successfully", {
        duration: 3000,
      });

      setTimeout(() => {
        router.push("/manage-content/courses");
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update course");
    } finally {
      setSubmitting(false);
    }
  };

  if (!courseId) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-red-600">Missing course ID.</p>
        </div>
      </div>
    );
  }

  if (loadingCategories || loadingCourse) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex h-96 items-center justify-center">
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Edit Course
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Update course details and settings.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl bg-white p-6 shadow-sm"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Sub Category
            </label>

            <select
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              disabled={!selectedCategory}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              required
            >
              <option value="">Select Sub Category</option>

              {selectedCategory?.subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Course Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter course name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Price
            </label>

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              name="is_published"
              value={formData.is_published}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="false">Draft</option>
              <option value="true">Published</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Course Cover
          </label>

          {existingCover && !coverImage && (
            <img
              src={existingCover}
              alt="Existing cover"
              className="mb-2 h-32 w-32 rounded-lg object-cover"
            />
          )}

          {coverImage && (
            <img
              src={URL.createObjectURL(coverImage)}
              alt="Selected cover"
              className="mb-2 h-32 w-32 rounded-lg object-cover"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setCoverImage(file);
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Course Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter course description"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            required
          />
        </div>

        <div className="flex justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={() => router.push("/manage-content/courses")}
            className="rounded-xl border border-slate-300 px-6 py-3 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Saving..." : "Save Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
