import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface BarcodeCameraScannerProps {
	onScanSuccess: (barcode: string) => void;
}

export function BarcodeCameraScanner({ onScanSuccess }: BarcodeCameraScannerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isScanning, setIsScanning] = useState(false);
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);
	const scannerRef = useRef<Html5Qrcode | null>(null);
	const scannerIdRef = useRef("barcode-camera-scanner");
	const hasScannedRef = useRef(false);

	const checkCameraPermission = async () => {
		try {
			// Request camera permission explicitly
			const stream = await navigator.mediaDevices.getUserMedia({ 
				video: { facingMode: "environment" } 
			});
			
			// Stop the test stream
			stream.getTracks().forEach(track => track.stop());
			
			setHasPermission(true);
			return true;
		} catch (err) {
			console.error("Camera permission denied:", err);
			setHasPermission(false);
			
			if (err instanceof Error) {
				if (err.name === 'NotAllowedError') {
					toast.error("Izin kamera ditolak. Silakan klik ikon kamera di address bar dan izinkan akses kamera.");
				} else if (err.name === 'NotFoundError') {
					toast.error("Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.");
				} else if (err.name === 'NotReadableError') {
					toast.error("Kamera sedang digunakan aplikasi lain. Tutup aplikasi yang menggunakan kamera.");
				} else {
					toast.error(`Error: ${err.message}`);
				}
			}
			
			return false;
		}
	};

	const startScanner = async () => {
		try {
			// Check permission first
			const permissionGranted = await checkCameraPermission();
			if (!permissionGranted) {
				return;
			}

			if (!scannerRef.current) {
				scannerRef.current = new Html5Qrcode(scannerIdRef.current);
			}

			const config = {
				fps: 10,
				qrbox: { width: 250, height: 150 },
				aspectRatio: 1.777778,
				formatsToSupport: [
					// Support multiple barcode formats
					0, // QR_CODE
					8, // EAN_13
					9, // EAN_8
					13, // CODE_128
					14, // CODE_39
				],
			};

			await scannerRef.current.start(
				{ facingMode: "environment" }, // Use back camera
				config,
				(decodedText) => {
					// Success callback - prevent multiple scans
					if (hasScannedRef.current) return;
					
					hasScannedRef.current = true;
					onScanSuccess(decodedText);
					toast.success(`Barcode terdeteksi: ${decodedText}`);
					
					// Stop and close after short delay
					setTimeout(() => {
						stopScanner();
						setIsOpen(false);
					}, 100);
				},
				(errorMessage) => {
					// Error callback (ignore, will keep trying)
				}
			);

			setIsScanning(true);
		} catch (err) {
			console.error("Error starting scanner:", err);
			toast.error("Gagal memulai scanner. Silakan coba lagi.");
		}
	};

	const stopScanner = async () => {
		if (scannerRef.current && isScanning) {
			try {
				await scannerRef.current.stop();
				setIsScanning(false);
			} catch (err) {
				console.error("Error stopping scanner:", err);
			}
		}
	};

	useEffect(() => {
		if (isOpen && !isScanning) {
			hasScannedRef.current = false; // Reset flag when opening
			startScanner();
		}

		return () => {
			if (isScanning) {
				stopScanner();
			}
		};
	}, [isOpen]);

	const handleClose = () => {
		stopScanner();
		setIsOpen(false);
		hasScannedRef.current = false; // Reset flag on close
	};

	return (
		<>
			<Button
				type="button"
				variant="outline"
				size="icon"
				onClick={() => setIsOpen(true)}
				title="Scan barcode dengan kamera"
			>
				<Camera className="h-4 w-4" />
			</Button>

			<Dialog open={isOpen} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center justify-between">
							Scan Barcode dengan Kamera
							<Button
								variant="ghost"
								size="icon"
								onClick={handleClose}
							>
								<X className="h-4 w-4" />
							</Button>
						</DialogTitle>
						<DialogDescription>
							Arahkan kamera ke barcode produk. Scanner akan otomatis mendeteksi barcode.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						{hasPermission === false && (
							<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
								<p className="text-sm text-yellow-800 font-medium mb-2">
									⚠️ Izin kamera diperlukan
								</p>
								<p className="text-xs text-yellow-700 mb-3">
									Untuk menggunakan fitur ini, silakan:
								</p>
								<ol className="text-xs text-yellow-700 list-decimal list-inside space-y-1 mb-3">
									<li>Klik ikon kamera 🎥 di address bar Chrome</li>
									<li>Pilih "Always allow" untuk mengakses kamera</li>
									<li>Refresh halaman dan coba lagi</li>
								</ol>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={startScanner}
									className="w-full"
								>
									Coba Lagi
								</Button>
							</div>
						)}

						<div
							id={scannerIdRef.current}
							className="rounded-lg overflow-hidden border"
							style={{ minHeight: hasPermission === false ? '0' : '300px' }}
						/>

						{hasPermission !== false && (
							<div className="text-xs text-muted-foreground text-center">
								💡 Tips: Pastikan pencahayaan cukup dan barcode terlihat jelas
							</div>
						)}

						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							className="w-full"
						>
							Batalkan
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
