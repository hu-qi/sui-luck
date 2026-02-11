module new_year_draw::draw;

use std::string::String;
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::balance::{Self, Balance};
use sui::random::{Self, Random};
use sui::clock::{Self, Clock};
use sui::event;

/// Error codes
const EInsufficientPayment: u64 = 1;
const EPoolAlreadyDrawn: u64 = 2;
const ENoParticipants: u64 = 3;
const EDrawNotYetDue: u64 = 4;
const EPoolNotActive: u64 = 5;

/// Status enums
const TIME_NOT_STARTED: u8 = 0;
const STATUS_ACTIVE: u8 = 1;
const STATUS_CLOSED: u8 = 2;
const STATUS_DRAWN: u8 = 3;

/// Represents a Draw Pool as a shared object.
public struct ActivityPool has key, store {
    id: UID,
    /// Address of the creator.
    creator: address,
    /// Description or Name of the draw (e.g., "Daily Gold Draw").
    description: String,
    /// Price of a ticket in MIST.
    ticket_price: u64,
    /// The balance of SUI collected from ticket sales.
    reward_balance: Balance<SUI>,
    /// List of participants (addresses).
    participants: vector<address>,
    /// Current status of the pool.
    status: u8,
    /// The timestamp (ms) when the draw can be executed.
    end_time: u64,
    /// The timestamp (ms) when the pool was created/started.
    start_time: u64,
}

/// Represents a ticket for a specific pool.
/// This object is owned by the participant.
public struct ParticipationTicket has key, store {
    id: UID,
    pool_id: ID,
    owner: address,
    minted_at: u64,
}

/// Represents the result of a draw.
/// This object is immutable once created.
public struct RewardResult has key, store {
    id: UID,
    pool_id: ID,
    randomness_input: vector<u8>,
    winner: address,
    prize_amount: u64,
    executed_at: u64,
}

// Events

public struct PoolCreated has copy, drop {
    pool_id: ID,
    creator: address,
    description: String,
    ticket_price: u64,
    end_time: u64,
}

public struct TicketPurchased has copy, drop {
    pool_id: ID,
    ticket_id: ID,
    participant: address,
}

public struct WinnerDrawn has copy, drop {
    pool_id: ID,
    result_id: ID,
    winner: address,
    prize_amount: u64,
}

/// Create a new draw pool.
public fun create_pool(
    description: String,
    ticket_price: u64,
    end_time: u64,
    c: &Clock,
    ctx: &mut TxContext
) {
    let id = object::new(ctx);
    let creator = ctx.sender();
    let pool_id = object::uid_to_inner(&id);
    let start_time = c.timestamp_ms();

    let pool = ActivityPool {
        id,
        creator,
        description,
        ticket_price,
        reward_balance: balance::zero(),
        participants: vector::empty(),
        status: STATUS_ACTIVE,
        end_time,
        start_time,
    };

    event::emit(PoolCreated {
        pool_id,
        creator,
        description: pool.description,
        ticket_price,
        end_time,
    });

    transfer::share_object(pool);
}

/// Join the draw by purchasing a ticket.
public fun join_pool(
    pool: &mut ActivityPool,
    payment: Coin<SUI>,
    c: &Clock,
    ctx: &mut TxContext
) {
    // Checks
    assert!(pool.status == STATUS_ACTIVE, EPoolNotActive);
    assert!(c.timestamp_ms() < pool.end_time, EPoolAlreadyDrawn); 
    assert!(payment.value() == pool.ticket_price, EInsufficientPayment);

    // Logic
    let coin_balance = payment.into_balance();
    pool.reward_balance.join(coin_balance);
    
    let sender = ctx.sender();
    pool.participants.push_back(sender);

    // Mint Ticket
    let ticket_uid = object::new(ctx);
    let ticket_id = object::uid_to_inner(&ticket_uid);
    let ticket = ParticipationTicket {
        id: ticket_uid,
        pool_id: object::uid_to_inner(&pool.id),
        owner: sender,
        minted_at: c.timestamp_ms(),
    };

    // Emit event
    event::emit(TicketPurchased {
        pool_id: object::uid_to_inner(&pool.id),
        ticket_id,
        participant: sender,
    });

    // Transfer ticket to user
    transfer::transfer(ticket, sender);
}

/// Execute the draw.
/// Can be triggered by ANYONE after the end_time.
#[allow(lint(public_random))]
public fun execute_draw(
    pool: &mut ActivityPool,
    c: &Clock,
    r: &Random,
    ctx: &mut TxContext
) {
    // Checks
    assert!(pool.status == STATUS_ACTIVE, EPoolAlreadyDrawn);
    assert!(c.timestamp_ms() >= pool.end_time, EDrawNotYetDue);
    assert!(!pool.participants.is_empty(), ENoParticipants);

    // Randomness
    let mut generator = random::new_generator(r, ctx);
    let winner_index = random::generate_u64_in_range(&mut generator, 0, pool.participants.length() - 1);
    let winner = *pool.participants.borrow(winner_index);

    // Update Pool Status
    pool.status = STATUS_DRAWN;

    // Distribute Prize with Keeper Incentive
    let total_prize = pool.reward_balance.value();
    
    // Keeper reward (1% or at least a small amount if pool is large)
    // For simplicity: 1% incentive
    let keeper_reward_amount = total_prize / 100; 
    let winner_prize_amount = total_prize - keeper_reward_amount;
    
    let sender = ctx.sender();
    
    // Transfer to Keeper
    if (keeper_reward_amount > 0) {
        let keeper_reward = coin::take(&mut pool.reward_balance, keeper_reward_amount, ctx);
        transfer::public_transfer(keeper_reward, sender);
    };

    // Transfer to Winner
    let winner_prize = coin::take(&mut pool.reward_balance, winner_prize_amount, ctx);
    transfer::public_transfer(winner_prize, winner);

    // Create Result Object
    let result_uid = object::new(ctx);
    let result_id = object::uid_to_inner(&result_uid);
    
    let randomness_input = vector[0]; // Placeholder

    let result = RewardResult {
        id: result_uid,
        pool_id: object::uid_to_inner(&pool.id),
        randomness_input,
        winner,
        prize_amount: winner_prize_amount,
        executed_at: c.timestamp_ms(),
    };

    event::emit(WinnerDrawn {
        pool_id: object::uid_to_inner(&pool.id),
        result_id,
        winner,
        prize_amount: winner_prize_amount,
    });

    // Make result immutable so it's a permanent record
    transfer::freeze_object(result);
}

// Getters

public fun ticket_price(pool: &ActivityPool): u64 {
    pool.ticket_price
}

public fun participants_count(pool: &ActivityPool): u64 {
    pool.participants.length()
}

public fun end_time(pool: &ActivityPool): u64 {
    pool.end_time
}

public fun description(pool: &ActivityPool): String {
    pool.description
}

public fun status(pool: &ActivityPool): u8 {
    pool.status
}
