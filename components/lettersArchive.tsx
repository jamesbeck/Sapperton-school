"use client";
import { useState, useMemo } from "react";
import { Letter, Class as PayloadClass } from "@/payload-types";
import LetterCard from "@/components/letterCard";
import { Search, Filter, ArrowUpDown } from "lucide-react";

export default function LettersArchive({
  letters,
  classes,
}: {
  letters: Letter[];
  classes: PayloadClass[];
}) {
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const filtered = useMemo(() => {
    let result = letters;

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter((letter) =>
        letter.title.toLowerCase().includes(query),
      );
    }

    if (selectedClass !== null) {
      result = result.filter((letter) =>
        letter.classes?.some((c) => {
          const classData = typeof c === "object" ? c : null;
          return classData?.id === selectedClass;
        }),
      );
    }

    result = [...result].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortNewestFirst ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [letters, search, selectedClass, sortNewestFirst]);

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapperton-green focus:border-sapperton-green outline-none"
          />
        </div>

        {/* Class filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={selectedClass ?? ""}
            onChange={(e) =>
              setSelectedClass(e.target.value ? Number(e.target.value) : null)
            }
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapperton-green focus:border-sapperton-green outline-none appearance-none bg-white"
          >
            <option value="">All classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort toggle */}
        <button
          onClick={() => setSortNewestFirst((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <ArrowUpDown className="w-4 h-4" />
          {sortNewestFirst ? "Newest first" : "Oldest first"}
        </button>
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((letter) => (
            <LetterCard key={letter.id} letter={letter} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 py-8">
          No letters found matching your search.
        </p>
      )}
    </div>
  );
}
