import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { accountTypeEnum, AccountType } from "@/db/schema";

interface AccountTypeSelectorProps {
  value: AccountType;
  onValueChange: (value: AccountType) => void;
  className?: string;
}

export function AccountTypeSelect({
  value,
  onValueChange,
  className,
}: AccountTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Account type" />
      </SelectTrigger>
      <SelectContent>
        {accountTypeEnum.enumValues.map((type) => (
          <SelectItem key={type} value={type}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
