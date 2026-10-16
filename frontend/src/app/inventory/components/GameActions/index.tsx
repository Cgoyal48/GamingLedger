import { CoinsIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Edit, log a purchase and remove. Dimmed until the game is hovered or focused. */
export function GameActions({
  title,
  onEdit,
  onLogPurchase,
  onRemove,
  className,
}: {
  title: string;
  onEdit: () => void;
  onLogPurchase: () => void;
  onRemove: () => void;
  className?: string;
}) {
  const actions = [
    { label: `Edit ${title}`, tip: "Edit game", icon: <PencilIcon />, onClick: onEdit },
    { label: `Log a purchase for ${title}`, tip: "Log a purchase", icon: <CoinsIcon />, onClick: onLogPurchase },
    { label: `Remove ${title}`, tip: "Remove from inventory", icon: <Trash2Icon />, onClick: onRemove },
  ];
  return (
    <div
      className={cn(
        "flex shrink-0 opacity-60 transition-opacity group-hover:opacity-100 focus-within:opacity-100",
        className,
      )}
    >
      {actions.map((action) => (
        <Tooltip key={action.tip}>
          <TooltipTrigger
            render={<Button variant="ghost" size="icon-sm" aria-label={action.label} onClick={action.onClick} />}
          >
            {action.icon}
          </TooltipTrigger>
          <TooltipContent>{action.tip}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
