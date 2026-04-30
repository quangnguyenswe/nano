import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Search } from "lucide-react";

export default function SearchInput() {
  return (
    <div className="p-2 pb-0">
      <InputGroup className="max-w-xs">
        <InputGroupInput placeholder="Search..." className="w-fit" />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
