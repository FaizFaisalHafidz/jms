import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface StokPerCabang {
	id: number;
	nama_cabang: string;
	kota: string;
	total_stok: number;
	stok_rendah: number;
}

interface StokPerCabangTableProps {
	data: StokPerCabang[];
}

export default function StokPerCabangTable({ data }: StokPerCabangTableProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Stok Per Cabang</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Cabang</TableHead>
							<TableHead>Kota</TableHead>
							<TableHead className="text-right">Total Stok</TableHead>
							<TableHead className="text-right">Stok Rendah</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} className="text-center text-muted-foreground">
									Tidak ada data
								</TableCell>
							</TableRow>
						) : (
							data.map((item) => (
								<TableRow key={item.id}>
									<TableCell className="font-medium">{item.nama_cabang}</TableCell>
									<TableCell>{item.kota}</TableCell>
									<TableCell className="text-right">
										{item.total_stok.toLocaleString("id-ID")}
									</TableCell>
									<TableCell className="text-right">
										{item.stok_rendah > 0 ? (
											<span className="text-yellow-600 font-semibold">
												{item.stok_rendah}
											</span>
										) : (
											<span className="text-muted-foreground">0</span>
										)}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
