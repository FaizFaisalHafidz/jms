import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    next_page_url: string | null;
    prev_page_url: string | null;
    current_page: number;
    last_page: number;
}

export default function SimplePagination({ links, next_page_url, prev_page_url, current_page, last_page }: PaginationProps) {
    if (last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!prev_page_url}
                    asChild={!!prev_page_url}
                    className="h-8 text-xs bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    {prev_page_url ? (
                        <Link href={prev_page_url} preserveScroll preserveState>
                            Sebelumnya
                        </Link>
                    ) : (
                        <span>Sebelumnya</span>
                    )}
                </Button>
                <div className="flex items-center text-xs text-gray-500 font-medium">
                    {current_page} / {last_page}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!next_page_url}
                    asChild={!!next_page_url}
                    className="h-8 text-xs bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    {next_page_url ? (
                        <Link href={next_page_url} preserveScroll preserveState>
                            Berikutnya
                        </Link>
                    ) : (
                        <span>Berikutnya</span>
                    )}
                </Button>
            </div>

            {/* Desktop View - Simplified numeric */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs text-gray-700">
                        Halaman <span className="font-medium">{current_page}</span> dari <span className="font-medium">{last_page}</span>
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={!prev_page_url}
                            asChild={!!prev_page_url}
                            className="h-8 w-8 rounded-l-md border-gray-300 bg-white p-0 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                        >
                            {prev_page_url ? (
                                <Link href={prev_page_url} preserveScroll preserveState className="flex items-center justify-center w-full h-full">
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            ) : (
                                <span className="flex items-center justify-center w-full h-full">
                                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                                </span>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={!next_page_url}
                            asChild={!!next_page_url}
                            className="h-8 w-8 rounded-r-md border-gray-300 bg-white p-0 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                        >
                            {next_page_url ? (
                                <Link href={next_page_url} preserveScroll preserveState className="flex items-center justify-center w-full h-full">
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            ) : (
                                <span className="flex items-center justify-center w-full h-full">
                                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                </span>
                            )}
                        </Button>
                    </nav>
                </div>
            </div>
        </div>
    );
}

