<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckStockManagementPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Super admin selalu bisa manage stock
        if ($user && $user->hasRole('super_admin')) {
            return $next($request);
        }

        // Cek apakah user punya cabang
        if (!$user || !$user->cabang_id) {
            return response()->json([
                'message' => 'User tidak memiliki cabang.'
            ], 403);
        }

        // Cek apakah cabang user boleh manage stock
        $cabang = $user->cabang;
        if (!$cabang || !$cabang->can_manage_stock) {
            return response()->json([
                'message' => 'Cabang Anda tidak memiliki izin untuk mengelola stok. Hubungi super admin.'
            ], 403);
        }

        return $next($request);
    }
}
