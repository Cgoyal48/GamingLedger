package com.gamingledger.purchases.service;

import com.gamingledger.common.exception.NotFoundException;
import com.gamingledger.games.service.CopyService;
import com.gamingledger.purchases.dao.PurchaseDao;
import com.gamingledger.purchases.mapper.PurchaseMapper;
import com.gamingledger.purchases.model.PurchaseRequest;
import com.gamingledger.purchases.model.Purchase;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PurchaseService {

    private final PurchaseDao purchases;
    private final PurchaseMapper mapper;
    private final CopyService copies;

    public PurchaseService(PurchaseDao purchases, PurchaseMapper mapper, CopyService copies) {
        this.purchases = purchases;
        this.mapper = mapper;
        this.copies = copies;
    }

    public List<Purchase> list(UUID userId) {
        return purchases.findByUser(userId).stream().map(mapper::toPurchase).toList();
    }

    public Purchase create(UUID userId, PurchaseRequest body) {
        check(userId, body, null);
        return mapper.toPurchase(purchases.insert(userId, body));
    }

    public Purchase update(UUID userId, long id, PurchaseRequest body) {
        check(userId, body, id);
        return purchases.update(userId, id, body).map(mapper::toPurchase).orElseThrow(NotFoundException::new);
    }

    /** {@code purchaseId} is the purchase being edited, or null for a new one. */
    private void check(UUID userId, PurchaseRequest body, Long purchaseId) {
        boolean topUp = body.kind().equals("top_up");
        if (topUp != (body.copyId() == null)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "A top-up has no copy. Other purchases need one."
            );
        }
        if (body.copyId() != null) {
            copies.requireOwned(userId, body.copyId());
        }
        if (body.kind().equals("game") && purchases.hasGamePurchase(body.copyId(), purchaseId)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "That game's purchase is already logged. Log DLC and extras as in-game."
            );
        }
    }

    public void delete(UUID userId, long id) {
        if (purchases.delete(userId, id) == 0) {
            throw new NotFoundException();
        }
    }
}
