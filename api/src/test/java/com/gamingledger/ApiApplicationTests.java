package com.gamingledger;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

/** Runs the whole API against a throwaway Postgres, never the dev database. */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class ApiApplicationTests {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:18");

    @Autowired
    MockMvc mvc;

    private final UUID alice = UUID.randomUUID();
    private final UUID bob = UUID.randomUUID();

    private static JwtRequestPostProcessor as(UUID user) {
        return jwt().jwt(token -> token.subject(user.toString()));
    }

    private static String newCopy(String title, String acquisition, String purchase) {
        return """
            {"copy": {"title": "%s", "platform": "pc", "status": "playing",
                      "intent": "to_play", "acquisition": "%s"},
             "purchase": %s}
            """.formatted(title, acquisition, purchase);
    }

    private static String paid(long amountMinor, String purchasedAt) {
        return """
            {"amount_minor": %d, "currency": "INR", "purchased_at": "%s"}
            """.formatted(amountMinor, purchasedAt);
    }

    private long postCopy(UUID user, String body) throws Exception {
        String saved = mvc.perform(post("/api/games").with(as(user))
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(saved, "$.id")).longValue();
    }

    /** A copy with no price, for tests that are not about money. */
    private long createCopy(UUID user, String title) throws Exception {
        return postCopy(user, newCopy(title, "free", "null"));
    }

    private long createPurchasedCopy(UUID user, String title, long amountMinor, String purchasedAt) throws Exception {
        return postCopy(user, newCopy(title, "purchased", paid(amountMinor, purchasedAt)));
    }

    @Test
    void addingAPurchasedGameLogsItsPriceWithIt() throws Exception {
        long copy = createPurchasedCopy(alice, "Celeste", 49900, "2026-10-01T12:00:00Z");

        mvc.perform(get("/api/games").with(as(alice)))
            .andExpect(jsonPath("$[0].spent_minor").value(49900));
        mvc.perform(get("/api/purchases").with(as(alice)))
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].copy_id").value(copy))
            .andExpect(jsonPath("$[0].kind").value("game"));
    }

    @Test
    void onlyAPurchasedGameHasAPriceAndItNeedsOne() throws Exception {
        mvc.perform(post("/api/games").with(as(alice))
                .contentType(MediaType.APPLICATION_JSON).content(newCopy("Celeste", "purchased", "null")))
            .andExpect(status().isBadRequest());
        mvc.perform(post("/api/games").with(as(alice))
                .contentType(MediaType.APPLICATION_JSON)
                .content(newCopy("Celeste", "gift", paid(49900, "2026-10-01T12:00:00Z"))))
            .andExpect(status().isBadRequest());
        mvc.perform(get("/api/games").with(as(alice)))
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void addingAPaidCopyTwiceIsAConflict() throws Exception {
        createPurchasedCopy(alice, "Celeste", 49900, "2026-10-01T12:00:00Z");
        mvc.perform(post("/api/games").with(as(alice))
                .contentType(MediaType.APPLICATION_JSON)
                .content(newCopy("Celeste", "purchased", paid(49900, "2026-10-02T12:00:00Z"))))
            .andExpect(status().isConflict());
        mvc.perform(get("/api/purchases").with(as(alice)))
            .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void requestsWithoutATokenAreRejected() throws Exception {
        mvc.perform(get("/api/games")).andExpect(status().isUnauthorized());
    }

    @Test
    void costPerHourUsesSpendAndLatestHours() throws Exception {
        long copy = createPurchasedCopy(alice, "Hades", 149900, "2026-10-01T12:00:00Z");
        logPurchase(alice, copy, "in_game", 29900, "2026-10-01T12:00:00Z");
        for (int minutes : new int[] {60, 1830}) {
            mvc.perform(post("/api/games/{id}/playtime", copy).with(as(alice))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"minutes\": %d}".formatted(minutes)))
                .andExpect(status().isOk());
        }

        mvc.perform(get("/api/games").with(as(alice)))
            .andExpect(jsonPath("$[0].spent_minor").value(179800))
            .andExpect(jsonPath("$[0].in_game_minor").value(29900))
            .andExpect(jsonPath("$[0].spent_currency").value("INR"))
            .andExpect(jsonPath("$[0].minutes").value(1830))
            .andExpect(jsonPath("$[0].cost_per_hour_minor").value(5895));
    }

    @Test
    void anotherUsersCopyLooksLikeItDoesNotExist() throws Exception {
        long copy = createCopy(alice, "Celeste");
        String update = """
            {"title": "Celeste", "platform": "pc", "status": "completed", "intent": "to_play",
             "acquisition": "purchased"}
            """;

        mvc.perform(get("/api/games").with(as(bob)))
            .andExpect(jsonPath("$.length()").value(0));
        mvc.perform(put("/api/games/{id}", copy).with(as(bob))
                .contentType(MediaType.APPLICATION_JSON).content(update))
            .andExpect(status().isNotFound());
        mvc.perform(post("/api/games/{id}/playtime", copy).with(as(bob))
                .contentType(MediaType.APPLICATION_JSON).content("{\"minutes\": 5}"))
            .andExpect(status().isNotFound());
        mvc.perform(post("/api/purchases").with(as(bob))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"copy_id": %d, "kind": "game", "amount_minor": 100, "currency": "INR",
                     "purchased_at": "2026-10-01T12:00:00Z"}
                    """.formatted(copy)))
            .andExpect(status().isNotFound());
        mvc.perform(delete("/api/games/{id}", copy).with(as(bob)))
            .andExpect(status().isNotFound());

        mvc.perform(delete("/api/games/{id}", copy).with(as(alice)))
            .andExpect(status().isNoContent());
        mvc.perform(delete("/api/games/{id}", copy).with(as(alice)))
            .andExpect(status().isNotFound());
    }

    private static String copyBody(String title, String platform) {
        return """
            {"title": "%s", "platform": "%s", "status": "playing", "intent": "to_play",
             "acquisition": "purchased"}
            """.formatted(title, platform);
    }

    @Test
    void editingFixesTheTitleAndMovesThePlatform() throws Exception {
        long copy = createCopy(alice, "Celest");
        mvc.perform(put("/api/games/{id}", copy).with(as(alice))
                .contentType(MediaType.APPLICATION_JSON).content(copyBody("Celeste", "switch")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(copy))
            .andExpect(jsonPath("$.title").value("Celeste"))
            .andExpect(jsonPath("$.platform").value("switch"));
    }

    @Test
    void editingIntoACopyYouAlreadyOwnIsAConflict() throws Exception {
        createCopy(alice, "Hades");
        long other = createCopy(alice, "Inside");
        mvc.perform(put("/api/games/{id}", other).with(as(alice))
                .contentType(MediaType.APPLICATION_JSON).content(copyBody("hades", "pc")))
            .andExpect(status().isConflict());
    }

    @Test
    void purchasesCanBeEditedOnlyByTheirOwner() throws Exception {
        long copy = createPurchasedCopy(alice, "Hollow Knight", 14900, "2026-10-01T12:00:00Z");
        String purchases = mvc.perform(get("/api/purchases").with(as(alice)))
            .andReturn().getResponse().getContentAsString();
        long id = ((Number) JsonPath.read(purchases, "$[0].id")).longValue();
        String edit = """
            {"copy_id": %d, "kind": "game", "amount_minor": 120000, "currency": "INR",
             "purchased_at": "2026-10-01T12:00:00Z", "note": "Full price after all"}
            """.formatted(copy);

        mvc.perform(put("/api/purchases/{id}", id).with(as(bob))
                .contentType(MediaType.APPLICATION_JSON).content(edit))
            .andExpect(status().isNotFound());
        mvc.perform(put("/api/purchases/{id}", id).with(as(alice))
                .contentType(MediaType.APPLICATION_JSON).content(edit))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.amount_minor").value(120000))
            .andExpect(jsonPath("$.note").value("Full price after all"));
        mvc.perform(get("/api/games").with(as(alice)))
            .andExpect(jsonPath("$[0].spent_minor").value(120000));
    }

    private void logHours(UUID user, long copy, int minutes) throws Exception {
        mvc.perform(post("/api/games/{id}/playtime", copy).with(as(user))
                .contentType(MediaType.APPLICATION_JSON).content("{\"minutes\": %d}".formatted(minutes)))
            .andExpect(status().isOk());
    }

    private void logPurchase(UUID user, long copy, String kind, long amountMinor, String purchasedAt) throws Exception {
        mvc.perform(post("/api/purchases").with(as(user))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"copy_id": %d, "kind": "%s", "amount_minor": %d, "currency": "INR",
                     "purchased_at": "%s"}
                    """.formatted(copy, kind, amountMinor, purchasedAt)))
            .andExpect(status().isOk());
    }

    @Test
    void aCopyIsBoughtOnceAndEverythingAfterIsInGame() throws Exception {
        long copy = createPurchasedCopy(alice, "Elden Ring", 399900, "2026-03-01T12:00:00Z");

        mvc.perform(post("/api/purchases").with(as(alice))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"copy_id": %d, "kind": "game", "amount_minor": 399900, "currency": "INR",
                     "purchased_at": "2026-03-02T12:00:00Z"}
                    """.formatted(copy)))
            .andExpect(status().isConflict());
        mvc.perform(post("/api/purchases").with(as(alice))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"copy_id": %d, "kind": "in_game", "amount_minor": 199900, "currency": "INR",
                     "purchased_at": "2026-06-21T12:00:00Z"}
                    """.formatted(copy)))
            .andExpect(status().isOk());
    }

    @Test
    void playtimeHistoryTurnsRunningTotalsIntoHoursAdded() throws Exception {
        long copy = createCopy(alice, "Hades");
        for (int total : new int[] {60, 300, 300, 240}) {
            logHours(alice, copy, total);
        }

        mvc.perform(get("/api/playtime").with(as(alice)))
            .andExpect(jsonPath("$.length()").value(3))
            .andExpect(jsonPath("$[0].minutes_added").value(-60))
            .andExpect(jsonPath("$[0].total_minutes").value(240))
            .andExpect(jsonPath("$[1].minutes_added").value(240))
            .andExpect(jsonPath("$[2].minutes_added").value(60))
            .andExpect(jsonPath("$[2].copy_id").value(copy));
        mvc.perform(get("/api/playtime").with(as(bob)))
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void statsGroupByPlatformAndYearOfFirstPurchase() throws Exception {
        long hades = createPurchasedCopy(alice, "Hades", 60000, "2025-11-20T12:00:00Z");
        long celeste = createPurchasedCopy(alice, "Celeste", 20000, "2026-06-01T12:00:00Z");
        logPurchase(alice, hades, "in_game", 30000, "2026-03-01T12:00:00Z");
        logHours(alice, hades, 1800);
        logHours(alice, celeste, 600);

        // ₹1,100 over 40 h on PC. Hades counts in 2025, its first purchase, with all of its spend.
        mvc.perform(get("/api/stats").with(as(alice)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.currency").value("INR"))
            .andExpect(jsonPath("$.platforms.length()").value(1))
            .andExpect(jsonPath("$.platforms[0].key").value("pc"))
            .andExpect(jsonPath("$.platforms[0].paid_games").value(2))
            .andExpect(jsonPath("$.platforms[0].cost_per_hour_minor").value(2750))
            .andExpect(jsonPath("$.platforms[0].best.title").value("Celeste"))
            .andExpect(jsonPath("$.years[0].key").value("2026"))
            .andExpect(jsonPath("$.years[0].best.title").value("Celeste"))
            .andExpect(jsonPath("$.years[1].key").value("2025"))
            .andExpect(jsonPath("$.years[1].cost_per_hour_minor").value(3000));
        mvc.perform(get("/api/stats").with(as(bob)))
            .andExpect(jsonPath("$.platforms.length()").value(0));
    }

    @Test
    void decimalAmountsAreRejectedNotTruncated() throws Exception {
        long copy = createCopy(alice, "Hollow Knight");
        mvc.perform(post("/api/purchases").with(as(alice))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"copy_id": %d, "kind": "game", "amount_minor": 499.5, "currency": "INR",
                     "purchased_at": "2026-10-01T12:00:00Z"}
                    """.formatted(copy)))
            .andExpect(status().isBadRequest());
    }
}
