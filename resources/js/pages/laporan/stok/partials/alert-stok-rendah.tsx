import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";

interface AlertStok {
	kode_barang: string;
	nama_barang: string;
	cabang: string;
	kota: string;
	jumlah_stok: number;
	stok_minimal: number;
}

interface AlertStokRendahProps {
	data: AlertStok[];
}

export default function AlertStokRendah({ data }: AlertStokRendahProps) {
	return (
		<Card className="border-yellow-200 bg-yellow-50/50">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-yellow-700">
					<AlertTriangle className="h-5 w-5" />
					Peringatan Stok Rendah
				</CardTitle>
			</CardHeader>
			<CardContent>
				{data.length === 0 ? (
					<p className="text-center text-muted-foreground py-4">
						Semua stok dalam kondisi aman
					</p>
				) : (
					<div className="max-h-[400px] overflow-y-auto">
						<Table>
							<TableHeader className="sticky top-0 bg-yellow-50">
								<TableRow>
									<TableHead>Kode</TableHead>
									<TableHead>Nama Barang</TableHead>
									<TableHead>Cabang</TableHead>
									<TableHead className="text-right">Stok</TableHead>
									<TableHead className="text-right">Minimal</TableHead>
									<TableHead className="text-right">Selisih</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.map((item, index) => (
									<TableRow key={index}>
										<TableCell className="font-mono text-xs">
											{item.kode_barang}
										</TableCell>
										<TableCell className="font-medium">{item.nama_barang}</TableCell>
										<TableCell>
											{item.cabang}
											<span className="text-xs text-muted-foreground ml-1">
												({item.kota})
											</span>
										</TableCell>
										<TableCell className="text-right font-semibold text-red-600">
											{item.jumlah_stok}
										</TableCell>
										<TableCell className="text-right text-muted-foreground">
											{item.stok_minimal}
										</TableCell>
										<TableCell className="text-right font-semibold text-red-600">
											{item.jumlah_stok - item.stok_minimal}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
