package com.gamingledger.games.service;

import com.gamingledger.games.dao.GameDao;
import com.gamingledger.igdb.client.IgdbClient;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

/**
 * Cover ids come from IGDB, never from the browser, because a game row is shared by every user.
 * A missing cover is never an error: the card just shows its placeholder.
 */
@Service
public class CoverService {

    private static final Logger log = LoggerFactory.getLogger(CoverService.class);
    private static final int BACKFILL_BATCH = 500;

    private final GameDao games;
    private final IgdbClient igdb;

    public CoverService(GameDao games, IgdbClient igdb) {
        this.games = games;
        this.igdb = igdb;
    }

    public void ensureCover(long gameId) {
        games.igdbIdWithoutCover(gameId).ifPresent(igdbId -> store(List.of(igdbId)));
    }

    /** Fills in covers for IGDB games added before covers were stored. */
    @EventListener(ApplicationReadyEvent.class)
    public void backfill() {
        store(games.igdbIdsWithoutCover(BACKFILL_BATCH));
    }

    private void store(List<Long> igdbIds) {
        if (igdbIds.isEmpty()) {
            return;
        }
        try {
            igdb.coverImageIds(igdbIds).forEach(games::setCover);
        } catch (RestClientException | IllegalStateException e) {
            log.warn("Could not fetch IGDB covers for {} games: {}", igdbIds.size(), e.getMessage());
        }
    }
}
