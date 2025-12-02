import Banner from "@/components/banner";
import Container from "@/components/container";
import Breadcrumbs from "@/components/breadcrumbs";
import H1 from "@/components/ui/h1";
import H2 from "@/components/ui/h2";
import ClassCard from "@/components/classCard";
import payload from "@/payload";
import { notFound } from "next/navigation";
import { Calendar, Clock, Tag } from "lucide-react";
import { Media, Class } from "@/payload-types";

export const revalidate = 30;

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let event;
  try {
    event = await payload.findByID({
      collection: "events",
      id: id,
      depth: 2,
    });
  } catch (error) {
    notFound();
  }

  if (!event) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case "term-date":
        return "Term Date";
      case "event":
        return "Event";
      case "open-day":
        return "Open Day";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case "term-date":
        return "bg-blue-100 text-blue-800";
      case "event":
        return "bg-green-100 text-green-800";
      case "open-day":
        return "bg-purple-100 text-purple-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeDisplay = () => {
    const parts = [];

    if (event.startTime) {
      parts.push(event.startTime);
    }

    if (event.endTime) {
      parts.push(event.endTime);
    }

    if (parts.length === 2) {
      return `${parts[0]} - ${parts[1]}`;
    } else if (parts.length === 1) {
      return parts[0];
    }

    return null;
  };

  const getDateDisplay = () => {
    if (!event.endDate || event.endDate === event.date) {
      return formatDate(event.date);
    }
    return `${formatShortDate(event.date)} - ${formatDate(event.endDate)}`;
  };

  const timeDisplay = getTimeDisplay();

  const renderDescription = () => {
    if (!event.description?.root?.children) return null;

    return event.description.root.children.map((child, index) => {
      if (child.type === "paragraph" && "children" in child) {
        const children = child.children as Array<{
          type: string;
          text?: string;
          [key: string]: unknown;
        }>;
        const text = children
          .filter((node) => node.type === "text" && node.text)
          .map((node) => node.text)
          .join("");

        if (text) {
          return (
            <p key={index} className="mb-4 text-gray-700">
              {text}
            </p>
          );
        }
      }
      return null;
    });
  };

  return (
    <div>
      <Banner url={"/defaultBanner.jpg"} focalX={50} focalY={40} />
      <Breadcrumbs
        crumbs={[
          { label: "Events", url: "/events" },
          { label: event.name, url: `/events/${event.id}` },
        ]}
      />

      <Container>
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col gap-4">
            <H1>{event.name}</H1>

            <div className="flex flex-wrap items-center justify-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{getDateDisplay()}</span>
              </div>
              {timeDisplay && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">{timeDisplay}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded ${getCategoryColor(
                    event.type
                  )}`}
                >
                  {getCategoryLabel(event.type)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <div className="prose prose-lg max-w-none">
              {renderDescription()}
            </div>
          </div>
        </div>
      </Container>

      {event.classes && event.classes.length > 0 && (
        <Container colour="green">
          <div className="flex flex-col gap-8">
            <H2>Related Classes</H2>
            <div className="flex gap-8 justify-center flex-wrap">
              {event.classes.map((classItem) => {
                const classData =
                  typeof classItem === "object" ? (classItem as Class) : null;
                return classData ? (
                  <ClassCard schoolClass={classData} key={classData.id} />
                ) : null;
              })}
            </div>
          </div>
        </Container>
      )}
    </div>
  );
}
