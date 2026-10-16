package com.gamingledger.purchases.dao;

import static com.gamingledger.datastore.jooq.codegen.Tables.PURCHASES;
import static org.jooq.impl.DSL.min;

import com.gamingledger.datastore.jooq.codegen.tables.records.PurchasesRecord;
import com.gamingledger.purchases.model.PurchaseRequest;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.springframework.stereotype.Repository;

@Repository
public class PurchaseDao {

    private final DSLContext dsl;

    public PurchaseDao(DSLContext dsl) {
        this.dsl = dsl;
    }

    /** Newest first. */
    public List<PurchasesRecord> findByUser(UUID userId) {
        return dsl.selectFrom(PURCHASES)
            .where(PURCHASES.USER_ID.eq(userId))
            .orderBy(PURCHASES.PURCHASED_AT.desc(), PURCHASES.ID.desc())
            .fetch();
    }

    public List<PurchasesRecord> findByCopies(UUID userId, Collection<Long> copyIds) {
        return dsl.selectFrom(PURCHASES)
            .where(PURCHASES.USER_ID.eq(userId))
            .and(PURCHASES.COPY_ID.in(copyIds))
            .fetch();
    }

    /** When each copy was first paid for. Copies with no purchases are absent. */
    public Map<Long, OffsetDateTime> firstPurchaseByCopy(UUID userId) {
        Field<OffsetDateTime> first = min(PURCHASES.PURCHASED_AT);
        return dsl.select(PURCHASES.COPY_ID, first)
            .from(PURCHASES)
            .where(PURCHASES.USER_ID.eq(userId))
            .and(PURCHASES.COPY_ID.isNotNull())
            .groupBy(PURCHASES.COPY_ID)
            .fetchMap(PURCHASES.COPY_ID, first);
    }

    /** Whether the copy already has its game purchase, ignoring {@code exceptId} so an edit can keep its own. */
    public boolean hasGamePurchase(long copyId, Long exceptId) {
        Condition where = PURCHASES.COPY_ID.eq(copyId).and(PURCHASES.KIND.eq("game"));
        if (exceptId != null) {
            where = where.and(PURCHASES.ID.ne(exceptId));
        }
        return dsl.fetchExists(PURCHASES, where);
    }

    public PurchasesRecord insert(UUID userId, PurchaseRequest body) {
        return dsl.insertInto(PURCHASES)
            .set(PURCHASES.USER_ID, userId)
            .set(PURCHASES.COPY_ID, body.copyId())
            .set(PURCHASES.KIND, body.kind())
            .set(PURCHASES.AMOUNT_MINOR, body.amountMinor())
            .set(PURCHASES.CURRENCY, body.currency())
            .set(PURCHASES.PURCHASED_AT, body.purchasedAt())
            .set(PURCHASES.NOTE, body.note())
            .returning()
            .fetchOne();
    }

    /** Empty when the purchase is missing or not the user's. */
    public Optional<PurchasesRecord> update(UUID userId, long id, PurchaseRequest body) {
        return dsl.update(PURCHASES)
            .set(PURCHASES.COPY_ID, body.copyId())
            .set(PURCHASES.KIND, body.kind())
            .set(PURCHASES.AMOUNT_MINOR, body.amountMinor())
            .set(PURCHASES.CURRENCY, body.currency())
            .set(PURCHASES.PURCHASED_AT, body.purchasedAt())
            .set(PURCHASES.NOTE, body.note())
            .where(PURCHASES.ID.eq(id))
            .and(PURCHASES.USER_ID.eq(userId))
            .returning()
            .fetchOptional();
    }

    /** Returns the number of rows deleted: 0 when the purchase is missing or not the user's. */
    public int delete(UUID userId, long id) {
        return dsl.deleteFrom(PURCHASES)
            .where(PURCHASES.ID.eq(id))
            .and(PURCHASES.USER_ID.eq(userId))
            .execute();
    }
}
