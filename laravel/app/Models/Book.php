<?php

namespace App\Models;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'isbn',
        'title',
        'slug',
        'description',
        'author_id',
        'category_id',
        'publisher',
        'publication_year',
        'quantity',
        'available_quantity',
        'cover_image',
        'shelf_location',
        'status',
    ];

    /**
     * Relationship with the book author.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    /**
     * Relationship with the category.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Historical loans of this book.
     */
    public function borrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class);
    }

    /**
     * Local scope check for available books.
     */
    public function scopeAvailable($query)
    {
        return $query->where('available_quantity', '>', 0)->where('status', 'available');
    }
}
