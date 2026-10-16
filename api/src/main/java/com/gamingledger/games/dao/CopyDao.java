package com.gamingledger.games.dao;

import static com.gamingledger.datastore.jooq.codegen.Tables.COPIES;
import static com.gamingledger.datastore.jooq.codegen.Tables.GAMES;
import static com.gamingledger.datastore.jooq.codegen.Tables.PLAYTIME_SNAPSHOTS;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.select;

import com.gamingledger.games.model.CopyRequest;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.springframework.stereotype.Repository;

/** Every query is scoped to one user, so a wrong id behaves exactly like a missing one. */
@Repository
public class CopyDao {

    private final DSLContext dsl;

    public CopyDao(DSLContext dsl) {
        this.dsl = dsl;
    }

    public List<CopyRow> findByUser(UUID userId) {
        return find(COPIES.USER_ID.eq(userId));
    }

    public Optional<CopyRow> findOne(UUID userId, long id) {
        return find(COPIES.USER_ID.eq(userId).and(COPIES.ID.eq(id))).stream().findFirst();
    }

    public Optional<CopyRow> findByGame(UUID userId, long gameId, String platform) {
        return find(
            COPIES.USER_ID.eq(userId).and(COPIES.GAME_ID.eq(gameId)).and(COPIES.PLATFORM.eq(platform))
        ).stream().findFirst();
    }

    public boolean exists(UUID userId, long id) {
        return dsl.fetchExists(COPIES, COPIES.ID.eq(id).and(COPIES.USER_ID.eq(userId)));
    }

    /** Adding the same game on the same platform twice keeps the existing copy. */
    public void insertIfAbsent(UUID userId, long gameId, CopyRequest body) {
        dsl.insertInto(COPIES)
            .set(COPIES.USER_ID, userId)
            .set(COPIES.GAME_ID, gameId)
            .set(COPIES.PLATFORM, body.platform())
            .set(COPIES.STATUS, body.status())
            .set(COPIES.INTENT, body.intent())
            .set(COPIES.ACQUISITION, body.acquisition())
            .onConflict(COPIES.USER_ID, COPIES.GAME_ID, COPIES.PLATFORM)
            .doNothing()
            .execute();
    }

    /** Can move the copy to another game or platform. Returns 0 when the copy is missing or not the user's. */
    public int update(UUID userId, long id, long gameId, CopyRequest body) {
        return dsl.update(COPIES)
            .set(COPIES.GAME_ID, gameId)
            .set(COPIES.PLATFORM, body.platform())
            .set(COPIES.STATUS, body.status())
            .set(COPIES.INTENT, body.intent())
            .set(COPIES.ACQUISITION, body.acquisition())
            .where(COPIES.ID.eq(id))
            .and(COPIES.USER_ID.eq(userId))
            .execute();
    }

    public void delete(long id) {
        dsl.deleteFrom(COPIES).where(COPIES.ID.eq(id)).execute();
    }

    private List<CopyRow> find(Condition where) {
        Field<Integer> minutes = field(
            select(PLAYTIME_SNAPSHOTS.MINUTES)
                .from(PLAYTIME_SNAPSHOTS)
                .where(PLAYTIME_SNAPSHOTS.COPY_ID.eq(COPIES.ID))
                .orderBy(PLAYTIME_SNAPSHOTS.RECORDED_AT.desc(), PLAYTIME_SNAPSHOTS.ID.desc())
                .limit(1)
        ).as("minutes");

        return dsl.select(
                COPIES.ID, GAMES.ID, GAMES.TITLE, COPIES.CREATED_AT, GAMES.IGDB_ID, GAMES.SOURCE, GAMES.COVER_IMAGE_ID,
                COPIES.PLATFORM, COPIES.STATUS, COPIES.INTENT, COPIES.ACQUISITION, minutes
            )
            .from(GAMES)
            .join(COPIES).on(COPIES.GAME_ID.eq(GAMES.ID))
            .where(where)
            .orderBy(COPIES.ID)
            .fetch(r -> new CopyRow(
                r.get(COPIES.ID), r.get(GAMES.ID), r.get(GAMES.TITLE), r.get(COPIES.CREATED_AT),
                r.get(GAMES.IGDB_ID), r.get(GAMES.SOURCE), r.get(GAMES.COVER_IMAGE_ID),
                r.get(COPIES.PLATFORM), r.get(COPIES.STATUS), r.get(COPIES.INTENT), r.get(COPIES.ACQUISITION),
                r.get(minutes)
            ));
    }
}
