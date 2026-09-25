import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { UserButton } from "@hexclave/next";
import { authenticateUser } from "@/lib/data/auth";

export async function NavBar() {
  const { user } = await authenticateUser();

  return (
    <nav className="w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-6xl">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="font-bold text-2xl tracking-tight text-gray-800"
          >
            Wiki sample
          </Link>
        </div>
        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-2">
            {user ? (
              <NavigationMenuItem>
                <UserButton />
              </NavigationMenuItem>
            ) : (
              <>
                <NavigationMenuItem>
                  <Button variant="outline">
                    <Link
                      href="/sign-in"
                      className="text-base p-5 cursor-pointer"
                    >
                      Sign In
                    </Link>
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button>
                    <Link
                      href="/sign-up"
                      className="text-base p-5 cursor-pointer"
                    >
                      Sign Up
                    </Link>
                  </Button>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}
