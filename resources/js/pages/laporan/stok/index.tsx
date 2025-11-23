import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import AlertStokRendah from "./partials/alert-stok-rendah";
import DetailStokTable from "./partials/detail-stok-table";
import StokPerCabangTable from "./partials/stok-per-cabang-table";
import StokStats from "./partials/stok-stats";

interface Cabang {
	id: number;
	nama_cabang: string;
	kota: string;
}

interface Props {
	filters: {
		cabang_id: number | null;
	};
	stats: {
		total_barang: number;
		total_stok: number;
		stok_rendah: number;
		nilai_stok: number;
	};
	stok_per_cabang: Array<{
		id: number;
		nama_cabang: string;
		kota: string;
		total_stok: number;
		stok_rendah: number;
	}>;
	detail_stok: Array<{
		kode_barang: string;
		nama_barang: string;
		kategori: string;
		cabang: string;
		kota?: string;
		jumlah_stok: number;
		stok_minimal: number;
		status: "rendah" | "normal";
	}>;
	top_stok: Array<{
		nama_barang: string;
		cabang: string;
		jumlah_stok: number;
	}>;
	alert_stok_rendah: Array<{
		kode_barang: string;
		nama_barang: string;
		cabang: string;
		kota: string;
		jumlah_stok: number;
		stok_minimal: number;
	}>;
	cabang_list: Cabang[];
}

export default function LaporanStok({
	filters,
	stats,
	stok_per_cabang,
	detail_stok,
	alert_stok_rendah,
	cabang_list,
}: Props) {
	const handleCabangChange = (value: string) => {
		router.get(
			"/laporan/stok",
			{
				cabang_id: value === "all" ? undefined : value,
			},
			{
				preserveState: true,
				preserveScroll: true,
			}
		);
	};

	return (
		<AppLayout>
			<Head title="Laporan Stok" />

			<div className="space-y-6 p-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Laporan Stok</h1>
						<p className="text-muted-foreground">
							Monitoring persediaan barang dan inventori
						</p>
					</div>

					<div className="w-64">
						<Label>Filter Cabang</Label>
						<Select
							value={filters.cabang_id?.toString() || "all"}
							onValueChange={handleCabangChange}
						>
							<SelectTrigger>
								<SelectValue placeholder="Semua Cabang" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Semua Cabang</SelectItem>
								{cabang_list.map((cabang) => (
									<SelectItem key={cabang.id} value={cabang.id.toString()}>
										{cabang.nama_cabang} - {cabang.kota}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<StokStats stats={stats} />

				{alert_stok_rendah.length > 0 && (
					<AlertStokRendah data={alert_stok_rendah} />
				)}

				<div className="grid gap-6 lg:grid-cols-2">
					<StokPerCabangTable data={stok_per_cabang} />
					<DetailStokTable data={detail_stok} />
				</div>
			</div>
		</AppLayout>
	);
}
