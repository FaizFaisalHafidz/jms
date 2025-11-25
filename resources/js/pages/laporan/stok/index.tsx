import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import LaporanLayout from "@/layouts/laporan-layout";
import { cn } from '@/lib/utils';
import { Head, router } from "@inertiajs/react";
import { AlertTriangle, Box, Building2, DollarSign, Package } from 'lucide-react';

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

export default function LaporanStokPage({
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

	const formatRupiah = (value: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(value);
	};

	const selectedCabang = filters.cabang_id
		? cabang_list.find((c) => c.id === filters.cabang_id)
		: null;

	return (
		<>
			<Head title="Laporan Stok" />

			<div className="space-y-4">
				{/* Filter Cabang */}
				<Card className="border-0 shadow-sm">
					<CardContent className="p-4">
						<div className="flex items-center gap-2 mb-2">
							<Building2 className="h-4 w-4 text-gray-500" />
							<span className="text-sm font-medium text-gray-700">
								{selectedCabang
									? `${selectedCabang.nama_cabang} - ${selectedCabang.kota}`
									: "Semua Cabang"}
							</span>
						</div>
						<Select
							value={filters.cabang_id?.toString() || "all"}
							onValueChange={handleCabangChange}
						>
							<SelectTrigger className="h-9 text-xs">
								<SelectValue />
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
					</CardContent>
				</Card>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-3">
					<Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
						<CardContent className="p-4">
							<div className="p-2 bg-blue-500 rounded-lg w-fit mb-2">
								<Box className="h-4 w-4 text-white" />
							</div>
							<div className="space-y-1">
								<p className="text-[10px] text-gray-600 font-medium">Total Barang</p>
								<p className="text-xs font-bold text-gray-900 leading-tight">
									{stats.total_barang}
								</p>
							</div>
						</CardContent>
					</Card>

					<Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
						<CardContent className="p-4">
							<div className="p-2 bg-green-500 rounded-lg w-fit mb-2">
								<Package className="h-4 w-4 text-white" />
							</div>
							<div className="space-y-1">
								<p className="text-[10px] text-gray-600 font-medium">Total Stok</p>
								<p className="text-xs font-bold text-gray-900 leading-tight">
									{stats.total_stok}
								</p>
							</div>
						</CardContent>
					</Card>

					<Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100/50">
						<CardContent className="p-4">
							<div className="p-2 bg-red-500 rounded-lg w-fit mb-2">
								<AlertTriangle className="h-4 w-4 text-white" />
							</div>
							<div className="space-y-1">
								<p className="text-[10px] text-gray-600 font-medium">Stok Rendah</p>
								<p className="text-xs font-bold text-red-700 leading-tight">
									{stats.stok_rendah}
								</p>
							</div>
						</CardContent>
					</Card>

					<Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
						<CardContent className="p-4">
							<div className="p-2 bg-purple-500 rounded-lg w-fit mb-2">
								<DollarSign className="h-4 w-4 text-white" />
							</div>
							<div className="space-y-1">
								<p className="text-[10px] text-gray-600 font-medium">Nilai Stok</p>
								<p className="text-xs font-bold text-gray-900 leading-tight">
									{formatRupiah(stats.nilai_stok)}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Alert Stok Rendah */}
				{alert_stok_rendah.length > 0 && (
					<Card className="border-0 shadow-sm bg-red-50">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-700">
								<AlertTriangle className="h-4 w-4" />
								Peringatan Stok Rendah
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{alert_stok_rendah.map((item, index) => (
								<div
									key={index}
									className="p-2.5 bg-white rounded-lg border border-red-200"
								>
									<div className="flex items-start justify-between mb-1.5">
										<div className="flex-1">
											<p className="text-xs font-semibold text-gray-900">
												{item.nama_barang}
											</p>
											<p className="text-[10px] text-gray-500">
												{item.kode_barang}
											</p>
										</div>
										<div className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-medium rounded">
											Stok Rendah
										</div>
									</div>
									<div className="flex items-center justify-between text-[10px]">
										<span className="text-gray-600">
											{item.cabang}, {item.kota}
										</span>
										<span className="font-semibold text-red-700">
											{item.jumlah_stok} / {item.stok_minimal} min
										</span>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				)}

				{/* Stok per Cabang */}
				{stok_per_cabang && stok_per_cabang.length > 0 && (
					<Card className="border-0 shadow-sm">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-semibold">Stok per Cabang</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{stok_per_cabang.map((cabang) => (
								<div
									key={cabang.id}
									className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
								>
									<div>
										<p className="text-sm font-semibold text-gray-900">
											{cabang.nama_cabang}
										</p>
										<p className="text-xs text-gray-500">{cabang.kota}</p>
									</div>
									<div className="text-right">
										<p className="text-sm font-bold text-gray-900">
											{cabang.total_stok} unit
										</p>
										{cabang.stok_rendah > 0 && (
											<p className="text-xs text-red-600 font-medium">
												{cabang.stok_rendah} rendah
											</p>
										)}
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				)}

				{/* Detail Stok */}
				{detail_stok && detail_stok.length > 0 && (
					<Card className="border-0 shadow-sm">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-semibold">Detail Stok Barang</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{detail_stok.map((item, index) => (
								<div
									key={index}
									className={cn(
										"p-3 rounded-lg border",
										item.status === "rendah"
											? "bg-red-50 border-red-200"
											: "bg-white border-gray-200"
									)}
								>
									<div className="flex items-start justify-between mb-2">
										<div className="flex-1">
											<p className="text-sm font-semibold text-gray-900">
												{item.nama_barang}
											</p>
											<p className="text-xs text-gray-500">
												{item.kode_barang} • {item.kategori}
											</p>
										</div>
										<div
											className={cn(
												"px-2 py-1 text-xs font-medium rounded",
												item.status === "rendah"
													? "bg-red-100 text-red-700"
													: "bg-green-100 text-green-700"
											)}
										>
											{item.status === "rendah" ? "Rendah" : "Normal"}
										</div>
									</div>
									<div className="flex items-center justify-between text-xs">
										<span className="text-gray-600">
											{item.cabang}
											{item.kota && `, ${item.kota}`}
										</span>
										<span
											className={cn(
												"font-semibold",
												item.status === "rendah"
													? "text-red-700"
													: "text-gray-900"
											)}
										>
											{item.jumlah_stok} / {item.stok_minimal} min
										</span>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				)}
			</div>
		</>
	);
}

LaporanStokPage.layout = (page: React.ReactNode) => (
	<LaporanLayout title="Laporan Stok" children={page} />
);
