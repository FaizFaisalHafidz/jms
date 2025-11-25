<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class OwnerDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('owner/dashboard', [
            'user' => auth()->user()->only('name', 'email'),
        ]);
    }
}
