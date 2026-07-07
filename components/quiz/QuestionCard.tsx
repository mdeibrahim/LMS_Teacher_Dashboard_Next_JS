// "use client";

// import { Copy, Trash2 } from "lucide-react";
// import { QuizQuestion } from "./QuestionList";

// interface Props {
//   index: number;
//   question: QuizQuestion;

//   onChange: (question: QuizQuestion) => void;
//   onDelete: () => void;
//   onDuplicate: () => void;
// }

// export default function QuestionCard({
//   index,
//   question,
//   onChange,
//   onDelete,
//   onDuplicate,
// }: Props) {
//   const updateOption = (
//     optionIndex: number,
//     value: string
//   ) => {
//     const options = [...question.options];

//     options[optionIndex] = {
//       ...options[optionIndex],
//       text: value,
//     };

//     onChange({
//       ...question,
//       options,
//     });
//   };

//   return (
//     <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

//       {/* Header */}

//       <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

//         <h3 className="text-lg font-semibold text-slate-800">
//           Question {index + 1}
//         </h3>

//         <div className="flex gap-2">

//           <button
//             type="button"
//             onClick={onDuplicate}
//             className="rounded-xl border border-slate-300 p-2 hover:bg-slate-100"
//           >
//             <Copy size={16} />
//           </button>

//           <button
//             type="button"
//             onClick={onDelete}
//             className="rounded-xl border border-red-300 p-2 text-red-600 hover:bg-red-50"
//           >
//             <Trash2 size={16} />
//           </button>

//         </div>

//       </div>

//       <div className="space-y-6 p-6">

//         {/* Question */}

//         <div>

//           <label className="mb-2 block text-sm font-medium">
//             Question
//           </label>

//           <textarea
//             rows={3}
//             value={question.question}
//             onChange={(e) =>
//               onChange({
//                 ...question,
//                 question: e.target.value,
//               })
//             }
//             className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
//             placeholder="Enter question..."
//           />

//         </div>

//         {/* Options */}

//         <div className="space-y-3">

//           <label className="block text-sm font-medium">
//             Options
//           </label>

//           {question.options.map((option, optionIndex) => (

//             <div
//               key={option.id}
//               className="flex items-center gap-3"
//             >

//               <input
//                 type="radio"
//                 checked={
//                   question.correctAnswer ===
//                   optionIndex
//                 }
//                 onChange={() =>
//                   onChange({
//                     ...question,
//                     correctAnswer:
//                       optionIndex,
//                   })
//                 }
//               />

//               <input
//                 type="text"
//                 value={option.text}
//                 onChange={(e) =>
//                   updateOption(
//                     optionIndex,
//                     e.target.value
//                   )
//                 }
//                 className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
//                 placeholder={`Option ${
//                   optionIndex + 1
//                 }`}
//               />

//             </div>

//           ))}

//         </div>

//         {/* Bottom */}

//         <div className="grid gap-6 md:grid-cols-2">

//           {/* Marks */}

//           <div>

//             <label className="mb-2 block text-sm font-medium">
//               Marks
//             </label>

//             <input
//               type="number"
//               min={1}
//               value={question.marks}
//               onChange={(e) =>
//                 onChange({
//                   ...question,
//                   marks: Number(
//                     e.target.value
//                   ),
//                 })
//               }
//               className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
//             />

//           </div>

//           {/* Explanation */}

//           <div>

//             <label className="mb-2 block text-sm font-medium">
//               Explanation
//             </label>

//             <textarea
//               rows={2}
//               value={question.explanation}
//               onChange={(e) =>
//                 onChange({
//                   ...question,
//                   explanation:
//                     e.target.value,
//                 })
//               }
//               className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
//               placeholder="Optional explanation..."
//             />

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// }