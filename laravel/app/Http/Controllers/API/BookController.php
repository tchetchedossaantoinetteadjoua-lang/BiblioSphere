<?php

namespace App\Http\Controllers\API;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate from Illuminate\Http\JsonResponse;
use App\Http\Requests\BookStoreRequest;
use App\Http\Resources\BookResource;
use Illuminate\Support\Str;

class BookController extends Controller
{
    /**
     * Get a paginated list of catalog books with search keywords.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Book::with(['author', 'category']);

        // Quick advanced multicriteria filters
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%")
                  ->orWhereHas('author', function ($authorQ) use ($search) {
                      $authorQ->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->get('category_id'));
        }

        $books = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => BookResource::collection($books),
            'meta' => [
                'current_page' => $books->currentPage(),
                'last_page' => $books->lastPage(),
                'total' => $books->total()
            ]
        ]);
    }

    /**
     * Store a newly created book.
     */
    public function store(BookStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['slug'] = Str::slug($validated['title']);
        $validated['available_quantity'] = $validated['quantity'];

        $book = Book::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Livre enregistré avec succès.',
            'data' => new BookResource($book->load(['author', 'category']))
        ], 21);
    }

    /**
     * Show a specific book catalog entry.
     */
    public function show(int $id): JsonResponse
    {
        $book = Book::with(['author', 'category'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new BookResource($book)
        ]);
    }

    /**
     * Update a specific book.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $book = Book::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'quantity' => 'sometimes|integer|min:0',
            'shelf_location' => 'sometimes|string',
            'status' => 'sometimes|in:available,borrowed,reserved,damaged,lost'
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $book->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Livre mis à jour avec succès.',
            'data' => new BookResource($book->load(['author', 'category']))
        ]);
    }

    /**
     * Delete a specific book entry.
     */
    public function destroy(int $id): JsonResponse
    {
        $book = Book::findOrFail($id);

        // Prevent deleting if currently lended
        $currentLoans = $book->borrowings()->whereIn('status', ['active', 'overdue'])->count();
        if ($currentLoans > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer ce livre car des exemplaires sont prêtés.'
            ], 400);
        }

        $book->delete();

        return response()->json([
            'success' => true,
            'message' => 'Livre supprimé du catalogue avec succès.'
        ]);
    }
}
