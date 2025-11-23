import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Archive, DollarSign, Package } from "lucide-react";

interface StokStatsProps {
	stats: {
		total_barang: number;
		total_stok: number;
		stok_rendah: number;
		nilai_stok: number;
	};
}

export default function StokStats({ stats }: StokStatsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Barang</CardTitle>
					<Archive className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.total_barang}</div>
					<p className="text-xs text-muted-foreground">Jenis barang aktif</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Stok</CardTitle>
					<Package className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{stats.total_stok.toLocaleString("id-ID")}
					</div>
					<p className="text-xs text-muted-foreground">Unit tersedia</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
					<AlertTriangle className="h-4 w-4 text-yellow-600" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-yellow-600">
						{stats.stok_rendah}
					</div>
					<p className="text-xs text-muted-foreground">Item perlu restock</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Nilai Stok</CardTitle>
					<DollarSign className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						Rp {stats.nilai_stok.toLocaleString("id-ID")}
					</div>
					<p className="text-xs text-muted-foreground">Total nilai persediaan</p>
				</CardContent>
			</Card>
		</div>
	);
}
