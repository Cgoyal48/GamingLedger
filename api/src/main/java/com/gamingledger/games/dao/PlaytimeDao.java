package com.gamingledger.games.dao;

import static com.gamingledger.datastore.jooq.codegen.Tables.COPIES;
import static com.gamingledger.datastore.jooq.codegen.Tables.PLAYTIME_SNAPSHOTS;
import static org.jooq.impl.DSL.coalesce;
import static org.jooq.impl.DSL.inline;
import static org.jooq.impl.DSL.lag;

import com.gamingledger.datastore.jooq.codegen.tables.records.PlaytimeSnapshotsRecord;
import com.gamingledger.games.model.PlaySession;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Table;
import org.springframework.stereotype.Repository;

@Repository
public class PlaytimeDao {

    private final DSLContext dsl;

    public PlaytimeDao(DSLContext dsl) {
        this.dsl = dsl;
    }

    public PlaytimeSnapshotsRecord insert(long copyId, int minutes) {
        return dsl.insertInto(PLAYTIME_SNAPSHOTS)
            .set(PLAYTIME_SNAPSHOTS.COPY_ID, copyId)
            .set(PLAYTIME_SNAPSHOTS.MINUTES, minutes)
            .returning()
            .fetchOne();
    }

    /**
     * Snapshots store running totals, so each entry's hours are its total minus the copy's previous total.
     * Entries that changed nothing are left out; a negative value is the player correcting their hours down.
     * Newest first.
     */
    public List<PlaySession> history(UUID userId) {
        Field<Integer> previous = lag(PLAYTIME_SNAPSHOTS.MINUTES).over()
            .partitionBy(PLAYTIME_SNAPSHOTS.COPY_ID)
            .orderBy(PLAYTIME_SNAPSHOTS.RECORDED_AT, PLAYTIME_SNAPSHOTS.ID);
        Field<Integer> added = PLAYTIME_SNAPSHOTS.MINUTES.minus(coalesce(previous, inline(0))).as("added");

        // The window has to run in a subquery: WHERE is evaluated before window functions.
        Table<?> entries = dsl.select(
                PLAYTIME_SNAPSHOTS.ID, PLAYTIME_SNAPSHOTS.COPY_ID, PLAYTIME_SNAPSHOTS.RECORDED_AT,
                PLAYTIME_SNAPSHOTS.MINUTES, added
            )
            .from(PLAYTIME_SNAPSHOTS)
            .join(COPIES).on(COPIES.ID.eq(PLAYTIME_SNAPSHOTS.COPY_ID))
            .where(COPIES.USER_ID.eq(userId))
            .asTable("entries");

        Field<Long> copyId = entries.field(PLAYTIME_SNAPSHOTS.COPY_ID);
        Field<OffsetDateTime> recordedAt = entries.field(PLAYTIME_SNAPSHOTS.RECORDED_AT);
        Field<Integer> total = entries.field(PLAYTIME_SNAPSHOTS.MINUTES);
        Field<Integer> minutesAdded = entries.field(added);
        Field<Long> id = entries.field(PLAYTIME_SNAPSHOTS.ID);

        return dsl.select(copyId, recordedAt, minutesAdded, total)
            .from(entries)
            .where(minutesAdded.ne(0))
            .orderBy(recordedAt.desc(), id.desc())
            .fetch(r -> new PlaySession(r.get(copyId), r.get(recordedAt), r.get(minutesAdded), r.get(total)));
    }
}
