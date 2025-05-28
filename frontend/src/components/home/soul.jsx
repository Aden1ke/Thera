import { useState } from "react";

export const SoulTracker = () => {
  const [percent, setPercent] = useState(65);

  const progressBarColor =
    percent > 75
      ? "bg-emerald-500"
      : percent > 40
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="bg-white shadow-xl rounded-2xl p-4 w-full max-w-screen-lg mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold text-serene-sage">
          Soul Wellness
        </h1>
        <div className="text-2xl font-bold text-gray-800">{percent}%</div>
      </div>
      <div className="bg-gray-200 h-3 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${progressBarColor}`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};
