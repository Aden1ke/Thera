import React, { useState } from "react"; // Don't forget to import React and useState

const tabArray = [
  {
    name: "Journal",
    icon: "📝",
    id: 1,
  },
  {
    name: "Garden",
    icon: "🌸", // Changed icon for variety
    id: 2,
  },
  {
    name: "Ritual",
    icon: "✨", // Changed icon for variety
    id: 3,
  },
];

export const Header = () => {
  const [activeTab, setActiveTab] = useState(tabArray[0].id); // Set initial active tab

  return (
    <header className="flex flex-col gap-y-3 mx-auto max-w-screen-sm my-4 text-center">
      {/* logo */}
      <div className="text-soul-green text-3xl font-extrabold tracking-wider drop-shadow-sm">
        🍁 Ember
      </div>
      <h2 className="text-xl text-gray-700 font-sans">Your soul companion</h2>

      {/* tab navigator */}
      <div className="flex justify-center items-center gap-x-2 max-w-md border border-gray-200 rounded-full bg-white shadow-lg p-2 mx-auto">
        {tabArray.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} // Set active tab on click
            className={`
              flex items-center gap-x-1.5 p-2 rounded-full cursor-pointer transition-all duration-600
              ${
                activeTab === tab.id
                  ? "bg-ember-moss text-white shadow-md"
                  : "hover:bg-gray-100 text-gray-700"
              }
            `}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-sm font-medium">{tab.name}</span>
          </div>
        ))}
      </div>
    </header>
  );
};
