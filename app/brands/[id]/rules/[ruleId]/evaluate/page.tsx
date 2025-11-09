import { use } from "react";
                                             import EvaluateClient from "@/app/brands/[id]/rules/[ruleId]/evaluate/EvaluateClient";

type PageProps = {
  params: Promise<{ id: string; ruleId: string }>;
};

export default function EvaluatePage({ params }: PageProps) {
  const { id, ruleId } = use(params);
  return <EvaluateClient brandId={id} ruleId={ruleId} />;
}

