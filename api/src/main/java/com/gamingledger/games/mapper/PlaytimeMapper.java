package com.gamingledger.games.mapper;

import com.gamingledger.datastore.jooq.codegen.tables.records.PlaytimeSnapshotsRecord;
import com.gamingledger.games.model.PlaytimeSnapshot;
import org.springframework.stereotype.Component;

@Component
public class PlaytimeMapper {

    public PlaytimeSnapshot toSnapshot(PlaytimeSnapshotsRecord r) {
        return new PlaytimeSnapshot(r.getId(), r.getCopyId(), r.getMinutes(), r.getRecordedAt());
    }
}
