import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Currency } from "@/app/actions/currency-actions";

interface CurrencySelectorProps {
  currencies: Currency[];
  selectedCurrencies: string[];
  onChange: (selected: string[]) => void;
}

export function CurrencySelector({
  currencies,
  selectedCurrencies,
  onChange,
}: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);

  const handleCheckedChange = useCallback(
    (currencyId: string, checked: boolean) => {
      if (checked) {
        onChange([...selectedCurrencies, currencyId]);
      } else {
        onChange(selectedCurrencies.filter((id) => id !== currencyId));
      }
    },
    [selectedCurrencies, onChange]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {selectedCurrencies.length > 0
            ? `${selectedCurrencies.length} currenc${
                selectedCurrencies.length > 1 ? "ies" : "y"
              } selected`
            : "Select currencies"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {currencies.map((currency) => (
          <DropdownMenuCheckboxItem
            key={currency.id}
            checked={selectedCurrencies.includes(currency.id)}
            onCheckedChange={(checked) =>
              handleCheckedChange(currency.id, checked)
            }
            onSelect={(event) => event.preventDefault()}
          >
            {currency.code}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
