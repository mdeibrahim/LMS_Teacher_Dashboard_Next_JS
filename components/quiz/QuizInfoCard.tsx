"use client";

import { ClipboardList } from "lucide-react";

export default function QuizInfoCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center gap-3">
        <ClipboardList
          className="text-blue-600"
          size={22}
        />

        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Quiz Information
          </h2>

          <p className="text-sm text-slate-500">
            Configure your quiz before adding questions.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">

        {/* Quiz Title */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Quiz Title
          </label>

          <input
            type="text"
            placeholder="Quiz title"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
          />
        </div>

        {/* Lesson */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Lesson
          </label>

          <select className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600">
            <option>
              Select Lesson
            </option>
          </select>
        </div>

        {/* Duration */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Duration (Minutes)
          </label>

          <input
            type="number"
            placeholder="30"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
          />
        </div>

        {/* Passing Marks */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Passing Marks (%)
          </label>

          <input
            type="number"
            placeholder="50"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
          />
        </div>

        {/* Maximum Attempts */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Maximum Attempts
          </label>

          <input
            type="number"
            placeholder="1"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
          />
        </div>

        {/* Published */}

        <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">

          <div>

            <h4 className="font-medium text-slate-800">
              Publish Quiz
            </h4>

            <p className="text-sm text-slate-500">
              Students can access this quiz.
            </p>

          </div>

          <input
            type="checkbox"
            className="h-5 w-5"
          />

        </div>

      </div>

      {/* Description */}

      <div className="mt-6">

        <label className="mb-2 block text-sm font-medium text-slate-700">
          Description
        </label>

        <textarea
          rows={4}
          placeholder="Quiz description..."
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
        />

      </div>

      {/* Settings */}

      <div className="mt-6 grid gap-4 md:grid-cols-2">

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">

          <input type="checkbox" />

          <div>

            <h4 className="font-medium">
              Shuffle Questions
            </h4>

            <p className="text-sm text-slate-500">
              Randomize question order.
            </p>

          </div>

        </label>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">

          <input type="checkbox" />

          <div>

            <h4 className="font-medium">
              Shuffle Options
            </h4>

            <p className="text-sm text-slate-500">
              Randomize option order.
            </p>

          </div>

        </label>

      </div>

    </div>
  );
}