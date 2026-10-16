package com.gamingledger.games.service;

import com.gamingledger.common.exception.NotFoundException;
import com.gamingledger.games.dao.CopyDao;
import com.gamingledger.games.dao.CopyRow;
import com.gamingledger.games.dao.GameDao;
import com.gamingledger.games.mapper.CopyMapper;
import com.gamingledger.games.model.Copy;
import com.gamingledger.games.model.CopyRequest;
import com.gamingledger.games.model.NewCopyRequest;
import com.gamingledger.games.model.NewPurchase;
import com.gamingledger.games.model.Valuation;
import com.gamingledger.purchases.dao.PurchaseDao;
import com.gamingledger.purchases.model.PurchaseRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CopyService {

    private final GameDao games;
    private final CopyDao copies;
    private final PurchaseDao purchases;
    private final CopyValueService values;
    private final CoverService covers;
    private final CopyMapper mapper;

    public CopyService(
        GameDao games,
        CopyDao copies,
        PurchaseDao purchases,
        CopyValueService values,
        CoverService covers,
        CopyMapper mapper
    ) {
        this.games = games;
        this.copies = copies;
        this.purchases = purchases;
        this.values = values;
        this.covers = covers;
        this.mapper = mapper;
    }

    public List<Copy> list(UUID userId) {
        return withMoney(userId, copies.findByUser(userId));
    }

    /**
     * Adding a game you already own on that platform returns the existing copy,
     * unless the request brings a price and that copy's purchase is already logged.
     */
    @Transactional
    public Copy create(UUID userId, NewCopyRequest request) {
        CopyRequest body = request.copy();
        NewPurchase paid = request.purchase();
        boolean purchased = body.acquisition().equals("purchased");
        if (purchased && paid == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add the price you paid.");
        }
        if (!purchased && paid != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only a purchased game has a price.");
        }
        long gameId = resolveGame(userId, body);
        copies.insertIfAbsent(userId, gameId, body);
        CopyRow row = copies.findByGame(userId, gameId, body.platform()).orElseThrow();
        if (paid != null) {
            if (purchases.hasGamePurchase(row.id(), null)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have that game on that platform.");
            }
            purchases.insert(userId, new PurchaseRequest(
                row.id(), "game", paid.amountMinor(), paid.currency(), paid.purchasedAt(), null
            ));
        }
        return one(userId, row);
    }

    /**
     * Editing the title points the copy at another game instead of renaming the game,
     * because IGDB game rows are shared by every user.
     */
    @Transactional
    public Copy update(UUID userId, long id, CopyRequest body) {
        CopyRow current = copies.findOne(userId, id).orElseThrow(NotFoundException::new);
        long gameId = resolveGame(userId, body);
        copies.findByGame(userId, gameId, body.platform())
            .filter(other -> other.id() != id)
            .ifPresent(other -> {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have that game on that platform.");
            });
        copies.update(userId, id, gameId, body);
        if (current.gameId() != gameId) {
            games.deleteIfUnusedCustom(current.gameId());
        }
        return one(userId, copies.findOne(userId, id).orElseThrow());
    }

    /** The database deletes the copy's purchases and hours with it. */
    @Transactional
    public void delete(UUID userId, long id) {
        CopyRow current = copies.findOne(userId, id).orElseThrow(NotFoundException::new);
        copies.delete(id);
        games.deleteIfUnusedCustom(current.gameId());
    }

    public void requireOwned(UUID userId, long copyId) {
        if (!copies.exists(userId, copyId)) {
            throw new NotFoundException();
        }
    }

    private long resolveGame(UUID userId, CopyRequest body) {
        if (body.igdbId() == null) {
            String title = body.title().trim();
            return games.findCustomForUser(userId, title).orElseGet(() -> games.insertCustom(title));
        }
        long gameId = games.findOrInsertIgdb(body.igdbId(), body.title());
        covers.ensureCover(gameId);
        return gameId;
    }

    private Copy one(UUID userId, CopyRow row) {
        return withMoney(userId, List.of(row)).getFirst();
    }

    private List<Copy> withMoney(UUID userId, List<CopyRow> rows) {
        Valuation valuation = values.valuate(userId, rows.stream().map(CopyRow::id).toList());
        return rows.stream().map(row -> mapper.toCopy(row, valuation)).toList();
    }
}
