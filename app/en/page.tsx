import type { Metadata } from "next";
import { HomePage, homeMetadata } from "@/app/_pages/home-page";

export const metadata: Metadata = homeMetadata("en");

export default async function Page() {
  return <HomePage locale="en" />;
}
