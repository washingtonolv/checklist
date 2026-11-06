import type { ReactNode } from "react";
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  CircleDashed,
  Clock3,
  LoaderCircle,
  ShieldAlert,
  XCircle
} from "lucide-react";
import { PHOTO_LABELS, ROLE_LABELS, STATUS_LABELS } from "@/lib/constants";
import type { PhotoRequirement, Role, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const config: Record<TaskStatus, { className: string; icon: ReactNode }> = {
    pending: { className: "status-warning", icon: <CircleDashed className="h-3.5 w-3.5" /> },
    in_progress: { className: "status-info", icon: <LoaderCircle className="h-3.5 w-3.5" /> },
    completed: { className: "status-success", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    correction_requested: { className: "status-warning border-dashed", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    rejected: { className: "status-danger", icon: <XCircle className="h-3.5 w-3.5" /> }
  };
  return (
    <span className={cn("badge", config[status].className, className)}>
      {config[status].icon}
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PhotoBadge({
  requirement,
  count,
  className
}: {
  requirement: PhotoRequirement;
  count?: number;
  className?: string;
}) {
  const config = {
    required: {
      className: "border border-ink/25 bg-pink/5 text-ink",
      icon: <Camera className="h-3.5 w-3.5" />
    },
    optional: {
      className: "border border-turquesa/50 bg-turquesa/10 text-ink",
      icon: <Camera className="h-3.5 w-3.5" />
    },
    none: {
      className: "border border-ink/15 bg-surface text-ink/70",
      icon: <CameraOff className="h-3.5 w-3.5" />
    }
  };
  return (
    <span className={cn("badge", config[requirement].className, className)}>
      {config[requirement].icon}
      {PHOTO_LABELS[requirement]}
      {typeof count === "number" && count > 0 ? ` · ${count}` : ""}
    </span>
  );
}

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  const config: Record<Role, string> = {
    admin: "border border-brand/20 bg-brand/10 text-brand",
    supervisor: "status-info",
    manager: "status-neutral"
  };
  return (
    <span className={cn("badge", config[role], className)}>
      {role === "admin" ? <ShieldAlert className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
      {ROLE_LABELS[role]}
    </span>
  );
}

