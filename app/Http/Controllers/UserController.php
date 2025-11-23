<?php

namespace App\Http\Controllers;

use App\Models\Cabang;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with(['roles', 'cabang'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'cabang' => $user->cabang ? [
                        'id' => $user->cabang->id,
                        'nama_cabang' => $user->cabang->nama_cabang,
                    ] : null,
                    'roles' => $user->roles->pluck('name')->toArray(),
                    'status_aktif' => $user->status_aktif,
                    'created_at' => $user->created_at->format('d/m/Y H:i'),
                ];
            });

        $roles = Role::all()->map(function ($role) {
            return [
                'value' => $role->name,
                'label' => ucwords(str_replace('_', ' ', $role->name)),
            ];
        });

        $cabangs = Cabang::where('status_aktif', true)
            ->get()
            ->map(function ($cabang) {
                return [
                    'value' => $cabang->id,
                    'label' => $cabang->nama_cabang,
                ];
            });

        $stats = [
            'total' => User::count(),
            'aktif' => User::where('status_aktif', true)->count(),
            'nonaktif' => User::where('status_aktif', false)->count(),
        ];

        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => $roles,
            'cabangs' => $cabangs,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|exists:roles,name',
            'cabang_id' => [
                'nullable',
                'exists:cabang,id',
                Rule::requiredIf(function () use ($request) {
                    return $request->role === 'admin_cabang';
                }),
            ],
            'status_aktif' => 'required|boolean',
        ], [
            'name.required' => 'Nama wajib diisi',
            'email.required' => 'Email wajib diisi',
            'email.unique' => 'Email sudah digunakan',
            'password.required' => 'Password wajib diisi',
            'password.min' => 'Password minimal 8 karakter',
            'password.confirmed' => 'Konfirmasi password tidak cocok',
            'role.required' => 'Role wajib dipilih',
            'cabang_id.required' => 'Cabang wajib dipilih untuk admin cabang',
            'status_aktif.required' => 'Status aktif wajib dipilih',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = $validator->validated();
        $data['password'] = Hash::make($data['password']);
        unset($data['password_confirmation']);
        
        $role = $data['role'];
        unset($data['role']);

        $user = User::create($data);
        $user->assignRole($role);

        return redirect()->route('users.index')
            ->with('success', 'Pengguna berhasil ditambahkan');
    }

    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|string|exists:roles,name',
            'cabang_id' => [
                'nullable',
                'exists:cabang,id',
                Rule::requiredIf(function () use ($request) {
                    return $request->role === 'admin_cabang';
                }),
            ],
            'status_aktif' => 'required|boolean',
        ], [
            'name.required' => 'Nama wajib diisi',
            'email.required' => 'Email wajib diisi',
            'email.unique' => 'Email sudah digunakan',
            'password.min' => 'Password minimal 8 karakter',
            'password.confirmed' => 'Konfirmasi password tidak cocok',
            'role.required' => 'Role wajib dipilih',
            'cabang_id.required' => 'Cabang wajib dipilih untuk admin cabang',
            'status_aktif.required' => 'Status aktif wajib dipilih',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = $validator->validated();
        
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        unset($data['password_confirmation']);
        
        $role = $data['role'];
        unset($data['role']);

        $user->update($data);
        $user->syncRoles([$role]);

        return redirect()->route('users.index')
            ->with('success', 'Pengguna berhasil diperbarui');
    }

    public function destroy(User $user)
    {
        // Prevent deleting own account
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun sendiri');
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'Pengguna berhasil dihapus');
    }
}
