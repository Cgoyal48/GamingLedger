package com.gamingledger.games.mapper;

import com.gamingledger.games.dao.CopyRow;
import com.gamingledger.games.model.Copy;
import com.gamingledger.games.model.Spend;
import com.gamingledger.games.model.Valuation;
import com.gamingledger.games.service.CopyValueService;
import com.gamingledger.igdb.client.IgdbClient;
import org.springframework.stereotype.Component;

@Component
public class CopyMapper {

    /** A copy whose purchase couldn't be converted shows no spend rather than a wrong one. */
    public Copy toCopy(CopyRow row, Valuation valuation) {
        Spend spend = valuation.spend(row.id());
        Long spentMinor = spend == null || spend.rateMissing() ? null : spend.totalMinor();
        return new Copy(
            row.id(), row.gameId(), row.title(), row.createdAt(), row.igdbId(), row.source(),
            IgdbClient.coverUrl(row.coverImageId()), row.platform(), row.status(), row.intent(), row.acquisition(),
            spentMinor, spentMinor == null ? null : spend.inGameMinor(), spentMinor == null ? null : valuation.currency(),
            spend != null && spend.converted(), spend != null && spend.rateMissing(),
            row.minutes(), CopyValueService.costPerHour(spentMinor, row.minutes())
        );
    }
}
