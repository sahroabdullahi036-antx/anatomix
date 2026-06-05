import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTerms } from "@/hooks/useTerms";
import { ChevronLeft, Search, Filter } from "lucide-react";

export default function Dictionary() {
  const { allTerms, getCategories } = useTerms();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const categories = getCategories();
  const types = ["root", "prefix", "suffix", "word"];

  const filteredTerms = useMemo(() => {
    return allTerms.filter(term => {
      const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           term.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || term.category === selectedCategory;
      const matchesType = !selectedType || term.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [allTerms, searchQuery, selectedCategory, selectedType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/main-menu">
            <Button variant="outline" className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Main Menu
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Medical Dictionary</h1>
          <div className="w-24"></div>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 bg-white shadow-lg border-2 border-purple-100 mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input 
                placeholder="Search by term name or definition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Category
                </label>
                <select 
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Term Type</label>
                <select 
                  value={selectedType || ""}
                  onChange={(e) => setSelectedType(e.target.value || null)}
                  className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="">All Types</option>
                  {types.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Found <span className="font-semibold text-purple-600">{filteredTerms.length}</span> term{filteredTerms.length !== 1 ? 's' : ''}
            </div>
          </div>
        </Card>

        {/* Terms Grid */}
        {filteredTerms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTerms.map(term => (
              <Card key={term.id} className="p-5 bg-white shadow-md border-2 border-purple-100 hover:shadow-lg hover:border-purple-300 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 flex-1">{term.term}</h3>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full ml-2 whitespace-nowrap">
                    {term.type}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 italic mb-3">{term.phonetic}</p>
                
                <p className="text-sm text-gray-700 font-medium mb-3">
                  <span className="text-purple-600">Definition:</span> {term.meaning}
                </p>

                {term.mnemonic && (
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <span className="font-semibold">Memory tip:</span> {term.mnemonic}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{term.category}</span>
                  <span>{term.source}</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-white shadow-lg border-2 border-purple-100">
            <Search className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Terms Found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find medical terms.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
