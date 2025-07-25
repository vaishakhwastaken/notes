"use client";

import { Note } from "@/lib/data";
import { useDataContext } from "@/lib/DataContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "@/components/footer";
import _ from "lodash";
import { useRouter } from "next/navigation";
import { MdUpcoming } from "react-icons/md";

export default function Page({
  params,
}: {
  params: Promise<{ sem: string; dept: string }>;
}) {
  const [subjects, setSubjects] = useState<Note[]>();
  const [resolvedParams, setResolvedParams] = useState<{
    sem: string;
    dept: string;
  } | null>(null);
  const { db, vldb } = useDataContext();
  const router = useRouter();

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;

    const fetchSubjects = async () => {
      try {
        const subs1 = db?.query({
            where: {
              Department: resolvedParams.dept.toUpperCase(),
              Semester: resolvedParams.sem,
            },
            distinct: "Subject",
          }) || [];

        const subs2 = vldb?.query({
          where: {
            Department: resolvedParams.dept.toUpperCase(),
            Semester: resolvedParams.sem,
          },
          distinct: "Subject",
        }) || [];

        setSubjects(_.uniq([...subs1, ...subs2]));
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, [resolvedParams, db]);

  if (!resolvedParams) {
    return (
      <div className="text-center mt-10 text-white flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-4"></div>
        Loading...
      </div>
    );
  }

  const semNumber = resolvedParams.sem;
  const deptLower = resolvedParams.dept.toLowerCase();

  if (!["cse", "ece", "it"].includes(deptLower)) {
    return (
      <div className="text-center mt-10 text-white">
        Invalid department: {deptLower}
      </div>
    );
  }

  if (!subjects) {
    return (
      <div className="text-center mt-10 text-white flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-4"></div>
        Loading subjects ...
      </div>
    );
  }
  if (subjects.length === 0) {
    return (<>
      <div className="text-center text-white items-center flex flex-col md:flex-row col-span-full bg-black/60 rounded-xl backdrop-blur p-5 shadow-md border-gray-700 border mt-8 sm:mt-0">
         <MdUpcoming className="text-6xl mb-2 md:smr-3" />
          Notes for this semester are not available yet. <br/>
          We are working on adding it. Please check back later.
      </div>
      <Link href={"#"} onClick={router.back} className="mt-4 bg-black/60 text-white px-4 py-2 rounded-lg hover:bg-black scale-100 hover:scale-105 transition-all shadow duration-300">
        Go Back
      </Link>
      <Footer />
    </>);
  }

  return (
    <div className="text-white flex flex-col justify-center items-center">
      <div className="w-full max-w-4xl mb-6 bg-black/60 rounded-xl p-5 shadow-md border-gray-700 border mt-8 sm:mt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xl font-bold break-words">SELECT SUBJECT</div>
            <div className="text-sm text-gray-300 mt-1 capitalize">
              {deptLower.toUpperCase()}
            </div>
          </div>
          <div className="flex flex-col sm:items-end">
            <div className="text-md font-medium">
              Semester: <span className="font-bold">{semNumber}</span>
            </div>
          </div>
        </div>
        {/* Breadcrumb Nav */}
        <div className="w-full border-t border-gray-700 mt-6 pt-3 text-center text-gray-400 text-sm">
          <nav className="text-sm text-gray-400" aria-label="Breadcrumb">
            <ol className="list-reset flex flex-wrap justify-center">
              <li>
                <Link href="/" className="hover:underline text-gray-300">
                  Home
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li>
                <Link
                  href={`/${deptLower}`}
                  className="hover:underline text-gray-300"
                >
                  {deptLower.toUpperCase()}
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-gray-400 capitalize">
                Semester {semNumber}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-8 w-full max-w-4xl items-stretch">
        {subjects.map((sub, index) => (
          <Link
            key={index}
            href={`/${deptLower}/${semNumber}/${sub.Subject
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
            className="group relative flex flex-col items-center justify-center bg-black/60 border border-white/20 rounded-xl shadow-md px-4 py-3 sm:px-6 sm:py-4 transition-all duration-300 backdrop-blur-md cursor-pointer hover:scale-105 hover:shadow-2xl overflow-hidden h-full min-h-[72px]"
            style={{ minWidth: "290px", maxWidth: "290px", margin: "0 auto" }}
          >
            <span className="z-10 text-white text-base sm:text-lg font-semibold capitalize text-center break-words">
              {sub.Subject.toLowerCase()}
            </span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-r from-white/10 to-black/10 pointer-events-none" />
          </Link>
        ))}
      </div>
      <Footer />
    </div>
  );
}
