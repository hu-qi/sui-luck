#[test_only]
module new_year_draw::draw_tests {
    use sui::test_scenario;
    use sui::coin;
    use sui::sui::SUI;
    use sui::clock;
    use sui::random::{Self, Random};

    use new_year_draw::draw::{Self, ActivityPool, ParticipationTicket, RewardResult};

    #[test]
    fun test_draw_lifecycle() {
        let admin = @0xA;
        let user1 = @0xB;
        let user2 = @0xC;

        // Start scenario with admin to setup initial context
        let mut scenario = test_scenario::begin(admin);
        
        // 0. Init Random (Must be done by system address @0x0)
        test_scenario::next_tx(&mut scenario, @0x0);
        random::create_for_testing(test_scenario::ctx(&mut scenario));
        
        // 1. Update Random State (Must be done by system address @0x0)
        test_scenario::next_tx(&mut scenario, @0x0);
        let mut random_state = test_scenario::take_shared<Random>(&scenario);
        random::update_randomness_state_for_testing(
            &mut random_state,
            0,
            x"1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F",
            test_scenario::ctx(&mut scenario),
        );
        test_scenario::return_shared(random_state);

        let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));

        // 2. Create Pool (Admin)
        test_scenario::next_tx(&mut scenario, admin);
        {
            let end_time = 1000;
            draw::create_pool(
                std::string::utf8(b"Golden Horse Draw"),
                100, // price
                end_time,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };

        // 3. User 1 Joins
        test_scenario::next_tx(&mut scenario, user1);
        {
            let mut pool = test_scenario::take_shared<ActivityPool>(&scenario);
            let coin = coin::mint_for_testing<SUI>(100, test_scenario::ctx(&mut scenario));
            
            draw::join_pool(&mut pool, coin, &clock, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(pool);
        };

        // 4. User 1 Verifies Ticket
        test_scenario::next_tx(&mut scenario, user1);
        {
             let ticket = test_scenario::take_from_sender<ParticipationTicket>(&scenario);
             test_scenario::return_to_sender(&scenario, ticket);
        };

        // 5. User 2 Joins
        test_scenario::next_tx(&mut scenario, user2);
        {
            let mut pool = test_scenario::take_shared<ActivityPool>(&scenario);
            let coin = coin::mint_for_testing<SUI>(100, test_scenario::ctx(&mut scenario));
            
            draw::join_pool(&mut pool, coin, &clock, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(pool);
        };

        // 6. Advance Time
        clock::set_for_testing(&mut clock, 2000);

        // 7. Execute Draw
        test_scenario::next_tx(&mut scenario, admin);
        {
            let mut pool = test_scenario::take_shared<ActivityPool>(&scenario);
            let random_state = test_scenario::take_shared<Random>(&scenario);
            
            draw::execute_draw(&mut pool, &clock, &random_state, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(pool);
            test_scenario::return_shared(random_state);
        };

        // 8. Check Result
        test_scenario::next_tx(&mut scenario, admin);
        {
            let result = test_scenario::take_immutable<RewardResult>(&scenario);
            // Verify result properties if needed
            test_scenario::return_immutable(result);
        };
        
        // Clean up
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
}
