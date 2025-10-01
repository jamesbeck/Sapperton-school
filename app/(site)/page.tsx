import Hero from "@/components/hero";
import HeadMessage from "@/components/headMessage";
import payload from "@/payload";

export default async function Home({}) {
  //get headteacher global

  const headteacherWelcome = await payload.findGlobal({
    slug: "headteacher-welcome",
    depth: 2,
  });

  const heroWords = await payload.findGlobal({
    slug: "hero-words",
  });

  return (
    <div>
      <Hero words={heroWords} />
      <HeadMessage headteacherWelcome={headteacherWelcome} />
    </div>
  );
}
