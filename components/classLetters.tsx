"use client";
import { Letter, Media, Class as PayloadClass } from "@/payload-types";
import Link from "next/link";
import { FileText, Download } from "lucide-react";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ClassLetters({ letters }: { letters: Letter[] }) {
  if (letters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No letters for this class yet.</p>
        <Link
          href="/letters"
          className="inline-flex items-center gap-2 text-sapperton-green hover:underline font-semibold"
        >
          <FileText className="w-4 h-4" />
          View all letters
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {letters.map((letter) => {
          const document = letter.document as Media;
          return (
            <div
              key={letter.id}
              className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex-shrink-0 text-sapperton-green">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">
                  {letter.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {formatDate(letter.date)}
                </p>
              </div>
              {document?.url && (
                <Link
                  href={document.url}
                  target="_blank"
                  className="flex-shrink-0 inline-flex items-center gap-1 text-sapperton-green hover:underline text-sm font-semibold"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center pt-4 border-t border-gray-200">
        <Link
          href="/letters"
          className="inline-flex items-center gap-2 text-sapperton-green hover:underline font-semibold"
        >
          <FileText className="w-5 h-5" />
          View all letters
        </Link>
      </div>
    </div>
  );
}
