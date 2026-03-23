import { NextResponse } from "next/server";

export const VENDOR_CATEGORIES = [
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
  return NextResponse.json(VENDOR_CATEGORIES);
}
