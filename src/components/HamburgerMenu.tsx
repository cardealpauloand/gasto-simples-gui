import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";

export function HamburgerMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <nav className="mt-8 grid gap-2">
          <SheetClose asChild>
            <Button variant="ghost" className="justify-start" asChild>
              <Link to="/">Dashboard</Link>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button variant="ghost" className="justify-start" asChild>
              <Link to="/accounts">Contas</Link>
            </Button>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default HamburgerMenu;

