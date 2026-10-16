package com.gamingledger.games.dao;

import static com.gamingledger.datastore.jooq.codegen.Tables.COPIES;
import static com.gamingledger.datastore.jooq.codegen.Tables.GAMES;
import static org.jooq.impl.DSL.lower;
import static org.jooq.impl.DSL.selectOne;
import static org.jooq.impl.DSL.trim;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

/** The shared game catalogue. IGDB games are shared by everyone; custom titles belong to one user's copies. */
@Repository
public class GameDao {

    private final DSLContext dsl;

    public GameDao(DSLContext dsl) {
        this.dsl = dsl;
    }

    /** A custom title the user already owns, matched case-insensitively. */
    public Optional<Long> findCustomForUser(UUID userId, String title) {
        return dsl.select(GAMES.ID)
            .from(GAMES)
            .join(COPIES).on(COPIES.GAME_ID.eq(GAMES.ID))
            .where(COPIES.USER_ID.eq(userId))
            .and(GAMES.SOURCE.eq("custom"))
            .and(lower(trim(GAMES.TITLE)).eq(title.toLowerCase(Locale.ROOT)))
            .limit(1)
            .fetchOptional(GAMES.ID);
    }

    public long insertCustom(String title) {
        return dsl.insertInto(GAMES)
            .set(GAMES.TITLE, title)
            .set(GAMES.SOURCE, "custom")
            .returning(GAMES.ID)
            .fetchOne(GAMES.ID);
    }

    public long findOrInsertIgdb(long igdbId, String title) {
        dsl.insertInto(GAMES)
            .set(GAMES.TITLE, title)
            .set(GAMES.IGDB_ID, igdbId)
            .set(GAMES.SOURCE, "igdb")
            .onConflict(GAMES.IGDB_ID)
            .where(GAMES.IGDB_ID.isNotNull())
            .doNothing()
            .execute();
        return dsl.select(GAMES.ID).from(GAMES).where(GAMES.IGDB_ID.eq(igdbId)).fetchOne(GAMES.ID);
    }

    /** The IGDB id of this game, when it is an IGDB game still waiting for its cover. */
    public Optional<Long> igdbIdWithoutCover(long gameId) {
        return dsl.select(GAMES.IGDB_ID)
            .from(GAMES)
            .where(GAMES.ID.eq(gameId))
            .and(GAMES.IGDB_ID.isNotNull())
            .and(GAMES.COVER_IMAGE_ID.isNull())
            .fetchOptional(GAMES.IGDB_ID);
    }

    public List<Long> igdbIdsWithoutCover(int limit) {
        return dsl.select(GAMES.IGDB_ID)
            .from(GAMES)
            .where(GAMES.IGDB_ID.isNotNull())
            .and(GAMES.COVER_IMAGE_ID.isNull())
            .limit(limit)
            .fetch(GAMES.IGDB_ID);
    }

    public void setCover(long igdbId, String imageId) {
        dsl.update(GAMES).set(GAMES.COVER_IMAGE_ID, imageId).where(GAMES.IGDB_ID.eq(igdbId)).execute();
    }

    /** Renaming a custom title leaves its old row behind; drop it once no copy points at it. */
    public void deleteIfUnusedCustom(long gameId) {
        dsl.deleteFrom(GAMES)
            .where(GAMES.ID.eq(gameId))
            .and(GAMES.SOURCE.eq("custom"))
            .andNotExists(selectOne().from(COPIES).where(COPIES.GAME_ID.eq(gameId)))
            .execute();
    }
}
