package com.gamingledger.games.service;

import com.gamingledger.games.dao.PlaytimeDao;
import com.gamingledger.games.mapper.PlaytimeMapper;
import com.gamingledger.games.model.PlaySession;
import com.gamingledger.games.model.PlaytimeSnapshot;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

/** Each entry is a new snapshot of total hours; the latest one wins. */
@Service
public class PlaytimeService {

    private final CopyService copies;
    private final PlaytimeDao playtime;
    private final PlaytimeMapper mapper;

    public PlaytimeService(CopyService copies, PlaytimeDao playtime, PlaytimeMapper mapper) {
        this.copies = copies;
        this.playtime = playtime;
        this.mapper = mapper;
    }

    public PlaytimeSnapshot log(UUID userId, long copyId, int minutes) {
        copies.requireOwned(userId, copyId);
        return mapper.toSnapshot(playtime.insert(copyId, minutes));
    }

    public List<PlaySession> history(UUID userId) {
        return playtime.history(userId);
    }
}
