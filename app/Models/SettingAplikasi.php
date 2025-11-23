<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SettingAplikasi extends Model
{
    protected $table = 'setting_aplikasi';

    public $timestamps = false;

    protected $fillable = [
        'key',
        'value',
        'deskripsi',
    ];

    // Helper method untuk get setting
    public static function get($key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    // Helper method untuk set setting
    public static function set($key, $value, $deskripsi = null)
    {
        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'deskripsi' => $deskripsi]
        );
    }
}
