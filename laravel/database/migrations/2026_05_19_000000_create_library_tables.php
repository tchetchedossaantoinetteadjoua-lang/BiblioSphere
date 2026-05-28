<?php

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // 2. Authors
        Schema::create('authors', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('bio')->nullable();
            $table->timestamps();
        });

        // 3. Books
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('isbn')->unique();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignId('author_id')->constrained('authors')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('publisher')->nullable();
            $table->integer('publication_year')->default(2026);
            $table->integer('quantity')->default(1);
            $table->integer('available_quantity')->default(1);
            $table->string('cover_image')->nullable();
            $table->string('shelf_location')->nullable();
            $table->enum('status', ['available', 'borrowed', 'reserved', 'damaged', 'lost'])->default('available');
            $table->timestamps();
        });

        // 4. Subscriptions / Abonnements
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['Standard', 'Etudiant', 'Premium'])->default('Standard');
            $table->timestamp('starts_at');
            $table->timestamp('expires_at');
            $table->enum('status', ['active', 'expired'])->default('active');
            $table->timestamps();
        });

        // 5. Borrowings / Emprunts
        Schema::create('borrowings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
            $table->timestamp('borrowed_at')->useCurrent();
            $table->timestamp('due_date');
            $table->timestamp('returned_at')->nullable();
            $table->integer('renewed_count')->default(0);
            $table->enum('status', ['active', 'returned', 'overdue', 'cancelled'])->default('active');
            $table->timestamps();
        });

        // 6. Penalties / Amendes de retard
        Schema::create('penalties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrowing_id')->constrained('borrowings')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->decimal('amount', 12, 2)->default(0.00);
            $table->integer('days_overdue')->default(0);
            $table->enum('status', ['unpaid', 'paid'])->default('unpaid');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penalties');
        Schema::dropIfExists('borrowings');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('books');
        Schema::dropIfExists('authors');
        Schema::dropIfExists('categories');
    }
};
