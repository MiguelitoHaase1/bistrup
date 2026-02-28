import type { OpenQuestion } from "@/lib/types";

interface QuestionCardProps {
  question: OpenQuestion;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3">
      <span className="mt-0.5 text-status-progress text-lg">?</span>
      <div>
        <p className="text-sm text-text-primary">{question.question}</p>
        <span className="text-xs text-text-muted mt-1 block">
          {question.category}
        </span>
      </div>
    </div>
  );
}
