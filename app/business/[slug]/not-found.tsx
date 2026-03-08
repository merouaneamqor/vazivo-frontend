import Link from "next/link";
import { MapPin, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BusinessNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MapPin className="h-10 w-10 text-neutral-400" />
        </div>

        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          Business Not Found
        </h1>

        <p className="text-muted-foreground mb-8">
          The business you're looking for doesn't exist or may have been removed. Try searching for another one.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/search">
            <Button className="w-full sm:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Search Businesses
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
