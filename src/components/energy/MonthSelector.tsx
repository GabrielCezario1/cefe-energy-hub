import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { monthLabels } from "@/lib/energyMockData";

interface MonthSelectorProps {
  value: string;
  onChange: (month: string) => void;
  availableMonths: string[];
}

export function MonthSelector({ value, onChange, availableMonths }: MonthSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableMonths.map((m) => (
          <SelectItem key={m} value={m}>
            {monthLabels[m] || m}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
