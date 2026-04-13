"use client";
import { Letter, Media, Class } from "@/payload-types";
import { FileText, Download } from "lucide-react";
import Link from "next/link";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function LetterCard({ letter }: { letter: Letter }) {
  const document = letter.document as Media;

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-shrink-0 text-sapperton-green">
        <FileText className="w-8 h-8" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 truncate">{letter.title}</h3>
        <p className="text-sm text-gray-600">{formatDate(letter.date)}</p>
        {letter.classes && letter.classes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {letter.classes.map((classItem) => {
              const classData =
                typeof classItem === "object" ? (classItem as Class) : null;
              return classData ? (
                <span
                  key={classData.id}
                  className="text-xs font-semibold px-2 py-0.5 bg-sapperton-green text-white rounded"
                >
                  {classData.name}
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {document?.url && (
        <Link
          href={document.url}
          target="_blank"
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-sapperton-green text-white rounded-lg hover:bg-sapperton-green/90 transition-colors text-sm font-semibold"
        >
          <Download className="w-4 h-4" />
          Download
        </Link>
      )}
    </div>
  );
}
