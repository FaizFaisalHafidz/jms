import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Package, XCircle } from 'lucide-react';

interface SupplierStatsProps {
  stats: {
    total: number;
    aktif: number;
    nonaktif: number;
  };
}

export function SupplierStats({ stats }: SupplierStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 rounded-lg">
              <Package className="h-10 w-10 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Supplier</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600/10 rounded-lg">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Supplier Aktif</p>
              <p className="text-2xl font-bold">{stats.aktif}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/10 rounded-lg">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Supplier Nonaktif</p>
              <p className="text-2xl font-bold">{stats.nonaktif}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
