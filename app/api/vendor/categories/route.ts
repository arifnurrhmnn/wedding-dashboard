import { NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/api-auth";

const VENDOR_CATEGORIES = [
  { value: "Foto & Video", icon: "📸" },
  { value: "Katering & Konsumsi", icon: "🍽️" },
  { value: "Venue & Gedung", icon: "🏛️" },
  { value: "Dekorasi & Florist", icon: "💐" },
  { value: "Busana & Kebaya", icon: "👗" },
  { value: "MUA (Make Up Artist)", icon: "💄" },
  { value: "Entertainment & Band", icon: "🎵" },
  { value: "Wedding Cake", icon: "🎂" },
  { value: "Undangan & Percetakan", icon: "💌" },
  { value: "Transportasi", icon: "🚗" },
  { value: "Wedding Organizer (WO)", icon: "📋" },
  { value: "Lainnya", icon: "🔆" },
];

export async function GET() {
  const auth = await requireActiveUser();
  if (auth.response) return auth.response;
  return NextResponse.json(VENDOR_CATEGORIES);
}
