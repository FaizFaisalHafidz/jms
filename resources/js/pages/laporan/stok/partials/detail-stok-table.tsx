import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface DetailStok {
	kode_barang: string;
	nama_barang: string;
	kategori: string;
	cabang: string;
	kota?: string;
	jumlah_stok: number;
	stok_minimal: number;
	status: "rendah" | "normal";
}

interface DetailStokTableProps {
	data: DetailStok[];
}

export default function DetailStokTable({ data }: DetailStokTableProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Detail Stok Barang</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="max-h-[500px] overflow-y-auto">
					<Table>
						<TableHeader className="sticky top-0 bg-background">
							<TableRow>
								<TableHead>Kode</TableHead>
								<TableHead>Nama Barang</TableHead>
								<TableHead>Kategori</TableHead>
								<TableHead>Cabang</TableHead>
								<TableHead className="text-right">Stok</TableHead>
								<TableHead className="text-right">Minimal</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="text-center text-muted-foreground">
										Tidak ada data
									</TableCell>
								</TableRow>
							) : (
								data.map((item, index) => (
									<TableRow key={index}>
										<TableCell className="font-mono text-xs">
											{item.kode_barang}
										</TableCell>
										<TableCell className="font-medium">{item.nama_barang}</TableCell>
										<TableCell>{item.kategori}</TableCell>
										<TableCell>
											{item.cabang}
											{item.kota && (
												<span className="text-xs text-muted-foreground ml-1">
													({item.kota})
												</span>
											)}
										</TableCell>
										<TableCell className="text-right">
											{item.jumlah_stok?.toLocaleString("id-ID") ?? 0}
										</TableCell>
										<TableCell className="text-right text-muted-foreground">
											{item.stok_minimal ?? 0}
										</TableCell>
										<TableCell>
											{item.status === "rendah" ? (
												<Badge variant="destructive">Rendah</Badge>
											) : (
												<Badge variant="secondary">Normal</Badge>
											)}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
