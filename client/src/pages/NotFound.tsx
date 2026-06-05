import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4 py-12">
      <Card className="p-12 bg-white shadow-xl border-2 border-red-200 text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="space-y-3">
          <Link href="/">
            <Button className="w-full">← Back to Home</Button>
          </Link>
          
          <Link href="/main-menu">
            <Button variant="outline" className="w-full">Go to Main Menu</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
