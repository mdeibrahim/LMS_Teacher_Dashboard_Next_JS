"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getCategories,
  Category,
} from "@/services/category";

import {
  createSubcategory,
} from "@/services/subcategory";

export default function AddSubcategoryPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [formData, setFormData] =
    useState({
      category: "",
      name: "",
      description: "",
    });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data =
          await getCategories();

        setCategories(data);
      } catch {
        toast.error(
          "Failed to load categories"
        );
      }
    };

    void fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response =
        await createSubcategory({
          name: formData.name,
          description:
            formData.description,
          category:
            Number(formData.category),
        });

      toast.success(
        response.message ||
        "Subcategory created successfully"
      );

      setTimeout(() => {
        router.push(
          "/manage-content/subcategories"
        );
      }, 1500);

    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const err =
          error as {
            response?: {
              data?: Record<
                string,
                string[]
              >;
            };
          };

        const data =
          err.response?.data;
          console.log(data);

        if (
          data?.non_field_errors?.[0]
        ) {
          toast.error(
            data.non_field_errors[0]
          );
          return;
        }

        if (
          data?.category?.[0]
        ) {
          toast.error(
            data.category[0]
          );
          return;
        }
      }

      toast.error(
        "Failed to create subcategory"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Add Sub Category
        </h1>

        <p className="text-gray-500 mt-2">
          Create a new subcategory
          under an existing category.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-8 shadow-sm space-y-6"
      >
        <div>
          <label className="block mb-2 font-medium">
            Category
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
            required
          >
            <option value="">
              Select Category
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Sub Category Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
            placeholder="Humanities"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Description
          </label>

          <textarea
            name="description"
            rows={4}
            value={
              formData.description
            }
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
          >
            {loading
              ? "Saving..."
              : "Save Sub Category"}
          </button>
        </div>
      </form>
    </div>
  );
}
