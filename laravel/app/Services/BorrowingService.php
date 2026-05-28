<?php

namespace App\Services;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

use App\Models\Book;
use App\Models\User;
use App\Models\Borrowing;
use App\Models\Penalty;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;

class BorrowingService
{
    /**
     * Business rules verification and creation of a new book loan.
     *
     * @throws Exception
     */
    public function checkoutBook(int $userId, int $bookId): Borrowing
    {
        return DB::transaction(function () use ($userId, $bookId) {
            $user = User::findOrFail($userId);
            $book = Book::findOrFail($bookId);

            // 1. Check if user is suspended
            if ($user->status === 'suspended') {
                throw new Exception("Prêt interdit : le compte du membre est suspendu.");
            }

            // 2. Maximum of 5 books limitation
            $activeLoansCount = Borrowing::where('user_id', $userId)
                ->whereIn('status', ['active', 'overdue'])
                ->count();
                
            if ($activeLoansCount >= 5) {
                throw new Exception("Limite atteinte : un membre ne peut emprunter que 5 livres au maximum.");
            }

            // 3. Subscription validity check
            $subscription = $user->subscription; // assuming 1-to-1 or active relation
            if (!$subscription || $subscription->status === 'expired' || Carbon::parse($subscription->expires_at)->isPast()) {
                throw new Exception("Prêt interdit : l'abonnement du membre a expiré.");
            }

            // 4. Check for unpaid penalties
            $hasUnpaidPenalties = Penalty::where('user_id', $userId)
                ->where('status', 'unpaid')
                ->exists();
                
            if ($hasUnpaidPenalties) {
                throw new Exception("Prêt interdit : le membre a des amendes impayées en attente de règlement.");
            }

            // 5. Check stock availability
            if ($book->available_quantity <= 0) {
                throw new Exception("Stock insuffisant : plus aucun exemplaire disponible pour ce livre.");
            }

            // Create Borrowing record
            $borrowedAt = Carbon::now();
            $dueDate = $borrowedAt->copy()->addDays(14); // 14 days standard duration

            $borrowing = Borrowing::create([
                'user_id' => $userId,
                'book_id' => $bookId,
                'borrowed_at' => $borrowedAt,
                'due_date' => $dueDate,
                'returned_at' => null,
                'renewed_count' => 0,
                'status' => 'active'
            ]);

            // Decrement quantity
            $book->decrement('available_quantity');

            return $borrowing;
        });
    }

    /**
     * Processes a book return and manages stocks/penalties recalculation.
     */
    public function returnBook(int $borrowingId): Borrowing
    {
        return DB::transaction(function () use ($borrowingId) {
            $borrowing = Borrowing::findOrFail($borrowingId);

            if ($borrowing->status === 'returned') {
                throw new Exception("Ce prêt a déjà été retourné.");
            }

            $now = Carbon::now();
            $borrowing->returned_at = $now;
            $borrowing->status = 'returned';
            $borrowing->save();

            // Re-increment stock
            $book = $borrowing->book;
            $book->increment('available_quantity');

            return $borrowing;
        });
    }
}
