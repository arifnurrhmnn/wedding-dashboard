"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";
import { PLANNING_PHASES } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PlanningPage() {
  const [expandedPhases, setExpandedPhases] = useState<string[]>(["phase_1"]);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) =>
      prev.includes(phaseId)
        ? prev.filter((id) => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Planning
          </h1>
          <p className="text-muted-foreground">
            Timeline persiapan pernikahan berdasarkan rekomendasi Wedding
            Organizer
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground mb-1">
              Panduan Timeline
            </h3>
            <p className="text-sm text-muted-foreground">
              Ini adalah panduan umum persiapan pernikahan. Gunakan sebagai
              referensi untuk membuat checklist Anda sendiri. Timeline dapat
              disesuaikan dengan kebutuhan.
            </p>
          </div>
        </div>
      </div>

      {/* Planning Phases */}
      <div className="space-y-4">
        {PLANNING_PHASES.map((phase, index) => {
          const isExpanded = expandedPhases.includes(phase.id);

          return (
            <div
              key={phase.id}
              className="bg-card border border-border rounded-lg shadow-sm overflow-hidden"
            >
              {/* Phase Header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-foreground">
                      {phase.title}
                    </h3>
                    {phase.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {phase.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {phase.estimatedTime}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Phase Content */}
              {isExpanded && (
                <div className="px-6 py-4 border-t border-border bg-muted/30">
                  <div className="space-y-2">
                    {phase.milestones.map((milestone, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 py-2 px-4 rounded-md hover:bg-card transition-colors"
                      >
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-muted-foreground/30 bg-background mt-0.5 shrink-0">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                        </div>
                        <span className="text-sm text-foreground flex-1">
                          {milestone}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-2">
          💡 Tips Penggunaan
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              Gunakan menu <strong>Checklist</strong> untuk membuat to-do list
              detail berdasarkan planning ini
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              Timeline dapat disesuaikan dengan kondisi dan kebutuhan Anda
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              Jangan lupa untuk berkonsultasi dengan Wedding Organizer untuk
              detail yang lebih spesifik
            </span>
          </li>
        </ul>
      </div>

      {/* CTA to Checklist */}
      <div className="bg-linear-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Siap Mulai Persiapan?
            </h3>
            <p className="text-sm text-muted-foreground">
              Buat checklist detail berdasarkan planning di atas untuk
              memastikan semua persiapan terlaksana dengan baik.
            </p>
          </div>
          <Link href="/dashboard/checklist">
            <Button className="bg-primary hover:bg-primary/90 text-white font-medium shadow-md gap-2 whitespace-nowrap">
              Lanjut ke Checklist
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
